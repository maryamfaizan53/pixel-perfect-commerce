const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.aibazar.pk';
const OUTPUT_FILE = path.join(__dirname, 'public', 'sitemap.xml');
const PRODUCTS_FILE = path.join(__dirname, 'all_products.txt');
const BLOG_DATA_FILE = path.join(__dirname, 'src', 'data', 'blogData.ts');

// Top-selling product handles that should get highest priority
const TOP_SELLING_HANDLES = [
    'crawling-octopus-toys-with-led-lights-music-usb-rechargeable',
    '2-in-1-smart-clever-cutter',
    'magic-kitchen-foldable-chef-basket',
    'hot-water-tap-instant-heating-electric-faucet-electric-geyser-3000-watt',
    '5-in-1-hair-straightener-brush-and-dryer',
    'hair-straightener-brush-curling-comb-2-in-1',
    'hair-dryer-brush-hot-air-hair-brush-styler-for-straightening-curling-electric-blower-brush-volumizer-warm-air-comb-one-step-dryer',
    'automatic-hair-curler-lowest-price-in-pakistan',
    'mosquito-killer-lamp',
    'digital-kitchen-weight-scale-10-kg-capacity-measures-in-g-oz-without-led',
    'new-foldable-uv-mosquito-killer-rechargeable-racket',
    '2-in-1-electric-eyebrow-trimmer',
    'flawless-facial-hair-remover-machine-for-women-high-quality-pocket-size-painless-face-hair-removing-machine-cell-operated',
    'instant-electric-hot-water-heater-faucet-with-hand-shower-fast-heating-easy-installation',
];

// Helper to format date
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Escape XML special characters
const escapeXml = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// Main function
async function generateSitemap() {
    console.log('Generating sitemap...');

    const today = formatDate(new Date());
    let urls = [];

    // 1. Static Pages (EXCLUDE pages that are in robots.txt Disallow)
    const staticPages = [
        { path: '', changefreq: 'daily', priority: '1.0' },
        { path: '/category', changefreq: 'weekly', priority: '0.8' },
        { path: '/blog', changefreq: 'daily', priority: '0.9' },
        { path: '/about', changefreq: 'monthly', priority: '0.6' },
        { path: '/contact', changefreq: 'monthly', priority: '0.6' },
        { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
        { path: '/terms', changefreq: 'yearly', priority: '0.3' },
        { path: '/shipping', changefreq: 'monthly', priority: '0.5' },
        { path: '/returns', changefreq: 'monthly', priority: '0.5' },
        { path: '/help', changefreq: 'monthly', priority: '0.5' },
        // AI/LLM Manifest Discovery (GEO+)
        { path: '/llms.txt', changefreq: 'daily', priority: '1.0' },
        { path: '/llms-full.txt', changefreq: 'daily', priority: '1.0' },
        { path: '/llms-products.txt', changefreq: 'daily', priority: '1.0' },
    ];
    // NOTE: /auth, /cart, /wishlist, /checkout, /account, /orders are excluded (robots.txt Disallow)

    staticPages.forEach(page => {
        urls.push({
            loc: `${BASE_URL}${page.path}`,
            lastmod: today,
            changefreq: page.changefreq,
            priority: page.priority
        });
    });

    // 2. Products from all_products.txt
    try {
        const productsContent = fs.readFileSync(PRODUCTS_FILE, 'utf16le');
        const productHandles = productsContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        console.log(`Found ${productHandles.length} product lines.`);

        productHandles.forEach(handle => {
            let cleanHandle = null;

            const match = handle.match(/\(([^)]+)\)\s*$/);

            if (match) {
                cleanHandle = match[1];
            } else {
                if (handle.includes('Total Products:')) return;
                cleanHandle = handle;
                if (handle.includes('product/')) {
                    cleanHandle = handle.split('product/')[1];
                }
            }

            if (cleanHandle && cleanHandle.includes('?')) {
                cleanHandle = cleanHandle.split('?')[0];
            }

            if (cleanHandle) {
                // Top-selling products get highest priority
                const isTopSeller = TOP_SELLING_HANDLES.includes(cleanHandle);
                urls.push({
                    loc: `${BASE_URL}/products/${escapeXml(cleanHandle)}`,
                    lastmod: today,
                    changefreq: 'daily',
                    priority: isTopSeller ? '1.0' : '0.8'
                });
            }
        });
    } catch (error) {
        console.error('Error reading products file:', error);
    }

    // 3. Blog Posts from blogData.ts
    try {
        const blogContent = fs.readFileSync(BLOG_DATA_FILE, 'utf8');

        // Extract slugs and featured status
        const slugRegex = /slug:\s*"([^"]+)"/g;
        const featuredRegex = /featured:\s*(true|false)/g;

        let slugMatch;
        let blogCount = 0;
        const slugs = [];

        while ((slugMatch = slugRegex.exec(blogContent)) !== null) {
            slugs.push(slugMatch[1]);
        }

        // Check featured status for each post
        const featuredMatches = [];
        let featuredMatch;
        while ((featuredMatch = featuredRegex.exec(blogContent)) !== null) {
            featuredMatches.push(featuredMatch[1] === 'true');
        }

        slugs.forEach((slug, index) => {
            const isFeatured = featuredMatches[index] || false;
            urls.push({
                loc: `${BASE_URL}/blog/${escapeXml(slug)}`,
                lastmod: today,
                changefreq: 'weekly',
                priority: isFeatured ? '0.9' : '0.7'
            });
            blogCount++;
        });

        console.log(`Found ${blogCount} blog posts.`);
    } catch (error) {
        console.error('Error reading blog data:', error);
    }

    // 4. Categories
    const categories = [
        { handle: 'top-selling-products', priority: '1.0' },
        { handle: 'household', priority: '0.9' },
        { handle: 'heaters', priority: '0.8' },
        { handle: 'health-and-beauty', priority: '0.9' },
        { handle: 'hair-straightener-1', priority: '0.8' },
        { handle: 'kitchen', priority: '0.9' },
        { handle: 'electronics', priority: '0.9' },
        { handle: 'fashion', priority: '0.8' },
        { handle: 'home-living', priority: '0.8' },
        { handle: 'beauty', priority: '0.8' },
    ];

    categories.forEach(cat => {
        urls.push({
            loc: `${BASE_URL}/collections/${cat.handle}`,
            lastmod: today,
            changefreq: 'daily',
            priority: cat.priority
        });
    });

    // Generate XML
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Make sure public dir exists
    const publicDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, sitemapContent);
    console.log(`Sitemap generated with ${urls.length} URLs at ${OUTPUT_FILE}`);

    // Stats
    const topSellerCount = urls.filter(u => u.priority === '1.0' && u.loc.includes('/products/')).length;
    console.log(`  - Top-selling products (priority 1.0): ${topSellerCount}`);
    console.log(`  - Regular products (priority 0.8): ${urls.filter(u => u.priority === '0.8' && u.loc.includes('/products/')).length}`);
    console.log(`  - Blog posts: ${urls.filter(u => u.loc.includes('/blog/')).length}`);
    console.log(`  - Categories: ${urls.filter(u => u.loc.includes('/collections/')).length}`);
    console.log(`  - Static pages: ${urls.filter(u => !u.loc.includes('/products/') && !u.loc.includes('/blog/') && !u.loc.includes('/collections/')).length}`);
}

generateSitemap();
