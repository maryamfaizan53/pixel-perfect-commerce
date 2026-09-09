"""Admin dashboard API — /api/admin/* gated by the Supabase login + ADMIN_EMAILS.

Separate from routers/admin.py (which is the X-Admin-Token webhook/import guard).
"""
from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from app.deps import require_dashboard_admin
from app.routers.checkout import _order_to_dto
from app.sanity import queries as Q
from app.sanity.client import mutate as sanity_mutate
from app.sanity.client import query as sanity_query
from app.schemas.admin import (
    CustomerListOut,
    CustomerRow,
    OrderListOut,
    OrderPatchIn,
    OrderRow,
    ProductListOut,
    ProductRow,
    ProductSummary,
    RevenuePoint,
    SettingsOut,
    SettingsPatchIn,
    StatsOut,
    StatWindow,
    TopProduct,
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

    if body.status is not None and body.status not in _STATUSES:
        raise HTTPException(422, f"Invalid status: {body.status}")
    if body.paymentStatus is not None and body.paymentStatus not in _PAY_STATUSES:
        raise HTTPException(422, f"Invalid payment status: {body.paymentStatus}")

    status_changed = body.status is not None and body.status != o.get("status")
    tracking = body.trackingNumber.strip() if body.trackingNumber is not None else None

    try:
        # Preferred: one atomic RPC — updates the row and lets the DB trigger
        # write a single order_status_history entry carrying `note`.
        db.rpc(
            "admin_update_order",
            {
                "p_id": order_id,
                "p_status": body.status,
                "p_payment_status": body.paymentStatus,
                "p_tracking": tracking or None,
                "p_admin_notes": body.adminNotes,
                "p_note": body.note if status_changed else None,
            },
        ).execute()
    except Exception:
        # Fallback if the RPC isn't deployed yet: plain update. The existing
        # status-history trigger still records the change (generic note).
        upd: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if body.status is not None:
            upd["status"] = body.status
        if body.paymentStatus is not None:
            upd["payment_status"] = body.paymentStatus
        if body.trackingNumber is not None:
            upd["tracking_number"] = tracking or None
        if body.adminNotes is not None:
            upd["admin_notes"] = body.adminNotes
        db.table("orders").update(upd).eq("id", order_id).execute()

    if status_changed and body.status in _NOTIFY_ON and o.get("email"):
        subject, html = order_status_email(
            order={**o, "tracking_number": tracking or o.get("tracking_number")},
            order_number=o.get("order_number") or "",
            status=body.status,
            tracking=tracking or o.get("tracking_number"),
        )
        background.add_task(send_email, to=o["email"], subject=subject, html=html)

    bust("order")
    fresh, items, history = _load_order(db, order_id)
    return _order_to_dto(fresh, items, history)


# ---------------------------------------------------------------------------
# Products  (catalogue lives in Sanity; sales data in Supabase)
# ---------------------------------------------------------------------------
def _first_image(doc: dict) -> str | None:
    for img in doc.get("uploadedImages") or []:
        if img and img.get("url"):
            return img["url"]
    for url in doc.get("imageUrls") or []:
        if url:
            return url
    return None


@router.get("/products/summary", response_model=ProductSummary)
async def products_summary():
    data = await sanity_query(Q.ADMIN_PRODUCT_SUMMARY) or {}
    return ProductSummary(**data)


@router.get("/products/top", response_model=list[TopProduct])
async def products_top(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=50),
):
    db = get_client()
    start = datetime.now(timezone.utc) - timedelta(days=days)
    rows = db.rpc(
        "admin_top_products",
        {"p_start": start.isoformat(), "p_limit": limit},
    ).execute().data or []

    ids = [r["product_id"] for r in rows if r.get("product_id")]
    enrich: dict[str, dict] = {}
    if ids:
        docs = await sanity_query(Q.ADMIN_PRODUCTS_BY_IDS, {"ids": ids}) or []
        enrich = {d["id"]: d for d in docs}

    out: list[TopProduct] = []
    for r in rows:
        doc = enrich.get(r.get("product_id") or "", {})
        out.append(
            TopProduct(
                id=r.get("product_id") or "",
                slug=doc.get("slug") or r.get("product_slug"),
                title=doc.get("title") or r.get("product_title") or "Unknown product",
                qtySold=int(r.get("qty") or 0),
                revenue=float(r.get("revenue") or 0),
                price=doc.get("price"),
                inStock=doc.get("inStock"),
                imageUrl=_first_image(doc),
            )
        )
    return out


@router.get("/products/out-of-stock", response_model=ProductListOut)
async def products_out_of_stock(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit
    data = await sanity_query(
        Q.ADMIN_PRODUCTS_OUT_OF_STOCK, {"offset": offset, "end": offset + limit}
    ) or {}
    docs = data.get("items") or []
    total = int(data.get("total") or 0)
    return ProductListOut(
        items=[
            ProductRow(
                id=d["id"],
                slug=d.get("slug"),
                title=d.get("title") or "",
                price=d.get("price"),
                compareAtPrice=d.get("compareAtPrice"),
                inStock=bool(d.get("inStock")),
                featured=bool(d.get("featured")),
                imageUrl=_first_image(d),
                categories=[c["title"] for c in (d.get("categories") or []) if c.get("title")],
            )
            for d in docs
        ],
        total=total,
        page=page,
        pages=max(1, math.ceil(total / limit)),
    )


# ---------------------------------------------------------------------------
# Customers  (aggregated from orders — no dedicated table)
# ---------------------------------------------------------------------------
@router.get("/customers", response_model=CustomerListOut)
async def list_customers(
    q: str | None = None,
    sort: str = Query("spent", pattern="^(spent|orders|recent)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    db = get_client()
    rows = (
        db.table("orders")
        .select("email, customer_name, phone, total_price, status, created_at")
        .order("created_at", desc=False)
        .limit(10000)
        .execute()
        .data
        or []
    )

    agg: dict[str, dict] = {}
    for r in rows:
        email = (r.get("email") or "").strip().lower()
        if not email:
            continue
        c = agg.get(email)
        created = str(r.get("created_at") or "")
        if c is None:
            agg[email] = {
                "email": email,
                "name": r.get("customer_name"),
                "phone": r.get("phone"),
                "orders": 1,
                "spent": float(r.get("total_price") or 0),
                "firstOrder": created,
                "lastOrder": created,
                "lastStatus": r.get("status") or "pending",
            }
        else:
            c["orders"] += 1
            c["spent"] += float(r.get("total_price") or 0)
            if created and created > c["lastOrder"]:
                c["lastOrder"] = created
                c["lastStatus"] = r.get("status") or c["lastStatus"]
                c["name"] = r.get("customer_name") or c["name"]
                c["phone"] = r.get("phone") or c["phone"]

    items = list(agg.values())
    if q:
        term = q.strip().lower()
        items = [
            c
            for c in items
            if term in c["email"]
            or term in (c["name"] or "").lower()
            or term in (c["phone"] or "")
        ]

    if sort == "orders":
        items.sort(key=lambda c: c["orders"], reverse=True)
    elif sort == "recent":
        items.sort(key=lambda c: c["lastOrder"], reverse=True)
    else:
        items.sort(key=lambda c: c["spent"], reverse=True)

    total = len(items)
    offset = (page - 1) * limit
    page_items = items[offset : offset + limit]
    return CustomerListOut(
        items=[CustomerRow(**c) for c in page_items],
        total=total,
        page=page,
        pages=max(1, math.ceil(total / limit)),
    )


# ---------------------------------------------------------------------------
# Settings  (Sanity siteSettings singleton)
# ---------------------------------------------------------------------------
_SETTINGS_FIELDS = {
    "storeName": "storeName",
    "whatsappNumber": "whatsappNumber",
    "supportEmail": "supportEmail",
    "deliveryCharge": "deliveryCharge",
    "freeShippingThreshold": "freeShippingThreshold",
    "codEnabled": "codEnabled",
    "onlinePaymentEnabled": "onlinePaymentEnabled",
    "announcements": "announcements",
    "socialLinks": "socialLinks",
}


def _settings_to_dto(doc: dict) -> SettingsOut:
    return SettingsOut(
        storeName=doc.get("storeName") or "AI Bazar",
        whatsappNumber=doc.get("whatsappNumber") or "",
        supportEmail=doc.get("supportEmail"),
        deliveryCharge=float(doc.get("deliveryCharge") or 0),
        freeShippingThreshold=float(doc.get("freeShippingThreshold") or 0),
        codEnabled=bool(doc.get("codEnabled")),
        onlinePaymentEnabled=bool(doc.get("onlinePaymentEnabled")),
        announcements=[a for a in (doc.get("announcements") or []) if a],
        socialLinks=doc.get("socialLinks") or {},
    )


@router.get("/settings", response_model=SettingsOut)
async def get_settings():
    doc = await sanity_query(Q.SITE_SETTINGS) or {}
    return _settings_to_dto(doc)


@router.patch("/settings", response_model=SettingsOut)
async def patch_settings(body: SettingsPatchIn):
    payload = body.model_dump(exclude_unset=True)
    set_fields: dict = {}
    unset_fields: list[str] = []
    for key, sanity_key in _SETTINGS_FIELDS.items():
        if key not in payload:
            continue
        val = payload[key]
        if val is None:
            unset_fields.append(sanity_key)
        elif key == "socialLinks":
            set_fields[sanity_key] = {k: v for k, v in (val or {}).items() if v}
        else:
            set_fields[sanity_key] = val

    if not set_fields and not unset_fields:
        doc = await sanity_query(Q.SITE_SETTINGS) or {}
        return _settings_to_dto(doc)

    patch: dict = {"id": "siteSettings"}
    if set_fields:
        patch["set"] = set_fields
    if unset_fields:
        patch["unset"] = unset_fields
    await sanity_mutate([{"patch": patch}])
    bust("site-settings")

    doc = await sanity_query(Q.SITE_SETTINGS, use_cdn=False) or {}
    return _settings_to_dto(doc)
