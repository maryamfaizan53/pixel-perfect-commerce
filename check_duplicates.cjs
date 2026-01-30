
const fs = require('fs');
const path = require('path');

const blogDataPath = path.join('src', 'data', 'blogData.ts');
const content = fs.readFileSync(blogDataPath, 'utf8');

const productUrls = [];
const productUrlRegex = /\/product\/([^"'\s\)]+)/g;
let match;
while ((match = productUrlRegex.exec(content)) !== null) {
    productUrls.push(match[1]);
}

const counts = {};
productUrls.forEach(url => {
    counts[url] = (counts[url] || 0) + 1;
});

const duplicates = Object.entries(counts).filter(([url, count]) => count > 1);
console.log('Duplicate Product Links:', JSON.stringify(duplicates, null, 2));
console.log('Total Product Links Found:', productUrls.length);
console.log('Unique Product Links Found:', Object.keys(counts).length);
