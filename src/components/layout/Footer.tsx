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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free Shipping</p>
                <p className="text-xs text-secondary-foreground/60">On orders above PKR 5,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Secure Payment</p>
                <p className="text-xs text-secondary-foreground/60">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Easy Returns</p>
                <p className="text-xs text-secondary-foreground/60">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">24/7 Support</p>
                <p className="text-xs text-secondary-foreground/60">WhatsApp available</p>
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
              <a href="mailto:contact@aiagentixz.com" className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                contact@aiagentixz.com
              </a>
              <a href="https://www.aiagentixz.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                www.aiagentixz.com
              </a>
              <div className="flex items-start gap-3 text-sm text-secondary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Karachi, Pakistan</span>
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
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-sm text-secondary-foreground/70 mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-primary"
              />
              <Button className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                <ArrowRight className="w-4 h-4" />
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

      {/* SEO Text Section */}
      <div className="bg-white text-black border-t border-gray-200">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Your Premier Online Shopping Destination in Pakistan
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Welcome to <strong>AI Bazar</strong>, Pakistan's leading e-commerce platform offering an extensive collection of premium products at competitive prices.
                We pride ourselves on delivering exceptional quality, authentic products, and outstanding customer service to shoppers across Karachi, Lahore, Islamabad,
                and all major cities throughout Pakistan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Why Choose AI Bazar?</h3>
                <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Authentic Products:</strong> 100% genuine items with quality guarantee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Fast Delivery:</strong> Quick shipping across Pakistan with real-time tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Secure Payment:</strong> Multiple payment options including COD, JazzCash, EasyPaisa, and cards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>Easy Returns:</strong> Hassle-free 7-day return and exchange policy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span><strong>24/7 Support:</strong> Dedicated customer service via WhatsApp and phone</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Shop by Category</h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-3">
                  Explore our diverse range of products including electronics, fashion, home & kitchen, beauty & health, sports & fitness,
                  and much more. Whether you're looking for the latest gadgets, trendy apparel, home essentials, or lifestyle products,
                  AI Bazar has everything you need in one convenient location.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  Our curated collections feature top brands and best-selling items, carefully selected to meet the needs of Pakistani shoppers.
                  Enjoy exclusive deals, seasonal sales, and special promotions on your favorite products.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Nationwide Delivery Across Pakistan</h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                We deliver to all major cities and regions including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar,
                Quetta, Sialkot, Gujranwala, and beyond. Experience fast, reliable shipping with free delivery on orders above PKR 5,000.
                Track your order in real-time and receive updates at every step of the delivery process.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-xs md:text-sm text-center">
                <strong>Keywords:</strong> Online shopping Pakistan, e-commerce Pakistan, buy online, online store, shopping website,
                best prices Pakistan, authentic products, cash on delivery, COD Pakistan, free shipping, online marketplace,
                Karachi shopping, Lahore online store, Islamabad delivery, Pakistani e-commerce, trusted online shop
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};