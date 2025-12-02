import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Order {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string;
  email: string;
  status: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  total_price: number;
  subtotal_price: number;
  total_tax: number | null;
  total_shipping: number | null;
  currency_code: string;
  customer_name: string | null;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  product_title: string;
  variant_title: string | null;
  quantity: number;
  price: number;
  total: number;
  image_url: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    fetchOrders();

    // Subscribe to order changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<OrderWithItems | null> => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: items || [],
      };
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      return null;
    }
  };

  return {
    orders,
    loading,
    error,
    getOrderById,
    refetch: fetchOrders,
  };
};
