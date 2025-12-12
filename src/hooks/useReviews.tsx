import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  product_handle: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewData {
  product_id: string;
  product_handle: string;
  rating: number;
  title?: string;
  content?: string;
}

export function useReviews(productId: string, productHandle: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [userHelpfulVotes, setUserHelpfulVotes] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewsData = (data || []) as Review[];
      setReviews(reviewsData);

      // Calculate stats
      if (reviewsData.length > 0) {
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRating = 0;

        reviewsData.forEach((review) => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          totalRating += review.rating;
        });

        setStats({
          averageRating: totalRating / reviewsData.length,
          totalReviews: reviewsData.length,
          ratingDistribution: distribution,
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !productId) return;

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    setUserReview(existingReview as Review | null);

    // Fetch user's helpful votes for this product's reviews
    const { data: votes } = await supabase
      .from("review_helpful_votes")
      .select("review_id")
      .eq("user_id", user.id);

    if (votes) {
      setUserHelpfulVotes(new Set(votes.map((v) => v.review_id)));
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
    fetchUserData();
  }, [fetchReviews, fetchUserData]);

  const createReview = async (data: CreateReviewData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to leave a review");
      return false;
    }

    try {
      // Check if this is a verified purchase
      const { data: orders } = await supabase
        .from("order_items")
        .select("id, order:orders!inner(user_id)")
        .eq("shopify_product_id", data.product_id)
        .limit(1);

      const isVerifiedPurchase = orders && orders.length > 0;

      const { error } = await supabase.from("product_reviews").insert({
        user_id: user.id,
        product_id: data.product_id,
        product_handle: data.product_handle,
        rating: data.rating,
        title: data.title || null,
        content: data.content || null,
        is_verified_purchase: isVerifiedPurchase,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already reviewed this product");
        } else {
          throw error;
        }
        return false;
      }

      toast.success("Review submitted successfully!");
      await fetchReviews();
      await fetchUserData();
      return true;
    } catch (error) {
      console.error("Failed to create review:", error);
      toast.error("Failed to submit review");
      return false;
    }
  };

  const updateReview = async (reviewId: string, data: Partial<CreateReviewData>) => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          rating: data.rating,
          title: data.title || null,
          content: data.content || null,
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review updated successfully!");
      await fetchReviews();
      await fetchUserData();
      return true;
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Failed to update review");
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review deleted");
      await fetchReviews();
      setUserReview(null);
      return true;
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
      return false;
    }
  };

  const toggleHelpful = async (reviewId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    const hasVoted = userHelpfulVotes.has(reviewId);

    try {
      if (hasVoted) {
        await supabase
          .from("review_helpful_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);

        setUserHelpfulVotes((prev) => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        await supabase.from("review_helpful_votes").insert({
          review_id: reviewId,
          user_id: user.id,
        });

        setUserHelpfulVotes((prev) => new Set(prev).add(reviewId));
      }

      await fetchReviews();
    } catch (error) {
      console.error("Failed to toggle helpful vote:", error);
      toast.error("Failed to update vote");
    }
  };

  return {
    reviews,
    stats,
    loading,
    userReview,
    userHelpfulVotes,
    createReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    refetch: fetchReviews,
  };
}
