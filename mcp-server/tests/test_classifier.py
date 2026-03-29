import unittest
from unittest.mock import patch, MagicMock

from claudeboost_mcp.classifier import classify_domain, DOMAINS


class TestClassifyDomain(unittest.TestCase):

    def _make_mock_client(self, text):
        mock_message = MagicMock()
        mock_message.content = [MagicMock(text=text)]

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_message
        return mock_client

    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_returns_valid_domain(self, mock_anthropic_cls):
        mock_anthropic_cls.return_value = self._make_mock_client("data_science")
        result = classify_domain("How do I train a neural network?")
        self.assertEqual(result, "data_science")

    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_strips_and_lowercases_response(self, mock_anthropic_cls):
        mock_anthropic_cls.return_value = self._make_mock_client("  Data_Engineering  \n")
        result = classify_domain("Build an ETL pipeline")
        self.assertEqual(result, "data_engineering")

    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_returns_other_for_invalid_domain(self, mock_anthropic_cls):
        mock_anthropic_cls.return_value = self._make_mock_client("not_a_real_domain")
        result = classify_domain("something weird")
        self.assertEqual(result, "other")

    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_returns_other_on_api_failure(self, mock_anthropic_cls):
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = Exception("API error")
        mock_anthropic_cls.return_value = mock_client
        result = classify_domain("any prompt")
        self.assertEqual(result, "other")

    def test_all_seven_domains_are_valid(self):
        expected = [
            "data_science",
            "data_engineering",
            "business_analytics",
            "general_coding",
            "documentation",
            "devops",
            "other",
        ]
        self.assertEqual(len(DOMAINS), 7)
        self.assertEqual(DOMAINS, expected)


if __name__ == "__main__":
    unittest.main()
