"""Version checking and cache busting for ClaudeBoost.

Ensures skills, config, and auth are all compatible with the
installed package version. Detects stale installs and tells
users exactly how to fix them.
"""
import json
import os
import sys

from . import __version__

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
CLAUDE_DIR = os.path.expanduser("~/.claude")
VERSION_FILE = os.path.join(CLAUDEBOOST_DIR, "version.json")
SKILLS_DIR = os.path.join(CLAUDE_DIR, "skills")
MCP_SETTINGS_FILE = os.path.join(CLAUDE_DIR, "mcp_settings.json")
AUTH_FILE = os.path.join(CLAUDEBOOST_DIR, "auth.json")
CONFIG_ENV = os.path.join(CLAUDEBOOST_DIR, "config.env")


def _read_version_file() -> dict:
    """Read the installed version metadata."""
    if not os.path.exists(VERSION_FILE):
        return {}
    try:
        with open(VERSION_FILE) as f:
            return json.load(f)
    except (json.JSONDecodeError, ValueError):
        return {}


def write_version_file():
    """Write version metadata after successful setup."""
    os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)
    data = {
        "package_version": __version__,
        "python_path": sys.executable,
        "setup_at": __import__("datetime").datetime.now().isoformat(),
    }
    with open(VERSION_FILE, "w") as f:
        json.dump(data, f, indent=2)


def check_all() -> list[dict]:
    """Run all version and consistency checks. Returns list of issues."""
    issues = []

    # 1. Check if setup was ever run
    vdata = _read_version_file()
    if not vdata:
        issues.append({
            "severity": "critical",
            "component": "setup",
            "message": "Setup has never been run",
            "fix": "Run: claudeboost-mcp --setup",
        })
        return issues  # No point checking further

    # 2. Check version mismatch (skills from old package)
    installed_ver = vdata.get("package_version", "0.0.0")
    if installed_ver != __version__:
        issues.append({
            "severity": "critical",
            "component": "version",
            "message": f"Skills are from v{installed_ver} but package is v{__version__}",
            "fix": f"Run: claudeboost-mcp --setup (to update skills to v{__version__})",
        })

    # 3. Check skills exist
    for skill in ["boost", "boost-help", "boost-settings"]:
        skill_file = os.path.join(SKILLS_DIR, skill, "SKILL.md")
        if not os.path.exists(skill_file):
            issues.append({
                "severity": "critical",
                "component": "skills",
                "message": f"Skill /{skill} missing at {skill_file}",
                "fix": "Run: claudeboost-mcp --setup",
            })

    # 4. Check skills don't have localhost (stale content)
    boost_skill = os.path.join(SKILLS_DIR, "boost", "SKILL.md")
    if os.path.exists(boost_skill):
        with open(boost_skill) as f:
            content = f.read()
        if "localhost:3000" in content:
            issues.append({
                "severity": "critical",
                "component": "skills",
                "message": "Skills contain localhost:3000 (outdated content)",
                "fix": "Run: claudeboost-mcp --setup (overwrites stale skills)",
            })

    # 5. Check API key
    has_key = bool(os.environ.get("ANTHROPIC_API_KEY"))
    if not has_key and os.path.exists(CONFIG_ENV):
        with open(CONFIG_ENV) as f:
            has_key = "ANTHROPIC_API_KEY=" in f.read()
    if not has_key:
        issues.append({
            "severity": "critical",
            "component": "api_key",
            "message": "No Anthropic API key found",
            "fix": "Run: claudeboost-mcp --setup",
        })

    # 6. Check auth.json has required fields
    if os.path.exists(AUTH_FILE):
        try:
            with open(AUTH_FILE) as f:
                auth = json.load(f)
            required = ["access_token", "refresh_token", "user_id", "supabase_url", "anon_key"]
            missing = [k for k in required if not auth.get(k)]
            if missing:
                issues.append({
                    "severity": "warning",
                    "component": "auth",
                    "message": f"auth.json missing fields: {', '.join(missing)}",
                    "fix": "Run: claudeboost-mcp --login (get fresh tokens)",
                })
        except (json.JSONDecodeError, ValueError):
            issues.append({
                "severity": "warning",
                "component": "auth",
                "message": "auth.json is corrupted",
                "fix": "Run: claudeboost-mcp --login",
            })

    # 7. Check Python path matches
    saved_python = vdata.get("python_path", "")
    if saved_python and saved_python != sys.executable:
        issues.append({
            "severity": "warning",
            "component": "python",
            "message": f"Python path changed: was {saved_python}, now {sys.executable}",
            "fix": "Run: claudeboost-mcp --setup (updates MCP config)",
        })

    return issues


def check_and_warn():
    """Check on MCP server startup. Print warnings to stderr."""
    issues = check_all()
    critical = [i for i in issues if i["severity"] == "critical"]

    if critical:
        import sys as _sys
        print("\n[ClaudeBoost] ⚠ SETUP ISSUES DETECTED:", file=_sys.stderr)
        for issue in critical:
            print(f"  ❌ {issue['message']}", file=_sys.stderr)
            print(f"     Fix: {issue['fix']}", file=_sys.stderr)
        print("", file=_sys.stderr)
