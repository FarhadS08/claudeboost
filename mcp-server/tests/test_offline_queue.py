"""Tests for offline queue -- Supabase SPOF protection."""

import json
import os
import tempfile
import unittest
from unittest.mock import patch

from claudeboost_mcp import db


class TestOfflineQueue(unittest.TestCase):

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.queue_file = os.path.join(self.tmpdir, "offline_queue.json")
        self._orig_queue_file = db.OFFLINE_QUEUE_FILE
        db.OFFLINE_QUEUE_FILE = self.queue_file
        db.CLAUDEBOOST_DIR = self.tmpdir

    def tearDown(self):
        db.OFFLINE_QUEUE_FILE = self._orig_queue_file
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_enqueue_creates_queue_file(self):
        db._enqueue("boost_history", {"domain": "general_coding"})
        self.assertTrue(os.path.exists(self.queue_file))
        with open(self.queue_file) as f:
            queue = json.load(f)
        self.assertEqual(len(queue), 1)
        self.assertEqual(queue[0]["table"], "boost_history")

    def test_enqueue_appends_multiple_entries(self):
        db._enqueue("boost_history", {"id": 1})
        db._enqueue("boost_history", {"id": 2})
        queue = db._load_queue()
        self.assertEqual(len(queue), 2)

    def test_flush_queue_removes_successful_entries(self):
        db._enqueue("boost_history", {"domain": "devops"})
        db._enqueue("boost_history", {"domain": "data_science"})
        with patch.object(db, "_supabase_request", return_value=[{"id": 1}]):
            flushed = db._flush_queue()
        self.assertEqual(flushed, 2)
        self.assertEqual(db._load_queue(), [])

    def test_flush_queue_keeps_failed_entries(self):
        db._enqueue("boost_history", {"domain": "devops"})
        db._enqueue("boost_history", {"domain": "data_science"})
        responses = [[{"id": 1}], None]
        with patch.object(db, "_supabase_request", side_effect=responses):
            flushed = db._flush_queue()
        self.assertEqual(flushed, 1)
        remaining = db._load_queue()
        self.assertEqual(len(remaining), 1)
        self.assertEqual(remaining[0]["body"]["domain"], "data_science")

    def test_flush_empty_queue_returns_zero(self):
        self.assertEqual(db._flush_queue(), 0)

    def test_load_queue_returns_empty_list_when_no_file(self):
        self.assertEqual(db._load_queue(), [])

    def test_load_queue_handles_malformed_json(self):
        with open(self.queue_file, "w") as f:
            f.write("not valid json{{{")
        self.assertEqual(db._load_queue(), [])


if __name__ == "__main__":
    unittest.main()
