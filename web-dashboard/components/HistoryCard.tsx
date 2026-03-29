"use client";

import { useState } from "react";
import { HistoryEntry, ScoreBreakdown } from "@/lib/types";
import { DIMENSION_NAMES, LEVEL_LABELS, LEVEL_COLORS } from "@/lib/constants";
import { DomainBadge } from "./DomainBadge";
import { StarRating } from "./StarRating";
import { ScoreBar } from "./ScoreBar";
import { FeedbackForm } from "./FeedbackForm";
import { ChevronDown } from "lucide-react";

interface HistoryCardProps {
  entry: HistoryEntry;
  onFeedback: (id: number, rating: number, feedback: string) => void;
}

type Tab = "compare" | "scores" | "feedback";

function BoostedText({ text }: { text: string }) {
  return (
    <div className="space-y-0.5">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();

        // Empty line = spacer
        if (trimmed === "") return <div key={i} className="h-2" />;

        // Bold section headers like **CONTEXT:** — render as styled header
        const headerMatch = trimmed.match(/^\*\*(.+?)\*\*(.*)$/);
        if (headerMatch) {
          return (
            <p key={i} className="py-0.5">
              <strong className="text-zinc-200">{headerMatch[1]}</strong>
              {headerMatch[2] && <span>{headerMatch[2]}</span>}
            </p>
          );
        }

        // Numbered items
        if (/^\d+\./.test(trimmed)) {
          // Check for inline bold
          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="pl-2 py-0.5">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-zinc-200">{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }

        // Bullet items
        if (/^[-•]/.test(trimmed)) {
          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="pl-4 py-0.5 text-zinc-400">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-zinc-300">{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }

        // Regular text with possible inline bold
        const parts = trimmed.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="py-0.5">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-zinc-200">{part}</strong> : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

export function HistoryCard({ entry, onFeedback }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<Tab>("compare");

  const hasScores = entry.original_score?.total != null && entry.boosted_score?.total != null;
  const truncatedOriginal =
    entry.original.length > 80
      ? entry.original.slice(0, 80) + "..."
      : entry.original;

  const scoreDelta = hasScores
    ? (entry.boosted_score?.total ?? 0) - (entry.original_score?.total ?? 0)
    : null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "compare", label: "Compare", icon: "\ud83d\udcdd" },
    { key: "scores", label: "Scores", icon: "\ud83d\udcca" },
    { key: "feedback", label: "Feedback", icon: "\u2b50" },
  ];

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
            {entry.chosen && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                entry.chosen === "boosted" ? "bg-emerald-500/20 text-emerald-400" :
                entry.chosen === "refined" ? "bg-amber-500/20 text-amber-400" :
                "bg-zinc-500/20 text-zinc-400"
              }`}>
                {entry.chosen === "boosted" ? "\u2713 Used" : entry.chosen === "refined" ? "\u270f Edited" : "\u25cb Skipped"}
              </span>
            )}
            {scoreDelta !== null && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                scoreDelta > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"
              }`}>
                +{scoreDelta} pts
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

      {/* Expanded content with tabs */}
      {expanded && (
        <div className="border-t border-border">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-accent/30"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {/* Compare tab */}
            {tab === "compare" && (
              <div className="space-y-4">
                {/* Original */}
                <div className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Original</span>
                    {entry.original_score && (
                      <span className="text-[10px] text-zinc-600 font-mono">{entry.original_score.total}/30</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{entry.original}</p>
                </div>

                {/* Boosted — final version */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                      {entry.chosen === "boosted" ? "\u2728 Accepted" : entry.chosen === "refined" ? "\u270f\ufe0f Refined" : entry.chosen === "original" ? "\ud83d\udcdd Kept Original" : "\u2728 Boosted"}
                    </span>
                    {entry.boosted_score && (
                      <span className="text-[10px] text-primary/60 font-mono">{entry.boosted_score.total}/30</span>
                    )}
                    {entry.chosen && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-1 ${
                        entry.chosen === "boosted" ? "bg-emerald-500/20 text-emerald-400" :
                        entry.chosen === "refined" ? "bg-amber-500/20 text-amber-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {entry.chosen === "boosted" ? "Used" : entry.chosen === "refined" ? "Edited" : entry.chosen === "original" ? "Skipped" : ""}
                      </span>
                    )}
                    {entry.boosted_score && (
                      <span className={`text-[10px] font-mono ml-auto ${LEVEL_COLORS[entry.boosted_score.level] ?? "text-zinc-400"}`}>
                        {LEVEL_LABELS[entry.boosted_score.level] ?? ""}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-300 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                    <BoostedText text={entry.boosted} />
                  </div>
                </div>
              </div>
            )}

            {/* Scores tab */}
            {tab === "scores" && (
              <div className="space-y-4">
                {hasScores && entry.original_score && entry.boosted_score ? (
                  <>
                    <div className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-zinc-500">{entry.original_score.total}</p>
                        <p className="text-[10px] text-zinc-600 uppercase">Before</p>
                      </div>
                      <div className="text-2xl text-zinc-600">\u2192</div>
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-emerald-400">{entry.boosted_score.total}</p>
                        <p className="text-[10px] text-zinc-600 uppercase">After</p>
                      </div>
                      <div className="text-center flex-1 border-l border-zinc-700 pl-4">
                        <p className={`text-2xl font-bold ${scoreDelta! > 0 ? "text-emerald-400" : "text-zinc-400"}`}>
                          +{scoreDelta}
                        </p>
                        <p className="text-[10px] text-zinc-600 uppercase">Improvement</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <span className="inline-block w-3 h-2 rounded bg-zinc-500/40" /> Before
                        <span className="inline-block w-3 h-2 rounded bg-emerald-500 ml-2" /> After
                      </div>
                      {(
                        Object.keys(entry.original_score.dimensions) as (keyof ScoreBreakdown["dimensions"])[]
                      ).map((key) => (
                        <ScoreBar
                          key={key}
                          label={DIMENSION_NAMES[key] ?? key}
                          before={entry.original_score!.dimensions[key]}
                          after={entry.boosted_score!.dimensions[key]}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-8">
                    No scoring data for this boost
                  </p>
                )}
              </div>
            )}

            {/* Feedback tab */}
            {tab === "feedback" && (
              <FeedbackForm entry={entry} onSubmit={onFeedback} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
