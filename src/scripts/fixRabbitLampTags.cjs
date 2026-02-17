const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'all_products_details.json');
try {
    let rawContent = fs.readFileSync(filePath, 'utf16le');
    // Strip BOM if present
    if (rawContent.charCodeAt(0) === 0xFEFF) {
        rawContent = rawContent.slice(1);
    }
    let data = JSON.parse(rawContent);

    // Navigate to products
    // Based on previous inspections, it seems to have a structure like { data: { products: { edges: [...] } } }
    // Or similar. Let's find where the Rabbit Lamp is.

    function findAndFix(obj) {
        if (!obj || typeof obj !== 'object') return;

        if (obj.handle === 'cute-rabbit-silicone-lamp') {
            obj.tags = [
                "Night Light",
                "Silicone Lamp",
                "Baby Nursery",
                "Kids Gift",
                "Soft Glow",
                "Rechargeable",
                "Bedroom Decor",
                "Night Lamps",
                "Cute Rabbit Lamp"
            ];
            console.log('✅ Updated tags for Cute Rabbit Silicone Lamp');
            return true;
        }

        for (let key in obj) {
            if (findAndFix(obj[key])) return true;
        }
        return false;
    }

    if (findAndFix(data)) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf16le');
        console.log('✅ File saved successfully with UTF-16LE encoding.');
    } else {
        console.log('❌ Could not find product with handle "cute-rabbit-silicone-lamp"');
    }
} catch (err) {
    console.error('Error:', err);
}
