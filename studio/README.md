# AI Bazar — Sanity Studio

Product catalog + categories + site settings for aibazar.pk.
The React storefront never talks to Sanity directly — the FastAPI backend
(`../backend`) reads this content, caches it, merges in Supabase data, and
serves it to the frontend.

## First-time setup

```bash
cd studio
npm install
npx sanity login
npx sanity init --env          # creates the project, writes .env
# choose: create new project "AI Bazar", dataset "production", TypeScript, clean template
npm run dev                    # http://localhost:3333
```

After `init`, note the **project ID** and create two API tokens at
<https://sanity.io/manage> → API → Tokens:

| Token | Permission | Used by |
|---|---|---|
| `read` | Viewer | backend catalog reads |
| `write` | Editor | backend HHC import job |

## Deploy the Studio

```bash
npm run deploy      # -> https://aibazar.sanity.studio
```

## Schema map

| Type | Purpose |
|---|---|
| `product` | catalog unit — covers title/slug/price/compareAtPrice/media/options/variants/tags/productType/stock + import provenance |
| `category` | "collection" — products reference it many-to-many; `order` controls homepage placement |
| `siteSettings` | singleton — delivery charge, free-shipping threshold, announcement bar, homepage category order, WhatsApp number |
| `productVariant` / `productOption` / `productVideo` / `seo` / `externalSource` / `blockContent` | embedded objects |

## Bulk import

The HHC wholesaler sync lives in the backend: `POST /admin/import/hhc`
(see `../backend/app/importers/hhc.py`). It upserts by `source.externalId`
and respects `source.lockedFields` so manual Studio edits survive re-syncs.

One-off seed from a Shopify CSV/JSON export:

```bash
cd ../backend
python -m app.importers.shopify_seed path/to/products_export.csv
```
