
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

async function checkCount(handle) {
    const query = `
    query GetProductsByCollection($handle: String!) {
      collection(handle: $handle) {
        title
        products(first: 10) {
          edges { node { id } }
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
            body: JSON.stringify({
                query,
                variables: { handle }
            }),
        });

        const data = await response.json();
        if (data.errors) {
            console.log(`Handle: ${handle} => Errors:`, data.errors);
        } else {
            const count = data.data.collection?.products?.edges?.length || 0;
            console.log(`Handle: ${handle} => Title: ${data.data.collection?.title}, Found Products: ${count}`);
        }
    } catch (error) {
        console.error('Error fetching ' + handle + ':', error);
    }
}

const handles = ['top-selling-products', 'frontpage', 'household', 'heaters', 'health-and-beauty'];
async function run() {
    for (const h of handles) {
        await checkCount(h);
    }
}
run();
