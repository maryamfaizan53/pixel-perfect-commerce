import { supabase } from "@/integrations/supabase/client";

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
 * Safely tracks a Meta Pixel event across both Browser and Server (CAPI)
 * @param eventName Name of the event (e.g., 'ViewContent', 'AddToCart')
 * @param params Event parameters
 */
export const trackMetaEvent = async (eventName: string, params: Record<string, any> = {}) => {
    // 1. Generate unique event_id for deduplication
    const event_id = params.event_id || crypto.randomUUID();

    // 2. Browser Event (Pixel)
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', eventName, { ...params, eventID: event_id });
        if (import.meta.env.DEV) {
            console.log(`[Meta Pixel] Tracked ${eventName}:`, params, { event_id });
        }
    }

    // 3. Server Event (CAPI)
    try {
        // Send to Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('meta-conversions', {
            body: {
                event_name: eventName,
                event_id,
                event_source_url: window.location.href,
                user_data: {
                    // Try to get email/phone from localStorage if available (e.g., for returning customers)
                    email: localStorage.getItem('user-email') || undefined,
                    phone: localStorage.getItem('user-phone') || undefined,
                    // Advanced matching tokens if available
                    fbp: document.cookie.split('; ').find(row => row.startsWith('_fbp='))?.split('=')[1],
                    fbc: document.cookie.split('; ').find(row => row.startsWith('_fbc='))?.split('=')[1],
                },
                custom_data: params,
            },
        });

        if (error) {
            console.error('[Meta CAPI] Function error:', error);
        } else if (import.meta.env.DEV) {
            console.log(`[Meta CAPI] Tracked ${eventName}:`, data);
        }
    } catch (err) {
        console.error('[Meta CAPI] Request failed:', err);
    }
};
