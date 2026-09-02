import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, Loader2, ChevronRight, Tag, ArrowLeft, Share2, Star, ShoppingBag, CreditCard, Play, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storefrontApiRequest, ShopifyProduct, createStorefrontCheckout, fetchProductsByCollection } from "@/lib/shopify";
import type { BlogPostMeta } from "@/data/blogIndex";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviews } from "@/hooks/useReviews";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { formatProductId, trackMetaEvent } from "@/lib/meta-pixel";
import { useSEO } from "@/hooks/useSEO";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { cdnImage } from "@/lib/imageUrl";


interface ProductMedia {
  node: {
    mediaContentType: 'IMAGE' | 'VIDEO' | 'EXTERNAL_VIDEO' | 'MODEL_3D';
    altText: string | null;
    previewImage?: {
      url: string;
    };
    image?: {
      url: string;
    };
    sources?: Array<{
      url: string;
      mimeType: string;
      format: string;
    }>;
    embeddedUrl?: string;
  };
}

interface Variant {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

interface ProductOption {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  seo: {
    title: string | null;
    description: string | null;
  };
  media: {
    edges: ProductMedia[];
  };
  variants: {
    edges: {
      node: Variant;
    }[];
  };
  options: ProductOption[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  collections: {
    edges: {
      node: {
        title: string;
        handle: string;
      };
    }[];
  };
}


const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      availableForSale
      productType
      vendor
      tags
      createdAt
      updatedAt
      seo {
        title
        description
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      media(first: 10) {
        edges {
          node {
            mediaContentType
            alt
            previewImage {
              url
            }
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
            ... on Video {
              id
              sources {
                url
                mimeType
                format
              }
            }
            ... on ExternalVideo {
              id
              embeddedUrl
            }
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            sku
            barcode
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      collections(first: 3) {
        edges {
          node {
            title
            handle
          }
        }
      }
    }
  }
`;

const ProductPage = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  const addItem = useCartStore(state => state.addItem);

  const { ref: priceRef, inView: priceInView } = useInView({ threshold: 0 });
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 600 && !priceInView) {
      setShowStickyCTA(true);
    } else {
      setShowStickyCTA(false);
    }
  });

  const productId = product?.id?.replace("gid://shopify/Product/", "") || "";
  const { stats: reviewStats, reviews } = useReviews(productId, handle || "", product?.productType || "general");
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await storefrontApiRequest(PRODUCT_QUERY, { handle });
        if (data.data.product) {
          setProduct(data.data.product);
          setSelectedVariant(data.data.product.variants.edges[0]?.node);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      loadProduct();
    }
  }, [handle]);

  // Fetch related products from same collection for internal linking
  useEffect(() => {
    if (!product) return;
    const collectionHandle = product.collections.edges[0]?.node?.handle;
    if (!collectionHandle) return;

    fetchProductsByCollection(collectionHandle, 8).then(data => {
      if (data?.products) {
        // Filter out current product
        const filtered = data.products.filter((p: ShopifyProduct) => p.node.handle !== product.handle);
        setRelatedProducts(filtered.slice(0, 6));
      }
    });
  }, [product]);

  // Expert SEO: Internal Linking - Find relevant blog posts (Topic Clusters).
  // The blog index is ~70KB gzipped, so load it lazily rather than in the page bundle.
  const [relatedPosts, setRelatedPosts] = useState<BlogPostMeta[]>([]);
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    import("@/data/blogIndex").then(({ blogIndex }) => {
      if (cancelled) return;
      const pt = product.productType.toLowerCase();
      const matches = blogIndex.filter(post => {
        const hasTagMatch = product.tags.some(tag => post.tags.includes(tag));
        const hasCategoryMatch = post.category.toLowerCase().includes(pt) || pt.includes(post.category.toLowerCase());
        const hasTitleMatch = post.title.toLowerCase().includes(pt);
        return hasTagMatch || hasCategoryMatch || hasTitleMatch;
      }).slice(0, 3);
      setRelatedPosts(matches);
    });
    return () => { cancelled = true; };
  }, [product]);

  // Meta Pixel & Browser SEO: Track ViewContent and set Dynamic Title
  useEffect(() => {
    if (product) {
      // 1. Meta Pixel
      trackMetaEvent('ViewContent', {
        content_ids: [formatProductId(product.id)],
        content_name: product.title,
        content_type: 'product',
        value: parseFloat(product.priceRange.minVariantPrice.amount),
        currency: product.priceRange.minVariantPrice.currencyCode || 'PKR'
      });
    }
  }, [product]);

  // Professional Level Enrichment: Mapping of product types/tags to long-tail "small" keywords
  const smallKeywords = useMemo(() => {
    if (!product) return "";
    const type = product.productType?.toLowerCase() || "";
    const tags = product.tags.map(t => t.toLowerCase());

    const mappings: Record<string, string[]> = {
      'hair': ['Salon Style', 'Professional Grooming', 'Heat Protection'],
      'kitchen': ['Smart Gadget', 'Vegetable Slicer', 'Meal Prep Helper'],
      'beauty': ['Skin Friendly', 'Daily Grooming', 'Professional Results'],
      'kids': ['Safe Material', 'Educational Toy', 'Durable Play'],
      'baby': ['Safe Material', 'Newborn Essential', 'Gentle Care'],
      'home': ['Smart Solution', 'Household Essential', 'Space Saving'],
      'electronic': ['Latest Tech', 'Reliable Battery', 'Compact Gadget'],
      'curler': ['Auto Rotating', 'No-Burn Technology'],
      'straightener': ['Salon Grade', 'Anti-Frizz'],
      'cutter': ['Sharp Blade', 'Easy Chop', 'Time Saving'],
      'lamp': ['Soft Glow', 'Eyes Protective', 'Aesthetic Decor', 'Nursery Night Light']
    };

    const keywords: string[] = [];
    Object.entries(mappings).forEach(([key, values]) => {
      if (type.includes(key) || tags.some(t => t.includes(key))) {
        keywords.push(...values);
      }
    });

    return [...new Set(keywords)].slice(0, 3).join(' - ');
  }, [product]);

  // Expert Level SEO: Set Dynamic Metadata and JSON-LD
  // Always use /products/ as the canonical route (not /product/)
  const canonicalUrl = product ? `https://www.aibazar.pk/products/${product.handle}` : undefined;

  // Concise ranking title: Strictly 3-5 words
  const enrichedTitle = useMemo(() => {
    if (!product) return "Loading Product...";
    if (product.seo?.title) return product.seo.title;

    const baseTitle = product.title;
    // Get first 4 words of the base title (or less)
    const words = baseTitle.split(/\s+/).filter(Boolean);
    const shortBase = words.slice(0, 3).join(' ');

    // Result pattern: "[3 words] Price Pakistan" or "[2 words] Product Pakistan"
    // We aim for 4-5 words total
    return `${shortBase} Price Pakistan`.split(/\s+/).slice(0, 5).join(' ');
  }, [product]);

  const priceText = product ? `Rs. ${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString()}` : '';
  const seoDescription = product
    ? (product.seo?.description || `Buy ${product.title} from AI Bazar at only ${priceText}. Featuring ${smallKeywords || 'premium quality'}. Enjoy Free Express Shipping & Cash on Delivery across Pakistan. 100% Original Quality. Order now!`)
    : "Shop premium products at AI Bazar Pakistan. Lowest prices, free shipping, and 100% original quality guaranteed.";

  const seoKeywords = product
    ? [
      product.title.toLowerCase(),
      `buy ${product.title.toLowerCase()} online`,
      `${product.title.toLowerCase()} price in pakistan`,
      `${product.title.toLowerCase()} online shopping`,
      product.productType?.toLowerCase(),
      `${product.vendor?.toLowerCase()} products`,
      `${product.productType?.toLowerCase()} lowest price pakistan`,
      'aibazar',
      'cash on delivery pakistan',
      'free shipping pakistan',
      // LSI Keywords for better ranking
      ...(smallKeywords ? smallKeywords.split(' - ').map(k => k.toLowerCase()) : []),
      `${product.title.toLowerCase()} deals`,
      `${product.title.toLowerCase()} offers`,
      `${product.title.toLowerCase()} specification`,
      `${product.title.toLowerCase()} reviews pakistan`,
      `best ${product.productType?.toLowerCase()} 2026`,
      ...product.tags.map(t => t.toLowerCase()),
    ].filter(Boolean).join(', ')
    : "aibazar shopping, online shopping pakistan, lowest price online";

  useSEO({
    title: enrichedTitle,
    description: seoDescription,
    keywords: seoKeywords,
    ogImage: product?.media.edges[0]?.node.previewImage?.url || product?.media.edges[0]?.node.image?.url,
    ogType: 'product',
    priceAmount: product?.priceRange.minVariantPrice.amount,
    priceCurrency: product?.priceRange.minVariantPrice.currencyCode || 'PKR',
    canonical: canonicalUrl,
    availability: product ? (product.availableForSale ? 'instock' : 'outofstock') : undefined,
    retailerItemId: product ? formatProductId(product.id) : undefined,
    geoRegion: "PK-PB",
    geoPlacename: "Lahore",
    geoPosition: "31.5204;74.3587"
  });

  // Inject JSON-LD for Search Rich Results
  useEffect(() => {
    if (product) {
      const price = product.priceRange.minVariantPrice.amount;
      const currency = product.priceRange.minVariantPrice.currencyCode || 'PKR';
      const imageUrl = product.media.edges.map(edge => edge.node.previewImage?.url || edge.node.image?.url).filter(Boolean);
      const collection = product.collections.edges[0]?.node;

      // Get SKU and GTIN from first variant
      const firstVariant = product.variants.edges[0]?.node;
      const sku = firstVariant?.sku || formatProductId(product.id);
      const gtin = firstVariant?.barcode || undefined;

      // Build shared shipping & return policy
      const shippingDetails = {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "PKR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PK"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "d"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "d"
          }
        }
      };

      const returnPolicy = {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "PK",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      };

      // Extract Material
      const materialTags = ['steel', 'stainless', 'plastic', 'bpa-free', 'wood', 'ceramic', 'glass', 'cotton', 'silk', 'polyester', 'leather', 'silicone'];
      const detectedMaterial = product.tags?.find(t => materialTags.some(m => t.toLowerCase().includes(m)))
        || product.description?.match(/(?:made of|material:)\s*([a-zA-Z\s]+)/i)?.[1]
        || undefined;

      // Extract Piece Count
      const pieceCountMatch = product.title.match(/(\d+)\s*(?:-in-1|pcs|pieces|sets?)/i)
        || product.tags?.join(' ').match(/(\d+)\s*(?:-in-1|pcs|pieces|sets?)/i);
      const pieceCount = pieceCountMatch ? parseInt(pieceCountMatch[1]) : undefined;

      // Build offers - one per variant for Google Merchant
      const hasMultipleVariants = product.variants.edges.length > 1 && product.variants.edges[0]?.node.title !== 'Default Title';
      const offers = hasMultipleVariants
        ? product.variants.edges.map(v => ({
          "@type": "Offer",
          "url": canonicalUrl || `https://www.aibazar.pk/products/${product.handle}`,
          "priceCurrency": v.node.price.currencyCode || 'PKR',
          "price": v.node.price.amount,
          "priceValidUntil": "2026-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": v.node.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "sku": v.node.sku || sku,
          ...(v.node.barcode ? { "gtin": v.node.barcode } : {}),
          "name": `${product.title} - ${v.node.title}`,
          "seller": {
            "@type": "Organization",
            "@id": "https://www.aibazar.pk/#organization"
          },
          "hasMerchantReturnPolicy": returnPolicy,
          "shippingDetails": shippingDetails
        }))
        : [{
          "@type": "Offer",
          "url": canonicalUrl || `https://www.aibazar.pk/products/${product.handle}`,
          "priceCurrency": currency,
          "price": price,
          "priceValidUntil": "2026-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "sku": sku,
          ...(gtin ? { "gtin": gtin } : {}),
          "seller": {
            "@type": "Organization",
            "@id": "https://www.aibazar.pk/#organization"
          },
          "hasMerchantReturnPolicy": returnPolicy,
          "shippingDetails": shippingDetails
        }];

      const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": imageUrl,
        "description": product.description,
        "sku": sku,
        "mpn": formatProductId(product.id),
        ...(gtin ? { "gtin": gtin } : {}),
        "brand": {
          "@type": "Brand",
          "name": product.vendor || "AI Bazar Original"
        },
        "color": product.options?.find(o => o.name.toLowerCase() === 'color')?.values?.[0],
        "size": product.options?.find(o => o.name.toLowerCase() === 'size')?.values?.join(', '),
        "material": detectedMaterial,
        "productID": product.id,
        "category": product.productType,
        "url": canonicalUrl || `https://www.aibazar.pk/products/${product.handle}`,
        ...(pieceCount ? { "isRelatedTo": { "@type": "Product", "name": `${pieceCount} pieces set` } } : {}),
        "additionalProperty": (product.tags || []).map(tag => ({
          "@type": "PropertyValue",
          "name": "Feature",
          "value": tag
        })),
        "review": reviews.slice(0, 5).map(r => ({
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": r.rating,
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": r.profile?.full_name || "Anonymous"
          },
          "datePublished": r.created_at,
          "reviewBody": r.content || ""
        })),
        "offers": hasMultipleVariants ? { "@type": "AggregateOffer", "lowPrice": product.priceRange.minVariantPrice.amount, "highPrice": product.priceRange.maxVariantPrice.amount, "priceCurrency": currency, "offerCount": product.variants.edges.length, "offers": offers } : offers[0]
      } as any;

      // Add actual review data to schema if available
      if (reviewStats && reviewStats.totalReviews > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": reviewStats.averageRating.toFixed(1),
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": reviewStats.totalReviews,
          "ratingCount": reviewStats.totalReviews
        };
      }

      // GSO-optimized FAQ with self-contained, extractable answers
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Is this ${product.title} genuine and original?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes, the ${product.title} sold at AI Bazar (aibazar.pk) is 100% genuine and original. AI Bazar is a verified direct-to-consumer retailer in Pakistan that sources all products directly from verified vendors and original brands. No counterfeits or replicas.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the price of ${product.title} in Pakistan?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The ${product.title} is available at AI Bazar for Rs. ${parseFloat(price).toLocaleString()} PKR. This is the lowest price available online in Pakistan with free express shipping and cash on delivery included.`
            }
          },
          {
            "@type": "Question",
            "name": `Where can I buy ${product.title} online in Pakistan?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `You can buy the ${product.title} online at AI Bazar (aibazar.pk), Pakistan's most affordable online store. Visit https://www.aibazar.pk/products/${product.handle} to order with free express shipping and cash on delivery nationwide.`
            }
          },
          {
            "@type": "Question",
            "name": `Does the ${product.title} come with a warranty or guarantee?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes, every ${product.title} sold at AI Bazar comes with a 7-day quality guarantee and a 100% authenticity assurance. If you find any manufacturing defect, we provide replacement or full refund.`
            }
          },
          {
            "@type": "Question",
            "name": `Why is the ${product.title} price so low at AI Bazar?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `We source ${product.title} directly from manufacturers and large-scale vendors, eliminating middleman costs. Our mission is to provide the most affordable online shopping experience for Pakistanis without compromising on quality.`
            }
          },
          {
            "@type": "Question",
            "name": `How to use or care for this ${product.title}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `To ensure the longevity of your ${product.title}, we recommend following the instructions provided in the description. Generally, keep it clean and handle with care. For specific usage tips, contact our WhatsApp support.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the return policy for ${product.title}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `AI Bazar offers a 7-day hassle-free return policy for the ${product.title}. If you're not satisfied or the product has any quality issues, you can return it for a full refund or replacement. Contact WhatsApp +92 332 8222026 for return authorization.`
            }
          }
        ]
      };

      // Speakable schema for voice assistant optimization (GSO)
      const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": product.title,
        "url": canonicalUrl || `https://www.aibazar.pk/products/${product.handle}`,
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".product-title", ".product-price", ".product-description", ".product-faq", ".feature-item"]
        },
        "mainEntity": {
          "@type": "Product",
          "@id": canonicalUrl || `https://www.aibazar.pk/products/${product.handle}#product`
        }
      };

      const siteUrl = 'https://www.aibazar.pk';
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          }
        ]
      };

      if (collection) {
        breadcrumbSchema.itemListElement.push({
          "@type": "ListItem",
          "position": 2,
          "name": collection.title,
          "item": `${siteUrl}/collections/${collection.handle}`
        });
      }

      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        "position": collection ? 3 : 2,
        "name": product.title,
        "item": canonicalUrl || `${siteUrl}/products/${product.handle}`
      });

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify([productSchema, faqSchema, breadcrumbSchema, speakableSchema]);
      script.id = 'product-seo-json-ld';

      // Remove existing script if any
      const existing = document.getElementById('product-seo-json-ld');
      if (existing) existing.remove();

      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('product-seo-json-ld');
        if (scriptToRemove) scriptToRemove.remove();
      };
    }
  }, [product, reviewStats, reviews, canonicalUrl]);

  useEffect(() => {
    if (product) {
      const RECENTLY_VIEWED_KEY = "recently-viewed-products";
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recent = [];
      try {
        recent = stored ? JSON.parse(stored) : [];
      } catch (e) {
        recent = [];
      }

      const productToStore = {
        node: product as any
      };

      // Filter out current product and keep last 10
      const updated = [
        productToStore,
        ...recent.filter((p: any) => p.node.id !== product.id)
      ].slice(0, 10);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem = {
      product: { node: product as unknown as ShopifyProduct['node'] },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || []
    };

    addItem(cartItem);

    // Meta Pixel: Track AddToCart
    trackMetaEvent('AddToCart', {
      content_ids: [formatProductId(product.id)],
      content_name: product.title,
      content_type: 'product',
      value: parseFloat(selectedVariant.price.amount) * quantity,
      currency: selectedVariant.price.currencyCode || 'PKR'
    });

    toast.success("Added to cart", {
      description: `${quantity}x ${product.title}`,
    });
  };

  const handleOrderNow = async () => {
    if (!product || !selectedVariant) return;

    setCheckoutLoading(true);
    try {
      const cartItem = {
        product: { node: product as unknown as ShopifyProduct['node'] },
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity,
        selectedOptions: selectedVariant.selectedOptions || []
      };

      const checkoutUrl = await createStorefrontCheckout([cartItem]);

      // Meta Pixel: Track AddToCart (for Buy Now)
      trackMetaEvent('AddToCart', {
        content_ids: [formatProductId(product.id)],
        content_name: product.title,
        content_type: 'product',
        value: parseFloat(selectedVariant.price.amount) * quantity,
        currency: selectedVariant.price.currencyCode || 'PKR'
      });

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error("Checkout failed", {
        description: "Please try again later.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product || !selectedVariant) return;

    const message = `Hi! I'm interested in ordering:
*Product:* ${product.title}
*Variant:* ${selectedVariant.title}
*Quantity:* ${quantity}
*Price:* ${selectedVariant.price.currencyCode} ${parseFloat(selectedVariant.price.amount).toLocaleString()}
*URL:* ${window.location.href}`;

    const url = `https://wa.me/+923328222026?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} at Artisan Boutique!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard", {
          description: "You can now share this masterpiece with others.",
        });
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-5xl font-black mb-6 tracking-tighter">Lost in Space</h1>
            <p className="text-muted-foreground mb-10 text-lg">The product you're looking for has vanished into another dimension.</p>
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white">
              <Link to="/"><ArrowLeft className="mr-2 w-5 h-5" /> Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount);
  const currencyCode = selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode;
  const isOutOfStock = !product.availableForSale;
  const collection = product.collections.edges[0]?.node;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 lg:pb-24">
        <article className="max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] mb-6 sm:mb-8 text-slate-500 font-bold uppercase tracking-widest px-4 sm:px-0"
          >
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <Link to="/" className="hover:text-primary transition-colors">HOMEPAGE</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            {collection || product.productType ? (
              <>
                <Link
                  to={collection ? `/collections/${collection.handle}` : "#"}
                  className="hover:text-primary transition-colors uppercase"
                >
                  {collection?.title || product.productType}
                </Link>
                <ChevronRight className="w-3 h-3 opacity-30" />
              </>
            ) : null}
            <span className="text-slate-900 truncate uppercase">{product.title}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 xl:gap-28 items-start">
            {/* Gallery Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 sm:space-y-8 lg:sticky lg:top-32"
            >
              <div
                className="px-6 sm:px-0 max-w-[420px] sm:max-w-none mx-auto w-full"
              >
                <div
                  className="aspect-square rounded-none sm:rounded-[2rem] overflow-hidden bg-white shadow-xl group relative border-b sm:border border-slate-100 cursor-zoom-in max-w-3xl lg:max-w-xl mx-auto"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMousePos({ x, y });
                  }}
                  onMouseEnter={() => setIsInspecting(true)}
                  onMouseLeave={() => setIsInspecting(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      className="w-full h-full relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {(() => {
                        const mediaNode = product.media.edges[selectedImage]?.node;
                        if (!mediaNode) return <img src="/placeholder.svg" alt={`${product.title} placeholder`} className="w-full h-full object-cover" />;

                        if (mediaNode.mediaContentType === 'VIDEO' && mediaNode.sources?.[0]) {
                          return (
                            <video
                              src={mediaNode.sources[0].url}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-contain bg-slate-900"
                              poster={mediaNode.previewImage?.url}
                            />
                          );
                        }

                        if (mediaNode.mediaContentType === 'EXTERNAL_VIDEO' && mediaNode.embeddedUrl) {
                          return (
                            <iframe
                              src={mediaNode.embeddedUrl}
                              className="w-full h-full bg-slate-900"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        const imageUrl = mediaNode.image?.url || mediaNode.previewImage?.url || "/placeholder.svg";

                        return (
                          <div className="w-full h-full overflow-hidden">
                            <OptimizedImage
                              src={imageUrl}
                              alt={`${product.title} - ${product.vendor} original product image`}
                              width={900}
                              quality={85}
                              priority={selectedImage === 0}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw"
                              className="w-full h-full object-cover transition-transform duration-500"
                              style={{
                                transform: isInspecting ? `scale(2)` : 'scale(1)',
                                transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                              }}
                            />
                          </div>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Inspect Mode HUD */}
                  <AnimatePresence>
                    {isInspecting && (
                      <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5"
                      >
                        <div className="px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-[8px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                          High Fidelity Inspection
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 flex flex-col gap-2 sm:gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleShare}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl glass-dark border-white/10 text-white"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl glass-light border-slate-200 text-slate-800 bg-white/70">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-none justify-start sm:justify-center px-6 sm:px-0">
                {product.media.edges.map((media: ProductMedia, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-12 h-12 sm:w-24 sm:h-24 rounded-lg sm:rounded-2xl overflow-hidden border-2 transition-all duration-500 hover:scale-105 relative ${selectedImage === index
                      ? "border-primary ring-[3px] sm:ring-[4px] ring-primary/10 shadow-lg"
                      : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <OptimizedImage
                      src={media.node.previewImage?.url || media.node.image?.url || "/placeholder.svg"}
                      alt={`${product.title} - View ${index + 1}`}
                      width={140}
                      quality={70}
                      sizes="96px"
                      className="w-full h-full object-cover"
                    />
                    {(media.node.mediaContentType === 'VIDEO' || media.node.mediaContentType === 'EXTERNAL_VIDEO') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Information Section */}
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-8 px-4 sm:px-0"
              >
                {/* 1. Heading */}
                <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-0">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-[2px] bg-primary/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Boutique Exclusive</span>
                  </div>
                  <h1 className="product-title text-2xl md:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] lg:max-w-[90%]">
                    {product.title}
                  </h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    {product.vendor} Collection
                  </p>
                </div>

                {/* 2. Rates (Price) & Stock */}
                <div ref={priceRef} className="space-y-8 py-10 border-y border-slate-200/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl font-bold text-slate-400">{currencyCode}</span>
                      <span className="product-price text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter">
                        {price.toLocaleString()}
                      </span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-2xl shadow-xl shadow-slate-950/10"
                    >
                      <Sparkles className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">High Demand</span>
                    </motion.div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {product.availableForSale ? (
                      <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 rounded-full border border-emerald-100/50 shadow-sm shadow-emerald-500/5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.15em]">Ready for Dispatch</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-100 rounded-full border border-slate-200/50">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Currently Reserved</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-slate-100 shadow-sm">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Express Shipping</span>
                    </div>
                  </div>
                </div>

                {/* 3. Variant Options & Buttons */}
                <div className="space-y-10">
                  {/* Variant Selection */}
                  {product.options.length > 0 && product.options[0].name !== 'Title' && (
                    <div className="space-y-6">
                      {product.options.map((option: ProductOption) => (
                        <div key={option.name} className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{option.name}</label>
                          <div className="flex flex-wrap gap-4">
                            {option.values.map((value: string) => {
                              const isSelected = selectedVariant?.selectedOptions?.some((opt: { name: string; value: string }) => opt.name === option.name && opt.value === value);
                              return (
                                <button
                                  key={value}
                                  onClick={() => {
                                    const newVariant = product.variants.edges.find((v: { node: Variant }) =>
                                      v.node.selectedOptions.some((opt: { name: string; value: string }) => opt.name === option.name && opt.value === value)
                                    )?.node;
                                    if (newVariant) setSelectedVariant(newVariant);
                                  }}
                                  className={`px-8 py-4 text-sm font-black rounded-2xl border-2 transition-all duration-500 overflow-hidden relative group/opt ${isSelected
                                    ? "bg-slate-950 text-white border-slate-950 shadow-2xl scale-105"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-primary/30 hover:text-primary shadow-sm"
                                    }`}
                                >
                                  <motion.span
                                    initial={false}
                                    animate={isSelected ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                                    className="relative z-10"
                                  >
                                    {value}
                                  </motion.span>
                                  {isSelected && (
                                    <motion.div
                                      layoutId="variant-bg"
                                      className="absolute inset-0 bg-primary/20 pointer-events-none"
                                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                      {/* Quantity Select */}
                      <div className="flex items-center justify-between glass border-slate-200 rounded-2xl px-4 py-3 bg-white shadow-xl sm:w-48">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 text-slate-900 hover:bg-slate-100 rounded-xl"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <span className="text-xl font-black text-slate-900">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Add to Cart */}
                      <Button
                        size="lg"
                        className="flex-1 h-20 text-lg font-black rounded-2xl bg-slate-950 text-white hover:bg-slate-800 transition-all duration-500 shadow-2xl uppercase tracking-widest group"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                      >
                        <ShoppingBag className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        Add to Cart
                      </Button>
                    </div>

                    {/* Order Now (Direct Checkout) */}
                    <Button
                      size="lg"
                      className="w-full h-20 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-gold transition-all duration-500 active:scale-[0.98] uppercase tracking-[0.2em] group"
                      onClick={handleOrderNow}
                      disabled={isOutOfStock || checkoutLoading}
                    >
                      {checkoutLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                      ) : (
                        <CreditCard className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />
                      )}
                      {checkoutLoading ? "Redirecting..." : "Order Now"}
                    </Button>

                    {/* WhatsApp Ordering */}
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-20 text-lg font-bold rounded-2xl border-2 border-[#25D366]/20 bg-white hover:bg-[#25D366]/5 text-[#25D366] transition-all duration-500 uppercase tracking-widest group"
                      onClick={handleWhatsAppOrder}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 fill-current mr-3 group-hover:scale-110 transition-transform"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.122.554 4.197 1.604 6.04L0 24l6.11-1.603a11.848 11.848 0 005.935 1.604h.005c6.637 0 12.032-5.395 12.033-12.031a11.75 11.75 0 00-3.525-8.508" />
                      </svg>
                      Order on WhatsApp
                    </Button>
                  </div>
                </div>

                {/* Trust Signatures (Trust Badges) */}
                <div className="pt-12 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:border-primary/20 transition-all duration-700">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-500">
                        <Shield className="w-7 h-7 text-slate-900 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="feature-item">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 mb-1">Authentic</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certified Source</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:border-primary/20 transition-all duration-700">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-500">
                        <RotateCcw className="w-7 h-7 text-slate-900 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="feature-item">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 mb-1">Exchange</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">7-Day Return</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Description (Moved after Trust Badges) */}
                  <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Product Description</label>
                    </div>
                    {product.descriptionHtml ? (
                      <div
                        className="product-description text-lg text-slate-600 leading-relaxed font-medium prose prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-slate-800 prose-a:text-primary"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      />
                    ) : (
                      <p className="product-description text-lg text-slate-600 leading-relaxed font-medium">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Artisan Signature Block (Subtle below description) */}
                  <div className="mt-12 relative p-10 rounded-[3rem] bg-slate-950 text-white overflow-hidden group shadow-2xl shadow-slate-950/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">Quality Assurance</p>
                        <h4 className="text-xl font-black tracking-tight flex items-center gap-3">
                          Verified Boutique Item
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </h4>
                        <p className="text-xs text-white/40 font-medium">Hand-curated for the AI Bazar collection</p>
                      </div>
                      <div className="text-left md:text-right px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/30 mb-2 whitespace-nowrap">Registry Entry</p>
                        <p className="text-lg font-mono tracking-tighter text-primary font-black">#AB-{Math.floor(Math.random() * 90000) + 10000}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Secure Trust Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-24 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-12 border-y border-slate-200/60"
          >
            {[
              { icon: Shield, title: "Artisan Protected", desc: "100% Certified Source" },
              { icon: Truck, title: "Concierge Shipping", desc: "Priority Global Escort" },
              { icon: CreditCard, title: "Encrypted Portal", desc: "Secure Vault Payment" },
              { icon: Star, title: "Registry Service", desc: "Lifetime Support" }
            ].map((item, i) => (
              <div key={i} className="flex flex-row md:flex-col items-center md:text-center gap-4 md:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-premium flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="feature-item space-y-1">
                  <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-900">{item.title}</h5>
                  <p className="text-[9px] text-slate-400 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Expanded Details Engine */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-32"
          >
            <Tabs defaultValue="description" className="w-full">
              <div className="w-full overflow-x-auto no-scrollbar border-b border-slate-200 mb-10 md:mb-20">
                <TabsList className="flex w-max min-w-full justify-start md:justify-center h-auto p-0 bg-transparent">
                  {["description", "reviews", "specifications", "care"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-4 border-transparent px-6 sm:px-10 py-4 sm:py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 data-[state=active]:border-primary data-[state=active]:text-slate-900 transition-all whitespace-nowrap"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="max-w-5xl mx-auto">
                <TabsContent value="description" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="prose prose-slate max-w-none">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">{product.title} - Full Description</h2>
                    {product.descriptionHtml ? (
                      <div
                        className="text-lg text-slate-600 leading-relaxed prose-headings:text-slate-900 prose-strong:text-slate-800"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      />
                    ) : (
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <ProductReviews productId={productId} productHandle={handle || ""} category={product.productType || "general"} />
                </TabsContent>

                <TabsContent value="specifications" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {product.options.map((opt: ProductOption) => (
                      <div key={opt.name} className="flex justify-between p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                        <span className="label-premium">{opt.name}</span>
                        <span className="font-bold text-slate-900">{opt.values.join(', ')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                      <span className="label-premium">Vendor</span>
                      <span className="font-bold text-slate-900">{product.vendor}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="care" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="prose prose-slate max-w-none text-center">
                    <h3 className="text-xl font-bold mb-6 text-slate-900">Product Care Guide</h3>
                    <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium">
                      Each piece is built to last with quality materials. To maintain its condition, avoid prolonged exposure to moisture and clean with a dry, soft cloth.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </article>

        {/* Product SEO Content Block - GSO-optimized self-contained extractable content */}
        {product && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                Buy {product.title} Online in Pakistan - AI Bazar
              </h2>
              <div className="text-slate-600 space-y-4 text-sm leading-relaxed">
                <p>
                  Looking to <strong>buy {product.title} online in Pakistan</strong>? AI Bazar offers this {product.productType || 'product'} at the <strong>lowest price in Pakistan</strong> with free express shipping and cash on delivery nationwide. Get original quality {product.vendor && product.vendor !== 'AI Bazar' ? `${product.vendor} ` : ''}products delivered to your doorstep in just 1-3 business days.
                </p>
                <p>
                  At <strong>aibazar.pk</strong>, we guarantee 100% genuine products with a 7-day easy return policy. Whether you're in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, or anywhere across Pakistan, enjoy hassle-free online shopping with our secure payment options including cash on delivery (COD).
                </p>

                {/* GSO: Self-contained product summary for AI extraction */}
                <div className="product-summary mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 mb-3">{product.title} - Quick Summary</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The {product.title} is available at AI Bazar (aibazar.pk) for Rs. {parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString()} PKR.
                    {product.availableForSale ? ' This product is currently in stock and ready for dispatch.' : ' This product is currently out of stock.'}
                    {' '}AI Bazar offers free express shipping across Pakistan with delivery in 1-3 business days.
                    Cash on delivery (COD) is available in all cities.
                    {product.productType ? ` Category: ${product.productType}.` : ''}
                    {product.vendor && product.vendor !== 'AI Bazar' ? ` Brand: ${product.vendor}.` : ''}
                    {' '}All products at AI Bazar are 100% original with a 7-day return policy.
                  </p>
                </div>

                {/* GSO: FAQ section visible on page for AI crawlers */}
                <div className="product-faq mt-6">
                  <h3 className="text-base font-bold text-slate-800 mb-3">Frequently Asked Questions</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-semibold text-slate-700">Is this {product.title} original?</dt>
                      <dd className="text-sm text-slate-500 mt-1">Yes, the {product.title} sold at AI Bazar (aibazar.pk) is 100% genuine and original, sourced directly from verified vendors.</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-700">What is the price of {product.title} in Pakistan?</dt>
                      <dd className="text-sm text-slate-500 mt-1">The {product.title} costs Rs. {parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString()} PKR at AI Bazar, the lowest price available online in Pakistan with free shipping included.</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-700">Does AI Bazar offer cash on delivery for this product?</dt>
                      <dd className="text-sm text-slate-500 mt-1">Yes, Cash on Delivery (COD) is available for the {product.title} across all cities and towns in Pakistan. You pay only when you receive your order.</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-slate-700">How long does delivery take?</dt>
                      <dd className="text-sm text-slate-500 mt-1">AI Bazar dispatches orders within 24 hours. The {product.title} is delivered in 1-3 business days nationwide with free express shipping.</dd>
                    </div>
                  </dl>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      <strong>Related searches:</strong>{' '}
                      {[
                        `${product.title} price in Pakistan`,
                        `buy ${product.title} online`,
                        `${product.title} cash on delivery`,
                        `${product.productType} online shopping Pakistan`,
                        `best ${product.productType} in Pakistan`,
                        `${product.title} free shipping`,
                        `${product.title} review`,
                        `${product.title} vs alternatives`,
                        `best ${product.productType} to buy in Pakistan`,
                        ...product.tags.slice(0, 5).map(t => `${t} Pakistan`),
                      ].filter(Boolean).join(' | ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Expert SEO: Internal Linking - Related Knowledge Base (Topic Clusters) */}
        {relatedPosts.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-0">
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100/50 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Expert Guides & <span className="text-primary">Usage Tips</span>
                  </h2>
                  <p className="text-slate-500 font-medium max-w-xl">
                    Read our expert articles to learn more about how to get the most out of your {product?.productType || 'product'}.
                  </p>
                </div>
                <Link to="/blog" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2">
                  View All Guides <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 mb-4 relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {post.readTime}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                        {post.category}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-xs font-bold text-slate-900 mt-auto">
                        Read Article <div className="w-6 h-[2px] bg-slate-200 ml-2 group-hover:w-10 group-hover:bg-primary transition-all rounded-full" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Products - Critical for Internal Linking & SEO */}
        {relatedProducts.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 pb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
                You May Also Like
              </h2>
              <p className="text-slate-500 font-medium">
                Explore more products from {collection?.title || 'our collection'} at the lowest prices in Pakistan
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((rp) => {
                const rpPrice = parseFloat(rp.node.priceRange.minVariantPrice.amount);
                const rpImage = cdnImage(rp.node.media?.edges?.[0]?.node?.previewImage?.url || rp.node.media?.edges?.[0]?.node?.image?.url, 400);
                return (
                  <Link
                    key={rp.node.id}
                    to={`/products/${rp.node.handle}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                  >
                    <div className="aspect-square overflow-hidden bg-slate-50">
                      <img
                        src={rpImage || '/placeholder.svg'}
                        alt={`${rp.node.title} - Buy online at AI Bazar Pakistan`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {rp.node.title}
                      </h3>
                      <p className="text-sm font-black text-primary">
                        Rs. {rpPrice.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Sticky Mobile CTA Bar */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden p-4 bg-white/80 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 truncate w-32">
                  {product.title}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {currencyCode} {price.toLocaleString()}
                </span>
              </div>
              <Button
                size="lg"
                onClick={handleOrderNow}
                disabled={checkoutLoading}
                className="flex-1 h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-gold border-none"
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Order Now"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
