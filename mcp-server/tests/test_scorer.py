"""Tests for scorer.py — prompt scoring across 6 dimensions."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from claudeboost_mcp.scorer import (
    score_prompt,
    get_weakest_dimensions,
    get_weighted_weakest,
    get_level,
    DIMENSIONS,
    DOMAIN_WEIGHTS,
)


# ─── Helpers ───────────────────────────────────────────────────────────────

def assert_all_dimensions(result: dict):
    """Assert all 6 dimensions are present in the scores dict."""
    for dim in DIMENSIONS:
        assert dim in result["dimensions"], f"Missing dimension: {dim}"


# ─── 1. Minimal prompt scores low ──────────────────────────────────────────

def test_minimal_prompt_scores_low():
    result = score_prompt("fix the bug")
    assert result["total"] <= 10, f"Expected total <= 10, got {result['total']}"


# ─── 2. Detailed prompt scores high ────────────────────────────────────────

def test_detailed_prompt_scores_high():
    prompt = (
        "## Task\n"
        "Refactor the UserAuthService in @src/services/UserAuthService.ts "
        "to fix the race condition described in ticket AUTH-123.\n\n"
        "## Context\n"
        "The current implementation does not handle concurrent login attempts. "
        "Do not modify the public API or add new dependencies.\n\n"
        "## Steps\n"
        "1. Review the existing login() method\n"
        "2. Add a mutex lock around the session creation block\n"
        "3. Verify with pytest and run the regression suite\n\n"
        "## Output\n"
        "- Updated @src/services/UserAuthService.ts\n"
        "- A test file at @tests/test_user_auth.py in JSON format\n"
        "- Ensure backward compatible changes only\n"
    )
    result = score_prompt(prompt)
    assert result["total"] >= 22, f"Expected total >= 22, got {result['total']}"


# ─── 3. Specificity: file references boost score ───────────────────────────

def test_specificity_detects_file_references():
    low = score_prompt("fix the authentication logic")
    high = score_prompt("fix the authentication logic in @src/auth/login.py line 42")
    assert high["dimensions"]["specificity"] > low["dimensions"]["specificity"]


# ─── 4. Verification: test keywords detected ───────────────────────────────

def test_verification_detects_test_keywords():
    prompt = "Implement the feature and run pytest after implementing to verify it works."
    result = score_prompt(prompt)
    assert result["dimensions"]["verification"] >= 3


# ─── 5. Context: @references bump context ──────────────────────────────────

def test_context_detects_at_references():
    low = score_prompt("update the user service to support OAuth")
    high = score_prompt("update @src/services/UserService.ts to support OAuth")
    assert high["dimensions"]["context"] > low["dimensions"]["context"]


# ─── 6. Constraints: negative instructions detected ────────────────────────

def test_constraints_detects_negative_instructions():
    low = score_prompt("add a caching layer")
    high = score_prompt("add a caching layer, do not add dependencies")
    assert high["dimensions"]["constraints"] > low["dimensions"]["constraints"]


# ─── 7. Structure: numbered steps detected ─────────────────────────────────

def test_structure_detects_numbered_steps():
    low = score_prompt("do X then do Y")
    high = score_prompt("1. do X\n2. do Y\n3. do Z")
    assert high["dimensions"]["structure"] > low["dimensions"]["structure"]


# ─── 8. Output definition: format spec detected ────────────────────────────

def test_output_detects_format_spec():
    low = score_prompt("summarize the results")
    high = score_prompt("summarize the results and output as JSON")
    assert high["dimensions"]["output_definition"] > low["dimensions"]["output_definition"]


# ─── 9. get_weakest_dimensions returns dimensions below threshold ───────────

def test_get_weakest_dimensions():
    scores = {
        "specificity": 4,
        "verification": 1,
        "context": 2,
        "constraints": 5,
        "structure": 3,
        "output_definition": 1,
    }
    weakest = get_weakest_dimensions(scores, threshold=3)
    assert "verification" in weakest
    assert "context" in weakest
    assert "output_definition" in weakest
    assert "specificity" not in weakest
    assert "constraints" not in weakest
    # should be sorted ascending by score
    assert weakest[0] in ["verification", "output_definition"]  # both score 1


# ─── 10. get_level boundaries ──────────────────────────────────────────────

def test_get_level_boundaries():
    assert get_level(1.0) == 1
    assert get_level(1.4) == 1
    assert get_level(1.5) == 2
    assert get_level(2.4) == 2
    assert get_level(2.5) == 3
    assert get_level(3.4) == 3
    assert get_level(3.5) == 4
    assert get_level(4.4) == 4
    assert get_level(4.5) == 5
    assert get_level(5.0) == 5


# ─── 11. get_weighted_weakest prioritizes critical dimensions ───────────────

def test_get_weighted_weakest_prioritizes_critical():
    # verification and output_definition are "critical" (weight=3) for data_science
    scores = {
        "specificity": 2,       # weight=2, gap=1 → priority=2
        "verification": 2,      # weight=3, gap=1 → priority=3  ← higher
        "context": 2,           # weight=3, gap=1 → priority=3  ← higher
        "constraints": 2,       # weight=2, gap=1 → priority=2
        "structure": 2,         # weight=2, gap=1 → priority=2
        "output_definition": 2, # weight=3, gap=1 → priority=3  ← higher
    }
    weakest = get_weighted_weakest(scores, domain="data_science", threshold=3)
    # verification, context, output_definition should appear before specificity/constraints/structure
    critical_dims = {"verification", "context", "output_definition"}
    non_critical_dims = {"specificity", "constraints", "structure"}
    # All should be present (all below threshold=3)
    assert set(weakest) == critical_dims | non_critical_dims
    # First 3 should all be critical
    top_3 = set(weakest[:3])
    assert top_3 == critical_dims


# ─── 12. All dimensions always present ─────────────────────────────────────

def test_all_dimensions_present():
    for prompt in ["", "x", "fix bug", "write code\ntest it\nverify"]:
        result = score_prompt(prompt)
        assert_all_dimensions(result)
        assert "total" in result
        assert "average" in result
        assert "level" in result
        assert "weakest" in result


# ─── Bonus: score_prompt structure validation ───────────────────────────────

def test_score_prompt_returns_valid_structure():
    result = score_prompt("Add error handling to the payment service.")
    assert isinstance(result["dimensions"], dict)
    assert isinstance(result["total"], int)
    assert isinstance(result["average"], float)
    assert isinstance(result["level"], int)
    assert isinstance(result["weakest"], list)
    for dim, val in result["dimensions"].items():
        assert 1 <= val <= 5, f"Score {val} for {dim} out of range"
    assert result["total"] == sum(result["dimensions"].values())
    assert 1 <= result["level"] <= 5


def test_score_range_all_dimensions():
    """All individual dimension scores must be 1-5."""
    prompts = [
        "fix bug",
        "## Task\nDo something\n1. step one\n2. step two\n## Output\nJSON file",
        "run pytest and verify the edge case in @src/foo.py do not add deps",
    ]
    for p in prompts:
        result = score_prompt(p)
        for dim, val in result["dimensions"].items():
            assert 1 <= val <= 5, f"Prompt '{p[:30]}': {dim}={val} out of range"
