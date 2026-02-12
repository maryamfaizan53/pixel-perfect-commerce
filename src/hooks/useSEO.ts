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
    // Article-specific meta (for blog posts)
    articlePublishedTime?: string;
    articleModifiedTime?: string;
    articleAuthor?: string;
    articleSection?: string;
    articleTags?: string[];
    schema?: any[]; // For injecting custom JSON-LD schema
}

/**
 * Hook to dynamically update SEO meta tags in a React application.
 * This is a lightweight alternative to react-helmet.
 */
export const useSEO = ({ title, description, keywords, ogImage, canonical, ogType = 'website', priceAmount, priceCurrency, availability, retailerItemId, articlePublishedTime, articleModifiedTime, articleAuthor, articleSection, articleTags, schema }: SEOProps) => {
    useEffect(() => {
        // Auto-generate canonical from current URL if not provided
        // Normalize duplicate routes: /product/ -> /products/, /category/ -> /collections/
        if (!canonical) {
            let currentUrl = window.location.origin + window.location.pathname;
            // Normalize /product/:handle to /products/:handle
            currentUrl = currentUrl.replace(/\/product\//, '/products/');
            // Normalize /category/:cat to /collections/:cat (but not /category alone)
            currentUrl = currentUrl.replace(/\/category\/(.+)/, '/collections/$1');
            // Remove trailing slash
            currentUrl = currentUrl.replace(/\/$/, '');
            canonical = currentUrl;
        }
        // 1. Update Title
        if (title) {
            // Avoid double-appending suffix if already present
            const suffix = ' | AI Bazar Pakistan';
            const fullTitle = title.includes('AI Bazar') ? title : `${title}${suffix}`;
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

        // 7. Update Article Meta (if applicable)
        if (ogType === 'article') {
            const setMeta = (property: string, content: string) => {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            };

            if (articlePublishedTime) setMeta('article:published_time', articlePublishedTime);
            if (articleModifiedTime) setMeta('article:modified_time', articleModifiedTime);
            if (articleAuthor) setMeta('article:author', articleAuthor);
            if (articleSection) setMeta('article:section', articleSection);
            if (articleTags) {
                // Remove old article:tag metas
                document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
                articleTags.forEach(tag => {
                    const meta = document.createElement('meta');
                    meta.setAttribute('property', 'article:tag');
                    meta.setAttribute('content', tag);
                    document.head.appendChild(meta);
                });
            }
        }

        // 8. Update Canonical
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

        // 9. Inject JSON-LD Schema
        const injectionTarget = document.head;
        const schemaId = 'seo-dynamic-json-ld';
        let script = document.getElementById(schemaId) as HTMLScriptElement;

        if (script) script.remove();

        const schemasToInject = schema ? [...schema] : [];

        // Special: If it's the homepage, always inject Organization schema for E-E-A-T
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            const orgSchema = {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://www.aibazar.pk/#organization",
                "name": "AI Bazar",
                "url": "https://www.aibazar.pk",
                "logo": "https://www.aibazar.pk/logo.png",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+92-332-8222026",
                    "contactType": "customer service",
                    "areaServed": "PK",
                    "availableLanguage": ["English", "Urdu"]
                },
                "sameAs": [
                    "https://www.facebook.com/aibazar",
                    "https://www.instagram.com/aibazar",
                    "https://www.tiktok.com/@aibazar_pk",
                    "https://www.youtube.com/@aibazarpk"
                ]
            };
            schemasToInject.push(orgSchema);
        }

        if (schemasToInject.length > 0) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = schemaId;
            script.text = JSON.stringify(schemasToInject);
            injectionTarget.appendChild(script);
        }

        return () => {
            const cleanupScript = document.getElementById(schemaId);
            if (cleanupScript) cleanupScript.remove();
        };
    }, [title, description, keywords, ogImage, canonical, ogType, priceAmount, priceCurrency, availability, retailerItemId, articlePublishedTime, articleModifiedTime, articleAuthor, articleSection, articleTags, schema]);
};
