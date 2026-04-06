"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Settings,
  Key,
  Save,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgSettings {
  name: string;
  slug: string;
  boost_level: string;
  has_anthropic_key: boolean;
}

export default function OrgSettingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [org, setOrg] = useState<OrgSettings | null>(null);
  const [name, setName] = useState("");
  const [boostLevel, setBoostLevel] = useState("medium");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/org/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setOrg(data);
        setName(data.name);
        setBoostLevel(data.boost_level);
      });
  }, [slug]);

  const saveSettings = async (field: string, value: string) => {
    setSaving(true);
    const body: Record<string, string> = {};

    if (field === "name") body.name = value;
    if (field === "boost_level") body.boost_level = value;
    if (field === "api_key") body.anthropic_api_key = value;

    await fetch(`/api/org/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    setSaved(field);
    setTimeout(() => setSaved(null), 2000);

    if (field === "api_key") {
      setOrg((prev) => prev ? { ...prev, has_anthropic_key: true } : null);
      setApiKey("");
    }
  };

  if (!org) {
    return <div className="h-64 rounded-2xl bg-card animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Organization Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Configure your organization's ClaudeBoost settings.
        </p>
      </div>

      {/* Org Name */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Organization Name</h3>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
          />
          <button
            onClick={() => saveSettings("name", name)}
            disabled={name === org.name || saving}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all",
              name !== org.name
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {saved === "name" ? <><Check className="w-3 h-3" /> Saved</> : <><Save className="w-3 h-3" /> Save</>}
          </button>
        </div>
      </div>

      {/* Anthropic API Key */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Anthropic API Key
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Used for Claude API calls (classification + enhancement). Stored encrypted server-side.
            </p>
          </div>
          {org.has_anthropic_key && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Check className="w-3 h-3" /> Configured
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={org.has_anthropic_key ? "••••••••••••••••••••" : "sk-ant-api03-..."}
              className="w-full rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => saveSettings("api_key", apiKey)}
            disabled={!apiKey || saving}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all",
              apiKey
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {saved === "api_key" ? <><Check className="w-3 h-3" /> Saved</> : <><Save className="w-3 h-3" /> Save</>}
          </button>
        </div>

        <div className="flex items-start gap-2 text-xs text-zinc-600">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500/50" />
          <span>
            The API key is stored encrypted and only used server-side for Claude API calls.
            It is never exposed to developers or sent to browsers.
          </span>
        </div>
      </div>

      {/* Boost Level */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Default Boost Level</h3>
        <p className="text-xs text-zinc-500">
          Sets the default enhancement intensity for all developers in this org.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "light",
              label: "Light",
              description: "Minimal cleanup, fast (~1s)",
              model: "Haiku",
            },
            {
              value: "medium",
              label: "Medium",
              description: "Structured + constraints (~3s)",
              model: "Haiku",
            },
            {
              value: "full",
              label: "Full",
              description: "Enterprise playbook (~10s)",
              model: "Sonnet",
            },
          ].map((level) => (
            <button
              key={level.value}
              onClick={() => {
                setBoostLevel(level.value);
                saveSettings("boost_level", level.value);
              }}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                boostLevel === level.value
                  ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-border hover:border-primary/20"
              )}
            >
              <div className="text-sm font-medium">{level.label}</div>
              <div className="text-xs text-zinc-500 mt-1">{level.description}</div>
              <div
                className="text-[10px] text-zinc-600 mt-2 font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {level.model}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
