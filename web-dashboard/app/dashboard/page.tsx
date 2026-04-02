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
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
      </div>
    );
  }

  const hasFilter = filterDomain || filterLevel;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-2">Your prompt boost history</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="rounded-2xl bg-card border border-border p-7 hover:border-primary/20 transition-colors animate-fade-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-5xl font-bold tabular-nums text-primary">{totalBoosts}</p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Total Boosts</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-7 hover:border-primary/20 transition-colors animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-5xl font-bold tabular-nums text-primary">
                {avgScoreLift !== null ? `+${avgScoreLift.toFixed(1)}` : "\u2014"}
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Avg Score Lift</p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl bg-card border border-border p-7 hover:border-primary/20 transition-colors cursor-pointer animate-fade-slide-up"
          style={{ animationDelay: "200ms" }}
          onClick={() => topDomain && setFilter("domain", topDomain)}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-5xl font-bold tabular-nums text-primary">
                {topDomain ? DOMAIN_LABELS[topDomain] : "\u2014"}
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Top Domain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter bar */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-primary/5 border border-primary/15 rounded-2xl">
          <span className="text-sm text-primary">
            Filtering by: {filterDomain && `domain = ${DOMAIN_LABELS[filterDomain]}`}
            {filterLevel && `level = ${filterLevel}`}
          </span>
          <button
            onClick={clearFilter}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-lg hover:bg-muted"
          >
            &#10005; Clear
          </button>
        </div>
      )}

      {/* Domain quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DOMAINS.map((d) => {
          const c = DOMAIN_COLORS[d] || DOMAIN_COLORS.other;
          const isActive = filterDomain === d;
          return (
            <button
              key={d}
              onClick={() => isActive ? clearFilter() : setFilter("domain", d)}
              className={`rounded-lg px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all border ${
                isActive
                  ? `${c.bg} ${c.text} ${c.border}`
                  : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {DOMAIN_LABELS[d]}
            </button>
          );
        })}
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            {hasFilter
              ? "No boosts match this filter"
              : "No boosts yet"}
          </p>
          {!hasFilter && (
            <p className="text-muted-foreground text-sm mt-2">
              Use /boost in Claude Code to get started
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            Showing {filtered.length} of {totalBoosts} boosts
          </p>
          {filtered.map((entry, index) => (
            <div
              key={entry.id}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
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
