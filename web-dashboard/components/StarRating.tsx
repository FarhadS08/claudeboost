"use client";

interface StarRatingProps {
  value: number;
  onChange?: (n: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          className={`text-xl leading-none transition-colors ${
            star <= value ? "text-amber-400" : "text-zinc-600"
          } ${readonly ? "cursor-default" : "cursor-pointer hover:text-amber-300"}`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
