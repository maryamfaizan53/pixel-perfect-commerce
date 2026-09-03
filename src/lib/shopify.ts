/**
 * ⚠️ DEPRECATED SHIM — Shopify has been removed.
 *
 * The catalog now comes from Sanity via the FastAPI backend (`src/lib/api.ts`).
 * This file only remains so pages that haven't been migrated yet still compile.
 * Migrated: Index, Header, ProductCard, HeroCategories, CategoryGrid,
 *           CategoryProductRow, FeaturedProducts, CartDrawer, cartStore.
 * TODO:     SearchOverlay, CategoryPage, ProductPage, Wishlist, Account, CartPage.
 */

const NOT_MIGRATED = "This screen still uses the old Shopify client — migrate it to src/lib/api.ts";

export interface ShopifyCollection {
  node: { id: string; title: string; handle: string; description: string; image?: { url: string } };
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    availableForSale: boolean;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    media: { edges: Array<{ node: any }> };
    variants: { edges: Array<{ node: any }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface CollectionData {
  title: string;
  description: string;
  handle: string;
  image?: { url: string; altText: string | null };
  products: ShopifyProduct[];
}

export const SHOPIFY_STOREFRONT_URL = "";
export const buildSearchQuery = (t: string) => t;

export async function storefrontApiRequest(): Promise<never> { throw new Error(NOT_MIGRATED); }
export async function fetchProducts(): Promise<ShopifyProduct[]> { throw new Error(NOT_MIGRATED); }
export async function fetchCollections(): Promise<ShopifyCollection[]> { throw new Error(NOT_MIGRATED); }
export async function fetchProductsByCollection(): Promise<CollectionData | null> { throw new Error(NOT_MIGRATED); }
export async function fetchProductByHandle(): Promise<ShopifyProduct | null> { throw new Error(NOT_MIGRATED); }
export async function createStorefrontCheckout(): Promise<string> { throw new Error(NOT_MIGRATED); }
