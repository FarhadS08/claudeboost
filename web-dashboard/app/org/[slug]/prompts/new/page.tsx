"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Zap,
  FileText,
  ScrollText,
  ArrowLeft,
  Save,
  Eye,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, DOMAINS } from "@/lib/constants";

const TYPES = [
  { value: "boost", label: "Saved Boost", desc: "A boosted/enhanced prompt worth saving", icon: Zap, color: "border-primary/40 bg-primary/5" },
  { value: "template", label: "Template", desc: "Reusable prompt with {{variables}}", icon: FileText, color: "border-amber-400/40 bg-amber-400/5" },
  { value: "constraint", label: "Constraint Doc", desc: "Company context or standards document", icon: ScrollText, color: "border-emerald-400/40 bg-emerald-400/5" },
];

export default function CreatePromptPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [type, setType] = useState("boost");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [domain, setDomain] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Extract variables from template content
  const variables: string[] = [];
  if (type === "template") {
    const matches = content.matchAll(/\{\{(\w+)\}\}/g);
    for (const match of matches) {
      if (!variables.includes(match[1])) variables.push(match[1]);
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    setSaving(true);
    setError("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch(`/api/org/${slug}/prompts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: title.trim(), content, domain: domain || null, tags }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    const prompt = await res.json();
    router.push(`/org/${slug}/prompts/${prompt.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Prompt</h1>
          <p className="text-sm text-zinc-500">Save a prompt to your organization library</p>
        </div>
      </div>

      {/* Type selector */}
      <div>
        <label className="text-xs text-zinc-500 block mb-2">Type</label>
        <div className="grid grid-cols-3 gap-3">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                type === t.value ? t.color : "border-border hover:border-zinc-600"
              )}
            >
              <t.icon className="w-5 h-5 mb-2" />
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1.5">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., API Endpoint Generator, Code Review Checklist"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-black/20 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-zinc-700"
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-zinc-500">
            {type === "template" ? "Template (use {{variable}} for placeholders)" : "Content"}
          </label>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400"
          >
            {showPreview ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>

        {showPreview ? (
          <div className="w-full min-h-[240px] rounded-xl border border-border bg-black/20 p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {content || <span className="text-zinc-700">Nothing to preview</span>}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === "template"
                ? "Analyze the {{dataset}} table for {{metric}} trends over the last {{timeframe}}.\n\nContext: We're using {{database}} with {{framework}}.\n\nOutput: {{format}} with key insights."
                : type === "constraint"
                  ? "Enter your constraint document, style guide, or architecture notes..."
                  : "Paste your boosted prompt here..."
            }
            className="w-full h-60 rounded-xl border border-border bg-black/20 p-4 text-sm font-mono
                       text-zinc-300 placeholder:text-zinc-700
                       focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        )}
      </div>

      {/* Detected variables */}
      {type === "template" && variables.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="text-xs text-amber-400 font-medium mb-2">
            Detected Variables ({variables.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <span
                key={v}
                className="text-xs font-mono px-2 py-1 rounded-lg bg-amber-400/10 text-amber-300"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Domain + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 block mb-1.5">Domain (optional)</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-black/20 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 text-zinc-400"
          >
            <option value="">No domain</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1.5">Tags (comma-separated)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="api, backend, review"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-black/20 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !content.trim()}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
            title.trim() && content.trim()
              ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save to Library"}
        </button>
      </div>
    </div>
  );
}
