"""Reuse must survive only known metadata changes, never unbuilt product inputs."""
from pathlib import Path
import runpy
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class ReleaseInputs(unittest.TestCase):
    def setUp(self):
        self.assertTrue((ROOT / 'scripts/release-inputs.py').exists(), 'Shared release input verifier is required')
        self.inputs = runpy.run_path(str(ROOT / 'scripts/release-inputs.py'))
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.git('init', '-b', 'main')
        self.git('config', 'user.name', 'CI test')
        self.git('config', 'user.email', 'ci@example.invalid')
        self.write('launcher/app.js', 'product')
        self.write('release-versions.json', '{"release":"2.0.0"}')
        self.write('release-plan.json', '{}')
        self.write('README.md', 'release links')
        self.write('docs/INSTALL.md', 'instructions')
        self.source = self.commit('candidate')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, text=True, stderr=subprocess.DEVNULL).strip()

    def write(self, name, value):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)

    def commit(self, message):
        self.git('add', '.')
        self.git('commit', '-m', message)
        return self.git('rev-parse', 'HEAD')

    def verify(self, head=None):
        return self.inputs['verify_inputs'](self.source, head or self.git('rev-parse', 'HEAD'), self.root)

    def test_evidence_and_guides_preserve_input_identity(self):
        self.write('release-plan.json', '{"acceptance":"observed"}')
        self.write('README.md', 'corrected release links')
        self.write('docs/INSTALL.md', 'corrected instructions')
        self.write('docs/RELEASE-2.0.0-ACCEPTANCE.md', 'physical observations')
        self.commit('record acceptance')
        self.verify()

    def test_unbuilt_product_inputs_and_packaged_markdown_are_rejected(self):
        for name in ('launcher/app.js', 'release-versions.json', 'package-lock.json',
                     '.github/workflows/cytv.yml', 'scripts/build-cytv.py',
                     'tests/setup/test_release_inputs.py', 'THIRD_PARTY_NOTICES.md',
                     'android/app/src/main/assets/ui/guide/README.md',
                     'docs/tool.py', 'docs/source.json', 'unknown/file'):
            with self.subTest(name=name):
                self.git('reset', '--hard', self.source)
                self.git('clean', '-fd')
                self.write(name, 'changed')
                self.commit('unbuilt input')
                with self.assertRaisesRegex(ValueError, 'inputs'):
                    self.verify()

    def test_executable_or_symlink_documentation_is_not_exempt(self):
        (self.root / 'README.md').chmod(0o755)
        self.commit('executable documentation')
        with self.assertRaisesRegex(ValueError, 'inputs'):
            self.verify()
        self.git('reset', '--hard', self.source)
        (self.root / 'README.md').unlink()
        (self.root / 'README.md').symlink_to('launcher/app.js')
        self.commit('symlink documentation')
        with self.assertRaisesRegex(ValueError, 'inputs'):
            self.verify()

    def test_equivalent_sibling_source_is_not_accepted(self):
        self.write('docs/INSTALL.md', 'first')
        first = self.commit('first branch')
        self.git('checkout', '-b', 'sibling', self.source)
        self.write('docs/INSTALL.md', 'second')
        second = self.commit('second branch')
        with self.assertRaisesRegex(ValueError, 'ancestor'):
            self.inputs['verify_inputs'](first, second, self.root)

    def test_pin_requires_positive_run_and_full_sha(self):
        valid = {'run_id': 42, 'attempt': 1, 'source': self.source}
        self.assertEqual(self.inputs['build_pin']({'build': valid}), valid)
        self.assertIsNone(self.inputs['build_pin']({}))
        for pin in (None, {}, {'run_id': True, 'source': self.source},
                    {'run_id': 0, 'source': self.source}, {'run_id': 42, 'source': 'main'},
                    {'run_id': '42', 'source': self.source}):
            with self.subTest(pin=pin), self.assertRaises(ValueError):
                self.inputs['build_pin']({'build': pin})

    def test_scope_keeps_metadata_out_and_unknown_inputs_expand(self):
        scope = self.inputs['acceptance_scope']
        self.assertEqual(scope(['docs/INSTALL.md', 'release-plan.json']), set())
        self.assertEqual(scope(['root-edition/service/emergency.py']), {'controls', 'startup', 'update-recovery'})
        self.assertEqual(scope(['root-edition/ui/app.js']), self.inputs['ALL_SCENARIOS'])
        self.assertEqual(scope(['root-edition/ui/style.css']), {'ui-controls'})
        for name in ('launcher/system-updates.js', 'launcher/helper-control.js', 'root-edition/ui/root-profile.js'):
            self.assertEqual(scope([name]), self.inputs['ALL_SCENARIOS'])
        self.assertEqual(scope(['unknown/runtime']), {'ui-controls', 'controls', 'startup', 'update-recovery'})
        self.assertIn('update-recovery', scope(['cytv/root_driver.py']))


if __name__ == '__main__':
    unittest.main()
