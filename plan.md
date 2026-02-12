# SEO Optimization Plan - Google + AI/LLM Search Ranking

## PRIORITY 1: CRITICAL (Direct Ranking Impact)

### 1.1 Fix robots.txt - Allow AI Crawlers Explicitly
**File**: `public/robots.txt`
**Why**: AI search engines (ChatGPT, Perplexity, Gemini, Claude) won't index the site unless their crawlers are explicitly allowed. Currently only has Googlebot, Bingbot, and wildcard.
**Change**: Add explicit User-agent rules for:
- `GPTBot` (ChatGPT/OpenAI search)
- `ChatGPT-User` (ChatGPT browsing)
- `Google-Extended` (Gemini AI)
- `PerplexityBot` (Perplexity AI)
- `ClaudeBot` / `anthropic-ai` (Claude)
- `Applebot-Extended` (Apple Intelligence/Siri)
- `Bytespider` (TikTok search)
- `cohere-ai` (Cohere)
- All with Allow: / and same Disallow rules as existing
- Add explicit references to llms.txt, llms-full.txt, llms-products.txt

### 1.2 Fix Organization Schema sameAs URLs
**File**: `index.html` (lines 87-91)
**Why**: Google uses sameAs to verify social profiles. Wrong URLs mean zero social signals.
**Change**: Fix from:
```
"https://facebook.com/aibazar.pk" -> "https://www.facebook.com/aibazar"
"https://instagram.com/aibazar.pk" -> "https://www.instagram.com/aibazar"
"https://tiktok.com/@aibazar.pk" -> "https://www.tiktok.com/@aibazar_pk"
```
Add YouTube: `"https://www.youtube.com/@aibazarpk"`

### 1.3 Add useSEO to 8 Missing Pages
**Files**: About.tsx, Contact.tsx, Help.tsx, Privacy.tsx, Terms.tsx, Returns.tsx, Shipping.tsx, AllCategories.tsx
**Why**: These pages appear in the sitemap but have NO meta tags, no canonical, no OG tags. Google indexes them with default/empty meta tags = poor ranking signal.
**Change**: Add `useSEO()` call to each page with proper title, description, keywords, and canonical URL. Example for About:
```ts
useSEO({
  title: "About AI Bazar - Pakistan's Most Affordable Online Store",
  description: "Learn about AI Bazar, Pakistan's trusted online store for original electronics, beauty, kitchen & home products at lowest prices with free shipping.",
  keywords: "about aibazar, online store pakistan, who is aibazar",
  canonical: "https://www.aibazar.pk/about"
});
```

### 1.4 Re-sync llms-products.txt with Rich Data
**Action**: Run `node sync_ai_manifests.cjs`
**Why**: Current llms-products.txt has bare links with no prices/descriptions (old format). The sync script already generates rich output with prices, status, categories, descriptions, and tags - but it hasn't been run since the script was updated. This is the #1 factor for AI search ranking - rich product context.

## PRIORITY 2: HIGH (Significant Ranking Boost)

### 2.1 Add Cache Headers for AI Manifest Files
**File**: `netlify.toml`
**Why**: AI crawlers need proper Content-Type and caching headers to process llms.txt files correctly.
**Change**: Add headers for llms.txt, llms-full.txt, llms-products.txt:
```toml
[[headers]]
  for = "/llms.txt"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8"
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/llms-full.txt"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8"
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/llms-products.txt"
  [headers.values]
    Content-Type = "text/plain; charset=utf-8"
    Cache-Control = "public, max-age=86400"
```

### 2.2 Add /help and /track-order to Sitemap Generator
**File**: `generate_sitemap.cjs`
**Why**: /help (FAQ page) and /track-order are missing from sitemap = invisible to Google.
**Change**: Add to staticPages array:
```js
{ path: '/help', changefreq: 'monthly', priority: '0.6' },
{ path: '/track-order', changefreq: 'monthly', priority: '0.4' },
```

### 2.3 Add Telephone to Organization Schema
**File**: `index.html`
**Why**: Google uses telephone in Organization schema for Knowledge Panel and business verification.
**Change**: Add `"telephone": "+92-332-8222026"` to Organization schema.

## SUMMARY OF ALL FILES TO MODIFY

1. `public/robots.txt` - Add AI crawler rules
2. `index.html` - Fix sameAs URLs, add telephone to Organization
3. `netlify.toml` - Add llms.txt cache headers
4. `src/pages/About.tsx` - Add useSEO
5. `src/pages/Contact.tsx` - Add useSEO
6. `src/pages/Help.tsx` - Add useSEO
7. `src/pages/Privacy.tsx` - Add useSEO
8. `src/pages/Terms.tsx` - Add useSEO
9. `src/pages/Returns.tsx` - Add useSEO
10. `src/pages/Shipping.tsx` - Add useSEO
11. `src/pages/AllCategories.tsx` - Add useSEO
12. `generate_sitemap.cjs` - Add /help and /track-order
13. Run `node sync_ai_manifests.cjs` to regenerate llms-products.txt with rich data
