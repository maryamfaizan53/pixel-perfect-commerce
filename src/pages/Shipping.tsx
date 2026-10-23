import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, Package, Globe, Clock } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const Shipping = () => {
  useSEO({
    title: "Shipping Information - AI Bazar Pakistan | Free Express Delivery",
    description: "AI Bazar Pakistan offers free express shipping nationwide. Orders dispatched within 24 hours with 1-3 day delivery across all cities in Pakistan. Cash on delivery available.",
    keywords: "aibazar shipping, free shipping pakistan, aibazar delivery time, cash on delivery pakistan, express shipping pakistan",
    canonical: "https://www.aibazar.pk/shipping"
  });
  const shippingMethods = [
    { name: "Standard Delivery", time: "1–3 business days", cost: "Free on orders over PKR 5,000, otherwise PKR 199" },
    { name: "Big Cities (Karachi, Lahore, Islamabad)", time: "1–2 business days", cost: "Same rates apply" },
    { name: "Cash on Delivery", time: "Pay when your parcel arrives", cost: "Available nationwide" },
    { name: "Open Parcel Before Payment", time: "At the time of delivery", cost: "Check your order before you pay" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <Truck className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-lg text-muted-foreground">Fast, reliable delivery to your door</p>
          </div>

          {/* Shipping Methods */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Shipping Methods</h2>
            <div className="space-y-4">
              {shippingMethods.map((method, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
                    <p className="text-muted-foreground mb-2">{method.time}</p>
                    <p className="text-sm font-medium text-primary">{method.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Free Shipping */}
          <section className="bg-accent/10 border-2 border-accent rounded-lg p-8 mb-12 text-center">
            <Package className="w-12 h-12 mx-auto text-accent mb-4" />
            <h2 className="text-2xl font-bold mb-2">Free Shipping</h2>
            <p className="text-lg text-muted-foreground">On all orders over PKR 5,000, delivered anywhere in Pakistan</p>
          </section>

          {/* Processing Time */}
          <section className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Order Processing</h2>
            <p className="text-muted-foreground mb-4">
              Orders are usually dispatched within 24 hours. You'll receive a confirmation on WhatsApp or email with tracking details once your order ships.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Orders placed on weekends or public holidays are processed on the next business day.
            </p>
          </section>

          {/* International Shipping */}
          <section className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Nationwide Coverage</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              We deliver right across Pakistan — from major cities like Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad and Peshawar to smaller towns through our courier partners.
            </p>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Good to know:</strong> Delivery to remote areas may take an extra day or two. If you're unsure about your area, message us on WhatsApp and we'll confirm before you order.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
