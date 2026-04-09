"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Search,
  X,
  Zap,
  TrendingUp,
  Crown,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, DOMAINS, DOMAIN_COLORS, DIMENSION_NAMES } from "@/lib/constants";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ScoreRadar } from "@/components/ScoreRadar";
import type { Domain, HistoryEntry } from "@/lib/types";

/* ── Section icons for boosted text ──────────────────────────────────── */
const SECTION_META: Record<string, { icon: string; color: string }> = {
  context: { icon: "\ud83c\udfaf", color: "#3b82f6" },
  goal: { icon: "\ud83c\udfaf", color: "#3b82f6" },
  "context & goal": { icon: "\ud83c\udfaf", color: "#3b82f6" },
  task: { icon: "\u2699\ufe0f", color: "#f59e0b" },
  verification: { icon: "\u2705", color: "#10b981" },
  constraints: { icon: "\ud83d\udee1\ufe0f", color: "#ef4444" },
  output: { icon: "\ud83d\udce6", color: "#8b5cf6" },
  "output format": { icon: "\ud83d\udce6", color: "#8b5cf6" },
};

function BoostedText({ text, accent }: { text: string; accent?: string }) {
  const lines = text.split("\n");
  const sections: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const headerMatch = trimmed.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
    if (headerMatch && !trimmed.match(/^\d+\./)) {
      const potentialTitle = headerMatch[1].toLowerCase().replace(/:$/, "");
      const isSection = Object.keys(SECTION_META).some((k) => potentialTitle.includes(k)) || !headerMatch[2];
      if (isSection) {
        if (current) sections.push(current);
        current = { title: headerMatch[1].replace(/:$/, ""), content: [] };
        if (headerMatch[2] && headerMatch[2] !== ":") current.content.push(headerMatch[2]);
        continue;
      }
    }
    if (!current) current = { title: "", content: [] };
    current.content.push(trimmed);
  }
  if (current) sections.push(current);

  return (
    <div className="space-y-4">
      {sections.map((section, si) => {
        const meta = section.title ? SECTION_META[section.title.toLowerCase().replace(/:$/, "")] : null;
        return (
          <div key={si}>
            {section.title && meta && (
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px]" style={{ backgroundColor: `${meta.color}15` }}>
                  {meta.icon}
                </div>
                <span className="text-[13px] font-bold text-white tracking-wide">{section.title}</span>
                <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(90deg, ${meta.color}20, transparent)` }} />
              </div>
            )}
            <div className={section.title ? "pl-8" : ""}>
              {section.content.map((line, li) => {
                const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
                if (numMatch) {
                  return (
                    <div key={li} className="relative pl-7 py-1">
                      {li < section.content.length - 1 && (
                        <div className="absolute left-[9px] top-[22px] bottom-0 w-px" style={{ backgroundColor: accent ? `${accent}20` : "rgba(255,255,255,0.06)" }} />
                      )}
                      <div className="absolute left-0 w-[19px] h-[19px] rounded-full border-2 flex items-center justify-center mt-0.5" style={{ borderColor: accent || "#71717a", backgroundColor: `${accent || "#71717a"}15` }}>
                        <span className="text-[8px] font-bold" style={{ color: accent || "#71717a" }}>{numMatch[1]}</span>
                      </div>
                      <p className="text-[13px] text-zinc-300 leading-relaxed">
                        {numMatch[2].split(/\*\*(.+?)\*\*/g).map((part, j) =>
                          j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : <span key={j}>{part}</span>
                        )}
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={li} className="text-[13px] text-zinc-300 leading-relaxed py-0.5">
                    {line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
                      j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : <span key={j}>{part}</span>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Side Drawer ─────────────────────────────────────────────────────── */
function BoostDrawer({ entry, onClose }: { entry: HistoryEntry; onClose: () => void }) {
  const [view, setView] = useState<"boosted" | "original">("boosted");
  const [copied, setCopied] = useState(false);
  const dc = DOMAIN_COLORS[entry.domain] || DOMAIN_COLORS.other;
  const hasScores = entry.original_score?.total != null && entry.boosted_score?.total != null;
  const scoreDelta = hasScores ? (entry.boosted_score?.total ?? 0) - (entry.original_score?.total ?? 0) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[75%] lg:w-[58%] sm:max-w-[720px] bg-[#08090f] border-l border-[rgba(255,255,255,0.08)] z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#08090f]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-lg", dc.bg, dc.text)}>
              {DOMAIN_LABELS[entry.domain]}
            </span>
            <span className="text-[11px] text-zinc-600 font-mono">
              {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-6 sm:space-y-8">
          {/* Toggle + Score + Copy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-[rgba(255,255,255,0.04)] rounded-xl p-1 border border-[rgba(255,255,255,0.06)]">
              <button
                onClick={() => setView("original")}
                className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200",
                  view === "original" ? "bg-[rgba(255,255,255,0.08)] text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Original
                {entry.original_score && <span className="ml-1.5 text-zinc-600 font-mono">{entry.original_score.total}</span>}
              </button>
              <button
                onClick={() => setView("boosted")}
                className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200",
                  view === "boosted" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
                style={view === "boosted" ? { backgroundColor: `${dc.accent}20`, color: dc.accent } : undefined}
              >
                Boosted
                {entry.boosted_score && <span className="ml-1.5 font-mono" style={{ opacity: 0.6 }}>{entry.boosted_score.total}</span>}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {hasScores && scoreDelta !== null && scoreDelta > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg" style={{ color: dc.accent, backgroundColor: `${dc.accent}12` }}>
                  +{scoreDelta} pts
                </span>
              )}
              {view === "boosted" && (
                <button
                  onClick={() => { navigator.clipboard.writeText(entry.boosted); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide border transition-all duration-200"
                  style={{
                    borderColor: copied ? "rgba(16,185,129,0.3)" : `${dc.accent}30`,
                    color: copied ? "#10b981" : dc.accent,
                    backgroundColor: copied ? "rgba(16,185,129,0.08)" : `${dc.accent}08`,
                  }}
                >
                  {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {view === "original" ? (
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-5 sm:p-6 border border-[rgba(255,255,255,0.05)]">
              <p className="text-[14px] text-zinc-400 leading-[1.8]">{entry.original}</p>
            </div>
          ) : (
            <div className="rounded-xl p-5 sm:p-6 border text-[14px] leading-[1.8]" style={{ background: `${dc.accent}06`, borderColor: `${dc.accent}12` }}>
              <BoostedText text={entry.boosted} accent={dc.accent} />
            </div>
          )}

          {/* Radar + Dimension Scores */}
          {entry.original_score && entry.boosted_score && (
            <div>
              {/* Large interactive radar */}
              <div className="flex items-center justify-center mb-6">
                <ScoreRadar before={entry.original_score} after={entry.boosted_score} accent={dc.accent} size={140} showLabels interactive />
              </div>
              <div className="flex items-center justify-center gap-6 mb-6 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block bg-white/10 border border-white/15" /> Before</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ backgroundColor: dc.accent }} /> After</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 block mb-4">Dimension Scores</span>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(entry.boosted_score.dimensions).map(([dim, after]) => {
                  const before = (entry.original_score?.dimensions as Record<string, number>)?.[dim] ?? 0;
                  const delta = (after as number) - before;
                  return (
                    <div key={dim} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                      <span className="text-[11px] text-zinc-500">{DIMENSION_NAMES[dim] || dim}</span>
                      <span className="font-mono text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <span className="text-zinc-600">{before}</span>
                        <span className="text-zinc-700 mx-1">{"\u2192"}</span>
                        <span className="text-zinc-300 font-bold">{after as number}</span>
                        {delta > 0 && <span className="ml-1.5" style={{ color: dc.accent }}>+{delta}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function OrgHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState<Domain | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/org/${slug}/history`)
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const filtered = entries.filter((e) => {
    if (filterDomain && e.domain !== filterDomain) return false;
    if (search && !e.original.toLowerCase().includes(search.toLowerCase()) && !e.boosted?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBoosts = entries.length;
  const scoredEntries = entries.filter((e) => e.original_score?.total != null && e.boosted_score?.total != null);
  const avgLift = scoredEntries.length > 0
    ? scoredEntries.reduce((sum, e) => sum + ((e.boosted_score?.total ?? 0) - (e.original_score?.total ?? 0)), 0) / scoredEntries.length
    : null;
  const topDomain = (() => {
    if (entries.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const e of entries) counts[e.domain] = (counts[e.domain] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Domain;
  })();
  const topDomainColor = topDomain ? (DOMAIN_COLORS[topDomain] || DOMAIN_COLORS.other).accent : "#71717a";

  const selectedEntry = filtered.find((e) => e.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-zinc-500 text-sm">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">History</h1>
        <p className="text-zinc-500 mt-2 text-[15px]">Prompt boost history across your organization</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6 hover:border-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] transition-all duration-300 animate-fade-slide-up">
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: "radial-gradient(circle at 30% 50%, #7c3aed, transparent 70%)" }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <AnimatedNumber value={totalBoosts} className="text-4xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(124,58,237,0.3)", fontFamily: "'JetBrains Mono', monospace" }} />
              <p className="text-[13px] text-zinc-500 font-medium mt-2">Total Boosts</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6 hover:border-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] transition-all duration-300 animate-fade-slide-up" style={{ animationDelay: "80ms" }}>
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: "radial-gradient(circle at 30% 50%, #10b981, transparent 70%)" }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              {avgLift !== null ? (
                <AnimatedNumber value={avgLift} prefix="+" decimals={1} className="text-4xl font-black font-mono tabular-nums tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(16,185,129,0.3)", fontFamily: "'JetBrains Mono', monospace" }} />
              ) : (
                <p className="text-4xl font-black font-mono text-white">{"\u2014"}</p>
              )}
              <p className="text-[13px] text-zinc-500 font-medium mt-2">Avg Score Lift</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6 hover:border-[rgba(255,255,255,0.12)] hover:translate-y-[-2px] transition-all duration-300 animate-fade-slide-up" style={{ animationDelay: "160ms" }}>
          <div className="absolute inset-0 opacity-20 blur-2xl" style={{ background: `radial-gradient(circle at 30% 50%, ${topDomainColor}, transparent 70%)` }} />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${topDomainColor}15` }}>
              <Crown className="w-5 h-5" style={{ color: topDomainColor }} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-white" style={{ textShadow: `0 0 40px ${topDomainColor}4D` }}>
                {topDomain ? DOMAIN_LABELS[topDomain] : "\u2014"}
              </p>
              <p className="text-[13px] text-zinc-500 font-medium mt-2">Top Domain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Domain pills */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-zinc-700"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-zinc-600" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterDomain(null)}
            className={cn("px-3.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide border transition-all whitespace-nowrap",
              !filterDomain ? "bg-primary/10 text-primary border-primary/20" : "text-zinc-600 border-transparent hover:text-zinc-400"
            )}
          >
            All ({entries.length})
          </button>
          {DOMAINS.map((d) => {
            const c = DOMAIN_COLORS[d];
            const count = entries.filter((e) => e.domain === d).length;
            if (count === 0) return null;
            return (
              <button
                key={d}
                onClick={() => setFilterDomain(filterDomain === d ? null : d)}
                className={cn("px-3.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide border transition-all whitespace-nowrap",
                  filterDomain === d ? `${c.bg} ${c.text} ${c.border}` : `${c.bg} ${c.text} border-transparent`
                )}
                style={filterDomain === d ? { boxShadow: `0 0 12px ${c.accent}30` } : undefined}
              >
                {DOMAIN_LABELS[d]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Recent Boosts</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-lg text-zinc-400 font-medium">{search || filterDomain ? "No boosts match this filter" : "No boosts yet"}</p>
          {!search && !filterDomain && <p className="text-sm text-zinc-600 mt-2">Boosts will appear here once your team starts using ClaudeBoost</p>}
        </div>
      )}

      {/* Card grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((entry, index) => {
            const dc = DOMAIN_COLORS[entry.domain] || DOMAIN_COLORS.other;
            const delta = entry.boosted_score && entry.original_score ? entry.boosted_score.total - entry.original_score.total : null;
            const isSelected = selectedId === entry.id;
            const truncated = entry.original.length > 80 ? entry.original.slice(0, 80) + "..." : entry.original;

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-fade-slide-up hover:translate-y-[-3px]",
                  isSelected ? "ring-1 ring-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)]" : "hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 20% 20%, ${dc.accent}18, transparent 65%)` }}
                />

                {/* Top accent strip with shimmer */}
                <div className="relative h-1 w-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${dc.accent}, ${dc.accent}40)` }}>
                  <div className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
                </div>

                {/* Card body */}
                <div className={cn("relative p-5 transition-colors duration-300",
                  isSelected ? "bg-[rgba(255,255,255,0.06)]" : "bg-[rgba(255,255,255,0.025)] group-hover:bg-[rgba(255,255,255,0.045)]"
                )}>
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", dc.bg, dc.text)}>
                      {DOMAIN_LABELS[entry.domain]}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {/* Content + Radar */}
                  <div className="flex gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors duration-300 line-clamp-2">
                        {truncated}
                      </p>
                      {/* Transformation line */}
                      {entry.boosted && (
                        <div className="mt-2 flex items-center gap-0 overflow-hidden h-5">
                          <span className="text-[10px] text-zinc-600 truncate max-w-[40%] shrink-0">
                            {entry.original.slice(0, 25)}
                          </span>
                          <span className="mx-1.5 text-[10px] shrink-0" style={{ color: dc.accent }}>{"\u2192"}</span>
                          <span className="text-[10px] truncate font-medium" style={{ color: dc.accent }}>
                            {entry.boosted.replace(/\*\*/g, "").slice(0, 40)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Mini radar bloom */}
                    <ScoreRadar before={entry.original_score} after={entry.boosted_score} accent={dc.accent} size={64} />
                  </div>

                  {/* Bottom: score + delta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {entry.original_score && entry.boosted_score && (
                        <span className="text-[10px] text-zinc-600 font-mono tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {entry.original_score.total}<span className="text-zinc-700 mx-1">{"\u2192"}</span><span className="font-semibold" style={{ color: dc.accent }}>{entry.boosted_score.total}</span><span className="text-zinc-700">/30</span>
                        </span>
                      )}
                      {delta !== null && delta > 0 && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: dc.accent, backgroundColor: `${dc.accent}12`, textShadow: `0 0 6px ${dc.accent}30` }}>
                          +{delta}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom border glow */}
                <div
                  className="h-px w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${dc.accent}40, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Side drawer */}
      {selectedEntry && (
        <BoostDrawer entry={selectedEntry} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
