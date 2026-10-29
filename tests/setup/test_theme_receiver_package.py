import unittest
from scripts.theme_receiver import inject


class ThemeReceiverPackageTest(unittest.TestCase):
    def test_canonical_modules_are_owned_by_each_service_package(self):
        for files in ({'service.js': b'root'}, {'service.js': b'no-root'}):
            result = inject(files)
            self.assertEqual(result['service.js'], files['service.js'])
            self.assertIn(b'./theme-receiver/register', result['theme-receiver.js'])
            self.assertIn(b'exports', result['theme-receiver/core.js'])
            self.assertIn(b'themeReceiverStart', result['theme-receiver/register.js'])
            self.assertNotIn('theme-receiver.js', files)


if __name__ == '__main__':
    unittest.main()
