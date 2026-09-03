"""Supabase service-role client (server only) + review-aggregate overlay."""
from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from app.config import settings
from app.schemas.catalog import RatingDTO


@lru_cache
def get_client() -> Client:
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_KEY not configured")
    return create_client(settings.supabase_url, settings.supabase_service_key)


def review_aggregates(product_ids: list[str]) -> dict[str, RatingDTO]:
    """Return {product_id: RatingDTO} for the given Sanity product ids.

    `product_reviews.product_id` stores the Sanity `_id`.
    """
    if not product_ids:
        return {}
    try:
        rows = (
            get_client()
            .table("product_reviews")
            .select("product_id, rating")
            .in_("product_id", product_ids)
            .execute()
            .data
        )
    except Exception:  # noqa: BLE001 - reviews are non-critical decoration
        return {}

    buckets: dict[str, list[int]] = {}
    for row in rows or []:
        buckets.setdefault(row["product_id"], []).append(row["rating"])

    return {
        pid: RatingDTO(average=round(sum(vals) / len(vals), 2), count=len(vals))
        for pid, vals in buckets.items()
        if vals
    }
