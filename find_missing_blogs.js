
import fs from 'fs';

const blogDataPath = 'd:/github/pixel-perfect-commerce/src/data/blogData.ts';
const content = fs.readFileSync(blogDataPath, 'utf8');
const slugs = [];
const slugRegex = /slug:\s*["']([^"']+)["']/g;
let m;
while ((m = slugRegex.exec(content))) slugs.push(m[1].toLowerCase());

const allProducts = fs.readFileSync('all_products.txt', 'utf16le');
const lines = allProducts.split('\n').filter(l => l.trim().startsWith('-'));

const missing = [];
lines.forEach(line => {
    const handleMatch = line.match(/\(([^)]+)\)$/);
    if (handleMatch) {
        const handle = handleMatch[1].toLowerCase();
        // Check if the handle (or a significant part of it) exists in any slug
        // Or vice versa.
        const found = slugs.some(slug => slug.includes(handle) || handle.includes(slug));
        if (!found) {
            missing.push({
                title: line.split('(')[0].replace('-', '').trim(),
                handle: handle
            });
        }
    }
});

console.log(`Total Products: ${lines.length}`);
console.log(`Missing: ${missing.length}`);
missing.slice(0, 10).forEach(p => console.log(JSON.stringify(p)));
