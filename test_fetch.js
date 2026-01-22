
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

async function testFetchCategory(handle) {
  const query = `
    query GetProductsByCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        products(first: $first) {
          edges {
            node {
              id
              title
            }
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
      body: JSON.stringify({
        query,
        variables: { handle, first: 5 }
      }),
    });

    const data = await response.json();
    console.log(`Handle: ${handle}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetchCategory('top-selling-products');
testFetchCategory('heaters');
testFetchCategory('health-and-beauty');
