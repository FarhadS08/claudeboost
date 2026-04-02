"""Rate limiter for ClaudeBoost MCP server.

Tracks per-user API call counts using local JSON storage.
Limits: 100 boosts/hour, 500 boosts/day (configurable).
Falls back silently — never blocks due to its own errors.
"""
import json
import os
from datetime import datetime, timezone

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
RATE_FILE = os.path.join(CLAUDEBOOST_DIR, "rate_limits.json")

# Default limits (overridable via settings)
DEFAULT_LIMITS = {
    "hourly": 100,
    "daily": 500,
}


def _load_rate_data() -> dict:
    if not os.path.exists(RATE_FILE):
        return {}
    try:
        with open(RATE_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def _save_rate_data(data: dict) -> None:
    os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)
    try:
        with open(RATE_FILE, "w") as f:
            json.dump(data, f)
    except OSError:
        pass


def check_rate_limit(user_id: str) -> dict:
    """Check if user is within rate limits.

    Returns:
        {"allowed": True} if within limits
        {"allowed": False, "reason": str, "retry_after": str} if exceeded
    """
    try:
        now = datetime.now(timezone.utc)
        hour_key = now.strftime("%Y-%m-%dT%H")
        day_key = now.strftime("%Y-%m-%d")

        data = _load_rate_data()
        user_data = data.get(user_id, {})

        hourly_count = user_data.get(f"h:{hour_key}", 0)
        daily_count = user_data.get(f"d:{day_key}", 0)

        if hourly_count >= DEFAULT_LIMITS["hourly"]:
            return {
                "allowed": False,
                "reason": f"Hourly limit reached ({DEFAULT_LIMITS['hourly']} boosts/hour). "
                          f"Resets at the top of the hour.",
                "retry_after": f"{60 - now.minute} minutes",
            }

        if daily_count >= DEFAULT_LIMITS["daily"]:
            return {
                "allowed": False,
                "reason": f"Daily limit reached ({DEFAULT_LIMITS['daily']} boosts/day). "
                          f"Resets at midnight UTC.",
                "retry_after": "midnight UTC",
            }

        return {"allowed": True}

    except Exception:
        # Never block the user due to rate limiter errors
        return {"allowed": True}


def record_call(user_id: str) -> None:
    """Increment call counters for the user."""
    try:
        now = datetime.now(timezone.utc)
        hour_key = now.strftime("%Y-%m-%dT%H")
        day_key = now.strftime("%Y-%m-%d")

        data = _load_rate_data()
        if user_id not in data:
            data[user_id] = {}

        user_data = data[user_id]
        user_data[f"h:{hour_key}"] = user_data.get(f"h:{hour_key}", 0) + 1
        user_data[f"d:{day_key}"] = user_data.get(f"d:{day_key}", 0) + 1

        # Prune old keys to keep the file small (keep last 48 hours + 7 days)
        pruned = {}
        for key, val in user_data.items():
            if key.startswith("h:"):
                ts = key[2:]
                if ts >= now.strftime("%Y-%m-%dT%H")[:13]:
                    pruned[key] = val
                    continue
                # Keep last 48 hours
                from datetime import timedelta
                cutoff = (now - timedelta(hours=48)).strftime("%Y-%m-%dT%H")
                if ts >= cutoff:
                    pruned[key] = val
            elif key.startswith("d:"):
                ts = key[2:]
                from datetime import timedelta
                cutoff = (now - timedelta(days=7)).strftime("%Y-%m-%d")
                if ts >= cutoff:
                    pruned[key] = val

        data[user_id] = pruned
        _save_rate_data(data)

    except Exception:
        pass


def get_usage(user_id: str) -> dict:
    """Get current usage counts for a user."""
    try:
        now = datetime.now(timezone.utc)
        hour_key = now.strftime("%Y-%m-%dT%H")
        day_key = now.strftime("%Y-%m-%d")

        data = _load_rate_data()
        user_data = data.get(user_id, {})

        return {
            "hourly_used": user_data.get(f"h:{hour_key}", 0),
            "hourly_limit": DEFAULT_LIMITS["hourly"],
            "daily_used": user_data.get(f"d:{day_key}", 0),
            "daily_limit": DEFAULT_LIMITS["daily"],
        }
    except Exception:
        return {
            "hourly_used": 0,
            "hourly_limit": DEFAULT_LIMITS["hourly"],
            "daily_used": 0,
            "daily_limit": DEFAULT_LIMITS["daily"],
        }
