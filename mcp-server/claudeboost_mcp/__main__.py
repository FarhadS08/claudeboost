"""Entry point for `python3 -m claudeboost_mcp` and `claudeboost-mcp` command."""

import asyncio
from .server import main


def run():
    """Entry point for the `claudeboost-mcp` console script."""
    asyncio.run(main())


if __name__ == "__main__":
    run()
