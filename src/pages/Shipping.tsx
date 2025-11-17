import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, Package, Globe, Clock } from "lucide-react";

const Shipping = () => {
  const shippingMethods = [
    { name: "Standard Shipping", time: "5-7 business days", cost: "Free on orders over $50, otherwise $9.99" },
    { name: "Express Shipping", time: "2-3 business days", cost: "$19.99" },
    { name: "Next Day Delivery", time: "1 business day", cost: "$29.99" },
    { name: "International Shipping", time: "7-14 business days", cost: "Varies by location" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
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
            <h2 className="text-2xl font-bold mb-2">Free Standard Shipping</h2>
            <p className="text-lg text-muted-foreground">On all orders over $50 within the continental US</p>
          </section>

          {/* Processing Time */}
          <section className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Order Processing</h2>
            <p className="text-muted-foreground mb-4">
              Orders are typically processed within 1-2 business days. You'll receive a confirmation email with tracking information once your order ships.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Orders placed on weekends or holidays will be processed on the next business day.
            </p>
          </section>

          {/* International Shipping */}
          <section className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">International Shipping</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              We ship to over 100 countries worldwide. International shipping costs and delivery times vary depending on your location and the shipping method selected.
            </p>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong> International orders may be subject to import duties and taxes, which are the responsibility of the recipient. These charges are not included in our pricing.
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
