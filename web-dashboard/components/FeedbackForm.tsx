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
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500"
        rows={3}
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Save Feedback
      </button>
    </form>
  );
}
