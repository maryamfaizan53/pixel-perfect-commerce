-- Create order status enum
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shopify_order_id TEXT UNIQUE NOT NULL,
  shopify_order_number TEXT NOT NULL,
  email TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  financial_status TEXT,
  fulfillment_status TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  subtotal_price DECIMAL(10, 2) NOT NULL,
  total_tax DECIMAL(10, 2),
  total_shipping DECIMAL(10, 2),
  currency_code TEXT NOT NULL DEFAULT 'USD',
  customer_name TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  shopify_variant_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  variant_title TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create order status history table
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_shopify_order_id ON public.orders(shopify_order_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history
CREATE POLICY "Users can view own order status history"
  ON public.order_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Trigger to update orders updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();

-- Function to automatically create status history entry
CREATE OR REPLACE FUNCTION public.create_order_status_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (NEW.id, NEW.status, 'Status updated');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_order_status_history_trigger
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_order_status_history();