"use client";

import { usePolling } from "@/hooks/usePolling";
import { HistoryEntry, ScoreBreakdown } from "@/lib/types";
import {
  DIMENSION_NAMES,
  LEVEL_LABELS,
  LEVEL_COLORS,
} from "@/lib/constants";
import { DomainBadge } from "@/components/DomainBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { InfoTooltip } from "@/components/InfoTooltip";
import { useRouter } from "next/navigation";

const LEVEL_BAR_COLORS: Record<number, string> = {
  1: "bg-red-400",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-emerald-400",
  5: "bg-cyan-400",
};

export default function StatsPage() {
  const { data: history, loading } = usePolling<HistoryEntry[]>("/api/history");
  const router = useRouter();

  const entries = history ?? [];

  // ── Section 1: Boost Acceptance Rate ─────────────────────────────────────
  const decidedEntries = entries.filter((e) => e.chosen !== null);
  const boostedEntries = decidedEntries.filter((e) => e.chosen === "boosted");
  const acceptanceRate =
    decidedEntries.length > 0
      ? (boostedEntries.length / decidedEntries.length) * 100
      : null;

  // ── Section 2: Average Rating by Domain ──────────────────────────────────
  const domainRatings: Record<string, { sum: number; count: number }> = {};
  for (const e of entries) {
    if (e.rating !== null) {
      if (!domainRatings[e.domain]) domainRatings[e.domain] = { sum: 0, count: 0 };
      domainRatings[e.domain].sum += e.rating;
      domainRatings[e.domain].count += 1;
    }
  }
  const domainAvgRatings = Object.entries(domainRatings)
    .map(([domain, { sum, count }]) => ({ domain, avg: sum / count }))
    .sort((a, b) => b.avg - a.avg);

  // ── Section 3: Score Improvement Histogram ───────────────────────────────
  const scoredEntries = entries.filter(
    (e) => e.original_score?.total != null && e.boosted_score?.total != null
  );
  const dimensions = Object.keys(DIMENSION_NAMES);
  type DimKey = keyof ScoreBreakdown["dimensions"];
  const dimAverages = dimensions.map((dim) => {
    const key = dim as DimKey;
    const beforeValues = scoredEntries.map((e) => e.original_score?.dimensions?.[key] ?? 0);
    const afterValues = scoredEntries.map((e) => e.boosted_score?.dimensions?.[key] ?? 0);
    const avgBefore =
      beforeValues.length > 0
        ? beforeValues.reduce((a, b) => a + b, 0) / beforeValues.length
        : 0;
    const avgAfter =
      afterValues.length > 0
        ? afterValues.reduce((a, b) => a + b, 0) / afterValues.length
        : 0;
    return { dim, label: DIMENSION_NAMES[dim], avgBefore, avgAfter };
  });

  // ── Section 4: ROI Metrics ────────────────────────────────────────────────
  const avgScoreLift =
    scoredEntries.length > 0
      ? scoredEntries.reduce(
          (sum, e) => sum + ((e.boosted_score?.total ?? 0) - (e.original_score?.total ?? 0)),
          0
        ) / scoredEntries.length
      : null;

  const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const e of scoredEntries) {
    const lvl = e.boosted_score?.level ?? 0;
    if (lvl >= 1 && lvl <= 5) levelCounts[lvl] = (levelCounts[lvl] ?? 0) + 1;
  }
  const maxLevelCount = Math.max(...Object.values(levelCounts), 1);

  const boostSuccessRate =
    scoredEntries.length > 0
      ? (scoredEntries.filter(
          (e) => (e.boosted_score?.total ?? 0) > (e.original_score?.total ?? 0)
        ).length /
          scoredEntries.length) *
        100
      : null;

  const avgDimsImproved =
    scoredEntries.length > 0
      ? scoredEntries.reduce((sum, e) => {
          const improved = dimensions.filter(
            (dim) =>
              (e.boosted_score?.dimensions?.[dim as DimKey] ?? 0) >
              (e.original_score?.dimensions?.[dim as DimKey] ?? 0)
          ).length;
          return sum + improved;
        }, 0) / scoredEntries.length
      : null;

  // ── Section 5: Feedback Coverage ─────────────────────────────────────────
  const withFeedback = entries.filter(
    (e) => e.rating !== null || (e.feedback && e.feedback.trim().length > 0)
  ).length;
  const feedbackPct =
    entries.length > 0 ? (withFeedback / entries.length) * 100 : 0;
  // SVG donut params
  const R = 30;
  const C = 2 * Math.PI * R;
  const dash = (feedbackPct / 100) * C;

  // ── Section 6: Daily Activity ─────────────────────────────────────────────
  const today = new Date();
  const last7: { label: string; date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    last7.push({ label, date: iso, count: 0 });
  }
  for (const e of entries) {
    const date = e.timestamp.slice(0, 10);
    const slot = last7.find((s) => s.date === date);
    if (slot) slot.count += 1;
  }
  const maxCount = Math.max(...last7.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm animate-pulse">Loading stats…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Stats</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evaluation metrics for your prompt boosts
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Section 1: Boost Acceptance Rate ─────────────────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "0ms" }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
            Boost Acceptance Rate
            <InfoTooltip text="How often you chose the boosted version over your original prompt. Only counts prompts where you made an explicit choice (Use boosted or Keep original)." />
          </h2>
          {decidedEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex items-center gap-6">
              <span className="text-5xl font-bold text-primary tabular-nums">
                {acceptanceRate!.toFixed(0)}%
              </span>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${acceptanceRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {boostedEntries.length} of {decidedEntries.length} decided prompts chose the
                  boosted version
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 1.5: Boosts by Domain (all entries) ─────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "40ms" }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
            Boosts by Domain
            <InfoTooltip text="Total number of prompts boosted in each domain. ClaudeBoost auto-classifies prompts into 7 domains. Click a bar to filter History by that domain." />
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const counts: Record<string, number> = {};
                for (const e of entries) counts[e.domain] = (counts[e.domain] ?? 0) + 1;
                const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                const maxDomainCount = Math.max(...sorted.map(([, c]) => c), 1);
                return sorted.map(([domain, count]) => (
                  <div key={domain} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/?domain=${domain}`)}>
                    <div className="w-36 shrink-0">
                      <DomainBadge domain={domain as Parameters<typeof DomainBadge>[0]["domain"]} />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${(count / maxDomainCount) * 100}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
                      {count}
                    </span>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* ── Section 2: Average Rating by Domain ──────────────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
            Average Rating by Domain
            <InfoTooltip text="Average star rating (1-5) you gave to boosted prompts, grouped by domain. Rate boosts in the History page by expanding a card and using the feedback form." />
          </h2>
          {domainAvgRatings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {domainAvgRatings.map(({ domain, avg }) => (
                <div key={domain} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/?domain=${domain}`)}>
                  <div className="w-36 shrink-0">
                    <DomainBadge domain={domain as Parameters<typeof DomainBadge>[0]["domain"]} />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(avg / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-14 text-right">
                    {avg.toFixed(1)} ★
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: Score Improvement Histogram ───────────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                Score Improvement — Before vs After
                <InfoTooltip text="Each prompt is scored across 6 dimensions (1-5 each): Specificity, Verification, Context, Constraints, Structure, and Output. Gray bars show the average original score, green bars show the average boosted score. Higher is better." />
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on {scoredEntries.length} of {entries.length} boosts with scoring data
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded bg-zinc-500/40 mr-1 align-middle" />
              Before ·{" "}
              <span className="inline-block w-3 h-3 rounded bg-emerald-500 mr-1 align-middle" />
              After
            </span>
          </div>
          {scoredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {dimAverages.map(({ dim, label, avgBefore, avgAfter }) => (
                <ScoreBar
                  key={dim}
                  label={label}
                  before={parseFloat(avgBefore.toFixed(2))}
                  after={parseFloat(avgAfter.toFixed(2))}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Section 4: ROI Metrics ────────────────────────────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
            ROI Metrics
            <InfoTooltip text="Return on Investment metrics. Avg Score Lift = how many points the boost adds (out of 30). Quality Level Distribution = how many boosts reach each quality tier (L1=Unacceptable to L5=Enterprise). Success Rate = % of boosts that improved the score. Dims Improved = how many of the 6 dimensions got better per boost." />
          </h2>
          {scoredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Avg Score Lift */}
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg Score Lift</p>
                <p className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {avgScoreLift !== null
                    ? `${avgScoreLift >= 0 ? "+" : ""}${avgScoreLift.toFixed(1)}`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">points (total score)</p>
              </div>

              {/* Card 2: Quality Level Distribution */}
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Quality Level Distribution</p>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((lvl) => (
                    <div key={lvl} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => levelCounts[lvl] > 0 && router.push(`/?level=${lvl}`)}>
                      <span
                        className={`text-xs w-20 shrink-0 ${LEVEL_COLORS[lvl]}`}
                      >
                        L{lvl} {LEVEL_LABELS[lvl]}
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${LEVEL_BAR_COLORS[lvl]}`}
                          style={{
                            width: `${(levelCounts[lvl] / maxLevelCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-4 text-right tabular-nums">
                        {levelCounts[lvl]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Boost Success Rate */}
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Boost Success Rate</p>
                <p className="text-3xl font-bold text-primary tabular-nums">
                  {boostSuccessRate !== null ? `${boostSuccessRate.toFixed(0)}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of entries where boosted score &gt; original
                </p>
              </div>

              {/* Card 4: Avg Dimensions Improved */}
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg Dimensions Improved</p>
                <p className="text-3xl font-bold text-secondary tabular-nums">
                  {avgDimsImproved !== null ? avgDimsImproved.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {dimensions.length} dimensions per boost
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 5: Feedback Coverage ─────────────────────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "240ms" }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
            Feedback Coverage
            <InfoTooltip text="Percentage of boosted prompts where you left a star rating or text feedback. Higher coverage means ClaudeBoost learns your preferences better and tailors future boosts to your style." />
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex items-center gap-8">
              {/* SVG Donut */}
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeDasharray={`${dash} ${C}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="44"
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize="13"
                  fontWeight="700"
                  fill="currentColor"
                >
                  {feedbackPct.toFixed(0)}%
                </text>
              </svg>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {withFeedback}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    of {entries.length}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">prompts have feedback</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 6: Daily Activity — Last 7 Days ──────────────────────── */}
        <div
          className="bg-card border border-border rounded-lg p-6 animate-fade-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
            Daily Activity — Last 7 Days
            <InfoTooltip text="Number of prompts boosted each day over the past week. Tracks your ClaudeBoost usage pattern." />
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-28">
              {last7.map(({ label, count }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {count > 0 ? count : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "72px" }}>
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
