import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const slides = [
  {
    id: 1,
    title: "The Future of Style",
    subtitle: "Experience the next generation of apparel designed for the modern visionary. Where innovation meets elegance.",
    cta: "Explore Collection",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=800&fit=crop",
    tag: "A/W 2025 Edition",
    accent: "bg-primary"
  },
  {
    id: 2,
    title: "Culinary Mastery",
    subtitle: "Professional-grade tools for the home chef. Transform your kitchen into a five-star studio.",
    cta: "Shop Essentials",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=800&fit=crop",
    tag: "Kitchen Innovation",
    accent: "bg-secondary"
  },
  {
    id: 3,
    title: "Focused Mindset",
    subtitle: "Curated desk essentials to elevate your productivity. Minimalist design for maximum impact.",
    cta: "Optimize Space",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=800&fit=crop",
    tag: "Modern Workspace",
    accent: "bg-accent"
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] md:h-[850px] overflow-hidden rounded-[3rem] shadow-2xl bg-slate-900 group/hero perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Parallax Image */}
          <motion.div
            className="absolute inset-0 scale-110"
            style={{ x: translateX, y: translateY }}
          >
            <motion.img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
            />
          </motion.div>

          {/* Dynamic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

          {/* Animated Accent Glow with Parallax */}
          <motion.div
            className={`absolute top-0 right-0 w-[1000px] h-[1000px] blur-[180px] opacity-20 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none z-0 ${slides[currentSlide].accent}`}
            style={{ x: useTransform(smoothX, [-0.5, 0.5], [50, -50]), y: useTransform(smoothY, [-0.5, 0.5], [50, -50]) }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="container-custom relative h-full flex items-center z-20">
            <motion.div
              style={{ rotateX, rotateY }}
              className="max-w-4xl pt-12"
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="px-6 py-2.5 rounded-full glass border-white/20 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-white shadow-2xl">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  {slides[currentSlide].tag}
                </div>
              </motion.div>

              <div className="overflow-hidden mb-10">
                <motion.h2
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-6xl md:text-8xl lg:text-[11rem] font-black leading-[0.8] tracking-tighter text-white"
                >
                  {slides[currentSlide].title.split(' ').map((word, i) => (
                    <span key={i} className="inline-block mr-8 last:mr-0 last:text-glow">
                      {word}
                    </span>
                  ))}
                </motion.h2>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-lg md:text-2xl mb-14 text-white/70 font-medium max-w-2xl leading-relaxed"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-8"
              >
                <Button
                  size="lg"
                  asChild
                  className="h-20 px-14 rounded-2xl btn-premium text-white text-xl font-bold group/btn shadow-2xl shadow-primary/40 border-none"
                >
                  <Link to="/category/all">
                    {slides[currentSlide].cta}
                    <ArrowRight className="w-6 h-6 ml-3 group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="h-20 px-10 rounded-2xl glass-dark border-white/10 text-white hover:bg-white/10 text-xl font-bold transition-all hover:scale-105"
                >
                  Visual Tour
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Premium Navigation Controls */}
      <div className="absolute bottom-16 left-12 right-12 flex items-center justify-between z-30">
        <div className="flex items-center gap-10">
          <button
            onClick={handlePrev}
            className="w-16 h-16 flex items-center justify-center rounded-2xl glass border-white/10 text-white hover:bg-primary transition-all duration-500 group/nav shadow-2xl"
          >
            <ChevronLeft className="w-8 h-8 group-hover/nav:-translate-x-1 transition-transform" />
          </button>

          <div className="flex gap-5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group relative h-16 flex items-center"
              >
                <div className={`h-1 rounded-full transition-all duration-700 ease-[0.22, 1, 0.36, 1] ${index === currentSlide
                    ? "w-20 bg-primary shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                    : "w-8 bg-white/20 group-hover:bg-white/40"
                  }`} />
                {index === currentSlide && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10"
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-16 h-16 flex items-center justify-center rounded-2xl glass border-white/10 text-white hover:bg-primary transition-all duration-500 group/nav shadow-2xl"
          >
            <ChevronRight className="w-8 h-8 group-hover/nav:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Slide Counter */}
        <div className="hidden md:flex items-center gap-6">
          <span className="text-4xl font-black text-white leading-none">0{currentSlide + 1}</span>
          <div className="w-12 h-px bg-white/20" />
          <span className="text-xl font-bold text-white/40">0{slides.length}</span>
        </div>
      </div>

      {/* Vertical Decorative Text */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 z-20 hidden lg:block">
        <div className="text-[11px] font-black text-white/10 uppercase tracking-[1.5em] vertical-text">
          EST. 2024 / PREMIUM SHOPPING / CURATED COLLECTIONS
        </div>
      </div>
    </div>
  );
};
