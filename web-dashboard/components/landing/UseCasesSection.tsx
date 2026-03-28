"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const USE_CASES = [
  {
    tag: "API Development",
    before: "build me an API endpoint for user auth",
    after:
      "Build a REST API for user authentication with Express.js + TypeScript. JWT access/refresh tokens, bcrypt hashing, Zod validation. Endpoints: POST /auth/register, /login, /refresh. Rate limit 5 req/min. Jest tests with 90%+ coverage. OWASP-compliant.",
    scoreBefore: 8,
    scoreAfter: 27,
  },
  {
    tag: "Data Analysis",
    before: "analyze our churn data",
    after:
      "Analyze customer churn from PostgreSQL analytics.user_events. Define churn as 30+ days inactive. Produce: monthly churn rate (12mo trend), cohort retention curves, top 5 predictive features via logistic regression, churned vs retained MRR. Python + pandas, matplotlib PNGs at 300 DPI. Output: Jupyter notebook + 1-page executive summary.",
    scoreBefore: 6,
    scoreAfter: 28,
  },
  {
    tag: "CI/CD Pipeline",
    before: "set up CI pipeline",
    after:
      "Create GitHub Actions CI/CD for a monorepo (apps/api, apps/web, packages/shared). Triggers: push to main, PR, manual dispatch. Jobs: lint (ESLint + Prettier), test (Jest, >80% coverage gate), build (Docker multi-stage), deploy (staging on PR merge, prod on release tag). Total <10min, use concurrency groups. AWS creds via OIDC. Output: .github/workflows/ci.yml + README docs.",
    scoreBefore: 5,
    scoreAfter: 28,
  },
  {
    tag: "Bug Fix",
    before: "fix the login bug where users get 403 after password reset",
    after:
      "Debug HTTP 403 after password reset in src/auth/session.ts. Root cause hypothesis: session token not invalidated on reset. Fix: clear session store + re-issue JWT post-reset. Test: verify login works after reset (happy path + expired token edge case). Constraint: don't break existing OAuth/SSO flow. Output: single commit with fix + regression test.",
    scoreBefore: 10,
    scoreAfter: 26,
  },
  {
    tag: "Database Migration",
    before: "add a new column to the users table",
    after:
      "Create a reversible migration adding `subscription_tier` (enum: free/pro/enterprise, default 'free') to the users table. Use Prisma migrate. Include: up migration, down migration, seed script for existing users, index on subscription_tier for query perf. Validate with dry-run. Zero-downtime deployment compatible. Output: migration file + updated schema.prisma.",
    scoreBefore: 5,
    scoreAfter: 27,
  },
  {
    tag: "React Component",
    before: "make a data table component",
    after:
      "Build a reusable DataTable component in React 18 + TypeScript. Features: server-side sorting, pagination (10/25/50 per page), column resize, row selection with checkbox, search/filter per column. Use TanStack Table v8. Styling: Tailwind + shadcn/ui tokens. Accessible (ARIA roles, keyboard nav). Props: columns config, data fetcher, onRowSelect callback. Output: component file + Storybook story + unit tests.",
    scoreBefore: 6,
    scoreAfter: 29,
  },
  {
    tag: "Documentation",
    before: "write docs for the payment API",
    after:
      "Write API documentation for the payment module (POST /payments/charge, POST /payments/refund, GET /payments/:id, GET /payments/history). For each endpoint: description, auth requirements, request/response schemas with TypeScript types, error codes, rate limits, example curl commands. Include: getting started section, webhook event reference, idempotency key usage. Format: OpenAPI 3.1 YAML + rendered markdown.",
    scoreBefore: 7,
    scoreAfter: 28,
  },
  {
    tag: "Performance",
    before: "optimize the dashboard, it's slow",
    after:
      "Profile and optimize the React dashboard at /dashboard. Current issue: slow initial render + laggy interactions. Steps: 1) Run React DevTools profiler, identify top 5 slow components. 2) Add React.memo + useMemo for expensive computations. 3) Virtualize long lists (react-window). 4) Implement code splitting for route-level lazy loading. 5) Audit bundle with webpack-bundle-analyzer. Target: LCP <1.5s, INP <200ms. Output: PR with before/after Lighthouse scores.",
    scoreBefore: 6,
    scoreAfter: 27,
  },
  {
    tag: "Testing",
    before: "add tests for the checkout flow",
    after:
      "Write end-to-end tests for the checkout flow using Playwright. Cover: add to cart, apply coupon, address validation, payment (Stripe test mode), order confirmation, email receipt. Include: happy path, empty cart edge case, expired coupon, invalid card, network timeout retry. Use Page Object pattern. Run in CI with 3 browser engines (Chromium, Firefox, WebKit). Output: tests/ directory + CI config + test data fixtures.",
    scoreBefore: 7,
    scoreAfter: 29,
  },
];

export function UseCasesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = USE_CASES[activeIdx];

  return (
    <section className="py-24 px-6 relative" id="use-cases">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Use Cases
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            9 ways ClaudeBoost{" "}
            <span className="text-primary">transforms your workflow</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            From API development to testing — see how vague prompts become
            production-ready instructions.
          </p>
        </div>

        {/* Tag selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {USE_CASES.map((uc, i) => (
            <button
              key={uc.tag}
              onClick={() => setActiveIdx(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                i === activeIdx
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {uc.tag}
            </button>
          ))}
        </div>

        {/* Active use case display */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="bg-card border border-border rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Before
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                  {active.scoreBefore}/30
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                {active.before}
              </p>
            </div>

            {/* After */}
            <div className="bg-card border border-primary/20 rounded-2xl p-6 relative">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    After ClaudeBoost
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {active.scoreAfter}/30
                  </span>
                </div>
                <p className="text-sm text-foreground/80 font-mono leading-relaxed">
                  {active.after}
                </p>
              </div>
            </div>
          </div>

          {/* Score improvement bar */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-mono">{active.scoreBefore}/30</span>
              <ArrowRight className="w-4 h-4 text-primary" />
              <span className="text-primary font-mono font-bold">{active.scoreAfter}/30</span>
            </div>
            <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
              +{active.scoreAfter - active.scoreBefore} points
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
