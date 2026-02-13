const fs = require('fs');
const path = require('path');

function verifyCoverage() {
    try {
        // Read product handles
        const handlesContent = fs.readFileSync('product_handles_from_json.txt', 'utf8');
        const handles = handlesContent.split('\n').map(h => h.trim()).filter(h => h.length > 0);
        console.log(`Loaded ${handles.length} product handles.`);

        // Read blog data
        const blogDataPath = path.join('src', 'data', 'blogData.ts');
        const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');

        // Extract slugs and product links from blog data
        // We look for slugs defined in the file
        const slugRegex = /slug:\s*["']([^"']+)["']/g;
        const blogSlugs = new Set();
        let match;
        while ((match = slugRegex.exec(blogDataContent)) !== null) {
            blogSlugs.add(match[1].toLowerCase());
        }

        // We also check if the handle is mentioned in a product link context
        // This accepts that a blog post might "cover" a product if it links to it
        const productLinkRegex = /\/product\/([^"'\s\)]+)/g;
        const linkedProducts = new Set();
        while ((match = productLinkRegex.exec(blogDataContent)) !== null) {
            let h = match[1].toLowerCase();
            // Remove trailing punctuation or query params if any
            h = h.split('?')[0].replace(/[.,!?;:]+$/, '');
            linkedProducts.add(h);
        }

        console.log(`Found ${blogSlugs.size} blog slugs.`);
        console.log(`Found ${linkedProducts.size} linked products in blogs.`);

        const missing = [];
        const coveredByLink = [];
        const coveredBySlug = [];

        handles.forEach(handle => {
            const isSlug = blogSlugs.has(handle);
            // Loose matching for slug: sometimes slug might be slightly different or handle is contained
            // But usually we want exact or close match.
            // Let's assume if it's linked, it's covered.
            const isLinked = linkedProducts.has(handle);

            if (isSlug || isLinked) {
                if (isSlug) coveredBySlug.push(handle);
                if (isLinked) coveredByLink.push(handle);
            } else {
                // formatting check: maybe handle is "foo-bar" and slug is "foo-bar-review"
                // but for now strict check on "is it linked" is a good proxy for "is this product discussed"
                missing.push(handle);
            }
        });

        console.log(`Total Covered: ${handles.length - missing.length}`);
        console.log(`Missing: ${missing.length}`);

        if (missing.length > 0) {
            console.log('--- Missing Products (First 20) ---');
            missing.slice(0, 20).forEach(h => console.log(h));

            fs.writeFileSync('final_missing_blogs.txt', missing.join('\n'));
            console.log('Full list saved to final_missing_blogs.txt');
        } else {
            console.log('All products are covered!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyCoverage();
