
import fetch from 'node-fetch';

/**
 * SIMULATED LOGIC FROM OUR APP
 */
const USE_FULL_GID = false;
const formatProductId = (shopifyId) => {
    if (USE_FULL_GID) return shopifyId;
    return shopifyId.split('/').pop() || '';
};

// Shopify Storefront Credentials
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'next-shop-apex-c8kgm.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/2024-04/graphql.json`;

// Meta / Supabase Endpoint
const SB_URL = "https://jnunreauvcqvekcuzseg.supabase.co/functions/v1/meta-conversions";
const SB_ANON_KEY = "sb_publishable_CFXB86HMxZDE_X0kEcqQXw_SUXKs1Ac";
const TEST_CODE = "TEST441"; // Update this with your current test code from Meta Events Manager

const PRODUCT_QUERY = `
  query {
    products(first: 1) {
      edges {
        node {
          id
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

async function simulateProductView() {
    console.log("🚀 SIMULATING: User visits a product page on AI Bazar...");

    try {
        // 1. Fetch real product data
        const shopifyResponse = await fetch(SHOPIFY_STOREFRONT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
            },
            body: JSON.stringify({ query: PRODUCT_QUERY }),
        });
        const shopifyResult = await shopifyResponse.json();
        const product = shopifyResult.data.products.edges[0]?.node;

        if (!product) {
            console.log("❌ Failed to fetch product data from Shopify.");
            return;
        }

        // 2. Format the data exactly like our `ProductPage.tsx` logic
        const formattedId = formatProductId(product.id);
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        const currency = product.priceRange.minVariantPrice.currencyCode;

        console.log(`📦 Product: "${product.title}"`);
        console.log(`🆔 Original ID: ${product.id}`);
        console.log(`🎯 Match-Ready ID: ${formattedId}`);
        console.log(`💰 Price: ${currency} ${price}`);

        // 3. Send to CAPI (Supabase Edge Function)
        const payload = {
            event_name: 'ViewContent',
            event_id: 'sim_test_' + Date.now(),
            event_source_url: `https://www.aibazar.pk/product/simulation`,
            test_event_code: TEST_CODE,
            user_data: {
                email: 'test-user@aibazar.pk', // Simulated user data for matching
                fbp: 'fb.1.1737750123456.123456789'
            },
            custom_data: {
                content_ids: [formattedId],
                content_name: product.title,
                content_type: 'product',
                value: price,
                currency: currency
            }
        };

        console.log("\n📡 Sending simulated event to Meta via Supabase...");

        const response = await fetch(SB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SB_ANON_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ SUCCESS: Event processed by Supabase and accepted by Meta Cloud.");
            console.log("🔗 Meta Trace ID:", result.fbtrace_id);
            console.log("\n✨ TEST COMPLETE: Open your Meta Events Manager -> Test Events tab.");
            console.log("   You should see a 'ViewContent' event for this product with the numeric ID.");
        } else {
            console.log("❌ FAILED:", result);
        }

    } catch (error) {
        console.error("❗ Network/Simulation Error:", error.message);
    }
}

simulateProductView();
