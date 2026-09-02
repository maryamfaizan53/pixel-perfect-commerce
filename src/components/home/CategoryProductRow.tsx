import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getCategory } from "@/lib/api";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

interface CategoryProductRowProps {
  title: string;
  handle: string;
  description?: string;
  forceLoad?: boolean;
}

export const CategoryProductRow = ({ title, handle, description, forceLoad = false }: CategoryProductRowProps) => {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "400px 0px" });

  useEffect(() => {
    if (!inView && !forceLoad) return;
    let cancelled = false;
    getCategory(handle, 12)
      .then((data) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch((e) => console.error(`row ${handle}:`, e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handle, inView, forceLoad]);

  if (loading) {
    return (
      <section ref={ref} className="py-12 bg-background">
        <div className="container-custom">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="py-12 bg-background">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h2>
            <p className="text-muted-foreground text-sm font-medium">
              {description || `Explore our ${title.toLowerCase()} collection`}
            </p>
          </div>
          <Link to={`/category/${handle}`}>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10 font-bold uppercase text-xs tracking-widest"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 12).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.05 }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
