import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const slides = [
  {
    id: 1,
    title: "Future of Style",
    subtitle: "Experience the next generation of apparel designed for the modern visionary.",
    cta: "Explore Collection",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=1080&fit=crop&q=90",
    tag: "A/W 2025",
    accent: "from-primary/40 via-primary/20"
  },
  {
    id: 2,
    title: "Culinary Mastery",
    subtitle: "Professional-grade tools for the home chef. Transform your kitchen into a studio.",
    cta: "Shop Essentials",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=1080&fit=crop&q=90",
    tag: "Kitchen Pro",
    accent: "from-secondary/40 via-secondary/20"
  },
  {
    id: 3,
    title: "Focused Mindset",
    subtitle: "Curated desk essentials to elevate your productivity. Minimalist design for impact.",
    cta: "Optimize Space",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop&q=90",
    tag: "Workspace",
    accent: "from-accent/40 via-accent/20"
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const translateX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-30, 30]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);

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
  };

  // Progress and auto-play logic
  useEffect(() => {
    if (isPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((current) => (current + 1) % slides.length);
          return 0;
        }
        return prev + 1.25; // 8 seconds total (100 / 1.25 = 80 intervals * 100ms)
      });
    }, 100);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPaused, currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };
  
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] md:h-[800px] lg:h-[90vh] max-h-[900px] overflow-hidden bg-foreground group/hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Parallax Image Container */}
          <motion.div
            className="absolute inset-0 scale-110"
            style={{ x: translateX, y: translateY }}
          >
            <motion.img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 12, ease: "linear" }}
            />
          </motion.div>

          {/* Premium Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-foreground/40 z-10" />
          
          {/* Animated Accent Orb */}
          <motion.div
            className={`absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-radial ${slides[currentSlide].accent} to-transparent blur-[120px] rounded-full pointer-events-none z-0`}
            style={{ 
              x: useTransform(smoothX, [-0.5, 0.5], [100, -100]), 
              y: useTransform(smoothY, [-0.5, 0.5], [100, -100]) 
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content Container */}
          <div className="container-custom relative h-full flex items-center z-20">
            <motion.div
              style={{ rotateX, rotateY }}
              className="max-w-3xl xl:max-w-4xl"
            >
              {/* Tag Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 text-primary-foreground text-xs font-bold uppercase tracking-[0.25em]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {slides[currentSlide].tag}
                </span>
              </motion.div>

              {/* Main Title */}
              <div className="overflow-hidden mb-8">
                <motion.h1
                  initial={{ y: 120, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-[-0.04em] text-primary-foreground"
                >
                  {slides[currentSlide].title.split(' ').map((word, i) => (
                    <span key={i} className="inline-block">
                      {word}
                      {i < slides[currentSlide].title.split(' ').length - 1 && (
                        <span className="inline-block w-4 md:w-6" />
                      )}
                    </span>
                  ))}
                </motion.h1>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base md:text-lg lg:text-xl text-primary-foreground/60 font-medium max-w-lg leading-relaxed mb-10"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Button
                  size="lg"
                  asChild
                  className="h-14 md:h-16 px-8 md:px-12 rounded-full btn-premium text-primary-foreground text-sm md:text-base font-bold group/btn shadow-xl shadow-primary/30 border-none"
                >
                  <Link to="/category/all" className="flex items-center gap-3">
                    {slides[currentSlide].cta}
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="h-14 md:h-16 px-8 rounded-full bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10 text-sm md:text-base font-semibold transition-all"
                >
                  Watch Story
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="container-custom">
          <div className="flex items-center justify-between py-8 border-t border-primary-foreground/10">
            {/* Navigation Arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 group/nav"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 group-hover/nav:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 group/nav"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 group-hover/nav:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Slide Progress Indicators */}
            <div className="flex items-center gap-6">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className="group relative flex flex-col items-start gap-3"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {/* Progress bar */}
                  <div className="w-16 md:w-24 h-0.5 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: index === currentSlide ? `${progress}%` : index < currentSlide ? "100%" : "0%" 
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  {/* Slide number */}
                  <span className={`text-xs font-bold transition-colors ${
                    index === currentSlide ? "text-primary-foreground" : "text-primary-foreground/40"
                  }`}>
                    0{index + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* Play/Pause Control */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Side Indicator */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 z-20 hidden xl:flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary-foreground/30 to-transparent" />
        <span className="text-primary-foreground/60 text-xs font-bold tracking-widest rotate-90 origin-center whitespace-nowrap">
          SCROLL
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary-foreground/30 to-transparent" />
      </div>
    </div>
  );
};
