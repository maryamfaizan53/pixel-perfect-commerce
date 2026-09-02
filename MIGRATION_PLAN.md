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
- ⬜ `sanity init` + project created, tokens issued
- ⬜ `backend/` FastAPI skeleton: config, Sanity client, Supabase client, CORS, JWT auth dep, health, Railway `Procfile`/`railway.json`
- ⬜ Move `chatbot/main.py` → `backend/app/routers/chat.py` (keep behaviour)

### Phase 1 — Catalog read path
- ⬜ `backend/app/routers/catalog.py`: `GET /products`, `/products/{slug}`, `/categories`, `/categories/{slug}`, `/products/search?q=`, `/home` (featured categories + rows)
- ⬜ GROQ queries (`backend/app/sanity/queries.py`) + response DTOs (Pydantic) matching the frontend's needs
- ⬜ In-process TTL cache + `POST /revalidate` (Sanity webhook target)
- ⬜ Overlay review aggregates from Supabase (`product_reviews` grouped by `product_id`)
- ⬜ Frontend: delete `src/lib/shopify.ts`; add `src/lib/api.ts` (typed fetch client) + `src/types/catalog.ts`
- ⬜ Rewire consumers: `ProductCard`, `HeroCategories`, `CategoryGrid`, `CategoryProductRow`, `FeaturedProducts`, `SearchOverlay`, `ProductQuickView`, `Index`, `CategoryPage`, `ProductPage`, `Wishlist`
- ⬜ `src/lib/meta-pixel.ts`: drop `formatProductId` GID parsing → plain IDs
- ⬜ `OptimizedImage`: add Sanity CDN (`cdn.sanity.io`) URL transforms (`?w=&q=&fm=webp&auto=format`) alongside the existing Shopify/Unsplash handling
- ⬜ Build scripts: `generate_sitemap.cjs` + `generate_static_html.cjs` read from the API, not Shopify

### Phase 2 — Import pipeline
- ⬜ `backend/app/importers/shopify_seed.py` — one-off: Shopify export → Sanity (seed the 215 current products, upload images to Sanity assets)
- ⬜ `backend/app/importers/hhc.py` — the wholesaler sync: fetch → normalise → upsert by `source.externalId`, honour `lockedFields`, report added/updated/skipped
- ⬜ `POST /admin/import/hhc` (admin-token guarded) + optional Railway cron
- ⬜ Studio: import-run log surfaced (or just structured logs first)

### Phase 3 — Cart, checkout, orders
- ⬜ Supabase migration: de-Shopify `orders` / `order_items`
  - `orders`: drop `shopify_order_id`/`shopify_order_number`; add `order_number` (generated `AB-XXXXXX`), `payment_method` (`cod`|`online`), `payment_status`, `payment_provider`, `payment_ref`, `notes`
  - `order_items`: `shopify_product_id` → `product_id` (Sanity `_id`), `shopify_variant_id` → `variant_key`
- ⬜ `backend/app/routers/checkout.py`:
  - `POST /checkout/quote` — revalidate cart lines against Sanity price + stock, compute shipping (siteSettings), return totals
  - `POST /orders` — COD: create order in Supabase, send WhatsApp/email confirmation, clear-cart signal
  - `POST /payments/safepay/session` — online: create Safepay checkout session, return redirect URL
  - `POST /webhooks/safepay` — verify signature, mark order paid, fulfil
- ⬜ Frontend: `src/stores/cartStore.ts` → `createCheckout` calls the API; new `/checkout` route (address + method); `src/pages/CartPage.tsx` wired; `OrderDetails` / `useOrders` updated to new columns
- ⬜ Guest checkout kept (nullable `user_id`)

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
