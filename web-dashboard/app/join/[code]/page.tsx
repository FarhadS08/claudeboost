"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Zap, Check, X, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface InviteInfo {
  email: string;
  role: string;
  org_name: string;
  org_slug: string;
}

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "accepted" | "error">("loading");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Check auth + fetch invite info in parallel
    const load = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ email: authUser.email || "" });
      }

      // Fetch invite details
      const res = await fetch(`/api/join/${code}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid invitation");
        setStatus("error");
        return;
      }

      const data = await res.json();
      setInvite(data);
      setStatus("ready");
    };
    load();
  }, [code]);

  const handleAccept = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/join/${code}`);
      return;
    }

    setStatus("accepting");
    const res = await fetch(`/api/join/${code}`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to accept invitation");
      setStatus("error");
      return;
    }

    setStatus("accepted");
    // Redirect to org after short delay
    setTimeout(() => {
      router.push(`/org/${data.org_slug || invite?.org_slug}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="inline-flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ClaudeBoost
          </span>
        </div>

        {status === "loading" && (
          <div className="rounded-2xl border border-border bg-card p-8">
            <p className="text-zinc-500 animate-pulse">Loading invitation...</p>
          </div>
        )}

        {status === "ready" && invite && (
          <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
            <h2 className="text-xl font-bold">You&apos;re invited!</h2>
            <p className="text-sm text-zinc-500">
              Join <span className="text-zinc-300 font-medium">{invite.org_name}</span> as a{" "}
              <span className="text-primary font-medium">{invite.role}</span>.
            </p>

            {invite.email && user && invite.email.toLowerCase() !== user.email.toLowerCase() && (
              <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-400/10 rounded-xl p-3 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This invite was sent to <strong>{invite.email}</strong>. You&apos;re logged in as <strong>{user.email}</strong>.
                </span>
              </div>
            )}

            {user ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600">
                  Signed in as <span className="text-zinc-400">{user.email}</span>
                </p>
                <button
                  onClick={handleAccept}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white
                             text-sm font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  Accept Invitation <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600">Sign in or create an account to accept:</p>
                <Link
                  href={`/auth/login?redirect=/join/${code}`}
                  className="block w-full py-3 rounded-xl bg-primary text-white text-sm font-medium text-center
                             shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  Sign In to Accept
                </Link>
                <Link
                  href={`/auth/signup`}
                  className="block w-full py-3 rounded-xl border border-border text-sm font-medium text-center
                             hover:bg-muted/50 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}

        {status === "accepting" && (
          <div className="rounded-2xl border border-border bg-card p-8">
            <p className="text-zinc-500 animate-pulse">Joining team...</p>
          </div>
        )}

        {status === "accepted" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 space-y-4">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-emerald-400">Welcome to the team!</h2>
            <p className="text-sm text-zinc-500">
              You&apos;ve joined <span className="text-zinc-300">{invite?.org_name}</span>. Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 space-y-4">
            <X className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-400">Cannot Join</h2>
            <p className="text-sm text-zinc-500">{error}</p>
            <Link
              href="/"
              className="inline-block text-xs text-primary hover:underline mt-2"
            >
              Go to homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
