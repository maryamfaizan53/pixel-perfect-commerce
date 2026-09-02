"""Minimal Portable Text -> HTML renderer.

Covers the subset our blockContent schema allows: block styles (normal/h2-h4/
blockquote), bullet/number lists, strong/em marks, link annotations, and
inline images. Good enough for product / category descriptions; swap for a
full library later if the content gets richer.
"""
from __future__ import annotations

import html
from typing import Any

from app.sanity.image import image_url

_STYLE_TAG = {
    "normal": "p",
    "h2": "h2",
    "h3": "h3",
    "h4": "h4",
    "blockquote": "blockquote",
}


def _render_spans(block: dict[str, Any]) -> str:
    mark_defs = {m["_key"]: m for m in block.get("markDefs", [])}
    out: list[str] = []
    for span in block.get("children", []):
        if span.get("_type") != "span":
            continue
        text = html.escape(span.get("text", ""))
        for mark in span.get("marks", []):
            if mark == "strong":
                text = f"<strong>{text}</strong>"
            elif mark == "em":
                text = f"<em>{text}</em>"
            elif mark in mark_defs and mark_defs[mark].get("_type") == "link":
                href = html.escape(mark_defs[mark].get("href", "#"))
                rel = "" if href.startswith("/") else ' rel="noopener" target="_blank"'
                text = f'<a href="{href}"{rel}>{text}</a>'
        out.append(text)
    return "".join(out)


def to_html(blocks: list[dict[str, Any]] | None) -> str:
    if not blocks:
        return ""
    parts: list[str] = []
    list_stack: list[str] = []  # 'ul' | 'ol'

    def close_lists(down_to: int = 0) -> None:
        while len(list_stack) > down_to:
            parts.append(f"</{list_stack.pop()}>")

    for block in blocks:
        btype = block.get("_type")
        if btype == "image":
            close_lists()
            url = image_url(block, width=1000)
            alt = html.escape(block.get("alt", ""))
            if url:
                parts.append(f'<img src="{url}" alt="{alt}" loading="lazy" />')
            continue
        if btype != "block":
            continue

        list_item = block.get("listItem")
        if list_item:
            tag = "ul" if list_item == "bullet" else "ol"
            if not list_stack or list_stack[-1] != tag:
                close_lists()
                parts.append(f"<{tag}>")
                list_stack.append(tag)
            parts.append(f"<li>{_render_spans(block)}</li>")
        else:
            close_lists()
            tag = _STYLE_TAG.get(block.get("style", "normal"), "p")
            parts.append(f"<{tag}>{_render_spans(block)}</{tag}>")

    close_lists()
    return "".join(parts)
