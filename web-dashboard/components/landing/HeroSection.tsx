"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/6 rounded-full blur-[120px] pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-8 animate-fade-slide-up">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Free &amp; open source &middot; Claude Code MCP plugin
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-bold text-center max-w-4xl leading-[1.1] tracking-tight animate-fade-slide-up">
        Your prompts,{" "}
        <span className="text-primary">
          supercharged
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mt-6 leading-relaxed animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
        ClaudeBoost is a free MCP plugin for Claude Code that transforms vague prompts into
        enterprise-grade instructions. Better prompts, better code, every time.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4 mt-10 animate-fade-slide-up" style={{ animationDelay: "200ms" }}>
        <Link
          href="/dashboard"
          className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          Get Started Free
        </Link>
        <Link
          href="#use-cases"
          className="px-8 py-3.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors"
        >
          See Examples
        </Link>
      </div>

      {/* Install hint */}
      <div className="mt-8 animate-fade-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border font-mono text-sm">
          <span className="text-primary">&#10095;</span>
          <span className="text-muted-foreground">claude mcp add claudeboost</span>
        </div>
      </div>
    </section>
  );
}
