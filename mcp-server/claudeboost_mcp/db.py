"""Supabase database operations for ClaudeBoost MCP server.

Uses direct REST API calls instead of the supabase-py client
to avoid httpx version conflicts with the MCP SDK.
Falls back to local JSON files when not authenticated.
"""
import json
import os
import urllib.request
import urllib.error
from .auth import load_auth
from .feedback import (
    log_to_history as local_log_to_history,
    load_feedback_context as local_load_feedback_context,
    load_settings as local_load_settings,
    save_settings as local_save_settings,
)


def _supabase_request(method: str, path: str, body: dict | None = None) -> dict | list | None:
    """Make an authenticated request to Supabase REST API."""
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
        import sys
        print(f"[ClaudeBoost DB] HTTP {e.code}: {e.read().decode()[:200]}", file=sys.stderr)
        return None
    except Exception as e:
        import sys
        print(f"[ClaudeBoost DB] Error: {e}", file=sys.stderr)
        return None


def _get_anon_key(supabase_url: str) -> str:
    """Read the anon key from ~/.claudeboost/auth.json or env."""
    # Try env first
    key = os.environ.get("SUPABASE_ANON_KEY", "")
    if key:
        return key
    # Read from auth file
    auth = load_auth()
    return auth.get("anon_key", "") if auth else ""


def log_to_history(original: str, boosted: str, domain: str,
                   original_score: dict = None, boosted_score: dict = None):
    """Log a boost to Supabase (or local fallback)."""
    auth = load_auth()
    if not auth:
        local_log_to_history(original, boosted, domain, original_score, boosted_score)
        return

    body = {
        "user_id": auth["user_id"],
        "domain": domain,
        "original": original,
        "boosted": boosted,
        "original_score": original_score,
        "boosted_score": boosted_score,
    }

    result = _supabase_request("POST", "boost_history", body)
    if result is None:
        # Fallback to local
        local_log_to_history(original, boosted, domain, original_score, boosted_score)


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
