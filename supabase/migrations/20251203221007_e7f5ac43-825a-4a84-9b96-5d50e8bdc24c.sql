-- Allow orders from customers who don't have accounts (guest checkout)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to also allow service role to insert orders (for webhook)
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;

CREATE POLICY "Users can insert own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add policy for users to view orders by email (for guest order lookup)
CREATE POLICY "Users can view orders by email" 
ON public.orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);