import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-muted mt-16 border-t border-border">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Shop by Category */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop by Category</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/household" className="hover:text-primary transition-colors">Household</Link></li>
              <li><Link to="/category/kitchen" className="hover:text-primary transition-colors">Kitchen</Link></li>
              <li><Link to="/category/stationery" className="hover:text-primary transition-colors">Stationery</Link></li>
              <li><Link to="/category/toys" className="hover:text-primary transition-colors">Toys</Link></li>
              <li><Link to="/category/mobile" className="hover:text-primary transition-colors">Mobile Accessories</Link></li>
              <li><Link to="/category/beauty" className="hover:text-primary transition-colors">Beauty</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/track-order" className="hover:text-primary transition-colors">Track Your Order</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link to="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Connected</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to get special offers and updates</p>
            <div className="flex gap-2 mb-4">
              <Input
                type="email"
                placeholder="Your email"
                className="h-10"
              />
              <Button size="icon" className="bg-secondary hover:bg-secondary-hover h-10 w-10">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="h-9 w-9">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 ShopHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <img src="https://placehold.co/60x30/e2e8f0/64748b?text=Visa" alt="Visa" className="h-6" />
            <img src="https://placehold.co/60x30/e2e8f0/64748b?text=MC" alt="Mastercard" className="h-6" />
            <img src="https://placehold.co/60x30/e2e8f0/64748b?text=Amex" alt="American Express" className="h-6" />
            <img src="https://placehold.co/60x30/e2e8f0/64748b?text=PayPal" alt="PayPal" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};
