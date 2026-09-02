import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { getCategories } from "@/lib/api";
import type { Category } from "@/types/catalog";

/** Curated bundled art for the main categories (png + webp sibling in /public). */
const LOCAL_ART: Record<string, string> = {
  kitchen: "/kitchen",
  "home-living": "/home-living",
  "health-wellness": "/health-beauty",
  beauty: "/health-beauty",
  household: "/household",
};

const artFor = (slug: string) => {
  const base = LOCAL_ART[slug];
  return base ? { src: `${base}.png`, webpSrc: `${base}.webp` } : null;
};

export const HeroCategories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const featured: Category[] = categories.filter((c) => c.featured).slice(0, 9);
  const show = featured.length ? featured : categories.slice(0, 9);

  if (isLoading) {
    return (
      <section className="pt-36 sm:pt-32 pb-12 bg-secondary">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[16/9] rounded-2xl md:rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-36 sm:pt-32 pb-12 overflow-hidden bg-secondary">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.2),transparent_70%)]" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" />
            Featured Collections
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Shop by <span className="text-primary">Category</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Discover our latest arrivals and premium collections across all categories.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 md:gap-6">
          {show.map((col, index) => {
            const art = artFor(col.slug);
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link to={`/category/${col.slug}`}>
                  <div className="relative aspect-[16/9] md:aspect-video rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 bg-slate-800">
                    <OptimizedImage
                      src={art?.src || col.image?.url || "/placeholder.svg"}
                      webpSrc={art?.webpSrc}
                      alt={col.title}
                      width={640}
                      quality={75}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={index < 2}
                      containerClassName="absolute inset-0"
                      className="group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 xs:p-4 sm:p-6 md:p-8">
                      <h3 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-1 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {col.title}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-[11px] sm:text-sm font-bold uppercase tracking-widest">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
