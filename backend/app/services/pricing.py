"""Server-authoritative cart re-pricing against live Sanity data."""
from __future__ import annotations

from app.sanity import queries as Q
from app.sanity.client import query
from app.schemas.checkout import CartLineIn, QuoteLine, QuoteOut


async def _load_products(slugs: list[str]) -> dict[str, dict]:
    if not slugs:
        return {}
    docs = await query(
        f'*[_type == "product" && slug.current in $slugs && !(_id in path("drafts.**"))]{{ {Q.PRODUCT_FULL_PROJECTION} }}',
        {"slugs": slugs},
    )
    return {d["slug"]: d for d in (docs or [])}


def _resolve_line(doc: dict, line: CartLineIn) -> QuoteLine:
    base_price = float(doc.get("price") or 0)
    in_stock = bool(doc.get("inStock", True))
    title = doc.get("title") or ""
    variant_title = None
    image = None
    uploaded = doc.get("uploadedImages") or []
    if uploaded:
        image = uploaded[0].get("url")
    elif doc.get("imageUrls"):
        image = doc["imageUrls"][0]

    if line.variantKey:
        for i, v in enumerate(doc.get("variants") or []):
            key = v.get("sku") or f'{doc["id"]}-v{i}'
            if key == line.variantKey:
                base_price = float(v.get("price") or base_price)
                in_stock = bool(v.get("inStock", True))
                variant_title = v.get("title")
                image = v.get("image") or image
                break

    return QuoteLine(
        productId=doc["id"],
        slug=doc["slug"],
        variantKey=line.variantKey,
        title=title,
        variantTitle=variant_title,
        unitPrice=base_price,
        quantity=line.quantity,
        lineTotal=round(base_price * line.quantity, 2),
        inStock=in_stock,
        imageUrl=image,
    )


async def quote(lines: list[CartLineIn], *, delivery_charge: float, free_threshold: float) -> QuoteOut:
    docs = await _load_products([ln.slug for ln in lines])
    resolved: list[QuoteLine] = []
    issues: list[str] = []

    for ln in lines:
        doc = docs.get(ln.slug)
        if not doc:
            issues.append(f"Product no longer available: {ln.slug}")
            continue
        q_line = _resolve_line(doc, ln)
        if not q_line.inStock:
            issues.append(f"Out of stock: {q_line.title}")
        resolved.append(q_line)

    subtotal = round(sum(l.lineTotal for l in resolved), 2)
    shipping = 0.0 if (free_threshold and subtotal >= free_threshold) else float(delivery_charge)
    return QuoteOut(
        lines=resolved,
        subtotal=subtotal,
        shippingFee=shipping,
        total=round(subtotal + shipping, 2),
        freeShippingThreshold=free_threshold,
        valid=len(issues) == 0 and len(resolved) > 0,
        issues=issues,
    )
