"""Supabase database operations for ClaudeBoost MCP server.

Uses direct REST API calls instead of the supabase-py client
to avoid httpx version conflicts with the MCP SDK.
Falls back to local JSON files when not authenticated.
Offline queue replays failed Supabase writes on next successful connection.
"""
import json
import os
import sys
import urllib.request
import urllib.error
from .auth import load_auth, save_auth
from .feedback import (
    log_to_history as local_log_to_history,
    load_feedback_context as local_load_feedback_context,
    load_settings as local_load_settings,
    save_settings as local_save_settings,
)

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
OFFLINE_QUEUE_FILE = os.path.join(CLAUDEBOOST_DIR, "offline_queue.json")


def _enqueue(table: str, body: dict) -> None:
    """Add a failed write to the offline queue."""
    os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)
    queue = _load_queue()
    queue.append({"table": table, "body": body})
    try:
        with open(OFFLINE_QUEUE_FILE, "w") as f:
            json.dump(queue, f)
    except OSError:
        pass


def _load_queue() -> list:
    if not os.path.exists(OFFLINE_QUEUE_FILE):
        return []
    try:
        with open(OFFLINE_QUEUE_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _flush_queue() -> int:
    """Replay queued writes to Supabase. Returns number of entries flushed."""
    queue = _load_queue()
    if not queue:
        return 0

    flushed = []
    remaining = []
    for entry in queue:
        result = _supabase_request("POST", entry["table"], entry["body"])
        if result is not None:
            flushed.append(entry)
        else:
            remaining.append(entry)

    try:
        with open(OFFLINE_QUEUE_FILE, "w") as f:
            json.dump(remaining, f)
    except OSError:
        pass

    if flushed:
        print(f"[ClaudeBoost DB] Flushed {len(flushed)} queued entries to Supabase", file=sys.stderr)
    return len(flushed)


def _refresh_token() -> bool:
    auth = load_auth()
    if not auth or not auth.get("refresh_token") or not auth.get("supabase_url"):
        return False

    url = f"{auth['supabase_url']}/auth/v1/token?grant_type=refresh_token"
    anon_key = auth.get("anon_key", "")
    headers = {"apikey": anon_key, "Content-Type": "application/json"}
    body = json.dumps({"refresh_token": auth["refresh_token"]}).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        auth["access_token"] = data["access_token"]
        auth["refresh_token"] = data["refresh_token"]
        save_auth(auth)
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
    """Log a boost. Always writes locally first, then attempts Supabase."""
    local_log_to_history(original, boosted, domain, original_score, boosted_score, chosen)

    auth = load_auth()
    if not auth:
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

    _flush_queue()

    result = _supabase_request("POST", "boost_history", body)
    if result is None:
        _enqueue("boost_history", body)
        print("[ClaudeBoost DB] Supabase unavailable, queued for replay", file=sys.stderr)


def load_feedback_context(domain: str) -> str:
    auth = load_auth()
    if not auth:
        return local_load_feedback_context(domain)

    path = (
        f"boost_history?user_id=eq.{auth['user_id']}"
        f"&domain=eq.{domain}&feedback=neq.&order=timestamp.desc&limit=5&select=feedback"
    )
    history = _supabase_request("GET", path)

    constraint_path = (
        f"user_constraints?user_id=eq.{auth['user_id']}&domain=eq.{domain}&select=constraint_text"
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
    auth = load_auth()
    if not auth:
        return local_load_settings()

    path = f"user_settings?user_id=eq.{auth['user_id']}&select=boost_level,auto_boost"
    result = _supabase_request("GET", path)
    if result and len(result) > 0:
        return result[0]
    return local_load_settings()


def save_settings(settings: dict):
    local_save_settings(settings)

    auth = load_auth()
    if not auth:
        return

    body = {"user_id": auth["user_id"], **settings}
    result = _supabase_request("POST", "user_settings?on_conflict=user_id", body)
    if result is None:
        _enqueue("user_settings?on_conflict=user_id", body)


def delete_user_data(user_id: str = None) -> dict:
    """Delete all user data — GDPR Article 17 right to erasure."""
    deleted = {}

    auth = load_auth()
    uid = user_id or (auth["user_id"] if auth else None)

    if auth and uid:
        for table in ["boost_history", "user_constraints", "user_settings"]:
            _supabase_request("DELETE", f"{table}?user_id=eq.{uid}")
        deleted["supabase"] = True

    from .feedback import HISTORY_FILE, CONFIG_FILE, SETTINGS_FILE
    from .rate_limiter import RATE_FILE
    from .audit import AUDIT_FILE

    for fpath, key in [
        (HISTORY_FILE, "local_history"),
        (CONFIG_FILE, "local_config"),
        (SETTINGS_FILE, "local_settings"),
        (RATE_FILE, "rate_limits"),
        (AUDIT_FILE, "audit_log"),
        (OFFLINE_QUEUE_FILE, "offline_queue"),
    ]:
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
                deleted[key] = True
            except OSError:
                pass

    from .auth import delete_auth
    delete_auth()
    deleted["auth"] = True

    return deleted
