# AI Bazar — Shopify → Sanity + FastAPI migration

Status legend: ✅ done · 🚧 in progress · ⛔ blocked (needs input) · ⬜ not started

---

## Target architecture

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────────┐
│  React SPA      │ ──────────────────▶ │  FastAPI backend     │
│  (Vite, Vercel) │ ◀────────────────── │  (Railway)           │
│  aibazar.pk     │                     │  api.aibazar.pk      │
└─────────────────┘                     └───────┬──────┬───────┘
        │                                       │      │
        │ Supabase JS (auth only)               │      │
        ▼                                       ▼      ▼
┌─────────────────┐              ┌───────────────────┐ ┌──────────────────┐
│  Supabase       │ ◀────────────│  Sanity (content) │ │ Safepay (payments)│
│  auth · orders  │  service key │  products·category│ │ COD is default    │
│  reviews·wishlist│             │  siteSettings     │ └──────────────────┘
└─────────────────┘              └───────────────────┘
                                          ▲
                                          │ write token
                                 ┌────────┴─────────┐
                                 │ HHC import job   │
                                 │ (in FastAPI)     │
                                 └──────────────────┘
```

**Principles**
- The frontend has **one** data source: the FastAPI API. No direct Sanity or Shopify calls from the browser. (Supabase JS stays only for the auth session.)
- Sanity is the **catalog of record**. FastAPI reads it (cached), overlays live data from Supabase (review counts/ratings, and later real-time stock), and returns a stable DTO.
- Orders/checkout/payments are **owned by FastAPI + Supabase**. Sanity never sees an order.
- The HHC wholesaler sync is a backend job that upserts into Sanity and never clobbers manual Studio edits (`source.lockedFields`).

---

## Decisions

| Question | Decision |
|---|---|
| CMS | **Sanity** (`studio/`) |
| Backend | **Python FastAPI** (`backend/`, absorbs the existing `chatbot/`) |
| Backend host | **Railway** (persistent container; import job + RAG need it) |
| Frontend host | **Vercel** (unchanged) |
| Payments | **Safepay** for online + **COD** default. ⛔ needs merchant account + keys |
| Currency | PKR only |
| Blog | unchanged — stays in `src/data/generatedBlogData.ts` |
| Auth | Supabase (unchanged) |

---

## Blocked on you (⛔)

1. **Shopify store `0thtqz-bs`** — Storefront API token **or** a Products CSV export, so the real
   product shape (variants / multi-image / video) can be locked in and used to seed Sanity.
2. **HHC wholesaler portal** — credentials + how products come out (API / CSV / scrape) → drives `backend/app/importers/hhc.py`.
3. **Safepay** — merchant account, then sandbox API key + secret + webhook secret.
4. **Sanity** — run `cd studio && npx sanity init` (creates the project) and paste back the project ID + read/write tokens. *(Or I can guide you live.)*
5. **Railway** — account, then a project token so deploys can be automated.

---

## Phases

### Phase 0 — Foundations
- ✅ Sanity schema (`studio/`): product, category, siteSettings, variant/option/video/seo/source/blockContent objects, desk structure, singleton guard
- ⛔ `sanity init` + project created, tokens issued *(needs you)*
- ✅ `backend/` FastAPI skeleton: config, Sanity client (query/mutate/asset-upload), Supabase client, CORS, JWT auth dep, admin-token guard, `/health`, Railway `Procfile`/`railway.json`/`runtime.txt`
- ✅ `chatbot/main.py` → `backend/app/routers/chat.py` (Gemini/OpenAI + pgvector RAG + per-user rate limit, catalog-aware system prompt)

### Phase 1 — Catalog read path
- ✅ `backend/app/routers/catalog.py`: `/api/products`, `/products/{slug}`, `/products/{slug}/related`, `/products/search`, `/categories`, `/categories/{slug}`, `/home`, `/site-settings`
- ✅ GROQ queries (`backend/app/sanity/queries.py`) + Pydantic DTOs (`schemas/catalog.py`) + `mapper.py` + Portable-Text→HTML
- ✅ In-process TTL cache (`services/cache.py`) + `POST /api/admin/revalidate` (Sanity webhook target)
- ✅ Overlay review aggregates from Supabase (`services/supabase_client.review_aggregates`)
- ✅ Frontend: `src/lib/api.ts` (typed fetch client, attaches Supabase session) + `src/types/catalog.ts`
- ⬜ Delete `src/lib/shopify.ts`; rewire consumers: `ProductCard`, `HeroCategories`, `CategoryGrid`, `CategoryProductRow`, `FeaturedProducts`, `SearchOverlay`, `ProductQuickView`, `Index`, `CategoryPage`, `ProductPage`, `Wishlist` *(needs a live API to test against → after `sanity init` + seed)*
- ⬜ `src/lib/meta-pixel.ts`: drop `formatProductId` GID parsing → plain IDs
- ⬜ `OptimizedImage`: add Sanity CDN (`cdn.sanity.io`) URL transforms (`?w=&q=&fm=webp&auto=format`) alongside the existing Shopify/Unsplash handling
- ⬜ Build scripts: `generate_sitemap.cjs` + `generate_static_html.cjs` read from the API, not Shopify

### Phase 2 — Import pipeline
- ✅ `backend/app/importers/base.py` — normalise → upload images to Sanity assets → upsert by `source.externalId`, honours `source.lockedFields`, added/updated/skipped/failed report
- ✅ `backend/app/importers/shopify_seed.py` — one-off: `../all_products_details.json` + `image_mapping.json` + `cols.json` → Sanity (215 products + 31 categories). **Ready to run once `SANITY_WRITE_TOKEN` exists.**
- ⛔ `backend/app/importers/hhc.py` — wired end-to-end **except** `fetch_source_products()` / `normalise()` field names *(needs portal access)*
- ✅ `POST /api/admin/import/hhc` (+ status endpoint), background job runner
- ⬜ Railway cron for scheduled HHC sync

### Phase 3 — Cart, checkout, orders
- ✅ Supabase migration `20260902211630_decouple_shopify_add_payments.sql` — `order_number` (`AB-100001…` via `next_order_number()`), `payment_method`/`payment_status`/`payment_provider`/`payment_ref`, `shipping_fee`, `notes`; `order_items.product_id`/`product_slug`/`variant_key`; Shopify columns made nullable; RLS: backend (service key) writes, users SELECT own. **Not yet applied to the DB.**
- ✅ `backend/app/routers/checkout.py` + `services/pricing.py` (server-authoritative re-quote) + `services/safepay.py` (stub):
  - `POST /api/checkout/quote` — re-price against Sanity, compute shipping from siteSettings
  - `POST /api/checkout/orders` — COD: order + items into Supabase; online: create Safepay session → `redirectUrl`
  - `POST /api/checkout/webhooks/safepay` — signature verify → mark paid/confirmed
- ✅ Frontend: `src/lib/api.ts` `getQuote()` / `createOrder()`
- ⬜ `src/stores/cartStore.ts` → `createCheckout` calls the API; new `/checkout` route (address + method); `CartPage`, `OrderDetails`, `useOrders` updated to new columns
- ⬜ COD order confirmation (WhatsApp/email) — needs a messaging provider
- ✅ Guest checkout kept (nullable `user_id`, `optional_user` dep)

### Phase 4 — Studio & ops
- ⬜ Deploy Studio (`sanity deploy` → `aibazar.sanity.studio`) or embed at `/studio`
- ⬜ Seed `siteSettings` + categories, run the Shopify seed importer
- ⬜ Backend deployed to Railway, `api.aibazar.pk` DNS
- ⬜ Frontend env: `VITE_API_URL=https://api.aibazar.pk`
- ⬜ Remove dead code: `HeroCarousel.tsx`, `HomeHero.tsx`, root scraper scripts (`get_*.js`, `batch*_images.json`, …), `chatbot/`
- ⬜ Redeploy the whole thing to a working Vercel account, move `aibazar.pk`

### Phase 5 — QA
- ⬜ Full walkthrough at 390/768/1280; Lighthouse; order E2E (COD + Safepay sandbox); SEO/sitemap parity check

---

## Frontend product DTO (what the API returns, what components consume)

```ts
type Product = {
  id: string;                 // Sanity _id
  slug: string;               // was "handle"
  title: string;
  excerpt: string;
  bodyHtml: string | null;    // Portable Text → HTML, server-rendered
  productType: string;
  vendor: string;
  tags: string[];
  categories: { slug: string; title: string }[];
  price: number;              // PKR, number (not string)
  compareAtPrice: number | null;
  currency: 'PKR';
  inStock: boolean;
  sku: string | null;
  images: { url: string; alt: string; width: number; height: number }[];
  videos: { kind: 'file' | 'external'; url: string; poster: string | null }[];
  options: { name: string; values: string[] }[];
  variants: {
    key: string; title: string; price: number; compareAtPrice: number | null;
    inStock: boolean; selectedOptions: { name: string; value: string }[];
    image: string | null;
  }[];
  rating: { average: number; count: number } | null;   // overlaid from Supabase
  seo: { title: string | null; description: string | null; ogImage: string | null };
};
```
A thin `mapProduct()` in the backend produces this from GROQ so the React
components change as little as possible (mostly: `node.` unwrapping, `handle`→`slug`,
string prices → numbers).
