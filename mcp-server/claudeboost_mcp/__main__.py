"""Entry point for `python3 -m claudeboost_mcp` and `claudeboost-mcp` command."""

import asyncio
import sys


def run():
    """Entry point for the `claudeboost-mcp` console script."""
    if len(sys.argv) > 1 and sys.argv[1] in ("--setup", "setup"):
        from .setup import run_setup
        run_setup()
    elif len(sys.argv) > 1 and sys.argv[1] in ("--login", "login"):
        from .cli_login import run_login
        run_login()
    elif len(sys.argv) > 1 and sys.argv[1] in ("--logout", "logout"):
        from .auth import delete_auth, is_authenticated
        if is_authenticated():
            delete_auth()
            print("✅ Logged out of ClaudeBoost.")
        else:
            print("Not logged in.")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--delete-my-data", "delete-my-data"):
        _run_delete_data()
    elif len(sys.argv) > 1 and sys.argv[1] in ("--status", "status"):
        from .auth import get_auth_status
        status = get_auth_status()
        if status["authenticated"]:
            print(f"✅ Logged in as: {status['email']}")
            print(f"   User ID: {status['user_id']}")
        else:
            print("❌ Not logged in. Run: claudeboost-mcp --login")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--doctor", "doctor"):
        _run_doctor()
    elif len(sys.argv) > 1 and sys.argv[1] in ("--version", "-v"):
        from . import __version__
        print(f"claudeboost-mcp v{__version__}")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--help", "-h"):
        print("claudeboost-mcp — MCP server for Claude Code prompt enhancement")
        print()
        print("Usage:")
        print("  claudeboost-mcp              Start the MCP server (used by Claude Code)")
        print("  claudeboost-mcp --setup      Set up ClaudeBoost (MCP + skills + login)")
        print("  claudeboost-mcp --login      Sign in to ClaudeBoost")
        print("  claudeboost-mcp --logout     Sign out")
        print("  claudeboost-mcp --status     Show current auth status")
        print("  claudeboost-mcp --doctor          Diagnose issues")
        print("  claudeboost-mcp --delete-my-data  Delete all your data (GDPR)")
        print("  claudeboost-mcp --version         Show version")
        print()
        print("After setup, restart Claude Code and use /boost")
    else:
        from .server import main
        asyncio.run(main())


def _run_doctor():
    """Diagnose every possible failure point."""
    import os
    import json
    import subprocess
    import shutil

    print("🔍 ClaudeBoost Doctor")
    print("=" * 50)
    issues = []

    # 1. Package version
    from . import __version__
    print(f"\n1. Package: claudeboost-mcp v{__version__} ✅")

    # 2. Python path
    print(f"2. Python: {sys.executable} ✅")

    # 3. MCP server can start
    print("3. MCP server: ", end="")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "claudeboost_mcp", "--version"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            print(f"{result.stdout.strip()} ✅")
        else:
            print(f"❌ Failed: {result.stderr.strip()[:80]}")
            issues.append("MCP server can't start")
    except Exception as e:
        print(f"❌ Error: {e}")
        issues.append("MCP server can't start")

    # 4. Claude CLI
    print("4. Claude CLI: ", end="")
    from .setup import _find_claude_cli
    claude_path = _find_claude_cli()
    if claude_path:
        print(f"{claude_path} ✅")
    else:
        print("❌ Not found in PATH")
        issues.append("Claude CLI not in PATH — MCP may not be registered")

    # 5. MCP registration
    print("5. MCP config: ", end="")
    mcp_file = os.path.expanduser("~/.claude/mcp_settings.json")
    if os.path.exists(mcp_file):
        try:
            with open(mcp_file) as f:
                config = json.load(f)
            if "claudeboost" in config.get("mcpServers", {}):
                entry = config["mcpServers"]["claudeboost"]
                cmd = entry.get("command", "?")
                print(f"✅ Registered (command: {cmd})")
                # Verify the command exists
                if not os.path.isfile(cmd) and not shutil.which(cmd):
                    print(f"   ⚠ WARNING: {cmd} not found on disk!")
                    issues.append(f"MCP command path '{cmd}' doesn't exist")
            else:
                print("❌ ClaudeBoost not in config")
                issues.append("ClaudeBoost not registered in mcp_settings.json")
        except Exception as e:
            print(f"❌ Can't read: {e}")
            issues.append("mcp_settings.json is corrupted")
    else:
        print("❌ File doesn't exist")
        issues.append("~/.claude/mcp_settings.json missing")

    # Also check if claude mcp list shows it
    if claude_path:
        print("   Checking `claude mcp list`: ", end="")
        try:
            result = subprocess.run(
                [claude_path, "mcp", "list"],
                capture_output=True, text=True, timeout=10
            )
            if "claudeboost" in result.stdout.lower():
                print("✅ Found")
            else:
                print("⚠ Not listed (may need restart)")
        except Exception:
            print("⚠ Couldn't check")

    # 6. Skills
    print("6. Skills: ", end="")
    skills_dir = os.path.expanduser("~/.claude/skills")
    missing_skills = []
    for skill in ["boost", "boost-help", "boost-settings"]:
        skill_file = os.path.join(skills_dir, skill, "SKILL.md")
        if not os.path.exists(skill_file):
            missing_skills.append(skill)
    if not missing_skills:
        print("✅ All installed")
    else:
        print(f"❌ Missing: {', '.join(missing_skills)}")
        issues.append(f"Skills missing: {', '.join(missing_skills)}")

    # 7. API key
    print("7. API key: ", end="")
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    config_env = os.path.expanduser("~/.claudeboost/config.env")
    if api_key:
        print(f"✅ Set in env ({api_key[:12]}...)")
    elif os.path.exists(config_env):
        print(f"✅ Found in {config_env}")
    else:
        print("❌ Not set")
        issues.append("ANTHROPIC_API_KEY not set")

    # 8. Auth
    print("8. Auth: ", end="")
    auth_file = os.path.expanduser("~/.claudeboost/auth.json")
    if os.path.exists(auth_file):
        try:
            from .auth import get_auth_status
            status = get_auth_status()
            if status["authenticated"]:
                print(f"✅ Logged in as {status['email']}")
            else:
                print("❌ Token invalid")
                issues.append("Auth token invalid — run claudeboost-mcp --login")
        except Exception:
            print("❌ Can't read auth")
            issues.append("auth.json corrupted")
    else:
        print("❌ Not logged in")
        issues.append("Not logged in — run claudeboost-mcp --login")

    # 9. Supabase connection
    print("9. Supabase: ", end="")
    try:
        from .db import _supabase_request
        result = _supabase_request("GET", "boost_history?limit=1")
        if result is not None:
            print("✅ Connected")
        else:
            print("❌ Failed (token may be expired)")
            issues.append("Supabase connection failed")
    except Exception as e:
        print(f"❌ Error: {e}")
        issues.append("Supabase connection error")

    # Summary
    print()
    print("=" * 50)
    if not issues:
        print("✅ Everything looks good! Restart Claude Code and use /boost.")
    else:
        print(f"❌ Found {len(issues)} issue(s):")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
        print()
        print("Fix: Run `claudeboost-mcp --setup` to reconfigure.")
        if "not in PATH" in str(issues):
            print(f"     Then manually: claude mcp add claudeboost -- {sys.executable} -m claudeboost_mcp")


def _run_delete_data():
    """Delete all user data — GDPR right to erasure."""
    print("⚠️  This will permanently delete ALL your ClaudeBoost data.")
    print("   - All boost history")
    print("   - All constraints and settings")
    print("   - Your auth credentials")
    print()
    confirm = input("Type 'delete my data' to confirm: ").strip()
    if confirm != "delete my data":
        print("Cancelled.")
        return

    from .db import delete_user_data
    deleted = delete_user_data()

    print()
    print("✅ Data deletion complete:")
    for key, done in deleted.items():
        status = "✅" if done else "⚠ (not found or skipped)"
        print(f"   {key}: {status}")
    print()
    print("All your ClaudeBoost data has been erased.")


if __name__ == "__main__":
    run()
