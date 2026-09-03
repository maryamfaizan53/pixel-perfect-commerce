"""Build Sanity CDN image URLs with transforms.

The frontend's <OptimizedImage> already understands `cdn.sanity.io` URLs with
`?w=&q=&fm=webp&auto=format`, so the API just returns the base asset URL and
lets the client size it. These helpers are for server-side needs (OG images,
Portable Text inline images, sitemaps).
"""
from __future__ import annotations

from typing import Any


def _asset_ref(node: dict[str, Any]) -> str | None:
    asset = node.get("asset") or node
    if isinstance(asset, dict):
        return asset.get("_ref") or asset.get("url")
    return None


def image_url(node: dict[str, Any] | None, *, width: int | None = None, quality: int = 75) -> str | None:
    """Accepts either an already-resolved {url: ...} or a raw image node with asset._ref."""
    if not node:
        return None
    if node.get("url"):
        base = node["url"]
    else:
        ref = _asset_ref(node)
        if not ref or not ref.startswith("image-"):
            return ref
        # image-<id>-<w>x<h>-<fmt>
        _, image_id, dims, fmt = ref.split("-", 3)
        # projectId/dataset come from the resolved url normally; raw refs are rare here
        base = f"https://cdn.sanity.io/images/_/_/{image_id}-{dims}.{fmt}"
    params = ["auto=format"]
    if width:
        params.append(f"w={width}")
    params.append(f"q={quality}")
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}{'&'.join(params)}"
