import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, PackageOpen, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { getProducts } from "@/lib/api";
import { EASE, reduceMotion, staggerContainer, staggerItem } from "@/lib/motion";

const CHIPS = [
  { icon: BadgeCheck, label: "Cash on Delivery" },
  { icon: PackageOpen, label: "Open before you pay" },
  { icon: Truck, label: "1–3 day delivery" },
];

export const HomeHero = () => {
  const reduce = reduceMotion();
  const { data } = useQuery({
    queryKey: ["home-hero-products"],
    queryFn: () => getProducts(0, 6),
    staleTime: 5 * 60_000,
  });

  const { scrollY } = useScroll();
  const yFar = useTransform(scrollY, [0, 500], [0, reduce ? 0 : -46]);
  const yNear = useTransform(scrollY, [0, 500], [0, reduce ? 0 : -18]);

  const shots = (data?.items ?? []).filter((p) => p.images[0]?.url).slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-secondary text-secondary-foreground pt-28 sm:pt-32 pb-16 sm:pb-20 lg:pb-24">
      {/* soft light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: "radial-gradient(55% 55% at 78% 28%, hsl(38 92% 50% / 0.14), transparent 70%)" }}
      />

      <div className="container-custom relative grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Copy */}
        <motion.div
          className="lg:col-span-7 space-y-6"
          variants={staggerContainer}
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <motion.span
            variants={staggerItem}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80"
          >
            Pakistan's practical online store
          </motion.span>

          <motion.h1
            variants={staggerItem}
            className="text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-[16ch]"
          >
            Everyday upgrades for your <span className="text-primary">home & kitchen</span>
          </motion.h1>

          <motion.p variants={staggerItem} className="text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">
            Handpicked kitchen tools, organizers, and lifestyle gadgets — original quality,
            fair prices, delivered across Pakistan with Cash on Delivery.
          </motion.p>

          <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild size="pill" className="shadow-gold">
              <Link to="/category">
                Shop all products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="pill" className="text-white hover:bg-white/10">
              <Link to="/track-order">Track your order</Link>
            </Button>
          </motion.div>

          <motion.ul variants={staggerItem} className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {CHIPS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Icon className="w-4 h-4 text-trust" />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Product collage */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="relative h-[420px]">
            {shots[0] && (
              <motion.div
                style={{ y: yFar }}
                className="absolute right-0 top-0 w-[62%] rounded-2xl overflow-hidden shadow-card-hover ring-1 ring-white/10 bg-white"
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              >
                <OptimizedImage src={shots[0].images[0].url} alt={shots[0].title} width={520} aspectRatio="square" priority />
              </motion.div>
            )}
            {shots[1] && (
              <motion.div
                style={{ y: yNear }}
                className="absolute left-0 top-24 w-[52%] rounded-2xl overflow-hidden shadow-card-hover ring-1 ring-white/10 bg-white"
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
              >
                <OptimizedImage src={shots[1].images[0].url} alt={shots[1].title} width={440} aspectRatio="square" />
              </motion.div>
            )}
            {shots[2] && (
              <motion.div
                style={{ y: yFar }}
                className="absolute left-[26%] bottom-0 w-[46%] rounded-2xl overflow-hidden shadow-card-hover ring-1 ring-white/10 bg-white"
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
              >
                <OptimizedImage src={shots[2].images[0].url} alt={shots[2].title} width={400} aspectRatio="square" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
