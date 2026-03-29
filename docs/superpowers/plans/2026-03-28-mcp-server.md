# MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Python MCP server that registers a `boost_prompt` tool — classifying prompts into domains, enhancing them using Claude API with playbook-powered domain rules, and logging results to local JSON files.

**Architecture:** Four Python modules in `mcp-server/`: `feedback.py` (data layer), `classifier.py` (domain classification), `enhancer.py` (prompt rewriting with enterprise playbook patterns), `server.py` (MCP entry point). Data stored in `~/.claudeboost/` as JSON files. Dependencies: `mcp`, `anthropic`.

**Tech Stack:** Python 3.11, MCP SDK, Anthropic SDK, Claude Sonnet 4.5

---

## File Structure

```
mcp-server/
├── requirements.txt      # Python dependencies (mcp, anthropic)
├── feedback.py           # Read/write ~/.claudeboost/ JSON files
├── classifier.py         # Domain classification via Claude API
├── enhancer.py           # Prompt enhancement with playbook-powered domain rules
├── server.py             # MCP server entry point, registers boost_prompt tool
└── tests/
    ├── test_feedback.py   # Tests for feedback module
    ├── test_classifier.py # Tests for classifier module
    └── test_enhancer.py   # Tests for enhancer module
```

---

### Task 1: Project Setup and Dependencies

**Files:**
- Create: `mcp-server/requirements.txt`

- [ ] **Step 1: Create the mcp-server directory and requirements.txt**

```
mcp
anthropic
```

- [ ] **Step 2: Install dependencies**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && pip3 install -r requirements.txt`
Expected: Both `mcp` and `anthropic` install successfully.

- [ ] **Step 3: Verify imports work**

Run: `python3 -c "from mcp.server import Server; from mcp.server.stdio import stdio_server; from mcp.types import Tool, TextContent; import anthropic; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Create tests directory**

Run: `mkdir -p /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server/tests && touch /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server/tests/__init__.py`

- [ ] **Step 5: Commit**

```bash
git add mcp-server/requirements.txt mcp-server/tests/__init__.py
git commit -m "feat: add mcp-server project setup with dependencies"
```

---

### Task 2: Feedback Module — Data Layer

**Files:**
- Create: `mcp-server/feedback.py`
- Create: `mcp-server/tests/test_feedback.py`

- [ ] **Step 1: Write the failing tests for feedback module**

```python
# mcp-server/tests/test_feedback.py
import os
import json
import tempfile
import pytest
from unittest.mock import patch

# We'll patch the paths to use a temp directory
@pytest.fixture
def temp_dir(tmp_path):
    """Create a temp directory to simulate ~/.claudeboost/"""
    with patch("feedback.CLAUDEBOOST_DIR", str(tmp_path)), \
         patch("feedback.HISTORY_FILE", str(tmp_path / "history.json")), \
         patch("feedback.CONFIG_FILE", str(tmp_path / "config.json")):
        yield tmp_path


class TestEnsureFiles:
    def test_creates_directory_and_files(self, temp_dir):
        from feedback import ensure_files
        ensure_files()
        assert (temp_dir / "history.json").exists()
        assert (temp_dir / "config.json").exists()

    def test_history_initialized_as_empty_list(self, temp_dir):
        from feedback import ensure_files
        ensure_files()
        with open(temp_dir / "history.json") as f:
            data = json.load(f)
        assert data == []

    def test_config_initialized_with_default_domains(self, temp_dir):
        from feedback import ensure_files, DEFAULT_CONFIG
        ensure_files()
        with open(temp_dir / "config.json") as f:
            data = json.load(f)
        assert data == DEFAULT_CONFIG
        assert len(data) == 7

    def test_does_not_overwrite_existing_files(self, temp_dir):
        from feedback import ensure_files
        # Create existing history
        (temp_dir / "history.json").write_text('[{"id": 1}]')
        ensure_files()
        with open(temp_dir / "history.json") as f:
            data = json.load(f)
        assert data == [{"id": 1}]


class TestLogToHistory:
    def test_appends_entry_to_empty_history(self, temp_dir):
        from feedback import log_to_history
        log_to_history("original prompt", "boosted prompt", "data_science")
        with open(temp_dir / "history.json") as f:
            data = json.load(f)
        assert len(data) == 1
        entry = data[0]
        assert entry["id"] == 1
        assert entry["original"] == "original prompt"
        assert entry["boosted"] == "boosted prompt"
        assert entry["domain"] == "data_science"
        assert entry["chosen"] is None
        assert entry["rating"] is None
        assert entry["feedback"] == ""
        assert "timestamp" in entry

    def test_auto_increments_id(self, temp_dir):
        from feedback import log_to_history
        log_to_history("p1", "b1", "devops")
        log_to_history("p2", "b2", "other")
        with open(temp_dir / "history.json") as f:
            data = json.load(f)
        assert data[0]["id"] == 1
        assert data[1]["id"] == 2

    def test_resets_malformed_history(self, temp_dir):
        from feedback import log_to_history
        (temp_dir / "history.json").write_text("NOT VALID JSON{{{")
        log_to_history("prompt", "boosted", "other")
        with open(temp_dir / "history.json") as f:
            data = json.load(f)
        assert len(data) == 1
        assert data[0]["id"] == 1


class TestLoadFeedbackContext:
    def test_returns_empty_string_when_no_feedback(self, temp_dir):
        from feedback import load_feedback_context
        result = load_feedback_context("data_science")
        assert result == ""

    def test_returns_constraint_only(self, temp_dir):
        from feedback import load_feedback_context
        config = {
            "data_science": "Always use Python and sklearn",
            "data_engineering": "",
            "business_analytics": "",
            "general_coding": "",
            "documentation": "",
            "devops": "",
            "other": ""
        }
        (temp_dir / "config.json").write_text(json.dumps(config))
        result = load_feedback_context("data_science")
        assert "Always use Python and sklearn" in result

    def test_returns_feedback_from_history(self, temp_dir):
        from feedback import load_feedback_context
        history = [
            {"id": 1, "domain": "data_science", "feedback": "Use pandas not numpy",
             "original": "x", "boosted": "y", "chosen": None, "rating": None, "timestamp": "t"},
            {"id": 2, "domain": "devops", "feedback": "Use terraform",
             "original": "x", "boosted": "y", "chosen": None, "rating": None, "timestamp": "t"},
        ]
        (temp_dir / "history.json").write_text(json.dumps(history))
        result = load_feedback_context("data_science")
        assert "Use pandas not numpy" in result
        assert "Use terraform" not in result

    def test_takes_last_5_feedback_entries(self, temp_dir):
        from feedback import load_feedback_context
        history = [
            {"id": i, "domain": "other", "feedback": f"feedback_{i}",
             "original": "x", "boosted": "y", "chosen": None, "rating": None, "timestamp": "t"}
            for i in range(1, 8)
        ]
        (temp_dir / "history.json").write_text(json.dumps(history))
        result = load_feedback_context("other")
        assert "feedback_3" in result
        assert "feedback_7" in result
        # feedback_1 and feedback_2 should be excluded (only last 5)
        assert "feedback_1" not in result
        assert "feedback_2" not in result

    def test_combines_constraint_and_feedback(self, temp_dir):
        from feedback import load_feedback_context
        config = {
            "data_science": "Use sklearn",
            "data_engineering": "", "business_analytics": "",
            "general_coding": "", "documentation": "",
            "devops": "", "other": ""
        }
        history = [
            {"id": 1, "domain": "data_science", "feedback": "Prefer tabular output",
             "original": "x", "boosted": "y", "chosen": None, "rating": None, "timestamp": "t"}
        ]
        (temp_dir / "config.json").write_text(json.dumps(config))
        (temp_dir / "history.json").write_text(json.dumps(history))
        result = load_feedback_context("data_science")
        assert "Use sklearn" in result
        assert "Prefer tabular output" in result

    def test_resets_malformed_config(self, temp_dir):
        from feedback import load_feedback_context
        (temp_dir / "config.json").write_text("BROKEN{{{")
        result = load_feedback_context("data_science")
        assert result == ""
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/test_feedback.py -v`
Expected: All tests FAIL with `ModuleNotFoundError: No module named 'feedback'`

- [ ] **Step 3: Implement feedback.py**

```python
# mcp-server/feedback.py
import os
import json
from datetime import datetime, timezone

CLAUDEBOOST_DIR = os.path.expanduser("~/.claudeboost")
HISTORY_FILE = os.path.join(CLAUDEBOOST_DIR, "history.json")
CONFIG_FILE = os.path.join(CLAUDEBOOST_DIR, "config.json")

DEFAULT_CONFIG = {
    "data_science": "",
    "data_engineering": "",
    "business_analytics": "",
    "general_coding": "",
    "documentation": "",
    "devops": "",
    "other": ""
}


def ensure_files():
    os.makedirs(CLAUDEBOOST_DIR, exist_ok=True)
    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w") as f:
            json.dump([], f)
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "w") as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)


def log_to_history(original: str, boosted: str, domain: str):
    ensure_files()
    try:
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
    except (json.JSONDecodeError, ValueError):
        history = []

    entry = {
        "id": len(history) + 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "domain": domain,
        "original": original,
        "boosted": boosted,
        "chosen": None,
        "rating": None,
        "feedback": ""
    }
    history.append(entry)

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)


def load_feedback_context(domain: str) -> str:
    ensure_files()

    # Load constraints
    constraint = ""
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
        constraint = config.get(domain, "")
    except (json.JSONDecodeError, ValueError):
        with open(CONFIG_FILE, "w") as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)

    # Load recent feedback
    feedback_parts = []
    try:
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
        matching = [e for e in history if e.get("domain") == domain and e.get("feedback", "")]
        for entry in matching[-5:]:
            feedback_parts.append(entry["feedback"])
    except (json.JSONDecodeError, ValueError):
        pass

    parts = []
    if constraint:
        parts.append(constraint)
    if feedback_parts:
        parts.extend(feedback_parts)

    return " | ".join(parts)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/test_feedback.py -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add mcp-server/feedback.py mcp-server/tests/test_feedback.py
git commit -m "feat: add feedback module for history and config management"
```

---

### Task 3: Classifier Module — Domain Classification

**Files:**
- Create: `mcp-server/classifier.py`
- Create: `mcp-server/tests/test_classifier.py`

- [ ] **Step 1: Write the failing tests for classifier module**

```python
# mcp-server/tests/test_classifier.py
import pytest
from unittest.mock import patch, MagicMock


class TestClassifyDomain:
    def test_returns_valid_domain(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="data_science")]
        mock_client.messages.create.return_value = mock_response

        with patch("classifier.anthropic.Anthropic", return_value=mock_client):
            from classifier import classify_domain
            result = classify_domain("analyze my churn data")
            assert result == "data_science"

    def test_strips_and_lowercases_response(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="  Data_Engineering  \n")]
        mock_client.messages.create.return_value = mock_response

        with patch("classifier.anthropic.Anthropic", return_value=mock_client):
            from classifier import classify_domain
            result = classify_domain("build an ETL pipeline")
            assert result == "data_engineering"

    def test_returns_other_for_invalid_domain(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="not_a_real_domain")]
        mock_client.messages.create.return_value = mock_response

        with patch("classifier.anthropic.Anthropic", return_value=mock_client):
            from classifier import classify_domain
            result = classify_domain("something weird")
            assert result == "other"

    def test_returns_other_on_api_failure(self):
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = Exception("API error")

        with patch("classifier.anthropic.Anthropic", return_value=mock_client):
            from classifier import classify_domain
            result = classify_domain("any prompt")
            assert result == "other"

    def test_all_seven_domains_are_valid(self):
        from classifier import DOMAINS
        assert len(DOMAINS) == 7
        assert "data_science" in DOMAINS
        assert "data_engineering" in DOMAINS
        assert "business_analytics" in DOMAINS
        assert "general_coding" in DOMAINS
        assert "documentation" in DOMAINS
        assert "devops" in DOMAINS
        assert "other" in DOMAINS
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/test_classifier.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'classifier'`

- [ ] **Step 3: Implement classifier.py**

```python
# mcp-server/classifier.py
import anthropic

DOMAINS = [
    "data_science",
    "data_engineering",
    "business_analytics",
    "general_coding",
    "documentation",
    "devops",
    "other"
]


def classify_domain(prompt: str) -> str:
    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-sonnet-4-5-20250514",
            max_tokens=20,
            system=(
                "You are a domain classifier. Classify the user's prompt into exactly one "
                "of these domains: data_science, data_engineering, business_analytics, "
                "general_coding, documentation, devops, other. "
                "Reply with only the domain name. No punctuation, no explanation."
            ),
            messages=[{"role": "user", "content": prompt}]
        )
        result = response.content[0].text.strip().lower()
        return result if result in DOMAINS else "other"
    except Exception:
        return "other"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/test_classifier.py -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add mcp-server/classifier.py mcp-server/tests/test_classifier.py
git commit -m "feat: add classifier module for domain classification"
```

---

### Task 4: Enhancer Module — Playbook-Powered Prompt Enhancement

**Files:**
- Create: `mcp-server/enhancer.py`
- Create: `mcp-server/tests/test_enhancer.py`

- [ ] **Step 1: Write the failing tests for enhancer module**

```python
# mcp-server/tests/test_enhancer.py
import pytest
from unittest.mock import patch, MagicMock


class TestEnhancePrompt:
    def test_returns_enhanced_prompt(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Enhanced version of the prompt")]
        mock_client.messages.create.return_value = mock_response

        with patch("enhancer.anthropic.Anthropic", return_value=mock_client):
            from enhancer import enhance_prompt
            result = enhance_prompt("analyze churn", "data_science")
            assert result == "Enhanced version of the prompt"

    def test_passes_domain_rules_in_system_prompt(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="boosted")]
        mock_client.messages.create.return_value = mock_response

        with patch("enhancer.anthropic.Anthropic", return_value=mock_client):
            from enhancer import enhance_prompt
            enhance_prompt("build pipeline", "data_engineering")
            call_kwargs = mock_client.messages.create.call_args
            system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
            assert "data_engineering" in system_prompt
            assert "pipeline" in system_prompt.lower()

    def test_injects_feedback_context(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="boosted")]
        mock_client.messages.create.return_value = mock_response

        with patch("enhancer.anthropic.Anthropic", return_value=mock_client):
            from enhancer import enhance_prompt
            enhance_prompt("query", "general_coding", "Always use TypeScript")
            call_kwargs = mock_client.messages.create.call_args
            system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
            assert "Always use TypeScript" in system_prompt

    def test_no_feedback_context_omits_feedback_section(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="boosted")]
        mock_client.messages.create.return_value = mock_response

        with patch("enhancer.anthropic.Anthropic", return_value=mock_client):
            from enhancer import enhance_prompt
            enhance_prompt("query", "other", "")
            call_kwargs = mock_client.messages.create.call_args
            system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
            assert "User feedback" not in system_prompt

    def test_returns_original_on_api_failure(self):
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = Exception("API error")

        with patch("enhancer.anthropic.Anthropic", return_value=mock_client):
            from enhancer import enhance_prompt
            result = enhance_prompt("my prompt", "other")
            assert "my prompt" in result
            assert "[ClaudeBoost: enhancement failed, original prompt returned]" in result

    def test_uses_fallback_rules_for_unknown_domain(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="boosted")]
        mock_client.messages.create.return_value = mock_response

        with patch("enhancer.anthropic.Anthropic", return_value=mock_client):
            from enhancer import enhance_prompt, DOMAIN_RULES
            enhance_prompt("query", "nonexistent_domain")
            call_kwargs = mock_client.messages.create.call_args
            system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
            assert DOMAIN_RULES["other"] in system_prompt

    def test_all_seven_domains_have_rules(self):
        from enhancer import DOMAIN_RULES
        expected = ["data_science", "data_engineering", "business_analytics",
                     "general_coding", "documentation", "devops", "other"]
        for domain in expected:
            assert domain in DOMAIN_RULES
            assert len(DOMAIN_RULES[domain]) > 50  # Non-trivial rules
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/test_enhancer.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'enhancer'`

- [ ] **Step 3: Implement enhancer.py**

```python
# mcp-server/enhancer.py
import anthropic

DOMAIN_RULES = {
    "data_science": (
        "You are a prompt enhancement expert for Data Science and ML Engineering.\n\n"
        "Rewrite the user's prompt to follow enterprise data science best practices:\n"
        "1. VERIFICATION: Add specific success criteria — metrics on a holdout set, "
        "baseline model comparison, confidence intervals (bootstrap, n=1000), per-class metrics if classification.\n"
        "2. CONTEXT: Specify the data (shape, source, domain), the target variable, and the business question.\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. DATA QUALITY: Request EDA profiling first if data is unknown — dtypes, nulls, distributions, correlations.\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No test set peeking — all decisions on validation set only\n"
        "   - No metric shopping — define primary metric upfront\n"
        "   - Always compare to a simple baseline before complex models\n"
        "   - Feature engineering must prevent data leakage (temporal ordering, CV for target encoding)\n"
        "   - Report effect size alongside p-values for statistical tests\n"
        "6. OUTPUT: Specify format — table, chart, summary, model card. Request SHAP values for interpretability.\n"
        "7. REPRODUCIBILITY: Request random seed, pinned versions, sklearn Pipeline wrapping."
    ),
    "data_engineering": (
        "You are a prompt enhancement expert for Data Engineering and Pipeline Development.\n\n"
        "Rewrite the user's prompt to follow enterprise data engineering best practices:\n"
        "1. VERIFICATION: Add validation gates between pipeline stages — schema checks, row counts, "
        "null percentage thresholds, value range checks, row count anomaly detection (>20% deviation from 7-day avg).\n"
        "2. CONTEXT: Specify the pipeline stage (ingestion/transform/load), data volume and frequency, "
        "tools in the stack (dbt, Spark, Airflow, BigQuery), input and output schemas.\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. RELIABILITY:\n"
        "   - Idempotency required — re-running must not create duplicates\n"
        "   - Retry logic with exponential backoff for external calls\n"
        "   - Dead-letter queue on failure\n"
        "   - Logging: row counts, execution time, anomalies at each stage\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No fire-and-forget — every stage must validate its outputs\n"
        "   - No silent data loss — count rows in and out\n"
        "   - No hardcoded credentials — use env vars or secret managers\n"
        "6. OUTPUT: Specify DAG structure, monitoring alerts, and SLA (e.g., data available by 06:00 UTC)."
    ),
    "business_analytics": (
        "You are a prompt enhancement expert for Business Analytics.\n\n"
        "Rewrite the user's prompt to follow enterprise analytics best practices:\n"
        "1. VERIFICATION: Define exact metric definitions, time ranges, comparison baselines or benchmarks.\n"
        "2. CONTEXT: Specify segmentation dimensions (region, product, cohort), data sources, stakeholder audience.\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. PRECISION:\n"
        "   - Define every metric unambiguously (e.g., 'MAU = unique users with >= 1 session in calendar month')\n"
        "   - Specify time range explicitly (absolute dates, not 'recently')\n"
        "   - Include a comparison baseline (prior period, benchmark, cohort)\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No vanity metrics — tie to business outcomes\n"
        "   - No charts without context — always include what the reader should conclude\n"
        "   - Statistical significance required for A/B test claims\n"
        "6. OUTPUT: Specify format — markdown table, executive summary, chart with title/axes/legend. "
        "Include recommended actions, not just observations."
    ),
    "general_coding": (
        "You are a prompt enhancement expert for Software Engineering.\n\n"
        "Rewrite the user's prompt to follow enterprise development best practices:\n"
        "1. VERIFICATION: Add specific success criteria — tests to write (unit, integration, e2e), "
        "lint and typecheck commands to run, edge cases to cover.\n"
        "2. CONTEXT: Specify programming language and version, reference existing patterns in the codebase, "
        "concrete input/output examples, performance or memory constraints.\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. QUALITY:\n"
        "   - Reference existing code patterns to follow\n"
        "   - Specify non-goals (what NOT to change)\n"
        "   - Define acceptance criteria ('done means: tests pass, types check, no new lint warnings')\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No scope creep — fix only what's requested\n"
        "   - No unnecessary dependencies — check existing packages first\n"
        "   - No silent error suppression — every catch must re-throw, return typed error, or log at ERROR\n"
        "   - No over-engineering — no abstractions for one-off tasks\n"
        "6. SECURITY: Request parameterized queries, input validation, no hardcoded secrets, auth checks."
    ),
    "documentation": (
        "You are a prompt enhancement expert for Technical Documentation.\n\n"
        "Rewrite the user's prompt to follow documentation best practices:\n"
        "1. VERIFICATION: Define how to verify the docs are accurate — cross-reference with code, "
        "have a subagent review for accuracy.\n"
        "2. CONTEXT: Specify target audience (junior dev, end user, exec, API consumer), "
        "output format (markdown, docstring, wiki, README, model card, ADR), tone (formal, conversational).\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. CONTENT:\n"
        "   - Specify what to explicitly include or exclude\n"
        "   - For API docs: request/response schemas, error codes, pagination, examples\n"
        "   - For model cards: purpose, training data, metrics, limitations, monitoring plan\n"
        "   - For ADRs: context, decision, consequences, alternatives considered\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No stale docs — docs must match current code\n"
        "   - No jargon without definition for non-technical audiences\n"
        "   - No missing examples — every API endpoint needs a request/response example"
    ),
    "devops": (
        "You are a prompt enhancement expert for DevOps and Platform Engineering.\n\n"
        "Rewrite the user's prompt to follow enterprise DevOps best practices:\n"
        "1. VERIFICATION: Add dry-run steps before apply, rollback verification, drift detection.\n"
        "2. CONTEXT: Specify the environment (dev/staging/prod), toolchain (Docker, Kubernetes, Terraform, "
        "GitHub Actions), current state, and desired state.\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. SAFETY:\n"
        "   - Always run plan/dry-run before apply\n"
        "   - Define rollback strategy and rollback triggers\n"
        "   - Specify failure modes and blast radius\n"
        "   - Include canary/shadow deploy strategy for production changes\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No YOLO deploys — always plan first, show what will change\n"
        "   - No missing rollback — every forward change needs a reverse\n"
        "   - No orphan resources — clean up after teardowns\n"
        "   - Scope permissions with --allowedTools when running in CI\n"
        "6. SECURITY: Check for secrets exposure, compliance requirements, access control."
    ),
    "other": (
        "You are a prompt enhancement expert.\n\n"
        "Rewrite the user's prompt to be significantly clearer and more specific:\n"
        "1. VERIFICATION: Add success criteria — how will you know the task is done correctly?\n"
        "2. CONTEXT: Add relevant files, patterns, constraints, and history.\n"
        "3. STRUCTURE: Follow Context → Goal → Task → Verification → Constraints → Output format.\n"
        "4. CLARITY:\n"
        "   - Define any ambiguous terms\n"
        "   - Add expected output format\n"
        "   - Include constraints and non-goals\n"
        "   - Specify acceptance criteria\n"
        "5. ANTI-PATTERNS TO PREVENT:\n"
        "   - No vague requests — every task needs a definition of done\n"
        "   - No unbounded scope — specify what's in and out of scope\n"
        "   - No missing verification — add tests, checks, or comparisons"
    )
}


def enhance_prompt(prompt: str, domain: str, feedback_context: str = "") -> str:
    try:
        client = anthropic.Anthropic()
        rules = DOMAIN_RULES.get(domain, DOMAIN_RULES["other"])

        feedback_instruction = ""
        if feedback_context:
            feedback_instruction = (
                f"\n\nUser feedback from previous boosts in this domain — "
                f"apply these preferences: {feedback_context}"
            )

        system_prompt = (
            f"{rules}{feedback_instruction}\n\n"
            "Rewrite the user's prompt to be significantly better. "
            "Return ONLY the improved prompt. No preamble, no explanation, no quotes around the result."
        )

        response = client.messages.create(
            model="claude-sonnet-4-5-20250514",
            max_tokens=600,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()
    except Exception:
        return f"{prompt}\n\n[ClaudeBoost: enhancement failed, original prompt returned]"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/test_enhancer.py -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add mcp-server/enhancer.py mcp-server/tests/test_enhancer.py
git commit -m "feat: add enhancer module with playbook-powered domain rules"
```

---

### Task 5: MCP Server Entry Point

**Files:**
- Create: `mcp-server/server.py`

- [ ] **Step 1: Implement server.py**

```python
# mcp-server/server.py
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio
import json
from classifier import classify_domain
from enhancer import enhance_prompt
from feedback import load_feedback_context, log_to_history

app = Server("claudeboost")


@app.list_tools()
async def list_tools():
    return [
        Tool(
            name="boost_prompt",
            description=(
                "Boost your prompt before sending to Claude. "
                "Detects domain, rewrites for clarity and specificity, "
                "shows original vs boosted side by side. You choose which to send."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The prompt to enhance"
                    }
                },
                "required": ["prompt"]
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict):
    if name != "boost_prompt":
        raise ValueError(f"Unknown tool: {name}")

    original = arguments["prompt"]
    domain = classify_domain(original)
    feedback_context = load_feedback_context(domain)
    boosted = enhance_prompt(original, domain, feedback_context)
    log_to_history(original, boosted, domain)

    output = f"""
╔══════════════════════════════════════════════════╗
║              ⚡ CLAUDEBOOST                      ║
╚══════════════════════════════════════════════════╝

🔵 ORIGINAL PROMPT
──────────────────
{original}

✨ BOOSTED PROMPT  [Domain: {domain}]
──────────────────────────────────────
{boosted}

──────────────────────────────────────────────────
Reply YES to use the boosted prompt, or NO to keep your original.
View history and rate boosts at: https://claudeboost.vercel.app
"""

    return [TextContent(type="text", text=output)]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 2: Verify server starts without import errors**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && timeout 3 python3 server.py 2>&1 || true`
Expected: No import errors. Server starts and waits for stdio input (may timeout, that's OK).

- [ ] **Step 3: Run all tests to verify nothing is broken**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/ -v`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add mcp-server/server.py
git commit -m "feat: add MCP server entry point with boost_prompt tool"
```

---

### Task 6: MCP Registration and End-to-End Verification

**Files:**
- Modify: `~/.claude/mcp_settings.json`

- [ ] **Step 1: Find the absolute path of server.py**

Run: `realpath /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server/server.py`
Expected: Full absolute path printed.

- [ ] **Step 2: Register the MCP server with Claude Code**

Read the current `~/.claude/mcp_settings.json`, then add the `claudeboost` entry under `mcpServers`:

```json
{
  "mcpServers": {
    "claudeboost": {
      "command": "python3",
      "args": ["/Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server/server.py"]
    }
  }
}
```

Merge with any existing entries — do not overwrite the file.

- [ ] **Step 3: Verify ANTHROPIC_API_KEY is set**

Run: `echo $ANTHROPIC_API_KEY | head -c 10`
Expected: First 10 chars of the key (e.g., `sk-ant-api`). If empty, the user needs to set it.

- [ ] **Step 4: Run all tests one final time**

Run: `cd /Users/ferhadsuleymanzade/Documents/claudeboost/mcp-server && python3 -m pytest tests/ -v`
Expected: All tests PASS

- [ ] **Step 5: Commit all remaining changes and push**

```bash
git add -A
git commit -m "feat: complete MCP server with registration config"
git push origin feature/project-docs
```

- [ ] **Step 6: Instruct user to restart Claude Code and test**

Tell the user to restart Claude Code and test with:
```
Use the boost_prompt tool with this prompt: "analyze my churn data"
```

---

## Summary

| Task | What it builds | Dependencies |
|------|---------------|--------------|
| 1 | Project setup, `requirements.txt`, install | None |
| 2 | `feedback.py` — data layer | Task 1 |
| 3 | `classifier.py` — domain classification | Task 1 |
| 4 | `enhancer.py` — playbook-powered enhancement | Task 1 |
| 5 | `server.py` — MCP entry point | Tasks 2, 3, 4 |
| 6 | MCP registration + e2e verification | Task 5 |
