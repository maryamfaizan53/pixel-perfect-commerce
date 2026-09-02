"""Thin async Sanity HTTP client — GROQ reads + transaction mutations."""
from __future__ import annotations

import json
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings


class SanityError(RuntimeError):
    pass


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.3, max=3), reraise=True)
async def query(groq: str, params: dict[str, Any] | None = None) -> Any:
    """Run a GROQ query. Uses the CDN endpoint unless disabled."""
    url = f"{settings.sanity_query_host}/data/query/{settings.sanity_dataset}"
    q: dict[str, str] = {"query": groq}
    for key, value in (params or {}).items():
        q[f"${key}"] = json.dumps(value)

    headers = {}
    if settings.sanity_read_token:
        headers["Authorization"] = f"Bearer {settings.sanity_read_token}"

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=q, headers=headers)
    if resp.status_code != 200:
        raise SanityError(f"Sanity query {resp.status_code}: {resp.text[:300]}")
    return resp.json().get("result")


async def mutate(mutations: list[dict[str, Any]], *, return_ids: bool = True) -> dict[str, Any]:
    """Apply a transaction of mutations with the write token. Imports only."""
    if not settings.sanity_write_token:
        raise SanityError("SANITY_WRITE_TOKEN is not configured")
    url = f"{settings.sanity_mutate_host}/data/mutate/{settings.sanity_dataset}"
    params = {"returnIds": "true" if return_ids else "false"}
    headers = {
        "Authorization": f"Bearer {settings.sanity_write_token}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, params=params, headers=headers, json={"mutations": mutations})
    if resp.status_code != 200:
        raise SanityError(f"Sanity mutate {resp.status_code}: {resp.text[:500]}")
    return resp.json()


async def upload_asset(data: bytes, *, filename: str, content_type: str) -> dict[str, Any]:
    """Upload an image/file to Sanity's asset store, return the asset doc."""
    if not settings.sanity_write_token:
        raise SanityError("SANITY_WRITE_TOKEN is not configured")
    kind = "images" if content_type.startswith("image/") else "files"
    url = f"{settings.sanity_mutate_host}/assets/{kind}/{settings.sanity_dataset}"
    headers = {
        "Authorization": f"Bearer {settings.sanity_write_token}",
        "Content-Type": content_type,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, params={"filename": filename}, headers=headers, content=data)
    if resp.status_code not in (200, 201):
        raise SanityError(f"Sanity asset upload {resp.status_code}: {resp.text[:300]}")
    return resp.json()["document"]
