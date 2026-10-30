#!/usr/bin/env python3
"""Exporter rejection tests do not need generated runtime artifacts."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('export_runtime', ROOT / 'scripts/export-theme-runtime.py')

class ExportTests(unittest.TestCase):
    def test_existing_destination_is_preserved(self):
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / 'runtime'
            out.mkdir()
            (out / 'keep').write_text('private')
            with self.assertRaisesRegex(ValueError, 'exist'):
                module.export(out, allow_dirty=True)
            self.assertEqual((out / 'keep').read_text(), 'private')

    def test_source_files_never_follow_symlinks(self):
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'target').write_text('secret')
            (root / 'link').symlink_to(root / 'target')
            with self.assertRaisesRegex(ValueError, 'symlink'):
                module.checked_read(root, 'link')

if __name__ == '__main__':
    unittest.main()
