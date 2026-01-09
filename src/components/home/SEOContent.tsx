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
        </motion.div>
      </div>
    </section>
  );
};
