import os
import json
from datetime import datetime, timezone

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
HISTORY_FILE = os.path.join(CLAUDEBOOST_DIR, "history.json")
CONFIG_FILE = os.path.join(CLAUDEBOOST_DIR, "config.json")

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


def log_to_history(original: str, boosted: str, domain: str) -> None:
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
        "chosen": None,
        "rating": None,
        "feedback": "",
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
