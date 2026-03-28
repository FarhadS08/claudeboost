import { useState } from "react";
import { MOCK_HISTORY, HistoryEntry } from "@/lib/data";
import HistoryCard from "@/components/HistoryCard";

const HistoryPage = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>(MOCK_HISTORY);

  const totalBoosts = entries.length;
  const rated = entries.filter((e) => e.rating !== null);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";

  const domainCounts: Record<string, number> = {};
  entries.forEach((e) => {
    domainCounts[e.domain] = (domainCounts[e.domain] || 0) + 1;
  });
  const topDomain =
    entries.length > 0
      ? Object.entries(domainCounts)
          .sort((a, b) => b[1] - a[1])[0][0]
          .replace(/_/g, " ")
      : "—";

  const handleUpdate = (id: number, updates: Partial<HistoryEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-20 pb-12">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { value: totalBoosts.toString(), label: "Total Boosts" },
          { value: avgRating, label: "Avg Rating" },
          { value: topDomain, label: "Top Domain" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-5 animate-fade-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="font-display text-3xl font-bold text-secondary">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* History list */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-4xl mb-4">⚡</span>
          <h2 className="font-display text-lg text-foreground mb-2">No boosts yet</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Use the boost_prompt tool in Claude Code to enhance your first prompt.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              index={i}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
