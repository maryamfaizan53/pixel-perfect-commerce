import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { getCategory } from "@/lib/api";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { Skeleton } from "@/components/ui/skeleton";
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
      <section ref={ref} className="py-12 sm:py-14 bg-background">
        <div className="container-custom">
          <Skeleton className="h-9 w-56 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[14px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="py-12 sm:py-14 bg-background">
      <div className="container-custom">
        <SectionHeader
          title={title}
          subtitle={description || `Explore our ${title.toLowerCase()} collection`}
          viewAllHref={`/category/${handle}`}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 12).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
