
import { storefrontApiRequest, STOREFRONT_COLLECTIONS_QUERY, STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY } from './src/lib/shopify.ts';

async function debugHome() {
    try {
        console.log("--- Collection List ---");
        const data = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first: 50 });
        const collections = data.data.collections.edges;

        for (const c of collections) {
            const handle = c.node.handle;
            const title = c.node.title;

            const pData = await storefrontApiRequest(STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY, { handle, first: 5 });
            const productCount = pData.data.collection?.products.edges.length || 0;

            console.log(`Title: "${title}", Handle: "${handle}", Products: ${productCount}`);
        }

        console.log("\n--- Specific Handle Check ---");
        const testHandles = ['top-selling-products', 'frontpage', 'household', 'heaters', 'health-and-beauty'];
        for (const h of testHandles) {
            const pData = await storefrontApiRequest(STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY, { handle: h, first: 1 });
            if (pData.data.collection) {
                console.log(`Handle "${h}" FOUND! Title: "${pData.data.collection.title}"`);
            } else {
                console.log(`Handle "${h}" NOT FOUND!`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

debugHome();
