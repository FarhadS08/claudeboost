"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ScrollText,
  Save,
  Check,
  Globe,
  Code,
  Database,
  BarChart3,
  FileText,
  Server,
  HelpCircle,
  Beaker,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgRule } from "@/lib/types";
import { DOMAIN_LABELS, DOMAIN_COLORS } from "@/lib/constants";

const DOMAIN_ICONS: Record<string, typeof Globe> = {
  _global: Globe,
  data_science: Beaker,
  data_engineering: Database,
  business_analytics: BarChart3,
  general_coding: Code,
  documentation: FileText,
  devops: Server,
  other: HelpCircle,
};

const DOMAIN_ORDER = [
  "_global",
  "general_coding",
  "data_science",
  "data_engineering",
  "business_analytics",
  "documentation",
  "devops",
  "other",
];

const RULE_PLACEHOLDERS: Record<string, string> = {
  _global:
    "Rules that apply to ALL domains.\n\nExample:\n- Always use TypeScript, never plain JavaScript\n- Follow REST API naming: /api/v1/{resource}\n- All code must pass ESLint with our shared config\n- Use Zod for input validation at API boundaries\n- Never hardcode secrets — use env vars",
  general_coding:
    "Example:\n- Use our internal component library @acme/ui\n- Follow the repository pattern for data access\n- All PRs need at least one unit test\n- Use conventional commits format",
  data_science:
    "Example:\n- Always use our standard feature store for features\n- Models must be registered in MLflow before deployment\n- Include SHAP explanations for all classification models",
  data_engineering:
    "Example:\n- All pipelines must be idempotent\n- Use dbt for transformations, Airflow for orchestration\n- Data must be available by 06:00 UTC SLA",
  business_analytics:
    "Example:\n- Use our standard metric definitions from the data dictionary\n- Always include comparison to prior period\n- Executive summaries limited to 3 bullet points",
  documentation:
    "Example:\n- Use our markdown template for API docs\n- Include request/response examples for every endpoint\n- Target audience: senior engineers",
  devops:
    "Example:\n- Always run terraform plan before apply\n- All deploys go through staging first\n- Include rollback steps in every runbook",
  other: "Example:\n- Add any domain-agnostic rules here",
};

export default function OrgRulesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [rules, setRules] = useState<OrgRule[]>([]);
  const [activeDomain, setActiveDomain] = useState("_global");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/org/${slug}/rules`)
      .then((r) => r.json())
      .then((data: OrgRule[]) => {
        setRules(data);
        const texts: Record<string, string> = {};
        data.forEach((r) => { texts[r.domain] = r.rule_text; });
        setEditedTexts(texts);
      });
  }, [slug]);

  const activeRule = rules.find((r) => r.domain === activeDomain);
  const currentText = editedTexts[activeDomain] ?? "";
  const hasChanges = activeRule ? currentText !== activeRule.rule_text : currentText !== "";

  const saveRule = async () => {
    setSaving(true);
    await fetch(`/api/org/${slug}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: activeDomain,
        rule_text: currentText,
        enabled: activeRule?.enabled ?? true,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Update local state
    setRules((prev) =>
      prev.map((r) =>
        r.domain === activeDomain ? { ...r, rule_text: currentText } : r
      )
    );
  };

  const toggleEnabled = async (domain: string) => {
    const rule = rules.find((r) => r.domain === domain);
    if (!rule) return;
    const newEnabled = !rule.enabled;

    await fetch(`/api/org/${slug}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, rule_text: rule.rule_text, enabled: newEnabled }),
    });

    setRules((prev) =>
      prev.map((r) => (r.domain === domain ? { ...r, enabled: newEnabled } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-primary" />
          Organization Rules
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Define rules that will be injected into every prompt enhancement for your team.
          Global rules apply to all domains. Domain-specific rules extend the base playbook.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Domain tabs (vertical) */}
        <div className="w-52 shrink-0 space-y-1">
          {DOMAIN_ORDER.map((domain) => {
            const Icon = DOMAIN_ICONS[domain] || HelpCircle;
            const isActive = activeDomain === domain;
            const rule = rules.find((r) => r.domain === domain);
            const hasContent = !!rule?.rule_text;
            const domainColor = domain === "_global" ? null : DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS];

            return (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">
                  {domain === "_global"
                    ? "Global Rules"
                    : DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS] || domain}
                </span>
                {hasContent && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: domainColor?.accent || "hsl(263, 70%, 58%)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Editor */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">
                {activeDomain === "_global"
                  ? "Global Rules"
                  : DOMAIN_LABELS[activeDomain as keyof typeof DOMAIN_LABELS] || activeDomain}
              </h3>
              {activeRule && (
                <button
                  onClick={() => toggleEnabled(activeDomain)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {activeRule.enabled ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-zinc-600" />
                  )}
                  {activeRule.enabled ? "Enabled" : "Disabled"}
                </button>
              )}
            </div>

            <button
              onClick={saveRule}
              disabled={!hasChanges || saving}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all",
                hasChanges
                  ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
                  : saved
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              {saving ? (
                "Saving..."
              ) : saved ? (
                <>
                  <Check className="w-3 h-3" /> Saved
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" /> Save
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <textarea
              value={currentText}
              onChange={(e) =>
                setEditedTexts((prev) => ({ ...prev, [activeDomain]: e.target.value }))
              }
              placeholder={RULE_PLACEHOLDERS[activeDomain] || "Enter rules for this domain..."}
              className={cn(
                "w-full h-80 rounded-xl border bg-black/20 p-4 text-sm font-mono",
                "text-zinc-300 placeholder:text-zinc-700",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30",
                "resize-none transition-all",
                activeRule?.enabled === false && "opacity-50"
              )}
            />
            {activeDomain === "_global" && (
              <div className="absolute bottom-3 right-3 text-[10px] text-zinc-700 font-mono">
                Applied to all domains
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-600">
            {activeDomain === "_global"
              ? "These rules are prepended to every domain's enhancement prompt. Use for org-wide standards."
              : "These rules extend the base playbook for this domain. They are combined with global rules during enhancement."}
          </p>
        </div>
      </div>
    </div>
  );
}
