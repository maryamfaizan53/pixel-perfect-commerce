import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackMetaEvent } from '@/lib/meta-pixel';

/**
 * Hook to track page views with Meta Pixel on route changes
 * Automatically fires fbq('track', 'PageView') whenever the route changes
 */
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Track page view using our utility
        trackMetaEvent('PageView');
    }, [location.pathname]); // Re-run when pathname changes
};
