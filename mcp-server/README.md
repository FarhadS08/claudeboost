# ClaudeBoost MCP

> Supercharge your Claude Code prompts with enterprise-grade enhancement.

ClaudeBoost is an MCP server that transforms vague prompts into structured, enterprise-quality instructions. It classifies your prompt's domain, scores it across 6 dimensions, and rewrites it using playbook-powered rules.

## Quick Start

### 1. Install

```bash
pip install claudeboost-mcp
```

### 2. Run setup (asks for API key + optional sign-in)

```bash
claudeboost-mcp --setup
```

### 3. Register MCP server (inside Claude Code)

Open Claude Code and type:
```
/boost --setup
```

Restart Claude Code. Done.

### 4. Use it

```
/boost build me an ETL pipeline
```

Or just type any prompt — ClaudeBoost auto-boosts all task prompts.

## Features

- **7 Domain Detection** — Data Science, Data Engineering, Business Analytics, General Coding, Documentation, DevOps, Other
- **6-Dimension Scoring** — Specificity, Verification, Context, Constraints, Structure, Output (1-5 each, /30 total)
- **3 Boost Levels** — Light (clarify only), Medium (balanced), Full (enterprise playbook)
- **RLHF Feedback Loop** — Rate boosts and leave feedback → improves future enhancements
- **Web Dashboard** — View history, stats, score histograms at [claudeboost.com](https://claudeboost.com)

## Commands

| Command | Description |
|---------|-------------|
| `/boost <prompt>` | Boost a specific prompt |
| `/boost --login` | Sign in (opens browser) |
| `/boost --logout` | Sign out |
| `/boost-settings --level light\|medium\|full` | Change boost intensity |
| `/boost-settings --auto true\|false` | Toggle auto-boost |
| `/boost-help` | Show all commands |
| `--raw` | Add to end of prompt to skip boost |

## Requirements

- Python 3.10+
- Anthropic API key
- Claude Code CLI

## License

MIT
