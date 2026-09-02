"""Cart quote + order creation (COD and Safepay online)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import settings
from app.deps import optional_user
from app.sanity import queries as Q
from app.sanity.client import query
from app.schemas.checkout import CartLineIn, CreateOrderIn, CreateOrderOut, QuoteOut
from app.services import safepay
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
async def create_order(body: CreateOrderIn, user=Depends(optional_user)) -> CreateOrderOut:
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

    return CreateOrderOut(
        orderId=order["id"],
        orderNumber=order_number,
        status=order["status"],
        paymentMethod=body.paymentMethod,
        total=q.total,
        redirectUrl=redirect_url,
    )


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
