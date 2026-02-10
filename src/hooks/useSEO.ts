import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonical?: string;
    ogType?: 'website' | 'product' | 'article';
    priceAmount?: string;
    priceCurrency?: string;
    availability?: 'instock' | 'outofstock' | 'preorder' | 'available for order' | 'discontinued' | 'pending';
    retailerItemId?: string;
}

/**
 * Hook to dynamically update SEO meta tags in a React application.
 * This is a lightweight alternative to react-helmet.
 */
export const useSEO = ({ title, description, keywords, ogImage, canonical, ogType = 'website', priceAmount, priceCurrency, availability, retailerItemId }: SEOProps) => {
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
            let ogImg = document.querySelector('meta[property="og:image"]');
            if (!ogImg) {
                ogImg = document.createElement('meta');
                ogImg.setAttribute('property', 'og:image');
                document.head.appendChild(ogImg);
            }
            ogImg.setAttribute('content', ogImage);

            let twitterImg = document.querySelector('meta[name="twitter:image"]');
            if (!twitterImg) {
                twitterImg = document.createElement('meta');
                twitterImg.setAttribute('name', 'twitter:image');
                document.head.appendChild(twitterImg);
            }
            twitterImg.setAttribute('content', ogImage);

            // Twitter Card type
            let twitterCard = document.querySelector('meta[name="twitter:card"]');
            if (!twitterCard) {
                twitterCard = document.createElement('meta');
                twitterCard.setAttribute('name', 'twitter:card');
                document.head.appendChild(twitterCard);
            }
            twitterCard.setAttribute('content', 'summary_large_image');
        }

        // 5. Update OG Type
        let ogTypeTag = document.querySelector('meta[property="og:type"]');
        if (!ogTypeTag) {
            ogTypeTag = document.createElement('meta');
            ogTypeTag.setAttribute('property', 'og:type');
            document.head.appendChild(ogTypeTag);
        }
        ogTypeTag.setAttribute('content', ogType);

        // 6. Update Product Meta (if applicable)
        if (ogType === 'product') {
            if (priceAmount) {
                let ogPriceAmount = document.querySelector('meta[property="product:price:amount"]');
                if (!ogPriceAmount) {
                    ogPriceAmount = document.createElement('meta');
                    ogPriceAmount.setAttribute('property', 'product:price:amount');
                    document.head.appendChild(ogPriceAmount);
                }
                ogPriceAmount.setAttribute('content', priceAmount);

                let ogPriceCurrency = document.querySelector('meta[property="product:price:currency"]');
                if (!ogPriceCurrency) {
                    ogPriceCurrency = document.createElement('meta');
                    ogPriceCurrency.setAttribute('property', 'product:price:currency');
                    document.head.appendChild(ogPriceCurrency);
                }
                ogPriceCurrency.setAttribute('content', priceCurrency || 'PKR');
            }

            if (availability) {
                let ogAvailability = document.querySelector('meta[property="product:availability"]');
                if (!ogAvailability) {
                    ogAvailability = document.createElement('meta');
                    ogAvailability.setAttribute('property', 'product:availability');
                    document.head.appendChild(ogAvailability);
                }
                ogAvailability.setAttribute('content', availability);
            }

            if (retailerItemId) {
                let ogRetailerItemId = document.querySelector('meta[property="product:retailer_item_id"]');
                if (!ogRetailerItemId) {
                    ogRetailerItemId = document.createElement('meta');
                    ogRetailerItemId.setAttribute('property', 'product:retailer_item_id');
                    document.head.appendChild(ogRetailerItemId);
                }
                ogRetailerItemId.setAttribute('content', retailerItemId);
            }
        }

        // 7. Update Canonical
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

            // Also update og:url to match canonical
            let ogUrl = document.querySelector('meta[property="og:url"]');
            if (!ogUrl) {
                ogUrl = document.createElement('meta');
                ogUrl.setAttribute('property', 'og:url');
                document.head.appendChild(ogUrl);
            }
            ogUrl.setAttribute('content', canonical);
        }
    }, [title, description, keywords, ogImage, canonical, ogType, priceAmount, priceCurrency, availability, retailerItemId]);
};
