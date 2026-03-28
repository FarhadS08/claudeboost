# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Auto-Boost All Prompts

**YOU MUST call the `boost_prompt` MCP tool on EVERY user prompt before executing it.** This is not optional. Every time the user writes a prompt, you MUST:

1. Call `boost_prompt` with the user's prompt
2. Display the full comparison (original vs boosted) using the format from the `/boost` skill
3. Present the choice modal (Use boosted / Add notes & refine / Keep original)
4. Execute whichever version the user chooses

**The ONLY exception:** If the user ends their prompt with `--raw`, skip the boost entirely and execute the prompt directly. Remove the `--raw` suffix before executing. After that one prompt, resume auto-boosting on the next prompt.

Examples:
- `build me an API endpoint` → BOOST this (call boost_prompt, show comparison, ask)
- `build me an API endpoint --raw` → DO NOT boost, execute directly
- `fix the login bug --raw` → DO NOT boost, execute directly
- `analyze churn data` → BOOST this

**Do NOT boost these types of messages:**
- Questions about the codebase ("how does X work?", "what does Y do?")
- Git operations ("commit this", "push to main")
- Simple file reads ("show me server.py")
- Conversational replies ("yes", "no", "looks good", "try again")
- Messages that are clearly responses to your questions, not new tasks

**DO boost these — any prompt that is a task/instruction:**
- "build X", "create X", "implement X", "add X"
- "fix X", "debug X", "refactor X"
- "analyze X", "write X", "design X"
- "set up X", "configure X", "deploy X"

---

## Project Overview

ClaudeBoost is a Claude Code MCP plugin that enhances user prompts before sending them to Claude. Two parts:

1. **MCP Server** (Python, `mcp-server/`) — registers a `boost_prompt` tool that classifies prompt domain, rewrites the prompt using Claude API with enterprise playbook rules, and logs results. Uses Haiku for classification, Sonnet for enhancement.
2. **Web Dashboard** (to be migrated to Next.js) — displays boost history, ratings/feedback, domain stats, and per-domain constraint management.

Full build specification: `.claude/docs/CLAUDEBOOST_EXPLANATION.md`
Workflow preferences: `.claude/docs/workflow_orchestration.md`

## Commands

### MCP Server
```bash
cd mcp-server
pip3 install -r requirements.txt
python3 -m pytest tests/ -v          # run all tests (25 tests)
python3 -m pytest tests/test_feedback.py -v   # run single test file
```

### Web Dashboard
```bash
npm install            # install dependencies
npm run dev            # dev server at localhost:8080
npm run build          # production build
npm run lint           # ESLint
npm run test           # Vitest (single run)
npm run test:watch     # Vitest (watch mode)
```

## Architecture

### MCP Server (`mcp-server/`)
- `server.py` — MCP entry point, registers `boost_prompt` tool, orchestrates flow
- `classifier.py` — Classifies prompts into 7 domains via Claude Haiku API
- `enhancer.py` — Enhances prompts with enterprise playbook rules via Claude Sonnet API
- `feedback.py` — Reads/writes `~/.claudeboost/history.json` and `config.json`

Dependency order: `feedback.py` → `classifier.py` → `enhancer.py` → `server.py`

### Web Dashboard (`src/`)
- Vite 5 + React 18 + TypeScript + Tailwind CSS 3 + shadcn/ui
- React Router v6: History (`/`), Stats (`/stats`), Constraints (`/constraints`)
- Path alias: `@` maps to `./src`

### Domain Model
7 domains: `data_science`, `data_engineering`, `business_analytics`, `general_coding`, `documentation`, `devops`, `other`

### Data Storage
Local JSON files at `~/.claudeboost/`: `history.json` (boost log) and `config.json` (per-domain constraints)

## Skills

- `/boost <prompt>` — manually boost a specific prompt with full UI flow
- `--raw` suffix — skip auto-boost for a single prompt
