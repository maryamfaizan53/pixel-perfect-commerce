"""HHC catalog import from the portal's Shopify-style CSV export.

The CSV (`../shopify_products_export.csv`, ~52 MB, 9.8k products) has one row per
(product x variant x image). Columns:
  Handle, Title, Body (HTML), Product Tags, Published,
  Option1 Name, Option1 Value, Variant Price, Image Src, Image Position,
  Store, Status, Weight

Notes on the data:
  * "Body (HTML)" is plain text with U+2714 bullets, no tags.
  * "Product Tags" is actually a marketing description paragraph -> used as `excerpt`.
  * "Store" is a supplier code -> kept in source metadata, not shown.
  * Handles often end with a numeric HHC id (`-3764764`) -> `source.externalId`.
  * Images are stable supplier-CDN URLs -> referenced, not uploaded.

Usage:
    python -m app.importers.hhc_csv --ndjson products.ndjson          # generate NDJSON
    python -m app.importers.hhc_csv --ndjson products.ndjson --limit 50
    python -m app.importers.hhc_csv --stats                           # just print stats
then:
    cd ../studio && npx sanity dataset import ../backend/products.ndjson production --replace
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from collections import OrderedDict
from pathlib import Path
from typing import Any, Iterator

from slugify import slugify

csv.field_size_limit(10**7)

REPO_ROOT = Path(__file__).resolve().parents[3]
CSV_PATH = REPO_ROOT / "shopify_products_export.csv"
PORTAL = "hhc"

_ID_SUFFIX = re.compile(r"-(\d{4,})$")
_OPTION_NAME_FIX = {
    "colour": "Colour", "color": "Colour", "colors": "Colour", "colours": "Colour",
    "colourss": "Colour", "colours": "Colour", "shade": "Shade", "shades": "Shade",
    "size": "Size", "sizes": "Size", "pack": "Pack", "pack-of": "Pack", "packs": "Pack",
    "quantity": "Quantity", "qty": "Quantity", "type": "Type", "design": "Design",
    "designs": "Design", "flavor": "Flavour", "flavour": "Flavour", "flavours": "Flavour",
    "model": "Model", "weight": "Weight", "weights": "Weight",
}


def _clean_body(text: str) -> str:
    if not text:
        return ""
    # split the U+2714 bullet runs and known section headers into lines
    text = text.replace("✔", "\n✔ ")
    text = re.sub(r"(?<=[a-z])(?=[A-Z][a-z]+ (For|Sizes|Features|Uses|Includes)\b)", "\n\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _external_id(handle: str) -> str:
    m = _ID_SUFFIX.search(handle)
    return m.group(1) if m else "h_" + slugify(handle)[:60]


def _clean_slug(handle: str) -> str:
    s = _ID_SUFFIX.sub("", handle) or slugify(handle)
    if len(s) > 96:
        s = s[:96].rsplit("-", 1)[0]
    return s


def _first_sentences(text: str, n: int = 2, limit: int = 300) -> str:
    parts = re.split(r"(?<=[.!?])\s+", text.replace("\n", " ").strip())
    return " ".join(parts[:n])[:limit].strip()


def _fix_option_name(name: str) -> str:
    return _OPTION_NAME_FIX.get(name.strip().lower(), name.strip().title() or "Option")


def _doc_id(slug: str) -> str:
    return "product." + re.sub(r"[^a-zA-Z0-9_.-]", "-", slug)[:120]


def read_grouped() -> "OrderedDict[str, dict[str, Any]]":
    products: "OrderedDict[str, dict[str, Any]]" = OrderedDict()
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            handle = (row.get("Handle") or "").strip()
            if not handle:
                continue
            p = products.setdefault(
                handle,
                {
                    "handle": handle,
                    "title": (row.get("Title") or "").strip(),
                    "body": _clean_body(row.get("Body (HTML)") or ""),
                    "excerpt": (row.get("Product Tags") or "").strip()[:480],
                    "store": (row.get("Store") or "").strip(),
                    "option_name": "",
                    "images": {},       # position -> url
                    "variants": OrderedDict(),  # value -> price
                },
            )
            opt_name = (row.get("Option1 Name") or "").strip()
            opt_val = (row.get("Option1 Value") or "").strip()
            price = row.get("Variant Price") or "0"
            try:
                price_f = float(price)
            except ValueError:
                price_f = 0.0
            weight = row.get("Weight") or ""
            if weight and "weight_kg" not in p:
                try:
                    p["weight_kg"] = float(weight)
                except ValueError:
                    pass
            if opt_name:
                p["option_name"] = opt_name
            if opt_val:
                p["variants"].setdefault(opt_val, price_f)
            elif "base_price" not in p:
                p["base_price"] = price_f
            img = (row.get("Image Src") or "").strip()
            if img.startswith("http"):
                try:
                    pos = int(row.get("Image Position") or 0)
                except ValueError:
                    pos = len(p["images"]) + 1
                p["images"].setdefault(pos, img)
    return products


def to_sanity_doc(p: dict[str, Any]) -> dict[str, Any] | None:
    slug = _clean_slug(p["handle"])
    variants_raw = p["variants"]
    prices = [v for v in variants_raw.values() if v > 0]
    base_price = p.get("base_price") or (min(prices) if prices else 0.0)
    if base_price <= 0:
        return None  # skip zero-price junk

    # collapse the "TITLE - VARIANT" pattern to a clean base title
    title = p["title"]
    if variants_raw:
        for val in variants_raw:
            suffix = f" - {val}".upper()
            if title.upper().endswith(suffix):
                title = title[: -len(suffix)].rstrip(" -")
                break

    images = [p["images"][k] for k in sorted(p["images"])]
    excerpt = p["excerpt"] or _first_sentences(p["body"])

    doc: dict[str, Any] = {
        "_id": _doc_id(slug),
        "_type": "product",
        "title": title[:200] or slug,
        "slug": {"_type": "slug", "current": slug},
        "excerpt": excerpt,
        "price": round(base_price, 2),
        "inStock": True,
        "vendor": "AI Bazar",
        "imageUrls": images[:10],
        "source": {
            "_type": "externalSource",
            "portal": PORTAL,
            "externalId": _external_id(p["handle"]),
            "supplierCode": p["store"] or None,
        },
    }
    if p["weight_kg"] if "weight_kg" in p else None:
        doc["weightGrams"] = int(round(p["weight_kg"] * 1000))
    if p["body"]:
        # store as a single plain block; editors can enrich later
        doc["body"] = [
            {
                "_type": "block",
                "_key": "b0",
                "style": "normal",
                "children": [{"_type": "span", "_key": "s0", "text": line}],
            }
            for line in p["body"].split("\n")
            if line.strip()
        ][:60]

    if len(variants_raw) > 1:
        opt_name = _fix_option_name(p["option_name"] or "Option")
        doc["options"] = [{"_key": "opt0", "name": opt_name, "values": list(variants_raw)}]
        doc["variants"] = [
            {
                "_key": f"v{i}",
                "title": val,
                "price": round(price or base_price, 2),
                "inStock": True,
                "selectedOptions": [{"_key": "so", "name": opt_name, "value": val}],
            }
            for i, (val, price) in enumerate(variants_raw.items())
        ]
    return doc


def generate(limit: int | None = None) -> Iterator[dict[str, Any]]:
    for i, p in enumerate(read_grouped().values()):
        if limit and i >= limit:
            break
        doc = to_sanity_doc(p)
        if doc:
            yield doc


def _stats() -> None:
    products = read_grouped()
    total = len(products)
    with_variants = sum(1 for p in products.values() if len(p["variants"]) > 1)
    with_multi_img = sum(1 for p in products.values() if len(p["images"]) > 1)
    emitted = sum(1 for _ in generate())
    print(json.dumps({
        "csv_rows_grouped_to_products": total,
        "products_with_variants": with_variants,
        "products_with_multiple_images": with_multi_img,
        "documents_that_would_be_created": emitted,
        "skipped_zero_price": total - emitted,
    }, indent=2))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ndjson", type=str, help="write NDJSON to this path")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--stats", action="store_true")
    args = ap.parse_args()

    if args.stats or not args.ndjson:
        _stats()
        return

    n = 0
    with open(args.ndjson, "w", encoding="utf-8") as out:
        for doc in generate(args.limit):
            out.write(json.dumps(doc, ensure_ascii=False) + "\n")
            n += 1
    print(f"wrote {n} documents -> {args.ndjson}")


if __name__ == "__main__":
    main()
