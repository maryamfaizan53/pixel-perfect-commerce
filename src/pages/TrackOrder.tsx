import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Loader2 } from "lucide-react";
import { z } from "zod";
import { lookupOrder } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";

const schema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(3, "Enter your order number (e.g. AB-100001)")
    .regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and hyphens only"),
  email: z.string().trim().email("Enter the email you used at checkout"),
});

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: "Track your order | AI Bazar",
    description: "Look up your AI Bazar order with your order number and email.",
    canonical: "https://www.aibazar.pk/track-order",
  });

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ orderNumber, email });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const order = await lookupOrder(parsed.data.orderNumber, parsed.data.email);
      navigate(`/order/${order.id}`);
    } catch {
      setError("We couldn't find an order with that number and email. Double-check both and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <div className="container-custom max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Track your order</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your order number and the email you used at checkout.
            </p>
          </div>

          <form
            onSubmit={handleTrack}
            className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4"
          >
            <div>
              <Label htmlFor="order-number">Order number</Label>
              <Input
                id="order-number"
                placeholder="AB-100001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find my order"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Your order number is in the confirmation email we sent you.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
