"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function CliLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const [cliCommand, setCliCommand] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setExistingEmail(session.user.email ?? null);
        generateCliCommand(session.access_token, session.refresh_token ?? "", session.user.id);
      }
      setChecking(false);
    });
  }, []);

  const generateCliCommand = (accessToken: string, refreshToken: string, userId: string) => {
    const authData = JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      user_id: userId,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      created_at: new Date().toISOString(),
    });
    // Generate a shell command that writes the auth file
    const escaped = authData.replace(/'/g, "'\\''");
    setCliCommand(`mkdir -p ~/.claudeboost && echo '${escaped}' > ~/.claudeboost/auth.json`);
  };

  const handleCopy = () => {
    if (cliCommand) {
      navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      setExistingEmail(data.session.user.email ?? null);
      generateCliCommand(
        data.session.access_token,
        data.session.refresh_token ?? "",
        data.session.user.id
      );
    }
    setLoading(false);
  };

  const handleConnectExisting = () => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        generateCliCommand(session.access_token, session.refresh_token ?? "", session.user.id);
      }
    });
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Checking session...</p>
      </div>
    );
  }

  // Show CLI command to copy
  if (cliCommand) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">✅</div>
            <h1 className="text-2xl font-bold">Almost done!</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Paste this command in your terminal to connect your CLI:
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/50">
              <span className="text-xs text-zinc-400 font-mono">Terminal</span>
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {cliCommand}
            </pre>
          </div>

          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm text-primary font-medium mb-2">After pasting:</p>
            <ol className="text-xs text-zinc-400 space-y-1 list-decimal list-inside">
              <li>Restart Claude Code</li>
              <li>Type <code className="text-primary bg-primary/10 px-1 rounded">/boost</code> followed by any prompt</li>
              <li>Your history and settings will sync to the dashboard</li>
            </ol>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-4">
            Signed in as <span className="text-zinc-300">{existingEmail}</span>
          </p>
        </div>
      </div>
    );
  }

  // Already logged in on web — show connect button
  if (existingEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">⚡ ClaudeBoost CLI</h1>
            <p className="text-muted-foreground text-sm mt-2">Connect your CLI session</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-300 mb-1">You&apos;re signed in as</p>
            <p className="text-primary font-medium">{existingEmail}</p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mt-4">
              {error}
            </p>
          )}

          <button
            onClick={handleConnectExisting}
            className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Generate CLI connect command
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
          <p className="text-muted-foreground text-sm mt-2">Sign in to connect your CLI session</p>
          <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-xs text-primary">
              After signing in, you&apos;ll get a command to paste in your terminal.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Email</label>
            <input
              suppressHydrationWarning
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Password</label>
            <input
              suppressHydrationWarning
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
            suppressHydrationWarning
          >
            {loading ? "Signing in..." : "Sign In & Connect CLI"}
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
