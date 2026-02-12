import { motion } from "framer-motion";

export const SEOContent = () => {
  return (
    <section className="bg-white py-12 md:py-16 lg:py-20 border-t border-slate-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-16"
        >
          {/* Section 1: Online Shopping Store in Pakistan */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-black text-black mb-6 tracking-tight uppercase">
              Online Shopping Store in <span className="text-primary italic">Pakistan</span>
            </h1>
            <div className="space-y-6 text-black/70 leading-relaxed text-base md:text-lg text-justify">
              <p>
                Discover the ultimate destination for <strong className="text-black">online shopping in Pakistan</strong>. At <strong className="text-black">aibazar.pk</strong>, we bring you a meticulously curated selection of kitchen accessories, electronics, fashion, and baby care products. Our mission is to provide a reliable, hassle-free marketplace that combines convenience with a consumer-friendly purchase policy and 100% genuine quality.
              </p>
              <p>
                Whether you are looking for the latest gadgets or essential home appliances, our store offers competitive prices that are both economical and pocket-friendly. We prioritize customer satisfaction by ensuring every product meets our rigorous quality standards. Experience seamless shopping with <strong className="text-black">cash on delivery across Pakistan</strong> and enjoy the peace of mind that comes with shopping at your favorite trusted online store.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Section 2: Online Shopping in Pakistan Detail */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black uppercase tracking-tight">
                Experience Hassle-Free <span className="text-primary">Shopping</span>
              </h2>
              <p className="text-black/70 leading-relaxed">
                Experience hassle-free online shopping in Pakistan at aibazar.pk. Discover a wide range of products from electronics, fashion, home decor, beauty, and more, all available at your fingertips. With our user-friendly website and secure payment options, you can shop with confidence and convenience.
              </p>
              <p className="text-black/70 leading-relaxed">
                Browse through our extensive catalog, featuring top brands and exclusive deals, and enjoy doorstep delivery across the country. Whether you're searching for the latest gadgets, trendy clothing, or home essentials, AIBAZAR.PK has got you covered. Enjoy a seamless shopping experience and exceptional customer service. Start exploring and shop online with aibazar.pk today.
              </p>
            </div>

            {/* Section 3: Benefits */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-8">Benefits of Online Shopping With <span className="text-primary">aibazar.pk</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Convenience", desc: "Shop from anywhere, anytime, without leaving home." },
                  { title: "Wide range", desc: "Find almost anything from kitchen accessories to electronics and Women Fashion." },
                  { title: "Competitive pricing", desc: "Online retailers often offer better prices than brick-and-mortar stores." },
                  { title: "Easy returns", desc: "Hassle-free return policy, making it easy to return unsatisfied products." }
                ].map((benefit, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-bold text-black flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-black/60 leading-snug">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Best-Selling Products Categories */}
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-black uppercase mb-4">Best-Selling Products in Pakistan</h2>
              <p className="text-black/60 max-w-2xl mx-auto">When it comes to online shopping in Pakistan, aibazar.pk is one of the best online shopping websites, featuring an extensive variety of product categories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Mother Care",
                  icon: "👶",
                  content: "Explore our mother care section, where you will find everything for your little ones, including items like the Baby Head Shaping Pillow, Fruit Pacifier, Feeder, Baby Travel Carrier, and many more. Shop without any hassle."
                },
                {
                  title: "Home Decoration",
                  icon: "🏠",
                  content: "Decorate your Spaces with our very vast collection of home décor items. Whether you want to buy stylish wall clocks and lighting or want to buy kitchen accessories online, aibazar pk helps you with ease."
                },
                {
                  title: "Mobile Gadgets",
                  icon: "📱",
                  content: "Visit aibazar.pk for latest gadgets where we offer a seamless experience for all your needs. All mobile accessories, tech gadgets and tools and kits can be found in our gadget shop online category."
                },
                {
                  title: "Shopping Bags",
                  icon: "👜",
                  content: "We also offer a range of shopping bags to suit every style and need. From tote bags to functional travel bags, you'll find everything you need for your shopping experience, all available through aibazar.pk."
                },
                {
                  title: "Home Accessories",
                  icon: "🛋️",
                  content: "Are you in search of beautiful home accessories? Our platform provides a wide selection designed for beautifying homes, from small homeware to large homeware decorative items."
                },
                {
                  title: "Time Saving Shop",
                  icon: "⚡",
                  content: "At aibazar.pk, we strive to make shopping as convenient as possible. As your go-to online store in Pakistan, our platform makes sure you can shop anytime and anywhere for a seamless experience."
                }
              ].map((cat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl mb-4">{cat.icon}</div>
                  <h3 className="text-lg font-bold text-black mb-3">{cat.title}</h3>
                  <p className="text-sm text-black/70 leading-relaxed">{cat.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Final CTA and Summary */}
          <div className="bg-secondary/5 rounded-[2rem] p-8 md:p-12 text-center space-y-8">
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-2xl md:text-4xl font-black text-black uppercase">Start Your Online Shopping Journey Today!</h2>
              <p className="text-black/70 italic text-lg">
                "No matter what you're looking for, aibazar.pk offers a vast selection. We prioritize customer satisfaction above all else to ensure you have a great shopping experience every time."
              </p>
            </div>

            <div className="text-sm md:text-base text-black/60 max-w-4xl mx-auto leading-relaxed">
              <p>
                aibazar.pk Shop with us today and enjoy the joy of best online stores in Pakistan which puts you first. Great deals and discounts online are just a click away at aibazar.pk. With amazing discounts, fast delivery, and secure transactions, it's the perfect place for online shopping in Pakistan to save time while getting the best products.
              </p>
            </div>
          </div>

          {/* Section 6: Online Shopping Store In Pakistan (User Requested) */}
          <div className="pt-12 border-t border-slate-100 space-y-8">
            <div className="max-w-4xl mx-auto space-y-6 text-black/70 leading-relaxed text-base md:text-lg text-justify">
              <h2 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tight text-center mb-8">
                Online Shopping Store In <span className="text-primary">Pakistan</span>
              </h2>
              <p>
                <strong className="text-black">AIbazar pk</strong> is your one-stop solution when it comes to <strong className="text-black">Online Shopping in Pakistan</strong>. We strive to deliver the best home accessories and kitchen accessories in Pakistan. We provide a user-friendly platform where customers can easily search for a product and can place their orders without any hassle. Our accessories are scattered all over Pakistan including Karachi, Islamabad, Lahore, Gujranwala.
              </p>
              <p>
                Our user-friendly website will make it easier for you to shop online. All our accessories are divided into a group of categories to help you choose the right product. <strong className="text-black">aibazar pk</strong> is the best place to buy kitchen and home accessories. So, what are you waiting for, visit the incredible Online Shopping Store in Pakistan. You can easily buy our high-quality accessories with the ease of cash on delivery. We are 24/7 available for answering your queries all over Pakistan. For inquiry contact us now.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                Honorable Mentions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  "Home Accessories", "Kitchen Accessories", "Organizers", "Baby Products",
                  "Mobile Accessories", "Cleaning Products", "Personal Care", "Health & Beauty",
                  "Gadgets & Tech", "Household Essentials", "Sports & Fitness", "Toys & Games",
                  "Office Supplies", "Pet Care", "Outdoor & Garden", "Fashion & Apparel"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors cursor-default">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full"></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyword Cloud - Minimalist for Footer */}
          <div className="pt-8 border-t border-slate-100">
            <details className="cursor-pointer group">
              <summary className="text-xs font-bold text-black/40 uppercase tracking-widest list-none text-center group-hover:text-primary transition-colors">
                View Search Categories & Keywords [Click to Expand]
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h4 className="text-xs font-bold text-black mb-4 uppercase tracking-wider">Men's Categories</h4>
                  <p className="text-[10px] text-black/40 leading-relaxed columns-2 gap-4">
                    Mens Clothing, Low Price Formal Dresses, Affordable Shirts for Men, J sale, uniworth discount, Budget 3 Piece Suit, charcoal sale, limelight online offers, Tuxedo affordable, Gul Ahmed Sale, Casual Dress for Men, bonanza sale, T Shirt cheap, T Shirt for Men, ethnic by outfitters discount, Polo Shirts, charcoal clothing offers, Mens Sweatshirts affordable, Vest, Tracksuit lowest price, limelight sale, Wedding Dress for Men, Sherwani budget, Kurta Shalwar, Kurta Design for Men, J sale 2024, Winter Wear affordable, Hoodies for Men, charcoal pakistan sale, Jackets for Men, High Neck Shirt, Denim Jacket, Fleece Jacket, Mens Coat, ideas by gul ahmed sale, Long Coat Men, bonanza satrangi sale, Sweater affordable, J Perfumes, Pants, Mens Shorts, Denim Shorts, Jeans Pant, Chino Pants, Pajamas, Bermuda Shorts, Mens Dress Pants, Trousers, Ethnic Wear, bonanza, gul ahmed, uniworth pakistan, Shalwar Kameez Men, J Junaid jamshed sale, Kurta Shalwar, bonanza men, Kurta Design for Men, Waistcoat, Shoes For Men, Casual Shoes for Men, ethnic sale
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black mb-4 uppercase tracking-wider">Women's Categories</h4>
                  <p className="text-[10px] text-black/40 leading-relaxed columns-2 gap-4">
                    Frock Design, Maxi Design, Pakistani Dresses, Blouse budget, T Shirt Design, J sale, bonanza sale, warda sale 2024, Ladies Shirt Design, kameez design, Gul Ahmed Sale, Khaadi discount, Jumpsuit, beechtree online sale, Kurti Design, ethnic by outfitters, Blazer budget, bonanza satrangi sale, limelight online, Pants, Beechtree, Trouser design, Jeans, Capri Design, Shalwar Designs, Bridal Dresses, Lehenga budget, Gown Style, khaadi online, Saree, bonanza, warda sale, gul ahmed lawn, kameez design, limelight sale, Sharara Design, Frock Style, Peplum Dress, Maxi Dresses, Gharara, Mehndi Dresses, Hoodie, Jackets, bareeze sale, ideas by gul ahmed, Blazer, khaadi Sale, warda lawn, Coat, beechtree sale 2024, Sweatshirt, Undergaarments, Bra, Bareeze, Bikini, Sports Bra, limelight, Nighty Dress, ethnic, Shalwar Kameez, Kurta Design, J Perfumes, Pakistani Lawn Brands, Hijab Style, warda online, Shawl, Watches for Girls, khaadi lawn, Ladies Shoes, Heels, Jewelry, Best Foundation, Concealer, Highlighter, Blush On, Face Powder, Primer, BB Cream, Eye Makeup, Mascara, Eyeshadow Palette, bonanza perfumes, Fragrance, Hair Straightener, gul ahmed, Lipstick, Lip Gloss, ethnic sale, Khaadi, Sana Safinaz, Nishat Linen, Alkaram Studio, BeechTree, Agha Noor, Warda, LimeLight, Salitex, Mausummery, Tarzz, So Kamal, J., Chinyere, Sapphire, Ittehad Lawn, Sania Maskatiya, Bonanza Satrangi
                  </p>
                </div>
              </div>
            </details>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
