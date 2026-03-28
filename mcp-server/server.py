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
        f"\n📎 Domain: {domain}\n"
        "\n"
        "🔵 ORIGINAL PROMPT\n"
        "──────────────────\n"
        f"{original}\n"
        "\n"
        "✨ BOOSTED PROMPT\n"
        "──────────────────\n"
        f"{boosted}\n"
        "\n"
        "──────────────────────────────────────────────────\n"
        "\n"
        "IMPORTANT INSTRUCTION: You MUST now ask the user to choose between "
        "the original and boosted prompt using the AskUserQuestion tool. "
        "Present both versions clearly and ask: "
        "'Would you like to use the boosted prompt or keep the original?' "
        "with options: 'Use boosted prompt' and 'Keep original'. "
        "If the user chooses the boosted version, execute it as their new prompt. "
        "If they choose the original, execute the original prompt instead."
    )

    return [TextContent(type="text", text=output)]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
