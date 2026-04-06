"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/org/new");
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "azure") => {
    setOauthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/org/new`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ClaudeBoost
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Create your team workspace</p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-card
                       text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {oauthLoading === "google" ? "Redirecting..." : "Continue with Google"}
          </button>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-card
                       text-sm font-medium opacity-40 cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M1 12h10v10H1z" />
              <path fill="#7fba00" d="M12 1h10v10H12z" />
              <path fill="#ffb900" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft <span className="text-[10px] text-zinc-600 ml-1">Coming soon</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-zinc-600">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                         placeholder:text-zinc-700"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                         placeholder:text-zinc-700"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                         placeholder:text-zinc-700"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium
                       hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/25"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
