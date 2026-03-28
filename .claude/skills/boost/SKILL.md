---
name: boost
description: Enhance a prompt using ClaudeBoost before executing it. Classifies domain, rewrites with enterprise playbook rules, shows comparison, and lets user choose.
---

# Boost Prompt

Enhance the user's prompt using the ClaudeBoost MCP server, then present a choice.

## Instructions

1. Call the `boost_prompt` MCP tool with the user's prompt: `$ARGUMENTS`

2. Parse the JSON output to extract: `domain`, `original`, and `boosted`

3. Display a rich header using this EXACT markdown format (copy it exactly, filling in the values):

```
⚡ **CLAUDEBOOST** — Domain: **{domain_with_underscores_replaced_by_spaces_and_capitalized}**

---

> 📝 **Original:** {original}

---
```

4. Present the choice using `AskUserQuestion` with these EXACT settings:
   - question: "⚡ Use the boosted version or keep the original?"
   - header: "ClaudeBoost"
   - Option 1:
     - label: "✨ Use boosted prompt (Recommended)"
     - description: "Enhanced with {domain} playbook rules — adds verification, structure, and anti-pattern guards"
     - preview: Format the boosted prompt nicely. Add a header line "✨ BOOSTED PROMPT" followed by a blank line, then the full boosted text. At the end add a blank line and "📎 Domain: {domain} | 🔧 Powered by ClaudeBoost"
   - Option 2:
     - label: "📝 Keep original"
     - description: "Use your prompt unchanged"
     - preview: Format as "📝 ORIGINAL PROMPT" followed by a blank line, then the original text

5. Based on the user's choice:
   - If boosted: Execute the boosted prompt as the user's new task. Do NOT mention ClaudeBoost again — just do the work.
   - If original: Execute the original prompt as the user's task.
   - If "Other": Execute whatever the user typed.

## Important

- Do NOT skip the AskUserQuestion step. Always show the modal.
- Do NOT add extra commentary between the header and the modal — keep it clean and fast.
- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
  Do NOT fall back to manual enhancement — that defeats the purpose of the tool.
