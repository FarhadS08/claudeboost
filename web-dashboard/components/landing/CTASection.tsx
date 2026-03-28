"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-32 px-6 relative">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          Stop writing mediocre prompts.
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Start shipping better code.
          </span>
        </h2>

        <p className="text-muted-foreground mt-6 text-lg max-w-xl mx-auto">
          Join developers who use ClaudeBoost to turn every prompt into a
          production-grade instruction. From $1.90/user/month. Free tier available.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/pricing"
            className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 text-base"
          >
            Get Started Free
          </Link>
          <Link
            href="https://github.com"
            className="px-10 py-4 rounded-xl border border-border text-foreground font-semibold hover:bg-muted/50 transition-colors text-base"
          >
            View on GitHub
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          No credit card required &middot; Install in 30 seconds &middot; $2.49/mo individual &middot; $1.90/user enterprise
        </p>
      </div>
    </section>
  );
}
