/**
 * Temporary adapter: map the new API `Product` / `ProductCard` back to the old
 * Shopify `edges/node` shape so the not-yet-rewritten screens (SearchOverlay,
 * CategoryPage, ProductPage) keep working. Delete once those use the DTO directly.
 */
import type { Product, ProductCard } from "@/types/catalog";
import type { ShopifyProduct } from "@/lib/shopify";

/** ShopifyProduct (adapter output or legacy) -> ProductCard DTO, for <ProductCard>. */
export function fromShopifyShape(sp: ShopifyProduct): ProductCard {
  const n: any = sp.node;
  return {
    id: n.id,
    slug: n.handle,
    title: n.title,
    excerpt: n.description ?? "",
    productType: n.productType ?? "",
    vendor: n.vendor ?? "",
    tags: n.tags ?? [],
    categories: [],
    price: parseFloat(n.priceRange?.minVariantPrice?.amount ?? "0"),
    compareAtPrice: n.compareAtPriceRange?.minVariantPrice?.amount
      ? parseFloat(n.compareAtPriceRange.minVariantPrice.amount)
      : null,
    currency: (n.priceRange?.minVariantPrice?.currencyCode ?? "PKR") as "PKR",
    inStock: n.availableForSale ?? true,
    featured: false,
    hasVideo: (n.media?.edges ?? []).some((e: any) => e.node?.mediaContentType !== "IMAGE"),
    images: (n.media?.edges ?? [])
      .filter((e: any) => e.node?.mediaContentType === "IMAGE" || e.node?.image?.url)
      .map((e: any) => ({ url: e.node.image?.url ?? e.node.previewImage?.url, alt: n.title, width: null, height: null }))
      .filter((i: any) => i.url),
    rating: n.rating ?? null,
  };
}

export function toShopifyShape(p: Product | ProductCard): ShopifyProduct {
  const full = p as Partial<Product>;
  const images = p.images.map((img) => ({
    node: {
      mediaContentType: "IMAGE" as const,
      previewImage: { url: img.url },
      image: { url: img.url },
    },
  }));
  const videos = (full.videos ?? []).map((v) => ({
    node:
      v.kind === "file"
        ? { mediaContentType: "VIDEO" as const, previewImage: { url: v.poster ?? "" }, sources: [{ url: v.url, mimeType: "video/mp4", format: "mp4" }] }
        : { mediaContentType: "EXTERNAL_VIDEO" as const, previewImage: { url: v.poster ?? "" }, embeddedUrl: v.url },
  }));

  const variantEdges =
    full.variants && full.variants.length
      ? full.variants.map((v) => ({
          node: {
            id: v.key,
            title: v.title,
            price: { amount: String(v.price), currencyCode: p.currency },
            compareAtPrice: v.compareAtPrice ? { amount: String(v.compareAtPrice), currencyCode: p.currency } : null,
            availableForSale: v.inStock,
            selectedOptions: v.selectedOptions,
            image: v.image ? { url: v.image } : null,
            sku: full.sku ?? "",
          },
        }))
      : [
          {
            node: {
              id: `${p.id}-default`,
              title: "Default Title",
              price: { amount: String(p.price), currencyCode: p.currency },
              compareAtPrice: p.compareAtPrice ? { amount: String(p.compareAtPrice), currencyCode: p.currency } : null,
              availableForSale: p.inStock,
              selectedOptions: [] as { name: string; value: string }[],
              image: p.images[0] ? { url: p.images[0].url } : null,
              sku: full.sku ?? "",
            },
          },
        ];

  return {
    node: {
      id: p.id,
      title: p.title,
      description: p.excerpt,
      descriptionHtml: full.bodyHtml ?? "",
      handle: p.slug,
      productType: p.productType,
      vendor: p.vendor,
      tags: p.tags,
      availableForSale: p.inStock,
      priceRange: { minVariantPrice: { amount: String(p.price), currencyCode: p.currency } },
      compareAtPriceRange: {
        minVariantPrice: { amount: String(p.compareAtPrice ?? p.price), currencyCode: p.currency },
      },
      featuredImage: p.images[0] ? { url: p.images[0].url } : null,
      media: { edges: [...images, ...videos] },
      variants: { edges: variantEdges },
      options: full.options ?? [],
      collections: {
        edges: (p.categories ?? []).map((c) => ({ node: { handle: c.slug, title: c.title } })),
      },
      seo: full.seo ?? { title: null, description: null, ogImage: null, noIndex: false },
      rating: p.rating,
    },
  } as unknown as ShopifyProduct;
}
