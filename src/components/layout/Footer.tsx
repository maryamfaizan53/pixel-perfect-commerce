import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, ChevronUp, ShoppingCart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 pt-32 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white leading-none">
                  PIXEL<span className="text-primary italic">PERFECT</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">EMPORIUM</span>
              </div>
            </Link>
            <p className="text-white/40 font-medium leading-relaxed max-w-sm">
              The pinnacle of digital commerce, where artisan craftsmanship meets unprecedented technology. Curated for the global elite.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <Button key={i} size="icon" variant="ghost" className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-white hover:text-slate-950 hover:-translate-y-1 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Catalog</h3>
            <ul className="space-y-4">
              {['Household', 'Kitchen', 'Stationery', 'Toys', 'Mobile', 'Beauty'].map((item) => (
                <li key={item}>
                  <Link to={`/category/${item.toLowerCase()}`} className="text-sm font-bold text-white/40 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Concierge</h3>
            <ul className="space-y-4">
              {['Help Center', 'Track Order', 'Returns', 'Shipping', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-white/40 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 glass-noise">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Nexus Updates</h3>
              <p className="text-sm font-medium text-white/60 mb-8 leading-relaxed">
                Join our private newsletter for early prototype access and bespoke offers.
              </p>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Identity@Nexus"
                  className="h-14 rounded-xl bg-white/5 border-white/5 text-white focus:ring-primary/20 placeholder:text-white/20"
                />
                <Button size="icon" className="h-14 w-14 rounded-xl btn-premium text-white flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              © 2024 PIXEL PERFECT • ALL RIGHTS RESERVED
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>

          <div className="flex items-center gap-12 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <ShieldCheck className="w-8 h-8 text-white" />
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>PayPal</span>
              <span>Stripe</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-500"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};
