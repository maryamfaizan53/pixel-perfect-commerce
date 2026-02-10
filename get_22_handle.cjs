const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';

const query = `
  query GetProducts($query: String) {
    products(first: 5, query: $query) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

async function getProducts() {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
        },
        body: JSON.stringify({
            query,
            variables: { query: 'title:*22*' }
        })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

getProducts();
