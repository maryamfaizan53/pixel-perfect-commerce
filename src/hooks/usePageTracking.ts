import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface to include fbq
declare global {
    interface Window {
        fbq?: (action: string, eventName: string, params?: Record<string, any>) => void;
    }
}

/**
 * Hook to track page views with Meta Pixel on route changes
 * Automatically fires fbq('track', 'PageView') whenever the route changes
 */
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Check if fbq is available (Meta Pixel loaded)
        if (typeof window.fbq === 'function') {
            // Track page view
            window.fbq('track', 'PageView');

            console.log('Meta Pixel: PageView tracked for', location.pathname);
        } else {
            console.warn('Meta Pixel not loaded - fbq is not available');
        }
    }, [location.pathname]); // Re-run when pathname changes
};
