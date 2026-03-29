"""
scorer.py — Pure text-signal prompt scoring across 6 dimensions.

No API calls. All scoring is done via regex and keyword matching.
Each dimension scores 1-5; total is out of 30.
"""

import re

# ─── Constants ──────────────────────────────────────────────────────────────

DIMENSIONS = [
    "specificity",
    "verification",
    "context",
    "constraints",
    "structure",
    "output_definition",
]

# Dimension weights by domain. "critical"=3, "high"=2, "medium"=1
DOMAIN_WEIGHTS = {
    "data_science": {
        "specificity": 2,
        "verification": 3,
        "context": 3,
        "constraints": 2,
        "structure": 2,
        "output_definition": 3,
    },
    "data_engineering": {
        "specificity": 2,
        "verification": 3,
        "context": 2,
        "constraints": 3,
        "structure": 2,
        "output_definition": 2,
    },
    "business_analytics": {
        "specificity": 2,
        "verification": 2,
        "context": 3,
        "constraints": 2,
        "structure": 2,
        "output_definition": 3,
    },
    "general_coding": {
        "specificity": 3,
        "verification": 3,
        "context": 2,
        "constraints": 2,
        "structure": 2,
        "output_definition": 2,
    },
    "documentation": {
        "specificity": 2,
        "verification": 2,
        "context": 2,
        "constraints": 2,
        "structure": 3,
        "output_definition": 3,
    },
    "devops": {
        "specificity": 3,
        "verification": 2,
        "context": 2,
        "constraints": 3,
        "structure": 3,
        "output_definition": 2,
    },
    "other": {
        "specificity": 2,
        "verification": 2,
        "context": 2,
        "constraints": 2,
        "structure": 2,
        "output_definition": 2,
    },
}


# ─── Internal scoring helpers ────────────────────────────────────────────────

def _score_specificity(prompt: str) -> int:
    """
    +1 base
    +1 noun indicating a service/module/component name (not just generic verbs)
    +1 file path, @reference, or specific identifier
    +1 error message, symptom description, or specific behavior description
    +1 root cause hypothesis or trigger condition
    """
    score = 1  # base

    # +1: contains a noun indicating a service/module/component (CamelCase or known suffixes)
    component_pattern = re.compile(
        r"\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b"          # CamelCase (e.g. UserService)
        r"|"
        r"\b\w+(?:Service|Controller|Manager|Handler|Repository|Module|Component|Client|Server|API|SDK)\b",
        re.IGNORECASE,
    )
    if component_pattern.search(prompt):
        score += 1

    # +1: file path, @reference, or specific identifier
    if (
        re.search(r"@\S+", prompt)                          # @reference
        or re.search(r"\b\w+/\w+", prompt)                  # path with slash
        or re.search(r"\bline\s+\d+\b", prompt, re.IGNORECASE)  # line number
        or re.search(r"\bclass\s+\w+|\bdef\s+\w+|\bfunction\s+\w+", prompt, re.IGNORECASE)
        or re.search(r"\.\w{2,4}\b", prompt)                 # file extension
    ):
        score += 1

    # +1: error message, symptom, or specific behavior description
    symptom_pattern = re.compile(
        r"\b(error|exception|traceback|crash|fail|bug|issue|problem|symptom|behavior|"
        r"race\s+condition|deadlock|timeout|null\s+pointer|stack\s+overflow|"
        r"returns\s+\w+|throws\s+\w+|breaks\s+when)\b",
        re.IGNORECASE,
    )
    if symptom_pattern.search(prompt):
        score += 1

    # +1: root cause hypothesis or trigger condition
    trigger_pattern = re.compile(
        r"\b(because|caused\s+by|due\s+to|root\s+cause|when\s+\w+|triggered\s+by|"
        r"hypothesis|suspect|possibly|likely\s+caused|ticket\s+[A-Z]+-\d+)\b",
        re.IGNORECASE,
    )
    if trigger_pattern.search(prompt):
        score += 1

    return min(score, 5)


def _score_verification(prompt: str) -> int:
    """
    +1 base
    +1 verification-related words: test, verify, validate, check, confirm, assert, ensure
    +1 specific tool/command: pytest, jest, lint, typecheck, run, execute
    +1 multiple verification methods (count >= 2 distinct)
    +1 edge cases, failure conditions, regression
    """
    score = 1  # base

    verification_words = {"test", "verify", "validate", "check", "confirm", "assert", "ensure"}
    found_verification = set()
    for word in verification_words:
        if re.search(rf"\b{word}\b", prompt, re.IGNORECASE):
            found_verification.add(word)

    if found_verification:
        score += 1

    # +1: specific tool/command
    tool_pattern = re.compile(
        r"\b(pytest|jest|mocha|jasmine|vitest|lint|eslint|flake8|mypy|typecheck|"
        r"type-check|run\s+\w+|execute|npm\s+test|make\s+test|cargo\s+test)\b",
        re.IGNORECASE,
    )
    if tool_pattern.search(prompt):
        score += 1

    # +1: multiple verification methods (>= 2 distinct verification words)
    if len(found_verification) >= 2:
        score += 1

    # +1: edge cases, failure conditions, regression
    edge_pattern = re.compile(
        r"\b(edge\s+case|failure|regression|error\s+state|boundary|corner\s+case|"
        r"negative\s+test|invalid\s+input|stress\s+test)\b",
        re.IGNORECASE,
    )
    if edge_pattern.search(prompt):
        score += 1

    return min(score, 5)


def _score_context(prompt: str) -> int:
    """
    +1 base
    +1 domain/project area (beyond just action verb)
    +1 @file references or specific file paths
    +1 patterns, existing code, git history, PRs, tickets
    +1 non-goals or domain knowledge
    """
    score = 1  # base

    # +1: domain or project area — heuristic: meaningful noun count > 2
    # Strip action verbs and count remaining meaningful words
    words = re.findall(r"\b[a-zA-Z]{4,}\b", prompt)
    action_verbs = {"make", "create", "write", "build", "implement", "add", "fix", "update", "change", "edit"}
    content_words = [w for w in words if w.lower() not in action_verbs]
    if len(content_words) >= 3:
        score += 1

    # +1: @file references or file paths
    if re.search(r"@\S+", prompt) or re.search(r"\b\w+(?:/\w+)+\.\w{2,4}\b", prompt):
        score += 1

    # +1: patterns, existing code, git history, PRs, tickets
    reference_pattern = re.compile(
        r"\b(pattern|existing|git\s+(history|log|blame)|pull\s+request|PR\s+#?\d*|"
        r"ticket|jira|issue\s+#?\d+|[A-Z]+-\d+|refactor|legacy|current\s+impl|"
        r"as\s+defined|based\s+on|following\s+the\s+existing)\b",
        re.IGNORECASE,
    )
    if reference_pattern.search(prompt):
        score += 1

    # +1: non-goals or domain knowledge
    nongoal_pattern = re.compile(
        r"\b(do\s+not|don'?t|avoid|not\s+in\s+scope|out\s+of\s+scope|"
        r"note\s+that|important:|context:|background:|domain|assume)\b",
        re.IGNORECASE,
    )
    if nongoal_pattern.search(prompt):
        score += 1

    return min(score, 5)


def _score_constraints(prompt: str) -> int:
    """
    +1 base
    +1 negative instruction
    +1 scope limitation
    +1 preserve APIs/contracts or dependency rules
    +1 performance, compliance, or security constraints
    """
    score = 1  # base

    # +1: negative instruction
    negative_pattern = re.compile(
        r"\b(do\s+not|don'?t|avoid|never|without)\b", re.IGNORECASE
    )
    if negative_pattern.search(prompt):
        score += 1

    # +1: scope files/modules
    scope_pattern = re.compile(
        r"\b(only|within|limited\s+to|only\s+modify|only\s+touch|restrict|in\s+scope)\b",
        re.IGNORECASE,
    )
    if scope_pattern.search(prompt):
        score += 1

    # +1: preserve APIs/contracts or dependency rules
    preserve_pattern = re.compile(
        r"\b(preserve|backward\s+compat|backwards\s+compat|no\s+new\s+depend|"
        r"maintain\s+API|keep\s+the\s+interface|existing\s+API|contract)\b",
        re.IGNORECASE,
    )
    if preserve_pattern.search(prompt):
        score += 1

    # +1: performance, compliance, or security constraints
    perf_pattern = re.compile(
        r"\b(performance|compliance|security|max\s+\d+|limit\s+\d+|SLA|"
        r"latency|throughput|GDPR|HIPAA|PCI|budget|cost)\b",
        re.IGNORECASE,
    )
    if perf_pattern.search(prompt):
        score += 1

    return min(score, 5)


def _score_structure(prompt: str) -> int:
    """
    +1 base
    +1 multiple sentences (>= 2 periods or newlines)
    +1 numbered steps or bullet points
    +1 markdown headers or bold sections
    +1 clearly separated sections (3+ headers or context/task/verification pattern)
    """
    score = 1  # base

    # +1: multiple sentences
    sentence_terminators = len(re.findall(r"[.!?]|\n", prompt))
    if sentence_terminators >= 2:
        score += 1

    # +1: numbered steps or bullet points
    lines = prompt.split("\n")
    has_numbered = any(re.match(r"^\s*\d+\.", line) for line in lines)
    has_bullets = any(re.match(r"^\s*[-*]", line) for line in lines)
    if has_numbered or has_bullets:
        score += 1

    # +1: markdown headers or bold sections
    if re.search(r"^#{1,6}\s+\S", prompt, re.MULTILINE) or re.search(r"\*\*\S", prompt):
        score += 1

    # +1: clearly separated sections (3+ headers OR context/task/verification pattern)
    header_count = len(re.findall(r"^#{1,6}\s+\S", prompt, re.MULTILINE))
    section_keywords = re.compile(
        r"\b(context|task|verification|output|steps|background|requirements|constraints)\b",
        re.IGNORECASE,
    )
    section_keyword_count = len(set(m.group(0).lower() for m in section_keywords.finditer(prompt)))
    if header_count >= 3 or section_keyword_count >= 3:
        score += 1

    return min(score, 5)


def _score_output_definition(prompt: str) -> int:
    """
    +1 base
    +1 mentions any output type
    +1 names specific output files/paths
    +1 specifies format
    +1 lists multiple artifacts or specifies success criteria per artifact
    """
    score = 1  # base

    # +1: output type
    output_type_pattern = re.compile(
        r"\b(file|report|PR|pull\s+request|commit|table|chart|summary|test|"
        r"output|result|artifact|document|diagram|dashboard|log|diff)\b",
        re.IGNORECASE,
    )
    if output_type_pattern.search(prompt):
        score += 1

    # +1: specific output files/paths
    if re.search(r"@\S+\.\w{2,4}", prompt) or re.search(r"\b\w+(?:/\w+)+\.\w{2,4}\b", prompt):
        score += 1

    # +1: format specification
    format_pattern = re.compile(
        r"\b(JSON|markdown|CSV|PDF|PNG|YAML|yaml|XML|HTML|TOML|parquet|excel|xlsx|txt|rst)\b",
        re.IGNORECASE,
    )
    if format_pattern.search(prompt):
        score += 1

    # +1: multiple artifacts or success criteria
    # Count output references or success criteria phrases
    artifact_mentions = len(output_type_pattern.findall(prompt))
    success_pattern = re.compile(
        r"\b(success\s+criteria|done\s+when|complete\s+when|definition\s+of\s+done|"
        r"acceptance\s+criteria|must\s+include|should\s+contain)\b",
        re.IGNORECASE,
    )
    file_refs = len(re.findall(r"@\S+\.\w{2,4}", prompt))
    if artifact_mentions >= 2 or file_refs >= 2 or success_pattern.search(prompt):
        score += 1

    return min(score, 5)


# ─── Public API ──────────────────────────────────────────────────────────────

def score_prompt(prompt: str) -> dict:
    """
    Score a prompt across 6 dimensions (1-5 each).

    Returns:
        {
            "dimensions": {"specificity": int, ...},
            "total": int,
            "average": float,
            "level": int,
            "weakest": [str, ...]   # dimensions scoring below 3, ascending
        }
    """
    scores = {
        "specificity": _score_specificity(prompt),
        "verification": _score_verification(prompt),
        "context": _score_context(prompt),
        "constraints": _score_constraints(prompt),
        "structure": _score_structure(prompt),
        "output_definition": _score_output_definition(prompt),
    }

    total = sum(scores.values())
    average = round(total / len(scores), 1)
    level = get_level(average)
    weakest = get_weakest_dimensions(scores)

    return {
        "dimensions": scores,
        "total": total,
        "average": average,
        "level": level,
        "weakest": weakest,
    }


def get_weakest_dimensions(scores: dict, threshold: int = 3) -> list:
    """
    Return dimension names where score < threshold, sorted by score ascending.
    """
    below = [(dim, val) for dim, val in scores.items() if val < threshold]
    below.sort(key=lambda x: x[1])
    return [dim for dim, _ in below]


def get_weighted_weakest(scores: dict, domain: str, threshold: int = 3) -> list:
    """
    Like get_weakest_dimensions but weighted by domain importance.

    Returns dimensions sorted by (weight * (threshold - score)) descending.
    Only includes dimensions below threshold.
    """
    weights = DOMAIN_WEIGHTS.get(domain, DOMAIN_WEIGHTS["other"])
    below = [
        (dim, weights.get(dim, 1) * (threshold - val))
        for dim, val in scores.items()
        if val < threshold
    ]
    below.sort(key=lambda x: x[1], reverse=True)
    return [dim for dim, _ in below]


def get_level(average: float) -> int:
    """
    Convert average score to a level 1-5.

    1.0-1.4 → 1
    1.5-2.4 → 2
    2.5-3.4 → 3
    3.5-4.4 → 4
    4.5-5.0 → 5
    """
    if average < 1.5:
        return 1
    if average < 2.5:
        return 2
    if average < 3.5:
        return 3
    if average < 4.5:
        return 4
    return 5
