---
name: boost
description: Enhance a prompt using ClaudeBoost before executing it. Classifies domain, rewrites with enterprise playbook rules, shows comparison, and lets user choose.
---

# Boost Prompt

Enhance the user's prompt using the ClaudeBoost MCP server, then present a choice.

## Instructions

1. Call the `boost_prompt` MCP tool with the user's prompt: `$ARGUMENTS`
2. Parse the tool output to extract: the original prompt, the boosted prompt, and the domain
3. Present both prompts to the user using the `AskUserQuestion` tool with these exact settings:
   - question: "Which version would you like to use?"
   - header: "ClaudeBoost"
   - Two options with previews showing each prompt:
     - Option 1: label "Use boosted prompt", description "[domain] — enhanced with enterprise playbook rules", preview showing the full boosted prompt text
     - Option 2: label "Keep original", description "Use the original prompt as-is", preview showing the full original prompt text
4. Based on the user's choice:
   - If "Use boosted prompt": Execute the boosted prompt as if the user had typed it
   - If "Keep original": Execute the original prompt as if the user had typed it
   - If "Other" with custom text: Execute whatever the user typed
