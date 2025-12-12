-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_handle TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Each user can only review a product once
  UNIQUE(user_id, product_id)
);

-- Create review helpful votes table to track who found reviews helpful
CREATE TABLE public.review_helpful_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Each user can only vote once per review
  UNIQUE(review_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews

-- Anyone can view reviews (public for social proof)
CREATE POLICY "Anyone can view reviews"
ON public.product_reviews
FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.product_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.product_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for review_helpful_votes

-- Anyone can view vote counts (for displaying helpful count)
CREATE POLICY "Anyone can view helpful votes"
ON public.review_helpful_votes
FOR SELECT
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote helpful"
ON public.review_helpful_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own votes
CREATE POLICY "Users can remove own votes"
ON public.review_helpful_votes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update helpful_count when votes change
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for helpful count updates
CREATE TRIGGER update_helpful_count
AFTER INSERT OR DELETE ON public.review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_review_helpful_count();

-- Create function to update review updated_at
CREATE OR REPLACE FUNCTION public.update_review_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_review_updated_at();

-- Grant permissions
GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT SELECT ON public.review_helpful_votes TO anon;
GRANT SELECT, INSERT, DELETE ON public.review_helpful_votes TO authenticated;