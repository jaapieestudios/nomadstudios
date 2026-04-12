import { type Review } from "@/types/database";
import { format, parseISO } from "date-fns";
import { CheckCircle } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-accent" : "text-stroke"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-card border border-stroke rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white">
              {review.customer_name}
            </span>
            {review.booking_id && (
              <span className="flex items-center gap-1 text-xs text-accent font-mono">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          <StarRating rating={review.rating} />
        </div>
        <span className="text-xs text-muted flex-shrink-0">
          {format(parseISO(review.created_at), "d MMM yyyy")}
        </span>
      </div>
      <p className="text-sm text-muted leading-relaxed">{review.text}</p>
    </div>
  );
}
