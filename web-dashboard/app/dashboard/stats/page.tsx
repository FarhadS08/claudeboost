"use client";

import { useState } from "react";
import { usePolling } from "@/hooks/usePolling";
import { HistoryEntry, ScoreBreakdown } from "@/lib/types";
import {
  DIMENSION_NAMES,
  LEVEL_LABELS,
  LEVEL_COLORS,
  DOMAIN_COLORS,
} from "@/lib/constants";
import { Domain } from "@/lib/types";
import { DomainBadge } from "@/components/DomainBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { InfoTooltip } from "@/components/InfoTooltip";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ScoreRadar } from "@/components/ScoreRadar";
import { useRouter } from "next/navigation";

const LEVEL_BAR_COLORS: Record<number, string> = {
  1: "bg-red-400",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-primary",
  5: "bg-violet-400",
};

function HowItWorksSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[rgba(124,58,237,0.04)] to-transparent border border-[rgba(124,58,237,0.1)] rounded-2xl overflow-hidden animate-fade-slide-up">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-7 text-left flex items-center justify-between hover:bg-[rgba(124,58,237,0.04)] transition-all duration-300"
      >
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary flex items-center gap-2">
            🧠 How ClaudeBoost Learns From You
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your feedback creates a reinforcement loop that improves future boosts
          </p>
        </div>
        <span className="text-muted-foreground text-sm">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* RLHF Loop Diagram */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-5 border border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-4">
              The Feedback Loop (RLHF)
            </h3>
            <div className="flex items-center justify-between gap-2 text-center">
              {[
                { icon: "📝", label: "You write\na prompt", color: "text-zinc-300" },
                { icon: "→", label: "", color: "text-zinc-600" },
                { icon: "⚡", label: "ClaudeBoost\nenhances it", color: "text-primary" },
                { icon: "→", label: "", color: "text-zinc-600" },
                { icon: "⭐", label: "You rate &\ngive feedback", color: "text-amber-400" },
                { icon: "→", label: "", color: "text-zinc-600" },
                { icon: "🧠", label: "Feedback shapes\nnext boost", color: "text-primary" },
              ].map((step, i) => (
                <div key={i} className={`${step.color} ${step.label ? "flex-1" : "shrink-0"}`}>
                  <div className="text-2xl">{step.icon}</div>
                  {step.label && (
                    <p className="text-[10px] mt-1 whitespace-pre-line leading-tight">{step.label}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              This is <span className="text-primary font-medium">Reinforcement Learning from Human Feedback (RLHF)</span>.
              Every time you rate a boost or leave feedback like &quot;always use PyTorch&quot; or &quot;keep it shorter&quot;,
              ClaudeBoost stores your preferences. On the next boost in that domain, it loads your last 5 feedback entries
              + your domain constraints are injected into the enhancement prompt. The AI learns your style over time.
            </p>
          </div>

          {/* How Each Metric Is Calculated */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-5 border border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-4">
              How Each Metric Is Calculated
            </h3>
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div>
                <p className="font-medium text-zinc-200 mb-1">📊 Boost Acceptance Rate</p>
                <p className="text-muted-foreground">
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                    (boosts where you chose &quot;Use boosted&quot;) ÷ (boosts where you made any choice) × 100
                  </code>
                </p>
                <p className="text-muted-foreground mt-1">
                  High acceptance = boosts are useful. Low acceptance = adjust your boost level or add domain constraints.
                </p>
              </div>

              <div>
                <p className="font-medium text-zinc-200 mb-1">🎯 Score Improvement (6 Dimensions)</p>
                <p className="text-muted-foreground">
                  Each prompt is automatically scored 1-5 on six dimensions before and after boosting:
                </p>
                <ul className="text-muted-foreground mt-1 space-y-0.5 ml-3">
                  <li>• <span className="text-zinc-300">Specificity</span> — Are files, functions, and behaviors named?</li>
                  <li>• <span className="text-zinc-300">Verification</span> — Are tests, checks, or success criteria defined?</li>
                  <li>• <span className="text-zinc-300">Context</span> — Are relevant files, patterns, and history referenced?</li>
                  <li>• <span className="text-zinc-300">Constraints</span> — Are boundaries and non-goals stated?</li>
                  <li>• <span className="text-zinc-300">Structure</span> — Is it organized with sections and numbered steps?</li>
                  <li>• <span className="text-zinc-300">Output</span> — Are deliverables, formats, and artifacts specified?</li>
                </ul>
                <p className="text-muted-foreground mt-1">
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                    Total score = sum of all 6 dimensions (max 30)
                  </code>
                  {" "}Scoring is automated — no API calls, pure text analysis.
                </p>
              </div>

              <div>
                <p className="font-medium text-zinc-200 mb-1">📈 ROI Metrics</p>
                <ul className="text-muted-foreground space-y-1 ml-3">
                  <li>• <span className="text-zinc-300">Avg Score Lift</span> — <code className="bg-zinc-800 px-1 py-0.5 rounded text-[10px]">avg(boosted_score - original_score)</code> across all scored boosts</li>
                  <li>• <span className="text-zinc-300">Quality Levels</span> — L1 (&lt;1.5 avg) = Unacceptable, L2 = Needs Work, L3 = Acceptable, L4 = Production, L5 (&gt;4.5) = Enterprise</li>
                  <li>• <span className="text-zinc-300">Success Rate</span> — <code className="bg-zinc-800 px-1 py-0.5 rounded text-[10px]">% of boosts where boosted_total &gt; original_total</code></li>
                  <li>• <span className="text-zinc-300">Dims Improved</span> — avg count of dimensions that scored higher after boosting</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-zinc-200 mb-1">⭐ Ratings & Feedback</p>
                <p className="text-muted-foreground">
                  When you rate a boost (1-5 stars) or add text feedback in the History page, that data is stored in
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] mx-1">~/.claudeboost/history.json</code>.
                  Next time ClaudeBoost enhances a prompt in the same domain, it loads your <span className="text-zinc-300">last 5 feedback entries</span> +
                  your <span className="text-zinc-300">domain constraints</span> (set in the Constraints page) and injects them into the AI prompt.
                  This means: the more feedback you give, the more personalized your boosts become.
                </p>
              </div>

              <div>
                <p className="font-medium text-zinc-200 mb-1">🔄 Feedback Coverage</p>
                <p className="text-muted-foreground">
                  <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                    (boosts with rating or text feedback) ÷ (total boosts) × 100
                  </code>
                </p>
                <p className="text-muted-foreground mt-1">
                  Aim for &gt;50% coverage. The more you rate, the better ClaudeBoost understands your preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Boost Levels Explanation */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-5 border border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-3">
              Boost Levels & Scoring Targets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { level: "Light", target: "Level 3 (15+/30)", desc: "Fixes dimensions scoring 1-2 only. Clarifies and structures. Stays close to your original." },
                { level: "Medium", target: "Level 4 (21+/30)", desc: "Fixes dimensions below 3. Adds verification, constraints, and structure. Balanced default." },
                { level: "Full", target: "Level 5 (27+/30)", desc: "Pushes all dimensions to max. Full enterprise playbook with anti-patterns, metrics, and criteria." },
              ].map((l) => (
                <div key={l.level} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 border border-[rgba(255,255,255,0.05)]">
                  <p className="text-xs font-semibold text-zinc-200">{l.level}</p>
                  <p className="text-[10px] text-primary mt-0.5">{l.target}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{l.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const R = 38;
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

  // ── Radar data ────────────────────────────────────────────────────────────
  const avgBeforeBreakdown = {
    dimensions: Object.fromEntries(dimAverages.map(d => [d.dim, d.avgBefore])) as any,
    total: dimAverages.reduce((s, d) => s + d.avgBefore, 0),
    average: 0,
    level: 0,
  } as ScoreBreakdown;

  const avgAfterBreakdown = {
    dimensions: Object.fromEntries(dimAverages.map(d => [d.dim, d.avgAfter])) as any,
    total: dimAverages.reduce((s, d) => s + d.avgAfter, 0),
    average: 0,
    level: 0,
  } as ScoreBreakdown;

  // ── Insights ──────────────────────────────────────────────────────────────
  const strongestDim = dimAverages.length > 0
    ? dimAverages.reduce((best, d) => d.avgAfter > best.avgAfter ? d : best, dimAverages[0])
    : null;
  const weakestDim = dimAverages.length > 0
    ? dimAverages.reduce((worst, d) => d.avgAfter < worst.avgAfter ? d : worst, dimAverages[0])
    : null;
  const mostImprovedDim = dimAverages.length > 0
    ? dimAverages.reduce((best, d) => (d.avgAfter - d.avgBefore) > (best.avgAfter - best.avgBefore) ? d : best, dimAverages[0])
    : null;

  // ── Domain counts for donut ───────────────────────────────────────────────
  const domainCounts: Record<string, number> = {};
  for (const e of entries) domainCounts[e.domain] = (domainCounts[e.domain] ?? 0) + 1;
  const sortedDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);

  // ── Average rating ────────────────────────────────────────────────────────
  const ratedEntries = entries.filter((e) => e.rating !== null);
  const avgRating = ratedEntries.length > 0
    ? ratedEntries.reduce((s, e) => s + (e.rating ?? 0), 0) / ratedEntries.length
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm animate-pulse">Loading stats...</p>
      </div>
    );
  }

  // ── Donut SVG helpers ─────────────────────────────────────────────────────
  const donutR = 52;
  const donutC = 2 * Math.PI * donutR;
  const totalDomainEntries = entries.length || 1;

  // Level stacked bar total
  const totalLevelCounted = Object.values(levelCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ── Section 1: Header ──────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-slide-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Stats</h1>
        <p className="text-zinc-500 mt-2 text-[15px]">Your prompt enhancement analytics</p>
      </div>

      {/* ── Section 2: Hero Score Overview ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Card 1 — Score Lift */}
        <div
          className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl p-6 hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "60ms" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">Score Lift</p>
          {avgScoreLift !== null ? (
            <AnimatedNumber
              value={avgScoreLift}
              decimals={1}
              prefix="+"
              className="text-5xl font-black font-mono tabular-nums text-emerald-400"
              style={{ textShadow: "0 0 40px rgba(16,185,129,0.35)" }}
            />
          ) : (
            <span className="text-5xl font-black font-mono tabular-nums text-zinc-600">--</span>
          )}
          <p className="text-xs text-zinc-500 mt-2">avg improvement per boost</p>
        </div>

        {/* Card 2 — Acceptance Rate */}
        <div
          className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl p-6 hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">Acceptance Rate</p>
          {acceptanceRate !== null ? (
            <AnimatedNumber
              value={acceptanceRate}
              decimals={0}
              suffix="%"
              className="text-5xl font-black font-mono tabular-nums text-purple-400"
              style={{ textShadow: "0 0 40px rgba(124,58,237,0.35)" }}
            />
          ) : (
            <span className="text-5xl font-black font-mono tabular-nums text-zinc-600">--</span>
          )}
          <p className="text-xs text-zinc-500 mt-2">prompts boosted</p>
        </div>

        {/* Card 3 — Total Boosts */}
        <div
          className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl p-6 hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">Total Boosts</p>
          <AnimatedNumber
            value={entries.length}
            className="text-5xl font-black font-mono tabular-nums text-white"
            style={{ textShadow: "0 0 40px rgba(124,58,237,0.35)" }}
          />
          <p className="text-xs text-zinc-500 mt-2">prompts enhanced</p>
        </div>
      </div>

      {/* ── Section 3: Radar + Insights ──────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* LEFT: Radar + Score Bars */}
        <div
          className="flex-[3] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "240ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            Score Improvement Radar
          </h2>
          {scoredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No scoring data yet</p>
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <ScoreRadar
                  before={avgBeforeBreakdown}
                  after={avgAfterBreakdown}
                  size={200}
                  showLabels
                  accent="#7c3aed"
                />
              </div>
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
            </>
          )}
        </div>

        {/* RIGHT: Insights */}
        <div
          className="flex-[2] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            Insights
          </h2>
          {scoredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No scoring data yet</p>
          ) : (
            <div className="space-y-5">
              {/* Strongest */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-sm">&#9650;</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Strongest Dimension</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-0.5">{strongestDim?.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{strongestDim?.avgAfter.toFixed(1)} / 5 avg</p>
                </div>
              </div>

              {/* Weakest */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-400 text-sm">&#9660;</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Weakest Dimension</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-0.5">{weakestDim?.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{weakestDim?.avgAfter.toFixed(1)} / 5 avg</p>
                </div>
              </div>

              {/* Most Improved */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-purple-400 text-sm">&#9733;</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Most Improved</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-0.5">{mostImprovedDim?.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    +{((mostImprovedDim?.avgAfter ?? 0) - (mostImprovedDim?.avgBefore ?? 0)).toFixed(1)} improvement
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[rgba(255,255,255,0.06)]" />

              {/* Quick stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Success Rate</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {boostSuccessRate !== null ? `${boostSuccessRate.toFixed(0)}%` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Avg Dims Improved</span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {avgDimsImproved !== null ? `${avgDimsImproved.toFixed(1)} / 6` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Scored Boosts</span>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {scoredEntries.length} of {entries.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4: Analytics Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* Card 1 — Domain Distribution (Donut) */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "360ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            Domain Distribution
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
                {(() => {
                  let offset = 0;
                  return sortedDomains.map(([domain, count]) => {
                    const dc = DOMAIN_COLORS[domain as Domain] || DOMAIN_COLORS.other;
                    const pct = count / totalDomainEntries;
                    const segDash = pct * donutC;
                    const segOffset = -offset * donutC - donutC * 0.25; // rotate -90deg
                    offset += pct;
                    return (
                      <circle
                        key={domain}
                        cx="70"
                        cy="70"
                        r={donutR}
                        fill="none"
                        stroke={dc.accent}
                        strokeWidth="14"
                        strokeDasharray={`${segDash} ${donutC - segDash}`}
                        strokeDashoffset={-segOffset}
                        className="transition-all duration-700"
                        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                      />
                    );
                  });
                })()}
                <text
                  x="70"
                  y="74"
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize="20"
                  fontWeight="900"
                  fontFamily="ui-monospace, monospace"
                  fill="currentColor"
                >
                  {entries.length}
                </text>
              </svg>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                {sortedDomains.map(([domain, count]) => (
                  <div
                    key={domain}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/dashboard?domain=${domain}`)}
                  >
                    <DomainBadge domain={domain as Domain} />
                    <span className="text-xs font-mono tabular-nums text-zinc-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2 — Weekly Activity */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "420ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            Weekly Activity
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex items-end justify-center gap-3 pt-4">
              {last7.map(({ label, count }) => {
                const intensity = count / maxCount;
                return (
                  <div key={label} className="group relative flex flex-col items-center gap-2">
                    {/* Hover tooltip */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <span className="bg-zinc-800 text-zinc-200 text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap border border-[rgba(255,255,255,0.08)]">
                        {count} boost{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: count === 0
                          ? "rgba(255,255,255,0.03)"
                          : `rgba(124,58,237,${0.15 + intensity * 0.65})`,
                        boxShadow: count > 0
                          ? `0 0 ${8 + intensity * 16}px rgba(124,58,237,${intensity * 0.3})`
                          : undefined,
                      }}
                    />
                    <span className="text-[10px] text-zinc-600 font-mono">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card 3 — Quality Levels */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "480ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            Quality Levels
          </h2>
          {scoredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div>
              {/* Stacked bar */}
              <div className="h-6 rounded-full overflow-hidden flex bg-[rgba(255,255,255,0.04)]">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const pct = (levelCounts[lvl] / totalLevelCounted) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={lvl}
                      className={`${LEVEL_BAR_COLORS[lvl]} transition-all duration-500 cursor-pointer hover:brightness-110`}
                      style={{ width: `${pct}%` }}
                      onClick={() => levelCounts[lvl] > 0 && router.push(`/dashboard?level=${lvl}`)}
                      title={`L${lvl} ${LEVEL_LABELS[lvl]}: ${levelCounts[lvl]}`}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
                {[5, 4, 3, 2, 1].map((lvl) => (
                  <div
                    key={lvl}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => levelCounts[lvl] > 0 && router.push(`/dashboard?level=${lvl}`)}
                  >
                    <div className={`w-2.5 h-2.5 rounded-sm ${LEVEL_BAR_COLORS[lvl]}`} />
                    <span className={`text-[10px] ${LEVEL_COLORS[lvl]}`}>
                      L{lvl} {LEVEL_LABELS[lvl]}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-zinc-500">{levelCounts[lvl]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 4 — Feedback & Rating */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "540ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            Feedback & Rating
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">Feedback Coverage</p>
                <AnimatedNumber
                  value={feedbackPct}
                  decimals={0}
                  suffix="%"
                  className="text-4xl font-black font-mono tabular-nums text-purple-400"
                  style={{ textShadow: "0 0 30px rgba(124,58,237,0.3)" }}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">Average Rating</p>
                {avgRating !== null ? (
                  <span className="text-4xl font-black font-mono tabular-nums text-amber-400" style={{ textShadow: "0 0 30px rgba(245,158,11,0.3)" }}>
                    {avgRating.toFixed(1)} <span className="text-lg">&#9733;</span>
                  </span>
                ) : (
                  <span className="text-4xl font-black font-mono tabular-nums text-zinc-600">--</span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {ratedEntries.length} of {entries.length} prompts rated
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 5: How ClaudeBoost Learns ────────────────────────── */}
      <HowItWorksSection />
    </div>
  );
}
