const fs = require('fs');
const path = require('path');

async function verifyCoverage() {
    try {
        let data = fs.readFileSync('all_products_details.json', 'utf16le');
        if (data.charCodeAt(0) === 0xFEFF) data = data.slice(1);
        const products = JSON.parse(data).data.products.edges;
        const handles = products.map(p => p.node.handle).filter(Boolean);

        const blogData = fs.readFileSync(path.join('src', 'data', 'blogData.ts'), 'utf8');

        const missing = [];
        handles.forEach(h => {
            if (!blogData.includes(h)) {
                missing.push(h);
            }
        });

        console.log('--- FINAL COVERAGE REPORT ---');
        console.log(`Total Products: ${handles.length}`);
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
    }
}

verifyCoverage();
