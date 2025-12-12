import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { Loader2 } from "lucide-react";
import { Review, CreateReviewData } from "@/hooks/useReviews";

interface ReviewFormProps {
  productId: string;
  productHandle: string;
  existingReview?: Review | null;
  onSubmit: (data: CreateReviewData) => Promise<boolean>;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  productHandle,
  existingReview,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    const success = await onSubmit({
      product_id: productId,
      product_handle: productHandle,
      rating,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
    });

    setLoading(false);

    if (success && !existingReview) {
      setRating(0);
      setTitle("");
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Your Rating *</Label>
        <div className="mt-2">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>

      <div>
        <Label htmlFor="review-title">Review Title</Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="review-content">Your Review</Label>
        <Textarea
          id="review-content"
          placeholder="Tell others about your experience with this product..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {content.length}/2000 characters
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {existingReview ? "Update Review" : "Submit Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
