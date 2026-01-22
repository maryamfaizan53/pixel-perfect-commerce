import { Header } from "@/components/layout/Header";
import { HeroCategories } from "@/components/home/HeroCategories";
import { CategoryProductRow } from "@/components/home/CategoryProductRow";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
const SEOContentLazy = lazy(() => import("@/components/home/SEOContent").then(m => ({ default: m.SEOContent })));
const FooterLazy = lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  const { data: collections = [] } = useQuery({
    queryKey: ['all-collections-rows'],
    queryFn: () => fetchCollections(8), // Fetch 8 categories for better balancing of speed and content
  });

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section - Display Categories */}
        <HeroCategories />

        {/* Dynamic Category sections */}
        <div className="space-y-4">
          {/* Featured Top Selling Section */}
          <CategoryProductRow
            title="TOP SELLING PRODUCTS"
            handle="top-selling"
          />

          {collections
            .filter(col => col.node.handle !== 'top-selling')
            .map((col) => (
              <CategoryProductRow
                key={col.node.id}
                title={col.node.title}
                handle={col.node.handle}
              />
            ))}
        </div>

        {/* All Products Section */}
        <section className="bg-slate-50 pt-12 pb-20">
          <div className="container-custom">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight uppercase mb-4">
                All Products
              </h2>
              <div className="w-24 h-1.5 bg-primary rounded-full mb-6" />
              <p className="text-slate-600 max-w-2xl font-medium">
                Browse our entire collection of affordable products at the lowest prices across all categories.
              </p>
            </div>
            <FeaturedProducts />
          </div>
        </section>
      </main>
      <Suspense fallback={null}>
        <SEOContentLazy />
        <FooterLazy />
      </Suspense>
    </div>
  );
};

export default Index;


