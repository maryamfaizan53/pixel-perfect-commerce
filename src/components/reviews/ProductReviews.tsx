import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { ReviewStats } from "./ReviewStats";
import { useReviews } from "@/hooks/useReviews";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductReviewsProps {
  productId: string;
  productHandle: string;
}

export function ProductReviews({ productId, productHandle }: ProductReviewsProps) {
  const {
    reviews,
    stats,
    loading,
    userReview,
    userHelpfulVotes,
    createReview,
    updateReview,
    deleteReview,
    toggleHelpful,
  } = useReviews(productId, productHandle);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (data: any) => {
    if (isEditing && userReview) {
      const success = await updateReview(userReview.id, data);
      if (success) {
        setIsEditing(false);
        setShowForm(false);
      }
      return success;
    }
    const success = await createReview(data);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteReview(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <ReviewStats stats={stats} />

      {/* Write Review Button or Form */}
      {isAuthenticated ? (
        !userReview && !showForm ? (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <MessageSquarePlus className="w-4 h-4" />
            Write a Review
          </Button>
        ) : showForm ? (
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h3>
            <ReviewForm
              productId={productId}
              productHandle={productHandle}
              existingReview={isEditing ? userReview : null}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setIsEditing(false);
              }}
            />
          </div>
        ) : null
      ) : (
        <div className="p-6 border border-border rounded-lg bg-muted/50 text-center">
          <p className="text-muted-foreground mb-3">
            Sign in to leave a review
          </p>
          <Button variant="outline" asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Customer Reviews ({stats.totalReviews})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={userId === review.user_id}
                hasVoted={userHelpfulVotes.has(review.id)}
                onHelpful={() => toggleHelpful(review.id)}
                onEdit={handleEditClick}
                onDelete={() => setDeleteConfirmId(review.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
