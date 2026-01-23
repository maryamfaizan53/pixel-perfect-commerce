
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const query = `
  query GetProductsByCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
      }
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            media(first: 1) {
              edges {
                node {
                  mediaContentType
                  previewImage {
                    url
                  }
                  ... on MediaImage {
                    id
                    image {
                      url
                    }
                  }
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function test(handle) {
    try {
        const response = await fetch(SHOPIFY_STOREFRONT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
            },
            body: JSON.stringify({
                query,
                variables: { handle, first: 12 }
            }),
        });

        const data = await response.json();
        console.log(`Handle: ${handle}`);
        console.log(`Collection: ${data.data?.collection?.title}`);
        console.log(`Products Length: ${data.data?.collection?.products?.edges?.length}`);
        if (data.data?.collection?.products?.edges?.length > 0) {
            console.log(`First Product Title: ${data.data.collection.products.edges[0].node.title}`);
        }
        console.log('---');
    } catch (error) {
        console.error('Error:', error);
    }
}

test('top-selling-products');
test('frontpage');
