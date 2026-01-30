
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
    "mandoline-slicer-safe-adjustable-vegetable-cutter-multi-purpose-kitchen-chopper-manual-grater-random-colour",
    "1-pair-medicated-insole-for-shoes-pain-relief-shock-absorption-arch-support-all-day-comfort-for-walking-sports-daily-wearsize10",
    "karseell-maca-power-collagen-hair-mask-deep-essence-repair-for-dry-damaged-hair-500ml",
    "gegemon-orange-enzymes-exfoliating-brightening-gel-deep-clean-smooth-skin-remove-dead-cells-instant-glow-even-tone-face-gel",
    "heart-couple-rings-elegant-stylish-durable-design-symbol-of-love-and-commitment-for-couples-adjustable-size-color",
    "star-couple-rings-adjustable-matching-rings-with-elegant-star-design-for-couples",
    "5-pieces-handbag-set",
    "calvin-klein-mens-watch-with-square-dial-elegant-modern-and-durable-timepiece-for-daily-wear-and-special-occasions-without-box",
    "the-radiance-of-modern-elegance-chanel-no-5-l-eau-a-luminous-reinterpretation-of-a-fragrance-icon",
    "the-midnight-elegance-gold-tone-jewelry-timepiece-collection"
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
    fs.writeFileSync('batch2c_images.json', JSON.stringify(results, null, 2));
}

getImages();
