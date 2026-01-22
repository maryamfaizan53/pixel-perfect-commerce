
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

async function listCollections() {
    const query = `
    query GetCollections {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

    try {
        const response = await fetch(SHOPIFY_STOREFRONT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

listCollections();
