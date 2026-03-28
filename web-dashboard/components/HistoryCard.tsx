"use client";

import { useState } from "react";
import { HistoryEntry, ScoreBreakdown } from "@/lib/types";
import { DIMENSION_NAMES } from "@/lib/constants";
import { DomainBadge } from "./DomainBadge";
import { StarRating } from "./StarRating";
import { ScoreBar } from "./ScoreBar";
import { FeedbackForm } from "./FeedbackForm";
import { ChevronDown } from "lucide-react";

interface HistoryCardProps {
  entry: HistoryEntry;
  onFeedback: (id: number, rating: number, feedback: string) => void;
}

export function HistoryCard({ entry, onFeedback }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasScores = entry.original_score !== null && entry.boosted_score !== null;
  const truncatedOriginal =
    entry.original.length > 80
      ? entry.original.slice(0, 80) + "..."
      : entry.original;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-colors">
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <DomainBadge domain={entry.domain} />
            <span className="text-sm text-muted-foreground truncate">{truncatedOriginal}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasScores && entry.original_score && entry.boosted_score && (
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap px-2 py-0.5 rounded-md bg-muted">
                {entry.original_score.total} &#8594; {entry.boosted_score.total}
              </span>
            )}
            {entry.rating !== null && entry.rating > 0 && (
              <StarRating value={entry.rating} readonly />
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(entry.timestamp).toLocaleDateString()}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-5 border-t border-border pt-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Original
              </p>
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground/70 whitespace-pre-wrap font-mono leading-relaxed">
                  {entry.original}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Boosted
              </p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/15">
                <p className="text-sm text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                  {entry.boosted}
                </p>
              </div>
            </div>
          </div>

          {hasScores && entry.original_score && entry.boosted_score && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Score Breakdown
              </p>
              <div className="bg-muted/20 rounded-xl p-4 border border-border space-y-2.5">
                {(
                  Object.keys(
                    entry.original_score.dimensions
                  ) as (keyof ScoreBreakdown["dimensions"])[]
                ).map((key) => (
                  <ScoreBar
                    key={key}
                    label={DIMENSION_NAMES[key] ?? key}
                    before={entry.original_score!.dimensions[key]}
                    after={entry.boosted_score!.dimensions[key]}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Feedback
            </p>
            <FeedbackForm entry={entry} onSubmit={onFeedback} />
          </div>
        </div>
      )}
    </div>
  );
}
