import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const slides = [
  {
    id: 1,
    title: "Summer Sale Extravaganza",
    subtitle: "Up to 50% off on selected items. Elevate your summer style with our curated essentials.",
    cta: "Shop the Collection",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=800&fit=crop",
    tag: "Exclusive Offer",
    color: "from-rose-500/20"
  },
  {
    id: 2,
    title: "The Visionary Kitchen",
    subtitle: "Discover professional-grade cookware and appliances designed for the modern chef.",
    cta: "Explore Innovation",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=800&fit=crop",
    tag: "New Arrival",
    color: "from-emerald-500/20"
  },
  {
    id: 3,
    title: "Academic Excellence",
    subtitle: "Premium tools and stationery for those who prioritize organization and success.",
    cta: "Prepare for Success",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=800&fit=crop",
    tag: "Student Essentials",
    color: "from-blue-500/20"
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, currentSlide]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 8000);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  return (
    <div
      className="relative w-full h-[600px] md:h-[700px] overflow-hidden rounded-[40px] shadow-3xl bg-slate-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {/* Image with subtle parallax zoom */}
          <div className={`absolute inset-0 transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? "scale-110" : "scale-100"}`}>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Advanced Overlays */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-slate-900/60 to-transparent`} />
          <div className="absolute inset-0 bg-slate-900/20" />

          <div className="container-custom relative h-full flex items-center z-20">
            <div className={`max-w-3xl text-white transition-all duration-1000 delay-300 ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  {slide.tag}
                </div>
              </div>

              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                {slide.title.split(' ').map((word, i) => (
                  <span key={i} className="inline-block mr-4">{word}</span>
                ))}
              </h2>

              <p className="text-lg md:text-2xl mb-12 text-slate-200 font-medium max-w-xl leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Button
                  size="lg"
                  asChild
                  className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary-hover text-white text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  <Link to="/category/all">
                    {slide.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="h-16 px-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 text-lg font-bold"
                >
                  Visual Tour
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Premium Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30">
        <button
          onClick={handlePrev}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-primary transition-all group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative px-2 py-4"
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? "w-12 bg-primary" : "w-4 bg-white/30 group-hover:bg-white/60"
                }`} />
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-primary transition-all group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Decorative Light Leak */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none z-10" />
    </div>
  );
};
