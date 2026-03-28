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
        <h1 className="font-bold text-2xl">History</h1>
        <p className="text-muted-foreground text-sm mt-1">Your prompt boost history</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tabular-nums">{totalBoosts}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Boosts</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {avgScoreLift !== null ? `+${avgScoreLift.toFixed(1)}` : "\u2014"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg Score Lift</p>
          </div>
        </div>

        <div
          className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => topDomain && setFilter("domain", topDomain)}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              {topDomain ? DOMAIN_LABELS[topDomain] : "\u2014"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Top Domain</p>
          </div>
        </div>
      </div>

      {/* Active filter bar */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-primary/5 border border-primary/15 rounded-xl">
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
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => filterDomain === d ? clearFilter() : setFilter("domain", d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filterDomain === d
                ? "bg-primary text-primary-foreground border-primary"
                : `${DOMAIN_COLORS[d]} hover:opacity-80`
            }`}
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {hasFilter
              ? "No boosts match this filter"
              : "No boosts yet \u2014 use /boost in Claude Code to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
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
