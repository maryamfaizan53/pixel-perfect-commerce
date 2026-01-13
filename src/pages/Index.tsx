import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BlogPreview } from "@/components/home/BlogPreview";
import { SEOContent } from "@/components/home/SEOContent";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="container-custom pt-6 pb-8 md:pt-8 md:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroCarousel />
          </motion.div>
        </section>

        {/* Categories Grid */}
        <CategoryGrid />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Blog Preview Section */}
        <BlogPreview />
      </main>

      <Footer />

      {/* SEO Content Section */}
      <SEOContent />
    </div>
  );
};

export default Index;
