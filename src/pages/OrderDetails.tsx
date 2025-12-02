import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, MapPin, CreditCard, Loader2 } from "lucide-react";
import { useOrders, OrderWithItems } from "@/hooks/useOrders";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  shipped: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    const orderData = await getOrderById(orderId);
    setOrder(orderData);
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Order not found</h1>
            <Link to="/account">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Header />
      <main className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/account">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order #{order.shopify_order_number}</h1>
                <p className="text-muted-foreground mt-1">{orderDate}</p>
              </div>
              <Badge 
                variant="outline" 
                className={`${statusColors[order.status]} text-lg px-4 py-2`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.shipping_address ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{order.shipping_address.name}</p>
                      <p>{order.shipping_address.address1}</p>
                      {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.zip}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No shipping address</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge variant="secondary">{order.financial_status || 'N/A'}</Badge>
                  </div>
                  {order.billing_address && (
                    <>
                      <Separator />
                      <p className="font-medium">Billing Address:</p>
                      <div className="space-y-1 text-muted-foreground">
                        <p>{order.billing_address.address1}</p>
                        <p>
                          {order.billing_address.city}, {order.billing_address.province} {order.billing_address.zip}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      {item.image_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.product_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{item.product_title}</h3>
                        {item.variant_title && (
                          <p className="text-sm text-muted-foreground">{item.variant_title}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {order.currency_code} {parseFloat(item.total.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.currency_code} {parseFloat(item.price.toString()).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{order.currency_code} {parseFloat(order.subtotal_price.toString()).toFixed(2)}</span>
                    </div>
                    {order.total_shipping && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{order.currency_code} {parseFloat(order.total_shipping.toString()).toFixed(2)}</span>
                      </div>
                    )}
                    {order.total_tax && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{order.currency_code} {parseFloat(order.total_tax.toString()).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{order.currency_code} {parseFloat(order.total_price.toString()).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderDetails;
