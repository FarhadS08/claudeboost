"""Entry point for `python3 -m claudeboost_mcp` and `claudeboost-mcp` command."""

import asyncio
import sys


def run():
    """Entry point for the `claudeboost-mcp` console script."""
    if len(sys.argv) > 1 and sys.argv[1] in ("--setup", "setup"):
        from .setup import run_setup
        run_setup()
    elif len(sys.argv) > 1 and sys.argv[1] in ("--version", "-v"):
        from . import __version__
        print(f"claudeboost-mcp v{__version__}")
    elif len(sys.argv) > 1 and sys.argv[1] in ("--help", "-h"):
        print("claudeboost-mcp — MCP server for Claude Code prompt enhancement")
        print()
        print("Usage:")
        print("  claudeboost-mcp              Start the MCP server (used by Claude Code)")
        print("  claudeboost-mcp --setup      Set up ClaudeBoost (MCP config + skills)")
        print("  claudeboost-mcp --version    Show version")
        print()
        print("After setup, restart Claude Code and use /boost")
    else:
        from .server import main
        asyncio.run(main())


if __name__ == "__main__":
    run()
