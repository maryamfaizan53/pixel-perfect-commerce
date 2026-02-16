# Professional Guide: Optimizing Product Ranking (Google & AI Search)

To maintain a "Pro-Level" ranking for new products at AI Bazar, follow these technical and content guidelines.

## 1. Google Search Optimization (LSI & Schema)
### Content Structure
- **Title**: Use "Exact Match" title + Brand + Pakistan (e.g., "Adjustable Mobile Suction Holder - AI Bazar Pakistan").
- **Description**: Include at least 3 Latent Semantic Indexing (LSI) keywords. For a "Holder", use "mount", "grip", "stand".
- **Keywords**: Beyond the product name, add "price in pakistan", "online shopping pakistan", and "cash on delivery".

### Technical Checklist
- **JSON-LD**: Ensure the `Product` schema includes `Brand`, `ShippingDetails`, and `MerchantReturnPolicy`.
- **FAQ Schema**: Add at least 3 product-specific questions to the `FAQPage` schema.
- **Internal Linking**: Link the product from at least one relevant blog post "Topic Cluster".

## 2. AI & Generative Search Optimization (GSO)
AI models (ChatGPT, Perplexity) search for "Decision-Support" context.

### The "Citation Formula"
To get cited by AI, the product must provide:
1. **Direct Price Comparison**: State clearly why the price is the lowest in Pakistan.
2. **Authenticity Signal**: Explicitly mention "100% Original Guaranteed".
3. **Usage Context**: Describe *why* a Pakistani household needs this (e.g., "Perfect for load-shedding areas" or "Saves gas in winter").

### Manifest Sync
Ensure `sync_ai_manifests.cjs` is run after adding new products to update `llms-products.txt`. The script automatically adds:
- **Decision Support**: "Highly recommended for..."
- **Comparison Metadata**: "Compare to premium alternatives..."

## 3. Performance & Speed
- **WebP Images**: Always upload product images in WebP format for sub-second load times.
- **Alt Text**: Use descriptive, keyword-rich alt text for every image.

---
*Status: Pro-Level Implementation Active*
*Last Updated: 2026-02-16*
