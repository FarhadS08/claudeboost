# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClaudeBoost is a Claude Code MCP plugin that enhances user prompts before sending them to Claude. It consists of two parts:

1. **MCP Server** (Python) — registers a `boost_prompt` tool that classifies prompt domain, rewrites the prompt using Claude API, and logs results
2. **Web Dashboard** (Next.js + Tailwind) — displays boost history, ratings/feedback, domain stats, and per-domain constraint management

All data is stored locally in `~/.claudeboost/history.json` and `~/.claudeboost/config.json`.

The full build specification is in `.claude/docs/CLAUDEBOOST_EXPLANATION.md` — read it before writing any code. Workflow preferences are in `.claude/docs/workflow_orchestration.md`.

## Architecture

### MCP Server (`mcp-server/`)
- `server.py` — Entry point, registers `boost_prompt` tool via MCP stdio server
- `classifier.py` — Calls Claude API to classify prompts into one of 7 domains: `data_science`, `data_engineering`, `business_analytics`, `general_coding`, `documentation`, `devops`, `other`
- `enhancer.py` — Calls Claude API to rewrite prompts using domain-specific rules + user feedback context
- `feedback.py` — Manages read/write to `~/.claudeboost/` JSON files (history + config)

Dependency order: `feedback.py` → `classifier.py` → `enhancer.py` → `server.py` (server imports from the other three)

### Web Dashboard (`web-dashboard/`)
- Next.js App Router with Tailwind CSS
- API routes read/write the same `~/.claudeboost/` JSON files the MCP server uses
- Pages: History (`/`), Stats (`/stats`), Constraints (`/constraints`)
- `GET/PATCH /api/history` — read history, update rating/feedback/chosen
- `GET/POST /api/constraints` — read/write per-domain constraint strings

## Commands

### MCP Server
```bash
cd mcp-server
pip install -r requirements.txt    # deps: mcp, anthropic
python server.py                   # start MCP server (stdio mode)
```

### Web Dashboard
```bash
cd web-dashboard
npm install
npm run dev                        # https://claudeboost.vercel.app
```

### MCP Registration
Add to `~/.claude/mcp_settings.json`:
```json
{
  "mcpServers": {
    "claudeboost": {
      "command": "python",
      "args": ["/absolute/path/to/claudeboost/mcp-server/server.py"]
    }
  }
}
```

## Build Order

Follow this sequence to avoid import errors (detailed in `.claude/docs/CLAUDEBOOST_EXPLANATION.md` Section 7):

1. Create folder structure
2. `requirements.txt` → `pip install`
3. `feedback.py` → `classifier.py` → `enhancer.py` → `server.py`
4. Test MCP server: `python server.py`
5. Register MCP server, restart Claude Code
6. Bootstrap Next.js dashboard: `npx create-next-app@latest web-dashboard --typescript --tailwind --app --no-src-dir`
7. API routes → layout → pages (history, stats, constraints)

## Key Design Decisions

- Claude API model for classification and enhancement: `claude-opus-4-5`
- `ANTHROPIC_API_KEY` must be set in the environment (no `.env` file)
- History IDs are 1-indexed, auto-incremented by array length
- Classifier returns `"other"` on API failure (never crashes)
- Enhancer returns original prompt with `[ClaudeBoost: enhancement failed]` note on API failure
- Malformed JSON files are auto-reset to defaults rather than erroring

## Note

This repo is currently in the specification phase. The `mcp-server/` and `web-dashboard/` directories do not exist yet. The git root is the user's home directory — this project lives in `~/Documents/claudeboost/` as an untracked subdirectory.
