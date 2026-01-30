
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
    "soft-fluffy-rabbit-ears-headband-moving-ears-plush-earmuffs-warm-cozy-1pc-random-colour",
    "dancing-cactus-talking-toy-kids-children-plush-electronic-toys-baby-singing-wriggle-voice-recording-repeats-what-you-say-led-lights-toddler-educational-funny-gift",
    "360-rotating-microfiber-mop-extendable-handle-telescopic-floor-cleaning-mop-sunflower-round-mop-for-home-office-and-car-screen",
    "smart-ems-bioelectric-foot-massager-mat-portable-pulse-muscle-stimulator-for-pain-relief-circulation-boost-acupoint-massage-therapy",
    "2-in-1-smart-clever-cutter",
    "magic-kitchen-foldable-chef-basket",
    "new-foldable-uv-mosquito-killer-rechargeable-racket",
    "hot-water-tap-instant-heating-electric-faucet-electric-geyser-3000-watt",
    "2-in-1-electric-eyebrow-trimmer",
    "5-in-1-hair-straightener-brush-and-dryer"
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
    }
    fs.writeFileSync('batch2_images.json', JSON.stringify(results, null, 2));
}

getImages();
