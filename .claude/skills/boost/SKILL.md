---
name: boost
description: Enhance a prompt using ClaudeBoost before executing it. Classifies domain, rewrites with enterprise playbook rules, shows comparison, and lets user choose.
---

# Boost Prompt

Enhance the user's prompt using the ClaudeBoost MCP server, then present a choice.

## Instructions

1. Call the `boost_prompt` MCP tool with the user's prompt: `$ARGUMENTS`

2. Parse the JSON output to extract: `domain`, `original`, and `boosted`

3. Display the FULL comparison using this EXACT markdown format. Show EVERYTHING — do not truncate or summarize:

```
⚡ **CLAUDEBOOST** — Domain: **{domain_with_underscores_replaced_by_spaces_and_capitalized}**

---

> 📝 **Original:** {original}

---

### ✨ Boosted Prompt

{paste the COMPLETE boosted prompt here — every single line, no truncation}

---
```

4. AFTER displaying the full comparison above, present the choice using `AskUserQuestion` with these EXACT settings:
   - question: "What would you like to do?"
   - header: "ClaudeBoost"
   - Option 1:
     - label: "✨ Use boosted prompt (Recommended)"
     - description: "Execute the enhanced version shown above"
   - Option 2:
     - label: "📝 Add notes & refine"
     - description: "Give feedback to refine the boosted prompt (e.g. 'use PyTorch instead of sklearn', 'add logging')"
   - Option 3:
     - label: "🚫 Keep original"
     - description: "Ignore the boost and use your original prompt"
   - Do NOT use previews on any option — the full prompts are already displayed above

5. Based on the user's choice:
   - If "Use boosted prompt": Execute the boosted prompt as the user's new task. Do NOT mention ClaudeBoost again — just do the work.
   - If "Add notes & refine": Ask the user for their notes using AskUserQuestion:
     - question: "What should be changed in the boosted prompt?"
     - header: "Refine"
     - 1 option: label: "Done", description: "Use the notes field below"
     - The user will type their notes in the "Other" text field or the Notes field.
     Then take the boosted prompt + user notes and refine it yourself inline — apply the notes to modify the boosted prompt. Display the refined version using the same full markdown format (step 3) and present the choice modal again (step 4). Repeat this loop until the user picks "Use boosted prompt" or "Keep original".
   - If "Keep original": Execute the original prompt as the user's task.
   - If "Other": Execute whatever the user typed.

## Important

- Do NOT skip the AskUserQuestion step. Always show the modal.
- Do NOT truncate or summarize the boosted prompt. Show the COMPLETE text in the markdown section.
- Do NOT add extra commentary between the comparison and the modal.
- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
  Do NOT fall back to manual enhancement — that defeats the purpose of the tool.
