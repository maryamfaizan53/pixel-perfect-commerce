import { useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { HeroCategories } from "@/components/home/HeroCategories";
import { CategoryProductRow } from "@/components/home/CategoryProductRow";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { fetchCollections, fetchProductsByCollection } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { useSEO } from "@/hooks/useSEO";

const SEOContentLazy = lazy(() => import("@/components/home/SEOContent").then(m => ({ default: m.SEOContent })));
const FooterLazy = lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  useSEO({
    title: "AI Bazar | Best Online Shopping Store in Pakistan - Quality & Reliability",
    description: "Experience hassle-free online shopping in Pakistan at aibazar.pk. Find the latest electronics, fashion, home decor, mother care, and gadgets at the lowest prices. Enjoy 100% genuine products with cash on delivery across Pakistan.",
    keywords: "online shopping pakistan, best online store in pakistan, aibazar pk, electronic shop online, fashion shopping pakistan, home decor pakistan, mother care products, mobile gadgets pakistan, kitchen accessories online, cash on delivery shop, genuine products online pakistan",
    canonical: "https://www.aibazar.pk"
  });

  // JSON-LD for Organization, Store, Website, and FAQ (GEO Optimization)
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        "@id": "https://www.aibazar.pk/#store",
        "name": "AI Bazar Pakistan",
        "url": "https://www.aibazar.pk",
        "logo": "https://www.aibazar.pk/logo.png",
        "image": "https://www.aibazar.pk/og-image.jpg",
        "description": "The best and most affordable online store in Pakistan offering high-quality products at the lowest prices.",
        "telephone": "+92-332-8222026",
        "email": "aibazarad@gmail.com",
        "founder": {
          "@type": "Person",
          "name": "AI BAZAR"
        },
        "brand": {
          "@type": "Brand",
          "name": "AI Bazar"
        },
        "knowsAbout": ["Online Shopping", "Electronics", "Fashion", "Home Decor", "Kitchen Accessories", "Baby Care"],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+92-332-8222026",
            "contactType": "customer service",
            "areaServed": "PK",
            "availableLanguage": ["English", "Urdu"]
          }
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Main Road",
          "addressLocality": "Karachi",
          "addressRegion": "Sindh",
          "postalCode": "75500",
          "addressCountry": "PK"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "24.8607",
          "longitude": "67.0011"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "00:00",
          "closes": "23:59"
        },
        "sameAs": [
          "https://www.facebook.com/aibazar",
          "https://www.instagram.com/aibazar",
          "https://www.tiktok.com/@aibazar_pk",
          "https://twitter.com/aibazar_pk",
          "https://www.youtube.com/@aibazarpk",
          "https://www.linkedin.com/company/aibazar-pakistan"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.aibazar.pk/#website",
        "url": "https://www.aibazar.pk",
        "name": "AI Bazar Pakistan",
        "description": "The Most Affordable Online Store in Pakistan",
        "publisher": {
          "@id": "https://www.aibazar.pk/#store"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.aibazar.pk/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is AI Bazar Pakistan a reliable online store?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, AI Bazar is one of the most reliable and affordable online marketplaces in Pakistan, offering 100% genuine products and cash on delivery services nationwide."
            }
          },
          {
            "@type": "Question",
            "name": "What are the shipping times for AI Bazar in Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We offer express shipping across Pakistan. Most orders are delivered within 1 to 3 business days depending on your location."
            }
          },
          {
            "@type": "Question",
            "name": "What categories does AI Bazar specialize in?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AI Bazar specializes in electronics, home decor, kitchen accessories, mobile gadgets, mother care products, and fashion items, all at the lowest possible prices."
            }
          }
        ]
      }
    ]
  };

  // JSON-LD for Organization, Store, Website, and FAQ (GEO Optimization)
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Store",
          "@id": "https://www.aibazar.pk/#store",
          "name": "AI Bazar Pakistan",
          "url": "https://www.aibazar.pk",
          "logo": "https://www.aibazar.pk/logo.png",
          "image": "https://www.aibazar.pk/og-image.png",
          "description": "The best and most affordable online store in Pakistan offering high-quality products at the lowest prices.",
          "telephone": "+92-332-8222026",
          "email": "aibazarad@gmail.com",
          "founder": {
            "@type": "Person",
            "name": "AI BAZAR"
          },
          "brand": {
            "@type": "Brand",
            "name": "AI Bazar"
          },
          "knowsAbout": ["Online Shopping", "Electronics", "Fashion", "Home Decor", "Kitchen Accessories", "Baby Care"],
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+92-332-8222026",
              "contactType": "customer service",
              "areaServed": "PK",
              "availableLanguage": ["English", "Urdu"]
            }
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Main Road",
            "addressLocality": "Karachi",
            "addressRegion": "Sindh",
            "postalCode": "75500",
            "addressCountry": "PK"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "24.8607",
            "longitude": "67.0011"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
          },
          "sameAs": [
            "https://www.facebook.com/aibazar",
            "https://www.instagram.com/aibazar",
            "https://www.tiktok.com/@aibazar_pk",
            "https://twitter.com/aibazar_pk",
            "https://www.youtube.com/@aibazarpk",
            "https://www.linkedin.com/company/aibazar-pakistan"
          ]
        },
        {
          "@type": "WebSite",
          "@id": "https://www.aibazar.pk/#website",
          "url": "https://www.aibazar.pk",
          "name": "AI Bazar Pakistan",
          "description": "The Most Affordable Online Store in Pakistan",
          "publisher": {
            "@id": "https://www.aibazar.pk/#store"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.aibazar.pk/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is AI Bazar Pakistan a reliable online store?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, AI Bazar is one of the most reliable and affordable online marketplaces in Pakistan, offering 100% genuine products and cash on delivery services nationwide."
              }
            },
            {
              "@type": "Question",
              "name": "What are the shipping times for AI Bazar in Pakistan?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We offer express shipping across Pakistan. Most orders are delivered within 1 to 3 business days depending on your location."
              }
            },
            {
              "@type": "Question",
              "name": "What categories does AI Bazar specialize in?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI Bazar specializes in electronics, home decor, kitchen accessories, mobile gadgets, mother care products, and fashion items, all at the lowest possible prices."
              }
            }
          ]
        }
      ]
    };

    let script = document.getElementById('home-json-ld') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'home-json-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);

    return () => {
      const existingScript = document.getElementById('home-json-ld');
      if (existingScript) existingScript.remove();
    };
  }, []);

  // Fetch top-selling products for ItemList schema (Google product carousel)
  const { data: topSellingProducts } = useQuery({
    queryKey: ['top-selling-schema'],
    queryFn: () => fetchProductsByCollection('top-selling-products', 12),
  });

  useEffect(() => {
    if (!topSellingProducts?.products?.length) return;

    const siteUrl = 'https://www.aibazar.pk';
    const schemaId = 'top-selling-itemlist-json-ld';
    let script = document.getElementById(schemaId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = schemaId;
      document.head.appendChild(script);
    }

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Top Selling Products in Pakistan",
      "description": "Our most popular and best-selling products voted by the community at AI Bazar Pakistan",
      "url": `${siteUrl}/collections/top-selling-products`,
      "numberOfItems": topSellingProducts.products.length,
      "itemListElement": topSellingProducts.products.map((product: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": product.node.title,
        "url": `${siteUrl}/products/${product.node.handle}`,
        "image": product.node.featuredImage?.url || product.node.media?.edges?.[0]?.node?.previewImage?.url,
        "item": {
          "@type": "Product",
          "name": product.node.title,
          "url": `${siteUrl}/products/${product.node.handle}`,
          "image": product.node.featuredImage?.url,
          "offers": {
            "@type": "Offer",
            "price": product.node.priceRange.minVariantPrice.amount,
            "priceCurrency": product.node.priceRange.minVariantPrice.currencyCode || "PKR",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "AI Bazar Pakistan"
            }
          }
        }
      }))
    };

    script.text = JSON.stringify(itemListSchema);

    return () => {
      const existingScript = document.getElementById(schemaId);
      if (existingScript) existingScript.remove();
    };
  }, [topSellingProducts]);

  console.log("Index component rendering...");
  const { data: collections = [], isLoading, error } = useQuery({
    queryKey: ['all-collections-rows'],
    queryFn: () => {
      console.log("Fetching collections...");
      return fetchCollections(15);
    },
  });

  if (isLoading) console.log("Collections are loading...");
  if (error) console.error("Error fetching collections:", error);
  if (collections.length > 0) console.log(`Fetched ${collections.length} collections`);

  const specificHandles = ['top-selling-products', 'household', 'heaters', 'health-and-beauty', 'hair-straightener-1', 'kitchen'];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section - Display Categories Grid */}
        <HeroCategories />

        {/* Home Page Collections */}
        <div className="space-y-0">
          <CategoryProductRow
            title="Top Selling Products"
            handle="top-selling-products"
            description="Our most popular picks voted by the community"
            forceLoad={true}
          />



          <CategoryProductRow
            title="Household Essentials"
            handle="household"
            forceLoad={true}
          />

          <CategoryProductRow
            title="Modern Home & Living"
            handle="heaters"
            forceLoad={true}
          />

          <CategoryProductRow
            title="Premium Health & Beauty"
            handle="health-and-beauty"
            forceLoad={true}
          />

          <CategoryProductRow
            title="Professional Hair Straighteners"
            handle="hair-straightener-1"
            forceLoad={true}
          />

          <CategoryProductRow
            title="Modern Kitchen Appliances"
            handle="kitchen"
            forceLoad={true}
          />

        </div>

        {/* Other Dynamic collections */}
        <div className="space-y-4">
          {collections
            .filter(col => !specificHandles.includes(col.node.handle))
            .map((col) => (
              <CategoryProductRow
                key={col.node.id}
                title={col.node.title}
                handle={col.node.handle}
              />
            ))}
        </div>

        {/* All Products Section */}
        <section className="bg-slate-50 pt-12 pb-20">
          <div className="container-custom">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight uppercase mb-4">
                All Products
              </h2>
              <div className="w-24 h-1.5 bg-primary rounded-full mb-6" />
              <p className="text-slate-600 max-w-2xl font-medium">
                Browse our entire collection of affordable products at the lowest prices across all categories.
              </p>
            </div>
            <FeaturedProducts />
          </div>
        </section>
      </main>
      <Suspense fallback={null}>
        <SEOContentLazy />
        <FooterLazy />
      </Suspense>
    </div>
  );
};

export default Index;


