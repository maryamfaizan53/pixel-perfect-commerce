"""One-off seed: load the catalog that was scraped from the old Shopify store
(`../all_products_details.json` + `../image_mapping.json` + `../cols.json`,
all UTF-16) into Sanity.

Usage (from repo root, backend venv active):
    python -m app.importers.shopify_seed              # seed products + categories
    python -m app.importers.shopify_seed --dry-run
    python -m app.importers.shopify_seed --limit 10

When you later get a real Shopify CSV/Storefront export, replace `load_raw()`.
"""
from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path
from typing import Any

from slugify import slugify

from app.importers.base import ImportReport, NormalisedProduct, _existing_by_external, upsert_product
from app.sanity.client import mutate, query

REPO_ROOT = Path(__file__).resolve().parents[3]
PORTAL = "shopify"


def _read_utf16_json(path: Path) -> Any:
    text = path.read_bytes().decode("utf-16")
    if text and text[0] == "﻿":
        text = text[1:]
    return json.loads(text)


def load_raw() -> tuple[list[dict], list[dict]]:
    products = _read_utf16_json(REPO_ROOT / "all_products_details.json")["data"]["products"]["edges"]
    products = [e["node"] for e in products]

    # supplementary image maps (handle -> url), highest-priority last
    image_map: dict[str, str] = {}
    for name in ["image_mapping.json", "batch2_images.json", "batch3_images.json", "batch4a_images.json"]:
        p = REPO_ROOT / name
        if not p.exists():
            continue
        try:
            m = _read_utf16_json(p)
            if isinstance(m, dict):
                image_map.update({k: v for k, v in m.items() if isinstance(v, str) and v.startswith("http")})
        except Exception:  # noqa: BLE001
            pass
    for prod in products:
        if prod["handle"] in image_map:
            prod["_extra_image"] = image_map[prod["handle"]]

    cols = _read_utf16_json(REPO_ROOT / "cols.json")["data"]["collections"]["edges"]
    cols = [e["node"] for e in cols if e["node"]["handle"] != "frontpage"]
    return products, cols


def normalise(raw: dict) -> NormalisedProduct:
    images: list[str] = []
    for edge in (raw.get("images") or {}).get("edges", []):
        url = edge.get("node", {}).get("url")
        if url:
            images.append(url)
    if raw.get("_extra_image") and raw["_extra_image"] not in images:
        images.insert(0, raw["_extra_image"])

    return NormalisedProduct(
        external_id=raw["handle"],
        portal=PORTAL,
        title=raw["title"],
        slug=raw["handle"],
        excerpt=(raw.get("description") or "")[:480],
        product_type=raw.get("productType") or "",
        tags=raw.get("tags") or [],
        price=float(raw["priceRange"]["minVariantPrice"]["amount"]),
        in_stock=bool(raw.get("availableForSale", True)),
        image_urls=images,
        external_url=f"https://www.aibazar.pk/products/{raw['handle']}",
    )


async def seed_categories(cols: list[dict], *, dry_run: bool) -> int:
    if dry_run:
        return len(cols)
    muts = []
    for i, c in enumerate(cols):
        muts.append(
            {
                "createOrReplace": {
                    "_id": "category-" + slugify(c["handle"]),
                    "_type": "category",
                    "title": c["title"],
                    "slug": {"_type": "slug", "current": c["handle"]},
                    "description": c.get("description") or "",
                    "order": i + 1,
                    "featured": c["handle"] in {
                        "top-selling-products", "household", "heaters", "health-and-beauty",
                        "hair-straightener-1", "kitchen",
                    },
                    "source": {"_type": "externalSource", "portal": PORTAL, "externalId": c["handle"]},
                }
            }
        )
    await mutate(muts)
    return len(muts)


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--skip-categories", action="store_true")
    args = ap.parse_args()

    products_raw, cols = load_raw()
    if args.limit:
        products_raw = products_raw[: args.limit]

    if not args.skip_categories:
        n = await seed_categories(cols, dry_run=args.dry_run)
        print(f"categories: {n}")

    normalised = [normalise(r) for r in products_raw]
    existing = await _existing_by_external(PORTAL, [n.external_id for n in normalised])

    report = ImportReport()
    for np in normalised:
        try:
            result = await upsert_product(np, existing.get(np.external_id), dry_run=args.dry_run)
            setattr(report, result, getattr(report, result) + 1)
            print(f"  {result:8} {np.resolved_slug()}")
        except Exception as exc:  # noqa: BLE001
            report.failed += 1
            report.errors.append(f"{np.external_id}: {exc}")
            print(f"  FAILED   {np.external_id}: {exc}")

    print("\n", json.dumps(report.as_dict(), indent=2))


if __name__ == "__main__":
    asyncio.run(main())
