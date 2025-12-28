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
  const [showFullDescription, setShowFullDescription] = useState(false);
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
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl group relative border border-slate-100">
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
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                {/* 1. Heading */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="px-5 py-2 bg-primary/5 text-primary label-premium border border-primary/10 rounded-full">
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
                  <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-foreground text-editorial tracking-[-0.05em] leading-[0.8]">
                    <span className="block opacity-90">{product.title.split(' ')[0]}</span>
                    <span className="block text-gold-leaf">{product.title.split(' ').slice(1).join(' ')}</span>
                  </h1>
                </div>

                {/* 2. Rates (Price) */}
                <div className="flex flex-col py-6 border-y border-slate-200/60">
                  <span className="label-premium mb-2">Investment Rate</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-primary">{currencyCode}</span>
                    <span className="text-7xl font-black text-foreground tracking-tighter font-playfair italic">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Inc. Taxes</span>
                  </div>
                </div>

                {/* 3. Variant Options & Buttons */}
                <div className="space-y-10">
                  {/* Variant Selection */}
                  {product.options.length > 0 && product.options[0].name !== 'Title' && (
                    <div className="space-y-6">
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
                                  className={`px-8 py-4 text-sm font-black rounded-2xl border-2 transition-all duration-300 ${isSelected
                                    ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-105"
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
                          className="h-12 w-12 text-slate-900 hover:bg-slate-100 rounded-xl"
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

                {/* 4. Description (Show in Short) */}
                <div className="space-y-4 pt-6">
                  <label className="label-premium">Masterpiece Description</label>
                  <div className="relative">
                    <p className={`text-lg text-slate-600 leading-relaxed font-medium ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                      {product.description}
                    </p>
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary text-[10px] font-black uppercase tracking-widest mt-4 hover:underline transition-all"
                    >
                      {showFullDescription ? 'Read Less -' : 'Read Full Journey +'}
                    </button>
                  </div>
                </div>

                {/* Trust Signatures */}
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Global Escort</p>
                      <p className="text-[9px] text-slate-400">Insured Delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Certified</p>
                      <p className="text-[9px] text-slate-400">100% Authentic</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Expanded Details Engine */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="w-full justify-center border-b border-slate-200 h-auto p-0 bg-transparent mb-20">
                {["reviews", "specifications", "care"].map((tab) => (
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
                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <ProductReviews productId={productId} productHandle={handle || ""} />
                </TabsContent>

                <TabsContent value="specifications" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {product.options.map((opt: any) => (
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
                    <h3 className="text-3xl font-black mb-6 italic font-playfair">Artisan Care Guide</h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Each piece is a testament to timeless craftsmanship. To preserve its integrity, avoid direct exposure to harsh elements and cleanse with a soft, specialized cloth. Handle with the same passion it was created with.
                    </p>
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
