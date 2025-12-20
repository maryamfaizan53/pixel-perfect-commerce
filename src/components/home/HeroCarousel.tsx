import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
      className="relative w-full h-[650px] md:h-[800px] overflow-hidden rounded-[2.5rem] shadow-2xl bg-slate-900 group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Parallax Image */}
          <motion.img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ duration: 10, ease: "linear" }}
          />

          {/* Dynamic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Animated Accent Glow */}
          <motion.div
            className={`absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] opacity-20 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none ${slides[currentSlide].accent}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="container-custom relative h-full flex items-center z-20">
            <div className="max-w-4xl pt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="px-5 py-2 rounded-full glass border-white/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-white">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {slides[currentSlide].tag}
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-6xl md:text-8xl lg:text-[10rem] font-black mb-10 leading-[0.85] tracking-tighter text-white"
              >
                {slides[currentSlide].title.split(' ').map((word, i) => (
                  <span key={i} className="inline-block mr-6 last:mr-0 last:text-glow">
                    {word}
                  </span>
                ))}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-lg md:text-2xl mb-14 text-white/70 font-medium max-w-2xl leading-relaxed"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-8"
              >
                <Button
                  size="lg"
                  asChild
                  className="h-20 px-12 rounded-2xl btn-premium text-white text-xl font-bold group/btn shadow-2xl shadow-primary/40 border-none"
                >
                  <Link to="/category/all">
                    {slides[currentSlide].cta}
                    <ArrowRight className="w-6 h-6 ml-3 group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="h-20 px-10 rounded-2xl glass-dark border-white/10 text-white hover:bg-white/10 text-xl font-bold"
                >
                  Visual Tour
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Premium Controls */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-10 z-30">
        <button
          onClick={handlePrev}
          className="w-16 h-16 flex items-center justify-center rounded-2xl glass border-white/10 text-white hover:bg-primary transition-all duration-300 group/nav"
        >
          <ChevronLeft className="w-8 h-8 group-hover/nav:-translate-x-1 transition-transform" />
        </button>

        <div className="flex gap-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group relative h-12 flex items-center"
            >
              <div className={`h-1.5 rounded-full transition-all duration-700 ease-in-out ${index === currentSlide ? "w-16 bg-primary" : "w-6 bg-white/20 group-hover:bg-white/40"
                }`} />
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-16 h-16 flex items-center justify-center rounded-2xl glass border-white/10 text-white hover:bg-primary transition-all duration-300 group/nav"
        >
          <ChevronRight className="w-8 h-8 group-hover/nav:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Decorative Branding */}
      <div className="absolute top-16 right-16 z-20 hidden lg:block">
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[1em] vertical-text">
          EST. 2024 / PREMIUM SHOPPING
        </div>
      </div>
    </div>
  );
};

