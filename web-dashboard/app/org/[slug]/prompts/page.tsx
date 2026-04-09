"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Plus,
  Zap,
  FileText,
  ScrollText,
  X,
  GitBranch,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, DOMAIN_COLORS } from "@/lib/constants";
import type { Domain, PromptEntry } from "@/lib/types";

const TYPE_CONFIG = {
  boost: { label: "Boost", icon: Zap, color: "text-primary bg-primary/10" },
  template: { label: "Template", icon: FileText, color: "text-amber-400 bg-amber-400/10" },
  constraint: { label: "Constraint", icon: ScrollText, color: "text-emerald-400 bg-emerald-400/10" },
};

export default function PromptsLibraryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);

  const loadPrompts = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (domainFilter) params.set("domain", domainFilter);
    if (search) params.set("search", search);

    fetch(`/api/org/${slug}/prompts?${params}`)
      .then((r) => r.json())
      .then((data) => { setPrompts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadPrompts(); }, [slug, typeFilter, domainFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(loadPrompts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const domains = [...new Set(prompts.map((p) => p.domain).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Prompt Library
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} in your organization
          </p>
        </div>
        <button
          onClick={() => router.push(`/org/${slug}/prompts/new`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium
                     shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Prompt
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-black/20 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-zinc-700"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-zinc-600" />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              !typeFilter ? "bg-primary/10 text-primary" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            All
          </button>
          {(["boost", "template", "constraint"] as const).map((t) => {
            const config = TYPE_CONFIG[t];
            const Icon = config.icon;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                  typeFilter === t ? "bg-primary/10 text-primary" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && prompts.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border bg-card">
          <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-400">
            {search || typeFilter ? "No matching prompts" : "No prompts yet"}
          </h3>
          <p className="text-xs text-zinc-600 mt-1">
            {search || typeFilter
              ? "Try adjusting your filters."
              : "Save boosted prompts, create templates, or add constraint documents."}
          </p>
          {!search && !typeFilter && (
            <button
              onClick={() => router.push(`/org/${slug}/prompts/new`)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Create your first prompt
            </button>
          )}
        </div>
      )}

      {/* Prompt cards */}
      {!loading && (
        <div className="space-y-2">
          {prompts.map((prompt) => {
            const typeConf = TYPE_CONFIG[prompt.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.boost;
            const TypeIcon = typeConf.icon;
            const dc = prompt.domain ? DOMAIN_COLORS[prompt.domain as Domain] : null;

            return (
              <button
                key={prompt.id}
                onClick={() => router.push(`/org/${slug}/prompts/${prompt.id}`)}
                className="w-full text-left p-4 rounded-xl border border-border bg-card
                           hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", typeConf.color)}>
                    <TypeIcon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                        {prompt.title}
                      </h3>
                      {prompt.domain && dc && (
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", dc.bg, dc.text)}>
                          {DOMAIN_LABELS[prompt.domain as Domain]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {prompt.content.slice(0, 150)}{prompt.content.length > 150 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {prompt.tags?.length > 0 && prompt.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="shrink-0 text-right space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                      <GitBranch className="w-3 h-3" />
                      v{prompt.version}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                      <Clock className="w-3 h-3" />
                      {new Date(prompt.updated_at).toLocaleDateString(undefined, {
                        month: "short", day: "numeric",
                      })}
                    </div>
                    {prompt.author_email && (
                      <div className="text-[10px] text-zinc-700 truncate max-w-[100px]">
                        {prompt.author_name || prompt.author_email.split("@")[0]}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
