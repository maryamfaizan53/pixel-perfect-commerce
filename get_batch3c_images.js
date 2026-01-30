
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
    "instant-electric-hot-water-heater-faucet-with-hand-shower-fast-heating-easy-installation",
    "manual-vegetable-cutter-slicer-multifunctional-round-slicer-gadget-multifunction-kitchen-gadget-food-processor-blender-cutter",
    "rechargeable-foot-callus-remover-with-1-extra-head",
    "5-in-1-multi-functional-vegetable-slicer-grater-adjustable-mandoline-cut",
    "mesh-nebulizer-battery-operated-silent-operation-compact-design-perfect-choice-for-daily-breathing-and-health-care-nee",
    "manual-hand-push-chopper-multi-functional-vegetable-meat-grinder-grater-chopper-2-liter-random-color",
    "portable-hair-dryer-strong-wind-hammer-blower-salon-dryer-hair-negative-ionic-hammer-blower-home-electric-blue-light-hair-dryer",
    "electric-fast-hair-brush-straightener",
    "electric-mens-beard-hair-comb-straightner",
    "fast-hair-straightener-dryer-comb-one-step"
];

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
            results[handle] = "ERROR";
            console.error(`Error fetching ${handle}:`, e);
        }
    }
    fs.writeFileSync('batch3c_images.json', JSON.stringify(results, null, 2));
}

getImages();
