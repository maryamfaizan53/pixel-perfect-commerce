"""Safepay integration (Pakistan gateway).

STUB — fill in once merchant credentials exist. Docs: https://docs.getsafepay.com
Flow: create a payment "tracker" -> redirect user to the Safepay checkout URL ->
Safepay calls our webhook with the result -> we verify the signature and mark
the order paid.
"""
from __future__ import annotations

import hashlib
import hmac

import httpx

from app.config import settings

_BASE = {
    "sandbox": "https://sandbox.api.getsafepay.com",
    "production": "https://api.getsafepay.com",
}


async def create_checkout_session(*, order_number: str, amount: float, email: str, redirect_ok: str, redirect_cancel: str) -> str:
    """Return a URL to redirect the customer to. Raises if not configured."""
    if not settings.safepay_api_key:
        raise RuntimeError("Safepay is not configured (SAFEPAY_API_KEY missing)")

    base = _BASE[settings.safepay_environment]
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            f"{base}/order/v1/init",
            headers={"X-SFPY-MERCHANT-SECRET": settings.safepay_secret_key},
            json={
                "client": settings.safepay_api_key,
                "amount": int(round(amount * 100)),  # paisa
                "currency": "PKR",
                "environment": settings.safepay_environment,
                "order_id": order_number,
                "customer_email": email,
                "source": "custom",
            },
        )
    resp.raise_for_status()
    token = resp.json()["data"]["token"]
    checkout = (
        f"{base.replace('api.', '')}/embedded"
        f"?tracker={token}&env={settings.safepay_environment}"
        f"&redirect_url={redirect_ok}&cancel_url={redirect_cancel}"
        f"&source=custom&order_id={order_number}"
    )
    return checkout


def verify_webhook(raw_body: bytes, signature: str | None) -> bool:
    if not settings.safepay_webhook_secret or not signature:
        return False
    digest = hmac.new(settings.safepay_webhook_secret.encode(), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(digest, signature)
