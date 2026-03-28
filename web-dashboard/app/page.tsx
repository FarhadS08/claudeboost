"use client";

import { usePolling } from "@/hooks/usePolling";
import { HistoryEntry, Domain } from "@/lib/types";
import { DOMAIN_LABELS, DOMAINS, DOMAIN_COLORS } from "@/lib/constants";
import { HistoryCard } from "@/components/HistoryCard";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

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

  const clearFilter = () => router.push("/");
  const setFilter = (key: string, value: string) => router.push(`/?${key}=${value}`);

  // Apply filters
  const filtered = (history ?? []).filter((e) => {
    if (filterDomain && e.domain !== filterDomain) return false;
    if (filterLevel && e.boosted_score?.level !== Number(filterLevel)) return false;
    return true;
  });

  // Compute stats from full history
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
        <p className="text-muted-foreground text-sm animate-pulse">Loading history…</p>
      </div>
    );
  }

  const hasFilter = filterDomain || filterLevel;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-bold text-2xl">History</h1>
        <p className="text-muted-foreground text-sm mt-1">Your prompt boost history</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-3xl font-bold text-primary">{totalBoosts}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Boosts</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-3xl font-bold text-emerald-400">
            {avgScoreLift !== null ? `+${avgScoreLift.toFixed(1)}` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Score Lift</p>
        </div>

        <div
          className="bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => topDomain && setFilter("domain", topDomain)}
        >
          <p className="text-3xl font-bold text-primary">
            {topDomain ? DOMAIN_LABELS[topDomain] : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Top Domain · click to filter</p>
        </div>
      </div>

      {/* Active filter bar */}
      {hasFilter && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm text-primary">
            Filtering by: {filterDomain && `domain = ${DOMAIN_LABELS[filterDomain]}`}
            {filterLevel && `level = ${filterLevel}`}
          </span>
          <button
            onClick={clearFilter}
            className="ml-auto text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-700"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Domain quick filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => filterDomain === d ? clearFilter() : setFilter("domain", d)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
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
        <p className="text-muted-foreground text-sm text-center py-12">
          {hasFilter
            ? "No boosts match this filter"
            : "No boosts yet — use /boost in Claude Code to get started"}
        </p>
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground text-sm animate-pulse">Loading…</p></div>}>
      <HistoryContent />
    </Suspense>
  );
}
