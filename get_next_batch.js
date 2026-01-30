import fs from 'fs';

const blogDataPath = 'd:/github/pixel-perfect-commerce/src/data/blogData.ts';
const content = fs.readFileSync(blogDataPath, 'utf8');

// Extract all slugs and handles from [text](/product/handle) links
const links = [];
const linkRegex = /\/product\/([^)\s"']+)/g;
let m;
while ((m = linkRegex.exec(content))) links.push(m[1].toLowerCase().trim());

console.log(`Extracted ${links.length} product links from existing blogs.`);

const allProducts = fs.readFileSync('all_products.txt', 'utf16le');
const lines = allProducts.split('\n').filter(l => l.trim().startsWith('-'));

const missing = [];
lines.forEach(line => {
    const handleMatch = line.match(/\(([^)]+)\)$/);
    if (handleMatch) {
        const handle = handleMatch[1].toLowerCase().trim();
        // Strict match: the exact handle must exist in our links list
        if (!links.includes(handle)) {
            missing.push({
                title: line.split('(')[0].replace('-', '').trim(),
                handle: handle
            });
        }
    }
});

console.log(`Total Products: ${lines.length}`);
console.log(`Missing Blogs: ${missing.length}`);
console.log('\n--- NEXT BATCH (30) ---');
missing.slice(0, 30).forEach((p, i) => {
    console.log(`${i + 31}. ${p.title} (${p.handle})`);
});
