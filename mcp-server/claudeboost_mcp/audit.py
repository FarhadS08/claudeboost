"""Structured audit logging for ClaudeBoost.

Writes append-only JSONL audit entries to ~/.claudeboost/audit.log.
Stores prompt hashes (never full prompt text) for privacy.
Required for enterprise security reviews.
"""
import hashlib
import json
import os
from datetime import datetime, timezone

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
AUDIT_FILE = os.path.join(CLAUDEBOOST_DIR, "audit.log")


def _hash_prompt(text: str) -> str:
    """SHA-256 hash of prompt text. Used for audit trail without storing PII."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def log_audit(
    action: str,
    user_id: str,
    domain: str = None,
    prompt: str = None,
    result: str = None,
    metadata: dict = None,
) -> None:
    """Write a structured audit entry to the audit log.

    Args:
        action: One of 'boost', 'log_boost', 'settings_change', 'login', 'logout', 'rate_limited', 'delete_data'
        user_id: Authenticated user ID or 'local' for unauthenticated
        domain: Prompt domain (optional)
        prompt: Original prompt text — stored as hash only, never raw
        result: Outcome — 'success', 'skipped', 'error', 'blocked'
        metadata: Additional key/value pairs (no sensitive data)
    """
    try:
        os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)

        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "user_id": user_id,
        }

        if domain:
            entry["domain"] = domain
        if prompt:
            entry["prompt_hash"] = _hash_prompt(prompt)
            entry["prompt_len"] = len(prompt)
        if result:
            entry["result"] = result
        if metadata:
            # Sanitize metadata — ensure no prompt text leaks in
            safe_meta = {
                k: v for k, v in metadata.items()
                if isinstance(v, (str, int, float, bool)) and k != "prompt" and k != "original" and k != "boosted"
            }
            if safe_meta:
                entry["meta"] = safe_meta

        with open(AUDIT_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")

    except Exception:
        pass  # Audit logging must never crash the main flow


def read_audit_log(limit: int = 100) -> list[dict]:
    """Read the last N audit entries. Used by admin/diagnostic commands."""
    if not os.path.exists(AUDIT_FILE):
        return []
    try:
        with open(AUDIT_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
        entries = []
        for line in lines[-limit:]:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
        return entries
    except OSError:
        return []
