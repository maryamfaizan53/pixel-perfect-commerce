
import fetch from 'node-fetch';
import fs from 'fs';

const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_API_VERSION = '2024-04';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';

const handles = [
    "flawless-facial-hair-remover-machine-for-women-high-quality-pocket-size-painless-face-hair-removing-machine-cell-operated",
    "kids-portable-study-table-multifunctional-plastic-desk-with-side-storage-56x40x30-cm-random-color",
    "multicolor-12-pcs-stylish-artificial-nails-set-for-fashionable-look-and-easy-application-random-design",
    "mosquito-killer-lamp",
    "stanley-pastel-edition-tumbler-elegant-floral-design-large-capacity",
    "a-luxurious-blend-of-iconic-designer-style-plush-comfort-and-premium-crafted-suede-materials",
    "tu-parlour-usa-lip-tint-providing-smooth-application-with-natural-colour-long-lasting-wear-and-comfortable",
    "greatnice-gts-2307-portable-bluetooth-speaker-providing-clear-sound-with-durable-quality-wireless-connectivity",
    "3-piece-hairbrush-mirror-set-elegant-wood-finish-grooming-styling-essentials",
    "vanity-mirror-lights-usb-vanity-lights-makeup-lighting-10-dimmable-light-bulbs"
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
    fs.writeFileSync('batch3a_images.json', JSON.stringify(results, null, 2));
}

getImages();
