import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, Loader2, ChevronRight, Tag, ArrowLeft, Share2, Star, ShoppingBag, CreditCard, Play, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storefrontApiRequest, ShopifyProduct, createStorefrontCheckout } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviews } from "@/hooks/useReviews";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useInView } from "react-intersection-observer";


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
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
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
  handle: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
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
      handle
      availableForSale
      productType
      vendor
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      media(first: 10) {
        edges {
          node {
            mediaContentType
            previewImage {
              url
            }
            ... on MediaImage {
              id
              image {
                url
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
            price {
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
      collections(first: 1) {
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
  const { stats: reviewStats } = useReviews(productId, handle || "");

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
        <div className="max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8">
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
                        if (!mediaNode) return <img src="/placeholder.svg" alt={product.title} className="w-full h-full object-cover" />;

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
                          <motion.img
                            src={imageUrl}
                            alt={product.title}
                            animate={{
                              scale: isInspecting ? 2 : 1,
                              transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                            }}
                            transition={{ duration: 0.1, ease: "linear" }}
                            className="w-full h-full object-cover"
                          />
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
                    <img
                      src={media.node.previewImage?.url || media.node.image?.url || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
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
                  <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] lg:max-w-[90%]">
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
                      <span className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter">
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
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 mb-1">Authentic</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Certified Source</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:border-primary/20 transition-all duration-700">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-500">
                        <RotateCcw className="w-7 h-7 text-slate-900 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 mb-1">Exchange</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">7-Day Return</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Description (Moved after Trust Badges) */}
                  <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The Narrative</label>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                      {product.description}
                    </p>
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
                <div className="space-y-1">
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
                    <h3 className="text-2xl font-bold mb-6 text-slate-900">Product Narrative</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <ProductReviews productId={productId} productHandle={handle || ""} />
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
        </div>
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
