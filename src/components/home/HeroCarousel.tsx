import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const slides = [
  {
    id: 1,
    title: "New Season",
    highlight: "Arrivals",
    subtitle: "Discover the latest trends in fashion and lifestyle. Curated collections for the modern you.",
    cta: "Shop Now",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=1080&fit=crop&q=90",
    tag: "Spring 2025",
    color: "primary"
  },
  {
    id: 2,
    title: "Premium",
    highlight: "Kitchen",
    subtitle: "Elevate your culinary experience with our professional-grade kitchen essentials.",
    cta: "Explore",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=1080&fit=crop&q=90",
    tag: "Chef's Choice",
    color: "secondary"
  },
  {
    id: 3,
    title: "Work",
    highlight: "From Home",
    subtitle: "Create your perfect workspace with minimalist designs that inspire productivity.",
    cta: "Discover",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop&q=90",
    tag: "Workspace",
    color: "accent"
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

  const springConfig = { damping: 40, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

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
        return prev + 1.25;
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
      className="relative w-full min-h-[calc(100vh-120px)] overflow-hidden bg-foreground"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Parallax Image */}
          <motion.div
            className="absolute inset-0 scale-105"
            style={{ x: translateX, y: translateY }}
          >
            <motion.img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "linear" }}
            />
          </motion.div>

          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/20" />

          {/* Content */}
          <div className="container-custom relative h-full flex items-center z-20 pt-20">
            <div className="max-w-2xl">
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground text-xs font-bold uppercase tracking-widest mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {slides[currentSlide].tag}
                </span>
              </motion.div>

              {/* Title */}
              <div className="overflow-hidden mb-6">
                <motion.h1
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary-foreground leading-[0.9]"
                >
                  {slides[currentSlide].title}
                  <br />
                  <span className="text-primary">{slides[currentSlide].highlight}</span>
                </motion.h1>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-base md:text-lg text-primary-foreground/70 font-medium max-w-md leading-relaxed mb-8"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold group shadow-xl shadow-primary/25"
                >
                  <Link to="/category/all" className="flex items-center gap-3">
                    {slides[currentSlide].cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 rounded-full bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
                >
                  View Lookbook
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="container-custom">
          <div className="flex items-center justify-between py-6 border-t border-primary-foreground/10">
            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Indicators */}
            <div className="flex items-center gap-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="group flex flex-col items-center gap-2"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="w-12 md:w-20 h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ 
                        width: index === currentSlide ? `${progress}%` : index < currentSlide ? "100%" : "0%" 
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <span className={`text-xs font-bold transition-colors ${
                    index === currentSlide ? "text-primary-foreground" : "text-primary-foreground/40"
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-all"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
