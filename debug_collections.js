
import { storefrontApiRequest, STOREFRONT_COLLECTIONS_QUERY } from './src/lib/shopify.js';

async function listCollections() {
    try {
        const data = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first: 50 });
        const collections = data.data.collections.edges;
        console.log('Collections:');
        collections.forEach(c => {
            console.log(`- Title: ${c.node.title}, Handle: ${c.node.handle}, ID: ${c.node.id}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

listCollections();
