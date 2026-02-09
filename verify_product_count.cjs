const fs = require('fs');

try {
    let data = fs.readFileSync('all_products_details.json', 'utf16le');
    // Strip BOM if present
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
    }
    const parsed = JSON.parse(data);
    const products = parsed.data?.products?.edges || [];
    console.log(`Total products in all_products_details.json: ${products.length}`);
    const handles = products.map(p => p.node.handle).filter(Boolean);
    fs.writeFileSync('product_handles_from_json.txt', handles.join('\n'));
    console.log(`Saved ${handles.length} handles to product_handles_from_json.txt`);
} catch (e) {
    console.error('Error:', e.message);
}

