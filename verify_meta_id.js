
import fetch from 'node-fetch';

/**
 * Mocking the logic from src/lib/meta-pixel.ts to verify the ID transformation
 */

const USE_FULL_GID = false;

const formatProductIdMock = (shopifyId) => {
    if (USE_FULL_GID) return shopifyId;
    return shopifyId.split('/').pop() || '';
};

// Shopify Storefront Credentials
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/2024-04/graphql.json`;

const PRODUCT_QUERY = `
  query {
    products(first: 1) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

async function verifyIdFormat() {
    console.log("🔍 Fetching a sample product from Shopify Storefront API...");

    try {
        const response = await fetch(SHOPIFY_STOREFRONT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
            },
            body: JSON.stringify({ query: PRODUCT_QUERY }),
        });

        const result = await response.json();

        if (!result.data || !result.data.products) {
            console.log("❌ Failed to fetch data. Response:", JSON.stringify(result));
            return;
        }

        const product = result.data.products.edges[0]?.node;

        if (!product) {
            console.log("❌ No products found in the store.");
            return;
        }

        const originalId = product.id;
        const formattedId = formatProductIdMock(originalId);

        console.log(`\n--- Verification Results ---`);
        console.log(`Product Title: ${product.title}`);
        console.log(`Original GID:  ${originalId}`);
        console.log(`Formatted ID: ${formattedId}`);

        const isNumeric = /^\d+$/.test(formattedId);

        if (isNumeric && !formattedId.includes('gid://')) {
            console.log("\n✅ SUCCESS: The ID transformation logic is working correctly.");
            console.log("   The output is a simple numeric ID, which matches standard catalogue formats.");
        } else {
            console.log("\n❌ FAILURE: The ID is still in GID format or incorrect.");
        }

    } catch (error) {
        console.error("❗ Error during verification:", error.message);
    }
}

verifyIdFormat();
