"""Sanity GROQ result -> storefront DTO."""
from __future__ import annotations

from typing import Any

from app.schemas.catalog import (
    CategoryDTO,
    CategoryRefDTO,
    ImageDTO,
    OptionDTO,
    ProductCardDTO,
    ProductDTO,
    RatingDTO,
    SeoDTO,
    VariantDTO,
    VideoDTO,
)
from app.sanity.portable_text import to_html


def _images(raw: list[dict[str, Any]] | None) -> list[ImageDTO]:
    out: list[ImageDTO] = []
    for img in raw or []:
        url = img.get("url")
        if not url:
            continue
        out.append(ImageDTO(url=url, alt=img.get("alt") or "", width=img.get("w"), height=img.get("h")))
    return out


def _seo(raw: dict[str, Any] | None) -> SeoDTO:
    raw = raw or {}
    return SeoDTO(
        title=raw.get("metaTitle"),
        description=raw.get("metaDescription"),
        ogImage=raw.get("ogImage"),
        noIndex=bool(raw.get("noIndex")),
    )


def map_product_card(doc: dict[str, Any], rating: RatingDTO | None = None) -> ProductCardDTO:
    return ProductCardDTO(
        id=doc["id"],
        slug=doc["slug"],
        title=doc.get("title") or "",
        excerpt=doc.get("excerpt") or "",
        productType=doc.get("productType") or "",
        vendor=doc.get("vendor") or "",
        tags=doc.get("tags") or [],
        categories=[CategoryRefDTO(**c) for c in (doc.get("categories") or []) if c and c.get("slug")],
        price=float(doc.get("price") or 0),
        compareAtPrice=(float(doc["compareAtPrice"]) if doc.get("compareAtPrice") else None),
        inStock=doc.get("inStock", True),
        featured=bool(doc.get("featured")),
        hasVideo=bool(doc.get("hasVideo")),
        images=_images(doc.get("images")),
        rating=rating,
    )


def map_product(doc: dict[str, Any], rating: RatingDTO | None = None) -> ProductDTO:
    card = map_product_card(doc, rating)

    videos: list[VideoDTO] = []
    for v in doc.get("videos") or []:
        if v.get("kind") == "file" and v.get("fileUrl"):
            videos.append(VideoDTO(kind="file", url=v["fileUrl"], poster=v.get("poster")))
        elif v.get("url"):
            videos.append(VideoDTO(kind="external", url=v["url"], poster=v.get("poster")))

    variants: list[VariantDTO] = []
    for i, v in enumerate(doc.get("variants") or []):
        variants.append(
            VariantDTO(
                key=v.get("sku") or f"{doc['id']}-v{i}",
                title=v.get("title") or "Default",
                price=float(v.get("price") or card.price),
                compareAtPrice=(float(v["compareAtPrice"]) if v.get("compareAtPrice") else None),
                inStock=v.get("inStock", True),
                selectedOptions=[{"name": o.get("name", ""), "value": o.get("value", "")} for o in (v.get("selectedOptions") or [])],
                image=v.get("image"),
            )
        )

    return ProductDTO(
        **card.model_dump(),
        bodyHtml=to_html(doc.get("bodyRaw")) or None,
        sku=doc.get("sku"),
        barcode=doc.get("barcode"),
        weightGrams=doc.get("weightGrams"),
        videos=videos,
        options=[OptionDTO(name=o.get("name", ""), values=o.get("values") or []) for o in (doc.get("options") or [])],
        variants=variants,
        seo=_seo(doc.get("seo")),
    )


def map_category(doc: dict[str, Any]) -> CategoryDTO:
    img = doc.get("image") or {}
    return CategoryDTO(
        id=doc["id"],
        slug=doc["slug"],
        title=doc.get("title") or "",
        description=doc.get("description") or "",
        bodyHtml=to_html(doc.get("bodyRaw")) or None,
        featured=bool(doc.get("featured")),
        order=doc.get("order") if doc.get("order") is not None else 100,
        image=ImageDTO(url=img["url"], alt=img.get("alt") or doc.get("title") or "") if img.get("url") else None,
        seo=_seo(doc.get("seo")),
    )
