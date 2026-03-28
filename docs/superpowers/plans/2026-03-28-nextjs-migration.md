# Next.js Migration + Dynamic Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite+React SPA with a Next.js App Router dashboard that reads live data from `~/.claudeboost/` JSON files, with a refreshed dark theme and auto-polling.

**Architecture:** Next.js 15 App Router in `web-dashboard/` directory. Server-side API routes read/write local JSON files. Client components use polling (5s interval) via custom `usePolling` hook. The existing Vite app in `src/` will be replaced.

**Tech Stack:** Next.js 15, React 18, Tailwind CSS 3, TypeScript, shadcn/ui

---

## File Structure

```
web-dashboard/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── app/
│   ├── layout.tsx              # Root layout: dark theme, fonts, nav
│   ├── globals.css             # CSS variables, Tailwind imports, animations
│   ├── page.tsx                # History page (main)
│   ├── stats/
│   │   └── page.tsx            # Stats: histograms, ROI metrics
│   └── constraints/
│       └── page.tsx            # Domain constraints + settings editor
├── api/
│   ├── history/
│   │   └── route.ts            # GET all history, PATCH single entry
│   ├── constraints/
│   │   └── route.ts            # GET and POST domain constraints
│   └── settings/
│       └── route.ts            # GET and POST boost settings
├── components/
│   ├── Navbar.tsx
│   ├── DomainBadge.tsx
│   ├── StarRating.tsx
│   ├── HistoryCard.tsx
│   ├── ScoreBar.tsx            # Before/after score visualization
│   └── FeedbackForm.tsx
├── hooks/
│   └── usePolling.ts           # Generic polling hook (5s interval)
└── lib/
    ├── types.ts                # All TypeScript types
    ├── constants.ts            # Domain colors, dimension names
    └── files.ts                # Server-side file read/write helpers
```

---

### Task 1: Bootstrap Next.js Project

**Files:**
- Create: `web-dashboard/` (entire directory via create-next-app)

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/ferhadsuleymanzade/Documents/claudeboost
npx create-next-app@latest web-dashboard --typescript --tailwind --app --no-src-dir --use-npm
```

Accept defaults. This creates the base Next.js project.

- [ ] **Step 2: Install shadcn/ui**

```bash
cd web-dashboard
npx shadcn@latest init -d
```

- [ ] **Step 3: Install needed shadcn components**

```bash
npx shadcn@latest add button card badge textarea tabs progress
```

- [ ] **Step 4: Verify it runs**

```bash
npm run dev
```

Open http://localhost:3000 — should show the Next.js default page.

- [ ] **Step 5: Commit**

```bash
git add web-dashboard/
git commit -m "feat: bootstrap Next.js project for web dashboard"
```

---

### Task 2: Types, Constants, and Server-Side File Helpers

**Files:**
- Create: `web-dashboard/lib/types.ts`
- Create: `web-dashboard/lib/constants.ts`
- Create: `web-dashboard/lib/files.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// web-dashboard/lib/types.ts
export type Domain =
  | "data_science"
  | "data_engineering"
  | "business_analytics"
  | "general_coding"
  | "documentation"
  | "devops"
  | "other";

export interface ScoreBreakdown {
  dimensions: {
    specificity: number;
    verification: number;
    context: number;
    constraints: number;
    structure: number;
    output_definition: number;
  };
  total: number;
  average: number;
  level: number;
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  domain: Domain;
  original: string;
  boosted: string;
  chosen: "boosted" | "original" | null;
  rating: number | null;
  feedback: string;
  original_score: ScoreBreakdown | null;
  boosted_score: ScoreBreakdown | null;
}

export type Constraints = Record<Domain, string>;

export interface Settings {
  boost_level: "light" | "medium" | "full";
  auto_boost: boolean;
}
```

- [ ] **Step 2: Create constants.ts**

```typescript
// web-dashboard/lib/constants.ts
import { Domain } from "./types";

export const DOMAINS: Domain[] = [
  "data_science",
  "data_engineering",
  "business_analytics",
  "general_coding",
  "documentation",
  "devops",
  "other",
];

export const DOMAIN_COLORS: Record<Domain, string> = {
  data_science: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  data_engineering: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  business_analytics: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  general_coding: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  documentation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  devops: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  data_science: "Data Science",
  data_engineering: "Data Engineering",
  business_analytics: "Business Analytics",
  general_coding: "General Coding",
  documentation: "Documentation",
  devops: "DevOps",
  other: "Other",
};

export const DIMENSION_NAMES: Record<string, string> = {
  specificity: "Specificity",
  verification: "Verification",
  context: "Context",
  constraints: "Constraints",
  structure: "Structure",
  output_definition: "Output",
};

export const LEVEL_LABELS: Record<number, string> = {
  1: "Unacceptable",
  2: "Needs Work",
  3: "Acceptable",
  4: "Production",
  5: "Enterprise",
};

export const LEVEL_COLORS: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-emerald-400",
  5: "text-cyan-400",
};
```

- [ ] **Step 3: Create files.ts (server-side only)**

```typescript
// web-dashboard/lib/files.ts
import fs from "fs";
import path from "path";

const CLAUDEBOOST_DIR = path.join(process.env.HOME!, ".claudeboost");
const HISTORY_FILE = path.join(CLAUDEBOOST_DIR, "history.json");
const CONFIG_FILE = path.join(CLAUDEBOOST_DIR, "config.json");
const SETTINGS_FILE = path.join(CLAUDEBOOST_DIR, "settings.json");

const DEFAULT_CONFIG: Record<string, string> = {
  data_science: "",
  data_engineering: "",
  business_analytics: "",
  general_coding: "",
  documentation: "",
  devops: "",
  other: "",
};

const DEFAULT_SETTINGS = {
  boost_level: "medium",
  auto_boost: true,
};

function ensureDir() {
  if (!fs.existsSync(CLAUDEBOOST_DIR)) {
    fs.mkdirSync(CLAUDEBOOST_DIR, { recursive: true });
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readHistory() {
  return readJSON<unknown[]>(HISTORY_FILE, []);
}

export function writeHistory(data: unknown[]) {
  writeJSON(HISTORY_FILE, data);
}

export function readConfig() {
  return readJSON(CONFIG_FILE, DEFAULT_CONFIG);
}

export function writeConfig(data: Record<string, string>) {
  writeJSON(CONFIG_FILE, data);
}

export function readSettings() {
  return readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export function writeSettings(data: Record<string, unknown>) {
  writeJSON(SETTINGS_FILE, data);
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/ferhadsuleymanzade/Documents/claudeboost/web-dashboard
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add web-dashboard/lib/
git commit -m "feat: add types, constants, and server-side file helpers"
```

---

### Task 3: API Routes

**Files:**
- Create: `web-dashboard/app/api/history/route.ts`
- Create: `web-dashboard/app/api/constraints/route.ts`
- Create: `web-dashboard/app/api/settings/route.ts`

- [ ] **Step 1: Create history API route**

```typescript
// web-dashboard/app/api/history/route.ts
import { NextResponse } from "next/server";
import { readHistory, writeHistory } from "@/lib/files";

export async function GET() {
  const history = readHistory();
  return NextResponse.json(history.reverse());
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, rating, feedback, chosen } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const history = readHistory() as Record<string, unknown>[];
  const entry = history.find((e) => e.id === id);
  if (!entry) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (rating !== undefined) entry.rating = rating;
  if (feedback !== undefined) entry.feedback = feedback;
  if (chosen !== undefined) entry.chosen = chosen;

  writeHistory(history);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create constraints API route**

```typescript
// web-dashboard/app/api/constraints/route.ts
import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/files";

export async function GET() {
  return NextResponse.json(readConfig());
}

export async function POST(request: Request) {
  const body = await request.json();
  writeConfig(body);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create settings API route**

```typescript
// web-dashboard/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/files";

export async function GET() {
  return NextResponse.json(readSettings());
}

export async function POST(request: Request) {
  const body = await request.json();
  writeSettings(body);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Test the API routes**

```bash
cd /Users/ferhadsuleymanzade/Documents/claudeboost/web-dashboard
npm run dev &
sleep 3
curl -s http://localhost:3000/api/history | head -c 200
curl -s http://localhost:3000/api/constraints | head -c 200
curl -s http://localhost:3000/api/settings | head -c 200
kill %1
```

Expected: JSON responses (possibly empty arrays/default objects).

- [ ] **Step 5: Commit**

```bash
git add web-dashboard/app/api/
git commit -m "feat: add API routes for history, constraints, and settings"
```

---

### Task 4: Polling Hook and Global Styles

**Files:**
- Create: `web-dashboard/hooks/usePolling.ts`
- Modify: `web-dashboard/app/globals.css`
- Modify: `web-dashboard/app/layout.tsx`

- [ ] **Step 1: Create usePolling hook**

```typescript
// web-dashboard/hooks/usePolling.ts
"use client";
import { useState, useEffect, useCallback } from "react";

export function usePolling<T>(url: string, interval: number = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}
```

- [ ] **Step 2: Replace globals.css with the dark theme**

Replace the entire `web-dashboard/app/globals.css` content with the CSS variables from the existing `src/index.css` — the dark theme with font imports, domain colors, custom animations (`fade-slide-up`, `bar-grow`), and the dot pattern background. Copy the existing file's content but adapt for Next.js (Tailwind v3 directives).

- [ ] **Step 3: Update layout.tsx with nav + dark theme**

Replace `web-dashboard/app/layout.tsx` with a root layout that:
- Sets `<html lang="en" className="dark">`
- Imports Google Fonts (Inter + JetBrains Mono)
- Renders a fixed top nav with: "⚡ ClaudeBoost" logo (left), three nav links (History `/`, Stats `/stats`, Constraints `/constraints`) (right)
- Wraps children in `<main className="max-w-5xl mx-auto px-6 pt-20 pb-12">`
- The nav uses `usePathname()` to highlight the active link

- [ ] **Step 4: Verify dev server works**

```bash
cd /Users/ferhadsuleymanzade/Documents/claudeboost/web-dashboard && npm run dev
```

Open http://localhost:3000 — should show the nav with dark theme.

- [ ] **Step 5: Commit**

```bash
git add web-dashboard/hooks/ web-dashboard/app/globals.css web-dashboard/app/layout.tsx
git commit -m "feat: add polling hook, dark theme, and root layout with nav"
```

---

### Task 5: Reusable Components

**Files:**
- Create: `web-dashboard/components/DomainBadge.tsx`
- Create: `web-dashboard/components/StarRating.tsx`
- Create: `web-dashboard/components/ScoreBar.tsx`
- Create: `web-dashboard/components/FeedbackForm.tsx`
- Create: `web-dashboard/components/HistoryCard.tsx`

- [ ] **Step 1: Create DomainBadge**

```typescript
// web-dashboard/components/DomainBadge.tsx
"use client";
import { Domain } from "@/lib/types";
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/constants";

export default function DomainBadge({ domain }: { domain: Domain }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${DOMAIN_COLORS[domain]}`}>
      {DOMAIN_LABELS[domain]}
    </span>
  );
}
```

- [ ] **Step 2: Create StarRating**

Interactive 5-star rating component. Props: `value: number`, `onChange?: (n: number) => void`, `readonly?: boolean`. Stars below current value are `text-amber-400`, others are `text-zinc-600`. Clickable when not readonly.

- [ ] **Step 3: Create ScoreBar**

Before/after score visualization for a single dimension. Props: `label: string`, `before: number`, `after: number`. Shows the dimension name, a gray bar (before/5 width), and a colored bar (after/5 width) side by side with numeric labels.

```typescript
// web-dashboard/components/ScoreBar.tsx
"use client";

export default function ScoreBar({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className="text-zinc-500">{before} → {after}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-500/50 rounded-full transition-all duration-700" style={{ width: `${(before / 5) * 100}%` }} />
        </div>
        <div className="flex-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(after / 5) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create FeedbackForm**

Client component. Props: `entry: HistoryEntry`, `onSubmit: (id: number, rating: number, feedback: string) => void`. Shows StarRating + textarea + "Save Feedback" button.

- [ ] **Step 5: Create HistoryCard**

Expandable card component. Props: `entry: HistoryEntry`, `onFeedback: (id, rating, feedback) => void`. Collapsed: domain badge, first 80 chars of original, score badge (if available), date, chevron. Expanded: side-by-side original vs boosted, score breakdown (ScoreBar for each dimension), FeedbackForm.

- [ ] **Step 6: Commit**

```bash
git add web-dashboard/components/
git commit -m "feat: add reusable components (DomainBadge, StarRating, ScoreBar, FeedbackForm, HistoryCard)"
```

---

### Task 6: History Page (Main)

**Files:**
- Modify: `web-dashboard/app/page.tsx`

- [ ] **Step 1: Implement the History page**

Client component using `usePolling<HistoryEntry[]>("/api/history")`. Shows:

1. **Stats bar** — 3 cards: Total Boosts (count), Avg Score Lift (avg improvement), Top Domain (most frequent)
2. **History list** — map over entries, render `<HistoryCard>` for each
3. Feedback submit calls `PATCH /api/history` then refetches

Follow the design pattern: `animate-fade-slide-up` on each card with staggered delays.

- [ ] **Step 2: Verify page works**

```bash
npm run dev
```

Open http://localhost:3000 — should show history from `~/.claudeboost/history.json`. If the file has entries from using `/boost`, they should appear.

- [ ] **Step 3: Commit**

```bash
git add web-dashboard/app/page.tsx
git commit -m "feat: add dynamic History page with live polling"
```

---

### Task 7: Stats Page with Score Histograms + ROI

**Files:**
- Modify: `web-dashboard/app/stats/page.tsx`

- [ ] **Step 1: Implement the Stats page**

Client component using `usePolling<HistoryEntry[]>("/api/history")`. Shows 6 sections:

1. **Boost Acceptance Rate** — % of entries where chosen === "boosted" out of non-null. Progress bar.
2. **Average Rating by Domain** — horizontal bars per domain with star averages.
3. **Score Improvement Histogram** — grouped horizontal bars (6 dimensions). For each dimension: gray bar = avg original score, green bar = avg boosted score. Use `ScoreBar` component. Label legend: "Before (gray) / After (green)".
4. **ROI Metrics** — 2x2 grid:
   - Avg Score Lift: `+X.X points` (avg of boosted_total - original_total)
   - Quality Level Distribution: small bars showing count per level 1-5
   - Boost Success Rate: % where boosted > original
   - Avg Dimensions Improved: avg count of dims that increased
5. **Feedback Coverage** — donut chart (SVG) showing % with feedback.
6. **Daily Activity** — last 7 days bar chart.

All data computed from the polled history. Handle empty state gracefully ("No data yet").

- [ ] **Step 2: Verify page works**

Open http://localhost:3000/stats — should show all sections with live data.

- [ ] **Step 3: Commit**

```bash
git add web-dashboard/app/stats/page.tsx
git commit -m "feat: add Stats page with score histograms and ROI metrics"
```

---

### Task 8: Constraints + Settings Page

**Files:**
- Modify: `web-dashboard/app/constraints/page.tsx`

- [ ] **Step 1: Implement the Constraints page**

Client component using `usePolling<Constraints>("/api/constraints")` and `usePolling<Settings>("/api/settings")`.

Two sections:

1. **Boost Settings** (top) — card showing:
   - Boost Level selector: 3 radio-style buttons (light/medium/full) with current highlighted
   - Auto-Boost toggle switch
   - Changes POST to `/api/settings` immediately

2. **Domain Constraints** (below) — for each of 7 domains:
   - DomainBadge + textarea
   - Placeholder: "e.g. Always use Python. Never use pandas."
   - "Save All" button at bottom → POST to `/api/constraints`
   - Green "Saved!" confirmation for 2 seconds

- [ ] **Step 2: Verify page works**

Open http://localhost:3000/constraints — change a setting, verify it persists (check `~/.claudeboost/settings.json`).

- [ ] **Step 3: Commit**

```bash
git add web-dashboard/app/constraints/page.tsx
git commit -m "feat: add Constraints page with settings sync"
```

---

### Task 9: Final Cleanup and Integration

**Files:**
- Modify: `web-dashboard/next.config.ts` (if needed)
- Modify: `CLAUDE.md`

- [ ] **Step 1: Verify all pages work end-to-end**

```bash
cd /Users/ferhadsuleymanzade/Documents/claudeboost/web-dashboard
npm run build
npm run start
```

Test all three pages. Verify API routes return correct data.

- [ ] **Step 2: Update CLAUDE.md with new dashboard commands**

Update the Commands section to reflect the new dashboard:

```markdown
### Web Dashboard
\`\`\`bash
cd web-dashboard
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
\`\`\`
```

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: complete Next.js dashboard migration with dynamic data"
git push origin feature/project-docs
```

---

## Summary

| Task | What it builds | Dependencies |
|------|---------------|--------------|
| 1 | Next.js project bootstrap + shadcn/ui | None |
| 2 | Types, constants, file helpers | Task 1 |
| 3 | API routes (history, constraints, settings) | Task 2 |
| 4 | Polling hook, dark theme, layout with nav | Task 1 |
| 5 | Reusable components (5 components) | Tasks 2, 4 |
| 6 | History page (main) | Tasks 3, 4, 5 |
| 7 | Stats page with histograms + ROI | Tasks 3, 4, 5 |
| 8 | Constraints + Settings page | Tasks 3, 4, 5 |
| 9 | Final cleanup, build verification, CLAUDE.md | All |
