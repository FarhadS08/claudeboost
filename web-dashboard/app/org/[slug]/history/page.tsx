"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, DOMAIN_COLORS, DIMENSION_NAMES } from "@/lib/constants";
import type { Domain, HistoryEntry } from "@/lib/types";

export default function OrgHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Domain | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/org/${slug}/history`)
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.domain !== filter) return false;
    if (search && !e.original.toLowerCase().includes(search.toLowerCase()) && !e.boosted.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const domains = [...new Set(entries.map((e) => e.domain))].sort();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Boost History
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          All prompt enhancements across your organization.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-black/20 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                       placeholder:text-zinc-700"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-zinc-600" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === "all"
                ? "bg-primary/10 text-primary"
                : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            All ({entries.length})
          </button>
          {domains.map((domain) => {
            const dc = DOMAIN_COLORS[domain as Domain];
            const count = entries.filter((e) => e.domain === domain).length;
            return (
              <button
                key={domain}
                onClick={() => setFilter(domain as Domain)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                  filter === domain
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: dc?.accent }}
                />
                {DOMAIN_LABELS[domain as Domain]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border bg-card">
          <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-400">
            {entries.length === 0 ? "No boosts yet" : "No matching boosts"}
          </h3>
          <p className="text-xs text-zinc-600 mt-1">
            {entries.length === 0
              ? "Boosts will appear here once your team starts using ClaudeBoost."
              : "Try adjusting your filters."}
          </p>
        </div>
      )}

      {/* History list */}
      <div className="space-y-2">
        {filtered.map((entry) => {
          const dc = DOMAIN_COLORS[entry.domain];
          const isExpanded = expandedId === entry.id;
          const scoreDelta = entry.boosted_score && entry.original_score
            ? entry.boosted_score.total - entry.original_score.total
            : null;

          return (
            <div
              key={entry.id}
              className={cn(
                "rounded-xl border bg-card overflow-hidden transition-all",
                isExpanded ? "border-primary/20" : "border-border hover:border-zinc-700"
              )}
            >
              {/* Row header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                {/* Domain color strip */}
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: dc?.accent || "#06b6d4" }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">{entry.original}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn("text-[10px] font-medium", dc?.text)}>
                      {DOMAIN_LABELS[entry.domain]}
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 shrink-0">
                  {entry.original_score && (
                    <span className="text-xs font-mono text-zinc-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {entry.original_score.total}
                    </span>
                  )}
                  {scoreDelta !== null && (
                    <>
                      <ArrowRight className="w-3 h-3 text-zinc-700" />
                      <span className="text-xs font-mono text-zinc-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {entry.boosted_score?.total}
                      </span>
                      <span className={cn(
                        "text-xs font-mono font-bold",
                        scoreDelta > 0 ? "text-emerald-400" : "text-zinc-600"
                      )} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                      </span>
                    </>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  {/* Before/After comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Original</div>
                      <div className="text-xs text-zinc-400 bg-black/20 rounded-lg p-3 max-h-40 overflow-y-auto leading-relaxed">
                        {entry.original}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-primary mb-2">Boosted</div>
                      <div className="text-xs text-zinc-300 bg-primary/5 border border-primary/10 rounded-lg p-3 max-h-40 overflow-y-auto leading-relaxed">
                        {entry.boosted}
                      </div>
                    </div>
                  </div>

                  {/* Dimension scores */}
                  {entry.original_score && entry.boosted_score && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Dimension Scores</div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(entry.boosted_score.dimensions).map(([dim, after]) => {
                          const before = (entry.original_score?.dimensions as Record<string, number>)?.[dim] ?? 0;
                          const delta = (after as number) - before;
                          return (
                            <div key={dim} className="flex items-center justify-between text-xs bg-black/20 rounded-lg px-3 py-2">
                              <span className="text-zinc-500">
                                {DIMENSION_NAMES[dim] || dim}
                              </span>
                              <span className="font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                <span className="text-zinc-600">{before}</span>
                                <span className="text-zinc-700 mx-1">→</span>
                                <span className="text-zinc-300">{after as number}</span>
                                {delta > 0 && (
                                  <span className="text-emerald-400 ml-1">+{delta}</span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
