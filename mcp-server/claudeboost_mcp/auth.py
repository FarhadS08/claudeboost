"""CLI authentication for ClaudeBoost MCP server.

Stores auth tokens in the OS keychain (keyring) when available.
Falls back gracefully to ~/.claudeboost/auth.json if keyring is unavailable.
"""
import os
import json
import subprocess
import sys

from .config import LOGIN_URL

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
AUTH_FILE = os.path.join(CLAUDEBOOST_DIR, "auth.json")
KEYRING_SERVICE = "claudeboost"
KEYRING_USERNAME = "auth"


def _keyring_available() -> bool:
    """Check if keyring is installed and functional."""
    try:
        import keyring  # noqa: F401
        # Verify it's not the null backend (which silently does nothing)
        import keyring.backend
        backends = keyring.backend.get_all_keyring()
        return any(
            b.__class__.__name__ not in ("Keyring", "NullKeyring", "fail.Keyring")
            for b in backends
        )
    except Exception:
        return False


def _save_to_keychain(data: dict) -> bool:
    """Save auth data to OS keychain. Returns True on success."""
    try:
        import keyring
        keyring.set_password(KEYRING_SERVICE, KEYRING_USERNAME, json.dumps(data))
        # Write a marker file so we know keychain is in use (no tokens in the file)
        os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)
        with open(AUTH_FILE, "w") as f:
            json.dump({"keychain": True, "user_id": data.get("user_id")}, f)
        return True
    except Exception:
        return False


def _load_from_keychain() -> dict | None:
    """Load auth data from OS keychain."""
    try:
        import keyring
        raw = keyring.get_password(KEYRING_SERVICE, KEYRING_USERNAME)
        if not raw:
            return None
        data = json.loads(raw)
        if data.get("access_token") and data.get("user_id"):
            return data
        return None
    except Exception:
        return None


def _delete_from_keychain() -> None:
    """Remove auth data from OS keychain."""
    try:
        import keyring
        keyring.delete_password(KEYRING_SERVICE, KEYRING_USERNAME)
    except Exception:
        pass


def save_auth(data: dict) -> None:
    """Save auth credentials. Uses keychain if available, file otherwise."""
    os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)

    if _keyring_available():
        success = _save_to_keychain(data)
        if success:
            return

    # Fallback: write to file with restrictive permissions
    with open(AUTH_FILE, "w") as f:
        json.dump(data, f, indent=2)
    try:
        os.chmod(AUTH_FILE, 0o600)  # owner read/write only
    except OSError:
        pass


def load_auth() -> dict | None:
    """Load auth credentials from keychain or file.
    Returns dict with access_token, refresh_token, user_id, supabase_url.
    Returns None if not authenticated.
    """
    if not os.path.exists(AUTH_FILE):
        return None

    try:
        with open(AUTH_FILE, "r") as f:
            file_data = json.load(f)

        # If the file is just a keychain marker, load from keychain
        if file_data.get("keychain"):
            data = _load_from_keychain()
            if data:
                return data
            # Keychain entry missing — fall through to file check
            return None

        # Legacy: full token in file
        if file_data.get("access_token") and file_data.get("user_id"):
            # Opportunistically migrate to keychain
            if _keyring_available():
                _save_to_keychain(file_data)
            else:
                # Ensure file permissions are restrictive
                try:
                    os.chmod(AUTH_FILE, 0o600)
                except OSError:
                    pass
            return file_data

        return None
    except (json.JSONDecodeError, ValueError):
        return None


def delete_auth() -> None:
    """Remove all auth credentials (logout)."""
    _delete_from_keychain()
    if os.path.exists(AUTH_FILE):
        try:
            os.remove(AUTH_FILE)
        except OSError:
            pass


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
        payload = token.split(".")[1]
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
        "storage": "keychain" if _keyring_available() else "file",
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
        pass
