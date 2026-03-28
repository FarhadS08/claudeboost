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
| `/boost-settings` | View current settings |
| `/boost-settings --level <light\|medium\|full>` | Change boost intensity |
| `/boost-settings --auto <true\|false>` | Toggle auto-boost |
| `/boost-help` | Show this help message |
| `<prompt> --raw` | Add to end of any prompt to skip boost once |

**Short flags:** `-l` for `--level`, `-a` for `--auto`

---

### Boost Levels

| Level | Flag | Description |
|-------|------|-------------|
| `light` | `--level light` or `-l light` | Clarify + structure only. Minimal changes. |
| `medium` | `--level medium` or `-l medium` | Add structure, constraints, brief verification. **Default.** |
| `full` | `--level full` or `-l full` | Full enterprise playbook with anti-patterns and metrics. |

Current level: **{current_level}** · Change: `/boost-settings -l <level>`

---

### How It Works

1. You write a prompt → ClaudeBoost classifies the domain automatically
2. Your prompt is enhanced based on the domain + your boost level
3. You see the comparison and choose: **Use boosted** / **Add notes** / **Keep original**
4. Add `--raw` to skip for a single prompt

### Auto-Boost: **{on/off}**

All task prompts are automatically boosted. Questions, git ops, and replies are not boosted.
Change: `/boost-settings --auto false` or `/boost-settings -a false`
```

## Important

- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
