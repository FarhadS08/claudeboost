"""CLI authentication for ClaudeBoost MCP server.

Reads auth token from ~/.claudeboost/auth.json.
Falls back to local-only mode if no auth file exists.
"""
import os
import json
import subprocess
import sys

from .config import LOGIN_URL

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
AUTH_FILE = os.path.join(CLAUDEBOOST_DIR, "auth.json")


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


def get_auth_status() -> dict:
    """Get the current auth status with details."""
    auth = load_auth()
    if not auth:
        return {"authenticated": False, "user_id": None, "email": None}

    # Decode email from JWT token (access_token is a JWT)
    email = None
    try:
        import base64
        token = auth["access_token"]
        # JWT has 3 parts separated by dots, payload is the second
        payload = token.split(".")[1]
        # Add padding if needed
        payload += "=" * (4 - len(payload) % 4)
        decoded = json.loads(base64.b64decode(payload))
        email = decoded.get("email")
    except Exception:
        pass

    return {
        "authenticated": True,
        "user_id": auth.get("user_id"),
        "email": email,
        "created_at": auth.get("created_at"),
    }


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
