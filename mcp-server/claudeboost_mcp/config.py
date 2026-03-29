"""ClaudeBoost configuration constants."""

import os

# The web dashboard URL — defaults to Vercel production,
# override with CLAUDEBOOST_URL env var for local dev
DASHBOARD_URL = os.environ.get(
    "CLAUDEBOOST_URL",
    "https://claudeboost.vercel.app"
)

LOGIN_URL = f"{DASHBOARD_URL}/auth/cli-login"
