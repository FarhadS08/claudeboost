"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-8 animate-fade-slide-up">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Now in public beta
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-bold text-center max-w-4xl leading-[1.1] tracking-tight animate-fade-slide-up">
        Your prompts,{" "}
        <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
          supercharged
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mt-6 leading-relaxed animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
        ClaudeBoost is an MCP plugin that transforms vague prompts into
        enterprise-grade instructions — automatically. Better prompts, better code, every time.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4 mt-10 animate-fade-slide-up" style={{ animationDelay: "200ms" }}>
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          Get Started
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-3.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors"
        >
          View Dashboard
        </Link>
      </div>
    </section>
  );
}
