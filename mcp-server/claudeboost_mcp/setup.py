"""Setup command for ClaudeBoost MCP.

Installs MCP server config and skills to the user's Claude Code configuration.
Run with: claudeboost-mcp --setup
"""

import json
import os
import shutil
import sys

CLAUDE_DIR = os.path.expanduser("~/.claude")
MCP_SETTINGS_FILE = os.path.join(CLAUDE_DIR, "mcp_settings.json")
SKILLS_DIR = os.path.join(CLAUDE_DIR, "skills")
BOOST_SKILL = """---
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
Do NOT call any MCP tools. STOP here.

**If `$ARGUMENTS` is `--help` or `help`:**
Invoke the `/boost-help` skill instead.
STOP here.

**If `$ARGUMENTS` is `--logout` or `logout`:**
Delete the auth file using Bash:
```bash
rm -f ~/.claudeboost/auth.json
```
Then display: `✅ **Logged out of ClaudeBoost.** Run /boost --login to sign in again.`
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

5. Track "current_boosted" — starts as the boosted prompt, updates on each refinement.

6. Based on the user's choice:
   - If "Use boosted prompt":
     1. Call `log_boost` with: `{"original": original, "boosted": current_boosted, "domain": domain, "chosen": "boosted"}`
        — current_boosted is the LATEST version after ALL refinements
     2. Execute current_boosted as the user's task.
   - If "Add notes & refine":
     1. Output: `📝 **Type your notes below**`
     2. STOP. When user replies, apply notes to current_boosted, update current_boosted.
     3. Display refined version, present choice again. Repeat.
   - If "Keep original":
     1. Call `log_boost` with: `{"original": original, "boosted": original, "domain": domain, "chosen": "original"}`
     2. Execute original.
   - If "Other":
     1. Call `log_boost` with: `{"original": original, "boosted": user_text, "domain": domain, "chosen": "refined"}`
     2. Execute user's text.

**CRITICAL: `log_boost` boosted field = the FINAL text after ALL refinements.**

**CRITICAL: Only call `log_boost` ONCE, after the user's FINAL choice.**

## Important

- Do NOT skip the AskUserQuestion step. Always show the modal.
- Do NOT truncate or summarize the boosted prompt. Show the COMPLETE text in the markdown section.
- Do NOT add extra commentary between the comparison and the modal.
- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
  Do NOT fall back to manual enhancement — that defeats the purpose of the tool.

## Authentication

If the MCP tool returns a JSON response with `"error": "auth_required"`, display this message:

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
"""

BOOST_HELP_SKILL = """---
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
| `/boost --login` | Sign in to ClaudeBoost (opens browser) |
| `/boost --logout` | Sign out of ClaudeBoost |
| `/boost-settings` | View current settings |
| `/boost-settings --level <light\\|medium\\|full>` | Change boost intensity |
| `/boost-settings --auto <true\\|false>` | Toggle auto-boost |
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
"""

BOOST_SETTINGS_SKILL = """---
name: boost-settings
description: "View or change ClaudeBoost settings. Usage: /boost-settings, /boost-settings --level light, /boost-settings --auto false"
---

# ClaudeBoost Settings

## Instructions

1. If `$ARGUMENTS` is empty, call the `boost_settings` MCP tool with `{"action": "get"}` and display current settings.

2. If `$ARGUMENTS` contains flags, parse them:
   - `--level light` or `--level medium` or `--level full` or `-l light` etc → call `boost_settings` with `{"action": "set", "boost_level": "..."}`
   - `--auto true` or `--auto false` or `-a true` etc → call `boost_settings` with `{"action": "set", "auto_boost": true/false}`

3. After changing, display: `✅ **Updated:** {setting} → `{new_value}``

## Important

- If the MCP tool is unavailable, tell the user: "ClaudeBoost MCP server is not connected. Run `/mcp` to check status."
"""


def run_setup():
    """Set up ClaudeBoost: install MCP config and skills."""
    print("⚡ ClaudeBoost Setup")
    print("=" * 40)
    print()

    # 1. Check for Anthropic API key
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        api_key = input("Enter your Anthropic API key (sk-ant-...): ").strip()
        if not api_key:
            print("❌ API key is required. Set ANTHROPIC_API_KEY env var or enter it here.")
            sys.exit(1)

    # 2. Find claudeboost-mcp command path
    cmd_path = shutil.which("claudeboost-mcp")
    if not cmd_path:
        cmd_path = "claudeboost-mcp"

    # 3. Create/update MCP settings
    print("📝 Configuring MCP server...")
    os.makedirs(CLAUDE_DIR, exist_ok=True)

    mcp_settings = {}
    if os.path.exists(MCP_SETTINGS_FILE):
        try:
            with open(MCP_SETTINGS_FILE) as f:
                mcp_settings = json.load(f)
        except (json.JSONDecodeError, ValueError):
            mcp_settings = {}

    if "mcpServers" not in mcp_settings:
        mcp_settings["mcpServers"] = {}

    mcp_settings["mcpServers"]["claudeboost"] = {
        "command": cmd_path,
        "env": {"ANTHROPIC_API_KEY": api_key},
    }

    with open(MCP_SETTINGS_FILE, "w") as f:
        json.dump(mcp_settings, f, indent=2)
    print(f"   ✅ MCP server added to {MCP_SETTINGS_FILE}")

    # 4. Install skills
    print("📝 Installing skills...")

    skills = {
        "boost": BOOST_SKILL,
        "boost-help": BOOST_HELP_SKILL,
        "boost-settings": BOOST_SETTINGS_SKILL,
    }

    for name, content in skills.items():
        skill_dir = os.path.join(SKILLS_DIR, name)
        os.makedirs(skill_dir, exist_ok=True)
        with open(os.path.join(skill_dir, "SKILL.md"), "w") as f:
            f.write(content)
        print(f"   ✅ /{ name} skill installed")

    # 5. Save API key to config file (fallback for MCP server)
    print("📝 Saving API key...")
    claudeboost_dir = os.path.expanduser("~/.claudeboost")
    os.makedirs(claudeboost_dir, exist_ok=True)
    config_env_path = os.path.join(claudeboost_dir, "config.env")
    with open(config_env_path, "w") as f:
        f.write(f"ANTHROPIC_API_KEY={api_key}\n")
    os.chmod(config_env_path, 0o600)  # Only owner can read
    print(f"   ✅ API key saved to {config_env_path}")

    # 6. Done
    print()
    print("=" * 50)
    print("✅ ClaudeBoost setup complete!")
    print("=" * 50)
    print()
    print("⚡ AUTO-BOOST IS ON BY DEFAULT")
    print("─" * 50)
    print("Every task prompt you type in Claude Code will")
    print("be automatically enhanced. You DON'T need to")
    print("type /boost every time — just type normally.")
    print()
    print("  You type:  fix the login bug")
    print("  Claude:    → auto-enhances → shows comparison")
    print("             → you choose: Use / Refine / Keep")
    print()
    print("To skip auto-boost for one prompt, add --raw:")
    print("  fix the login bug --raw")
    print()
    print("To turn off auto-boost entirely:")
    print("  /boost-settings --auto false")
    print()
    print("─" * 50)
    print("OTHER COMMANDS")
    print("─" * 50)
    print("  /boost <prompt>         Manually boost a prompt")
    print("  /boost --login          Sign in (sync history)")
    print("  /boost --help           Show all commands")
    print("  /boost-settings         View/change settings")
    print("  /boost-settings -l light  Change boost intensity")
    print()
    print("Next: Restart Claude Code and start typing!")
