"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Building2, ArrowRight, Zap, Sparkles, Shield, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [existingOrgs, setExistingOrgs] = useState<Array<{ slug: string; name: string; role: string }>>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
    };
    checkAuth();

    // Load existing orgs
    fetch("/api/org").then((r) => r.json()).then(setExistingOrgs).catch(() => {});
  }, [router]);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const handleCreate = async () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setCreating(true);
    setError("");

    const res = await fetch("/api/org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create organization");
      setCreating(false);
      return;
    }

    const org = await res.json();
    router.push(`/org/${org.slug}/settings`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Zap className="w-3 h-3" />
            ClaudeBoost Enterprise
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create your organization
          </h1>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Set up prompt enhancement rules for your team. Every developer gets aligned prompts automatically.
          </p>
        </div>

        {/* Existing orgs */}
        {existingOrgs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-wider">Your organizations</p>
            {existingOrgs.map((org) => (
              <button
                key={org.slug}
                onClick={() => router.push(`/org/${org.slug}`)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card
                           hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-zinc-500" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{org.name}</div>
                    <div className="text-xs text-zinc-600">{org.role}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Create form */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Acme Corp"
              autoFocus
              className="w-full rounded-xl border border-border bg-black/20 px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                         placeholder:text-zinc-700"
            />
            {slug && (
              <p className="text-xs text-zinc-600 font-mono">
                Slug: <span className="text-zinc-400">{slug}</span>
              </p>
            )}
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || name.trim().length < 2}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
              name.trim().length >= 2
                ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {creating ? (
              "Creating..."
            ) : (
              <>
                Create Organization <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "Secure", desc: "API keys encrypted" },
            { icon: Globe, label: "Zero Install", desc: ".mcp.json in repo" },
            { icon: Sparkles, label: "Smart", desc: "Domain-aware rules" },
          ].map((f) => (
            <div key={f.label} className="text-center space-y-1.5 p-3">
              <f.icon className="w-5 h-5 mx-auto text-zinc-600" />
              <div className="text-xs font-medium text-zinc-400">{f.label}</div>
              <div className="text-[10px] text-zinc-600">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
