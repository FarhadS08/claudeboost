import { useState } from "react";

interface StarRatingProps {
  rating: number | null;
  onRate: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating = ({ rating, onRate, readonly = false, size = 24 }: StarRatingProps) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hover !== null ? star <= hover : star <= (rating ?? 0);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
            style={{ fontSize: size, lineHeight: 1 }}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(null)}
            onClick={() => !readonly && onRate(star)}
          >
            <span className={filled ? "text-warning" : "text-muted"}>★</span>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
