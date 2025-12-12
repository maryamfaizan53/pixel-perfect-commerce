import { format } from "date-fns";
import { ThumbsUp, CheckCircle, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { Review } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  isOwner?: boolean;
  hasVoted?: boolean;
  onHelpful?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  isOwner = false,
  hasVoted = false,
  onHelpful,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const initials = review.profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="p-6 border border-border rounded-lg bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">
                {review.profile?.full_name || "Anonymous"}
              </span>
              {review.is_verified_purchase && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Purchase
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {review.title && (
        <h4 className="font-semibold mt-4">{review.title}</h4>
      )}

      {review.content && (
        <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
          {review.content}
        </p>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHelpful}
          disabled={isOwner}
          className={cn(
            "gap-2 text-muted-foreground",
            hasVoted && "text-primary"
          )}
        >
          <ThumbsUp className={cn("w-4 h-4", hasVoted && "fill-current")} />
          Helpful ({review.helpful_count})
        </Button>
      </div>
    </div>
  );
}
