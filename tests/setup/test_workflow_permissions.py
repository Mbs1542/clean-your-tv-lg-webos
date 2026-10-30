"""Catch permission escalation rejected before reusable release jobs can start."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]


class ReleasePermissions(unittest.TestCase):
    def test_release_caller_allows_callee_job_permissions(self):
        caller = (ROOT / '.github/workflows/release.yml').read_text()
        publish = re.search(r'^  publish:\n(.*?)(?=^  [\w-]+:|\Z)', caller, re.M | re.S).group(1)
        granted = dict(re.findall(r'^      ([\w-]+): (read|write|none)$', publish, re.M))
        callee = (ROOT / '.github/workflows/publish-release.yml').read_text()
        requested = re.findall(r'^      ([\w-]+): (read|write|none)$', callee, re.M)
        levels = {'none': 0, 'read': 1, 'write': 2}
        for scope, level in requested:
            with self.subTest(scope=scope, level=level):
                self.assertGreaterEqual(levels[granted.get(scope, 'none')], levels[level],
                                        'Reusable jobs cannot elevate the caller token, even when skipped')


if __name__ == '__main__':
    unittest.main()
