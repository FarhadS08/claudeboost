"use client";

import { useState, useEffect } from "react";
import { usePolling } from "@/hooks/usePolling";
import { Settings, Constraints, Domain } from "@/lib/types";
import { DOMAINS } from "@/lib/constants";
import { DomainBadge } from "@/components/DomainBadge";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

export default function ConstraintsPage() {
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

  const { data: remoteConstraints } = usePolling<Constraints>("/api/constraints");

  const emptyConstraints = (): Constraints =>
    Object.fromEntries(DOMAINS.map((d) => [d, ""])) as Constraints;

  const [localConstraints, setLocalConstraints] = useState<Constraints>(
    emptyConstraints()
  );
  const [saved, setSaved] = useState(false);

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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Constraints</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure boost behaviour and per-domain rules
        </p>
      </div>

      {/* Boost Settings */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
          Boost Settings
        </h2>

        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Boost Level</p>
          <div className="flex gap-2">
            {BOOST_LEVELS.map((level) => {
              const isActive = settings?.boost_level === level;
              return (
                <button
                  key={level}
                  onClick={() => updateSettings({ boost_level: level })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Auto-Boost</p>
          <button
            onClick={() =>
              updateSettings({ auto_boost: !settings?.auto_boost })
            }
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              settings?.auto_boost
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            Auto-Boost: {settings?.auto_boost ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Domain Constraints */}
      <div>
        <div className="mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="mb-3">
                <DomainBadge domain={domain} />
              </div>
              <Textarea
                value={localConstraints[domain] ?? ""}
                onChange={(e) => handleConstraintChange(domain, e.target.value)}
                placeholder="e.g. Always use Python. Never use pandas. Output as markdown table."
                className="min-h-[80px] bg-muted/30 border-border rounded-xl focus:ring-primary/50 focus:border-primary/30"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={saveConstraints}
            className="bg-primary text-primary-foreground hover:opacity-90 px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity shadow-lg shadow-primary/20"
          >
            Save All Constraints
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
