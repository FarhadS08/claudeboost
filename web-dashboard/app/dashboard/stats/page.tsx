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
              ClaudeBoost stores your preferences. On the next boost in that domain, your last 5 feedback entries
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
            <div className="grid grid-cols-3 gap-3">
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
        <h1 className="text-4xl font-black tracking-tight">Stats</h1>
        <p className="text-zinc-500 mt-2 text-[15px]">
          Evaluation metrics for your prompt boosts
        </p>
      </div>

      <div className="space-y-6">
        {/* ── How ClaudeBoost Learns ──────────────────────────────────────── */}
        <HowItWorksSection />

        {/* ── Section 1: Boost Acceptance Rate ─────────────────────────────── */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "0ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center">
            Boost Acceptance Rate
            <InfoTooltip text="How often you chose the boosted version over your original prompt. Only counts prompts where you made an explicit choice (Use boosted or Keep original)." />
          </h2>
          {decidedEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex items-center gap-6">
              <span
                className="text-7xl font-black font-mono tabular-nums text-white"
                style={{ textShadow: '0 0 40px rgba(124,58,237,0.3)' }}
              >
                {acceptanceRate!.toFixed(0)}%
              </span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                    style={{ width: `${acceptanceRate}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {boostedEntries.length} of {decidedEntries.length} decided prompts chose the
                  boosted version
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 1.5: Boosts by Domain (all entries) ─────────────────── */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center">
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
                return sorted.map(([domain, count]) => {
                  const dc = DOMAIN_COLORS[domain as Domain] || DOMAIN_COLORS.other;
                  return (
                    <div key={domain} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/dashboard?domain=${domain}`)}>
                      <div className="w-36 shrink-0">
                        <DomainBadge domain={domain as Domain} />
                      </div>
                      <div className="flex-1 h-3 bg-[rgba(255,255,255,0.04)] rounded overflow-hidden">
                        <div className="h-full rounded transition-all duration-500" style={{ width: `${(count / maxDomainCount) * 100}%`, backgroundColor: dc.accent }} />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-zinc-400 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* ── Section 2: Average Rating by Domain ──────────────────────────── */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "160ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center">
            Average Rating by Domain
            <InfoTooltip text="Average star rating (1-5) you gave to boosted prompts, grouped by domain. Rate boosts in the History page by expanding a card and using the feedback form." />
          </h2>
          {domainAvgRatings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {domainAvgRatings.map(({ domain, avg }) => (
                <div key={domain} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/dashboard?domain=${domain}`)}>
                  <div className="w-36 shrink-0">
                    <DomainBadge domain={domain as Parameters<typeof DomainBadge>[0]["domain"]} />
                  </div>
                  <div className="flex-1 h-3 bg-[rgba(255,255,255,0.04)] rounded overflow-hidden">
                    <div
                      className="h-full bg-primary rounded"
                      style={{ width: `${(avg / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums text-zinc-400 w-14 text-right">
                    {avg.toFixed(1)} ★
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: Score Improvement Histogram ───────────────────────── */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 flex items-center">
                Score Improvement — Before vs After
                <InfoTooltip text="Each prompt is scored across 6 dimensions (1-5 each): Specificity, Verification, Context, Constraints, Structure, and Output. Gray bars show the average original score, green bars show the average boosted score. Higher is better." />
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Based on {scoredEntries.length} of {entries.length} boosts with scoring data
              </p>
            </div>
            <span className="text-xs text-zinc-500">
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
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "320ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center">
            ROI Metrics
            <InfoTooltip text="Return on Investment metrics. Avg Score Lift = how many points the boost adds (out of 30). Quality Level Distribution = how many boosts reach each quality tier (L1=Unacceptable to L5=Enterprise). Success Rate = % of boosts that improved the score. Dims Improved = how many of the 6 dimensions got better per boost." />
          </h2>
          {scoredEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Avg Score Lift */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-6 border border-[rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">Avg Score Lift</p>
                <p
                  className="text-5xl font-black font-mono tabular-nums text-emerald-400"
                  style={{ textShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                >
                  {avgScoreLift !== null
                    ? `${avgScoreLift >= 0 ? "+" : ""}${avgScoreLift.toFixed(1)}`
                    : "—"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">points (total score)</p>
              </div>

              {/* Card 2: Quality Level Distribution */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-6 border border-[rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-2">Quality Level Distribution</p>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((lvl) => (
                    <div key={lvl} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => levelCounts[lvl] > 0 && router.push(`/dashboard?level=${lvl}`)}>
                      <span
                        className={`text-xs w-20 shrink-0 ${LEVEL_COLORS[lvl]}`}
                      >
                        L{lvl} {LEVEL_LABELS[lvl]}
                      </span>
                      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${LEVEL_BAR_COLORS[lvl]}`}
                          style={{
                            width: `${(levelCounts[lvl] / maxLevelCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-zinc-400 w-4 text-right">
                        {levelCounts[lvl]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Boost Success Rate */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-6 border border-[rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">Boost Success Rate</p>
                <p
                  className="text-5xl font-black font-mono tabular-nums text-emerald-400"
                  style={{ textShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                >
                  {boostSuccessRate !== null ? `${boostSuccessRate.toFixed(0)}%` : "—"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  of entries where boosted score &gt; original
                </p>
              </div>

              {/* Card 4: Avg Dimensions Improved */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-6 border border-[rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">Avg Dimensions Improved</p>
                <p
                  className="text-5xl font-black font-mono tabular-nums text-purple-400"
                  style={{ textShadow: '0 0 30px rgba(124,58,237,0.3)' }}
                >
                  {avgDimsImproved !== null ? avgDimsImproved.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  of {dimensions.length} dimensions per boost
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 5: Feedback Coverage ─────────────────────────────────── */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center">
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
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={8}
                />
                <circle
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={8}
                  strokeDasharray={`${dash} ${C}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="44"
                  textAnchor="middle"
                  className="fill-foreground text-2xl font-black font-mono"
                  fontSize="14"
                  fontWeight="900"
                  fill="currentColor"
                >
                  {feedbackPct.toFixed(0)}%
                </text>
              </svg>
              <div>
                <p className="text-2xl font-black font-mono tabular-nums">
                  {withFeedback}{" "}
                  <span className="text-base font-normal text-zinc-500">
                    of {entries.length}
                  </span>
                </p>
                <p className="text-sm text-zinc-500 mt-1">prompts have feedback</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 6: Daily Activity — Last 7 Days ──────────────────────── */}
        <div
          className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-7 backdrop-blur-xl hover:border-[rgba(255,255,255,0.1)] transition-all duration-300 animate-fade-slide-up"
          style={{ animationDelay: "480ms" }}
        >
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 flex items-center">
            Daily Activity — Last 7 Days
            <InfoTooltip text="Number of prompts boosted each day over the past week. Tracks your ClaudeBoost usage pattern." />
          </h2>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-28">
              {last7.map(({ label, count }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-mono tabular-nums text-zinc-400">
                    {count > 0 ? count : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "72px" }}>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg"
                      style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? "8px" : "0" }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
