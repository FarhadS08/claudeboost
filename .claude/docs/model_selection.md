# Model Selection Strategy

## Problem

Sonnet takes 10-15s per enhancement call. MCP servers have implicit timeouts, causing silent failures where the original prompt is returned unchanged.

## Solution

Use the cheapest model that meets the quality bar for each boost level:

| Level | Model | Max Tokens | Latency | Use Case |
|-------|-------|-----------|---------|----------|
| light | Haiku 4.5 | 200 | 2-3s | Clarify + structure only |
| medium | Haiku 4.5 | 400 | 3-5s | Add structure, constraints, verification |
| full | Sonnet 4 | 600 | 10-15s | Full enterprise playbook |

## Why Not Sonnet for Everything

- Haiku is 5-7x faster and sufficient for light/medium improvements
- MCP tool calls have implicit timeouts (~10-15s) — Sonnet exceeds this regularly
- Cost: Haiku is ~10x cheaper per token than Sonnet
- For light/medium, the quality difference is negligible — the system prompt does the heavy lifting

## Classifier

Always uses Haiku (`claude-haiku-4-5-20251001`, max 20 tokens, ~0.6s). Classification is a simple task that doesn't need a larger model.

## Timeout Handling

The Anthropic client is configured with `timeout=30.0` for the full level. If Sonnet still times out, the error message now includes the actual exception instead of a generic "enhancement failed".

## Files

- `claudeboost_mcp/enhancer.py` — model selection in `model_map` dict
- `claudeboost_mcp/classifier.py` — always Haiku
