/**
 * Utility for Meta Pixel (Facebook Pixel) events
 */

// Toggle this to true if your Meta Catalogue uses full Shopify GIDs (e.g., gid://shopify/Product/123456789)
// Toggle to false if your catalogue uses only numeric IDs (e.g., 123456789)
const USE_FULL_GID = true;

/**
 * Formats a Shopify ID for Meta Pixel catalogue matching.
 * @param shopifyId The full Shopify GID (e.g., gid://shopify/Product/123456789)
 * @returns Formatted ID string
 */
export const formatProductId = (shopifyId: string): string => {
    if (USE_FULL_GID) return shopifyId;
    return shopifyId.split('/').pop() || '';
};

/**
 * Safely tracks a Meta Pixel event
 * @param eventName Name of the event (e.g., 'ViewContent', 'AddToCart')
 * @param params Event parameters
 */
export const trackMetaEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', eventName, params);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Meta Pixel] Tracked ${eventName}:`, params);
        }
    }
};
