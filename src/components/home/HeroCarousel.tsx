import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { ProductQuickView } from "@/components/product/ProductQuickView";
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
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <div className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] w-full overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-premium">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 h-full container-custom py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center h-full">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 lg:space-y-10"
          >
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Latest Arrivals
              </span>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95]"
              >
                Discover
                <br />
                <span className="text-primary uppercase text-[0.5em] tracking-[0.2em] block mt-4">
                  Premium Collection
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/70 font-medium max-w-xl leading-relaxed"
              >
                Explore our handpicked selection of the finest products, curated for those who demand excellence.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                asChild
                className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] group shadow-gold transition-all duration-500"
              >
                <Link to="/category/all" className="flex items-center justify-center gap-3">
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-transparent border-white/20 text-white hover:bg-white hover:text-slate-900 font-black uppercase tracking-[0.2em] transition-all duration-500"
              >
                View Collections
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-8 pt-8 border-t border-white/10"
            >
              <div>
                <div className="text-3xl font-black text-white">{products.length}+</div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/50">New Products</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">100%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/50">Premium Quality</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Product Grid */}
          <div className="relative">
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product, index) => (
                  <ProductQuickView
                    key={product.node.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                  <p className="text-white/60 font-medium">Loading latest products...</p>
                </div>
              </div>
            )}

            {/* Floating Badge */}
            <AnimatePresence mode="wait">
              {!loading && products.length > 0 && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-6 -right-6 bg-primary text-white px-6 py-3 rounded-full shadow-2xl"
                >
                  <div className="text-center">
                    <div className="text-xs font-black uppercase tracking-wider">Featured</div>
                    <div className="text-[10px] opacity-80">#{currentIndex + 1}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  );
};
