"""Explicitly package the same receiver modules in each service's private tree."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ('core.js', 'register.js')


def inject(files):
    result = dict(files)
    for name in FILES:
        source = ROOT / 'theme-receiver' / name
        if source.is_symlink() or not source.is_file():
            raise ValueError('Missing or indirect theme receiver source: ' + name)
        result['theme-receiver/' + name] = source.read_bytes()
    result['theme-receiver.js'] = b"module.exports = require('./theme-receiver/register');\n"
    return result
