import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_BLOG_FILE = path.join(__dirname, '../data/generatedBlogData.ts');
const OUTPUT_FILE = path.join(__dirname, '../../public/sitemap.xml');
const SITE_URL = 'https://www.aibazar.pk';
const TODAY = new Date().toISOString().split('T')[0];

// Parse blog slugs from the generated file
function extractBlogSlugs() {
    const content = fs.readFileSync(GENERATED_BLOG_FILE, 'utf8');
    const slugMatches = content.match(/"slug":\s*"([^"]+)"/g);

    if (!slugMatches) return [];

    return slugMatches.map(match => {
        const slug = match.match(/"slug":\s*"([^"]+)"/)[1];
        return slug;
    });
}

function generateSitemap() {
    const blogSlugs = extractBlogSlugs();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/category</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // Add original blog posts (manually listed)
    const originalBlogs = [
        'ultimate-guide-online-shopping-pakistan-2024',
        'top-10-trending-fashion-brands-pakistan',
        'how-to-choose-perfect-kitchen-gadgets',
        'best-home-decor-ideas-2024',
        'electronics-buying-guide-pakistan',
        'best-makeup-organizers-pakistan-2026-360-rotating-dustproof-guides',
        'top-10-kitchen-gadgets-pakistan-2026',
        'best-home-decor-ideas-pakistan-2026',
        'top-tech-gadgets-accessories-pakistan',
        'trending-fashion-accessories-2026',
        'ultimate-beauty-tools-guide-2026'
    ];

    originalBlogs.forEach(slug => {
        xml += `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add all generated blog posts
    blogSlugs.forEach(slug => {
        xml += `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    fs.writeFileSync(OUTPUT_FILE, xml);
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📊 Total URLs: ${originalBlogs.length + blogSlugs.length + 3} (3 core + ${originalBlogs.length} original blogs + ${blogSlugs.length} generated blogs)`);
    console.log(`📍 Location: ${OUTPUT_FILE}`);
}

generateSitemap();
