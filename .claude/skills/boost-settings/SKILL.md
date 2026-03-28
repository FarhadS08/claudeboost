---
name: boost-settings
description: "View or change ClaudeBoost settings. Usage: /boost-settings, /boost-settings --level light, /boost-settings --auto false"
---

# ClaudeBoost Settings

## Instructions

1. If `$ARGUMENTS` is empty, call the `boost_settings` MCP tool with `{"action": "get"}` and display current settings using this format:

```
⚙️ **ClaudeBoost Settings**

---

| Setting | Value | Options |
|---------|-------|---------|
| **Boost Level** | `{boost_level}` | `light` · `medium` · `full` |
| **Auto Boost** | `{auto_boost}` | `true` · `false` |

---

**Levels:**
- **light** — Clarify + structure only. Minimal changes.
- **medium** — Add structure, constraints, brief verification. Balanced.
- **full** — Full enterprise playbook with anti-patterns, metrics, detailed criteria.

**Usage:**
`/boost-settings --level light`
`/boost-settings --auto false`
```

2. If `$ARGUMENTS` contains flags, parse them:
   - `--level light` or `--level medium` or `--level full` or `-l light` or `-l medium` or `-l full` → call `boost_settings` with `{"action": "set", "boost_level": "..."}`
   - `--auto true` or `--auto false` or `-a true` or `-a false` → call `boost_settings` with `{"action": "set", "auto_boost": true/false}`
   - Also support without dashes for backward compat: `level light`, `auto false`

3. After changing, display: `✅ **Updated:** {setting} → `{new_value}``

## Important

- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
