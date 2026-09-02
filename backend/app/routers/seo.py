"""Sitemap data for the frontend build scripts (replaces the Shopify calls
in generate_sitemap.cjs / generate_static_html.cjs)."""
from __future__ import annotations

from fastapi import APIRouter

from app.sanity import queries as Q
from app.sanity.client import query
from app.services.cache import cached

router = APIRouter(prefix="/api/seo", tags=["seo"])


@router.get("/slugs")
async def all_slugs():
    return await cached("seo:slugs", lambda: query(Q.ALL_SLUGS), ttl=300)
