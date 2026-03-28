from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio
import json
from classifier import classify_domain
from enhancer import enhance_prompt
from feedback import load_feedback_context, log_to_history

app = Server("claudeboost")


@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="boost_prompt",
            description=(
                "Boost your prompt before sending to Claude. Detects domain, rewrites for clarity "
                "and specificity, shows original vs boosted side by side. You choose which to send."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The prompt to enhance",
                    }
                },
                "required": ["prompt"],
            },
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name != "boost_prompt":
        raise ValueError(f"Unknown tool: {name}")

    original = arguments["prompt"]
    domain = classify_domain(original)
    feedback_context = load_feedback_context(domain)
    boosted = enhance_prompt(original, domain, feedback_context)
    log_to_history(original, boosted, domain)

    output = (
        "╔══════════════════════════════════════════════════╗\n"
        "║              ⚡ CLAUDEBOOST                      ║\n"
        "╚══════════════════════════════════════════════════╝\n"
        "\n"
        "🔵 ORIGINAL PROMPT\n"
        "──────────────────\n"
        f"{original}\n"
        "\n"
        f"✨ BOOSTED PROMPT  [Domain: {domain}]\n"
        "──────────────────────────────────────\n"
        f"{boosted}\n"
        "\n"
        "──────────────────────────────────────────────────\n"
        "Reply YES to use the boosted prompt, or NO to keep your original.\n"
        "View history and rate boosts at: http://localhost:3000"
    )

    return [TextContent(type="text", text=output)]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
