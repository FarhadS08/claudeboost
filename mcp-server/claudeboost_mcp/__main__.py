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
        import os
        auth_file = os.path.expanduser("~/.claudeboost/auth.json")
        if os.path.exists(auth_file):
            os.remove(auth_file)
            print("✅ Logged out of ClaudeBoost.")
        else:
            print("Not logged in.")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--status", "status"):
        from .auth import get_auth_status
        status = get_auth_status()
        if status["authenticated"]:
            print(f"✅ Logged in as: {status['email']}")
            print(f"   User ID: {status['user_id']}")
        else:
            print("❌ Not logged in. Run: claudeboost-mcp --login")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--version", "-v"):
        from . import __version__
        print(f"claudeboost-mcp v{__version__}")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--help", "-h"):
        print("claudeboost-mcp — MCP server for Claude Code prompt enhancement")
        print()
        print("Usage:")
        print("  claudeboost-mcp              Start the MCP server (used by Claude Code)")
        print("  claudeboost-mcp --setup      Set up ClaudeBoost (MCP config + skills)")
        print("  claudeboost-mcp --login      Sign in to ClaudeBoost")
        print("  claudeboost-mcp --logout     Sign out")
        print("  claudeboost-mcp --status     Show current auth status")
        print("  claudeboost-mcp --version    Show version")
        print()
        print("After setup, restart Claude Code and use /boost")
    else:
        from .server import main
        asyncio.run(main())


if __name__ == "__main__":
    run()
