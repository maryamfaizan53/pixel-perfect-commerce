"""Cart quote + order creation (COD and Safepay online)."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request

from app.config import settings
from app.deps import optional_user
from app.sanity import queries as Q
from app.sanity.client import query
from app.schemas.checkout import (
    CartLineIn,
    CreateOrderIn,
    CreateOrderOut,
    OrderDetailOut,
    OrderItemOut,
    QuoteOut,
)
from app.services import safepay
from app.services.email import customer_confirmation_html, order_notification_html, send_email
from app.services.pricing import quote as build_quote
from app.services.supabase_client import get_client
from pydantic import BaseModel

router = APIRouter(prefix="/api/checkout", tags=["checkout"])


class QuoteIn(BaseModel):
    lines: list[CartLineIn]


async def _settings_row() -> dict:
    return (await query(Q.SITE_SETTINGS)) or {}


@router.post("/quote", response_model=QuoteOut)
async def quote(body: QuoteIn) -> QuoteOut:
    s = await _settings_row()
    return await build_quote(
        body.lines,
        delivery_charge=s.get("deliveryCharge", 200),
        free_threshold=s.get("freeShippingThreshold", 5000),
    )


@router.post("/orders", response_model=CreateOrderOut)
async def create_order(
    body: CreateOrderIn,
    background: BackgroundTasks,
    user=Depends(optional_user),
) -> CreateOrderOut:
    s = await _settings_row()
    q = await build_quote(
        body.lines,
        delivery_charge=s.get("deliveryCharge", 200),
        free_threshold=s.get("freeShippingThreshold", 5000),
    )
    if not q.valid:
        raise HTTPException(409, {"message": "Cart is no longer valid", "issues": q.issues})

    if body.paymentMethod == "online" and not settings.safepay_api_key:
        raise HTTPException(400, "Online payment is not available yet")

    db = get_client()
    order_number = db.rpc("next_order_number").execute().data

    order_row = {
        "user_id": user["id"] if user else None,
        "order_number": order_number,
        "email": body.email,
        "phone": body.address.phone,
        "customer_name": body.address.fullName,
        "status": "pending",
        "payment_method": body.paymentMethod,
        "payment_status": "unpaid",
        "payment_provider": "safepay" if body.paymentMethod == "online" else None,
        "subtotal_price": q.subtotal,
        "shipping_fee": q.shippingFee,
        "total_price": q.total,
        "currency_code": "PKR",
        "shipping_address": body.address.model_dump(),
        "notes": body.notes,
    }
    order = db.table("orders").insert(order_row).execute().data[0]

    db.table("order_items").insert([
        {
            "order_id": order["id"],
            "product_id": ln.productId,
            "product_slug": ln.slug,
            "variant_key": ln.variantKey,
            "product_title": ln.title,
            "variant_title": ln.variantTitle,
            "price": ln.unitPrice,
            "quantity": ln.quantity,
            "total": ln.lineTotal,
            "image_url": ln.imageUrl,
        }
        for ln in q.lines
    ]).execute()

    redirect_url = None
    if body.paymentMethod == "online":
        redirect_url = await safepay.create_checkout_session(
            order_number=order_number,
            amount=q.total,
            email=body.email,
            redirect_ok=f"https://www.aibazar.pk/order/{order['id']}?paid=1",
            redirect_cancel=f"https://www.aibazar.pk/checkout?cancelled=1",
        )

    # Both emails fire after the response is sent and swallow every error, so a
    # slow or failing mail provider never delays or breaks checkout.
    addr = body.address.model_dump()

    # 1) Store owner — full fulfilment details.
    if settings.order_notification_email:
        background.add_task(
            send_email,
            to=settings.order_notification_email,
            subject=f"New order {order_number} — {q.total:,.0f} PKR ({body.paymentMethod.upper()})",
            html=order_notification_html(
                order=order, order_number=order_number, quote=q,
                address=addr, payment_method=body.paymentMethod, notes=body.notes,
            ),
            reply_to=body.email,
        )

    # 2) Customer — order confirmation. Requires a verified sending domain in
    #    Resend to actually deliver (EMAIL_FROM = orders@aibazar.pk); until then
    #    Resend rejects it and email.py just logs a warning.
    background.add_task(
        send_email,
        to=body.email,
        subject=f"Your AI Bazar order {order_number} is confirmed",
        html=customer_confirmation_html(
            order=order, order_number=order_number, quote=q,
            address=addr, payment_method=body.paymentMethod,
        ),
        reply_to=settings.order_notification_email or None,
    )

    return CreateOrderOut(
        orderId=order["id"],
        orderNumber=order_number,
        status=order["status"],
        paymentMethod=body.paymentMethod,
        total=q.total,
        redirectUrl=redirect_url,
    )


def _order_to_dto(o: dict, items: list[dict]) -> OrderDetailOut:
    return OrderDetailOut(
        id=o["id"],
        orderNumber=o.get("order_number") or "",
        status=o.get("status") or "pending",
        paymentMethod=o.get("payment_method") or "cod",
        paymentStatus=o.get("payment_status") or "unpaid",
        email=o.get("email") or "",
        phone=o.get("phone"),
        customerName=o.get("customer_name"),
        subtotal=float(o.get("subtotal_price") or 0),
        shippingFee=float(o.get("shipping_fee") or 0),
        total=float(o.get("total_price") or 0),
        currency=o.get("currency_code") or "PKR",
        shippingAddress=o.get("shipping_address"),
        notes=o.get("notes"),
        createdAt=str(o.get("created_at") or ""),
        items=[
            OrderItemOut(
                productTitle=it.get("product_title") or "",
                variantTitle=it.get("variant_title"),
                productSlug=it.get("product_slug"),
                quantity=int(it.get("quantity") or 1),
                price=float(it.get("price") or 0),
                total=float(it.get("total") or 0),
                imageUrl=it.get("image_url"),
            )
            for it in items
        ],
    )


@router.get("/orders/lookup", response_model=OrderDetailOut)
async def lookup_order(number: str, email: str) -> OrderDetailOut:
    """Track-order lookup by order number + email (both must match)."""
    db = get_client()
    try:
        rows = (
            db.table("orders")
            .select("*")
            .eq("order_number", number.strip().upper())
            .ilike("email", email.strip())
            .limit(1)
            .execute()
            .data
        )
    except Exception:
        rows = None
    if not rows:
        raise HTTPException(404, "No order found for that number and email")
    o = rows[0]
    items = db.table("order_items").select("*").eq("order_id", o["id"]).execute().data or []
    return _order_to_dto(o, items)


@router.get("/orders/{order_id}", response_model=OrderDetailOut)
async def get_order(order_id: str) -> OrderDetailOut:
    """Fetch one order + its items for the confirmation page.

    Looked up by its unguessable UUID — the same pattern as a Shopify
    thank-you page. The frontend can't read `orders` directly (RLS only
    exposes a logged-in user's own rows, and most orders are guest checkout).
    """
    db = get_client()
    try:
        rows = db.table("orders").select("*").eq("id", order_id).limit(1).execute().data
    except Exception:
        rows = None
    if not rows:
        raise HTTPException(404, "Order not found")
    o = rows[0]
    items = db.table("order_items").select("*").eq("order_id", order_id).execute().data or []
    return _order_to_dto(o, items)


@router.post("/webhooks/safepay")
async def safepay_webhook(request: Request):
    raw = await request.body()
    sig = request.headers.get("X-SFPY-SIGNATURE")
    if not safepay.verify_webhook(raw, sig):
        raise HTTPException(400, "Bad signature")

    import json

    event = json.loads(raw)
    order_number = event.get("data", {}).get("order_id")
    state = event.get("data", {}).get("state")  # 'TRACKER_ENDED' etc.
    if not order_number:
        return {"ok": True}

    db = get_client()
    paid = state in {"TRACKER_ENDED", "COMPLETED", "PAID"}
    db.table("orders").update(
        {
            "payment_status": "paid" if paid else "failed",
            "status": "confirmed" if paid else "pending",
            "payment_ref": event.get("data", {}).get("tracker"),
        }
    ).eq("order_number", order_number).execute()
    return {"ok": True}
