
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const query = `
{
  products(first: 100) {
    edges {
      node {
        handle
        media(first: 1) {
          edges {
            node {
              ... on MediaImage {
                image {
                  url
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

async function getImages() {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const mapping = {};
    data.data.products.edges.forEach(e => {
        const handle = e.node.handle;
        const url = e.node.media.edges[0]?.node?.image?.url;
        if (url) mapping[handle] = url;
    });

    console.log(JSON.stringify(mapping, null, 2));
}

getImages();
