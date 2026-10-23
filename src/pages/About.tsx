import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Heart, Users, Globe, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  useSEO({
    title: "About AI Bazar - Pakistan's Most Affordable Online Store",
    description: "Learn about AI Bazar, Pakistan's trusted online store for 100% original electronics, beauty, kitchen & home products at the lowest prices with free express shipping nationwide.",
    keywords: "about aibazar, aibazar pakistan, online store pakistan, who is aibazar, aibazar pk about",
    canonical: "https://www.aibazar.pk/about"
  });
  const values = [
    { icon: Heart, title: "Customer First", description: "We put our customers at the heart of everything we do" },
    { icon: Users, title: "Quality Products", description: "Carefully curated selection of high-quality items" },
    { icon: Globe, title: "Sustainability", description: "Committed to eco-friendly practices and responsible sourcing" },
    { icon: Award, title: "Excellence", description: "Striving for excellence in service and product quality" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground pt-32 sm:pt-36 pb-20">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-bold mb-6">About AI Bazar</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Pakistan's practical online store for original products at honest prices — delivered to your door with Cash on Delivery
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                AI Bazar was built on a simple idea: everyday shopping in Pakistan should be easy, honest, and affordable. We bring a wide range of practical products together in one place so you can order from home and pay only when your parcel arrives.
              </p>
              <p>
                We carefully pick our selection across kitchen and home, electronics and gadgets, beauty, mother &amp; baby care, and more. Each item is chosen with real value in mind — original quality at a fair price, with nothing hidden.
              </p>
              <p>
                With Cash on Delivery, the option to open your parcel before you pay, and 1–3 day delivery across Pakistan, we're focused on making every order feel safe and worth it — the way local shopping should.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-muted">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* By the Numbers */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12 text-center">AI Bazar at a Glance</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">1,000s</p>
                <p className="text-muted-foreground">Products to Choose From</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">1–3 Days</p>
                <p className="text-muted-foreground">Delivery Nationwide</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">COD</p>
                <p className="text-muted-foreground">Pay on Delivery</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">7 Days</p>
                <p className="text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-8 opacity-90">Experience the AI Bazar difference today</p>
            <Link to="/" className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-lg font-semibold text-lg inline-block transition-colors">
              Start Shopping
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
