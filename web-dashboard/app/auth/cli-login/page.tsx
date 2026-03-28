"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function CliLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in on the web
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setExistingEmail(session.user.email ?? null);
        // Auto-write token for existing session
        const ok = await writeTokenFile(
          session.access_token,
          session.refresh_token ?? "",
          session.user.id
        );
        if (ok) {
          setSuccess(true);
        }
      }
      setChecking(false);
    });
  }, []);

  const writeTokenFile = async (
    accessToken: string,
    refreshToken: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/cli-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          user_id: userId,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      const ok = await writeTokenFile(
        data.session.access_token,
        data.session.refresh_token ?? "",
        data.session.user.id
      );
      if (!ok) {
        setError("Failed to save CLI token. Is the dashboard running locally?");
        setLoading(false);
        return;
      }
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleConnectExisting = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const ok = await writeTokenFile(
        session.access_token,
        session.refresh_token ?? "",
        session.user.id
      );
      if (ok) {
        setSuccess(true);
      } else {
        setError("Failed to save CLI token. Try signing in again.");
      }
    }
    setLoading(false);
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold">CLI Authenticated!</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Your CLI session is now connected. You can close this tab and return
            to Claude Code.
          </p>
          <p className="text-xs text-zinc-500 mt-4">
            Token saved to ~/.claudeboost/auth.json
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Checking session...
        </p>
      </div>
    );
  }

  // Already logged in on web — show "Connect CLI" button
  if (existingEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">⚡ ClaudeBoost CLI</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Connect your CLI session
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-sm text-zinc-300 mb-1">
              You&apos;re signed in as
            </p>
            <p className="text-primary font-medium">{existingEmail}</p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mt-4">
              {error}
            </p>
          )}

          <button
            onClick={handleConnectExisting}
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect CLI to this account"}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Or{" "}
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                setExistingEmail(null);
              }}
              className="text-primary hover:underline"
            >
              sign in with a different account
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Not logged in — show login form
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">⚡ ClaudeBoost CLI</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Sign in to connect your CLI session
          </p>
          <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary">
              This login will authenticate your Claude Code terminal. After
              signing in, return to your terminal.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
          suppressHydrationWarning
        >
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Email</label>
            <input
              suppressHydrationWarning
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">
              Password
            </label>
            <input
              suppressHydrationWarning
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
            suppressHydrationWarning
          >
            {loading ? "Connecting..." : "Sign In & Connect CLI"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
