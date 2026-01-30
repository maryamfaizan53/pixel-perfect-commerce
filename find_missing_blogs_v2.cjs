
const fs = require('fs');
const path = require('path');

function getMissingProducts() {
    let allProductsRaw;
    try {
        allProductsRaw = fs.readFileSync('all_products.txt', 'utf16le');
        if (allProductsRaw.length < 100) {
            allProductsRaw = fs.readFileSync('all_products.txt', 'utf8');
        }
    } catch (e) {
        allProductsRaw = fs.readFileSync('all_products.txt', 'utf8');
    }

    const lines = allProductsRaw.split(/\r?\n/);
    console.log(`Total lines in file: ${lines.length}`);

    const allHandles = [];
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('-')) {
            const match = trimmed.match(/\(([^)]+)\)\s*$/);
            if (match) {
                allHandles.push(match[1].toLowerCase().trim());
            } else {
                console.log(`Failed to match line: "${trimmed}"`);
            }
        }
    });

    console.log(`Extracted ${allHandles.length} unique handles from all_products.txt`);

    const blogDataPath = path.join('src', 'data', 'blogData.ts');
    const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');

    const matchedHandlesSet = new Set();
    // Looking for /product/handle or slug: "handle"
    const productUrlRegex = /\/product\/([^"'\s\)]+)/g;
    let match;
    while ((match = productUrlRegex.exec(blogDataContent)) !== null) {
        const h = match[1].toLowerCase().trim().replace(/[.,!?;:]+$/, '');
        matchedHandlesSet.add(h);
    }

    const slugRegex = /slug:\s*["']([^"']+)["']/g;
    while ((match = slugRegex.exec(blogDataContent)) !== null) {
        matchedHandlesSet.add(match[1].toLowerCase().trim());
    }

    console.log(`Found ${matchedHandlesSet.size} unique handles in blogData.ts`);

    const missing = allHandles.filter(handle => !matchedHandlesSet.has(handle));
    console.log(`Found ${missing.length} missing products`);

    console.log("NEXT_MISSING_BATCH:");
    console.log(JSON.stringify(missing.slice(0, 15), null, 2));
}

getMissingProducts();
