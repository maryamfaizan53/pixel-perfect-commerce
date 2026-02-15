const fs = require('fs');
const path = require('path');

async function verifyCoverage() {
    try {
        let data = fs.readFileSync('all_products_details.json', 'utf16le');
        if (data.charCodeAt(0) === 0xFEFF) data = data.slice(1);
        const parsed = JSON.parse(data);

        // Handle both possible structures
        const products = parsed.data ? (parsed.data.products.edges || []) : (parsed || []);
        const handles = products.map(p => (p.node ? p.node.handle : p.handle)).filter(Boolean);

        const blogDataPath = path.join('src', 'data', 'blogData.ts');
        const blogData = fs.readFileSync(blogDataPath, 'utf8');

        const generatedBlogDataPath = path.join('src', 'data', 'generatedBlogData.ts');
        const generatedBlogData = fs.existsSync(generatedBlogDataPath) ? fs.readFileSync(generatedBlogDataPath, 'utf8') : '';

        const missing = [];
        handles.forEach(h => {
            if (!blogData.includes(h) && !generatedBlogData.includes(h)) {
                missing.push(h);
            }
        });

        console.log('--- FINAL COVERAGE REPORT ---');
        console.log(`Total Products in Catalog: ${handles.length}`);
        console.log(`Missing Blogs: ${missing.length}`);

        if (missing.length > 0) {
            console.log('MISSING_HANDLES:');
            console.log(JSON.stringify(missing, null, 2));
            fs.writeFileSync('missing_products_for_blogs.json', JSON.stringify(missing, null, 2));
        } else {
            console.log('CONGRATULATIONS: 100% Blog Coverage Achieved!');
        }
    } catch (e) {
        console.error('Error:', e.message);
        console.error(e.stack);
    }
}

verifyCoverage();
