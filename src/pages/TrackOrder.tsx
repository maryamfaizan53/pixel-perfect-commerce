import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, MapPin, Truck, CheckCircle } from "lucide-react";

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [tracking, setTracking] = useState<boolean | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTracking(true);
  };

  const trackingSteps = [
    { status: "Order Placed", date: "Jan 15, 2024", completed: true },
    { status: "Processing", date: "Jan 16, 2024", completed: true },
    { status: "Shipped", date: "Jan 17, 2024", completed: true },
    { status: "Out for Delivery", date: "Jan 19, 2024", completed: false },
    { status: "Delivered", date: "Estimated Jan 20, 2024", completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-8">
            <Package className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order details to see tracking information</p>
          </div>

          <form onSubmit={handleTrack} className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="order-number">Order Number</Label>
                <Input
                  id="order-number"
                  placeholder="e.g., ORD-2024-1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary-hover">
                Track Order
              </Button>
            </div>
          </form>

          {tracking && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Order #ORD-2024-1001</h2>
                  <p className="text-muted-foreground">Estimated delivery: Jan 20, 2024</p>
                </div>
                <Truck className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? "bg-accent text-accent-foreground" : "bg-muted"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.completed ? "bg-accent" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className={`font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.status}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">123 Main Street</p>
                  <p className="text-sm text-muted-foreground">New York, NY 10001</p>
                  <p className="text-sm text-muted-foreground">United States</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
