import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Heart, Users, Globe, Award } from "lucide-react";

const About = () => {
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
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-bold mb-6">About ShopHub</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Your trusted online shopping destination for quality products across multiple categories
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2020, ShopHub began with a simple mission: to make online shopping easy, enjoyable, and accessible to everyone. What started as a small family business has grown into a thriving e-commerce platform serving customers nationwide.
              </p>
              <p>
                We carefully curate our product selection across household items, kitchen essentials, stationery, toys, mobile accessories, and beauty products. Each item is chosen with our customers in mind, ensuring quality, value, and satisfaction.
              </p>
              <p>
                Today, we're proud to serve over 100,000 happy customers and continue to expand our offerings while maintaining the personal touch and attention to detail that our customers have come to expect.
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
            <h2 className="text-3xl font-bold mb-12 text-center">ShopHub by the Numbers</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">100K+</p>
                <p className="text-muted-foreground">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">10K+</p>
                <p className="text-muted-foreground">Products</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">50+</p>
                <p className="text-muted-foreground">Team Members</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">99%</p>
                <p className="text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-8 opacity-90">Experience the ShopHub difference today</p>
            <a href="/" className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-lg font-semibold text-lg inline-block transition-colors">
              Start Shopping
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
