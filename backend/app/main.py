"""AI Bazar API — single backend for the storefront.

Serves the catalog (from Sanity, cached), checkout/orders (Supabase + Safepay),
admin import triggers, and SEO slug lists. The AI chatbot from ../chatbot is
folded in under /api/chat (see routers/chat.py).
"""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, catalog, checkout, seo

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="AI Bazar API",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["authorization", "content-type", "x-admin-token"],
)

app.include_router(catalog.router)
app.include_router(checkout.router)
app.include_router(admin.router)
app.include_router(seo.router)

# Optional: AI chatbot. Import lazily so a missing AI key doesn't break the app.
try:
    from app.routers import chat  # noqa: E402

    app.include_router(chat.router)
except Exception as exc:  # noqa: BLE001
    logging.warning("chat router not mounted: %s", exc)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "environment": settings.environment,
        "sanity": bool(settings.sanity_project_id),
        "supabase": bool(settings.supabase_url),
        "payments": bool(settings.safepay_api_key),
    }


@app.get("/")
async def root():
    return {"service": "aibazar-api", "docs": "/docs"}
