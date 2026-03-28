"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          Stop writing mediocre prompts.
          <br />
          <span className="text-primary">
            Start shipping better code.
          </span>
        </h2>

        <p className="text-muted-foreground mt-6 text-lg max-w-xl mx-auto">
          Join developers who use ClaudeBoost to turn every prompt into a
          production-grade instruction. Free and open source.
        </p>

        <div className="flex flex-col items-center gap-6 mt-10">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border font-mono text-sm">
            <span className="text-primary">&#10095;</span>
            <span className="text-foreground">claude mcp add claudeboost</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 text-base"
            >
              Open Dashboard
            </Link>
            <Link
              href="https://github.com"
              className="px-10 py-4 rounded-xl border border-border text-foreground font-semibold hover:bg-muted/50 transition-colors text-base"
            >
              View on GitHub
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          100% free &middot; Install in 30 seconds &middot; Works with Claude Code CLI
        </p>
      </div>
    </section>
  );
}
