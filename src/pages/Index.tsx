import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingUp, Truck, Shield, HeadphonesIcon, Globe, Star, Zap, CreditCard, Mail, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container-custom py-12">
          <HeroCarousel />
        </section>

        {/* Features Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="premium-card p-10 flex flex-col items-center text-center group"
                >
                  <div className={`p-5 rounded-3xl ${item.color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <CategoryGrid />
        </motion.div>

        {/* Featured Products */}
        <section className="py-24">
          <FeaturedProducts />
        </section>

        {/* Brands Section */}
        <section className="py-24 bg-muted/30">
          <div className="container-custom">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-12">
              Trusted by world-class partners
            </p>
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {brands.map((brand, i) => (
                <img key={i} src={brand} alt="Partner Logo" className="h-8 md:h-12 object-contain" />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter / CTA Section */}
        <section className="py-32 relative overflow-hidden">
          {/* Animated Background Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />

          <div className="container-custom relative z-10">
            <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-24 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-8">
                  <Mail className="w-3.5 h-3.5" />
                  Join the Inner Circle
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter">
                  Unlock early access and <br />
                  <span className="text-primary text-glow">exclusive rewards.</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
                  Be the first to discover our latest collections and member-only events. Simple, elegant, and always personal.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 h-16 px-8 rounded-2xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  />
                  <Button className="h-16 px-10 rounded-2xl btn-premium text-white font-bold group">
                    Subscribe
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <p className="mt-8 text-[11px] text-muted-foreground font-medium italic">
                  * By subscribing, you agree to our Privacy Policy. Zero spam, just inspiration.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
