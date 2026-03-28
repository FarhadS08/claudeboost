import json
import os
import pytest
import sys

# Ensure mcp-server is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import feedback


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _patch_paths(monkeypatch, tmp_path):
    """Redirect all module-level path constants to tmp_path."""
    claudeboost_dir = str(tmp_path / ".claudeboost")
    history_file = os.path.join(claudeboost_dir, "history.json")
    config_file = os.path.join(claudeboost_dir, "config.json")
    monkeypatch.setattr(feedback, "CLAUDEBOOST_DIR", claudeboost_dir)
    monkeypatch.setattr(feedback, "HISTORY_FILE", history_file)
    monkeypatch.setattr(feedback, "CONFIG_FILE", config_file)
    return claudeboost_dir, history_file, config_file


# ---------------------------------------------------------------------------
# ensure_files tests
# ---------------------------------------------------------------------------

def test_creates_directory_and_files(monkeypatch, tmp_path):
    claudeboost_dir, history_file, config_file = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()

    assert os.path.isdir(claudeboost_dir)
    assert os.path.isfile(history_file)
    assert os.path.isfile(config_file)


def test_history_initialized_as_empty_list(monkeypatch, tmp_path):
    _, history_file, _ = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()

    with open(history_file) as f:
        data = json.load(f)
    assert data == []


def test_config_initialized_with_default_domains(monkeypatch, tmp_path):
    _, _, config_file = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()

    with open(config_file) as f:
        config = json.load(f)

    expected_domains = {
        "data_science",
        "data_engineering",
        "business_analytics",
        "general_coding",
        "documentation",
        "devops",
        "other",
    }
    assert set(config.keys()) == expected_domains


def test_does_not_overwrite_existing_files(monkeypatch, tmp_path):
    _, history_file, config_file = _patch_paths(monkeypatch, tmp_path)

    # Pre-create files with custom content
    feedback.ensure_files()  # creates dir first

    custom_history = [{"id": 99, "domain": "other"}]
    custom_config = {"data_science": "use pandas"}

    with open(history_file, "w") as f:
        json.dump(custom_history, f)
    with open(config_file, "w") as f:
        json.dump(custom_config, f)

    # Call again — should not overwrite
    feedback.ensure_files()

    with open(history_file) as f:
        assert json.load(f) == custom_history
    with open(config_file) as f:
        assert json.load(f) == custom_config


# ---------------------------------------------------------------------------
# log_to_history tests
# ---------------------------------------------------------------------------

def test_appends_entry_to_empty_history(monkeypatch, tmp_path):
    _, history_file, _ = _patch_paths(monkeypatch, tmp_path)

    feedback.log_to_history("original prompt", "boosted prompt", "data_science")

    with open(history_file) as f:
        history = json.load(f)

    assert len(history) == 1
    entry = history[0]
    assert entry["id"] == 1
    assert entry["domain"] == "data_science"
    assert entry["original"] == "original prompt"
    assert entry["boosted"] == "boosted prompt"
    assert entry["chosen"] is None
    assert entry["rating"] is None
    assert entry["feedback"] == ""
    # timestamp should be a non-empty string
    assert isinstance(entry["timestamp"], str) and entry["timestamp"]


def test_auto_increments_id(monkeypatch, tmp_path):
    _patch_paths(monkeypatch, tmp_path)

    feedback.log_to_history("p1", "b1", "devops")
    feedback.log_to_history("p2", "b2", "devops")

    with open(feedback.HISTORY_FILE) as f:
        history = json.load(f)

    assert history[0]["id"] == 1
    assert history[1]["id"] == 2


def test_resets_malformed_history(monkeypatch, tmp_path):
    _, history_file, _ = _patch_paths(monkeypatch, tmp_path)

    # Ensure directory exists then write corrupt JSON
    feedback.ensure_files()
    with open(history_file, "w") as f:
        f.write("NOT VALID JSON {{{")

    # Should not raise; should reset and append
    feedback.log_to_history("orig", "boost", "other")

    with open(history_file) as f:
        history = json.load(f)

    assert len(history) == 1
    assert history[0]["id"] == 1


# ---------------------------------------------------------------------------
# load_feedback_context tests
# ---------------------------------------------------------------------------

def test_returns_empty_string_when_no_feedback(monkeypatch, tmp_path):
    _patch_paths(monkeypatch, tmp_path)

    result = feedback.load_feedback_context("data_science")

    assert result == ""


def test_returns_constraint_only(monkeypatch, tmp_path):
    _, _, config_file = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()
    # Write a constraint for data_science
    config = dict(feedback.DEFAULT_CONFIG)
    config["data_science"] = "always use numpy"
    with open(config_file, "w") as f:
        json.dump(config, f)

    result = feedback.load_feedback_context("data_science")

    assert result == "always use numpy"


def test_returns_feedback_from_history(monkeypatch, tmp_path):
    _, history_file, _ = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()

    # Add one matching entry and one non-matching entry
    history = [
        {
            "id": 1,
            "timestamp": "2026-01-01T00:00:00+00:00",
            "domain": "data_science",
            "original": "orig",
            "boosted": "boost",
            "chosen": None,
            "rating": None,
            "feedback": "great output",
        },
        {
            "id": 2,
            "timestamp": "2026-01-02T00:00:00+00:00",
            "domain": "devops",
            "original": "orig2",
            "boosted": "boost2",
            "chosen": None,
            "rating": None,
            "feedback": "should not appear",
        },
    ]
    with open(history_file, "w") as f:
        json.dump(history, f)

    result = feedback.load_feedback_context("data_science")

    assert "great output" in result
    assert "should not appear" not in result


def test_takes_last_5_feedback_entries(monkeypatch, tmp_path):
    _, history_file, _ = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()

    # Write 7 matching entries
    history = []
    for i in range(1, 8):
        history.append({
            "id": i,
            "timestamp": f"2026-01-{i:02d}T00:00:00+00:00",
            "domain": "general_coding",
            "original": f"orig{i}",
            "boosted": f"boost{i}",
            "chosen": None,
            "rating": None,
            "feedback": f"feedback{i}",
        })
    with open(history_file, "w") as f:
        json.dump(history, f)

    result = feedback.load_feedback_context("general_coding")

    # Should include feedback3..7 (last 5), not feedback1 or feedback2
    for i in range(3, 8):
        assert f"feedback{i}" in result
    for i in range(1, 3):
        assert f"feedback{i}" not in result


def test_combines_constraint_and_feedback(monkeypatch, tmp_path):
    _, history_file, config_file = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()

    # Set constraint
    config = dict(feedback.DEFAULT_CONFIG)
    config["documentation"] = "be concise"
    with open(config_file, "w") as f:
        json.dump(config, f)

    # Add a matching history entry
    history = [
        {
            "id": 1,
            "timestamp": "2026-01-01T00:00:00+00:00",
            "domain": "documentation",
            "original": "orig",
            "boosted": "boost",
            "chosen": None,
            "rating": None,
            "feedback": "nice structure",
        }
    ]
    with open(history_file, "w") as f:
        json.dump(history, f)

    result = feedback.load_feedback_context("documentation")

    assert "be concise" in result
    assert "nice structure" in result


def test_resets_malformed_config(monkeypatch, tmp_path):
    _, _, config_file = _patch_paths(monkeypatch, tmp_path)

    feedback.ensure_files()
    with open(config_file, "w") as f:
        f.write("BROKEN JSON <<<")

    # Should not raise; malformed config treated as DEFAULT_CONFIG (empty strings)
    result = feedback.load_feedback_context("data_science")

    # With no feedback and reset (empty) config, result should be empty string
    assert result == ""
