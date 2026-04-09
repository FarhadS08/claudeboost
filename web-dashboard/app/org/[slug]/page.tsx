"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  Check,
  Key,
  ScrollText,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Terminal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/AnimatedNumber";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  boost_level: string;
  has_api_key: boolean;
  has_anthropic_key: boolean;
  member_count: number;
  boost_count: number;
  role: string;
}

interface ApiKeyData {
  key: string;
  prefix: string;
}

export default function OrgOverviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [org, setOrg] = useState<OrgData | null>(null);
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/org/${slug}`).then((r) => r.json()).then(setOrg);
  }, [slug]);

  const generateApiKey = async () => {
    setGeneratingKey(true);
    const res = await fetch(`/api/org/${slug}/api-keys`, { method: "POST" });
    const data = await res.json();
    setApiKey(data);
    setGeneratingKey(false);
    // Refresh org data
    fetch(`/api/org/${slug}`).then((r) => r.json()).then(setOrg);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!org) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const mcpJson = `{
  "mcpServers": {
    "claudeboost": {
      "url": "https://claudeboost.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer ${apiKey?.key || "cb_org_<your-key>"}"
      }
    }
  }
}`;

  const setupSteps = [
    {
      num: 1,
      title: "Add Anthropic API Key",
      description: "Your org's API key for Claude API calls",
      done: org.has_anthropic_key,
      href: `/org/${slug}/settings`,
      icon: Key,
    },
    {
      num: 2,
      title: "Define Org Rules",
      description: "Set domain-specific rules for your team",
      done: false, // We'd need to check if any rule_text is non-empty
      href: `/org/${slug}/rules`,
      icon: ScrollText,
    },
    {
      num: 3,
      title: "Generate MCP Key",
      description: apiKey ? "Key generated — copy it below!" : org.has_api_key ? "Key exists — generate a new one if needed" : "Create API key for .mcp.json",
      done: org.has_api_key,
      action: generateApiKey,
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Enterprise prompt enhancement for your team
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Boosts",
            value: org.boost_count,
            icon: Zap,
            gradient: "from-primary/20 to-primary/5",
            accent: "text-primary",
          },
          {
            label: "Team Members",
            value: org.member_count,
            icon: Users,
            gradient: "from-emerald-500/20 to-emerald-500/5",
            accent: "text-emerald-400",
          },
          {
            label: "Boost Level",
            value: null,
            display: org.boost_level.charAt(0).toUpperCase() + org.boost_level.slice(1),
            icon: Sparkles,
            gradient: "from-amber-500/20 to-amber-500/5",
            accent: "text-amber-400",
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
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            {stat.value !== null ? (
              <AnimatedNumber
                value={stat.value}
                className={cn("text-3xl font-bold tabular-nums", stat.accent)}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            ) : (
              <span
                className={cn("text-3xl font-bold", stat.accent)}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {stat.display}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Setup Guide */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          Quick Setup
        </h2>

        <div className="space-y-3">
          {setupSteps.map((step) => (
            <div
              key={step.num}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                step.done
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border bg-background hover:border-primary/20"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                  step.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-primary/10 text-primary"
                )}
              >
                {step.done ? <Check className="w-4 h-4" /> : step.num}
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-zinc-500">{step.description}</div>
              </div>

              {step.href && !step.done && (
                <a
                  href={step.href}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </a>
              )}

              {step.action && (
                <button
                  onClick={step.action}
                  disabled={generatingKey}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {generatingKey ? "Generating..." : step.done ? "Generate New" : "Generate"}{" "}
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {step.done && !step.action && (
                <span className="text-xs text-emerald-400 font-medium">Done</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generated API Key (shown once) */}
      {apiKey && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">
              API Key Generated — Save it now!
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mb-3">
            This key is shown only once. Copy it now for your .mcp.json file.
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-xs bg-black/40 rounded-lg px-3 py-2 font-mono text-amber-300 break-all"
            >
              {apiKey.key}
            </code>
            <button
              onClick={() => copyToClipboard(apiKey.key, "key")}
              className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              {copied === "key" ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* .mcp.json snippet */}
      <div className="rounded-2xl border border-border bg-card p-6">
        {!apiKey && org.has_api_key && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
            <Key className="w-3.5 h-3.5 shrink-0" />
            You have an existing key but it was only shown once. Click &quot;Generate New&quot; above to create a fresh key and see it in the snippet below.
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <code className="text-primary text-sm">.mcp.json</code>
            <span className="text-zinc-500 text-sm font-normal">— Add to your repo root</span>
          </h2>
          <button
            onClick={() => copyToClipboard(mcpJson, "mcp")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              copied === "mcp"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {copied === "mcp" ? (
              <>
                <Check className="w-3 h-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>
        </div>

        <pre className="text-xs bg-black/40 rounded-xl p-4 overflow-x-auto font-mono text-zinc-300 leading-relaxed">
          {mcpJson}
        </pre>

        <p className="text-xs text-zinc-600 mt-3">
          Developers who clone a repo with this file will auto-connect to ClaudeBoost. Zero install required.
        </p>
      </div>
    </div>
  );
}
