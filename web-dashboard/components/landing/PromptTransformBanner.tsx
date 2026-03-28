"use client";

import { useEffect, useState, useCallback } from "react";

const EXAMPLES = [
  {
    bad: "build me an API endpoint for user auth",
    good: [
      "## Task: REST API Authentication Endpoint",
      "",
      "**Framework:** Express.js + TypeScript",
      "**Auth:** JWT access/refresh tokens, bcrypt hashing (12 rounds)",
      "**Endpoints:**",
      "  POST /auth/register \u2014 email, password, name",
      "  POST /auth/login \u2014 returns { accessToken, refreshToken }",
      "  POST /auth/refresh \u2014 rotate refresh token",
      "**Validation:** Zod schemas, rate limit 5 req/min/IP",
      "**Security:** OWASP top-10, no secrets in logs, HTTP-only cookies",
      "**Tests:** Jest unit tests, 90%+ coverage on auth logic",
      "**Output:** Single PR with migration file + endpoint code + tests",
    ],
    domain: "general_coding",
    scoreBefore: { specificity: 1, verification: 1, context: 1, constraints: 1, structure: 1, output: 1 },
    scoreAfter:  { specificity: 5, verification: 4, context: 4, constraints: 5, structure: 5, output: 5 },
  },
  {
    bad: "analyze our churn data and make a report",
    good: [
      "## Task: Customer Churn Analysis Report",
      "",
      "**Data source:** PostgreSQL `analytics.user_events` table",
      "**Churn definition:** No login for 30+ days",
      "**Analysis:**",
      "  1. Monthly churn rate trend (last 12 months)",
      "  2. Cohort retention curves by signup month",
      "  3. Top 5 predictive features (logistic regression)",
      "  4. Revenue impact: churned MRR vs retained MRR",
      "**Constraints:** Python + pandas, no PII in output",
      "**Visualizations:** Matplotlib, export as PNG (300 DPI)",
      "**Output:** Jupyter notebook + executive summary (max 1 page)",
    ],
    domain: "data_science",
    scoreBefore: { specificity: 1, verification: 1, context: 1, constraints: 1, structure: 2, output: 1 },
    scoreAfter:  { specificity: 5, verification: 4, context: 5, constraints: 4, structure: 5, output: 5 },
  },
  {
    bad: "set up the CI pipeline",
    good: [
      "## Task: GitHub Actions CI/CD Pipeline",
      "",
      "**Repo:** monorepo (apps/api, apps/web, packages/shared)",
      "**Triggers:** push to main, PR to main, manual dispatch",
      "**Jobs:**",
      "  1. Lint \u2014 ESLint + Prettier check (fail-fast)",
      "  2. Test \u2014 Jest with coverage gate (>80%)",
      "  3. Build \u2014 Docker multi-stage, cache node_modules",
      "  4. Deploy \u2014 staging on PR merge, prod on release tag",
      "**Constraints:** <10min total, use concurrency groups",
      "**Secrets:** AWS creds via OIDC, no hardcoded tokens",
      "**Output:** .github/workflows/ci.yml + docs in README",
    ],
    domain: "devops",
    scoreBefore: { specificity: 1, verification: 1, context: 1, constraints: 1, structure: 1, output: 1 },
    scoreAfter:  { specificity: 5, verification: 5, context: 4, constraints: 5, structure: 5, output: 4 },
  },
];

const DIMENSIONS = ["specificity", "verification", "context", "constraints", "structure", "output"] as const;
const DIM_LABELS: Record<string, string> = {
  specificity: "Specificity",
  verification: "Verification",
  context: "Context",
  constraints: "Constraints",
  structure: "Structure",
  output: "Output",
};

const DOMAIN_COLORS: Record<string, string> = {
  general_coding: "text-primary",
  data_science: "text-secondary",
  devops: "text-orange-400",
};

const DOMAIN_LABELS: Record<string, string> = {
  general_coding: "General Coding",
  data_science: "Data Science",
  devops: "DevOps",
};

type Phase = "typing_bad" | "transforming" | "revealing" | "scores" | "hold";

export function PromptTransformBanner() {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing_bad");
  const [typedChars, setTypedChars] = useState(0);
  const [revealedLines, setRevealedLines] = useState(0);
  const [scoreProgress, setScoreProgress] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const example = EXAMPLES[exampleIdx];
  const totalBefore = Object.values(example.scoreBefore).reduce((a, b) => a + b, 0);
  const totalAfter = Object.values(example.scoreAfter).reduce((a, b) => a + b, 0);

  const reset = useCallback((nextIdx: number) => {
    setExampleIdx(nextIdx);
    setPhase("typing_bad");
    setTypedChars(0);
    setRevealedLines(0);
    setScoreProgress(0);
    setParticles([]);
  }, []);

  // Phase machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing_bad") {
      if (typedChars < example.bad.length) {
        const speed = 30 + Math.random() * 30;
        timer = setTimeout(() => setTypedChars((p) => p + 1), speed);
      } else {
        timer = setTimeout(() => setPhase("transforming"), 600);
      }
    }

    if (phase === "transforming") {
      // Spawn particles
      const count = 12;
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      }));
      setParticles(newParticles);
      timer = setTimeout(() => {
        setPhase("revealing");
        setParticles([]);
      }, 900);
    }

    if (phase === "revealing") {
      if (revealedLines < example.good.length) {
        timer = setTimeout(() => setRevealedLines((p) => p + 1), 80);
      } else {
        timer = setTimeout(() => setPhase("scores"), 300);
      }
    }

    if (phase === "scores") {
      if (scoreProgress < 100) {
        timer = setTimeout(() => setScoreProgress((p) => Math.min(p + 4, 100)), 20);
      } else {
        timer = setTimeout(() => setPhase("hold"), 200);
      }
    }

    if (phase === "hold") {
      timer = setTimeout(() => {
        reset((exampleIdx + 1) % EXAMPLES.length);
      }, 4000);
    }

    return () => clearTimeout(timer);
  }, [phase, typedChars, revealedLines, scoreProgress, example, exampleIdx, reset]);

  const isAfterTransform = phase === "revealing" || phase === "scores" || phase === "hold";

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-secondary/[0.03] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            See it in action
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Watch prompts{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              transform
            </span>
          </h2>
        </div>

        {/* Example selector pills */}
        <div className="flex justify-center gap-2 mb-8">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => reset(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === exampleIdx
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {DOMAIN_LABELS[ex.domain]}
            </button>
          ))}
        </div>

        {/* Main animation container */}
        <div className="relative">
          {/* Glow behind */}
          <div
            className={`absolute -inset-2 rounded-3xl blur-2xl transition-all duration-1000 ${
              isAfterTransform
                ? "bg-gradient-to-r from-primary/20 via-emerald-500/15 to-secondary/20"
                : "bg-gradient-to-r from-zinc-500/10 via-transparent to-zinc-500/10"
            }`}
          />

          <div className="relative bg-card/90 border border-border rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Terminal title bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">claude-code</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${DOMAIN_COLORS[example.domain]}`}>
                  {DOMAIN_LABELS[example.domain]}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-mono transition-all duration-500 ${
                  isAfterTransform ? "text-emerald-400" : "text-zinc-500"
                }`}>
                  <span>{isAfterTransform && scoreProgress > 0 ? totalAfter : totalBefore}</span>
                  <span className="text-muted-foreground">/30</span>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px]">
              {/* Left: Before */}
              <div className="p-6 md:border-r border-border relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Before
                  </span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    isAfterTransform ? "bg-red-500/10 text-red-400" : "bg-zinc-500/10 text-zinc-500"
                  }`}>
                    {totalBefore}/30
                  </span>
                </div>

                <div className="font-mono text-sm">
                  <span className="text-muted-foreground">$ </span>
                  <span className={`transition-colors duration-500 ${
                    isAfterTransform ? "text-zinc-600 line-through decoration-zinc-700" : "text-zinc-300"
                  }`}>
                    {example.bad.slice(0, typedChars)}
                  </span>
                  {phase === "typing_bad" && (
                    <span className="inline-block w-[2px] h-4 bg-primary animate-pulse ml-[1px] align-middle" />
                  )}
                </div>

                {/* Before score bars (dim) */}
                {(phase === "scores" || phase === "hold") && (
                  <div className="mt-8 space-y-2">
                    {DIMENSIONS.map((dim) => (
                      <div key={dim} className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-600 w-16 text-right truncate">{DIM_LABELS[dim]}</span>
                        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-600 rounded-full transition-all duration-700"
                            style={{ width: `${(example.scoreBefore[dim] / 5) * (scoreProgress / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-zinc-600 w-3 tabular-nums">{example.scoreBefore[dim]}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Particles during transform */}
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="absolute w-1 h-1 rounded-full bg-primary animate-ping"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              {/* Right: After */}
              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-widest transition-colors duration-500 ${
                    isAfterTransform ? "text-emerald-500" : "text-zinc-700"
                  }`}>
                    After
                  </span>
                  {isAfterTransform && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {Math.round(totalBefore + (totalAfter - totalBefore) * (scoreProgress / 100))}/30
                    </span>
                  )}
                </div>

                {/* Shimmer overlay during transformation */}
                {phase === "transforming" && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
                  </div>
                )}

                {/* Boosted content */}
                {isAfterTransform ? (
                  <div className="font-mono text-[13px] leading-relaxed space-y-0">
                    {example.good.slice(0, revealedLines).map((line, i) => (
                      <div
                        key={i}
                        className="animate-fade-slide-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        {line.startsWith("##") ? (
                          <span className="text-emerald-300 font-bold">{line}</span>
                        ) : line.startsWith("**") ? (
                          <span className="text-emerald-400/90">
                            {line.split("**").map((part, j) =>
                              j % 2 === 1 ? (
                                <span key={j} className="text-emerald-300 font-semibold">{part}</span>
                              ) : (
                                <span key={j} className="text-zinc-400">{part}</span>
                              )
                            )}
                          </span>
                        ) : line.startsWith("  ") ? (
                          <span className="text-zinc-500">{line}</span>
                        ) : line === "" ? (
                          <span>&nbsp;</span>
                        ) : (
                          <span className="text-zinc-400">{line}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    {phase === "transforming" ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              style={{
                                animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-primary/60 font-mono">enhancing...</span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-700 italic">Waiting for prompt...</span>
                    )}
                  </div>
                )}

                {/* After score bars */}
                {(phase === "scores" || phase === "hold") && (
                  <div className="mt-8 space-y-2">
                    {DIMENSIONS.map((dim) => (
                      <div key={dim} className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-500 w-16 text-right truncate">{DIM_LABELS[dim]}</span>
                        <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-emerald-400"
                            style={{ width: `${(example.scoreAfter[dim] / 5) * (scoreProgress / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-emerald-400 w-3 tabular-nums">{example.scoreAfter[dim]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="border-t border-border px-5 py-2.5 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-4">
                {/* Progress dots */}
                <div className="flex gap-1.5">
                  {(["typing_bad", "transforming", "revealing", "scores", "hold"] as Phase[]).map((p, i) => {
                    const phaseOrder = ["typing_bad", "transforming", "revealing", "scores", "hold"];
                    const currentOrder = phaseOrder.indexOf(phase);
                    const thisOrder = phaseOrder.indexOf(p);
                    return (
                      <div
                        key={p}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          thisOrder <= currentOrder ? "bg-primary" : "bg-zinc-700"
                        } ${thisOrder === currentOrder ? "scale-125" : ""}`}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {phase === "typing_bad" && "Receiving prompt..."}
                  {phase === "transforming" && "Analyzing & enhancing..."}
                  {phase === "revealing" && "Generating structured output..."}
                  {phase === "scores" && "Scoring dimensions..."}
                  {phase === "hold" && "Enhancement complete"}
                </span>
              </div>
              {(phase === "scores" || phase === "hold") && (
                <span className="text-[10px] font-mono font-semibold text-emerald-400">
                  +{totalAfter - totalBefore} points
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
