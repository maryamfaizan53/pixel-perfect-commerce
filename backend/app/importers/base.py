"""Shared import machinery: normalise a source product, upsert into Sanity,
respecting per-document `source.lockedFields` so manual Studio edits survive.
"""
from __future__ import annotations

import datetime as dt
import re
from dataclasses import dataclass, field
from typing import Any

import httpx
from slugify import slugify

from app.sanity import queries as Q
from app.sanity.client import mutate, query, upload_asset


@dataclass
class NormalisedProduct:
    external_id: str
    title: str
    price: float
    portal: str = "hhc"
    slug: str | None = None
    excerpt: str = ""
    body_html: str | None = None
    product_type: str = ""
    vendor: str = "AI Bazar"
    tags: list[str] = field(default_factory=list)
    compare_at_price: float | None = None
    in_stock: bool = True
    stock_quantity: int | None = None
    sku: str | None = None
    barcode: str | None = None
    cost_price: float | None = None
    image_urls: list[str] = field(default_factory=list)
    category_slugs: list[str] = field(default_factory=list)
    external_url: str | None = None
    options: list[dict[str, Any]] = field(default_factory=list)
    variants: list[dict[str, Any]] = field(default_factory=list)

    def resolved_slug(self) -> str:
        return self.slug or slugify(self.title)[:96]


@dataclass
class ImportReport:
    added: int = 0
    updated: int = 0
    skipped: int = 0
    failed: int = 0
    errors: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {
            "added": self.added,
            "updated": self.updated,
            "skipped": self.skipped,
            "failed": self.failed,
            "errors": self.errors[:50],
        }


async def _existing_by_external(portal: str, ids: list[str]) -> dict[str, dict]:
    if not ids:
        return {}
    rows = await query(Q.PRODUCTS_BY_EXTERNAL_IDS, {"portal": portal, "ids": ids})
    return {r["externalId"]: r for r in (rows or [])}


async def _upload_images(urls: list[str], *, slug: str) -> list[dict[str, Any]]:
    """Download source images and push them into Sanity's asset store."""
    out: list[dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        for i, url in enumerate(urls[:10]):
            try:
                r = await client.get(url)
                r.raise_for_status()
                ctype = r.headers.get("content-type", "image/jpeg").split(";")[0]
                ext = {"image/png": "png", "image/webp": "webp"}.get(ctype, "jpg")
                asset = await upload_asset(r.content, filename=f"{slug}-{i}.{ext}", content_type=ctype)
                out.append(
                    {
                        "_type": "image",
                        "_key": f"img{i}",
                        "asset": {"_type": "reference", "_ref": asset["_id"]},
                    }
                )
            except Exception as exc:  # noqa: BLE001
                out.append({"_error": f"{url}: {exc}"})
    return [o for o in out if "_error" not in o]


def _doc_id_for(slug: str) -> str:
    return "product-" + re.sub(r"[^a-zA-Z0-9_-]", "-", slug)[:120]


async def upsert_product(np: NormalisedProduct, existing: dict | None, *, dry_run: bool) -> str:
    """Return 'added' | 'updated' | 'skipped'."""
    slug = np.resolved_slug()
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    locked: set[str] = set((existing or {}).get("lockedFields") or [])

    fields: dict[str, Any] = {
        "title": np.title,
        "slug": {"_type": "slug", "current": slug},
        "excerpt": np.excerpt,
        "productType": np.product_type,
        "vendor": np.vendor,
        "tags": np.tags,
        "price": np.price,
        "compareAtPrice": np.compare_at_price,
        "inStock": np.in_stock,
        "stockQuantity": np.stock_quantity,
        "sku": np.sku,
        "barcode": np.barcode,
        "options": np.options,
        "variants": np.variants,
    }
    fields = {k: v for k, v in fields.items() if k not in locked and v not in (None, [], "")}

    source_block = {
        "_type": "externalSource",
        "portal": np.portal,
        "externalId": np.external_id,
        "externalUrl": np.external_url,
        "costPrice": np.cost_price,
        "importedAt": (existing or {}).get("source", {}).get("importedAt") or now,
        "lastSyncedAt": now,
        "lockedFields": list(locked),
    }

    if dry_run:
        return "updated" if existing else "added"

    if existing:
        patch = {"id": existing["_id"], "set": {**fields, "source": source_block}}
        await mutate([{"patch": patch}])
        return "updated"

    # new document — needs at least one image
    images = await _upload_images(np.image_urls, slug=slug) if np.image_urls else []
    doc = {
        "_id": _doc_id_for(slug),
        "_type": "product",
        **fields,
        "images": images,
        "source": source_block,
    }
    await mutate([{"createOrReplace": doc}])
    return "added"
