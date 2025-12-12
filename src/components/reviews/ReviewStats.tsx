import { StarRating } from "./StarRating";
import { Progress } from "@/components/ui/progress";
import { ReviewStats as ReviewStatsType } from "@/hooks/useReviews";

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-muted rounded-lg">
      {/* Average Rating */}
      <div className="flex flex-col items-center justify-center text-center md:min-w-[160px]">
        <span className="text-5xl font-bold">
          {averageRating > 0 ? averageRating.toFixed(1) : "—"}
        </span>
        <StarRating rating={averageRating} size="md" className="mt-2" />
        <span className="text-sm text-muted-foreground mt-1">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Rating Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium w-6">{rating}★</span>
              <Progress value={percentage} className="h-2 flex-1" />
              <span className="text-sm text-muted-foreground w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
