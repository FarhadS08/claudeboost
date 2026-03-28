"use client";

import { usePolling } from "@/hooks/usePolling";
import { HistoryEntry } from "@/lib/types";
import { DOMAIN_LABELS } from "@/lib/constants";
import { HistoryCard } from "@/components/HistoryCard";

export default function HistoryPage() {
  const { data: history, loading, refetch } = usePolling<HistoryEntry[]>("/api/history");

  const handleFeedback = async (id: number, rating: number, feedback: string) => {
    await fetch("/api/history", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rating, feedback }),
    });
    refetch();
  };

  // Compute stats
  const totalBoosts = history?.length ?? 0;

  const scoredEntries = history?.filter(
    (e) => e.original_score !== null && e.boosted_score !== null
  ) ?? [];

  const avgScoreLift =
    scoredEntries.length > 0
      ? scoredEntries.reduce(
          (sum, e) => sum + (e.boosted_score!.total - e.original_score!.total),
          0
        ) / scoredEntries.length
      : null;

  const topDomain = (() => {
    if (!history || history.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const e of history) {
      counts[e.domain] = (counts[e.domain] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as keyof typeof DOMAIN_LABELS;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm animate-pulse">Loading history…</p>
      </div>
    );
  }

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
            {avgScoreLift !== null
              ? `+${avgScoreLift.toFixed(1)}`
              : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Score Lift</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-3xl font-bold text-primary">
            {topDomain ? DOMAIN_LABELS[topDomain] : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Top Domain</p>
        </div>
      </div>

      {/* History list */}
      {!history || history.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-12">
          No boosts yet — use /boost in Claude Code to get started
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => (
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
