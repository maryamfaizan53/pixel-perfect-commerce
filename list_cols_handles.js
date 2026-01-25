
import { storefrontApiRequest, STOREFRONT_COLLECTIONS_QUERY } from './src/lib/shopify.ts';

async function listCollections() {
    try {
        const data = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first: 50 });
        const collections = data.data.collections.edges;
        console.log("Found collections:");
        collections.forEach(c => {
            console.log(`- Title: ${c.node.title}, Handle: ${c.node.handle}`);
        });
    } catch (e) {
        console.error(e);
    }
}

listCollections();
