
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const GoogleAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) {
            console.warn('Google Analytics Measurement ID is missing. Analytics will not be tracked.');
            return;
        }

        // Initialize GA4 script if not already present
        const scriptId = 'ga4-script';
        if (!document.getElementById(scriptId)) {
            window.dataLayer = window.dataLayer || [];
            function gtag(...args: any[]) {
                window.dataLayer.push(args);
            }
            window.gtag = gtag;

            // Consent Mode v2 Defaults - Denied by default
            const savedConsent = localStorage.getItem('cookie_consent');
            const consentState = savedConsent === 'granted' ? 'granted' : 'denied';

            gtag('consent', 'default', {
                'ad_storage': consentState,
                'ad_user_data': consentState,
                'ad_personalization': consentState,
                'analytics_storage': consentState
            });

            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            document.head.appendChild(script);

            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID);
        }
    }, []);

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) return;

        // Track page view on route change
        if (window.gtag) {
            window.gtag('config', GA_MEASUREMENT_ID, {
                page_path: location.pathname + location.search
            });
        }
    }, [location]);

    return null;
};
