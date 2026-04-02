"use client";

import { useState } from "react";
import { usePolling } from "@/hooks/usePolling";
import { HistoryEntry, Domain, ScoreBreakdown } from "@/lib/types";
import { DOMAIN_LABELS, DOMAINS, DOMAIN_COLORS, DIMENSION_NAMES, LEVEL_LABELS, LEVEL_COLORS } from "@/lib/constants";
import { DomainBadge } from "@/components/DomainBadge";
import { StarRating } from "@/components/StarRating";
import { ScoreBar } from "@/components/ScoreBar";
import { ScoreRadar } from "@/components/ScoreRadar";
import { FeedbackForm } from "@/components/FeedbackForm";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Zap, TrendingUp, Crown, X } from "lucide-react";

/* ── Boosted text renderer ─────────────────────────────────────────────── */
function BoostedText({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (trimmed === "") return <div key={i} className="h-3" />;
        const headerMatch = trimmed.match(/^\*\*(.+?)\*\*(.*)$/);
        if (headerMatch) {
          return (
            <p key={i} className="py-1">
              <strong className="text-white text-[15px]">{headerMatch[1]}</strong>
              {headerMatch[2] && <span className="text-zinc-300">{headerMatch[2]}</span>}
            </p>
          );
        }
        if (/^\d+\./.test(trimmed)) {
          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="pl-3 py-0.5 text-zinc-300 leading-relaxed">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-zinc-100">{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }
        if (/^[-\u2022]/.test(trimmed)) {
          const parts = trimmed.split(/\*\*(.+?)\*\*/g);
          return (
            <p key={i} className="pl-6 py-0.5 text-zinc-400 leading-relaxed">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-zinc-300">{part}</strong> : <span key={j}>{part}</span>
              )}
            </p>
          );
        }
        const parts = trimmed.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="py-0.5 text-zinc-300 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-zinc-100">{part}</strong> : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

/* ── Side Drawer ───────────────────────────────────────────────────────── */
function BoostDrawer({
  entry,
  onClose,
  onFeedback,
}: {
  entry: HistoryEntry;
  onClose: () => void;
  onFeedback: (id: number, rating: number, feedback: string) => void;
}) {
  const dc = DOMAIN_COLORS[entry.domain] || DOMAIN_COLORS.other;
  const hasScores = entry.original_score?.total != null && entry.boosted_score?.total != null;
  const scoreDelta = hasScores ? (entry.boosted_score?.total ?? 0) - (entry.original_score?.total ?? 0) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[58%] max-w-[720px] min-w-[400px] bg-[#08090f] border-l border-[rgba(255,255,255,0.08)] z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#08090f]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DomainBadge domain={entry.domain} />
            {entry.chosen && (
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                entry.chosen === "boosted" ? "bg-emerald-500/15 text-emerald-400" :
                entry.chosen === "refined" ? "bg-amber-500/15 text-amber-400" :
                "bg-zinc-500/15 text-zinc-500"
              }`}>
                {entry.chosen === "boosted" ? "Used" : entry.chosen === "refined" ? "Edited" : "Skipped"}
              </span>
            )}
            <span className="text-[11px] text-zinc-600 font-mono">{new Date(entry.timestamp).toLocaleDateString()}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Original prompt */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Original</span>
              {entry.original_score && (
                <span className="text-[10px] text-zinc-600 font-mono">{entry.original_score.total}/30</span>
              )}
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-5 border border-[rgba(255,255,255,0.05)]">
              <p className="text-[14px] text-zinc-400 leading-relaxed">{entry.original}</p>
            </div>
          </div>

          {/* Score improvement bar */}
          {hasScores && (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 font-mono text-xs">{entry.original_score?.total}</span>
                <span className="text-zinc-600">&#8594;</span>
                <span className="font-mono text-sm font-bold text-emerald-400">{entry.boosted_score?.total}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.15)' }}>
                  +{scoreDelta}
                </span>
              </div>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            </div>
          )}

          {/* Boosted prompt */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: dc.accent }}>
                {entry.chosen === "boosted" ? "Accepted" : entry.chosen === "refined" ? "Refined" : "Boosted"}
              </span>
              {entry.boosted_score && (
                <span className="text-[10px] font-mono" style={{ color: `${dc.accent}99` }}>{entry.boosted_score.total}/30</span>
              )}
              {entry.boosted_score && (
                <span className={`text-[10px] font-mono ml-auto ${LEVEL_COLORS[entry.boosted_score.level] ?? "text-zinc-400"}`}>
                  {LEVEL_LABELS[entry.boosted_score.level] ?? ""}
                </span>
              )}
            </div>
            <div className="rounded-xl p-6 border text-[14px] leading-[1.8]" style={{ background: `${dc.accent}06`, borderColor: `${dc.accent}12` }}>
              <BoostedText text={entry.boosted} />
            </div>
          </div>

          {/* Score breakdown */}
          {hasScores && entry.original_score && entry.boosted_score && (
            <div>
              {/* Large radar + title */}
              <div className="flex items-start gap-6 mb-6">
                <ScoreRadar before={entry.original_score} after={entry.boosted_score} accent={dc.accent} size={120} showLabels />
                <div className="flex-1 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 block mb-3">Score Breakdown</span>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-zinc-500/50 inline-block" /> Before</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ backgroundColor: dc.accent }} /> After</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {(Object.keys(entry.original_score.dimensions) as (keyof ScoreBreakdown["dimensions"])[]).map((key) => (
                  <ScoreBar
                    key={key}
                    label={DIMENSION_NAMES[key] ?? key}
                    before={entry.original_score!.dimensions[key]}
                    after={entry.boosted_score!.dimensions[key]}
                    accent={dc.accent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 block mb-4">Feedback</span>
            <FeedbackForm entry={entry} onSubmit={onFeedback} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main History Content ──────────────────────────────────────────────── */
function HistoryContent() {
  const { data: history, loading, refetch } = usePolling<HistoryEntry[]>("/api/history");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filterDomain = searchParams.get("domain") as Domain | null;
  const filterLevel = searchParams.get("level");

  const handleFeedback = async (id: number, rating: number, feedback: string) => {
    await fetch("/api/history", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rating, feedback }),
    });
    refetch();
  };

  const clearFilter = () => router.push("/dashboard");
  const setFilter = (key: string, value: string) => router.push(`/dashboard?${key}=${value}`);

  const filtered = (history ?? []).filter((e) => {
    if (filterDomain && e.domain !== filterDomain) return false;
    if (filterLevel && e.boosted_score?.level !== Number(filterLevel)) return false;
    return true;
  });

  const totalBoosts = history?.length ?? 0;
  const scoredEntries = history?.filter(
    (e) => e.original_score?.total != null && e.boosted_score?.total != null
  ) ?? [];
  const avgScoreLift =
    scoredEntries.length > 0
      ? scoredEntries.reduce(
          (sum, e) => sum + ((e.boosted_score?.total ?? 0) - (e.original_score?.total ?? 0)),
          0
        ) / scoredEntries.length
      : null;
  const topDomain = (() => {
    if (!history || history.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const e of history) counts[e.domain] = (counts[e.domain] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Domain;
  })();

  const selectedEntry = filtered.find((e) => e.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-zinc-500 text-sm">Loading history...</p>
        </div>
      </div>
    );
  }

  const hasFilter = filterDomain || filterLevel;
  const topDomainColor = topDomain ? (DOMAIN_COLORS[topDomain] || DOMAIN_COLORS.other).accent : "#71717a";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight">History</h1>
        <p className="text-zinc-500 mt-2 text-[15px]">Your prompt boost history</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-7 hover:border-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fade-slide-up">
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: "radial-gradient(circle at 30% 50%, #7c3aed, transparent 70%)" }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <AnimatedNumber value={totalBoosts} className="text-5xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(124,58,237,0.3)" }} />
              <p className="text-[13px] text-zinc-500 font-medium mt-2">Total Boosts</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-7 hover:border-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fade-slide-up" style={{ animationDelay: "80ms" }}>
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: "radial-gradient(circle at 30% 50%, #10b981, transparent 70%)" }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              {avgScoreLift !== null ? (
                <AnimatedNumber value={avgScoreLift} prefix="+" decimals={1} className="text-5xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(16,185,129,0.3)" }} />
              ) : (
                <p className="text-5xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(16,185,129,0.3)" }}>{"\u2014"}</p>
              )}
              <p className="text-[13px] text-zinc-500 font-medium mt-2">Avg Score Lift</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-7 hover:border-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer animate-fade-slide-up" style={{ animationDelay: "160ms" }} onClick={() => topDomain && setFilter("domain", topDomain)}>
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: `radial-gradient(circle at 30% 50%, ${topDomainColor}, transparent 70%)` }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${topDomainColor}15` }}>
              <Crown className="w-5 h-5" style={{ color: topDomainColor }} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-white" style={{ textShadow: `0 0 40px ${topDomainColor}4D` }}>
                {topDomain ? DOMAIN_LABELS[topDomain] : "\u2014"}
              </p>
              <p className="text-[13px] text-zinc-500 font-medium mt-2">Top Domain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-[rgba(124,58,237,0.06)] border border-[rgba(124,58,237,0.15)] rounded-xl">
          <span className="text-sm text-purple-400">
            Filtering by: {filterDomain && `domain = ${DOMAIN_LABELS[filterDomain]}`}
            {filterLevel && `level = ${filterLevel}`}
          </span>
          <button onClick={clearFilter} className="ml-auto text-xs text-zinc-500 hover:text-white transition-colors">
            &#10005; Clear
          </button>
        </div>
      )}

      {/* Section divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Recent Boosts</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />
      </div>

      {/* Domain pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {DOMAINS.map((d) => {
          const c = DOMAIN_COLORS[d] || DOMAIN_COLORS.other;
          const isActive = filterDomain === d;
          return (
            <button
              key={d}
              onClick={() => isActive ? clearFilter() : setFilter("domain", d)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide border transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? `${c.bg} ${c.text} ${c.border}`
                  : `${c.bg} ${c.text} border-transparent hover:${c.border}`
              }`}
              style={isActive ? { boxShadow: `0 0 12px ${c.accent}30` } : undefined}
            >
              {DOMAIN_LABELS[d]}
            </button>
          );
        })}
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-lg text-zinc-400 font-medium">{hasFilter ? "No boosts match this filter" : "No boosts yet"}</p>
          {!hasFilter && <p className="text-sm text-zinc-600 mt-2">Use /boost in Claude Code to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((entry, index) => {
            const dc = DOMAIN_COLORS[entry.domain] || DOMAIN_COLORS.other;
            const delta = entry.boosted_score && entry.original_score
              ? entry.boosted_score.total - entry.original_score.total : null;
            const isSelected = selectedId === entry.id;
            const scorePercent = entry.boosted_score ? Math.round((entry.boosted_score.total / 30) * 100) : 0;
            const truncated = entry.original.length > 80 ? entry.original.slice(0, 80) + "..." : entry.original;

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fade-slide-up hover:translate-y-[-3px] ${
                  isSelected ? "ring-1 ring-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)]" : "hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 20% 20%, ${dc.accent}18, transparent 65%)` }}
                />

                {/* Top accent strip with shimmer */}
                <div className="relative h-1 w-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${dc.accent}, ${dc.accent}40)` }}>
                  <div className="absolute inset-0 animate-shimmer" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)` }} />
                </div>

                {/* Card body */}
                <div className={`relative p-5 transition-colors duration-300 ${
                  isSelected ? "bg-[rgba(255,255,255,0.06)]" : "bg-[rgba(255,255,255,0.025)] group-hover:bg-[rgba(255,255,255,0.045)]"
                }`}>
                  {/* Top row: badge + date */}
                  <div className="flex items-center justify-between mb-3">
                    <DomainBadge domain={entry.domain} />
                    <span className="text-[10px] text-zinc-600 font-mono tabular-nums">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>

                  {/* Content: text + radar */}
                  <div className="flex gap-4 mb-4">
                    <p className="text-[13px] text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors duration-300 flex-1 line-clamp-3">
                      {truncated}
                    </p>
                    <ScoreRadar before={entry.original_score} after={entry.boosted_score} accent={dc.accent} size={64} />
                  </div>

                  {/* Bottom: arc gauge + delta + status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Mini arc gauge */}
                      <svg width="40" height="24" viewBox="0 0 40 24" className="shrink-0">
                        {/* Track */}
                        <path d="M 4 22 A 18 18 0 0 1 36 22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round" />
                        {/* Fill */}
                        <path
                          d="M 4 22 A 18 18 0 0 1 36 22"
                          fill="none"
                          stroke={dc.accent}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${scorePercent * 0.52} 100`}
                          style={{ filter: `drop-shadow(0 0 4px ${dc.accent}60)` }}
                        />
                        {/* Score text */}
                        <text x="20" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="800" fontFamily="ui-monospace, monospace">
                          {entry.boosted_score?.total ?? '?'}
                        </text>
                      </svg>
                      {delta !== null && delta > 0 && (
                        <span className="text-[10px] font-mono font-bold" style={{ color: dc.accent, textShadow: `0 0 6px ${dc.accent}40` }}>+{delta}</span>
                      )}
                    </div>

                    {/* Status badge */}
                    {entry.chosen && (
                      <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase ${
                        entry.chosen === "boosted" ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" :
                        entry.chosen === "refined" ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" :
                        "bg-zinc-500/10 text-zinc-500 ring-1 ring-zinc-500/20"
                      }`}>
                        {entry.chosen === "boosted" ? "Used" : entry.chosen === "refined" ? "Edited" : "Skip"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom border glow on hover */}
                <div
                  className="h-px w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${dc.accent}40, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Side drawer */}
      {selectedEntry && (
        <BoostDrawer
          entry={selectedEntry}
          onClose={() => setSelectedId(null)}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
      <HistoryContent />
    </Suspense>
  );
}
