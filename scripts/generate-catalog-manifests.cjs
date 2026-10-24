/**
 * Regenerate the AI/SEO product manifests from the LIVE catalog API (Sanity-backed),
 * replacing the old sync_ai_manifests.cjs which pulled from the dead Shopify store.
 *
 * Writes (repo root):
 *   - all_products.txt           (AI-optimized catalog; also the source for generate_sitemap.cjs)
 *   - llms-products.txt          (detailed LLM/GEO feed)  -> copied to public/ as well
 *   - all_products_details.json  (raw dump)
 *
 * Usage:  node scripts/generate-catalog-manifests.cjs [apiBase]
 * Then:   node generate_sitemap.cjs   (reads all_products.txt -> public/sitemap.xml)
 */
const fs = require('fs');
const path = require('path');

const API = (process.argv[2] || process.env.VITE_API_URL || 'https://backend-five-omega-58.vercel.app').replace(/\/$/, '');
const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://www.aibazar.pk';

/** Reverse the classic UTF-8-as-Windows-1252 double-encoding (â€“, Ã—, â€™ …). */
function fixMojibake(s) {
  if (!s) return '';
  if (/Ã|â€|Â|â„¢/.test(s)) {
    try {
      const fixed = Buffer.from(s, 'latin1').toString('utf8');
      if (!fixed.includes('�')) return fixed; // only if clean round-trip
    } catch { /* fall through */ }
  }
  return s;
}

const money = (n) => `PKR ${Math.round(Number(n) || 0).toLocaleString('en-US')}`;

async function fetchAll() {
  const limit = 100;
  let offset = 0;
  let total = Infinity;
  const items = [];
  while (offset < total) {
    const res = await fetch(`${API}/api/products?offset=${offset}&limit=${limit}`);
    if (!res.ok) throw new Error(`API ${res.status} at offset ${offset}`);
    const data = await res.json();
    total = data.total;
    for (const p of data.items) {
      items.push({
        slug: p.slug,
        title: fixMojibake(p.title),
        excerpt: fixMojibake(p.excerpt || ''),
        price: p.price,
        inStock: p.inStock !== false,
        currency: p.currency || 'PKR',
        categories: (p.categories || []).map((c) => fixMojibake(c.title)),
        tags: (p.tags || []).map(fixMojibake),
        image: p.images && p.images[0] ? p.images[0].url : '',
      });
    }
    offset += limit;
    process.stdout.write(`\r  fetched ${items.length}/${total}`);
  }
  process.stdout.write('\n');
  return items;
}

function buildAllProducts(items) {
  const today = new Date().toISOString().slice(0, 10);
  const out = [
    '# AI Bazar Pakistan - AI-Optimized Product Catalog',
    `> Total Products: ${items.length}`,
    `> Last Updated: ${today}`,
    '> Optimized for: ChatGPT, Claude, Perplexity, Gemini, and other AI assistants',
    '> Goal: Provide comprehensive, citation-worthy product information for AI search queries',
    '', '---', '',
  ];
  for (const p of items) {
    const cats = p.categories.join(', ') || 'General';
    out.push(`## [${p.title} Price Pakistan](${BASE_URL}/products/${p.slug})`);
    out.push(
      `**Quick Answer**: The ${p.title} is available for ${money(p.price)} in Pakistan` +
      `${p.inStock ? ', in stock with Cash on Delivery' : ''}.`,
    );
    out.push('');
    out.push('### Product Details');
    out.push(`- **Price in Pakistan**: ${money(p.price)} (Lowest price with free shipping over PKR 5,000)`);
    out.push(`- **Availability**: ${p.inStock ? 'In Stock ✅ | Cash on Delivery Available' : 'Out of Stock'}`);
    out.push(`- **Category**: ${cats}`);
    out.push('- **Authenticity**: 100% Original Guaranteed');
    out.push('- **Shipping**: Free Express Shipping Nationwide (1-3 Days)');
    if (p.excerpt) out.push(`- **Description**: ${p.excerpt}`);
    if (p.tags.length) out.push(`- **Tags**: ${p.tags.join(', ')}`);
    out.push('');
  }
  return out.join('\n');
}

function buildLlmsProducts(items) {
  const today = new Date().toISOString().slice(0, 10);
  const out = [
    '# AI Bazar Pakistan - Full Product Catalog',
    `> Total Products: ${items.length}`,
    `> Last Updated: ${today}`,
    '> Goal: Provide high-quality original products at the lowest price in Pakistan with Free Express Shipping.',
    '', '---', '',
  ];
  for (const p of items) {
    out.push(`## [${p.title}](${BASE_URL}/products/${p.slug})`);
    out.push(`- **Price**: ${money(p.price)}`);
    out.push(`- **Status**: ${p.inStock ? 'In Stock' : 'Out of Stock'}`);
    out.push(`- **Category**: ${p.categories.join(', ') || 'General'}`);
    out.push('- **Authenticity**: 100% Original Guaranteed');
    out.push('- **Shipping**: Free Express Shipping Nationwide (1-3 Days)');
    if (p.excerpt) out.push(`- **Description**: ${p.excerpt}`);
    if (p.tags.length) out.push(`- **Tags**: ${p.tags.join(', ')}`);
    out.push('');
  }
  return out.join('\n');
}

(async () => {
  console.log(`Fetching live catalog from ${API} …`);
  const items = await fetchAll();
  console.log(`Writing manifests for ${items.length} products …`);

  fs.writeFileSync(path.join(ROOT, 'all_products.txt'), buildAllProducts(items), 'utf8');
  const llms = buildLlmsProducts(items);
  fs.writeFileSync(path.join(ROOT, 'llms-products.txt'), llms, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'public', 'llms-products.txt'), llms, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'all_products_details.json'), JSON.stringify(items, null, 0), 'utf8');

  console.log('Done:');
  console.log('  all_products.txt, llms-products.txt (+public/), all_products_details.json');
  console.log('Next: node generate_sitemap.cjs');
})();
