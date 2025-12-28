import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/home/CategorySection";
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

        {/* Features Section - Expert Grid */}
        <section className="py-40 relative">
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="group relative"
                >
                  <div className="premium-card p-14 flex flex-col items-center text-center h-full glass-noise border-slate-100 hover:border-primary/30 transition-all duration-700 hover:shadow-gold rounded-[2.5rem]">
                    <div className={`p-8 rounded-[2.5rem] ${item.color} mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl`}>
                      <item.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black mb-6 tracking-tight font-playfair italic">{item.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed opacity-80">{item.desc}</p>

                    {/* Hover Indicator */}
                    <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="w-16 h-0.5 bg-primary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Subtle Background Text */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[15vw] font-black text-slate-50/50 select-none pointer-events-none tracking-tighter -z-10 whitespace-nowrap">
            EXCELLENCE • PRECISION • LUXURY
          </div>
        </section>

        {/* Categories Grid - High Fidelity */}
        <CategoryGrid />

        {/* Dynamic Collection Sections */}
        <CategorySection
          handle="kitchen"
          title="Culinary"
          subtitle="Transform your workspace with artisan kitchen instruments designed for the modern gastronome."
        />

        <CategorySection
          handle="hair"
          title="Haircare"
          subtitle="Professional-grade hair solutions that combine scientific precision with pure luxury."
          reverse
        />

        {/* Featured Products - Curation */}
        <FeaturedProducts />

        {/* Brands Section - Cinematic Reveal */}
        <section className="py-32 bg-slate-900 overflow-hidden relative">
          <div className="container-custom relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-20"
            >
              Curated by Global Standards
            </motion.p>
            <div className="flex flex-wrap justify-center items-center gap-20 md:gap-32">
              {brands.map((brand, i) => (
                <motion.img
                  key={i}
                  initial={{ opacity: 0, filter: "grayscale(1) brightness(0.5)" }}
                  whileInView={{ opacity: 0.4, filter: "grayscale(1) brightness(1)" }}
                  whileHover={{ opacity: 1, filter: "grayscale(0) brightness(1)", scale: 1.1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  src={brand}
                  alt="Partner Logo"
                  className="h-8 md:h-12 object-contain cursor-pointer transition-all duration-500"
                />
              ))}
            </div>
          </div>

          {/* Background Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
        </section>

        {/* Newsletter / CTA Section - Masterpiece */}
        <section className="py-40 relative overflow-hidden bg-white">
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto glass-noise glass rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden group border-slate-100"
            >
              {/* Animated Inner Glow */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors duration-1000" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-secondary text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-gold border border-primary/20">
                  <Mail className="w-4 h-4" />
                  Privilege Access
                </div>
                <h2 className="text-6xl md:text-9xl font-black mb-14 leading-[0.8] tracking-tighter font-playfair italic">
                  Define Your <br />
                  <span className="text-primary not-italic font-sans uppercase text-[0.4em] tracking-[0.2em] block mt-8">Signature Authority</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-500 mb-20 max-w-4xl mx-auto font-medium leading-relaxed italic opacity-70">
                  "Join the inner circle for early access to artisan prototypes, bespoke rewards, and private boutique galleries."
                </p>

                <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email identity"
                    className="flex-1 h-20 px-10 rounded-[2rem] bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg"
                  />
                  <Button className="h-20 px-12 rounded-[2rem] btn-premium text-white font-black uppercase tracking-widest text-sm group">
                    Initialize
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </div>
                <p className="mt-10 text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-50">
                  High-Security Encryption • One-Click Unsubscribe
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
