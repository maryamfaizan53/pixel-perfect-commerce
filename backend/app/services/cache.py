"""Tiny in-process async TTL cache for catalog reads.

Single-instance only. Swap for Redis when the backend scales horizontally.
`bust()` is called by the Sanity publish webhook.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any, Awaitable, Callable

from app.config import settings

_store: dict[str, tuple[float, Any]] = {}
_locks: dict[str, asyncio.Lock] = {}


async def cached(key: str, producer: Callable[[], Awaitable[Any]], ttl: int | None = None) -> Any:
    ttl = ttl if ttl is not None else settings.catalog_cache_ttl
    now = time.monotonic()
    hit = _store.get(key)
    if hit and hit[0] > now:
        return hit[1]

    lock = _locks.setdefault(key, asyncio.Lock())
    async with lock:
        hit = _store.get(key)
        if hit and hit[0] > time.monotonic():
            return hit[1]
        value = await producer()
        _store[key] = (time.monotonic() + ttl, value)
        return value


def bust(prefix: str | None = None) -> int:
    if prefix is None:
        n = len(_store)
        _store.clear()
        return n
    keys = [k for k in _store if k.startswith(prefix)]
    for k in keys:
        _store.pop(k, None)
    return len(keys)
