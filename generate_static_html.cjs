/**
 * generate_static_html.cjs
 * 
 * Build-time static HTML pre-generation for SEO/GSO.
 * Runs AFTER `vite build` to create unique HTML files for every route
 * with correct title, meta tags, canonical URL, OG tags, and JSON-LD schema.
 * 
 * Crawlers see fully-formed HTML; the SPA hydrates on top for real users.
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────────────────
const BASE_URL = 'https://www.aibazar.pk';
const DIST_DIR = path.join(__dirname, 'dist');
const PRODUCTS_FILE = path.join(__dirname, 'all_products.txt');
const BLOG_DATA_FILE = path.join(__dirname, 'src', 'data', 'blogData.ts');

const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STORE_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

// ── Categories (same as generate_sitemap.cjs) ──────────────────────────────────
const CATEGORIES = [
    { handle: 'top-selling-products', title: 'Top Selling Products', description: 'Discover our most popular and top-selling products in Pakistan. Best prices guaranteed with free shipping and COD.' },
    { handle: 'household', title: 'Household Essentials', description: 'Shop affordable household items online in Pakistan. Smart home solutions, cleaning tools, and daily essentials at the lowest prices.' },
    { handle: 'heaters', title: 'Heaters & Warming Solutions', description: 'Buy electric heaters and warming products online in Pakistan. Instant hot water heaters, room heaters at the best prices.' },
    { handle: 'health-and-beauty', title: 'Health & Beauty Products', description: 'Shop health and beauty products online in Pakistan. Skincare, grooming tools, and wellness essentials at affordable prices.' },
    { handle: 'hair-straightener-1', title: 'Hair Straighteners & Styling', description: 'Buy hair straighteners, curlers, and styling tools online in Pakistan. Professional-grade hair tools at the lowest prices.' },
    { handle: 'kitchen', title: 'Kitchen Gadgets & Tools', description: 'Shop smart kitchen gadgets and cooking tools online in Pakistan. Vegetable cutters, scales, and cookware at the best prices.' },
    { handle: 'electronics', title: 'Electronics & Gadgets', description: 'Buy electronics and gadgets online in Pakistan. Affordable tech accessories, lamps, and smart devices with fast delivery.' },
    { handle: 'fashion', title: 'Fashion & Accessories', description: 'Shop trendy fashion and accessories online in Pakistan. Affordable clothing, bags, and accessories with COD available.' },
    { handle: 'home-living', title: 'Home & Living', description: 'Shop home decor and living essentials online in Pakistan. Organize, decorate, and upgrade your space at the lowest prices.' },
    { handle: 'beauty', title: 'Beauty & Cosmetics', description: 'Buy beauty and cosmetics products online in Pakistan. Makeup, skincare, and grooming at affordable prices.' },
];

// ── Static Pages ────────────────────────────────────────────────────────────────
const STATIC_PAGES = [
    { path: '/about', title: 'About Us | AI Bazar Pakistan', description: 'Learn about AI Bazar - Pakistan\'s most affordable AI-powered online shopping store. Our mission is to bring the best products at the lowest prices.' },
    { path: '/contact', title: 'Contact Us | AI Bazar Pakistan', description: 'Get in touch with AI Bazar. Reach us via WhatsApp, email, or phone for orders, returns, and support. We\'re here to help!' },
    { path: '/privacy', title: 'Privacy Policy | AI Bazar Pakistan', description: 'Read AI Bazar\'s privacy policy. Learn how we protect your personal data and ensure safe online shopping.' },
    { path: '/terms', title: 'Terms & Conditions | AI Bazar Pakistan', description: 'Read AI Bazar\'s terms and conditions for shopping, returns, refunds, and more.' },
    { path: '/shipping', title: 'Shipping Policy | AI Bazar Pakistan', description: 'Free express shipping across Pakistan. Learn about delivery times, tracking, and our shipping partners.' },
    { path: '/returns', title: 'Returns & Refunds | AI Bazar Pakistan', description: '7-day hassle-free returns and refund policy. Learn how to return products and get your money back.' },
    { path: '/help', title: 'Help Center | AI Bazar Pakistan', description: 'Find answers to frequently asked questions about orders, shipping, returns, and payments at AI Bazar.' },
    { path: '/track-order', title: 'Track Your Order | AI Bazar Pakistan', description: 'Track your order status in real-time. Enter your order number to see where your package is.' },
    { path: '/blog', title: 'Blog | AI Bazar - Shopping Guides & Tips', description: 'Read expert shopping guides, product reviews, and tips for online shopping in Pakistan. Stay updated with AI Bazar blog.' },
    { path: '/category', title: 'All Categories | AI Bazar Pakistan', description: 'Browse all product categories at AI Bazar. Kitchen, beauty, electronics, fashion, and more at the lowest prices in Pakistan.' },
];

// ── Shopify GraphQL Query ──────────────────────────────────────────────────────
const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      availableForSale
      productType
      vendor
      tags
      seo {
        title
        description
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      media(first: 3) {
        edges {
          node {
            mediaContentType
            previewImage {
              url
            }
            ... on MediaImage {
              id
              image {
                url
              }
            }
          }
        }
      }
      variants(first: 5) {
        edges {
          node {
            id
            title
            sku
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
      collections(first: 3) {
        edges {
          node {
            title
            handle
          }
        }
      }
    }
  }
`;

// ── Helpers ─────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function truncate(str, maxLen) {
    if (!str) return '';
    const clean = str.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLen) return clean;
    return clean.substring(0, maxLen - 3) + '...';
}

async function shopifyFetch(query, variables = {}) {
    // Dynamic import of node-fetch for CJS
    const fetch = globalThis.fetch || (await import('node-fetch')).default;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
        throw new Error(`Shopify GraphQL error: ${data.errors.map(e => e.message).join(', ')}`);
    }
    return data;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Data Extraction ─────────────────────────────────────────────────────────────

function getProductHandles() {
    try {
        let content = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        if (content.includes('\u0000')) {
            content = fs.readFileSync(PRODUCTS_FILE, 'utf16le');
        }

        const handles = [];
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            if (line.startsWith('## [')) {
                const match = line.match(/https:\/\/www\.aibazar\.pk\/products\/([^)\s?#]+)/);
                if (match && /^[a-z0-9-]+$/.test(match[1])) {
                    handles.push(match[1]);
                }
            }
        }

        return [...new Set(handles)];
    } catch (error) {
        console.error('Error reading products file:', error.message);
        return [];
    }
}

function getBlogData() {
    try {
        const content = fs.readFileSync(BLOG_DATA_FILE, 'utf8');

        const posts = [];
        const slugRegex = /slug:\s*"([^"]+)"/g;
        const titleRegex = /title:\s*"([^"]+)"/g;
        const excerptRegex = /excerpt:\s*"([^"]+)"/g;
        const authorRegex = /author:\s*"([^"]+)"/g;
        const publishDateRegex = /publishDate:\s*"([^"]+)"/g;
        const categoryRegex = /category:\s*"([^"]+)"/g;

        const slugs = [], titles = [], excerpts = [], authors = [], dates = [], categories = [];
        let m;

        while ((m = slugRegex.exec(content)) !== null) slugs.push(m[1]);
        while ((m = titleRegex.exec(content)) !== null) titles.push(m[1]);
        while ((m = excerptRegex.exec(content)) !== null) excerpts.push(m[1]);
        while ((m = authorRegex.exec(content)) !== null) authors.push(m[1]);
        while ((m = publishDateRegex.exec(content)) !== null) dates.push(m[1]);
        while ((m = categoryRegex.exec(content)) !== null) categories.push(m[1]);

        for (let i = 0; i < slugs.length; i++) {
            posts.push({
                slug: slugs[i],
                title: titles[i] || slugs[i],
                excerpt: excerpts[i] || '',
                author: authors[i] || 'AI Bazar',
                publishDate: dates[i] || '2024-01-01',
                category: categories[i] || 'General',
            });
        }

        return posts;
    } catch (error) {
        console.error('Error reading blog data:', error.message);
        return [];
    }
}

// ── HTML Generation ─────────────────────────────────────────────────────────────

function generatePageHtml(baseHtml, { title, description, canonical, ogType, ogImage, jsonLd, noscriptContent }) {
    let html = baseHtml;

    // Replace <title>
    html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(title)}</title>`
    );

    // Replace meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(truncate(description, 160))}" />`
    );

    // Replace canonical
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${escapeHtml(canonical)}" />`
    );

    // Replace OG tags
    html = html.replace(
        /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:type" content="${escapeHtml(ogType || 'website')}" />`
    );
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${escapeHtml(canonical)}" />`
    );
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    );
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(truncate(description, 200))}" />`
    );

    // Replace OG image if provided
    if (ogImage) {
        html = html.replace(
            /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:image" content="${escapeHtml(ogImage)}" />`
        );
    }

    // Replace Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${escapeHtml(canonical)}" />`
    );
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    );
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(truncate(description, 200))}" />`
    );
    if (ogImage) {
        html = html.replace(
            /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
            `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
        );
    }

    // Inject JSON-LD schema before </head>
    if (jsonLd) {
        const jsonLdScript = `<script type="application/ld+json" id="prerender-schema">${JSON.stringify(jsonLd)}</script>`;
        html = html.replace('</head>', `${jsonLdScript}\n</head>`);
    }

    // Inject noscript content after <div id="root"></div>
    if (noscriptContent) {
        html = html.replace(
            '<div id="root"></div>',
            `<div id="root"></div>\n<noscript>${noscriptContent}</noscript>`
        );
    }

    return html;
}

function writeHtmlFile(routePath, html) {
    // routePath like "/products/some-handle" → dist/products/some-handle/index.html
    const cleanPath = routePath.replace(/^\//, '');
    const dir = path.join(DIST_DIR, cleanPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

// ── Product HTML Generation ─────────────────────────────────────────────────────

function generateProductHtml(baseHtml, product) {
    const title = (product.seo?.title) ||
        product.title.split(/\s+/).slice(0, 3).join(' ') + ' Price Pakistan';

    const price = parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString();
    const currency = product.priceRange.minVariantPrice.currencyCode || 'PKR';
    const description = product.seo?.description ||
        `Buy ${product.title} from AI Bazar at only Rs. ${price}. Free Express Shipping & Cash on Delivery across Pakistan. 100% Original Quality.`;

    const canonical = `${BASE_URL}/products/${product.handle}`;
    const imageUrl = product.media?.edges?.[0]?.node?.image?.url ||
        product.media?.edges?.[0]?.node?.previewImage?.url ||
        `${BASE_URL}/og-image.png`;

    const sku = product.variants?.edges?.[0]?.node?.sku || product.id.replace('gid://shopify/Product/', '');

    // Product JSON-LD schema (matches ProductPage.tsx structure)
    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.media?.edges?.map(e => e.node?.image?.url || e.node?.previewImage?.url).filter(Boolean) || [imageUrl],
        "description": product.description,
        "sku": sku,
        "mpn": product.id.replace('gid://shopify/Product/', ''),
        "brand": {
            "@type": "Brand",
            "name": product.vendor || "AI Bazar Original"
        },
        "category": product.productType || "General",
        "url": canonical,
        "offers": {
            "@type": "Offer",
            "url": canonical,
            "priceCurrency": currency,
            "price": product.priceRange.minVariantPrice.amount,
            "priceValidUntil": "2026-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "sku": sku,
            "seller": {
                "@type": "Organization",
                "@id": "https://www.aibazar.pk/#organization"
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "PK",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "PKR" },
                "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "PK" },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "d" },
                    "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" }
                }
            }
        }
    };

    // FAQ schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `What is the price of ${product.title} in Pakistan?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `The ${product.title} is available at AI Bazar for Rs. ${price} PKR. This is the lowest price available online in Pakistan with free express shipping and cash on delivery included.`
                }
            },
            {
                "@type": "Question",
                "name": `Where can I buy ${product.title} online in Pakistan?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `You can buy the ${product.title} online at AI Bazar (aibazar.pk). Visit ${canonical} to order with free express shipping and cash on delivery nationwide.`
                }
            },
            {
                "@type": "Question",
                "name": `Is this ${product.title} genuine and original?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Yes, the ${product.title} sold at AI Bazar is 100% genuine and original. AI Bazar sources all products directly from verified vendors and original brands.`
                }
            }
        ]
    };

    // Breadcrumb schema
    const collection = product.collections?.edges?.[0]?.node;
    const breadcrumbItems = [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL }
    ];
    if (collection) {
        breadcrumbItems.push({
            "@type": "ListItem", "position": 2,
            "name": collection.title,
            "item": `${BASE_URL}/collections/${collection.handle}`
        });
    }
    breadcrumbItems.push({
        "@type": "ListItem",
        "position": collection ? 3 : 2,
        "name": product.title,
        "item": canonical
    });

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
    };

    // Noscript content for crawlers
    const noscriptBody = `
    <div style="max-width:800px;margin:0 auto;padding:20px;font-family:sans-serif;">
      <h1>${escapeHtml(product.title)}</h1>
      <p style="font-size:1.5em;color:#e53e3e;font-weight:bold;">Rs. ${price} ${currency}</p>
      <p>${escapeHtml(truncate(product.description, 500))}</p>
      ${product.availableForSale ? '<p style="color:green;">✓ In Stock — Free Shipping & Cash on Delivery</p>' : '<p style="color:red;">Currently Out of Stock</p>'}
      <p><a href="${canonical}">Buy ${escapeHtml(product.title)} Online at AI Bazar</a></p>
      ${collection ? `<p>Category: <a href="${BASE_URL}/collections/${collection.handle}">${escapeHtml(collection.title)}</a></p>` : ''}
      <p><a href="${BASE_URL}">← Back to AI Bazar Home</a></p>
    </div>
  `;

    return generatePageHtml(baseHtml, {
        title: `${title} | Buy Online at AI Bazar Pakistan`,
        description,
        canonical,
        ogType: 'product',
        ogImage: imageUrl,
        jsonLd: [productSchema, faqSchema, breadcrumbSchema],
        noscriptContent: noscriptBody
    });
}

// ── Category HTML Generation ────────────────────────────────────────────────────

function generateCategoryHtml(baseHtml, category) {
    const canonical = `${BASE_URL}/collections/${category.handle}`;

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.title,
        "description": category.description,
        "url": canonical,
        "isPartOf": { "@type": "WebSite", "@id": `${BASE_URL}/#website` }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${BASE_URL}/category` },
            { "@type": "ListItem", "position": 3, "name": category.title, "item": canonical }
        ]
    };

    const noscriptBody = `
    <div style="max-width:800px;margin:0 auto;padding:20px;font-family:sans-serif;">
      <h1>${escapeHtml(category.title)}</h1>
      <p>${escapeHtml(category.description)}</p>
      <p><a href="${canonical}">Shop ${escapeHtml(category.title)} at AI Bazar</a></p>
      <p><a href="${BASE_URL}">← Back to AI Bazar Home</a></p>
    </div>
  `;

    return generatePageHtml(baseHtml, {
        title: `${category.title} | Shop Online at AI Bazar Pakistan`,
        description: category.description,
        canonical,
        ogType: 'website',
        ogImage: null,
        jsonLd: [collectionSchema, breadcrumbSchema],
        noscriptContent: noscriptBody
    });
}

// ── Blog HTML Generation ────────────────────────────────────────────────────────

function generateBlogHtml(baseHtml, post) {
    const canonical = `${BASE_URL}/blog/${post.slug}`;

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "AI Bazar",
            "url": BASE_URL
        },
        "datePublished": post.publishDate,
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
        "url": canonical
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": canonical }
        ]
    };

    const noscriptBody = `
    <div style="max-width:800px;margin:0 auto;padding:20px;font-family:sans-serif;">
      <h1>${escapeHtml(post.title)}</h1>
      <p>By ${escapeHtml(post.author)} | ${escapeHtml(post.publishDate)} | ${escapeHtml(post.category)}</p>
      <p>${escapeHtml(post.excerpt)}</p>
      <p><a href="${canonical}">Read full article</a></p>
      <p><a href="${BASE_URL}/blog">← Back to Blog</a></p>
    </div>
  `;

    return generatePageHtml(baseHtml, {
        title: `${post.title} | AI Bazar Blog`,
        description: post.excerpt,
        canonical,
        ogType: 'article',
        ogImage: null,
        jsonLd: [articleSchema, breadcrumbSchema],
        noscriptContent: noscriptBody
    });
}

// ── Static Page HTML Generation ─────────────────────────────────────────────────

function generateStaticPageHtml(baseHtml, page) {
    const canonical = `${BASE_URL}${page.path}`;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": page.title.split(' | ')[0], "item": canonical }
        ]
    };

    return generatePageHtml(baseHtml, {
        title: page.title,
        description: page.description,
        canonical,
        ogType: 'website',
        ogImage: null,
        jsonLd: [breadcrumbSchema],
        noscriptContent: null
    });
}

// ── Main ────────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n🚀 Static HTML Pre-Generation Starting...\n');

    // 1. Read the base HTML template from dist/index.html
    const baseHtmlPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(baseHtmlPath)) {
        console.error('❌ dist/index.html not found! Run `vite build` first.');
        process.exit(1);
    }
    const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');
    console.log('✅ Loaded base template from dist/index.html');

    let stats = { products: 0, productsFailed: 0, categories: 0, blogs: 0, static: 0 };

    // 2. Generate Static Pages
    console.log('\n📄 Generating static pages...');
    for (const page of STATIC_PAGES) {
        const html = generateStaticPageHtml(baseHtml, page);
        writeHtmlFile(page.path, html);
        stats.static++;
    }
    console.log(`   ✅ ${stats.static} static pages generated`);

    // 3. Generate Category Pages
    console.log('\n📂 Generating category pages...');
    for (const cat of CATEGORIES) {
        const html = generateCategoryHtml(baseHtml, cat);
        writeHtmlFile(`/collections/${cat.handle}`, html);
        stats.categories++;
    }
    console.log(`   ✅ ${stats.categories} category pages generated`);

    // 4. Generate Blog Pages
    console.log('\n📝 Generating blog pages...');
    const blogPosts = getBlogData();
    for (const post of blogPosts) {
        const html = generateBlogHtml(baseHtml, post);
        writeHtmlFile(`/blog/${post.slug}`, html);
        stats.blogs++;
    }
    console.log(`   ✅ ${stats.blogs} blog pages generated`);

    // 5. Generate Product Pages (with API calls)
    console.log('\n🛍️  Generating product pages...');
    const handles = getProductHandles();
    console.log(`   Found ${handles.length} product handles`);

    // Process products in batches of 5 with delay to avoid rate limiting
    const BATCH_SIZE = 5;
    for (let i = 0; i < handles.length; i += BATCH_SIZE) {
        const batch = handles.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (handle) => {
            try {
                const data = await shopifyFetch(PRODUCT_QUERY, { handle });
                const product = data.data?.product;
                if (product) {
                    const html = generateProductHtml(baseHtml, product);
                    writeHtmlFile(`/products/${handle}`, html);
                    stats.products++;
                } else {
                    // Generate fallback with handle-derived title
                    const fallbackProduct = {
                        id: `fallback-${handle}`,
                        title: handle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        description: `Buy ${handle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} online at AI Bazar Pakistan. Best price guaranteed with free shipping.`,
                        handle,
                        availableForSale: true,
                        productType: 'General',
                        vendor: 'AI Bazar',
                        tags: [],
                        seo: { title: null, description: null },
                        priceRange: { minVariantPrice: { amount: '0', currencyCode: 'PKR' }, maxVariantPrice: { amount: '0', currencyCode: 'PKR' } },
                        media: { edges: [] },
                        variants: { edges: [] },
                        collections: { edges: [] }
                    };
                    const html = generateProductHtml(baseHtml, fallbackProduct);
                    writeHtmlFile(`/products/${handle}`, html);
                    stats.products++;
                    stats.productsFailed++;
                    console.log(`   ⚠️  Product not found in Shopify: ${handle} (using fallback)`);
                }
            } catch (err) {
                // Generate fallback HTML even on API error
                const fallbackProduct = {
                    id: `error-${handle}`,
                    title: handle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    description: `Buy ${handle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} online at AI Bazar Pakistan.`,
                    handle,
                    availableForSale: true,
                    productType: 'General',
                    vendor: 'AI Bazar',
                    tags: [],
                    seo: { title: null, description: null },
                    priceRange: { minVariantPrice: { amount: '0', currencyCode: 'PKR' }, maxVariantPrice: { amount: '0', currencyCode: 'PKR' } },
                    media: { edges: [] },
                    variants: { edges: [] },
                    collections: { edges: [] }
                };
                const html = generateProductHtml(baseHtml, fallbackProduct);
                writeHtmlFile(`/products/${handle}`, html);
                stats.products++;
                stats.productsFailed++;
                console.log(`   ⚠️  API error for ${handle}: ${err.message} (using fallback)`);
            }
        });

        await Promise.all(promises);

        // Progress indicator
        const processed = Math.min(i + BATCH_SIZE, handles.length);
        if (processed % 25 === 0 || processed === handles.length) {
            console.log(`   📦 ${processed}/${handles.length} products processed...`);
        }

        // Rate limit delay between batches
        if (i + BATCH_SIZE < handles.length) {
            await sleep(200);
        }
    }

    // 6. Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Static HTML Generation Summary');
    console.log('═'.repeat(60));
    console.log(`   Static pages:   ${stats.static}`);
    console.log(`   Category pages: ${stats.categories}`);
    console.log(`   Blog pages:     ${stats.blogs}`);
    console.log(`   Product pages:  ${stats.products} (${stats.productsFailed} fallbacks)`);
    console.log(`   Total files:    ${stats.static + stats.categories + stats.blogs + stats.products}`);
    console.log('═'.repeat(60));
    console.log('✅ Static HTML pre-generation complete!\n');
}

main().catch(err => {
    // Non-fatal: static HTML pre-gen is an SEO enhancement, not build-critical.
    // (The legacy Shopify store this reads from is decommissioned — see backend/.)
    console.error('⚠️  Static HTML pre-generation skipped:', err.message);
    process.exit(0);
});
