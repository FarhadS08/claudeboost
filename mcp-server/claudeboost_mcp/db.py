"""Supabase database operations for ClaudeBoost MCP server.

Uses direct REST API calls instead of the supabase-py client
to avoid httpx version conflicts with the MCP SDK.
Falls back to local JSON files when not authenticated.
"""
import json
import os
import sys
import urllib.request
import urllib.error
from .auth import load_auth
from .feedback import (
    log_to_history as local_log_to_history,
    load_feedback_context as local_load_feedback_context,
    load_settings as local_load_settings,
    save_settings as local_save_settings,
)

AUTH_FILE = os.path.expanduser("~/.claudeboost/auth.json")


def _refresh_token() -> bool:
    """Refresh the Supabase access token using the refresh token."""
    auth = load_auth()
    if not auth or not auth.get("refresh_token") or not auth.get("supabase_url"):
        return False

    url = f"{auth['supabase_url']}/auth/v1/token?grant_type=refresh_token"
    anon_key = auth.get("anon_key", "")
    headers = {
        "apikey": anon_key,
        "Content-Type": "application/json",
    }
    body = json.dumps({"refresh_token": auth["refresh_token"]}).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())

        # Update auth.json with new tokens
        auth["access_token"] = data["access_token"]
        auth["refresh_token"] = data["refresh_token"]
        with open(AUTH_FILE, "w") as f:
            json.dump(auth, f, indent=2)

        print("[ClaudeBoost DB] Token refreshed successfully", file=sys.stderr)
        return True
    except Exception as e:
        print(f"[ClaudeBoost DB] Token refresh failed: {e}", file=sys.stderr)
        return False


def _supabase_request(method: str, path: str, body: dict | None = None, _retried: bool = False) -> dict | list | None:
    """Make an authenticated request to Supabase REST API.
    Auto-refreshes token on 401 JWT expired errors.
    """
    auth = load_auth()
    if not auth:
        return None

    url = f"{auth['supabase_url']}/rest/v1/{path}"
    anon_key = auth.get("anon_key", "")
    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {auth['access_token']}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()[:200]

        # Auto-refresh on JWT expired (401)
        if e.code == 401 and "JWT expired" in error_body and not _retried:
            print("[ClaudeBoost DB] Token expired, refreshing...", file=sys.stderr)
            if _refresh_token():
                return _supabase_request(method, path, body, _retried=True)

        print(f"[ClaudeBoost DB] HTTP {e.code}: {error_body}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[ClaudeBoost DB] Error: {e}", file=sys.stderr)
        return None


def log_to_history(original: str, boosted: str, domain: str,
                   original_score: dict = None, boosted_score: dict = None, chosen: str = None):
    """Log a boost to Supabase (or local fallback)."""
    auth = load_auth()
    if not auth:
        local_log_to_history(original, boosted, domain, original_score, boosted_score, chosen)
        return

    body = {
        "user_id": auth["user_id"],
        "domain": domain,
        "original": original,
        "boosted": boosted,
        "chosen": chosen,
        "original_score": original_score,
        "boosted_score": boosted_score,
    }

    result = _supabase_request("POST", "boost_history", body)
    if result is None:
        # Fallback to local
        local_log_to_history(original, boosted, domain, original_score, boosted_score, chosen)


def load_feedback_context(domain: str) -> str:
    """Load feedback context from Supabase (or local fallback)."""
    auth = load_auth()
    if not auth:
        return local_load_feedback_context(domain)

    # Get last 5 feedback entries for this domain
    path = (
        f"boost_history?user_id=eq.{auth['user_id']}"
        f"&domain=eq.{domain}"
        f"&feedback=neq."
        f"&order=timestamp.desc"
        f"&limit=5"
        f"&select=feedback"
    )
    history = _supabase_request("GET", path)

    # Get constraint for this domain
    constraint_path = (
        f"user_constraints?user_id=eq.{auth['user_id']}"
        f"&domain=eq.{domain}"
        f"&select=constraint_text"
    )
    constraints = _supabase_request("GET", constraint_path)

    parts = []
    if constraints and len(constraints) > 0:
        ct = constraints[0].get("constraint_text", "")
        if ct:
            parts.append(ct)

    if history:
        for entry in reversed(history):
            fb = entry.get("feedback", "")
            if fb:
                parts.append(fb)

    return " | ".join(parts) if parts else local_load_feedback_context(domain)


def load_settings() -> dict:
    """Load user settings from Supabase (or local fallback)."""
    auth = load_auth()
    if not auth:
        return local_load_settings()

    path = (
        f"user_settings?user_id=eq.{auth['user_id']}"
        f"&select=boost_level,auto_boost"
    )
    result = _supabase_request("GET", path)

    if result and len(result) > 0:
        return result[0]

    return local_load_settings()


def save_settings(settings: dict):
    """Save user settings to Supabase (or local fallback)."""
    auth = load_auth()
    if not auth:
        local_save_settings(settings)
        return

    body = {"user_id": auth["user_id"], **settings}
    result = _supabase_request("POST",
        "user_settings?on_conflict=user_id",
        body)

    if result is None:
        local_save_settings(settings)
