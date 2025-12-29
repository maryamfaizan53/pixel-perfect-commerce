import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/home/CategorySection";
import { Truck, Shield, HeadphonesIcon, Zap, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Truck,
    title: "Global Shipping",
    desc: "Free on orders over $50",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    icon: Shield,
    title: "Secure Checkout",
    desc: "100% encrypted payments",
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "2-day delivery guaranteed",
    color: "bg-orange-500/10 text-orange-500"
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Support",
    desc: "24/7 dedicated assistance",
    color: "bg-purple-500/10 text-purple-500"
  }
];

const brands = [
  "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=200&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=200&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=200&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=200&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=200&h=100&fit=crop&q=80"
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-primary/20">
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section - High Impact Entrance */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="container-custom py-12"
        >
          <HeroCarousel />
        </motion.section>

        {/* Categories Grid - High Fidelity */}
        <CategoryGrid />

        {/* Featured Products - All Products Showcase */}
        <FeaturedProducts />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
