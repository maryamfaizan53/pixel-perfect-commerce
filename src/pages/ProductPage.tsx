import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, Truck, Loader2, ChevronRight, ArrowLeft, Share2, ShoppingBag, CreditCard, Play, RotateCcw, PackageOpen, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ShopifyProduct } from "@/lib/shopify";
import { getProduct, getRelatedProducts } from "@/lib/api";
import { toShopifyShape } from "@/lib/compat";
import type { BlogPostMeta } from "@/data/blogIndex";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviews } from "@/hooks/useReviews";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { EASE, fadeUp, inView as inViewCfg, reduceMotion, staggerContainer, staggerItem } from "@/lib/motion";
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
  const navigate = useNavigate();
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

  const productId = product?.id || "";
  const { stats: reviewStats, reviews } = useReviews(productId, handle || "", product?.productType || "general");
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const dto = await getProduct(handle!);
        const node = toShopifyShape(dto).node as unknown as Product;
        setProduct(node);
        setSelectedVariant(node.variants.edges[0]?.node);
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
    getRelatedProducts(product.handle)
      .then((cards) => setRelatedProducts(cards.map(toShopifyShape).filter((p) => p.node.handle !== product.handle).slice(0, 6)))
      .catch(() => {});
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

    addItem({
      productId: product.id,
      slug: product.handle,
      title: product.title,
      image: product.media?.edges?.[0]?.node?.image?.url ?? null,
      variantKey: selectedVariant.title === 'Default Title' ? null : selectedVariant.id,
      variantTitle: selectedVariant.title === 'Default Title' ? null : selectedVariant.title,
      price: parseFloat(selectedVariant.price.amount),
      currency: selectedVariant.price.currencyCode || 'PKR',
      quantity,
    });

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
      addItem({
        productId: product.id,
        slug: product.handle,
        title: product.title,
        image: product.media?.edges?.[0]?.node?.image?.url ?? null,
        variantKey: selectedVariant.title === 'Default Title' ? null : selectedVariant.id,
        variantTitle: selectedVariant.title === 'Default Title' ? null : selectedVariant.title,
        price: parseFloat(selectedVariant.price.amount),
        currency: selectedVariant.price.currencyCode || 'PKR',
        quantity,
      });
      trackMetaEvent('AddToCart', {
        content_ids: [formatProductId(product.id)],
        content_name: product.title,
        content_type: 'product',
        value: parseFloat(selectedVariant.price.amount) * quantity,
        currency: selectedVariant.price.currencyCode || 'PKR'
      });
      navigate('/checkout');
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error("Checkout failed", { description: "Please try again later." });
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
        <main className="flex-1 flex items-center justify-center pt-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Product not found</h1>
            <p className="text-muted-foreground mb-8">
              This product may have been removed or the link is incorrect.
            </p>
            <Button asChild size="pill">
              <Link to="/category"><ArrowLeft className="mr-2 w-4 h-4" /> Browse all products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const reduce = reduceMotion();
  const price = parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount);
  const currencyCode = selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode || "PKR";
  const compareAt = parseFloat(
    selectedVariant?.compareAtPrice?.amount || product.compareAtPriceRange?.minVariantPrice?.amount || "0",
  );
  const hasDiscount = compareAt > price;
  const discountPct = hasDiscount ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const isOutOfStock = !product.availableForSale;
  const collection = product.collections.edges[0]?.node;
  const hasVariants = product.options.length > 0 && product.options[0].name !== "Title";
  const money = (n: number) => `${currencyCode} ${n.toLocaleString()}`;

  const trustItems = [
    { icon: BadgeCheck, title: "Cash on Delivery", desc: "Pay when it arrives" },
    { icon: PackageOpen, title: "Open before you pay", desc: "Check the parcel first" },
    { icon: Truck, title: "1–3 day delivery", desc: "Nationwide, free" },
    { icon: RotateCcw, title: "7-day returns", desc: "Easy replacement" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 lg:pb-24">
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            {(collection || product.productType) && (
              <>
                <Link
                  to={collection ? `/category/${collection.handle}` : "/category"}
                  className="hover:text-primary transition-colors"
                >
                  {collection?.title || product.productType}
                </Link>
                <ChevronRight className="w-3 h-3 opacity-40" />
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[60vw] sm:max-w-xs">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* Gallery */}
            <div className="lg:sticky lg:top-24 space-y-3">
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-border shadow-card group cursor-zoom-in"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onMouseEnter={() => setIsInspecting(true)}
                onMouseLeave={() => setIsInspecting(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    className="w-full h-full"
                    initial={reduce ? undefined : { opacity: 0 }}
                    animate={reduce ? undefined : { opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {(() => {
                      const mediaNode = product.media.edges[selectedImage]?.node;
                      if (!mediaNode)
                        return <img src="/placeholder.svg" alt={`${product.title}`} className="w-full h-full object-cover" />;

                      if (mediaNode.mediaContentType === "VIDEO" && mediaNode.sources?.[0]) {
                        return (
                          <video
                            src={mediaNode.sources[0].url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain bg-secondary"
                            poster={mediaNode.previewImage?.url}
                          />
                        );
                      }

                      if (mediaNode.mediaContentType === "EXTERNAL_VIDEO" && mediaNode.embeddedUrl) {
                        return (
                          <iframe
                            src={mediaNode.embeddedUrl}
                            className="w-full h-full bg-secondary"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      }

                      const imageUrl = mediaNode.image?.url || mediaNode.previewImage?.url || "/placeholder.svg";
                      return (
                        <OptimizedImage
                          src={imageUrl}
                          alt={`${product.title} — ${product.vendor} product image`}
                          width={900}
                          quality={85}
                          priority={selectedImage === 0}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                          className="w-full h-full object-cover transition-transform duration-300"
                          style={{
                            transform: isInspecting && !reduce ? "scale(1.6)" : "scale(1)",
                            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                          }}
                        />
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>

                {hasDiscount && (
                  <span className="absolute top-3 left-3 z-10 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                    -{discountPct}%
                  </span>
                )}

                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border-border text-foreground hover:text-primary"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border-border text-foreground hover:text-primary"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {product.media.edges.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {product.media.edges.map((media: ProductMedia, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <OptimizedImage
                        src={media.node.previewImage?.url || media.node.image?.url || "/placeholder.svg"}
                        alt={`${product.title} — view ${index + 1}`}
                        width={160}
                        quality={70}
                        sizes="80px"
                        className="w-full h-full object-cover"
                      />
                      {(media.node.mediaContentType === "VIDEO" || media.node.mediaContentType === "EXTERNAL_VIDEO") && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <motion.div
              className="space-y-6"
              variants={reduce ? undefined : staggerContainer}
              initial={reduce ? undefined : "hidden"}
              animate={reduce ? undefined : "show"}
            >
              <motion.div variants={reduce ? undefined : staggerItem} className="space-y-2">
                {(collection?.title || product.productType) && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    {collection?.title || product.productType}
                  </span>
                )}
                <h1 className="product-title text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
                  {product.title}
                </h1>
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <StarRating rating={reviewStats.averageRating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews})
                    </span>
                  </div>
                )}
              </motion.div>

              <motion.div ref={priceRef} variants={reduce ? undefined : staggerItem} className="flex items-end gap-3">
                <span className="product-price text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {money(price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through pb-1">{money(compareAt)}</span>
                )}
              </motion.div>

              <motion.div variants={reduce ? undefined : staggerItem} className="flex flex-wrap items-center gap-3">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Out of stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-trust/10 px-3.5 py-1.5 text-xs font-semibold text-trust">
                    <span className="w-2 h-2 rounded-full bg-trust" /> In stock — ready to ship
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-trust" /> Free delivery
                </span>
              </motion.div>

              {/* Variants */}
              {hasVariants && (
                <motion.div variants={reduce ? undefined : staggerItem} className="space-y-4">
                  {product.options.map((option: ProductOption) => (
                    <div key={option.name} className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {option.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value: string) => {
                          const isSelected = selectedVariant?.selectedOptions?.some(
                            (opt) => opt.name === option.name && opt.value === value,
                          );
                          return (
                            <button
                              key={value}
                              onClick={() => {
                                const newVariant = product.variants.edges.find((v) =>
                                  v.node.selectedOptions.some((opt) => opt.name === option.name && opt.value === value),
                                )?.node;
                                if (newVariant) setSelectedVariant(newVariant);
                              }}
                              className={`min-w-[3rem] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-secondary text-secondary-foreground border-secondary"
                                  : "bg-card border-border text-foreground hover:border-primary"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Quantity + actions */}
              <motion.div variants={reduce ? undefined : staggerItem} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</span>
                  <div className="flex items-center rounded-full border border-border bg-card">
                    <button
                      className="h-11 w-11 flex items-center justify-center text-foreground hover:text-primary disabled:opacity-40"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-base font-bold">{quantity}</span>
                    <button
                      className="h-11 w-11 flex items-center justify-center text-foreground hover:text-primary"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12 text-base shadow-gold"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {isOutOfStock ? "Out of stock" : "Add to cart"}
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full h-12 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={handleOrderNow}
                  disabled={isOutOfStock || checkoutLoading}
                >
                  {checkoutLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CreditCard className="w-5 h-5 mr-2" />}
                  {checkoutLoading ? "Redirecting…" : "Buy it now"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 text-base border-trust/40 text-trust hover:bg-trust/5"
                  onClick={handleWhatsAppOrder}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current mr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.122.554 4.197 1.604 6.04L0 24l6.11-1.603a11.848 11.848 0 005.935 1.604h.005c6.637 0 12.032-5.395 12.033-12.031a11.75 11.75 0 00-3.525-8.508" />
                  </svg>
                  Order on WhatsApp
                </Button>
              </motion.div>

              {/* Trust row */}
              <motion.div
                variants={reduce ? undefined : staggerItem}
                className="grid grid-cols-2 gap-3 pt-2"
              >
                {trustItems.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                    <item.icon className="w-5 h-5 text-trust flex-shrink-0 mt-0.5" />
                    <div className="feature-item min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Short description (first ~360 chars — full copy lives in the Description tab) */}
              {(product.description || product.descriptionHtml) && (
                <motion.div
                  variants={reduce ? undefined : staggerItem}
                  className="pt-4 border-t border-border space-y-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                  <p className="product-description text-sm text-muted-foreground leading-relaxed">
                    {(() => {
                      const text = (product.description || product.descriptionHtml.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
                      return text.length > 360 ? text.slice(0, 360).trimEnd() + "…" : text;
                    })()}
                  </p>
                  <a href="#details" className="inline-block text-sm font-semibold text-primary hover:text-primary-hover">
                    Read full description ↓
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Detail tabs */}
          <motion.div
            id="details"
            variants={reduce ? undefined : fadeUp}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={inViewCfg}
            className="mt-16 sm:mt-24 scroll-mt-24"
          >
            <Tabs defaultValue="description" className="w-full">
              <div className="w-full overflow-x-auto scrollbar-none border-b border-border mb-8">
                <TabsList className="flex w-max min-w-full justify-start h-auto p-0 bg-transparent gap-1">
                  {["description", "reviews", "specifications", "care"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium capitalize text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground transition-colors whitespace-nowrap"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="max-w-4xl">
                <TabsContent value="description">
                  <div className="prose prose-slate max-w-none prose-headings:text-foreground">
                    <h2 className="text-xl font-bold mb-4 text-foreground">{product.title}</h2>
                    {product.descriptionHtml ? (
                      <div
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                      />
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <ProductReviews productId={productId} productHandle={handle || ""} category={product.productType || "general"} />
                </TabsContent>

                <TabsContent value="specifications">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.options.map((opt: ProductOption) => (
                      <div key={opt.name} className="flex justify-between gap-4 p-4 rounded-xl bg-card border border-border">
                        <span className="text-sm text-muted-foreground">{opt.name}</span>
                        <span className="text-sm font-semibold text-foreground text-right">{opt.values.join(", ")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 p-4 rounded-xl bg-card border border-border">
                      <span className="text-sm text-muted-foreground">Brand</span>
                      <span className="text-sm font-semibold text-foreground text-right">{product.vendor}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="care">
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    Built with quality materials. To keep it in good condition, avoid prolonged exposure to moisture and
                    clean with a dry, soft cloth. For product-specific guidance, message us on WhatsApp.
                  </p>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </article>

        {/* SEO content block */}
        {product && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-10">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">
                Buy {product.title} online in Pakistan — AI Bazar
              </h2>
              <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
                <p>
                  Looking to <strong>buy {product.title} online in Pakistan</strong>? AI Bazar offers this{" "}
                  {product.productType || "product"} at a low price with free delivery and cash on delivery nationwide.
                  Orders are dispatched within 24 hours and delivered in 1–3 business days.
                </p>
                <p>
                  At <strong>aibazar.pk</strong> every product is 100% genuine with a 7-day return policy. Whether
                  you're in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad or anywhere across Pakistan, you can
                  open the parcel and check it before you pay.
                </p>

                <div className="product-summary mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                  <h3 className="text-sm font-bold text-foreground mb-2">{product.title} — quick summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The {product.title} is available at AI Bazar (aibazar.pk) for{" "}
                    {money(parseFloat(product.priceRange.minVariantPrice.amount))}.
                    {product.availableForSale ? " In stock and ready for dispatch." : " Currently out of stock."} Free
                    delivery across Pakistan in 1–3 business days. Cash on delivery available in all cities.
                    {product.productType ? ` Category: ${product.productType}.` : ""} All products are 100% original with
                    a 7-day return policy.
                  </p>
                </div>

                <div className="product-faq mt-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">Frequently asked questions</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-semibold text-foreground">Is this {product.title} original?</dt>
                      <dd className="text-sm text-muted-foreground mt-1">
                        Yes — sold by AI Bazar (aibazar.pk), sourced directly from verified vendors.
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-foreground">
                        What is the price of {product.title} in Pakistan?
                      </dt>
                      <dd className="text-sm text-muted-foreground mt-1">
                        {money(parseFloat(product.priceRange.minVariantPrice.amount))} at AI Bazar, with free delivery.
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-foreground">Is cash on delivery available?</dt>
                      <dd className="text-sm text-muted-foreground mt-1">
                        Yes, COD is available across all cities and towns in Pakistan. You can open the parcel and check
                        it before paying.
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-foreground">How long does delivery take?</dt>
                      <dd className="text-sm text-muted-foreground mt-1">
                        Orders dispatch within 24 hours and arrive in 1–3 business days nationwide.
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related guides */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Guides &amp; usage tips</h2>
              <Link to="/blog" className="text-xs font-bold uppercase tracking-[0.14em] text-primary hover:text-primary-hover">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-card rounded-2xl p-3 border border-border shadow-soft hover:shadow-card-hover transition-shadow flex flex-col"
                >
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted mb-3">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-[0.14em] mb-1">{post.category}</div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-6">You may also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((rp) => {
                const rpPrice = parseFloat(rp.node.priceRange.minVariantPrice.amount);
                const rpImage = cdnImage(
                  rp.node.media?.edges?.[0]?.node?.previewImage?.url || rp.node.media?.edges?.[0]?.node?.image?.url,
                  400,
                );
                return (
                  <Link
                    key={rp.node.id}
                    to={`/products/${rp.node.handle}`}
                    className="group bg-card rounded-[14px] overflow-hidden border border-border shadow-soft hover:shadow-card-hover transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={rpImage || "/placeholder.svg"}
                        alt={`${rp.node.title} — buy online at AI Bazar Pakistan`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {rp.node.title}
                      </h3>
                      <p className="text-sm font-bold text-foreground">Rs. {rpPrice.toLocaleString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Sticky mobile CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={reduce ? undefined : { y: 100 }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: 100 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 py-3 bg-background/95 backdrop-blur border-t border-border shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">{product.title}</p>
                <p className="text-sm font-bold text-foreground">{money(price)}</p>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="h-11 px-6 shadow-gold"
              >
                {isOutOfStock ? "Out of stock" : "Add to cart"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
