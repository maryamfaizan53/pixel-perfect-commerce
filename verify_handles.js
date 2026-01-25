
import { storefrontApiRequest, STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY } from './src/lib/shopify.ts';

async function checkCollection(handle) {
    try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY, { handle, first: 1 });
        if (data.data.collection) {
            console.log(`Found collection: ${handle} -> Title: ${data.data.collection.title}`);
        } else {
            console.log(`Collection NOT found: ${handle}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await checkCollection('frontpage');
    await checkCollection('top-selling-products');
}

run();
