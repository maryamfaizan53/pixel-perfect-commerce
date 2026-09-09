import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { getOrder } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const justPlaced = params.get("placed") === "1" || params.get("paid") === "1";

  useSEO({ title: "Order details | AI Bazar", description: "Your AI Bazar order." });
  // Order pages carry personal data — keep them out of search indexes.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => { document.head.removeChild(m); };
  }, []);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
    retry: 1,
  });

  const money = (n: number) => `${order?.currency || "PKR"} ${Number(n).toLocaleString()}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-16">
          <div className="text-center max-w-sm mx-auto px-4">
            <Package className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Order not found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This link may be incorrect or the order was removed. You can look it up with your order
              number and email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="pill">
                <Link to="/track-order">Track an order</Link>
              </Button>
              <Button asChild variant="outline" size="pill">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Home
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const isCod = order.paymentMethod === "cod";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <div className="container-custom max-w-3xl">
          {justPlaced && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-trust/30 bg-trust/10 p-4">
              <CheckCircle2 className="w-5 h-5 text-trust flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Order placed — thank you!</p>
                <p className="text-sm text-muted-foreground">
                  We've emailed a confirmation to <span className="font-medium">{order.email}</span>.
                  {isCod
                    ? " Pay cash on delivery when your parcel arrives — you can open and check it first."
                    : " We'll dispatch it once payment is confirmed."}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Order {order.orderNumber}
              </h1>
              {orderDate && <p className="text-sm text-muted-foreground mt-1">{orderDate}</p>}
            </div>
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Delivery address
              </h2>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{addr.fullName || order.customerName}</p>
                {addr.phone && <p>{addr.phone}</p>}
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {[addr.city, addr.province, addr.postalCode].filter(Boolean).join(", ")}
                </p>
                <p>{addr.country || "Pakistan"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <Wallet className="w-4 h-4 text-muted-foreground" /> Payment
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-medium text-foreground">
                    {isCod ? "Cash on Delivery" : "Card / Wallet"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-medium text-foreground capitalize">{order.paymentStatus}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-trust">
                <Truck className="w-3.5 h-3.5" /> 1–3 day delivery across Pakistan
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productTitle}
                      className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {item.productSlug ? (
                      <Link
                        to={`/product/${item.productSlug}`}
                        className="text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                      >
                        {item.productTitle}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-foreground line-clamp-2">{item.productTitle}</p>
                    )}
                    {item.variantTitle && (
                      <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} × {money(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{money(item.total)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{money(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{order.shippingFee === 0 ? "FREE" : money(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-1.5">
                <span>Total</span>
                <span>{money(order.total)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Your note:</span> {order.notes}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="pill">
              <Link to="/category">Continue shopping</Link>
            </Button>
            <Button asChild variant="outline" size="pill">
              <a href="https://wa.me/923328222026" target="_blank" rel="noopener noreferrer">
                Need help? WhatsApp us
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetails;
