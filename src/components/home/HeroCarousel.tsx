import { useState, useEffect, useRef } from "react";
import { ArrowRight, Truck, Shield, RotateCcw, Star, Zap, ChevronLeft, ChevronRight, Sparkles, TrendingUp, Gift, Play, Heart, Eye, ShoppingBag, Clock, Users, Award, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Skeleton } from "@/components/ui/skeleton";

const heroSlides = [
  {
    id: 1,
    badge: "🔥 FLASH SALE",
    tagline: "LIMITED TIME OFFER",
    title: "MEGA",
    highlight: "DEALS",
    discount: "70%",
    description: "Unlock exclusive savings on premium products. Don't miss out on the biggest sale of the season.",
    cta: "Shop Now",
    ctaSecondary: "View Collection",
    gradient: "from-rose-500 via-pink-500 to-violet-600",
    accentColor: "rose",
    bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80&auto=format",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(251,113,133,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.2) 0%, transparent 50%)",
  },
  {
    id: 2,
    badge: "⚡ NEW ARRIVALS",
    tagline: "JUST DROPPED",
    title: "FRESH",
    highlight: "STYLES",
    discount: "NEW",
    description: "Be the first to discover our latest collection. Curated pieces that define tomorrow's trends.",
    cta: "Explore Now",
    ctaSecondary: "See What's New",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    accentColor: "emerald",
    bgImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80&auto=format",
    bgPattern: "radial-gradient(circle at 30% 70%, rgba(52,211,153,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(34,211,238,0.2) 0%, transparent 50%)",
  },
  {
    id: 3,
    badge: "✨ EXCLUSIVE",
    tagline: "MEMBERS ONLY",
    title: "VIP",
    highlight: "ACCESS",
    discount: "50%",
    description: "Premium products at unbeatable prices. Experience luxury without the premium price tag.",
    cta: "Join VIP",
    ctaSecondary: "Learn More",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    accentColor: "amber",
    bgImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80&auto=format",
    bgPattern: "radial-gradient(circle at 25% 75%, rgba(251,191,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(239,68,68,0.2) 0%, transparent 50%)",
  },
];

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: timeLeft.hours, label: "HRS" },
        { value: timeLeft.minutes, label: "MIN" },
        { value: timeLeft.seconds, label: "SEC" },
      ].map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div className="relative">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-xl flex flex-col items-center justify-center border border-white/20">
              <span className="text-lg md:text-xl font-black text-white tabular-nums">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold text-white/60 tracking-widest">{item.label}</span>
            </div>
          </div>
          {index < 2 && <span className="text-white/50 font-bold text-xl">:</span>}
        </div>
      ))}
    </div>
  );
};

// Live Activity Indicator
const LiveActivity = () => {
  const [viewers, setViewers] = useState(127);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-xs font-semibold text-white/90">
        <Users className="w-3 h-3 inline mr-1" />
        {viewers} viewing now
      </span>
    </motion.div>
  );
};

export const HeroCarousel = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(8);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const currentHero = heroSlides[currentSlide];
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full space-y-5">
      {/* Main Hero Section */}
      <div
        ref={heroRef}
        className="relative min-h-[600px] md:min-h-[650px] rounded-[2rem] overflow-hidden"
      >
        {/* Animated Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-secondary" />

            {/* Background Image */}
            {currentHero.bgImage && (
              <div className="absolute inset-0">
                <img
                  src={`${currentHero.bgImage}&w=1920&q=90&auto=format`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading={currentSlide === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-secondary/60 mix-blend-multiply" />
              </div>
            )}

            {/* Dynamic Color Pattern */}
            <div
              className="absolute inset-0 transition-all duration-1000"
              style={{ background: currentHero.bgPattern }}
            />

            {/* Animated Gradient Orbs with Mouse Parallax */}
            <motion.div
              className={`absolute w-[600px] h-[600px] bg-gradient-to-br ${currentHero.gradient} rounded-full blur-[120px] opacity-40`}
              style={{
                top: `${-20 + mousePosition.y * 10}%`,
                right: `${-10 + mousePosition.x * 10}%`,
              }}
            />
            <motion.div
              className={`absolute w-[500px] h-[500px] bg-gradient-to-tr ${currentHero.gradient} rounded-full blur-[100px] opacity-30`}
              style={{
                bottom: `${-15 + mousePosition.y * 8}%`,
                left: `${-5 + mousePosition.x * 8}%`,
              }}
            />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: "100%",
                    opacity: 0
                  }}
                  animate={{
                    y: "-10%",
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear",
                  }}
                />
              ))}
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')]" />
          </motion.div>
        </AnimatePresence>

        {/* Content Grid */}
        <div className="relative z-10 h-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 lg:p-10">
          {/* Left Content - Hero Text */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Top Bar - Badge + Live Activity */}
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentHero.gradient} shadow-xl shadow-black/20`}
                  >
                    <Flame className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-xs font-black text-white tracking-wider">
                      {currentHero.badge}
                    </span>
                  </motion.div>
                  <LiveActivity />
                </div>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm md:text-base font-bold text-white/50 tracking-[0.3em] uppercase"
                >
                  {currentHero.tagline}
                </motion.p>

                {/* Main Headline */}
                <div className="space-y-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.9] tracking-tighter"
                  >
                    {currentHero.title}
                  </motion.h1>
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black bg-gradient-to-r ${currentHero.gradient} bg-clip-text text-transparent leading-[0.9] tracking-tighter`}
                  >
                    {currentHero.highlight}
                  </motion.h2>
                </div>

                {/* Discount Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="inline-flex items-baseline gap-1"
                >
                  <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Up to</span>
                  <span className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${currentHero.gradient} bg-clip-text text-transparent`}>
                    {currentHero.discount}
                  </span>
                  {currentHero.discount !== "NEW" && (
                    <span className="text-2xl md:text-3xl font-black text-white/80">OFF</span>
                  )}
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-base md:text-lg text-white/60 max-w-lg leading-relaxed"
                >
                  {currentHero.description}
                </motion.p>

                {/* Countdown Timer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/50" />
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Sale ends in</span>
                  </div>
                  <CountdownTimer />
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-wrap gap-3 pt-2"
                >
                  <Button
                    size="lg"
                    asChild
                    className={`h-14 px-8 rounded-2xl bg-gradient-to-r ${currentHero.gradient} hover:opacity-90 text-white font-bold shadow-2xl shadow-black/30 group/btn border-0 relative overflow-hidden`}
                  >
                    <Link to="/category/all" className="flex items-center gap-2">
                      <span className="relative z-10">{currentHero.cta}</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-8 rounded-2xl bg-white/5 border-white/20 text-white hover:bg-white/10 font-semibold backdrop-blur-md group/btn2"
                  >
                    <Link to="/category/all" className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      {currentHero.ctaSecondary}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="group relative"
                  >
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide
                      ? `w-12 bg-gradient-to-r ${currentHero.gradient}`
                      : "w-3 bg-white/30 group-hover:bg-white/50"
                      }`} />
                    {index === currentSlide && (
                      <motion.div
                        layoutId="slideIndicator"
                        className="absolute inset-0 rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-white/40 text-sm font-mono ml-2">
                {String(currentSlide + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 content-center">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredProduct(index)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="relative group"
                >
                  <Link
                    to={`/product/${product.node.handle}`}
                    className="relative block aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500"
                  >
                    {/* Product Image */}
                    <img
                      src={(() => {
                        const url = product.node.media?.edges[0]?.node?.previewImage?.url || product.node.media?.edges[0]?.node?.image?.url || "/placeholder.svg";
                        const separator = url.includes('?') ? '&' : '?';
                        return `${url}${separator}width=400&quality=80`;
                      })()}
                      alt={product.node.title}
                      loading={index < 2 ? "eager" : "lazy"}
                      {...((index < 2) ? { fetchpriority: "high" } : {})}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${hoveredProduct === index ? "opacity-100" : "opacity-60"}`} />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {index === 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg"
                        >
                          🔥 Hot
                        </motion.span>
                      )}
                      {index === 1 && (
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                          ✨ New
                        </span>
                      )}
                      {index === 2 && (
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                          -30%
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: hoveredProduct === index ? 1 : 0, scale: hoveredProduct === index ? 1 : 0.5 }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
                      onClick={(e) => { e.preventDefault(); }}
                    >
                      <Heart className="w-4 h-4 text-secondary" />
                    </motion.button>

                    {/* Product Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: hoveredProduct === index ? 0 : 10, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                          {product.node.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-black text-white">
                            <span className="text-white/60 text-xs mr-1">
                              {product.node.priceRange.minVariantPrice.currencyCode}
                            </span>
                            {parseFloat(product.node.priceRange.minVariantPrice.amount).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-white/80">4.9</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Quick Add Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: hoveredProduct === index ? 1 : 0, y: hoveredProduct === index ? 0 : 10 }}
                        className="mt-3"
                      >
                        <button className="w-full py-2.5 rounded-xl bg-white text-secondary text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          Quick Add
                        </button>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center aspect-square rounded-2xl bg-white/5 backdrop-blur-md">
                <p className="text-white/50 text-sm">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Promo Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Gift,
            title: "Free Shipping",
            desc: "Orders over $50",
            gradient: "from-violet-500 to-purple-600",
            delay: 0.1,
          },
          {
            icon: Zap,
            title: "Flash Deals",
            desc: "Up to 70% off",
            gradient: "from-orange-500 to-red-500",
            delay: 0.2,
          },
          {
            icon: Award,
            title: "Premium Quality",
            desc: "Curated products",
            gradient: "from-emerald-500 to-teal-600",
            delay: 0.3,
          },
          {
            icon: TrendingUp,
            title: "Best Sellers",
            desc: "Top rated items",
            gradient: "from-pink-500 to-rose-500",
            delay: 0.4,
            link: "/category/top-selling"
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
          >
            <Link
              to={card.link || "/category/all"}
              className={`group relative block h-28 rounded-2xl overflow-hidden bg-gradient-to-br ${card.gradient} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 h-full flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{card.title}</h3>
                  <p className="text-white/70 text-sm">{card.desc}</p>
                </div>
              </div>
              <ArrowRight className="absolute bottom-5 right-5 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: Truck, title: "Free Delivery", desc: "On orders $50+", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { icon: Shield, title: "Secure Checkout", desc: "256-bit encryption", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { icon: RotateCcw, title: "Easy Returns", desc: "30-day guarantee", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
          { icon: Star, title: "5-Star Reviews", desc: "Trusted by 50k+", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className={`flex items-center gap-3 p-4 rounded-2xl bg-card border ${item.border} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
          >
            <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
