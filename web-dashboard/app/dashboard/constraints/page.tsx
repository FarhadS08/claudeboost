"use client";

import { useState, useEffect } from "react";
import { usePolling } from "@/hooks/usePolling";
import { Settings, Constraints, Domain } from "@/lib/types";
import { DOMAINS } from "@/lib/constants";
import { DomainBadge } from "@/components/DomainBadge";
import { Textarea } from "@/components/ui/textarea";

export default function ConstraintsPage() {
  // ── Section 1: Boost Settings ─────────────────────────────────────────────
  const { data: settings, refetch: refetchSettings } =
    usePolling<Settings>("/api/settings");

  async function updateSettings(patch: Partial<Settings>) {
    if (!settings) return;
    const updated: Settings = { ...settings, ...patch };
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    await refetchSettings();
  }

  // ── Section 2: Domain Constraints ────────────────────────────────────────
  const { data: remoteConstraints } = usePolling<Constraints>("/api/constraints");

  const emptyConstraints = (): Constraints =>
    Object.fromEntries(DOMAINS.map((d) => [d, ""])) as Constraints;

  const [localConstraints, setLocalConstraints] = useState<Constraints>(
    emptyConstraints()
  );
  const [saved, setSaved] = useState(false);

  // Sync remote → local on first load (don't overwrite user edits on poll)
  useEffect(() => {
    if (remoteConstraints) {
      setLocalConstraints(remoteConstraints);
    }
  }, [remoteConstraints]);

  function handleConstraintChange(domain: Domain, value: string) {
    setLocalConstraints((prev) => ({ ...prev, [domain]: value }));
  }

  async function saveConstraints() {
    await fetch("/api/constraints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localConstraints),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const BOOST_LEVELS: Settings["boost_level"][] = ["light", "medium", "full"];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Constraints</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure boost behaviour and per-domain rules
        </p>
      </div>

      {/* ── Section 1: Boost Settings ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          Boost Settings
        </h2>

        {/* Boost Level */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2">Boost Level</p>
          <div className="flex gap-2">
            {BOOST_LEVELS.map((level) => {
              const isActive = settings?.boost_level === level;
              return (
                <button
                  key={level}
                  onClick={() => updateSettings({ boost_level: level })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-Boost toggle */}
        <div>
          <p className="text-sm font-medium mb-2">Auto-Boost</p>
          <button
            onClick={() =>
              updateSettings({ auto_boost: !settings?.auto_boost })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              settings?.auto_boost
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Auto-Boost: {settings?.auto_boost ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* ── Section 2: Domain Constraints ──────────────────────────────────── */}
      <div>
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Domain Constraints
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set rules that ClaudeBoost will always apply when enhancing prompts
            in each domain.
          </p>
        </div>

        <div className="space-y-4">
          {DOMAINS.map((domain) => (
            <div
              key={domain}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="mb-3">
                <DomainBadge domain={domain} />
              </div>
              <Textarea
                value={localConstraints[domain] ?? ""}
                onChange={(e) => handleConstraintChange(domain, e.target.value)}
                placeholder="e.g. Always use Python. Never use pandas. Output as markdown table."
                className="min-h-[80px] bg-background"
              />
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={saveConstraints}
            className="bg-primary text-primary-foreground hover:bg-primary/80 px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Save All Constraints
          </button>
          {saved && (
            <span className="text-sm text-emerald-400 font-medium">
              Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
