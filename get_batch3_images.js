
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handlesRaw = fs.readFileSync('batch3_handles.txt', 'utf8');
const handles = handlesRaw.split(/\r?\n/).map(h => h.trim()).filter(Boolean);

async function getImages() {
    const results = {};
    for (const handle of handles) {
        const query = `
        {
          product(handle: "${handle}") {
            featuredImage {
              url
            }
          }
        }
        `;

        try {
            const response = await fetch(SHOPIFY_STOREFRONT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();
            const url = data.data?.product?.featuredImage?.url || "NOT_FOUND";
            results[handle] = url;
            console.log(`${handle}: ${url}`);
        } catch (e) {
            console.error(`Error fetching ${handle}: ${e.message}`);
            results[handle] = "ERROR";
        }
    }
    fs.writeFileSync('batch3_images.json', JSON.stringify(results, null, 2));
}

getImages();
