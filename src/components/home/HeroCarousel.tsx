import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroCarousel = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(8);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Auto-rotate spotlight product
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(products.length, 4));
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.min(products.length, 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.min(products.length, 4)) % Math.min(products.length, 4));
  };

  const featuredProducts = products.slice(0, 4);
  const currentProduct = featuredProducts[currentIndex];

  return (
    <div className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[650px] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-secondary shadow-xl">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 h-full container-custom py-10 md:py-14 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:space-y-8"
          >
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                New Collection
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]"
              >
                Premium Quality
                <br />
                <span className="text-primary">Best Prices</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base md:text-lg text-white/70 max-w-md leading-relaxed"
              >
                Discover our handpicked collection of premium products. Quality you can trust, prices you'll love.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                size="lg"
                asChild
                className="h-12 sm:h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group shadow-lg shadow-primary/25"
              >
                <Link to="/category/all" className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 sm:h-14 px-8 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 font-semibold"
              >
                <Link to="/category/all">View All Products</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-8 pt-6 border-t border-white/10"
            >
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">{products.length}+</div>
                <div className="text-xs text-white/50 font-medium">Products</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">Free</div>
                <div className="text-xs text-white/50 font-medium">Shipping*</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">7 Days</div>
                <div className="text-xs text-white/50 font-medium">Returns</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Featured Product Showcase */}
          <div className="relative">
            {loading ? (
              <div className="aspect-square rounded-2xl bg-white/10 animate-pulse" />
            ) : featuredProducts.length > 0 ? (
              <div className="relative">
                {/* Main Featured Image */}
                <AnimatePresence mode="wait">
                  {currentProduct && (
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="relative"
                    >
                      <Link to={`/product/${currentProduct.node.handle}`} className="block group">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl">
                          <img
                            src={currentProduct.node.images.edges[0]?.node?.url || "/placeholder.svg"}
                            alt={currentProduct.node.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        
                        {/* Product Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                            {currentProduct.node.title}
                          </h3>
                          <p className="text-xl font-bold text-primary">
                            {currentProduct.node.priceRange.minVariantPrice.currencyCode}{' '}
                            {parseFloat(currentProduct.node.priceRange.minVariantPrice.amount).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Controls */}
                <div className="absolute -bottom-14 left-0 right-0 flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  {/* Dots */}
                  <div className="flex gap-2">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex 
                            ? 'w-6 bg-primary' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-square">
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-white/60 text-sm">Loading products...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};