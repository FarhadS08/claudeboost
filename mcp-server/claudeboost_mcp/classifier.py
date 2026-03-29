import anthropic

DOMAINS = [
    "data_science",
    "data_engineering",
    "business_analytics",
    "general_coding",
    "documentation",
    "devops",
    "other",
]


def classify_domain(prompt: str) -> str:
    """Classify a user prompt into one of the predefined domains.

    Returns the domain name as a string, or "other" if classification
    fails or the result is not a recognised domain.
    """
    try:
        client = anthropic.Anthropic()
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
        if result in DOMAINS:
            return result
        return "other"
    except Exception:
        return "other"
