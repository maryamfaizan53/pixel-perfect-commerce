import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { staggerContainer, staggerItem, inView, hoverLift, reduceMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

/** Bundled art for the main categories (png + webp sibling in /public). */
const LOCAL_ART: Record<string, string> = {
  kitchen: "/kitchen",
  "home-living": "/home-living",
  "health-wellness": "/health-beauty",
  beauty: "/health-beauty",
  household: "/household",
};

const GRADIENTS = [
  "from-amber-500/25 to-secondary",
  "from-emerald-500/20 to-secondary",
  "from-sky-500/20 to-secondary",
  "from-rose-500/20 to-secondary",
  "from-violet-500/20 to-secondary",
];

interface CategoryCardsProps {
  categories: Category[];
  limit?: number;
  className?: string;
}

export const CategoryCards = ({ categories, limit, className }: CategoryCardsProps) => {
  const reduce = reduceMotion();
  const list = limit ? categories.slice(0, limit) : categories;

  return (
    <motion.div
      className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5", className)}
      variants={staggerContainer}
      initial={reduce ? undefined : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={inView}
    >
      {list.map((c, i) => {
        const art = LOCAL_ART[c.slug];
        const img = art ? `${art}.png` : c.image?.url;
        const webp = art ? `${art}.webp` : undefined;
        return (
          <motion.div key={c.id} variants={staggerItem} whileHover={reduce ? undefined : hoverLift}>
            <Link
              to={`/category/${c.slug}`}
              className="group relative block aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-secondary shadow-soft hover:shadow-card-hover transition-shadow"
            >
              {img ? (
                <OptimizedImage
                  src={img}
                  webpSrc={webp}
                  alt={c.title}
                  width={480}
                  quality={72}
                  sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 22vw"
                  priority={i < 2}
                  containerClassName="absolute inset-0"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className={cn("absolute inset-0 bg-gradient-to-br", GRADIENTS[i % GRADIENTS.length])} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">{c.title}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                  Shop
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
