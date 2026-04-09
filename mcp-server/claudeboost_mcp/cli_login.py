"""Direct CLI login for ClaudeBoost — no browser needed."""

import json
import os
import getpass
import urllib.request
import urllib.error


SUPABASE_URL = "https://awrickggmhcujlmmviyy.supabase.co"
ANON_KEY = "sb_publishable_1SJCbHApJ8lp7HGKFn76gQ_s6a3JKkm"
AUTH_FILE = os.path.expanduser("~/.claudeboost/auth.json")


def run_login():
    """Interactive login from the terminal."""
    print("⚡ ClaudeBoost Login")
    print("=" * 40)
    print()

    # Check if already logged in
    if os.path.exists(AUTH_FILE):
        try:
            with open(AUTH_FILE) as f:
                existing = json.load(f)
            if existing.get("access_token"):
                # Try to get email from token
                email = "unknown"
                try:
                    import base64
                    payload = existing["access_token"].split(".")[1]
                    payload += "=" * (4 - len(payload) % 4)
                    decoded = json.loads(base64.b64decode(payload))
                    email = decoded.get("email", "unknown")
                except Exception:
                    pass
                print(f"Already logged in as: {email}")
                choice = input("Log in with a different account? (y/N): ").strip().lower()
                if choice != "y":
                    print("✅ Keeping current session.")
                    return
        except Exception:
            pass

    email = input("Email: ").strip()
    password = getpass.getpass("Password: ")

    if not email or not password:
        print("❌ Email and password are required.")
        return

    # Try to sign in
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
    }
    body = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        try:
            error_data = json.loads(error_body)
            msg = error_data.get("error_description", error_data.get("msg", "Login failed"))
        except Exception:
            msg = "Login failed"
        print(f"❌ {msg}")

        if "Invalid login" in str(msg):
            print()
            choice = input("Create a new account with this email? (y/N): ").strip().lower()
            if choice == "y":
                _signup(email, password)
            return
        return

    # Save auth
    auth_data = {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "user_id": data["user"]["id"],
        "supabase_url": SUPABASE_URL,
        "anon_key": ANON_KEY,
        "created_at": data["user"].get("created_at", ""),
    }

    os.makedirs(os.path.dirname(AUTH_FILE), exist_ok=True)
    with open(AUTH_FILE, "w") as f:
        json.dump(auth_data, f, indent=2)
    os.chmod(AUTH_FILE, 0o600)

    print()
    print(f"✅ Logged in as: {data['user']['email']}")
    print("   Token saved. Restart Claude Code and use /boost.")


def _signup(email: str, password: str):
    """Create a new account."""
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
    }
    body = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())

        # Auto-login after signup
        auth_data = {
            "access_token": data["access_token"],
            "refresh_token": data["refresh_token"],
            "user_id": data["user"]["id"],
            "supabase_url": SUPABASE_URL,
            "anon_key": ANON_KEY,
            "created_at": data["user"].get("created_at", ""),
        }

        os.makedirs(os.path.dirname(AUTH_FILE), exist_ok=True)
        with open(AUTH_FILE, "w") as f:
            json.dump(auth_data, f, indent=2)
        os.chmod(AUTH_FILE, 0o600)

        print()
        print(f"✅ Account created and logged in as: {data['user']['email']}")
        print("   Restart Claude Code and use /boost.")

    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        try:
            error_data = json.loads(error_body)
            msg = error_data.get("msg", error_data.get("error_description", "Signup failed"))
        except Exception:
            msg = "Signup failed"
        print(f"❌ {msg}")
