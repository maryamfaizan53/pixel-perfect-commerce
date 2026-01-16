import { motion } from "framer-motion";

export const SEOContent = () => {
  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center uppercase tracking-tight">
            Shop at the Lowest Prices in Pakistan - AI Bazar Marketplace
          </h2>

          {/* Intro Paragraphs - 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <p className="text-sm md:text-base text-black/80 leading-relaxed">
              aibazar.pk is your go-to destination for <strong>affordable online shopping in Pakistan</strong>. We combine smart technology with a massive variety of high-quality products to ensure you get the best value for your money. Our mission is to make fashion and household essentials accessible to everyone with <strong>lowest prices guaranteed</strong> and convenient cash on delivery services. We take pride in being Pakistan's most budget-friendly marketplace for all your needs.
            </p>
            <p className="text-sm md:text-base text-black/80 leading-relaxed">
              At aibazar.pk, we believe that style shouldn't break the bank. You can purchase kids' variety, men's wear, and women's fashion all under one roof at <strong>wholesale-inspired prices</strong>. Our grooming and beauty section offers premium quality at affordable rates, ensuring you look your best for every occasion. We constantly monitor market prices to provide the most competitive deals, amazing sales, and exclusive discounts for our valued customers.
            </p>
          </div>

          <p className="text-sm md:text-base text-black/80 leading-relaxed mb-10 text-center max-w-4xl mx-auto">
            Experience 100% satisfaction with <strong>affordable prices</strong> and high-quality products. Indulge in a hassle-free online experience at Pakistan's top marketplace for budget-conscious shoppers.
          </p>

          {/* Fashion Categories - 3 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Kids Fashion */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">👶</span>
                Affordable Kids Fashion
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Finding quality kids' clothes at affordable prices is no longer a challenge. aibazar.pk offers a wide collection of kids' dresses, frock designs, and party wear at the <strong>lowest prices in Pakistan</strong>. From ethnic kurta pajamas to casual everyday wear, we ensure your little ones look great without the high price tag. Shop our budget-friendly section for boys and girls and enjoy massive savings on toys and accessories.
              </p>
            </div>

            {/* Women's Fashion */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">👗</span>
                Low Price Women's Fashion
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Transform your wardrobe with the latest women's collection at highly <strong>affordable prices</strong>. We offer everything from designer bridal dresses and shararas to trendy casual tops and kurtas at costs that fit your budget. Stay stylish with high-quality cosmetics, unstitched lawn, and summer party dresses—all available at the most competitive prices online. We bring you the luxury look for less.
              </p>
            </div>

            {/* Men's Fashion */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">👔</span>
                Budget Men's Fashion
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Elevate your style with our <strong>affordable men's fashion</strong> selection. From sharp formal suits and tuxedos to casual t-shirts and summer collections, we provide the best quality at the <strong>lowest prices online</strong>. Whether you're looking for denim jackets, hoodies, or traditional shalwar kameez, AI Bazar ensures you get top-tier fashion without the premium price tag.
              </p>
            </div>
          </div>

          {/* Keywords Section - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-200 pt-10">
            {/* Men's Keywords */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-4 border-l-4 border-blue-500 pl-4">
                Shop Affordable Men's Categories
              </h4>
              <p className="text-xs text-black/50 leading-relaxed columns-2 gap-4">
                Mens Clothing, Low Price Formal Dresses, Affordable Shirts for Men, J sale, uniworth discount, Budget 3 Piece Suit, charcoal sale, limelight online offers, Tuxedo affordable, Gul Ahmed Sale, Casual Dress for Men, bonanza sale, T Shirt cheap, T Shirt for Men, ethnic by outfitters discount, Polo Shirts, charcoal clothing offers, Mens Sweatshirts affordable, Vest, Tracksuit lowest price, limelight sale, Wedding Dress for Men, Sherwani budget, gul ahmed lawn sale, uniworth sale, Kurta Shalwar, Kurta Design for Men, J sale 2024, Winter Wear affordable, Hoodies for Men, charcoal pakistan sale, Jackets for Men, High Neck Shirt, ethnic budget, Denim Jacket, limelight discount, Fleece Jacket, Mens Coat, ideas by gul ahmed sale, Long Coat Men, bonanza satrangi sale, Sweater affordable, Sweatshirts for men, J Perfumes, Bottom budget, Pants, Mens Shorts, Denim Shorts, Jeans Pant, Chino Pants, Pajamas, Bermuda Shorts, Pants, Mens Dress Pants, Trousers, limelight sale 2024, Ethnic Wear, bonanza, gul ahmed, uniworth pakistan, charcoal sale, Shalwar Kameez Men, J Junaid jamshed sale, Kurta Shalwar, bonanza men, Kurta Design for Men, Waistcoat, Shoes For Men, Casual Shoes for Men, ethnic sale, bonanza satrangi sale 2024 with price, Flip Flops, School Shoes, bonanza perfumes, Focus Clothing
              </p>
            </div>

            {/* Women's Keywords */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-4 border-l-4 border-purple-500 pl-4">
                Shop Affordable Women's Categories
              </h4>
              <p className="text-xs text-black/50 leading-relaxed columns-2 gap-4">
                Frock Design, Maxi Design, Pakistani Dresses affordable, Blouse budget, T Shirt Design, J sale, bonanza sale, warda sale 2024, Ladies Shirt Design, kameez design, Gul Ahmed Sale, Khaadi discount, Jumpsuit, beechtree online sale, Kurti Design, ethnic by outfitters, Blazer budget, bonanza satrangi sale, limelight online, Pants, Beechtree, Trouser design, bareeze men, Jeans, Capri Design, Shalwar Designs, Bridal Dresses affordable, Lehenga budget, Gown Style, khaadi online, Saree, bonanza, warda sale, gul ahmed lawn, kameez design, bareeze man, limelight sale, Sharara Design, Frock Style, Peplum Dress, Maxi Dresses, Gharara, Mehndi Dresses, J sale 2024, Hoodie, Jackets, bareeze sale, ideas by gul ahmed, Blazer, khaadi Sale, warda lawn, Coat, beechtree sale 2024, Long Coat, Sweatshirt, Undergaarments, Bra, Bareeze, Bikini, Sports Bra, limelight, Nighty Dress, ethnic, Shalwar Kameez, Kurta Design, J Perfumes, Capri Design, bareeze online, Pakistani Lawn Brands, Hijab Style, warda online, Shawl, Embroidery Designs, Cap, Watches for Girls, khaadi lawn, Ladies Shoes, bonanza satrangi sale 2024 with price, Heels, Sanadal, limelight sale 2024, Jewelry, beechtree unstitched, Best Foundation, Concealer, bareeze home, Highlighter, Blush On, Face Powder, Primer, BB Cream, Eye Makeup, Mascara, Eyeshadow Palette, bonanza perfumes, Fragrance, Best Perfume For Women, Hair Straightener, gul ahmed, Lipstick, Lip Gloss, ethnic sale, Khaadi, Sana Safinaz, Nishat Linen, J Junaid jamshed, Alkaram Studio, BeechTree, Agha Noor, Warda, LimeLight, Salitex, Mausummery, bareeze lawn, beechtree pret, Kapray, Tarzz, Ethnic by Outfitters, So Kamal, j., Bareeze, Chinyere, khaadi pret, warda, Gul Ahmed, Charizma, Sapphire, Ittehad Lawn, Sania Maskatiya, Bonanza Satrangi
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
