import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Sparkles, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    title: "Artisan",
    highlight: "Heritage",
    subtitle: "Experience the pinnacle of craftsmanship with our limited edition heritage collection.",
    cta: "Explore Heritage",
    color: "from-blue-900/40 to-slate-900/60"
  },
  {
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=2070&auto=format&fit=crop",
    title: "Modern",
    highlight: "Elegance",
    subtitle: "The intersection of future technology and timeless luxury aesthetics.",
    cta: "View Collection",
    color: "from-purple-900/40 to-slate-900/60"
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop",
    title: "Curated",
    highlight: "Selection",
    subtitle: "A hand-picked vault of architectural pieces for the discerning collector.",
    cta: "Acquire Now",
    color: "from-emerald-900/40 to-slate-900/60"
  }
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentSlide]);

  const handleNext = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setProgress(0);
    setCurrentSlide(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      className="relative h-[600px] md:h-[800px] w-full overflow-hidden rounded-[3rem] shadow-premium group/box"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />

          {/* Parallax Image with Ultra-Smooth Ken Burns Effect */}
          <motion.div
            className="absolute inset-0 scale-110"
            style={{ x: translateX, y: translateY }}
          >
            <motion.img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.3, rotate: -2 }}
              animate={{ scale: 1.1, rotate: 0 }}
              transition={{ duration: 20, ease: "linear" }}
            />
          </motion.div>

          {/* Content Wrapper */}
          <div className="relative z-20 h-full container-custom flex flex-col justify-center">
            <div className="max-w-4xl space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-[1px] bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
                  Limited Edition Vault
                </span>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </motion.div>

              {/* Title - Editorial Style */}
              <div className="overflow-hidden mb-8 perspective-1000">
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.0]"
                >
                {slides[currentSlide].title}
                <br />
                <motion.span
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  className="text-primary uppercase text-[0.5em] tracking-[0.2em] block mt-4"
                >
                  {slides[currentSlide].highlight}
                </motion.span>
              </motion.h1>
            </div>

            className="text-lg md:text-xl text-white/70 font-medium max-w-xl leading-relaxed"
              >
            {slides[currentSlide].subtitle}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Button
              size="lg"
              asChild
              className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-[0.2em] group shadow-gold transition-all duration-500"
            >
              <Link to="/category/all" className="flex items-center gap-4">
                {slides[currentSlide].cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-16 px-10 rounded-2xl bg-transparent border-white/20 text-white hover:bg-white hover:text-secondary font-black uppercase tracking-[0.2em] transition-all duration-500"
            >
              View Lookbook
            </Button>
          </motion.div>
        </div>
    </div>
        </motion.div >
      </AnimatePresence >

  {/* Bottom Controls */ }
  < div className = "absolute bottom-0 left-0 right-0 z-30" >
    <div className="container-custom">
      <div className="flex items-center justify-between py-10 border-t border-white/10 backdrop-blur-md bg-white/5 rounded-t-3xl px-12">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:border-primary transition-all duration-500"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:border-primary transition-all duration-500"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center gap-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group flex flex-col items-center gap-2"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className="w-16 md:w-24 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{
                    width: index === currentSlide ? `${progress}%` : index < currentSlide ? "100%" : "0%"
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-500 mt-2 ${index === currentSlide ? "text-primary scale-110" : "text-white/30"
                }`}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-secondary transition-all duration-500"
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
        </button>
      </div>
    </div>
      </div >

  {/* Interactive Cursor Indicator for Hero */ }
  < div className = "absolute top-1/2 right-12 -translate-y-1/2 z-30 flex flex-col items-center gap-4 opacity-0 group-hover/box:opacity-100 transition-opacity duration-1000 hidden xl:flex" >
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary to-transparent" />
        <MousePointer2 className="w-4 h-4 text-primary animate-bounce" />
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-primary rotate-90 mt-8 whitespace-nowrap">Parallax Enabled</span>
      </div >
    </div >
  );
};
