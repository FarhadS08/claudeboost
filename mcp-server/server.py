from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio
import json
from classifier import classify_domain
from enhancer import enhance_prompt
from feedback import load_feedback_context, log_to_history, load_settings, save_settings

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
        ),
        Tool(
            name="boost_settings",
            description=(
                "View or update ClaudeBoost settings. "
                "Get current settings or change boost_level (light/medium/full) and auto_boost (true/false)."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["get", "set"],
                        "description": "get = view current settings, set = update settings",
                    },
                    "boost_level": {
                        "type": "string",
                        "enum": ["light", "medium", "full"],
                        "description": "Boost intensity: light (clarify only), medium (add structure + verification), full (enterprise playbook)",
                    },
                    "auto_boost": {
                        "type": "boolean",
                        "description": "Whether to auto-boost all task prompts",
                    },
                },
                "required": ["action"],
            },
        ),
        Tool(
            name="boost_help",
            description="Show ClaudeBoost help: available commands, settings, and usage instructions.",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "boost_prompt":
        return await _handle_boost(arguments)
    elif name == "boost_settings":
        return await _handle_settings(arguments)
    elif name == "boost_help":
        return await _handle_help()
    else:
        raise ValueError(f"Unknown tool: {name}")


async def _handle_boost(arguments: dict) -> list[TextContent]:
    original = arguments["prompt"]
    settings = load_settings()
    level = settings.get("boost_level", "medium")

    domain = classify_domain(original)
    feedback_context = load_feedback_context(domain)
    boosted = enhance_prompt(original, domain, feedback_context, level=level)
    log_to_history(original, boosted, domain)

    result = json.dumps({
        "domain": domain,
        "original": original,
        "boosted": boosted,
        "level": level,
    })

    return [TextContent(type="text", text=result)]


async def _handle_settings(arguments: dict) -> list[TextContent]:
    action = arguments.get("action", "get")
    settings = load_settings()

    if action == "get":
        result = json.dumps(settings)
        return [TextContent(type="text", text=result)]

    if "boost_level" in arguments:
        settings["boost_level"] = arguments["boost_level"]
    if "auto_boost" in arguments:
        settings["auto_boost"] = arguments["auto_boost"]

    save_settings(settings)
    result = json.dumps(settings)
    return [TextContent(type="text", text=result)]


async def _handle_help() -> list[TextContent]:
    help_text = json.dumps({
        "commands": {
            "/boost <prompt>": "Manually boost a specific prompt",
            "/boost-settings": "View or change ClaudeBoost settings",
            "/boost-help": "Show this help message",
            "--raw": "Add to end of any prompt to skip boost for that one time",
        },
        "settings": {
            "boost_level": {
                "current": load_settings().get("boost_level", "medium"),
                "options": {
                    "light": "Clarify + structure only. Minimal changes, stays close to original.",
                    "medium": "Add structure, constraints, and brief verification. Balanced.",
                    "full": "Full enterprise playbook with anti-patterns, metrics, and detailed acceptance criteria.",
                },
            },
            "auto_boost": {
                "current": load_settings().get("auto_boost", True),
                "description": "When true, all task prompts are automatically boosted.",
            },
        },
    })
    return [TextContent(type="text", text=help_text)]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
