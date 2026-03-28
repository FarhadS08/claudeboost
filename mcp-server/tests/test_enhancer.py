"""Tests for enhancer module — playbook-powered prompt enhancement."""

import unittest
from unittest.mock import patch, MagicMock

from enhancer import DOMAIN_RULES, enhance_prompt


class TestDomainRules(unittest.TestCase):
    def test_all_seven_domains_have_rules(self):
        expected = {
            "data_science",
            "data_engineering",
            "business_analytics",
            "general_coding",
            "documentation",
            "devops",
            "other",
        }
        self.assertEqual(set(DOMAIN_RULES.keys()), expected)
        for domain, rules in DOMAIN_RULES.items():
            self.assertGreater(len(rules), 50, f"{domain} rules too short")


class TestEnhancePrompt(unittest.TestCase):
    @patch("enhancer.anthropic")
    def test_returns_enhanced_prompt(self, mock_anthropic):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Enhanced version")]
        mock_client.messages.create.return_value = mock_response

        result = enhance_prompt("original prompt", "general_coding")
        self.assertEqual(result, "Enhanced version")

    @patch("enhancer.anthropic")
    def test_passes_domain_rules_in_system_prompt(self, mock_anthropic):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Enhanced")]
        mock_client.messages.create.return_value = mock_response

        enhance_prompt("test prompt", "data_science")

        call_kwargs = mock_client.messages.create.call_args
        system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
        self.assertIn("Data Science", system_prompt)
        self.assertIn("holdout set", system_prompt)
        self.assertIn("SHAP values", system_prompt)

    @patch("enhancer.anthropic")
    def test_injects_feedback_context(self, mock_anthropic):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Enhanced")]
        mock_client.messages.create.return_value = mock_response

        enhance_prompt("test prompt", "general_coding", feedback_context="Always use TypeScript")

        call_kwargs = mock_client.messages.create.call_args
        system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
        self.assertIn("Always use TypeScript", system_prompt)
        self.assertIn("User feedback", system_prompt)

    @patch("enhancer.anthropic")
    def test_no_feedback_context_omits_feedback_section(self, mock_anthropic):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Enhanced")]
        mock_client.messages.create.return_value = mock_response

        enhance_prompt("test prompt", "general_coding")

        call_kwargs = mock_client.messages.create.call_args
        system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
        self.assertNotIn("User feedback", system_prompt)

    @patch("enhancer.anthropic")
    def test_returns_original_on_api_failure(self, mock_anthropic):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_client.messages.create.side_effect = Exception("API down")

        result = enhance_prompt("my original prompt", "general_coding")
        self.assertIn("my original prompt", result)
        self.assertIn("[ClaudeBoost: enhancement failed, original prompt returned]", result)

    @patch("enhancer.anthropic")
    def test_uses_fallback_rules_for_unknown_domain(self, mock_anthropic):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="Enhanced")]
        mock_client.messages.create.return_value = mock_response

        enhance_prompt("test prompt", "quantum_computing")

        call_kwargs = mock_client.messages.create.call_args
        system_prompt = call_kwargs.kwargs.get("system") or call_kwargs[1].get("system")
        # Should use "other" rules
        self.assertIn("You are a prompt enhancement expert.", system_prompt)
        self.assertIn("No vague requests", system_prompt)


if __name__ == "__main__":
    unittest.main()
