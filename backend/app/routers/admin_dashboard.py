"""Admin dashboard API — /api/admin/* gated by the Supabase login + ADMIN_EMAILS.

Separate from routers/admin.py (which is the X-Admin-Token webhook/import guard).
"""
from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from app.deps import require_dashboard_admin
from app.routers.checkout import _order_to_dto
from app.schemas.admin import (
    OrderListOut,
    OrderPatchIn,
    OrderRow,
    RevenuePoint,
    StatsOut,
    StatWindow,
)
from app.schemas.checkout import OrderDetailOut
from app.services.cache import bust
from app.services.email import order_status_email, send_email
from app.services.supabase_client import get_client

router = APIRouter(
    prefix="/api/admin",
    tags=["admin-dashboard"],
    dependencies=[Depends(require_dashboard_admin)],
)

_STATUSES = {"pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"}
_PAY_STATUSES = {"unpaid", "paid", "failed", "refunded"}
_NOTIFY_ON = {"shipped", "delivered"}

_RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 90}


@router.get("/me")
async def me(user=Depends(require_dashboard_admin)):
    return {"email": user.get("email"), "isAdmin": True}


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------
def _window(days: int | None) -> tuple[datetime, datetime, datetime]:
    now = datetime.now(timezone.utc)
    if days is None:  # "all"
        start = datetime(2020, 1, 1, tzinfo=timezone.utc)
        return start, now, start
    start = now - timedelta(days=days)
    prev_start = start - timedelta(days=days)
    return start, now, prev_start


def _stats_for(db, start: datetime, end: datetime) -> StatWindow:
    data = db.rpc(
        "admin_order_stats",
        {"p_start": start.isoformat(), "p_end": end.isoformat()},
    ).execute().data
    return StatWindow(**(data or {}))


@router.get("/stats", response_model=StatsOut)
async def stats(range: str = Query("30d")):
    db = get_client()
    days = _RANGE_DAYS.get(range)
    start, end, prev_start = _window(days)
    current = _stats_for(db, start, end)
    previous = _stats_for(db, prev_start, start) if days else StatWindow()
    return StatsOut(range=range, current=current, previous=previous)


@router.get("/revenue", response_model=list[RevenuePoint])
async def revenue(days: int = Query(30, ge=7, le=365)):
    db = get_client()
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=days - 1)
    rows = db.rpc(
        "admin_daily_revenue",
        {"p_start": start.isoformat(), "p_end": end.isoformat()},
    ).execute().data or []
    return [
        RevenuePoint(date=str(r["day"]), revenue=float(r["revenue"] or 0), orders=int(r["orders"] or 0))
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
@router.get("/orders", response_model=OrderListOut)
async def list_orders(
    status: str | None = None,
    paymentStatus: str | None = None,
    q: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("created_at.desc"),
):
    db = get_client()
    query = db.table("orders").select(
        "id, order_number, email, customer_name, total_price, currency_code, "
        "payment_method, payment_status, status, created_at",
        count="exact",
    )
    if status and status != "all":
        query = query.eq("status", status)
    if paymentStatus and paymentStatus != "all":
        query = query.eq("payment_status", paymentStatus)
    if q:
        term = q.strip()
        query = query.or_(
            f"order_number.ilike.%{term}%,email.ilike.%{term}%,customer_name.ilike.%{term}%"
        )
    col, _, direction = sort.partition(".")
    query = query.order(col or "created_at", desc=(direction != "asc"))
    offset = (page - 1) * limit
    res = query.range(offset, offset + limit - 1).execute()

    order_ids = [o["id"] for o in res.data or []]
    counts: dict[str, int] = {}
    if order_ids:
        items = db.table("order_items").select("order_id").in_("order_id", order_ids).execute().data or []
        for it in items:
            counts[it["order_id"]] = counts.get(it["order_id"], 0) + 1

    total = res.count or 0
    return OrderListOut(
        items=[
            OrderRow(
                id=o["id"],
                orderNumber=o.get("order_number") or "",
                email=o.get("email") or "",
                customerName=o.get("customer_name"),
                itemCount=counts.get(o["id"], 0),
                total=float(o.get("total_price") or 0),
                currency=o.get("currency_code") or "PKR",
                paymentMethod=o.get("payment_method") or "cod",
                paymentStatus=o.get("payment_status") or "unpaid",
                status=o.get("status") or "pending",
                createdAt=str(o.get("created_at") or ""),
            )
            for o in res.data or []
        ],
        total=total,
        page=page,
        pages=max(1, math.ceil(total / limit)),
    )


def _load_order(db, order_id: str) -> tuple[dict, list[dict], list[dict]]:
    rows = db.table("orders").select("*").eq("id", order_id).limit(1).execute().data
    if not rows:
        raise HTTPException(404, "Order not found")
    items = db.table("order_items").select("*").eq("order_id", order_id).execute().data or []
    history = (
        db.table("order_status_history")
        .select("status, note, created_at")
        .eq("order_id", order_id)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    return rows[0], items, history


@router.get("/orders/{order_id}", response_model=OrderDetailOut)
async def get_order(order_id: str):
    db = get_client()
    o, items, history = _load_order(db, order_id)
    return _order_to_dto(o, items, history)


@router.patch("/orders/{order_id}", response_model=OrderDetailOut)
async def patch_order(order_id: str, body: OrderPatchIn, background: BackgroundTasks):
    db = get_client()
    o, _, _ = _load_order(db, order_id)

    update: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if body.status is not None:
        if body.status not in _STATUSES:
            raise HTTPException(422, f"Invalid status: {body.status}")
        update["status"] = body.status
    if body.paymentStatus is not None:
        if body.paymentStatus not in _PAY_STATUSES:
            raise HTTPException(422, f"Invalid payment status: {body.paymentStatus}")
        update["payment_status"] = body.paymentStatus
    if body.trackingNumber is not None:
        update["tracking_number"] = body.trackingNumber.strip() or None
    if body.adminNotes is not None:
        update["admin_notes"] = body.adminNotes

    db.table("orders").update(update).eq("id", order_id).execute()

    status_changed = body.status is not None and body.status != o.get("status")
    if status_changed:
        db.table("order_status_history").insert(
            {"order_id": order_id, "status": body.status, "note": body.note}
        ).execute()

        if body.status in _NOTIFY_ON and o.get("email"):
            merged = {**o, **update}
            subject, html = order_status_email(
                order=merged,
                order_number=o.get("order_number") or "",
                status=body.status,
                tracking=update.get("tracking_number") or o.get("tracking_number"),
            )
            background.add_task(send_email, to=o["email"], subject=subject, html=html)

    bust("order")
    fresh, items, history = _load_order(db, order_id)
    return _order_to_dto(fresh, items, history)
