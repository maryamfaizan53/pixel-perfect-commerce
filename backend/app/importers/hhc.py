"""HHC wholesaler portal sync.

⛔ STUB — `fetch_source_products()` needs the real portal access.
Fill it in once we have: base URL, auth (session cookie / API key / login form),
and the product list/detail response shape. Everything downstream
(normalise -> upsert -> lockedFields) is already wired in base.py.
"""
from __future__ import annotations

import uuid
from typing import Any

from app.importers.base import ImportReport, NormalisedProduct, _existing_by_external, upsert_product

_jobs: dict[str, dict[str, Any]] = {}

PORTAL = "hhc"


def new_job() -> str:
    jid = uuid.uuid4().hex[:12]
    _jobs[jid] = {"status": "queued", "report": None}
    return jid


def job_status(job_id: str) -> dict[str, Any]:
    return _jobs.get(job_id, {"status": "unknown"})


# ---------------------------------------------------------------------------
# TODO: implement against the real HHC portal
# ---------------------------------------------------------------------------
async def fetch_source_products(limit: int | None = None) -> list[dict[str, Any]]:
    """Return raw product dicts from the HHC portal.

    Expected to handle: auth, pagination, and (for a scrape) HTML parsing.
    """
    raise NotImplementedError(
        "HHC portal access not configured yet — provide base URL + credentials + response shape"
    )


def normalise(raw: dict[str, Any]) -> NormalisedProduct:
    """Map one HHC record -> NormalisedProduct. Adjust field names once the
    real payload is known."""
    return NormalisedProduct(
        external_id=str(raw.get("id") or raw.get("sku") or raw["handle"]),
        portal=PORTAL,
        title=raw["title"],
        slug=raw.get("handle"),
        excerpt=(raw.get("description") or "")[:480],
        product_type=raw.get("category") or raw.get("product_type") or "",
        tags=raw.get("tags") or [],
        price=float(raw.get("retail_price") or raw.get("price") or 0),
        compare_at_price=(float(raw["compare_at_price"]) if raw.get("compare_at_price") else None),
        cost_price=(float(raw["wholesale_price"]) if raw.get("wholesale_price") else None),
        in_stock=bool(raw.get("in_stock", True)),
        stock_quantity=raw.get("stock"),
        sku=raw.get("sku"),
        barcode=raw.get("barcode"),
        image_urls=raw.get("images") or ([raw["image"]] if raw.get("image") else []),
        external_url=raw.get("url"),
    )


async def run_sync(job_id: str, *, dry_run: bool = False, limit: int | None = None) -> None:
    _jobs[job_id] = {"status": "running", "report": None}
    report = ImportReport()
    try:
        raws = await fetch_source_products(limit=limit)
        normalised = [normalise(r) for r in raws]
        existing = await _existing_by_external(PORTAL, [n.external_id for n in normalised])

        for np in normalised:
            try:
                result = await upsert_product(np, existing.get(np.external_id), dry_run=dry_run)
                setattr(report, result, getattr(report, result) + 1)
            except Exception as exc:  # noqa: BLE001
                report.failed += 1
                report.errors.append(f"{np.external_id}: {exc}")

        _jobs[job_id] = {"status": "done", "report": report.as_dict()}
    except NotImplementedError as exc:
        _jobs[job_id] = {"status": "not_configured", "report": {"errors": [str(exc)]}}
    except Exception as exc:  # noqa: BLE001
        _jobs[job_id] = {"status": "failed", "report": {"errors": [str(exc)]}}
