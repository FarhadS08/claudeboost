"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Zap, Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";

// This is a placeholder page for the invite acceptance flow.
// Full implementation requires a server-side API to validate the invite code
// and add the user to the org. For now, it shows the invite info.

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "accepted" | "error">("loading");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ email: user.email || "" });
      }
      // For now, just show a placeholder
      setOrgName("Organization");
      setRole("member");
      setStatus("ready");
    };
    checkAuth();
  }, [code]);

  const handleAccept = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/join/${code}`);
      return;
    }
    // Placeholder — will be implemented with server-side API
    setStatus("accepted");
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

        {status === "ready" && (
          <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
            <h2 className="text-xl font-bold">You&apos;re invited!</h2>
            <p className="text-sm text-zinc-500">
              You&apos;ve been invited to join <span className="text-zinc-300 font-medium">{orgName}</span> as a{" "}
              <span className="text-primary font-medium">{role}</span>.
            </p>

            {user ? (
              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white
                           text-sm font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Accept Invitation <ArrowRight className="w-4 h-4" />
              </button>
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

        {status === "accepted" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 space-y-4">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-emerald-400">Welcome to the team!</h2>
            <p className="text-sm text-zinc-500">
              You&apos;ve joined {orgName}. You can now use ClaudeBoost with your team&apos;s rules.
            </p>
            <Link
              href="/org/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium
                         shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 space-y-4">
            <X className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-400">Invalid Invitation</h2>
            <p className="text-sm text-zinc-500">{error || "This invitation may have expired or already been used."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
