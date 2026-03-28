"use client";

import { useEffect, useState } from "react";
import { Terminal, Sparkles, Settings, BarChart3, MessageSquare } from "lucide-react";

const CLI_STEPS = [
  {
    command: "claude",
    output: [
      "\u001b[1m\u2728 ClaudeBoost active\u001b[0m \u00b7 boost level: medium \u00b7 auto-boost: on",
    ],
    delay: 800,
  },
  {
    command: "fix the login bug where users get 403 after password reset",
    output: [],
    delay: 600,
  },
  {
    command: null,
    output: [
      "",
      "\u26a1 \u001b[1mCLAUDEBOOST\u001b[0m \u00b7 general_coding \u00b7 Level: L4",
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
      "\ud83d\udcdd Original: fix the login bug where users get 403",
      "           after password reset",
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
      "\u2728 Boosted: Debug and fix HTTP 403 error occurring",
      "   after password reset flow.",
      "   File: src/auth/session.ts",
      "   Root cause: session token not invalidated on reset",
      "   Fix: clear session store + re-issue JWT after reset",
      "   Test: verify login works post-reset (happy + edge)",
      "   Constraints: don't break existing OAuth flow",
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
      "\ud83d\udcca Score: 8/30 \u2192 26/30 (+18)",
      "",
    ],
    delay: 100,
  },
  {
    command: null,
    output: [
      "  [1] \u2728 Use boosted prompt (Recommended)",
      "  [2] \ud83d\udcdd Add notes & refine",
      "  [3] \ud83d\udeab Keep original",
      "",
      "  \u25b8 1",
      "",
      "\u2713 Executing boosted prompt...",
    ],
    delay: 100,
  },
];

function CLITerminal() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [showOutput, setShowOutput] = useState<boolean[]>([]);

  useEffect(() => {
    if (visibleSteps >= CLI_STEPS.length) return;

    const step = CLI_STEPS[visibleSteps];

    if (step.command && typedChars < step.command.length) {
      const speed = 25 + Math.random() * 25;
      const timer = setTimeout(() => setTypedChars((p) => p + 1), speed);
      return () => clearTimeout(timer);
    }

    if (step.command && typedChars >= step.command.length && !showOutput[visibleSteps]) {
      const timer = setTimeout(() => {
        setShowOutput((p) => {
          const next = [...p];
          next[visibleSteps] = true;
          return next;
        });
      }, 300);
      return () => clearTimeout(timer);
    }

    if ((!step.command || showOutput[visibleSteps]) && visibleSteps < CLI_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setVisibleSteps((p) => p + 1);
        setTypedChars(0);
      }, step.delay);
      return () => clearTimeout(timer);
    }
  }, [visibleSteps, typedChars, showOutput]);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 rounded-2xl blur-xl" />
      <div className="relative bg-[hsl(233,53%,4%)] border border-border rounded-xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">claude-code &mdash; ~/project</span>
          </div>
        </div>

        {/* Terminal content */}
        <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[400px] space-y-0">
          {CLI_STEPS.slice(0, visibleSteps + 1).map((step, stepIdx) => (
            <div key={stepIdx}>
              {step.command !== null && (
                <div className="flex gap-2">
                  <span className="text-emerald-500 select-none">&#10095;</span>
                  <span className="text-zinc-300">
                    {stepIdx === visibleSteps
                      ? step.command.slice(0, typedChars)
                      : step.command}
                    {stepIdx === visibleSteps &&
                      typedChars < step.command.length && (
                        <span className="inline-block w-[2px] h-4 bg-primary animate-pulse ml-[1px] align-middle" />
                      )}
                  </span>
                </div>
              )}
              {(showOutput[stepIdx] || step.command === null) &&
                stepIdx <= visibleSteps &&
                step.output.map((line, lineIdx) => (
                  <div
                    key={lineIdx}
                    className={`animate-fade-slide-up ${getLineStyle(line)}`}
                    style={{ animationDelay: `${lineIdx * 40}ms` }}
                  >
                    {line || "\u00A0"}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getLineStyle(line: string): string {
  if (line.includes("\u26a1") || line.includes("CLAUDEBOOST")) return "text-primary font-bold";
  if (line.includes("\u2728 Boosted") || line.includes("\u2728 Use")) return "text-emerald-400";
  if (line.includes("\ud83d\udcdd")) return "text-zinc-400";
  if (line.includes("\ud83d\udcca")) return "text-secondary font-semibold";
  if (line.includes("\u2713")) return "text-emerald-500 font-semibold";
  if (line.includes("\u2500")) return "text-zinc-700";
  if (line.startsWith("  [")) return "text-zinc-400";
  if (line.startsWith("  \u25b8")) return "text-primary";
  if (line.startsWith("   ")) return "text-zinc-500";
  return "text-zinc-400";
}

const CLI_FEATURES = [
  {
    icon: Sparkles,
    title: "/boost",
    description: "Manually boost any prompt with full comparison UI",
  },
  {
    icon: Settings,
    title: "/boost-settings",
    description: "Toggle auto-boost, set level (light / medium / full)",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description: "Real-time analytics at localhost:3000 with 5s polling",
  },
  {
    icon: MessageSquare,
    title: "--raw",
    description: "Skip boost for a single prompt when you don't need it",
  },
];

export function CLIShowcase() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary mb-3">
            Built for the CLI
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Lives inside{" "}
            <span className="text-secondary">Claude Code</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            ClaudeBoost runs as an MCP plugin directly in your Claude Code terminal.
            No browser tabs, no copy-pasting, no context switching. Just type and go.
          </p>
        </div>

        {/* Two columns: terminal + feature cards */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Terminal demo */}
          <div className="flex-1 w-full">
            <CLITerminal />
          </div>

          {/* Feature cards */}
          <div className="flex-1 space-y-4 w-full max-w-md">
            {/* Install command */}
            <div className="bg-card/80 border border-border rounded-xl p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Install in 30 seconds
              </p>
              <div className="bg-background rounded-lg p-3 font-mono text-sm border border-border">
                <div className="text-zinc-400">
                  <span className="text-muted-foreground"># Add to MCP settings</span>
                </div>
                <div className="mt-1">
                  <span className="text-emerald-500">&#10095;</span>{" "}
                  <span className="text-zinc-300">claude mcp add claudeboost</span>
                </div>
                <div className="mt-1">
                  <span className="text-emerald-500">&#10095;</span>{" "}
                  <span className="text-zinc-300">claude</span>{" "}
                  <span className="text-zinc-500"># that&apos;s it, start coding</span>
                </div>
              </div>
            </div>

            {/* Command cards */}
            {CLI_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="group flex items-start gap-4 bg-card/50 border border-border rounded-xl p-4 hover:border-secondary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <feat.icon className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-mono">{feat.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
