"""Integration tests for retry logic in classifier and enhancer."""

import unittest
from unittest.mock import patch, MagicMock, call
import anthropic as anthropic_module

from claudeboost_mcp.classifier import classify_domain
from claudeboost_mcp.enhancer import enhance_prompt


class TestClassifierRetry(unittest.TestCase):

    @patch("claudeboost_mcp.classifier.time.sleep")
    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_retries_on_rate_limit_then_succeeds(self, mock_cls, mock_sleep):
        mock_client = MagicMock()
        mock_cls.return_value = mock_client
        success_response = MagicMock()
        success_response.content = [MagicMock(text="general_coding")]
        mock_client.messages.create.side_effect = [
            anthropic_module.RateLimitError.__new__(anthropic_module.RateLimitError),
            success_response,
        ]
        result = classify_domain("write a function")
        self.assertEqual(result, "general_coding")
        self.assertEqual(mock_client.messages.create.call_count, 2)
        mock_sleep.assert_called_once_with(1)

    @patch("claudeboost_mcp.classifier.time.sleep")
    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_returns_other_after_all_retries_exhausted(self, mock_cls, mock_sleep):
        mock_client = MagicMock()
        mock_cls.return_value = mock_client
        mock_client.messages.create.side_effect = \
            anthropic_module.RateLimitError.__new__(anthropic_module.RateLimitError)
        result = classify_domain("any prompt")
        self.assertEqual(result, "other")
        self.assertEqual(mock_client.messages.create.call_count, 4)
        self.assertEqual(mock_sleep.call_count, 3)
        mock_sleep.assert_has_calls([call(1), call(2), call(4)])

    @patch("claudeboost_mcp.classifier.time.sleep")
    @patch("claudeboost_mcp.classifier.anthropic.Anthropic")
    def test_no_retry_on_4xx_client_error(self, mock_cls, mock_sleep):
        mock_client = MagicMock()
        mock_cls.return_value = mock_client
        err = anthropic_module.APIStatusError.__new__(anthropic_module.APIStatusError)
        err.status_code = 400
        mock_client.messages.create.side_effect = err
        result = classify_domain("test")
        self.assertEqual(result, "other")
        self.assertEqual(mock_client.messages.create.call_count, 1)
        mock_sleep.assert_not_called()


class TestEnhancerRetry(unittest.TestCase):

    @patch("claudeboost_mcp.enhancer.time.sleep")
    @patch("claudeboost_mcp.enhancer.anthropic")
    def test_retries_on_server_error_then_succeeds(self, mock_anthropic, mock_sleep):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        success = MagicMock()
        success.content = [MagicMock(text="enhanced prompt")]
        err = anthropic_module.APIStatusError.__new__(anthropic_module.APIStatusError)
        err.status_code = 503
        mock_anthropic.APIStatusError = anthropic_module.APIStatusError
        mock_anthropic.RateLimitError = anthropic_module.RateLimitError
        mock_anthropic.APIConnectionError = anthropic_module.APIConnectionError
        mock_client.messages.create.side_effect = [err, success]
        result = enhance_prompt("original", "general_coding")
        self.assertEqual(result, "enhanced prompt")
        self.assertEqual(mock_client.messages.create.call_count, 2)
        mock_sleep.assert_called_once_with(1)

    @patch("claudeboost_mcp.enhancer.time.sleep")
    @patch("claudeboost_mcp.enhancer.anthropic")
    def test_graceful_degradation_after_all_retries(self, mock_anthropic, mock_sleep):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_anthropic.RateLimitError = anthropic_module.RateLimitError
        mock_anthropic.APIStatusError = anthropic_module.APIStatusError
        mock_anthropic.APIConnectionError = anthropic_module.APIConnectionError
        mock_client.messages.create.side_effect = \
            anthropic_module.RateLimitError.__new__(anthropic_module.RateLimitError)
        result = enhance_prompt("my prompt", "general_coding")
        self.assertEqual(result, "my prompt")

    @patch("claudeboost_mcp.enhancer.time.sleep")
    @patch("claudeboost_mcp.enhancer.anthropic")
    def test_returns_original_on_4xx_immediately(self, mock_anthropic, mock_sleep):
        mock_client = MagicMock()
        mock_anthropic.Anthropic.return_value = mock_client
        mock_anthropic.APIStatusError = anthropic_module.APIStatusError
        err = anthropic_module.APIStatusError.__new__(anthropic_module.APIStatusError)
        err.status_code = 401
        mock_client.messages.create.side_effect = err
        result = enhance_prompt("my prompt", "devops")
        self.assertEqual(result, "my prompt")
        self.assertEqual(mock_client.messages.create.call_count, 1)
        mock_sleep.assert_not_called()


if __name__ == "__main__":
    unittest.main()
