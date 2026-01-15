import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin, ShoppingBag, CreditCard, Truck, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Trust Badges Section */}
      <div className="border-b border-white/10">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-white">Free Shipping</p>
                <p className="text-xs text-secondary-foreground/60 leading-tight">On orders above PKR 5,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-white">Secure Payment</p>
                <p className="text-xs text-secondary-foreground/60 leading-tight">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-white">Easy Returns</p>
                <p className="text-xs text-secondary-foreground/60 leading-tight">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-white">24/7 Support</p>
                <p className="text-xs text-secondary-foreground/60 leading-tight">WhatsApp available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  AI <span className="text-primary">Bazar</span>
                </span>
              </div>
            </Link>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed max-w-sm">
              Your trusted destination for premium products at the best prices. Quality guaranteed with fast delivery across Pakistan.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+923328222026" className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +92 332 8222026
              </a>
              <a href="mailto:aibazarad@gmail.com" className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                aibazarad@gmail.com
              </a>
              <a href="https://www.aibazar.pk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                www.aibazar.pk
              </a>
              <div className="flex items-start gap-3 text-sm text-secondary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Pakistan</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {['All Products', 'New Arrivals', 'Best Sellers', 'On Sale'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/category/all`}
                    className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-white mb-4">Help</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/track-order" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-sm text-secondary-foreground/70 mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-primary flex-1"
              />
              <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                Subscribe
              </Button>
            </div>

            {/* Payment Methods */}
            <div className="mt-8">
              <p className="text-xs text-secondary-foreground/50 mb-3">Accepted Payments</p>
              <div className="flex items-center gap-4 text-xs font-medium text-secondary-foreground/60">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>JazzCash</span>
                <span>EasyPaisa</span>
                <span>COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-secondary-foreground/50">
              © {currentYear} AI Bazar. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-secondary-foreground/50">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};