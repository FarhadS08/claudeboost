"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const TYPING_LINES = [
  { text: "build me an API endpoint for user auth", style: "text-zinc-400" },
  { text: "", style: "" },
  { text: "// ClaudeBoost transforms it into...", style: "text-emerald-400/60 italic" },
  { text: "", style: "" },
  { text: "Build a REST API endpoint for user authentication.", style: "text-emerald-300" },
  { text: "Framework: Express.js + TypeScript", style: "text-emerald-300" },
  { text: "Auth: JWT with refresh tokens, bcrypt hashing", style: "text-emerald-300" },
  { text: "Endpoints: POST /auth/register, POST /auth/login", style: "text-emerald-300" },
  { text: "Validation: zod schemas, rate limiting (5 req/min)", style: "text-emerald-300" },
  { text: "Tests: Jest unit tests for each endpoint", style: "text-emerald-300" },
  { text: "Security: OWASP top-10 compliance, no secrets in logs", style: "text-emerald-300" },
];

function TypingDemo() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= TYPING_LINES.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 280);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow effect behind the card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl" />

      <div className="relative bg-card/90 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">claude-code</span>
        </div>
        {/* Code area */}
        <div className="p-5 font-mono text-sm leading-relaxed min-h-[280px]">
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <span className="text-primary">$</span> prompt
          </div>
          {TYPING_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`${line.style} animate-fade-slide-up`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {line.text || "\u00A0"}
            </div>
          ))}
          {visibleLines < TYPING_LINES.length && (
            <span className="inline-block w-2 h-5 bg-primary animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
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

      {/* Demo terminal */}
      <div className="w-full max-w-3xl mt-16 animate-fade-slide-up" style={{ animationDelay: "300ms" }}>
        <TypingDemo />
      </div>
    </section>
  );
}
