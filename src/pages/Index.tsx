import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingUp, Truck, Shield, HeadphonesIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container-custom py-6">
          <HeroCarousel />
        </section>

        {/* Categories */}
        <CategoryGrid />

        {/* Features */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over $50</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">100% secure checkout</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">
                <div className="p-3 bg-accent/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Best Prices</h3>
                  <p className="text-sm text-muted-foreground">Guaranteed low prices</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">
                <div className="p-3 bg-warning/10 rounded-full">
                  <HeadphonesIcon className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">24/7 Support</h3>
                  <p className="text-sm text-muted-foreground">Dedicated support team</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Deal Banner */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold mb-4">Limited Time Offer!</h2>
            <p className="text-xl mb-8 opacity-90">Get up to 50% off on selected categories</p>
            <button className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
              Shop Deals Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
