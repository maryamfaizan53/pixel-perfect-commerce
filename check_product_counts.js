
import { storefrontApiRequest, STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY } from './src/lib/shopify.ts';

async function checkProducts(handle) {
    try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY, { handle, first: 10 });
        if (data.data.collection) {
            console.log(`Collection: ${handle}`);
            console.log(`- Title: ${data.data.collection.title}`);
            console.log(`- Products: ${data.data.collection.products.edges.length}`);
        } else {
            console.log(`Collection NOT found: ${handle}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await checkProducts('top-selling-products');
    await checkProducts('frontpage');
    await checkProducts('household');
}

run();
