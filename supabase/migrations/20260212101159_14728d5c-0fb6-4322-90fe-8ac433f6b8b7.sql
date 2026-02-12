
-- Drop the overly permissive email-based policy
DROP POLICY IF EXISTS "Users can view orders by email" ON public.orders;
