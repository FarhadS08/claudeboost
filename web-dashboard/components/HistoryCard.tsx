"use client";

import { useState } from "react";
import { HistoryEntry, ScoreBreakdown } from "@/lib/types";
import { DIMENSION_NAMES, LEVEL_LABELS, LEVEL_COLORS, DOMAIN_COLORS } from "@/lib/constants";
import { DomainBadge } from "./DomainBadge";
import { StarRating } from "./StarRating";
import { ScoreBar } from "./ScoreBar";
import { FeedbackForm } from "./FeedbackForm";

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
        if (trimmed === "") return <div key={i} className="h-2" />;
        const headerMatch = trimmed.match(/^\*\*(.+?)\*\*(.*)$/);
        if (headerMatch) {
          return (
            <p key={i} className="py-0.5">
              <strong className="text-zinc-200">{headerMatch[1]}</strong>
              {headerMatch[2] && <span>{headerMatch[2]}</span>}
            </p>
          );
        }
        if (/^\d+\./.test(trimmed)) {
          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="pl-2 py-0.5">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-zinc-200">{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }
        if (/^[-\u2022]/.test(trimmed)) {
          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="pl-4 py-0.5 text-zinc-400">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-zinc-300">{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }
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

  const domainColor = DOMAIN_COLORS[entry.domain] || DOMAIN_COLORS.other;

  const tabs: { key: Tab; label: string }[] = [
    { key: "compare", label: "Compare" },
    { key: "scores", label: "Scores" },
    { key: "feedback", label: "Feedback" },
  ];

  return (
    <div
      className="group relative bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:border-zinc-600/50"
      style={{ borderLeftWidth: "3px", borderLeftColor: domainColor.accent }}
    >
      {/* Collapsed header */}
      <div
        className="px-5 py-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <DomainBadge domain={entry.domain} />
            <span className="text-sm text-zinc-400 truncate">{truncatedOriginal}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {entry.chosen && (
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                entry.chosen === "boosted" ? "bg-emerald-500/15 text-emerald-400" :
                entry.chosen === "refined" ? "bg-amber-500/15 text-amber-400" :
                "bg-zinc-500/15 text-zinc-500"
              }`}>
                {entry.chosen === "boosted" ? "Used" : entry.chosen === "refined" ? "Edited" : "Skipped"}
              </span>
            )}
            {scoreDelta !== null && (
              <span className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded-md ${
                scoreDelta > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-500"
              }`}>
                +{scoreDelta}
              </span>
            )}
            {entry.rating !== null && entry.rating > 0 && (
              <StarRating value={entry.rating} readonly />
            )}
            <span className="text-[11px] text-zinc-600 tabular-nums">
              {new Date(entry.timestamp).toLocaleDateString()}
            </span>
            <span className={`text-zinc-600 text-xs transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>
              &#9656;
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Tab bar */}
          <div className="flex">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-[12px] font-semibold tracking-wide transition-all ${
                  tab === t.key
                    ? "text-primary border-b-2 border-primary bg-primary/[0.04]"
                    : "text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Compare tab */}
            {tab === "compare" && (
              <div className="space-y-4">
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Original</span>
                    {entry.original_score && (
                      <span className="text-[10px] text-zinc-600 font-mono">{entry.original_score.total}/30</span>
                    )}
                  </div>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">{entry.original}</p>
                </div>

                <div className="rounded-xl p-5 border" style={{ background: `${domainColor.accent}08`, borderColor: `${domainColor.accent}15` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: domainColor.accent }}>
                      {entry.chosen === "boosted" ? "Accepted" : entry.chosen === "refined" ? "Refined" : entry.chosen === "original" ? "Original kept" : "Boosted"}
                    </span>
                    {entry.boosted_score && (
                      <span className="text-[10px] font-mono" style={{ color: `${domainColor.accent}99` }}>{entry.boosted_score.total}/30</span>
                    )}
                    {entry.boosted_score && (
                      <span className={`text-[10px] font-mono ml-auto ${LEVEL_COLORS[entry.boosted_score.level] ?? "text-zinc-400"}`}>
                        {LEVEL_LABELS[entry.boosted_score.level] ?? ""}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-zinc-300 leading-relaxed max-h-[350px] overflow-y-auto pr-2">
                    <BoostedText text={entry.boosted} />
                  </div>
                </div>
              </div>
            )}

            {/* Scores tab */}
            {tab === "scores" && (
              <div className="space-y-5">
                {hasScores && entry.original_score && entry.boosted_score ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                        <p className="text-3xl font-bold font-mono text-zinc-500 tabular-nums">{entry.original_score.total}</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Before</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-500/[0.06] rounded-xl border border-emerald-500/15">
                        <p className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">{entry.boosted_score.total}</p>
                        <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mt-1">After</p>
                      </div>
                      <div className="text-center p-4 bg-primary/[0.06] rounded-xl border border-primary/15">
                        <p className={`text-3xl font-bold font-mono tabular-nums ${scoreDelta! > 0 ? "text-primary" : "text-zinc-400"}`}>
                          +{scoreDelta}
                        </p>
                        <p className="text-[10px] text-primary/50 uppercase tracking-wider mt-1">Lift</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 mb-1">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-zinc-500/50 inline-block" /> Before</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" /> After</span>
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
                  <div className="text-center py-12">
                    <p className="text-sm text-zinc-500">No scoring data for this boost</p>
                  </div>
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
