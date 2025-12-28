import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, Loader2, ChevronRight, Tag, ArrowLeft, Share2, Star, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storefrontApiRequest, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviews } from "@/hooks/useReviews";
import { motion, AnimatePresence } from "framer-motion";

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
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);

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
      product: { node: product },
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
            className="flex items-center gap-3 text-xs mb-12 text-muted-foreground font-black uppercase tracking-[0.2em]"
          >
            <Link to="/" className="hover:text-primary transition-colors">Portal</Link>
            <ChevronRight className="w-3 h-3" />
            {collection && (
              <>
                <Link to={`/category/${collection.handle}`} className="hover:text-primary transition-colors">
                  {collection.title}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-foreground truncate opacity-50">{product.title}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-20 xl:gap-32 items-start">
            {/* Gallery Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 sticky top-32"
            >
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl group relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images.edges[selectedImage]?.node.url || "/placeholder.svg"}
                    alt={product.title}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </AnimatePresence>
                <div className="absolute top-6 right-6 z-10">
                  <Button size="icon" variant="ghost" className="w-12 h-12 rounded-2xl glass-dark border-white/10 text-white">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none justify-center">
                {product.images.edges.map((image: any, index: number) => (
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
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <span className="px-5 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.5em] rounded-full border border-primary/10">
                    {product.vendor || 'Boutique'} Exclusive
                  </span>
                  {product.availableForSale ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">In Stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reserved</span>
                    </div>
                  )}
                </div>
                <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black text-foreground text-editorial tracking-[-0.05em] leading-[0.8] mb-4">
                  <span className="block opacity-90">{product.title.split(' ')[0]}</span>
                  <span className="block text-gold-leaf">{product.title.split(' ').slice(1).join(' ')}</span>
                </h1>

                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3 bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
                    <StarRating rating={reviewStats.averageRating} size="sm" />
                    <span className="text-sm font-black text-slate-900">
                      {reviewStats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] vertical-rl rotate-180">Authentic Series</span>
                    <div className="w-10 h-[1px] bg-slate-300" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 py-8 border-y border-slate-200/60">
                  <div className="flex flex-col">
                    <span className="label-premium mb-2">Artisan Boutique Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">{currencyCode}</span>
                      <span className="text-6xl font-black text-foreground tracking-tighter font-playfair italic">
                        {price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>

                {/* Variant Options */}
                {product.options.length > 0 && product.options[0].name !== 'Title' && (
                  <div className="space-y-10">
                    {product.options.map((option: any) => (
                      <div key={option.name} className="space-y-4">
                        <label className="label-premium ml-1">{option.name}</label>
                        <div className="flex flex-wrap gap-4">
                          {option.values.map((value: string) => {
                            const isSelected = selectedVariant?.selectedOptions?.some((opt: any) => opt.name === option.name && opt.value === value);
                            return (
                              <button
                                key={value}
                                onClick={() => {
                                  const newVariant = product.variants.edges.find((v: any) =>
                                    v.node.selectedOptions.some((opt: any) => opt.name === option.name && opt.value === value)
                                  )?.node;
                                  if (newVariant) setSelectedVariant(newVariant);
                                }}
                                className={`px-8 py-3.5 text-sm font-black rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${isSelected
                                  ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm"
                                  }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity & Actions */}
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-stretch gap-6">
                    <div className="flex items-center justify-between glass border-slate-200 rounded-2xl px-3 py-2 bg-white shadow-xl min-w-[160px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-slate-900 hover:bg-slate-100 rounded-xl"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <span className="px-6 text-xl font-black text-slate-900">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-slate-900 hover:bg-slate-100 rounded-xl"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>

                    <Button
                      size="lg"
                      className="flex-1 h-20 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-gold transition-all duration-500 active:scale-[0.98] group uppercase tracking-widest"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                    >
                      <ShoppingBag className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-500" />
                      {isOutOfStock ? 'Sold Out' : 'Acquire Piece'}
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { icon: Truck, label: "Express Delivery", meta: "Fast courier service" },
                      { icon: Shield, label: "Secure Checkout", meta: "100% protected" }
                    ].map((badge, i) => (
                      <div
                        key={i}
                        className="premium-card p-6 flex flex-col items-center text-center bg-white border-slate-100 shadow-md"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                          <badge.icon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-1">{badge.label}</p>
                        <p className="text-[9px] text-muted-foreground font-medium">{badge.meta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Expanded Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-center border-b border-slate-200 h-auto p-0 bg-transparent mb-20">
                {["description", "reviews", "specifications"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-4 border-transparent px-10 py-6 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 data-[state=active]:border-primary data-[state=active]:text-slate-900 transition-all"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="max-w-5xl mx-auto">
                <TabsContent value="description" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <p className="text-2xl text-slate-700 leading-[1.6] font-medium text-center">
                    {product.description}
                  </p>
                </TabsContent>

                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <ProductReviews productId={productId} productHandle={handle || ""} />
                </TabsContent>

                <TabsContent value="specifications" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {product.options.map((opt: any) => (
                      <div key={opt.name} className="flex justify-between p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                        <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">{opt.name}</span>
                        <span className="font-bold text-slate-900">{opt.values.join(', ')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Vendor</span>
                      <span className="font-bold text-slate-900">{product.vendor}</span>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
