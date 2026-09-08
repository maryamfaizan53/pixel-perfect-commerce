"""Transactional email via Resend (https://resend.com).

RESEND_API_KEY is provisioned by the Vercel Marketplace integration. If it is
not set (local dev, integration not yet installed) every call is a silent no-op
so order creation never fails because of email.
"""
from __future__ import annotations

import logging

import httpx

from app.config import settings

log = logging.getLogger("email")

_API = "https://api.resend.com/emails"


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
            log.warning("resend send failed %s: %s", r.status_code, r.text[:300])
            return False
        return True
    except Exception as e:  # network / timeout — never bubble up into checkout
        log.warning("resend send errored: %s", e)
        return False


def _money(n: float) -> str:
    return f"PKR {n:,.0f}"


def order_notification_html(*, order: dict, order_number: str, quote, address: dict, payment_method: str, notes: str | None) -> str:
    rows = "".join(
        f"<tr>"
        f"<td style='padding:6px 12px 6px 0'>{ln.title}"
        + (f" <span style='color:#64748b'>({ln.variantTitle})</span>" if ln.variantTitle else "")
        + f"</td>"
        f"<td style='padding:6px 12px;text-align:center'>{ln.quantity}</td>"
        f"<td style='padding:6px 0 6px 12px;text-align:right'>{_money(ln.lineTotal)}</td>"
        f"</tr>"
        for ln in quote.lines
    )
    addr = address
    return f"""\
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="margin:0 0 4px">New order · {order_number}</h2>
  <p style="margin:0 0 16px;color:#64748b">
    {payment_method.upper()} · {_money(quote.total)} · status: {order.get('status', 'pending')}
  </p>

  <h3 style="margin:16px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Customer</h3>
  <p style="margin:0">
    <strong>{addr.get('fullName', '')}</strong><br>
    {addr.get('phone', '')}<br>
    {order.get('email', '')}
  </p>

  <h3 style="margin:16px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Deliver to</h3>
  <p style="margin:0">
    {addr.get('line1', '')}{('<br>' + addr['line2']) if addr.get('line2') else ''}<br>
    {addr.get('city', '')}, {addr.get('province', '')}{(' ' + addr['postalCode']) if addr.get('postalCode') else ''}<br>
    {addr.get('country', 'Pakistan')}
  </p>

  <h3 style="margin:16px 0 6px;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Items</h3>
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
  </table>

  {f'<p style="margin:16px 0 0"><strong>Note from customer:</strong> {notes}</p>' if notes else ''}

  <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">
    Order id {order.get('id', '')} · aibazar.pk
  </p>
</div>
"""
