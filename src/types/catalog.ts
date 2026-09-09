/**
 * Storefront types — the shape returned by the FastAPI backend (`/api/*`).
 * Replaces the old Shopify GraphQL `edges/node` types from `src/lib/shopify.ts`.
 */

export interface ProductImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface ProductVideo {
  kind: "file" | "external";
  url: string;
  poster: string | null;
}

export interface CategoryRef {
  slug: string;
  title: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  key: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  selectedOptions: { name: string; value: string }[];
  image: string | null;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductSeo {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  noIndex: boolean;
}

/** Card / grid tile. */
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  productType: string;
  vendor: string;
  tags: string[];
  categories: CategoryRef[];
  price: number;
  compareAtPrice: number | null;
  currency: "PKR";
  inStock: boolean;
  featured: boolean;
  hasVideo: boolean;
  images: ProductImage[];
  rating: ProductRating | null;
}

/** Full product-detail payload. */
export interface Product extends ProductCard {
  bodyHtml: string | null;
  sku: string | null;
  barcode: string | null;
  weightGrams: number | null;
  videos: ProductVideo[];
  options: ProductOption[];
  variants: ProductVariant[];
  seo: ProductSeo;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  bodyHtml: string | null;
  featured: boolean;
  order: number;
  image: ProductImage | null;
  seo: ProductSeo;
}

export interface ProductList {
  items: ProductCard[];
  total: number;
  offset: number;
  limit: number;
}

export interface CategoryWithProducts {
  category: Category;
  products: ProductCard[];
}

export interface HomeRow {
  category: Category;
  products: ProductCard[];
}

export interface HomePayload {
  featuredCategories: Category[];
  rows: HomeRow[];
}

export interface SiteSettings {
  storeName: string;
  currency: "PKR";
  whatsappNumber: string;
  supportEmail: string | null;
  deliveryCharge: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  announcements: string[];
  socialLinks: Record<string, string | null>;
}

/* ---- checkout ---- */

export interface CartLineInput {
  productId: string;
  slug: string;
  variantKey: string | null;
  quantity: number;
}

export interface QuoteLine {
  productId: string;
  slug: string;
  variantKey: string | null;
  title: string;
  variantTitle: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  imageUrl: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: "PKR";
  freeShippingThreshold: number;
  valid: boolean;
  issues: string[];
}

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export interface CreateOrderInput {
  email: string;
  paymentMethod: "cod" | "online";
  address: ShippingAddressInput;
  lines: CartLineInput[];
  notes?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total: number;
  redirectUrl: string | null;
}

export interface OrderItemDetail {
  productTitle: string;
  variantTitle: string | null;
  productSlug: string | null;
  quantity: number;
  price: number;
  total: number;
  imageUrl: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  email: string;
  phone: string | null;
  customerName: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    province?: string;
    postalCode?: string | null;
    country?: string;
  } | null;
  notes: string | null;
  createdAt: string;
  items: OrderItemDetail[];
}
