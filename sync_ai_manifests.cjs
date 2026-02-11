const fs = require('fs');
const path = require('path');

const SHOPIFY_STOREFRONT_TOKEN = 'afc3b50fa1a47d2ca42338230468d047';
const SHOPIFY_STOREFRONT_URL = 'https://next-shop-apex-c8kgm.myshopify.com/api/2024-04/graphql.json';
const OUTPUT_FILE = path.join(__dirname, 'public', 'llms-products.txt');

const query = `
  query GetProducts($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          title
          handle
          description
          productType
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchAllProducts() {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  console.log('Fetching products from Shopify...');

  while (hasNextPage) {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify({
        query,
        variables: { cursor }
      })
    });

    const { data } = await response.json();
    const products = data.products.edges.map(edge => edge.node);
    allProducts = allProducts.concat(products);

    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
    console.log(`Fetched ${allProducts.length} products...`);
  }

  return allProducts;
}

async function sync() {
  try {
    const products = await fetchAllProducts();

    // Sort and format with rich details
    const content = [
      `# AI Bazar Pakistan - Full Product Catalog`,
      `> Total Products: ${products.length}`,
      `> Last Updated: ${new Date().toISOString().split('T')[0]}`,
      `> Goal: Provide high-quality original products at the lowest price in Pakistan with Free Express Shipping.`,
      `\n---\n`
    ];

    products.forEach(p => {
      const price = parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString();
      const currency = p.priceRange.minVariantPrice.currencyCode;
      const status = p.availableForSale ? 'In Stock' : 'Out of Stock';
      const shortDesc = p.description.length > 150 ? p.description.substring(0, 150) + '...' : p.description;

      content.push(`## [${p.title}](https://www.aibazar.pk/products/${p.handle})`);
      content.push(`- **Price**: ${currency} ${price}`);
      content.push(`- **Status**: ${status}`);
      content.push(`- **Category**: ${p.productType}`);
      content.push(`- **Description**: ${shortDesc}`);
      if (p.tags && p.tags.length > 0) {
        content.push(`- **Tags**: ${p.tags.slice(0, 5).join(', ')}`);
      }
      content.push(''); // Add spacing between products
    });

    fs.writeFileSync(OUTPUT_FILE, content.join('\n'), 'utf-8');
    console.log(`Successfully synced ${products.length} products with rich metadata to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

sync();
