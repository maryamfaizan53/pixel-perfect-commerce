
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';
const query = '{ collections(first: 50) { edges { node { title handle } } } }';
fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query })
}).then(r => r.json()).then(d => {
    d.data.collections.edges.forEach(e => {
        if (['Top Selling Products', 'Home and Living', 'Health And Beauty'].includes(e.node.title)) {
            console.log(`${e.node.title} === ${e.node.handle}`);
        }
    });
});
