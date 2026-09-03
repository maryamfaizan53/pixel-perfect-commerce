# AI Bazar — Backend (FastAPI)

The single API the storefront talks to. Reads the catalog from **Sanity**
(cached), overlays review data from **Supabase**, owns **checkout/orders**
(COD + Safepay), runs the **HHC import**, and serves the **AI chatbot**.

```
app/
  main.py            app wiring + CORS + /health
  config.py          env settings
  deps.py            Supabase-JWT auth + admin-token guard
  sanity/            client (query/mutate/upload) · GROQ queries · DTO mapper · Portable Text→HTML
  schemas/           Pydantic request/response models
  routers/
    catalog.py       GET /api/products, /api/products/{slug}, /api/categories, /api/home, /api/site-settings, search, related
    checkout.py      POST /api/checkout/quote, /api/checkout/orders, Safepay webhook
    admin.py         POST /api/admin/revalidate, /api/admin/import/hhc   (X-Admin-Token)
    seo.py           GET /api/seo/slugs   (for the frontend build scripts)
    chat.py          POST /api/chat   (ported from ../chatbot)
  services/          cache (TTL) · supabase client · pricing (server-authoritative) · safepay
  importers/
    base.py          normalise → upsert to Sanity, honours source.lockedFields
    shopify_seed.py  one-off: ../all_products_details.json → Sanity   ✅ ready
    hhc.py           wholesaler portal sync                            ⛔ needs portal access
```

## Local dev

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # (.venv/bin/activate on mac/linux)
pip install -r requirements.txt
cp .env.example .env          # fill in Sanity + Supabase values
uvicorn app.main:app --reload --port 8000
# http://localhost:8000/docs
```

## Seed Sanity from the scraped catalog

```bash
python -m app.importers.shopify_seed --dry-run     # preview
python -m app.importers.shopify_seed               # 215 products + 31 categories
```

## Deploy (Railway)

```bash
railway init         # or link an existing project
railway up
railway variables set SANITY_PROJECT_ID=... SANITY_READ_TOKEN=... ...
```
Point `api.aibazar.pk` at the Railway domain. Set the frontend's
`VITE_API_URL=https://api.aibazar.pk`.

## Env vars

See `.env.example`. Required to boot: `SANITY_PROJECT_ID`, `SANITY_READ_TOKEN`,
`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET`, `ADMIN_API_TOKEN`.
`SANITY_WRITE_TOKEN` is import-only. `SAFEPAY_*` unlocks online payments.
