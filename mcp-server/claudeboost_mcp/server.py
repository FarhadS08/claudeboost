from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio
import json
import time
from .classifier import classify_domain
from .enhancer import enhance_prompt
from .db import load_feedback_context, log_to_history, load_settings, save_settings
from .feedback import get_streak
from .scorer import score_prompt, get_weighted_weakest
from .auth import is_authenticated, get_login_message, open_login_page, get_auth_status, get_user_id
from .config import LOGIN_URL
from .rate_limiter import check_rate_limit, record_call, get_usage
from .audit import log_audit
from . import __version__

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
                "x-schema-version": "1.1",
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
            name="log_boost",
            description=(
                "Log a completed boost to history. Call this AFTER the user has made their final choice "
                "(use boosted, keep original, or refined version). Do NOT call during generation."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "original": {"type": "string", "description": "The original user prompt"},
                    "boosted": {"type": "string", "description": "The final prompt version the user chose (after all refinements)"},
                    "domain": {"type": "string", "description": "The classified domain"},
                    "chosen": {"type": "string", "enum": ["boosted", "original", "refined"], "description": "What the user chose: boosted=accepted, original=kept original, refined=edited then accepted"},
                },
                "required": ["original", "boosted", "domain", "chosen"],
            },
        ),
        Tool(
            name="boost_help",
            description="Show ClaudeBoost help: available commands, settings, and usage instructions.",
            inputSchema={"type": "object", "properties": {}},
        ),
        Tool(
            name="boost_status",
            description="Show current ClaudeBoost auth status: which account is connected, settings, and sync state.",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "boost_prompt":
        return await _handle_boost(arguments)
    elif name == "log_boost":
        return await _handle_log_boost(arguments)
    elif name == "boost_settings":
        return await _handle_settings(arguments)
    elif name == "boost_help":
        return await _handle_help()
    elif name == "boost_status":
        return await _handle_status()
    else:
        raise ValueError(f"Unknown tool: {name}")


async def _handle_boost(arguments: dict) -> list[TextContent]:
    if not is_authenticated():
        open_login_page()
        return [TextContent(type="text", text=json.dumps({
            "error": "auth_required",
            "message": get_login_message(),
            "login_url": LOGIN_URL
        }))]

    user_id = get_user_id() or "local"
    rate_check = check_rate_limit(user_id)
    if not rate_check["allowed"]:
        log_audit("boost", user_id, result="rate_limited",
                  metadata={"reason": rate_check["reason"]})
        return [TextContent(type="text", text=json.dumps({
            "error": "rate_limit_exceeded",
            "message": rate_check["reason"],
            "retry_after": rate_check.get("retry_after"),
        }))]

    original = arguments["prompt"]
    settings = load_settings()
    level = settings.get("boost_level", "medium")

    original_score = score_prompt(original)

    SKIP_THRESHOLD = 20
    if original_score["total"] >= SKIP_THRESHOLD:
        strong_dims = [k for k, v in original_score["dimensions"].items() if v >= 4]
        return [TextContent(type="text", text=json.dumps({
            "skipped": True,
            "reason": "already_good",
            "domain": classify_domain(original),
            "original": original,
            "original_score": original_score,
            "strong_dimensions": strong_dims,
            "streak": get_streak(),
        }))]

    domain = classify_domain(original)
    feedback_context = load_feedback_context(domain)

    level_thresholds = {"light": 2, "medium": 3, "full": 5}
    threshold = level_thresholds.get(level, 3)
    weak_dims = get_weighted_weakest(original_score["dimensions"], domain, threshold)

    weak_labels = {
        "specificity": "file references & specific behavior",
        "verification": "tests & success criteria",
        "context": "codebase references & patterns",
        "constraints": "boundaries & non-goals",
        "structure": "organized sections & steps",
        "output_definition": "deliverables & output format",
    }
    improvements_added = [weak_labels.get(d, d) for d in weak_dims[:3]]

    record_call(user_id)

    t0 = time.monotonic()
    boosted = enhance_prompt(original, domain, feedback_context, level=level, weak_dimensions=weak_dims)
    latency_ms = int((time.monotonic() - t0) * 1000)

    boosted_score = score_prompt(boosted)
    improvement = boosted_score["total"] - original_score["total"]

    log_audit("boost", user_id, domain=domain, prompt=original, result="success",
              metadata={"level": level, "improvement": improvement},
              latency_ms=latency_ms)

    return [TextContent(type="text", text=json.dumps({
        "domain": domain,
        "original": original,
        "boosted": boosted,
        "level": level,
        "original_score": original_score,
        "boosted_score": boosted_score,
        "improvement": improvement,
        "improvements_added": improvements_added,
        "streak": get_streak(),
        "server_version": __version__,
    }))]


async def _handle_log_boost(arguments: dict) -> list[TextContent]:
    if not is_authenticated():
        return [TextContent(type="text", text=json.dumps({"ok": False, "error": "not authenticated"}))]

    original = arguments["original"]
    boosted = arguments["boosted"]
    domain = arguments["domain"]
    chosen = arguments.get("chosen", "boosted")

    original_score = arguments.get("original_score")
    boosted_score = arguments.get("boosted_score")
    if isinstance(original_score, str):
        try:
            original_score = json.loads(original_score)
        except (json.JSONDecodeError, TypeError):
            original_score = None
    if isinstance(boosted_score, str):
        try:
            boosted_score = json.loads(boosted_score)
        except (json.JSONDecodeError, TypeError):
            boosted_score = None

    boosted_score = score_prompt(boosted)
    original_score = score_prompt(original)

    log_to_history(original, boosted, domain,
                   original_score=original_score, boosted_score=boosted_score,
                   chosen=chosen)

    log_audit("log_boost", get_user_id() or "local", domain=domain,
              prompt=original, result="success", metadata={"chosen": chosen})

    return [TextContent(type="text", text=json.dumps({"ok": True, "chosen": chosen}))]


async def _handle_settings(arguments: dict) -> list[TextContent]:
    if not is_authenticated():
        open_login_page()
        return [TextContent(type="text", text=json.dumps({
            "error": "auth_required",
            "message": get_login_message(),
            "login_url": LOGIN_URL
        }))]

    action = arguments.get("action", "get")
    settings = load_settings()

    if action == "get":
        return [TextContent(type="text", text=json.dumps(settings))]

    if "boost_level" in arguments:
        settings["boost_level"] = arguments["boost_level"]
    if "auto_boost" in arguments:
        settings["auto_boost"] = arguments["auto_boost"]

    save_settings(settings)
    return [TextContent(type="text", text=json.dumps(settings))]


async def _handle_help() -> list[TextContent]:
    help_text = json.dumps({
        "commands": {
            "/boost <prompt>": "Manually boost a specific prompt",
            "/boost --login": "Sign in to ClaudeBoost (opens browser)",
            "/boost --logout": "Sign out of ClaudeBoost",
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


async def _handle_status() -> list[TextContent]:
    status = get_auth_status()
    settings = load_settings() if status["authenticated"] else {"boost_level": "medium", "auto_boost": True}
    streak = get_streak()
    user_id = get_user_id() or "local"
    return [TextContent(type="text", text=json.dumps({
        **status,
        "settings": settings,
        "streak": streak,
        "usage": get_usage(user_id),
        "login_url": LOGIN_URL,
    }))]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
