import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/lib/api";
import type { ProductCard as ProductCardType } from "@/types/catalog";

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts(0, 12)
      .then((data) => setProducts(data.items))
      .catch((error) => console.error("Failed to fetch products:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-14 sm:py-20 bg-muted/40">
        <div className="container-custom">
          <Skeleton className="h-9 w-56 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
    <section className="py-14 sm:py-20 bg-muted/40">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Our collection"
          title="Featured products"
          subtitle="Our most popular picks, handpicked for quality and value."
          viewAllHref="/category"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 12).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="pill" className="shadow-gold">
            <Link to="/category">
              Browse all products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
