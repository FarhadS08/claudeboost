"use client";

import { useState } from "react";
import { HistoryEntry } from "@/lib/types";
import { StarRating } from "./StarRating";

interface FeedbackFormProps {
  entry: HistoryEntry;
  onSubmit: (id: number, rating: number, feedback: string) => void;
}

export function FeedbackForm({ entry, onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(entry.rating ?? 0);
  const [feedback, setFeedback] = useState<string>(entry.feedback ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(entry.id, rating, feedback);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="What should be different next time?"
        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 transition-colors"
        rows={3}
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:opacity-90 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity"
      >
        Save Feedback
      </button>
    </form>
  );
}
