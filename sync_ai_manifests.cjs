const fs = require('fs');
const path = require('path');

const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const OUTPUT_FILE = path.join(__dirname, 'public', 'llms-products.txt');

const query = `
  query GetProducts($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

async function fetchAllProducts() {
    let allProducts = [];
    let hasNextPage = true;
    let cursor = null;

    console.log('Fetching products from Shopify...');

    while (hasNextPage) {
        const response = await fetch(SHOPIFY_STOREFRONT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
            },
            body: JSON.stringify({
                query,
                variables: { cursor }
            })
        });

        const { data } = await response.json();
        const products = data.products.edges.map(edge => edge.node);
        allProducts = allProducts.concat(products);

        hasNextPage = data.products.pageInfo.hasNextPage;
        cursor = data.products.pageInfo.endCursor;
        console.log(`Fetched ${allProducts.length} products...`);
    }

    return allProducts;
}

async function sync() {
    try {
        const products = await fetchAllProducts();

        // Sort and format
        const lines = products.map(p => `- [${p.title}](https://www.aibazar.pk/product/${p.handle})`);

        const content = `# AI Bazar Pakistan - Full Product Catalog\n\n` +
            `> Total Products: ${products.length}\n\n` +
            lines.join('\n');

        fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
        console.log(`Successfully synced ${products.length} products to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
