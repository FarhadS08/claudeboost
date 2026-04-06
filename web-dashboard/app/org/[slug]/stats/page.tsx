"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  MessageSquare,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { DOMAIN_LABELS, DOMAIN_COLORS, DIMENSION_NAMES } from "@/lib/constants";
import type { Domain } from "@/lib/types";

interface OrgStats {
  total: number;
  domain_counts: Record<string, number>;
  avg_lift: number;
  acceptance_rate: number;
  dimension_stats: Array<{ dimension: string; avg_before: number; avg_after: number }>;
  daily_activity: Record<string, number>;
  level_counts: Record<string, number>;
  feedback_pct: number;
  scored_count: number;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Unacceptable",
  2: "Needs Work",
  3: "Acceptable",
  4: "Production",
  5: "Enterprise",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-red-400",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-primary",
  5: "bg-violet-400",
};

export default function OrgStatsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/org/${slug}/stats`)
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-zinc-400">No stats yet</h2>
        <p className="text-sm text-zinc-600 mt-1">
          Stats will appear once your team starts boosting prompts.
        </p>
      </div>
    );
  }

  const maxDomain = Math.max(...Object.values(stats.domain_counts), 1);
  const maxLevel = Math.max(...Object.values(stats.level_counts), 1);
  const sortedDays = Object.entries(stats.daily_activity).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDaily = Math.max(...sortedDays.map(([, v]) => v), 1);

  // Donut chart for feedback
  const R = 38;
  const C = 2 * Math.PI * R;
  const dash = (stats.feedback_pct / 100) * C;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Organization Stats
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Aggregated analytics across your entire team.
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Boosts",
            value: stats.total,
            icon: Zap,
            gradient: "from-primary/20 to-primary/5",
            accent: "text-primary",
          },
          {
            label: "Avg Score Lift",
            value: stats.avg_lift,
            suffix: " pts",
            icon: TrendingUp,
            gradient: "from-emerald-500/20 to-emerald-500/5",
            accent: "text-emerald-400",
          },
          {
            label: "Acceptance Rate",
            value: stats.acceptance_rate,
            suffix: "%",
            icon: Target,
            gradient: "from-amber-500/20 to-amber-500/5",
            accent: "text-amber-400",
          },
          {
            label: "Feedback Rate",
            value: stats.feedback_pct,
            suffix: "%",
            icon: MessageSquare,
            gradient: "from-rose-500/20 to-rose-500/5",
            accent: "text-rose-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border p-5",
              "bg-gradient-to-br",
              stat.gradient,
              "hover:border-primary/20 transition-all duration-300"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className={cn("w-4 h-4", stat.accent)} />
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <AnimatedNumber
              value={stat.value}
              suffix={stat.suffix || ""}
              decimals={stat.label === "Avg Score Lift" ? 1 : 0}
              className={cn("text-3xl font-bold tabular-nums", stat.accent)}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
        ))}
      </div>

      {/* Score improvement by dimension */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Score Improvement by Dimension
          <span className="text-xs text-zinc-600 font-normal ml-1">
            ({stats.scored_count} scored boosts)
          </span>
        </h2>
        <div className="space-y-4">
          {stats.dimension_stats.map((dim) => {
            const improvement = dim.avg_after - dim.avg_before;
            return (
              <div key={dim.dimension} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">
                    {DIMENSION_NAMES[dim.dimension] || dim.dimension}
                  </span>
                  <span className="font-mono text-zinc-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {dim.avg_before.toFixed(1)} → {dim.avg_after.toFixed(1)}
                    {improvement > 0 && (
                      <span className="text-emerald-400 ml-1.5">+{improvement.toFixed(1)}</span>
                    )}
                  </span>
                </div>
                <div className="flex gap-1 h-3">
                  <div
                    className="bg-zinc-700 rounded-l-full transition-all duration-700"
                    style={{ width: `${(dim.avg_before / 5) * 100}%` }}
                  />
                  <div
                    className="bg-primary rounded-r-full transition-all duration-700"
                    style={{ width: `${(dim.avg_after / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-[10px] text-zinc-600 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-zinc-700" /> Before boost
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-primary" /> After boost
            </div>
          </div>
        </div>
      </div>

      {/* Domain distribution + Quality levels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Domain donut/bar */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Domain Distribution</h2>
          <div className="space-y-2.5">
            {Object.entries(stats.domain_counts)
              .sort((a, b) => b[1] - a[1])
              .map(([domain, count]) => {
                const dc = DOMAIN_COLORS[domain as Domain];
                const pct = (count / stats.total) * 100;
                return (
                  <div key={domain} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: dc?.accent || "#06b6d4" }}
                        />
                        <span className="text-zinc-400">
                          {DOMAIN_LABELS[domain as Domain] || domain}
                        </span>
                      </div>
                      <span className="font-mono text-zinc-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(count / maxDomain) * 100}%`,
                          backgroundColor: dc?.accent || "#06b6d4",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Quality levels */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Quality Levels (After Boost)</h2>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((level) => {
              const count = stats.level_counts[level] || 0;
              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      L{level} {LEVEL_LABELS[level]}
                    </span>
                    <span className="font-mono text-zinc-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", LEVEL_COLORS[level])}
                      style={{ width: `${(count / maxLevel) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily activity */}
      {sortedDays.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Daily Activity (Last 30 Days)
          </h2>
          <div className="flex items-end gap-[2px] h-24">
            {sortedDays.map(([day, count]) => (
              <div
                key={day}
                className="flex-1 bg-primary/70 hover:bg-primary rounded-t transition-all group relative"
                style={{ height: `${(count / maxDaily) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-[10px] text-zinc-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {day}: {count} boosts
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600">
            <span>{sortedDays[0]?.[0]}</span>
            <span>{sortedDays[sortedDays.length - 1]?.[0]}</span>
          </div>
        </div>
      )}

      {/* Feedback coverage donut */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Feedback Coverage
        </h2>
        <div className="flex items-center gap-8">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="hsl(263, 70%, 58%)"
                strokeWidth="8"
                strokeDasharray={`${dash} ${C}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {stats.feedback_pct}%
              </span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 leading-relaxed max-w-xs">
            <p>
              Feedback coverage measures how many boosts have received ratings or text feedback from your team.
            </p>
            <p className="mt-2 text-zinc-600">
              Higher coverage = better personalization. Aim for &gt;50%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
