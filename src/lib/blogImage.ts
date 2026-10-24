/**
 * Blog post images. The original blogData image URLs are dead (Shopify store
 * removed) or placeholders (/api/placeholder/...), so we map each post to a
 * real, working catalog image by its category.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  electronics: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2025/11/05/1ea1df56d42c7c2c292e2e53b712df03.jpeg",
  fashion: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2024/05/WhatsApp-Image-2024-05-22-at-1.50.17-PM-1.jpeg",
  home: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2025/11/04/39d58675388d4a8efcb2bbc96624fc0b.jpeg",
  beauty: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2025/11/05/d1fcd13b45e65a3f5ced731fc4376533.jpeg",
  kitchen: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2025/11/05/1ea1df56d42c7c2c292e2e53b712df03.jpeg",
  health: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2025/11/06/db6f099557e55b6f8832120bbc90bc6c.png",
  hair: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2025/11/17/bba075ffd849b5c9c6880c537f040d5b.jpeg",
  baby: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2026/09/29/6f014be971fbbf8a53174c67401aa3c3.jpg",
  cleaning: "https://hhcnewapp.blr1.cdn.digitaloceanspaces.com/uploads/2023/12/WhatsApp-Image-2023-11-30-at-3.43.57-PM.jpeg",
};

/** Default when no category matches. */
export const DEFAULT_BLOG_IMAGE = CATEGORY_IMAGES.home;

/** Pick a real image for a blog post from its category. */
export function getBlogImage(post?: { category?: string; image?: string }): string {
  const c = (post?.category || "").toLowerCase();
  if (/gadget|tech|electronic|mobile/.test(c)) return CATEGORY_IMAGES.electronics;
  if (/fashion|cloth|wear|style|accessor|jewel|watch/.test(c)) return CATEGORY_IMAGES.fashion;
  if (/kitchen|cook|food|recipe/.test(c)) return CATEGORY_IMAGES.kitchen;
  if (/beauty|personal care|skincare|cosmetic|makeup|grooming/.test(c)) return CATEGORY_IMAGES.beauty;
  if (/\bhair\b/.test(c)) return CATEGORY_IMAGES.hair;
  if (/health|wellness|medical|care tips/.test(c)) return CATEGORY_IMAGES.health;
  if (/baby|kid|toy|mother/.test(c)) return CATEGORY_IMAGES.baby;
  if (/clean/.test(c)) return CATEGORY_IMAGES.cleaning;
  if (/home|garden|decor|living|household|furniture/.test(c)) return CATEGORY_IMAGES.home;
  return DEFAULT_BLOG_IMAGE;
}
