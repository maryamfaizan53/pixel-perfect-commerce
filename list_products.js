
import fetch from 'node-fetch';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const query = `
{
  products(first: 250) {
    edges {
      node {
        title
        handle
      }
    }
  }
}
`;

async function listProducts() {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const products = data.data.products.edges.map(e => e.node);
    console.log(`Total Products: ${products.length}`);
    products.forEach(p => console.log(`- ${p.title} (${p.handle})`));
}

listProducts();
