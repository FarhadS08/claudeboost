"use client";

import { useState } from "react";
import { HistoryEntry, ScoreBreakdown } from "@/lib/types";
import { DIMENSION_NAMES } from "@/lib/constants";
import { DomainBadge } from "./DomainBadge";
import { StarRating } from "./StarRating";
import { ScoreBar } from "./ScoreBar";
import { FeedbackForm } from "./FeedbackForm";

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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Collapsed header — always visible, click toggles */}
      <div
        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left side */}
          <div className="flex items-center gap-2 min-w-0">
            <DomainBadge domain={entry.domain} />
            <span className="text-sm text-zinc-400 truncate">{truncatedOriginal}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {hasScores && entry.original_score && entry.boosted_score && (
              <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                {entry.original_score.total}→{entry.boosted_score.total}
              </span>
            )}
            {entry.rating !== null && entry.rating > 0 && (
              <StarRating value={entry.rating} readonly />
            )}
            <span className="text-xs text-zinc-500">
              {new Date(entry.timestamp).toLocaleDateString()}
            </span>
            <span className="text-zinc-500 text-sm">{expanded ? "▾" : "▸"}</span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          {/* Two-column prompt view */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Original
              </p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{entry.original}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Boosted
              </p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{entry.boosted}</p>
            </div>
          </div>

          {/* Score bars for each dimension */}
          {hasScores && entry.original_score && entry.boosted_score && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Score Breakdown
              </p>
              <div className="space-y-2">
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

          {/* Feedback form */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Feedback
            </p>
            <FeedbackForm entry={entry} onSubmit={onFeedback} />
          </div>
        </div>
      )}
    </div>
  );
}
