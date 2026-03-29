"""CLI authentication for ClaudeBoost MCP server.

Reads auth token from ~/.claudeboost/auth.json.
Falls back to local-only mode if no auth file exists.
"""
import os
import json
import subprocess
import sys

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
AUTH_FILE = os.path.join(CLAUDEBOOST_DIR, "auth.json")
LOGIN_URL = "http://localhost:3000/auth/cli-login"


def load_auth() -> dict | None:
    """Load auth credentials from ~/.claudeboost/auth.json.
    Returns dict with access_token, refresh_token, user_id, supabase_url.
    Returns None if not authenticated.
    """
    if not os.path.exists(AUTH_FILE):
        return None
    try:
        with open(AUTH_FILE, "r") as f:
            data = json.load(f)
        if data.get("access_token") and data.get("user_id"):
            return data
        return None
    except (json.JSONDecodeError, ValueError):
        return None


def is_authenticated() -> bool:
    """Check if CLI is authenticated."""
    return load_auth() is not None


def get_user_id() -> str | None:
    """Get the authenticated user's ID."""
    auth = load_auth()
    return auth["user_id"] if auth else None


def get_login_message() -> str:
    """Return a message telling the user to log in."""
    return (
        "ClaudeBoost requires authentication.\n"
        f"Please open this URL to sign in: {LOGIN_URL}\n"
        "After signing in, try your boost again."
    )


def open_login_page():
    """Open the CLI login page in the default browser."""
    try:
        if sys.platform == "darwin":
            subprocess.run(["open", LOGIN_URL], check=False)
        elif sys.platform == "linux":
            subprocess.run(["xdg-open", LOGIN_URL], check=False)
        else:
            subprocess.run(["start", LOGIN_URL], check=False, shell=True)
    except Exception:
        pass  # If browser can't open, the message will tell user the URL
