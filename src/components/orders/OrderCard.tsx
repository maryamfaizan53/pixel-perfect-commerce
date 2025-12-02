import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { Order } from "@/hooks/useOrders";

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  shipped: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Order #{order.shopify_order_number}
            </CardTitle>
            <CardDescription>{orderDate}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={statusColors[order.status] || "bg-secondary"}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {order.currency_code} {parseFloat(order.total_price.toString()).toFixed(2)}
              </p>
            </div>
            {order.shipping_address && (
              <div className="text-right text-sm text-muted-foreground">
                <p>Ship to:</p>
                <p className="font-medium text-foreground">
                  {order.shipping_address.city}, {order.shipping_address.province}
                </p>
              </div>
            )}
          </div>
          
          {order.fulfillment_status && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Fulfillment:</span>
              <Badge variant="secondary">
                {order.fulfillment_status}
              </Badge>
            </div>
          )}

          <Link to={`/orders/${order.id}`}>
            <Button variant="outline" className="w-full group">
              View Details
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
