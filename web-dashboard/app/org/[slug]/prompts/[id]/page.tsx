"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GitBranch,
  Clock,
  Copy,
  Check,
  Edit3,
  Save,
  Trash2,
  X,
  Zap,
  FileText,
  ScrollText,
  User,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, DOMAIN_COLORS } from "@/lib/constants";
import type { Domain, PromptEntry, PromptVersion } from "@/lib/types";

const TYPE_CONFIG = {
  boost: { label: "Saved Boost", icon: Zap, color: "text-primary bg-primary/10" },
  template: { label: "Template", icon: FileText, color: "text-amber-400 bg-amber-400/10" },
  constraint: { label: "Constraint Doc", icon: ScrollText, color: "text-emerald-400 bg-emerald-400/10" },
};

/* ── Simple line-level diff ──────────────────────────────────────────── */
interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  let i = m, j = n;
  const stack: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({ type: "same", text: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", text: newLines[j - 1] });
      j--;
    } else {
      stack.push({ type: "removed", text: oldLines[i - 1] });
      i--;
    }
  }

  return stack.reverse();
}

/* ── Diff View Component ─────────────────────────────────────────────── */
function DiffView({ oldText, newText, accent }: { oldText: string; newText: string; accent: string }) {
  const lines = computeDiff(oldText, newText);
  const addedCount = lines.filter((l) => l.type === "added").length;
  const removedCount = lines.filter((l) => l.type === "removed").length;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Diff stats bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[rgba(255,255,255,0.02)] border-b border-border">
        <span className="text-[10px] text-zinc-500 font-mono">Changes:</span>
        {addedCount > 0 && (
          <span className="text-[10px] font-mono font-bold text-emerald-400">+{addedCount} added</span>
        )}
        {removedCount > 0 && (
          <span className="text-[10px] font-mono font-bold text-red-400">-{removedCount} removed</span>
        )}
        {addedCount === 0 && removedCount === 0 && (
          <span className="text-[10px] text-zinc-600">No changes</span>
        )}
      </div>

      {/* Diff lines */}
      <div className="text-sm font-mono leading-relaxed max-h-[500px] overflow-y-auto">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={cn(
              "px-4 py-0.5 border-l-[3px] transition-colors",
              line.type === "added" && "bg-emerald-500/6 border-l-emerald-400",
              line.type === "removed" && "bg-red-500/6 border-l-red-400",
              line.type === "same" && "border-l-transparent"
            )}
          >
            <div className="flex gap-3">
              {/* Change indicator */}
              <span
                className={cn(
                  "w-4 shrink-0 text-center text-[10px] font-bold select-none",
                  line.type === "added" && "text-emerald-400",
                  line.type === "removed" && "text-red-400",
                  line.type === "same" && "text-zinc-800"
                )}
              >
                {line.type === "added" ? "\u25B2" : line.type === "removed" ? "\u25BC" : " "}
              </span>

              {/* Content */}
              <span
                className={cn(
                  "flex-1 whitespace-pre-wrap",
                  line.type === "added" && "text-emerald-300",
                  line.type === "removed" && "text-red-300/60 line-through",
                  line.type === "same" && "text-zinc-500"
                )}
              >
                {line.text || "\u00A0"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const id = params.id as string;

  const [prompt, setPrompt] = useState<PromptEntry | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/org/${slug}/prompts/${id}`).then((r) => r.json()),
      fetch(`/api/org/${slug}/prompts/${id}/versions`).then((r) => r.json()),
    ]).then(([p, v]) => {
      setPrompt(p);
      setVersions(v);
      setEditContent(p.content);
      setEditTitle(p.title);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, id]);

  const handleSave = async () => {
    if (!changeSummary.trim()) {
      setError("Change summary required (what did you change?)");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/org/${slug}/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent, title: editTitle, change_summary: changeSummary }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    const updated = await res.json();
    setPrompt({ ...prompt!, ...updated });
    setEditing(false);
    setChangeSummary("");
    setSaving(false);
    setShowDiff(false);
    setSelectedVersion(null);

    const v = await fetch(`/api/org/${slug}/prompts/${id}/versions`).then((r) => r.json());
    setVersions(v);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this prompt and all its version history? This cannot be undone.")) return;
    await fetch(`/api/org/${slug}/prompts/${id}`, { method: "DELETE" });
    router.push(`/org/${slug}/prompts`);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(selectedVersion ? selectedVersion.content : prompt?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-card animate-pulse" />
        <div className="h-64 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  if (!prompt) {
    return <div className="text-center py-16"><p className="text-zinc-500">Prompt not found</p></div>;
  }

  const typeConf = TYPE_CONFIG[prompt.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.boost;
  const TypeIcon = typeConf.icon;
  const dc = prompt.domain ? DOMAIN_COLORS[prompt.domain as Domain] : null;
  const displayContent = selectedVersion ? selectedVersion.content : prompt.content;

  // For diff: find the previous version content
  const getPreviousContent = (): string | null => {
    if (!selectedVersion) return null;
    const prevVersion = versions.find((v) => v.version === selectedVersion.version - 1);
    return prevVersion?.content ?? null;
  };
  const previousContent = getPreviousContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push(`/org/${slug}/prompts`)} className="p-2 rounded-lg hover:bg-zinc-800/50 mt-0.5">
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <div>
            {editing ? (
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b border-primary/30 outline-none pb-1" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight">{prompt.title}</h1>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-lg flex items-center gap-1", typeConf.color)}>
                <TypeIcon className="w-3 h-3" /> {typeConf.label}
              </span>
              {prompt.domain && dc && (
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", dc.bg, dc.text)}>
                  {DOMAIN_LABELS[prompt.domain as Domain]}
                </span>
              )}
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> v{prompt.version}
              </span>
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <User className="w-3 h-3" /> {prompt.author_name || prompt.author_email?.split("@")[0] || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copyContent}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
              copied ? "bg-emerald-500/10 text-emerald-400" : "bg-card border border-border text-zinc-400 hover:text-zinc-300")}>
            {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
          {!editing && (
            <button onClick={() => { setEditing(true); setEditContent(prompt.content); setEditTitle(prompt.title); setShowDiff(false); setSelectedVersion(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}
          <button onClick={handleDelete} className="p-2 rounded-lg text-zinc-700 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {prompt.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-lg">{tag}</span>
          ))}
        </div>
      )}

      {/* Variables */}
      {prompt.type === "template" && prompt.variables?.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600">Variables:</span>
          {prompt.variables.map((v) => (
            <span key={v} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300">{`{{${v}}}`}</span>
          ))}
        </div>
      )}

      {/* Selected version banner */}
      {selectedVersion && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400">
              Viewing v{selectedVersion.version} — {selectedVersion.change_summary || "No summary"}
            </span>
            {previousContent && (
              <button
                onClick={() => setShowDiff(!showDiff)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all",
                  showDiff
                    ? "bg-primary/15 text-primary"
                    : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                <GitCompare className="w-3 h-3" />
                {showDiff ? "Hide Diff" : "Show Changes"}
              </button>
            )}
          </div>
          <button onClick={() => { setSelectedVersion(null); setShowDiff(false); }} className="text-xs text-zinc-500 hover:text-zinc-300">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Content */}
        <div>
          {editing ? (
            <div className="space-y-3">
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-80 rounded-xl border border-primary/20 bg-black/20 p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Change summary (required)</label>
                <input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="e.g., Added error handling section, Fixed variable names"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-zinc-700" />
              </div>
              {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setEditing(false); setError(""); }}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-zinc-400 hover:text-zinc-300">Cancel</button>
                <button onClick={handleSave} disabled={saving || !changeSummary.trim()}
                  className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all",
                    changeSummary.trim() ? "bg-primary text-white shadow-lg shadow-primary/25" : "bg-zinc-800 text-zinc-500 cursor-not-allowed")}>
                  <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save as v" + (prompt.version + 1)}
                </button>
              </div>
            </div>
          ) : showDiff && selectedVersion && previousContent ? (
            <DiffView
              oldText={previousContent}
              newText={selectedVersion.content}
              accent={dc?.accent || "#7c3aed"}
            />
          ) : (
            <div className="rounded-xl border border-border bg-black/20 p-5 text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap min-h-[200px]">
              {displayContent}
            </div>
          )}
        </div>

        {/* Version History sidebar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" /> Version History
          </h3>

          {versions.length === 0 ? (
            <p className="text-xs text-zinc-600">No version history yet.</p>
          ) : (
            <div className="space-y-1">
              {versions.map((v, vi) => {
                const isSelected = selectedVersion?.id === v.id;
                const hasChanges = vi < versions.length - 1; // not the first version
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (isSelected) { setSelectedVersion(null); setShowDiff(false); }
                      else { setSelectedVersion(v); setShowDiff(false); }
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg transition-all",
                      isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-800/50 border border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          v{v.version}
                        </span>
                        {hasChanges && (
                          <span className="text-[9px] text-zinc-700">
                            {"\u0394"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(v.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{v.change_summary || "No summary"}</p>
                    <p className="text-[10px] text-zinc-700 mt-0.5">{v.author_name || v.author_email?.split("@")[0] || "Unknown"}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
