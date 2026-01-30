
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
  "6-in-1-rechargeable-beauty-eyebrow-trimmer-hair-shaver-electric-razor-for-women-precision-hair-removal-for-face-body-lips-nose-ear",
  "smart-rechargeable-massage-mat-portable-full-body-relaxation-targeted-neck-back-and-leg-pain-relief-at-home-with-comfort-control-vibration-heat",
  "rechargeable-neck-fan-portable-bladeless-neck-fan-for-cooling-hands-free-3-speed-wearable-fan-for-sports-travel-outdoor",
  "cute-panda-night-light-silicone-soft-lamp",
  "hair-dryer-brush-hot-air-hair-brush-styler-for-straightening-curling-electric-blower-brush-volumizer-warm-air-comb-one-step-dryer",
  "duck-track-toy",
  "mini-duck-water-dispenser-toy-drinking-fountain-cute-yellow-duck-design-with-realistic-water-flow-eco-friendly-abs-material-battery-operated-kids-pretend-play-toy-gift-with-cups-for-boys-and-girls-age-3",
  "intelligence-book-english-letters-words-learning-language-e-book-toddlers-preschool-educational-toys",
  "2-in-1-coffee-beater-rechargeable-smooth-mixing-easy-use-compact-design-comfortable-handling",
  "digital-kitchen-weight-scale-10-kg-capacity-measures-in-g-oz-without-led"
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
  fs.writeFileSync('batch2c_images.json', JSON.stringify(results, null, 2));
}

getImages();
