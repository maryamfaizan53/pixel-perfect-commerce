/**
 * Append resize/quality params for the image CDNs this site uses
 * (Shopify + Unsplash). Any other host is returned untouched.
 */
export function cdnImage(src: string | undefined | null, width: number, quality = 75): string {
  if (!src) return "/placeholder.svg";
  try {
    const url = new URL(src, typeof window !== "undefined" ? window.location.origin : "https://a.b");
    if (url.hostname.includes("cdn.shopify.com")) {
      url.searchParams.set("width", String(width));
      if (!url.searchParams.has("quality")) url.searchParams.set("quality", String(quality));
      return url.toString();
    }
    if (url.hostname.includes("images.unsplash.com")) {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}
