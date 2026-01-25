import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonical?: string;
}

/**
 * Hook to dynamically update SEO meta tags in a React application.
 * This is a lightweight alternative to react-helmet.
 */
export const useSEO = ({ title, description, keywords, ogImage, canonical }: SEOProps) => {
    useEffect(() => {
        // 1. Update Title
        if (title) {
            const fullTitle = `${title} | AI Bazar Pakistan`;
            document.title = fullTitle;

            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', fullTitle);

            const twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);
        }

        // 2. Update Description
        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) metaDescription.setAttribute('content', description);

            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) ogDescription.setAttribute('content', description);

            const twitterDescription = document.querySelector('meta[name="twitter:description"]');
            if (twitterDescription) twitterDescription.setAttribute('content', description);
        }

        // 3. Update Keywords
        if (keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        }

        // 4. Update OG Image
        if (ogImage) {
            const ogImg = document.querySelector('meta[property="og:image"]');
            if (ogImg) ogImg.setAttribute('content', ogImage);

            const twitterImg = document.querySelector('meta[name="twitter:image"]');
            if (twitterImg) twitterImg.setAttribute('content', ogImage);
        }

        // 5. Update Canonical
        if (canonical) {
            let linkCanonical = document.querySelector('link[rel="canonical"]');
            if (linkCanonical) {
                linkCanonical.setAttribute('href', canonical);
            } else {
                linkCanonical = document.createElement('link');
                linkCanonical.setAttribute('rel', 'canonical');
                linkCanonical.setAttribute('href', canonical);
                document.head.appendChild(linkCanonical);
            }
        }
    }, [title, description, keywords, ogImage, canonical]);
};
