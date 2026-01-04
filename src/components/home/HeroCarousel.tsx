import { useState, useEffect } from "react";
import { ArrowRight, Truck, Shield, RotateCcw, Star, Zap, ChevronLeft, ChevronRight, Sparkles, TrendingUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";

const heroSlides = [
  {
    id: 1,
    badge: "🔥 Hot Deals",
    title: "Up to",
    highlight: "50% OFF",
    subtitle: "New Arrivals",
    description: "Discover amazing deals on premium products. Limited time offer!",
    cta: "Shop Now",
    accent: "from-rose-500 via-pink-500 to-purple-600",
    glow: "bg-rose-500/30",
  },
  {
    id: 2,
    badge: "⚡ Flash Sale",
    title: "Mega",
    highlight: "SAVINGS",
    subtitle: "This Week Only",
    description: "Don't miss out on exclusive deals. Save big on top brands!",
    cta: "View Deals",
    accent: "from-amber-500 via-orange-500 to-red-500",
    glow: "bg-orange-500/30",
  },
  {
    id: 3,
    badge: "✨ Premium",
    title: "Quality",
    highlight: "PRODUCTS",
    subtitle: "Curated Collection",
    description: "Handpicked products that meet the highest quality standards.",
    cta: "Explore",
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    glow: "bg-emerald-500/30",
  },
];

export const HeroCarousel = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentHero = heroSlides[currentSlide];
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full space-y-6">
      {/* Main Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Main Hero Banner - Takes 7 columns */}
        <div className="lg:col-span-7 relative min-h-[420px] md:min-h-[500px] rounded-3xl overflow-hidden group">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-secondary" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              {/* Gradient Orbs */}
              <div className={`absolute -top-20 -right-20 w-96 h-96 ${currentHero.glow} rounded-full blur-3xl opacity-60`} />
              <div className={`absolute -bottom-20 -left-20 w-80 h-80 ${currentHero.glow} rounded-full blur-3xl opacity-40`} />
              
              {/* Animated Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentHero.accent} shadow-lg`}
                >
                  <span className="text-sm font-bold text-white tracking-wide">
                    {currentHero.badge}
                  </span>
                </motion.div>

                {/* Main Title */}
                <div className="space-y-2">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/70 text-lg md:text-xl font-medium"
                  >
                    {currentHero.title}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r ${currentHero.accent} bg-clip-text text-transparent leading-none tracking-tight`}
                  >
                    {currentHero.highlight}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white text-xl md:text-2xl font-semibold"
                  >
                    {currentHero.subtitle}
                  </motion.p>
                </div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/60 text-sm md:text-base max-w-md leading-relaxed"
                >
                  {currentHero.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap gap-3 pt-2"
                >
                  <Button
                    size="lg"
                    asChild
                    className={`h-14 px-8 rounded-2xl bg-gradient-to-r ${currentHero.accent} hover:opacity-90 text-white font-bold shadow-xl shadow-black/20 group/btn border-0`}
                  >
                    <Link to="/category/all" className="flex items-center gap-2">
                      {currentHero.cta}
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-8 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold backdrop-blur-sm"
                  >
                    <Link to="/category/all">View All</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === currentSlide 
                        ? 'w-10 bg-white' 
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Cards Grid - Takes 5 columns */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
              <motion.div
                key={product.node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onMouseEnter={() => setHoveredProduct(index)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link
                  to={`/product/${product.node.handle}`}
                  className="group relative block aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                >
                  {/* Product Image */}
                  <img
                    src={product.node.images.edges[0]?.node?.url || "/placeholder.svg"}
                    alt={product.node.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${hoveredProduct === index ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`} />
                  
                  {/* Badge */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      Hot
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      New
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${hoveredProduct === index ? 'translate-y-0' : 'translate-y-2 lg:translate-y-full'}`}>
                    <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                      {product.node.title}
                    </h3>
                    <p className="text-lg font-extrabold text-primary">
                      {product.node.priceRange.minVariantPrice.currencyCode}{' '}
                      {parseFloat(product.node.priceRange.minVariantPrice.amount).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Quick View Button */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${hoveredProduct === index ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                    <span className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-secondary shadow-lg">
                      Quick View
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center aspect-square rounded-2xl bg-muted">
              <p className="text-muted-foreground text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Promo Cards + Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Promo Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/category/all"
            className="group relative block h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 p-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-white" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Special Offer</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Free Shipping</h3>
                <p className="text-white/70 text-sm">On orders over $50</p>
              </div>
            </div>
            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* Promo Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/category/all"
            className="group relative block h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Trending</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Best Sellers</h3>
                <p className="text-white/70 text-sm">Shop top-rated products</p>
              </div>
            </div>
            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* Promo Card 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/category/all"
            className="group relative block h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">New</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">New Arrivals</h3>
                <p className="text-white/70 text-sm">Fresh collection just in</p>
              </div>
            </div>
            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: Truck, title: "Free Delivery", desc: "Orders over $50", color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Shield, title: "Secure Payment", desc: "100% protected", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: RotateCcw, title: "Easy Returns", desc: "7-day policy", color: "text-orange-500", bg: "bg-orange-500/10" },
          { icon: Star, title: "Top Quality", desc: "Premium products", color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
          >
            <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
