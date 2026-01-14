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

      {/* SEO Text Section - Same as Homepage */}
      <div className="bg-white text-black border-t border-gray-200">
        <div className="container-custom py-12 md:py-16 lg:py-20">
          {/* Main Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center">
            Online shopping in Pakistan's no.1 Fashion E-commerce Marketplace
          </h2>

          {/* Intro Paragraphs - 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <p className="text-sm md:text-base text-black/80 leading-relaxed">
              aibazar.pk is a fusion of fashion and make online shopping in Pakistan convenient for its customer services cash on delivery. Enrich online shopping experience by navigating through large variety of high-quality fashion products covering a number of categories. Our fashion merchandise features all the local top class brands displaying their unique designs. We provide an excellent online shopping atmosphere for all ages and genders with complete customer satisfaction. We feel pride in being the only website that offers every kind of eastern and western wear.
            </p>
            <p className="text-sm md:text-base text-black/80 leading-relaxed">
              The beauty of shipping at aibazar.pk is that you can purchase kid's variety, men's wear, and women fashion all under one roof. Our make-up and grooming section promises to deliver high-quality fashion products for every occasion. Choose from our selection of fragrances to surprise your special ones. So pick from our variety of online products from the comfort of your home. We offer the most competitive prices of all the brands with amazing sales and discounts.
            </p>
          </div>

          <p className="text-sm md:text-base text-black/80 leading-relaxed mb-10 text-center max-w-4xl mx-auto">
            And above all, we deliver what you see. So indulge in a hassle-free online experience at Pakistan's top fashion clothing marketplace that is ready to take you by storm.
          </p>

          {/* Fashion Categories - 3 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Kids Fashion */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">👶</span>
                Kids Fashion
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Are you tired of dragging all the stuff with your children in the shopping malls? We know the struggle is real but you can sit at home and just browse through a variety of our kid's clothes. No matter if you are a stay-at-home mom or a working lady, we are a one-stop online shopping for girls solution offering a wide variety of kids dresses, girls dresses, frock design, party dresses for girls. You can shop through separate sections for boys and girls that include gender-specific dresses. We offer dresses for every occasion including boys ethnic wear kurta pajama and girls ethnic wear. Shop through our section of kid's accessories including socks, belts, bags, toys, shoes for girls, shoes for boys and a lot more.
              </p>
            </div>

            {/* Women's Fashion */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">👗</span>
                Women's Fashion
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                We at aibazar.pk have provided a platform where women satisfy their desire to buy and wear the latest women collection. You will find a variety of women dresses for every occasion. Satiate your desire for wedding season with our designer women bridal dresses and pakistani wedding dresses like lehenga, gharara, hand work sharara. Our casual wear includes women tops, t-shirts, and kurtas. raw silk and net dupattas. Shop around our large variety of branded women unstitched lawn, party dresses perfect for the summers. Stay trendy and look marvelous with women makeup and quality women cosmetics. We care about your unspoken needs and offer a complete women undergarments, nighty, bra, bikini, shoes for women and accessories.
              </p>
            </div>

            {/* Men's Fashion */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">👔</span>
                Men's Fashion
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                If you are ready to make a fashion statement then aibazar.pk is the platform to lift your spirits. Beat the scorching summer heat with men's t-shirt and summer collection. Look cool with our bandana, caps and men's shorts. Casual is just one side of men, we take care of your formal attire through suits, tux.
              </p>
            </div>
          </div>

          {/* Keywords Section - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-200 pt-10">
            {/* Men's Keywords */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-4 border-l-4 border-blue-500 pl-4">
                Men's Fashion Categories
              </h4>
              <p className="text-xs text-black/50 leading-relaxed columns-2 gap-4">
                Mens Clothing, Formal Dresses, Shirts for Men, J sale, uniworth, 3 Piece Suit, charcoal, limelight online, Tuxedo, Gul Ahmed Sale, Casual Dress for Men, bonanza sale, T Shirt, T Shirt for Men, ethnic by outfitters, Polo Shirts, charcoal clothing, Mens Sweatshirts, Vest, Tracksuit, limelight sale, Wedding Dress for Men, Sherwani, gul ahmed lawn, uniworth sale, Kurta Shalwar, Kurta Design for Men, J sale 2024, Winter Wear, Hoodies for Men, charcoal pakistan, Jackets for Men, High Neck Shirt, ethnic, Denim Jacket, limelight, Fleece Jacket, Mens Coat, ideas by gul ahmed, Long Coat Men, bonanza satrangi sale, Sweater, Sweatshirts for men, J Perfumes, Bottom, Pants, Mens Shorts, Denim Shorts, Jeans Pant, Chino Pants, Pajamas, Bermuda Shorts, Pants, Mens Dress Pants, Trousers, limelight sale 2024, Ethnic Wear, bonanza, gul ahmed, uniworth pakistan, charcoal sale, Shalwar Kameez Men, J Junaid jamshed, Kurta Shalwar, bonanza men, Kurta Design for Men, Waistcoat, Shoes For Men, Casual Shoes for Men, ethnic sale, bonanza satrangi sale 2024 with price, Flip Flops, School Shoes, bonanza perfumes, Focus Clothing
              </p>
            </div>

            {/* Women's Keywords */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-4 border-l-4 border-purple-500 pl-4">
                Women's Fashion Categories
              </h4>
              <p className="text-xs text-black/50 leading-relaxed columns-2 gap-4">
                Frock Design, Maxi Design, Pakistani Dresses, Blouse, T Shirt Design, J sale, bonanza sale, warda sale 2024, Ladies Shirt Design, kameez design, Gul Ahmed Sale, Khaadi, Jumpsuit, beechtree online, Kurti Design, ethnic by outfitters, Blazer, bonanza satrangi sale, limelight online, Pants, Beechtree, Trouser design, bareeze men, Jeans, Capri Design, Shalwar Designs, Bridal Dresses, Lehenga, Gown Style, khaadi online, Saree, bonanza, warda sale, gul ahmed lawn, kameez design, bareeze man, limelight sale, Sharara Design, Frock Style, Peplum Dress, Maxi Dresses, Gharara, Mehndi Dresses, J sale 2024, Hoodie, Jackets, bareeze sale, ideas by gul ahmed, Blazer, khaadi Sale, warda lawn, Coat, beechtree sale 2024, Long Coat, Sweatshirt, Undergaarments, Bra, Bareeze, Bikini, Sports Bra, limelight, Nighty Dress, ethnic, Shalwar Kameez, Kurta Design, J Perfumes, Capri Design, bareeze online, Pakistani Lawn Brands, Hijab Style, warda online, Shawl, Embroidery Designs, Cap, Watches for Girls, khaadi lawn, Ladies Shoes, bonanza satrangi sale 2024 with price, Heels, Sanadal, limelight sale 2024, Jewelry, beechtree unstitched, Best Foundation, Concealer, bareeze home, Highlighter, Blush On, Face Powder, Primer, BB Cream, Eye Makeup, Mascara, Eyeshadow Palette, bonanza perfumes, Fragrance, Best Perfume For Women, Hair Straightener, gul ahmed, Lipstick, Lip Gloss, ethnic sale, Khaadi, Sana Safinaz, Nishat Linen, J Junaid jamshed, Alkaram Studio, BeechTree, Agha Noor, Warda, LimeLight, Salitex, Mausummery, bareeze lawn, beechtree pret, Kapray, Tarzz, Ethnic by Outfitters, So Kamal, j., Bareeze, Chinyere, khaadi pret, warda, Gul Ahmed, Charizma, Sapphire, Ittehad Lawn, Sania Maskatiya, Bonanza Satrangi
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};