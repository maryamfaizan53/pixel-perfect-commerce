
import fs from 'fs';

function findMissing() {
    const rawContent = fs.readFileSync('latest_products_utf8.txt', 'utf8');
    console.log(`Raw file begins with: ${JSON.stringify(rawContent.substring(0, 100))}`);

    const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    console.log(`Total non-empty lines: ${lines.length}`);
    console.log(`First 5 lines: ${JSON.stringify(lines.slice(0, 5), null, 2)}`);

    const allHandles = lines.map(line => {
        const match = line.match(/\(([^)]+)\)$/);
        return match ? match[1].toLowerCase().trim() : null;
    }).filter(Boolean);

    console.log(`Found ${allHandles.length} total handles`);

    const blogDataContent = fs.readFileSync('src/data/blogData.ts', 'utf8');
    const existingSlugs = [];
    const slugRegex = /slug:\s*["']([^"']+)["']/g;
    let match;
    while ((match = slugRegex.exec(blogDataContent)) !== null) {
        existingSlugs.push(match[1].toLowerCase().trim());
    }

    console.log(`Found ${existingSlugs.length} existing slugs`);

    const missing = allHandles.filter(handle => !existingSlugs.includes(handle));
    console.log(`Found ${missing.length} missing products`);
    console.log(JSON.stringify(missing.slice(0, 30), null, 2));
}

findMissing();
