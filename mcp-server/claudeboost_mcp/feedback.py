import os
import json
from datetime import datetime, timezone

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
HISTORY_FILE = os.path.join(CLAUDEBOOST_DIR, "history.json")
CONFIG_FILE = os.path.join(CLAUDEBOOST_DIR, "config.json")
SETTINGS_FILE = os.path.join(CLAUDEBOOST_DIR, "settings.json")

DEFAULT_CONFIG = {
    "data_science": "",
    "data_engineering": "",
    "business_analytics": "",
    "general_coding": "",
    "documentation": "",
    "devops": "",
    "other": "",
}


def ensure_files():
    """Create ~/.claudeboost dir and initialise history/config files if absent."""
    os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)

    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w") as f:
            json.dump([], f)

    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "w") as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)


def log_to_history(original: str, boosted: str, domain: str, original_score: dict = None, boosted_score: dict = None, chosen: str = None) -> None:
    """Append a new prompt-boost entry to history.json."""
    ensure_files()

    with open(HISTORY_FILE, "r") as f:
        try:
            history = json.load(f)
        except json.JSONDecodeError:
            history = []

    next_id = max((e.get("id", 0) for e in history), default=0) + 1
    entry = {
        "id": next_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "domain": domain,
        "original": original,
        "boosted": boosted,
        "chosen": chosen,
        "rating": None,
        "feedback": "",
        "original_score": original_score,
        "boosted_score": boosted_score,
    }
    history.append(entry)

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)


def load_feedback_context(domain: str) -> str:
    """Return constraint + recent feedback for a domain as a single string."""
    ensure_files()

    # Load history
    with open(HISTORY_FILE, "r") as f:
        try:
            history = json.load(f)
        except json.JSONDecodeError:
            history = []

    # Filter to matching domain entries that have non-empty feedback
    matching = [
        e for e in history
        if e.get("domain") == domain and e.get("feedback", "")
    ]
    # Take last 5
    recent = matching[-5:]

    # Load config
    with open(CONFIG_FILE, "r") as f:
        try:
            config = json.load(f)
        except json.JSONDecodeError:
            config = DEFAULT_CONFIG

    constraint = config.get(domain, "")

    parts = []
    if constraint:
        parts.append(constraint)
    for entry in recent:
        parts.append(entry["feedback"])

    return " | ".join(parts)


DEFAULT_SETTINGS = {
    "boost_level": "medium",
    "auto_boost": True
}


def load_settings() -> dict:
    ensure_files()
    if not os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "w") as f:
            json.dump(DEFAULT_SETTINGS, f, indent=2)
        return dict(DEFAULT_SETTINGS)
    try:
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, ValueError):
        with open(SETTINGS_FILE, "w") as f:
            json.dump(DEFAULT_SETTINGS, f, indent=2)
        return dict(DEFAULT_SETTINGS)


def save_settings(settings: dict) -> None:
    ensure_files()
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)


def get_streak() -> dict:
    """Calculate the current boost streak (consecutive days with boosts)."""
    ensure_files()
    try:
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
    except (json.JSONDecodeError, ValueError):
        return {"streak": 0, "total_boosts": 0, "today_boosts": 0}

    if not history:
        return {"streak": 0, "total_boosts": 0, "today_boosts": 0}

    # Get unique boost dates
    dates = set()
    for entry in history:
        ts = entry.get("timestamp", "")
        if ts:
            dates.add(ts[:10])  # YYYY-MM-DD

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_boosts = sum(1 for e in history if e.get("timestamp", "")[:10] == today)

    # Calculate streak
    sorted_dates = sorted(dates, reverse=True)
    streak = 0
    check_date = datetime.now(timezone.utc).date()

    for date_str in sorted_dates:
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            continue

        if d == check_date:
            streak += 1
            check_date -= __import__("datetime").timedelta(days=1)
        elif d == check_date - __import__("datetime").timedelta(days=1):
            # Allow for "yesterday counts if today hasn't boosted yet"
            streak += 1
            check_date = d - __import__("datetime").timedelta(days=1)
        else:
            break

    return {"streak": streak, "total_boosts": len(history), "today_boosts": today_boosts}
