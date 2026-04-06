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
          Set up your org in 2 minutes. Add a <code className="text-primary">.mcp.json</code> to your repo.
          Every developer gets enhanced prompts aligned with your standards.
        </p>

        <div className="flex flex-col items-center gap-6 mt-10">
          <div className="flex items-center gap-4">
            <Link
              href="/org/new"
              className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 text-base"
            >
              Create Organization
            </Link>
            <Link
              href="https://github.com/FarhadS08/claudeboost"
              className="px-10 py-4 rounded-xl border border-border text-foreground font-semibold hover:bg-muted/50 transition-colors text-base"
            >
              View on GitHub
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Per-seat pricing &middot; Zero developer install &middot; Your API key, your data
        </p>
      </div>
    </section>
  );
}
