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

---

💡 **Auto-boost is ON** — every task prompt you type is automatically enhanced. You don't need to type `/boost` every time — just type normally!

Example: type `fix the login bug` → ClaudeBoost auto-enhances → you choose the version you want.

---

**Commands:**
| Command | What it does |
|---------|-------------|
| Just type normally | Auto-boosts your prompt |
| `<prompt> --raw` | Skip boost for one prompt |
| `/boost <prompt>` | Manually boost a specific prompt |
| `/boost --login` | Sign in to sync history |
| `/boost --help` | Show full command reference |
| `/boost-settings` | View/change settings |
| `/boost-settings -l light` | Switch to light boost |
| `/boost-settings --auto false` | Turn off auto-boost |
```
STOP here. Do NOT call any MCP tools.

**If `$ARGUMENTS` is `--login` or `login`:**
Open the browser to `https://claudeboost.vercel.app/auth/cli-login` using the Bash tool:
```bash
open "https://claudeboost.vercel.app/auth/cli-login"
```
Then display:
```
🔐 **Opening browser for ClaudeBoost login...**

Sign in or create an account at: https://claudeboost.vercel.app/auth/cli-login
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

2. Check if the response has `"skipped": true`. If so, display:
```
✅ **Your prompt scores {original_score.total}/30 — already well-structured!**

No boost needed. Strong dimensions: {list strong_dimensions as comma-separated labels}.

Proceeding with your original prompt.
```
Then execute the original prompt directly. Call `log_boost` with `{"original": original, "boosted": original, "domain": domain, "chosen": "skipped"}`. STOP.

3. If NOT skipped, parse: `domain`, `original`, `boosted`, `level`, `original_score`, `boosted_score`, `improvement`, and `improvements_added`

4. Display the FULL comparison using this EXACT markdown format:

```
⚡ **CLAUDEBOOST** · `{domain}` · Level: `{level}`

📈 **Score: {original_score.total}/30 → {boosted_score.total}/30** (+{improvement})
🔧 **Boost added:** {join improvements_added with ", "}

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

{if streak.streak > 0: show "🔥 **{streak.streak}-day streak** · {streak.total_boosts} total boosts · {streak.today_boosts} today"}
```

5. AFTER displaying the full comparison above, present the choice using `AskUserQuestion` with these EXACT settings:
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

5. **IMPORTANT: Track the "current_boosted" variable.** Initially it equals the boosted prompt from step 2. If the user refines it, update current_boosted to the refined version each time.

6. Based on the user's choice:
   - If "Use boosted prompt":
     1. Call `log_boost` MCP tool with: `{"original": original, "boosted": current_boosted, "domain": domain, "chosen": "boosted"}`
        — `current_boosted` is the LATEST version (may have been refined multiple times)
        — Do NOT pass the first generated version if it was refined
        — Do NOT pass original_score/boosted_score — `log_boost` will re-score the final text
     2. Then execute current_boosted as the user's new task. Do NOT mention ClaudeBoost again.
   - If "Add notes & refine":
     1. Output ONLY: `📝 **Type your notes below** (e.g. "use PyTorch instead of sklearn", "change 95% to 90%")`
     2. STOP and wait for user input.
     3. When the user replies, apply their notes to current_boosted to create a new refined version.
     4. **Update current_boosted** to this new refined version.
     5. Display the refined version using the same markdown format (step 3) and present the choice modal again (step 4).
     6. Repeat until user picks "Use boosted" or "Keep original".
   - If "Keep original":
     1. Call `log_boost` MCP tool with: `{"original": original, "boosted": original, "domain": domain, "chosen": "original"}`
     2. Execute the original prompt as the user's task.
   - If "Other":
     1. Call `log_boost` MCP tool with: `{"original": original, "boosted": user_typed_text, "domain": domain, "chosen": "refined"}`
     2. Execute whatever the user typed.

**CRITICAL: Only call `log_boost` ONCE, after the user's FINAL choice. The `boosted` field in `log_boost` must be the FINAL text the user accepted — after ALL refinements, not the first generated version.**

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
→ https://claudeboost.vercel.app/auth/cli-login

**Commands:**
  /boost --login       Open login page
  /boost --help        Show all commands

After signing in, run your `/boost` command again.
```

Do NOT enhance manually. Do NOT retry. Wait for the user.
