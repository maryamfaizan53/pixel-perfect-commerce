import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCategories } from "@/components/home/HeroCategories";
import { CategoryProductRow } from "@/components/home/CategoryProductRow";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SEOContent } from "@/components/home/SEOContent";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section - Display Categories */}
        <HeroCategories />

        {/* Global Stats or Promo bar can go here if needed, but following prompt exactly */}

        {/* Category specific sections */}
        <CategoryProductRow title="Household" handle="household" />

        <CategoryProductRow title="Home & Living" handle="home-living" />

        <CategoryProductRow title="Health & Beauty" handle="health-beauty" />

        <CategoryProductRow title="Hair Straightener" handle="hair-straightener" />

        <CategoryProductRow title="Kitchen" handle="kitchen" />

        <CategoryProductRow title="Toys" handle="toys" />

        {/* All Products Section */}
        <section className="bg-slate-50 pt-12 pb-20">
          <div className="container-custom">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">
                All Products
              </h2>
              <div className="w-24 h-1.5 bg-primary rounded-full mb-6" />
              <p className="text-slate-600 max-w-2xl font-medium">
                Browse our entire collection of premium products across all categories.
              </p>
            </div>
            <FeaturedProducts />
          </div>
        </section>
      </main>

      <Footer />

      {/* SEO Content Section */}
      <SEOContent />
    </div>
  );
};

export default Index;

