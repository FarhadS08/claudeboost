import anthropic
import sys
import time

DOMAINS = [
    "data_science",
    "data_engineering",
    "business_analytics",
    "general_coding",
    "documentation",
    "devops",
    "other",
]

_RETRY_DELAYS = [1, 2, 4]  # seconds between attempts


def classify_domain(prompt: str) -> str:
    """Classify a user prompt into one of the predefined domains.

    Retries up to 3 times with exponential backoff on transient API errors.
    Returns 'other' on permanent failure — never raises.
    """
    import os
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    client = anthropic.Anthropic(api_key=api_key) if api_key else anthropic.Anthropic()

    last_error = None
    for attempt, delay in enumerate([0] + _RETRY_DELAYS):
        if delay:
            time.sleep(delay)
        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=20,
                system=(
                    "You are a domain classifier. Classify the user's prompt into exactly one "
                    "of these domains: data_science, data_engineering, business_analytics, "
                    "general_coding, documentation, devops, other. "
                    "Reply with only the domain name. No punctuation, no explanation."
                ),
                messages=[{"role": "user", "content": prompt}],
            )
            result = response.content[0].text.strip().lower()
            return result if result in DOMAINS else "other"
        except anthropic.RateLimitError as e:
            last_error = e
            print(f"[ClaudeBoost] Classifier rate limit (attempt {attempt + 1}/4), retrying...", file=sys.stderr)
        except anthropic.APIStatusError as e:
            if e.status_code and e.status_code < 500:
                # 4xx errors won't succeed on retry
                print(f"[ClaudeBoost] Classifier client error {e.status_code}: {e}", file=sys.stderr)
                return "other"
            last_error = e
            print(f"[ClaudeBoost] Classifier server error (attempt {attempt + 1}/4), retrying...", file=sys.stderr)
        except anthropic.APIConnectionError as e:
            last_error = e
            print(f"[ClaudeBoost] Classifier connection error (attempt {attempt + 1}/4), retrying...", file=sys.stderr)
        except Exception as e:
            print(f"[ClaudeBoost] Classifier unexpected error: {type(e).__name__}: {e}", file=sys.stderr)
            return "other"

    print(f"[ClaudeBoost] Classifier failed after 4 attempts: {last_error}", file=sys.stderr)
    return "other"
