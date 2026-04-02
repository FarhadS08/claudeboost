"""Tests for rate limiter."""

import json
import os
import tempfile
import unittest
from datetime import datetime, timezone

from claudeboost_mcp import rate_limiter


class TestRateLimiter(unittest.TestCase):

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.rate_file = os.path.join(self.tmpdir, "rate_limits.json")
        self._orig_file = rate_limiter.RATE_FILE
        self._orig_dir = rate_limiter.CLAUDEBOOST_DIR
        rate_limiter.RATE_FILE = self.rate_file
        rate_limiter.CLAUDEBOOST_DIR = self.tmpdir

    def tearDown(self):
        rate_limiter.RATE_FILE = self._orig_file
        rate_limiter.CLAUDEBOOST_DIR = self._orig_dir
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_allows_first_call(self):
        self.assertTrue(rate_limiter.check_rate_limit("user_1")["allowed"])

    def test_records_and_increments(self):
        rate_limiter.record_call("user_1")
        rate_limiter.record_call("user_1")
        usage = rate_limiter.get_usage("user_1")
        self.assertEqual(usage["hourly_used"], 2)
        self.assertEqual(usage["daily_used"], 2)

    def test_blocks_when_hourly_limit_exceeded(self):
        now = datetime.now(timezone.utc)
        hour_key = f"h:{now.strftime('%Y-%m-%dT%H')}"
        day_key = f"d:{now.strftime('%Y-%m-%d')}"
        with open(self.rate_file, "w") as f:
            json.dump({"user_x": {hour_key: 100, day_key: 100}}, f)
        result = rate_limiter.check_rate_limit("user_x")
        self.assertFalse(result["allowed"])
        self.assertIn("Hourly limit", result["reason"])

    def test_blocks_when_daily_limit_exceeded(self):
        now = datetime.now(timezone.utc)
        hour_key = f"h:{now.strftime('%Y-%m-%dT%H')}"
        day_key = f"d:{now.strftime('%Y-%m-%d')}"
        with open(self.rate_file, "w") as f:
            json.dump({"user_y": {hour_key: 5, day_key: 500}}, f)
        result = rate_limiter.check_rate_limit("user_y")
        self.assertFalse(result["allowed"])
        self.assertIn("Daily limit", result["reason"])

    def test_different_users_are_independent(self):
        now = datetime.now(timezone.utc)
        hour_key = f"h:{now.strftime('%Y-%m-%dT%H')}"
        day_key = f"d:{now.strftime('%Y-%m-%d')}"
        with open(self.rate_file, "w") as f:
            json.dump({"user_a": {hour_key: 100, day_key: 100}}, f)
        self.assertFalse(rate_limiter.check_rate_limit("user_a")["allowed"])
        self.assertTrue(rate_limiter.check_rate_limit("user_b")["allowed"])

    def test_get_usage_returns_defaults_for_new_user(self):
        usage = rate_limiter.get_usage("brand_new_user")
        self.assertEqual(usage["hourly_used"], 0)
        self.assertEqual(usage["daily_used"], 0)
        self.assertEqual(usage["hourly_limit"], 100)
        self.assertEqual(usage["daily_limit"], 500)


if __name__ == "__main__":
    unittest.main()
