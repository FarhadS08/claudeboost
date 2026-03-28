---
name: boost-help
description: Show ClaudeBoost help with available commands, settings, and usage guide.
---

# ClaudeBoost Help

## Instructions

1. Call the `boost_help` MCP tool
2. Parse the JSON response and display it using this EXACT format:

```
⚡ **ClaudeBoost Help**

---

### Commands

| Command | Description |
|---------|-------------|
| `/boost <prompt>` | Manually boost a specific prompt |
| `/boost-settings` | View or change settings (level, auto-boost) |
| `/boost-help` | Show this help message |
| `--raw` | Add to end of any prompt to skip boost once |

---

### Boost Levels

| Level | Description |
|-------|-------------|
| `light` | Clarify + structure only. Minimal changes, stays close to original. |
| `medium` | Add structure, constraints, and brief verification. **Balanced.** |
| `full` | Full enterprise playbook with anti-patterns, metrics, and detailed criteria. |

Current level: **{current_level}** · Change: `/boost-settings level <level>`

---

### How It Works

1. You write a prompt → ClaudeBoost classifies the domain automatically
2. Your prompt is enhanced based on the domain + your boost level
3. You see the comparison and choose: **Use boosted** / **Add notes** / **Keep original**
4. Add `--raw` to skip for a single prompt

### Auto-Boost: **{on/off}**

All task prompts are automatically boosted. Questions, git ops, and replies are not boosted.
Change: `/boost-settings auto true` or `/boost-settings auto false`
```

## Important

- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
