
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
    "multipurpose-3-in-1-laser-level-ruler-and-spirit-level-tool-with-triple-bubble-vials-for-precise-home-improvement-construction-task",
    "dew-shine-anti-aging-serum-gentle-formula-reduces-fine-lines-improves-skin-elasticity-provides-radiant-glow-and-smooth-texture-for-daily-use-30ml",
    "3-in-1-compact-foldable-silicone-wax-heater-easy-to-use-electric-with-lid-for-gentle-hair-removal-400-ml-capacity-silicone-wax-warmer-pot-paraffin-wax-warmer-for-women-men",
    "beauty-cosmetic-kit-for-girls-safe-fun-play-makeup-set-with-carry-case-non-toxic-washable-pretend-play-beauty-box-kids-gift",
    "rechargeable-neck-fan-portable-bladeless-neck-fan-for-cooling-hands-free-3-speed-wearable-fan-for-sports-travel-outdoor",
    "mini-portable-washing-machine-foldable-bucket-for-baby-clothes-underwear-socks-small-apartments-travel-dorm",
    "wireless-bluetooth-earbuds-tws-pro-6-touch-control-stereo-sound-noise-cancelling-earphones-with-charging-case",
    "solar-motion-sensor-light-outdoor-security-wall-lamp-for-garden-pathway-front-door",
    "electric-bottle-opener-automatic-corkscrew-gift-set-with-foil-cutter-wine-pourer-vacuum-stopper",
    "professional-kitchen-knife-sharpener-3-stage-manual-sharpening-tool-for-dull-knives"
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
    fs.writeFileSync('batch2b_images.json', JSON.stringify(results, null, 2));
}

getImages();
