const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.aibazar.pk';
const OUTPUT_FILE = path.join(__dirname, 'public', 'sitemap.xml');
const PRODUCTS_FILE = path.join(__dirname, 'all_products.txt');
const BLOG_DATA_FILE = path.join(__dirname, 'src', 'data', 'blogData.ts');

// Helper to format date
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Main function
async function generateSitemap() {
    console.log('Generating sitemap...');

    const today = formatDate(new Date());
    let urls = [];

    // 1. Static Pages
    const staticPages = [
        '',
        '/category',
        '/blog',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/shipping',
        '/returns',
        '/track-order',
        '/auth',
        '/cart',
        '/wishlist'
    ];

    staticPages.forEach(page => {
        urls.push({
            loc: `${BASE_URL}${page}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: page === '' ? '1.0' : '0.8'
        });
    });

    // 2. Products from all_products.txt
    try {
        // The file appears to be UTF-16LE encoded based on previous debug output
        const productsContent = fs.readFileSync(PRODUCTS_FILE, 'utf16le');
        const productHandles = productsContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#')); // Filter empty lines and comments

        console.log(`Found ${productHandles.length} products.`);

        productHandles.forEach(handle => {
            // Clean handle if it's a URL or has query params
            // Expected format: "- Product Title (handle)"
            let cleanHandle = null;

            // Try to extract from parentheses first
            const match = handle.match(/\(([^)]+)\)\s*$/);

            if (match) {
                cleanHandle = match[1];
            } else {
                // Fallback for legacy format or direct handles
                if (handle.includes('Total Products:')) return; // Skip summary line

                cleanHandle = handle;
                if (handle.includes('product/')) {
                    cleanHandle = handle.split('product/')[1];
                }
            }

            if (cleanHandle && cleanHandle.includes('?')) {
                cleanHandle = cleanHandle.split('?')[0];
            }

            if (cleanHandle) {
                urls.push({
                    loc: `${BASE_URL}/product/${cleanHandle}`,
                    lastmod: today,
                    changefreq: 'daily',
                    priority: '0.9'
                });
            }
        });
    } catch (error) {
        console.error('Error reading products file:', error);
    }

    // 3. Blog Posts from blogData.ts
    // Since blogData.ts is TypeScript, we'll try to extract handles using regex
    try {
        const blogContent = fs.readFileSync(BLOG_DATA_FILE, 'utf8');
        // Regex to find slug: "some-slug"
        const slugRegex = /slug:\s*"([^"]+)"/g;
        let match;
        let blogCount = 0;

        while ((match = slugRegex.exec(blogContent)) !== null) {
            urls.push({
                loc: `${BASE_URL}/blog/${match[1]}`,
                lastmod: today, // Ideally use publishDate from file if we parsed it properly
                changefreq: 'weekly',
                priority: '0.7'
            });
            blogCount++;
        }
        console.log(`Found ${blogCount} blog posts.`);

    } catch (error) {
        console.error('Error reading blog data:', error);
    }

    // 4. Categories (Hardcoded for now based on navigation)
    const categories = [
        'electronics',
        'fashion',
        'home-living',
        'kitchen',
        'beauty'
    ];

    categories.forEach(cat => {
        urls.push({
            loc: `${BASE_URL}/category/${cat}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.8'
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
}

generateSitemap();
