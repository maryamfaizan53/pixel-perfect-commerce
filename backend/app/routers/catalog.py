"""Storefront catalog endpoints — the only data source the React app uses."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.sanity import queries as Q
from app.sanity.client import query
from app.sanity.mapper import map_category, map_product, map_product_card
from app.schemas.catalog import (
    CategoryDTO,
    CategoryWithProductsDTO,
    HomeDTO,
    HomeRowDTO,
    ProductDTO,
    ProductListDTO,
    SiteSettingsDTO,
)
from app.services.cache import cached
from app.services.supabase_client import review_aggregates

router = APIRouter(prefix="/api", tags=["catalog"])


def _overlay_ratings(docs: list[dict]):
    ratings = review_aggregates([d["id"] for d in docs])
    return [map_product_card(d, ratings.get(d["id"])) for d in docs]


@router.get("/site-settings", response_model=SiteSettingsDTO)
async def site_settings() -> SiteSettingsDTO:
    doc = await cached("site-settings", lambda: query(Q.SITE_SETTINGS), ttl=600)
    return SiteSettingsDTO(**(doc or {}))


@router.get("/products", response_model=ProductListDTO)
async def list_products(
    offset: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
) -> ProductListDTO:
    end = offset + limit
    key = f"products:{offset}:{limit}"
    docs = await cached(key, lambda: query(Q.LIST_PRODUCTS, {"offset": offset, "end": end}))
    total = await cached("products:count", lambda: query(Q.COUNT_PRODUCTS), ttl=600)
    return ProductListDTO(items=_overlay_ratings(docs or []), total=total or 0, offset=offset, limit=limit)


@router.get("/products/search", response_model=list)
async def search_products(q: str = Query(min_length=1), limit: int = Query(24, ge=1, le=50)):
    term = f"{q.strip()}*"
    docs = await query(Q.SEARCH_PRODUCTS, {"term": term, "limit": limit})
    return _overlay_ratings(docs or [])


@router.get("/products/{slug}", response_model=ProductDTO)
async def get_product(slug: str) -> ProductDTO:
    doc = await cached(f"product:{slug}", lambda: query(Q.PRODUCT_BY_SLUG, {"slug": slug}))
    if not doc:
        raise HTTPException(404, "Product not found")
    ratings = review_aggregates([doc["id"]])
    return map_product(doc, ratings.get(doc["id"]))


@router.get("/products/{slug}/related", response_model=list)
async def related_products(slug: str):
    doc = await cached(f"product:{slug}", lambda: query(Q.PRODUCT_BY_SLUG, {"slug": slug}))
    if not doc:
        raise HTTPException(404, "Product not found")
    category_slugs = [c["slug"] for c in (doc.get("categories") or []) if c.get("slug")]
    docs = await query(
        Q.RELATED_PRODUCTS,
        {
            "slug": slug,
            # Sentinel so an empty productType/tag set never trivially matches
            # every other untyped product (most of the HHC catalog has neither set).
            "productType": doc.get("productType") or "no-product-type-set",
            "tags": doc.get("tags") or [],
            "categorySlugs": category_slugs or ["no-category-set"],
        },
    )
    return _overlay_ratings(docs or [])


@router.get("/categories", response_model=list[CategoryDTO])
async def list_categories() -> list[CategoryDTO]:
    docs = await cached("categories", lambda: query(Q.LIST_CATEGORIES), ttl=600)
    return [map_category(d) for d in docs or []]


@router.get("/categories/{slug}", response_model=CategoryWithProductsDTO)
async def category_with_products(slug: str, limit: int = Query(48, ge=1, le=100)) -> CategoryWithProductsDTO:
    cat = await cached(f"category:{slug}", lambda: query(Q.CATEGORY_BY_SLUG, {"slug": slug}))
    if not cat:
        raise HTTPException(404, "Category not found")
    docs = await cached(
        f"category:{slug}:products:{limit}",
        lambda: query(Q.PRODUCTS_IN_CATEGORY, {"slug": slug, "limit": limit}),
    )
    return CategoryWithProductsDTO(category=map_category(cat), products=_overlay_ratings(docs or []))


@router.get("/home", response_model=HomeDTO)
async def home() -> HomeDTO:
    """Featured categories + a product row per featured category (homepage payload)."""
    settings_doc = await cached("site-settings", lambda: query(Q.SITE_SETTINGS), ttl=600)
    featured = (settings_doc or {}).get("featuredCategories") or []
    if not featured:
        cats = await cached("categories", lambda: query(Q.LIST_CATEGORIES), ttl=600)
        featured = [c for c in (cats or []) if c.get("featured")][:6]
        slugs = [c["slug"] for c in featured]
    else:
        slugs = [c["slug"] for c in featured]

    rows: list[HomeRowDTO] = []
    cats_full = await cached("categories", lambda: query(Q.LIST_CATEGORIES), ttl=600)
    by_slug = {c["slug"]: c for c in (cats_full or [])}
    for slug in slugs:
        cat = by_slug.get(slug)
        if not cat:
            continue
        docs = await cached(
            f"home-row:{slug}",
            lambda s=slug: query(Q.PRODUCTS_IN_CATEGORY, {"slug": s, "limit": 12}),
        )
        rows.append(HomeRowDTO(category=map_category(cat), products=_overlay_ratings(docs or [])))

    return HomeDTO(featuredCategories=[map_category(by_slug[s]) for s in slugs if s in by_slug], rows=rows)
