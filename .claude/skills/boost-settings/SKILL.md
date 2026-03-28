---
name: boost-settings
description: View or change ClaudeBoost settings (boost level, auto-boost). Usage: /boost-settings or /boost-settings level medium
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

To change: `/boost-settings level light` or `/boost-settings auto false`
```

2. If `$ARGUMENTS` contains a setting to change, parse it:
   - `level light` or `level medium` or `level full` → call `boost_settings` with `{"action": "set", "boost_level": "..."}`
   - `auto true` or `auto false` → call `boost_settings` with `{"action": "set", "auto_boost": true/false}`

3. After changing, display: `✅ **Updated:** {setting} → `{new_value}``

## Important

- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
