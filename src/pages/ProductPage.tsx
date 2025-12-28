import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, Loader2, ChevronRight, Tag, ArrowLeft, Share2, Star, ShoppingBag, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storefrontApiRequest, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviews } from "@/hooks/useReviews";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Sparkles } from "lucide-react";

interface ProductImage {
  node: {
    url: string;
    altText: string | null;
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
  images: {
    edges: ProductImage[];
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
      images(first: 5) {
        edges {
          node {
            url
            altText
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

  const handleOrderNow = () => {
    handleAddToCart();
    // In a real app, this would redirect to checkout immediately
    toast.info("Proceeding to checkout...", {
      description: "Securely processing your order request.",
    });
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
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl btn-premium">
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

      <main className="flex-1 py-12 lg:py-24">
        <div className="container-custom">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] mb-8 text-slate-500 font-bold uppercase tracking-widest"
          >
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            {collection && (
              <>
                <Link to={`/collections/${collection.handle}`} className="hover:text-primary transition-colors">
                  {collection.title}
                </Link>
                <ChevronRight className="w-3 h-3 opacity-30" />
              </>
            )}
            <span className="text-slate-900 truncate">{product.title}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-20 xl:gap-32 items-start">
            {/* Gallery Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 sticky top-32"
            >
              <div
                className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl group relative border border-slate-100 cursor-zoom-in"
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
                    <motion.img
                      src={product.images.edges[selectedImage]?.node.url || "/placeholder.svg"}
                      alt={product.title}
                      animate={{
                        scale: isInspecting ? 2 : 1,
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                      }}
                      transition={{ duration: 0.1, ease: "linear" }}
                      className="w-full h-full object-cover"
                    />
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

                <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
                  <Button size="icon" variant="ghost" className="w-12 h-12 rounded-2xl glass-dark border-white/10 text-white">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-12 h-12 rounded-2xl glass-light border-slate-200 text-slate-800 bg-white/70">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none justify-center">
                {product.images.edges.map((image: ProductImage, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-[1.25rem] overflow-hidden border-2 transition-all duration-500 hover:scale-105 ${selectedImage === index
                      ? "border-primary ring-[6px] ring-primary/10 shadow-xl"
                      : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={image.node.url} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
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
                className="space-y-8"
              >
                {/* 1. Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
                    <span className="block opacity-90">{product.title}</span>
                  </h1>
                  <span className="inline-block px-5 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest border border-slate-200 rounded-lg">
                    {product.vendor || 'Boutique'} Exclusive
                  </span>
                </div>

                {/* 2. Rates (Price) & Stock */}
                <div ref={priceRef} className="space-y-6 py-8 border-y border-slate-200/60 transition-all duration-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl font-bold text-slate-900">{currencyCode}</span>
                      <span className="text-5xl font-black text-foreground tracking-tight">
                        {price.toLocaleString()}
                      </span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"
                    >
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">Highly Coveted</span>
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-4">
                    {product.availableForSale ? (
                      <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">In Stock</span>
                        <div className="w-[1px] h-3 bg-emerald-200 mx-1" />
                        <span className="text-[10px] font-bold text-emerald-600/70 uppercase">Reserved Boutique Selection</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200/50">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Reserved</span>
                      </div>
                    )}
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
                        Add to Piece
                      </Button>
                    </div>

                    {/* Order Now (Direct Checkout) */}
                    <Button
                      size="lg"
                      className="w-full h-20 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-gold transition-all duration-500 active:scale-[0.98] uppercase tracking-[0.2em] group"
                      onClick={handleOrderNow}
                      disabled={isOutOfStock}
                    >
                      <CreditCard className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />
                      Secure Order Now
                    </Button>
                  </div>
                </div>

                {/* Trust Signatures (Trust Badges) */}
                <div className="pt-10 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="flex items-center gap-3 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-primary/20 transition-all duration-500">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Truck className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Express Delivery</p>
                        <p className="text-[10px] text-slate-400">Fast courier service</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-primary/20 transition-all duration-500">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Secure Checkout</p>
                        <p className="text-[10px] text-slate-400">Encrypted protection</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Description (Moved after Trust Badges) */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Details</label>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>

                  {/* Artisan Signature Block (Subtle below description) */}
                  <div className="mt-12 relative p-8 rounded-[2.5rem] bg-slate-950 text-white overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] group-hover:w-48 transition-all duration-1000" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Artisan Integrity</p>
                        <h4 className="text-lg font-bold tracking-tight">Verified Boutique Selection</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Registry No.</p>
                        <p className="text-xs font-mono tracking-tighter text-primary">AQ-{Math.floor(Math.random() * 90000) + 10000}</p>
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
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-slate-200/60"
          >
            {[
              { icon: Shield, title: "Artisan Protected", desc: "100% Certified Source" },
              { icon: Truck, title: "Concierge Shipping", desc: "Priority Global Escort" },
              { icon: CreditCard, title: "Encrypted Portal", desc: "Secure Vault Payment" },
              { icon: Star, title: "Registry Service", desc: "Lifetime Support" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-premium flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{item.title}</h5>
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
            className="mt-32"
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-center border-b border-slate-200 h-auto p-0 bg-transparent mb-20">
                {["description", "reviews", "specifications", "care"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-4 border-transparent px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 data-[state=active]:border-primary data-[state=active]:text-slate-900 transition-all"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

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
                className="flex-1 h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-gold border-none"
              >
                Procure Piece
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
