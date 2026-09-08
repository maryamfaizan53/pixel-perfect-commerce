"""Transactional email via Resend (https://resend.com).

RESEND_API_KEY is set from the Resend dashboard (or the Vercel Marketplace
integration). If it is not set every call is a silent no-op so order creation
never fails because of email.

Sender rules (Resend):
  * `onboarding@resend.dev` can only deliver to the Resend account's own email
    -> fine for the owner alert while the domain is unverified.
  * Arbitrary customer addresses require a VERIFIED domain (EMAIL_FROM set to
    e.g. "AI Bazar <orders@aibazar.pk>"). Until then the customer email will
    be attempted and Resend will reject it; we log and move on.
"""
from __future__ import annotations

import logging

import httpx

from app.config import settings

log = logging.getLogger("email")

_API = "https://api.resend.com/emails"
_SUPPORT_WA = "https://wa.me/923328222026"


async def send_email(*, to: str | list[str], subject: str, html: str, reply_to: str | None = None) -> bool:
    if not settings.resend_api_key:
        log.info("email skipped (no RESEND_API_KEY): %s -> %s", subject, to)
        return False
    payload: dict = {
        "from": settings.email_from,
        "to": [to] if isinstance(to, str) else to,
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                _API,
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
                json=payload,
            )
        if r.status_code >= 300:
            log.warning("resend send failed %s (%s -> %s): %s", r.status_code, subject, to, r.text[:300])
            return False
        return True
    except Exception as e:  # network / timeout — never bubble up into checkout
        log.warning("resend send errored: %s", e)
        return False


def _money(n: float) -> str:
    return f"PKR {n:,.0f}"


def _items_table(quote, *, with_totals: bool = True) -> str:
    rows = "".join(
        "<tr>"
        f"<td style='padding:6px 12px 6px 0'>{ln.title}"
        + (f" <span style='color:#64748b'>({ln.variantTitle})</span>" if ln.variantTitle else "")
        + "</td>"
        f"<td style='padding:6px 12px;text-align:center'>{ln.quantity}</td>"
        f"<td style='padding:6px 0 6px 12px;text-align:right'>{_money(ln.lineTotal)}</td>"
        "</tr>"
        for ln in quote.lines
    )
    if not with_totals:
        return f"<table style='width:100%;border-collapse:collapse;font-size:14px'><tbody>{rows}</tbody></table>"
    return f"""\
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tbody>{rows}</tbody>
  <tfoot style="border-top:1px solid #e2e8f0">
    <tr><td style="padding:8px 12px 2px 0;color:#64748b">Subtotal</td><td></td>
        <td style="padding:8px 0 2px;text-align:right">{_money(quote.subtotal)}</td></tr>
    <tr><td style="padding:2px 12px 2px 0;color:#64748b">Delivery</td><td></td>
        <td style="padding:2px 0;text-align:right">{'FREE' if quote.shippingFee == 0 else _money(quote.shippingFee)}</td></tr>
    <tr><td style="padding:6px 12px 0 0;font-weight:700">Total</td><td></td>
        <td style="padding:6px 0 0;text-align:right;font-weight:700">{_money(quote.total)}</td></tr>
  </tfoot>
</table>"""


def _address_block(a: dict) -> str:
    line2 = f"<br>{a['line2']}" if a.get("line2") else ""
    postal = f" {a['postalCode']}" if a.get("postalCode") else ""
    return (
        f"{a.get('line1', '')}{line2}<br>"
        f"{a.get('city', '')}, {a.get('province', '')}{postal}<br>"
        f"{a.get('country', 'Pakistan')}"
    )


def _shell(inner: str) -> str:
    return (
        '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;'
        'max-width:560px;margin:0 auto;color:#0f172a;line-height:1.5">' + inner + "</div>"
    )


# ---------------------------------------------------------------------------
# Owner alert — everything the store needs to fulfil the order.
# ---------------------------------------------------------------------------
def order_notification_html(*, order: dict, order_number: str, quote, address: dict, payment_method: str, notes: str | None) -> str:
    note_html = f'<p style="margin:16px 0 0"><strong>Note from customer:</strong> {notes}</p>' if notes else ""
    return _shell(f"""\
  <h2 style="margin:0 0 4px">New order · {order_number}</h2>
  <p style="margin:0 0 16px;color:#64748b">
    {payment_method.upper()} · {_money(quote.total)} · status: {order.get('status', 'pending')}
  </p>

  <h3 style="margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Customer</h3>
  <p style="margin:0"><strong>{address.get('fullName', '')}</strong><br>{address.get('phone', '')}<br>{order.get('email', '')}</p>

  <h3 style="margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Deliver to</h3>
  <p style="margin:0">{_address_block(address)}</p>

  <h3 style="margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Items</h3>
  {_items_table(quote)}
  {note_html}

  <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Order id {order.get('id', '')} · aibazar.pk</p>
""")


# ---------------------------------------------------------------------------
# Customer confirmation — friendly "we got your order".
# ---------------------------------------------------------------------------
def customer_confirmation_html(*, order: dict, order_number: str, quote, address: dict, payment_method: str) -> str:
    if payment_method == "cod":
        next_step = (
            "Pay <strong>cash on delivery</strong> when your parcel arrives — you can open it "
            "and check everything first. Delivery is 1–3 business days across Pakistan."
        )
    else:
        next_step = (
            "We've received your order. Once payment is confirmed we'll dispatch it — "
            "delivery is 1–3 business days across Pakistan."
        )
    track_url = f"https://www.aibazar.pk/order/{order.get('id', '')}"
    return _shell(f"""\
  <h2 style="margin:0 0 4px">Thank you for your order!</h2>
  <p style="margin:0 0 16px;color:#64748b">Order <strong>{order_number}</strong> · {_money(quote.total)}</p>

  <p style="margin:0 0 16px">Hi {address.get('fullName', 'there')}, we've received your order at AI Bazar. {next_step}</p>

  <h3 style="margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Your order</h3>
  {_items_table(quote)}

  <h3 style="margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Delivering to</h3>
  <p style="margin:0">{address.get('fullName', '')}<br>{address.get('phone', '')}<br>{_address_block(address)}</p>

  <p style="margin:20px 0 0">
    <a href="{track_url}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:600;
       text-decoration:none;padding:10px 20px;border-radius:9999px">Track your order</a>
  </p>
  <p style="margin:14px 0 0;font-size:13px;color:#64748b">
    Questions? Message us on <a href="{_SUPPORT_WA}" style="color:#0f172a">WhatsApp</a> or reply to this email.
  </p>

  <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">AI Bazar · aibazar.pk · Cash on Delivery across Pakistan</p>
""")
