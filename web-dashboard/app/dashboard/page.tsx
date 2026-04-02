"use client";

import { usePolling } from "@/hooks/usePolling";
import { HistoryEntry, Domain } from "@/lib/types";
import { DOMAIN_LABELS, DOMAINS, DOMAIN_COLORS } from "@/lib/constants";
import { HistoryCard } from "@/components/HistoryCard";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Zap, TrendingUp, Crown } from "lucide-react";

function HistoryContent() {
  const { data: history, loading, refetch } = usePolling<HistoryEntry[]>("/api/history");
  const searchParams = useSearchParams();
  const router = useRouter();

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
    for (const e of history) {
      counts[e.domain] = (counts[e.domain] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Domain;
  })();

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
        {/* Total Boosts */}
        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-7 hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fade-slide-up">
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: "radial-gradient(circle at 30% 50%, #7c3aed, transparent 70%)" }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-6xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(124,58,237,0.3)" }}>{totalBoosts}</p>
              <p className="text-[13px] text-zinc-500 font-medium mt-3">Total Boosts</p>
            </div>
          </div>
        </div>

        {/* Avg Score Lift */}
        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-7 hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: "radial-gradient(circle at 30% 50%, #10b981, transparent 70%)" }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-6xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(16,185,129,0.3)" }}>
                {avgScoreLift !== null ? `+${avgScoreLift.toFixed(1)}` : "\u2014"}
              </p>
              <p className="text-[13px] text-zinc-500 font-medium mt-3">Avg Score Lift</p>
            </div>
          </div>
        </div>

        {/* Top Domain */}
        <div
          className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-7 hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] hover:translate-y-[-2px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer animate-fade-slide-up"
          style={{ animationDelay: "200ms" }}
          onClick={() => topDomain && setFilter("domain", topDomain)}
        >
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: `radial-gradient(circle at 30% 50%, ${topDomainColor}, transparent 70%)` }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${topDomainColor}15` }}>
              <Crown className="w-5 h-5" style={{ color: topDomainColor }} />
            </div>
            <div>
              <p className="text-6xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: `0 0 40px ${topDomainColor}4D` }}>
                {topDomain ? DOMAIN_LABELS[topDomain] : "\u2014"}
              </p>
              <p className="text-[13px] text-zinc-500 font-medium mt-3">Top Domain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter bar */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-[rgba(124,58,237,0.06)] border border-[rgba(124,58,237,0.15)] rounded-xl">
          <span className="text-sm text-purple-400">
            Filtering by: {filterDomain && `domain = ${DOMAIN_LABELS[filterDomain]}`}
            {filterLevel && `level = ${filterLevel}`}
          </span>
          <button
            onClick={clearFilter}
            className="ml-auto text-xs text-zinc-500 hover:text-white transition-colors px-2.5 py-1 rounded-lg"
          >
            &#10005; Clear
          </button>
        </div>
      )}

      {/* Domain quick filters */}
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
                  : "border-[rgba(255,255,255,0.06)] text-zinc-600 hover:text-zinc-400 hover:border-[rgba(255,255,255,0.1)]"
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
          <p className="text-lg text-zinc-400 font-medium">
            {hasFilter
              ? "No boosts match this filter"
              : "No boosts yet"}
          </p>
          {!hasFilter && (
            <p className="text-sm text-zinc-600 mt-2">
              Use /boost in Claude Code to get started
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 font-medium mb-2">
            Showing {filtered.length} of {totalBoosts} boosts
          </p>
          {filtered.map((entry, index) => (
            <div
              key={entry.id}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <HistoryCard entry={entry} onFeedback={handleFeedback} />
            </div>
          ))}
        </div>
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
