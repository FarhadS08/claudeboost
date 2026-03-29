---
name: boost
description: Enhance a prompt using ClaudeBoost before executing it. Classifies domain, rewrites with enterprise playbook rules, shows comparison, and lets user choose.
---

# Boost Prompt

Enhance the user's prompt using the ClaudeBoost MCP server, then present a choice.

## Instructions

**If `$ARGUMENTS` is empty (user just typed `/boost` with nothing after):**
Display this welcome message:
```
⚡ **ClaudeBoost** — Prompt Enhancement for Claude Code

**Quick Start:**
  /boost <your prompt>          Boost a prompt
  /boost --login                Sign in to sync history & settings
  /boost --help                 Show all commands

**Examples:**
  /boost build me a REST API for user management
  /boost fix the login bug in the auth service
  /boost analyze customer churn data

**Settings:**
  /boost-settings               View current settings
  /boost-settings -l light       Change to light boost mode
  /boost-help                   Full command reference

Just type /boost followed by what you want to do.
```
STOP here. Do NOT call any MCP tools.

**If `$ARGUMENTS` is `--login` or `login`:**
Open the browser to `http://localhost:3000/auth/cli-login` using the Bash tool:
```bash
open "http://localhost:3000/auth/cli-login"
```
Then display:
```
🔐 **Opening browser for ClaudeBoost login...**

Sign in or create an account at: http://localhost:3000/auth/cli-login
After signing in, your CLI session will be authenticated.

**Why sign in?**
- Sync boost history across devices
- View analytics at claudeboost.com/dashboard
- Save domain constraints that persist

Run `/boost` again after signing in.
```
STOP here. Do NOT call any MCP tools.

**If `$ARGUMENTS` is `--logout` or `logout`:**
Delete the auth file using Bash:
```bash
rm -f ~/.claudeboost/auth.json
```
Then display: `✅ **Logged out of ClaudeBoost.** Run /boost --login to sign in again.`
STOP here.

**If `$ARGUMENTS` is `--help` or `help`:**
Invoke the `/boost-help` skill instead.
STOP here.

**Otherwise (normal boost):**

1. Call the `boost_prompt` MCP tool with the user's prompt: `$ARGUMENTS`

2. Parse the JSON output to extract: `domain`, `original`, `boosted`, `level`, `original_score`, `boosted_score`, and `improvement`

3. Display the FULL comparison using this EXACT markdown format. Show EVERYTHING — do not truncate or summarize:

```
⚡ **CLAUDEBOOST** · `{domain}` · Level: `{level}` · Score: **{original_score.total}/30 → {boosted_score.total}/30** (+{improvement})

---

> 📝 **Original:** {original}

---

### ✨ Boosted Prompt

{paste the COMPLETE boosted prompt here — every single line, no truncation}

---

📊 **Score Breakdown:**

| Dimension | Before | After |
|-----------|--------|-------|
| Specificity | {original_score.dimensions.specificity} | {boosted_score.dimensions.specificity} |
| Verification | {original_score.dimensions.verification} | {boosted_score.dimensions.verification} |
| Context | {original_score.dimensions.context} | {boosted_score.dimensions.context} |
| Constraints | {original_score.dimensions.constraints} | {boosted_score.dimensions.constraints} |
| Structure | {original_score.dimensions.structure} | {boosted_score.dimensions.structure} |
| Output | {original_score.dimensions.output_definition} | {boosted_score.dimensions.output_definition} |

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
     - description: "Give feedback to refine the boosted prompt"
   - Option 3:
     - label: "🚫 Keep original"
     - description: "Ignore the boost and use your original prompt"
   - Do NOT use previews on any option — the full prompts are already displayed above

5. Based on the user's choice:
   - If "Use boosted prompt":
     1. Call `log_boost` MCP tool with: `{"original": original, "boosted": boosted, "domain": domain, "chosen": "boosted", "original_score": original_score, "boosted_score": boosted_score}`
     2. Then execute the boosted prompt as the user's new task. Do NOT mention ClaudeBoost again.
   - If "Add notes & refine":
     1. Output ONLY: `📝 **Type your notes below** (e.g. "use PyTorch instead of sklearn", "remove the model card section")`
     2. STOP and wait for user input.
     3. When the user replies, refine the prompt inline, display again (step 3), present choice again (step 4).
     4. Repeat until user picks "Use boosted" or "Keep original".
     5. When they finally choose, THEN call `log_boost` with the FINAL version they accepted.
   - If "Keep original":
     1. Call `log_boost` MCP tool with: `{"original": original, "boosted": original, "domain": domain, "chosen": "original", "original_score": original_score, "boosted_score": original_score}`
     2. Execute the original prompt as the user's task.
   - If "Other":
     1. Call `log_boost` MCP tool with: `{"original": original, "boosted": user_typed_text, "domain": domain, "chosen": "refined"}`
     2. Execute whatever the user typed.

**CRITICAL: Only call `log_boost` ONCE, after the user's FINAL choice. Never during generation or refinement loops.**

## Important

- Do NOT skip the AskUserQuestion step. Always show the modal.
- Do NOT truncate or summarize the boosted prompt.
- Do NOT add extra commentary between the comparison and the modal.
- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
  Do NOT fall back to manual enhancement.

## Authentication

If the MCP tool returns a JSON response with `"error": "auth_required"`, display this:

```
🔐 **ClaudeBoost requires authentication.**

A browser window has been opened to sign in. If it didn't open, visit:
→ http://localhost:3000/auth/cli-login

**Commands:**
  /boost --login       Open login page
  /boost --help        Show all commands

After signing in, run your `/boost` command again.
```

Do NOT enhance manually. Do NOT retry. Wait for the user.
