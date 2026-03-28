# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeBoost is a Claude Code MCP plugin that enhances user prompts before sending them to Claude. Two parts:

1. **Web Dashboard** (Vite + React + TypeScript + Tailwind) — displays boost history, ratings/feedback, domain stats, and per-domain constraint management. **This is built and lives in this repo.**
2. **MCP Server** (Python) — registers a `boost_prompt` tool that classifies prompt domain, rewrites the prompt using Claude API, and logs results. **Not yet built.**

Full build specification: `.claude/docs/CLAUDEBOOST_EXPLANATION.md`
Workflow preferences: `.claude/docs/workflow_orchestration.md`

## Commands

```bash
npm install            # install dependencies (or bun install)
npm run dev            # dev server at localhost:8080
npm run build          # production build
npm run lint           # ESLint
npm run test           # Vitest (single run)
npm run test:watch     # Vitest (watch mode)
```

## Architecture

### Stack
- **Vite 5** with React 18 + TypeScript + SWC
- **Tailwind CSS 3** with shadcn/ui components (Radix UI primitives)
- **React Router v6** for client-side routing
- **TanStack Query** for data fetching (ready but using mock data currently)
- **Recharts** for stats visualizations
- Path alias: `@` maps to `./src`

### Routing (`src/App.tsx`)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `HistoryPage` | Boost history list with expandable cards, stats summary |
| `/stats` | `StatsPage` | Acceptance rate, ratings by domain, feedback coverage, 7-day activity |
| `/constraints` | `ConstraintsPage` | Per-domain constraint editor (7 domains) |
| `*` | `NotFound` | 404 |

### Key Source Directories
- `src/pages/` — page components (one per route)
- `src/components/` — custom components (`Navbar`, `HistoryCard`, `DomainBadge`, `StarRating`, `NavLink`) + `ui/` (45 shadcn/ui components)
- `src/hooks/` — `use-mobile` (breakpoint detection), `use-toast` (notification system)
- `src/lib/data.ts` — types (`Domain`, `HistoryEntry`, `Constraints`), domain constants, mock data
- `src/lib/utils.ts` — `cn()` classname merge utility

### Domain Model
7 domains: `data_science`, `data_engineering`, `business_analytics`, `general_coding`, `documentation`, `devops`, `other`. Each has a color mapping in `DOMAIN_COLORS`.

### Data Layer
Currently uses mock data in `src/lib/data.ts`. The MCP server will store data at `~/.claudeboost/history.json` and `~/.claudeboost/config.json`. Dashboard API routes need to be built to bridge these.

### Design System
- Dark theme with CSS variables (class-based toggle)
- Fonts: JetBrains Mono (display), Inter (body) via Google Fonts
- Custom animations: `fade-slide-up`, `bar-grow`
- Domain-specific color variables defined in `src/index.css`

## Testing

- **Unit:** Vitest + jsdom + @testing-library/react (setup in `src/test/setup.ts`)
- **E2E:** Playwright (config in `playwright.config.ts`, fixture in `playwright-fixture.ts`)

## MCP Server (not yet built)

Will live in `mcp-server/` with: `server.py`, `classifier.py`, `enhancer.py`, `feedback.py`.
Build order and full spec in `.claude/docs/CLAUDEBOOST_EXPLANATION.md` Section 7.
Dependencies: `mcp`, `anthropic`. Requires `ANTHROPIC_API_KEY` in environment.
