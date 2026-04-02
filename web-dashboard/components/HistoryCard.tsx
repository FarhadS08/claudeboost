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
      className="group relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[rgba(255,255,255,0.1)]"
      style={{ borderLeftWidth: "3px", borderLeftColor: domainColor.accent }}
    >
      {/* Collapsed header */}
      <div
        className="px-5 py-4 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <DomainBadge domain={entry.domain} />
            <span className="text-[13px] text-zinc-500 truncate">{truncatedOriginal}</span>
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
              <span
                className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded-md ${
                  scoreDelta > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-500"
                }`}
                style={{ boxShadow: scoreDelta > 0 ? '0 0 8px rgba(16,185,129,0.2)' : undefined }}
              >
                +{scoreDelta}
              </span>
            )}
            {entry.rating !== null && entry.rating > 0 && (
              <StarRating value={entry.rating} readonly />
            )}
            <span className="text-[11px] text-zinc-600 font-mono tabular-nums">
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
        <div className="border-t border-[rgba(255,255,255,0.06)]">
          {/* Tab bar */}
          <div className="flex">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                  tab === t.key
                    ? "text-white border-b-2 border-white bg-[rgba(255,255,255,0.03)]"
                    : "text-zinc-600 hover:text-zinc-400 border-b-2 border-transparent"
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
                <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-[rgba(255,255,255,0.04)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold">Original</span>
                    {entry.original_score && (
                      <span className="text-[10px] text-zinc-600 font-mono">{entry.original_score.total}/30</span>
                    )}
                  </div>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">{entry.original}</p>
                </div>

                <div
                  className="rounded-xl p-5 border"
                  style={{ background: `${domainColor.accent}06`, borderColor: `${domainColor.accent}12` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: domainColor.accent }}>
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
                  <div className="text-[13px] text-zinc-300 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
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
                      <div className="text-center p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.04)]">
                        <p className="text-3xl font-black font-mono tabular-nums text-zinc-500" style={{ textShadow: '0 0 20px rgba(161,161,170,0.15)' }}>{entry.original_score.total}</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.15em] mt-1 font-bold">Before</p>
                      </div>
                      <div className="text-center p-5 bg-[rgba(16,185,129,0.04)] rounded-xl border border-[rgba(16,185,129,0.1)]">
                        <p className="text-3xl font-black font-mono tabular-nums text-emerald-400" style={{ textShadow: '0 0 20px rgba(16,185,129,0.3)' }}>{entry.boosted_score.total}</p>
                        <p className="text-[10px] text-emerald-500/60 uppercase tracking-[0.15em] mt-1 font-bold">After</p>
                      </div>
                      <div className="text-center p-5 bg-[rgba(124,58,237,0.04)] rounded-xl border border-[rgba(124,58,237,0.1)]">
                        <p className={`text-3xl font-black font-mono tabular-nums ${scoreDelta! > 0 ? "text-purple-400" : "text-zinc-400"}`} style={{ textShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                          +{scoreDelta}
                        </p>
                        <p className="text-[10px] text-purple-400/50 uppercase tracking-[0.15em] mt-1 font-bold">Lift</p>
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
