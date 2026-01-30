
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
    "portable-usb-feeder-warmer-pouch-42-c-constant-heating-easy-to-carry-random-design",
    "foot-pedal-resistance-band-elastic-sit-up-pull-rope-for-yoga-and-fitness-tummy-trimmer-providing-durable-quality-comfortable-use-random-color",
    "high-quality-water-bottle-stand-metal-rack-dispenser-durable-stable-holder-for-home-office-19-ltr-bottle-stand-with-nozzle",
    "water-spray-brass-nozzle-gardening-planter-high-pressure-water-sprayer-with-trigger-spray-for-garden-car-washing-and-bike-cleaning",
    "hand-press-button-plier-heavy-duty-metal-body-with-50-snap-buttons-manual-fastener-tool-for-tailoring-diy-crafts-bags-clothes-leather-wo",
    "posture-corrector-back-brace-clavicle-shoulder-support-brace-for-upper-back-pain-relief-large",
    "finger-exerciser-gripster-strengthener-finger-stretcher-hand-gripper-silicone-finger-grip-patient-hand-strengthening-guitar-finger-flexion-and-hand-strengthening-extension-exercise-device",
    "large-capacity-mummy-bag-multi-function-waterproof-outdoor-women-backpack-nursing-bag-for-baby-care-blue"
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
    fs.writeFileSync('batch3b_images.json', JSON.stringify(results, null, 2));
}

getImages();
