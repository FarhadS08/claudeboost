"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Building2,
  ArrowRight,
  Zap,
  Sparkles,
  Shield,
  Globe,
  Plus,
  Users,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgItem {
  slug: string;
  name: string;
  role: string;
  boost_level?: string;
  created_at?: string;
}

export default function OrgSelectorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setEmail(user.email || null);

      // Fetch orgs
      try {
        const res = await fetch("/api/org");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrgs(data);
            // Auto-redirect if exactly 1 org
            if (data.length === 1) {
              router.push(`/org/${data[0].slug}`);
              return;
            }
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [router]);

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  // Loading state (also shown during auto-redirect)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Zap className="w-8 h-8 text-primary mx-auto animate-pulse" />
          <p className="text-sm text-zinc-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Zap className="w-3 h-3" />
            ClaudeBoost
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {orgs.length > 0 ? "Welcome back" : "Get started"}
          </h1>
          {email && (
            <p className="text-sm text-zinc-500">
              Signed in as <span className="text-zinc-400">{email}</span>
            </p>
          )}
        </div>

        {/* Existing orgs — shown prominently when user has orgs */}
        {orgs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-wider px-1">
              Your organizations
            </p>
            {orgs.map((org) => (
              <button
                key={org.slug}
                onClick={() => router.push(`/org/${org.slug}`)}
                className="w-full flex items-center justify-between p-5 rounded-2xl border border-border bg-card
                           hover:border-primary/30 hover:bg-card/80 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold group-hover:text-primary transition-colors">
                      {org.name}
                    </div>
                    <div className="text-xs text-zinc-600 flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium",
                        org.role === "admin" ? "bg-primary/10 text-primary" :
                        org.role === "manager" ? "bg-amber-400/10 text-amber-400" :
                        "bg-zinc-500/10 text-zinc-400"
                      )}>
                        {org.role}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Create new org — collapsed by default if user has orgs */}
        {orgs.length > 0 && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700
                       text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create another organization
          </button>
        )}

        {/* Create form — always shown if no orgs, expandable if has orgs */}
        {(orgs.length === 0 || showCreate) && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            {orgs.length === 0 && (
              <div className="text-center mb-2">
                <h2 className="text-lg font-semibold">Create your organization</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Set up prompt enhancement rules for your team.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization name</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Acme Corp"
                autoFocus={orgs.length === 0}
                className="w-full rounded-xl border border-border bg-black/20 px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                           placeholder:text-zinc-700"
              />
              {slug && (
                <p className="text-xs text-zinc-600 font-mono">
                  Slug: <span className="text-zinc-400">{slug}</span>
                </p>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
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
              {creating ? "Creating..." : <><Plus className="w-4 h-4" /> Create Organization</>}
            </button>

            {showCreate && (
              <button
                onClick={() => setShowCreate(false)}
                className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Features — only shown for new users */}
        {orgs.length === 0 && (
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
        )}

        {/* Sign out link */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors inline-flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
