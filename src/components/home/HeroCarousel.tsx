import { useState, useEffect } from "react";
import { ArrowRight, Truck, Shield, RotateCcw, Star, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";

const heroSlides = [
  {
    id: 1,
    badge: "New Arrivals",
    title: "Discover What's",
    highlight: "Trending Now",
    description: "Shop the latest collection with up to 50% off on selected items",
    cta: "Shop Collection",
    bgGradient: "from-violet-600 via-purple-600 to-indigo-700",
  },
  {
    id: 2,
    badge: "Flash Sale",
    title: "Mega Deals",
    highlight: "This Week Only",
    description: "Limited time offers on premium products. Don't miss out!",
    cta: "View Deals",
    bgGradient: "from-orange-500 via-red-500 to-pink-600",
  },
  {
    id: 3,
    badge: "Premium Quality",
    title: "Curated For",
    highlight: "Excellence",
    description: "Handpicked products that meet the highest quality standards",
    cta: "Explore Now",
    bgGradient: "from-emerald-600 via-teal-600 to-cyan-700",
  },
];

export const HeroCarousel = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

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

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate featured products
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % Math.min(products.length, 4));
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length]);

  const currentHero = heroSlides[currentSlide];
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">
      {/* Main Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Left: Main Hero Banner */}
        <div className="lg:col-span-2 relative min-h-[400px] md:min-h-[450px] lg:min-h-[480px] rounded-2xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 bg-gradient-to-br ${currentHero.bgGradient}`}
            >
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 right-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
              </div>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {currentHero.badge}
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                    {currentHero.title}
                  </h1>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white/90 leading-[1.1] tracking-tight">
                    {currentHero.highlight}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-white/80 text-sm md:text-base max-w-md leading-relaxed">
                  {currentHero.description}
                </p>

                {/* CTA */}
                <Button
                  size="lg"
                  asChild
                  className="h-12 md:h-14 px-8 rounded-xl bg-white text-secondary hover:bg-white/90 font-bold shadow-xl shadow-black/20 group/btn"
                >
                  <Link to="/category/all" className="flex items-center gap-2">
                    {currentHero.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation */}
            <div className="flex items-center gap-3 mt-6">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 bg-white' 
                      : 'w-4 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Secondary Panels */}
        <div className="grid grid-rows-2 gap-4 lg:gap-5">
          {/* Top Panel - Featured Product */}
          <div className="relative min-h-[200px] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/90 group cursor-pointer">
            {loading ? (
              <Skeleton className="absolute inset-0" />
            ) : featuredProducts[currentProductIndex] ? (
              <Link to={`/product/${featuredProducts[currentProductIndex].node.handle}`} className="block h-full">
                {/* Product Image */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2">
                  <img
                    src={featuredProducts[currentProductIndex].node.images.edges[0]?.node?.url || "/placeholder.svg"}
                    alt={featuredProducts[currentProductIndex].node.title}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Featured</span>
                    <h3 className="text-lg font-bold text-white line-clamp-2 max-w-[60%]">
                      {featuredProducts[currentProductIndex].node.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-primary">
                      {featuredProducts[currentProductIndex].node.priceRange.minVariantPrice.currencyCode}{' '}
                      {parseFloat(featuredProducts[currentProductIndex].node.priceRange.minVariantPrice.amount).toLocaleString()}
                    </span>
                    <div className="flex gap-1">
                      {featuredProducts.map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${idx === currentProductIndex ? 'bg-primary' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/60 text-sm">No products found</p>
              </div>
            )}
          </div>

          {/* Bottom Panel - Promotional */}
          <div className="relative min-h-[200px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 to-primary group cursor-pointer">
            <Link to="/category/all" className="block h-full">
              {/* Decorative */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white rounded-full blur-2xl" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span className="text-xs font-bold text-white">Top Rated</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                      Best Sellers
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      Shop our most loved products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                  <span className="text-sm">Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
          { icon: Shield, title: "Secure Payment", desc: "100% protected" },
          { icon: RotateCcw, title: "Easy Returns", desc: "7-day policy" },
          { icon: Star, title: "Top Quality", desc: "Premium products" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
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
