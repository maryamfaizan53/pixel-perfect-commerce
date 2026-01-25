
import { storefrontApiRequest, STOREFRONT_COLLECTIONS_QUERY, STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY } from './src/lib/shopify.ts';

async function listAll() {
    try {
        const data = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first: 100 });
        const collections = data.data.collections.edges;
        console.log("COLLECTIONS FOUND:");
        for (const c of collections) {
            const handle = c.node.handle;
            const title = c.node.title;
            const pData = await storefrontApiRequest(STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY, { handle, first: 1 });
            const count = pData.data.collection?.products.edges.length || 0;
            console.log(`- ${title} (Handle: ${handle}) - Products found: ${count}`);
        }
    } catch (e) {
        console.error(e);
    }
}

listAll();
