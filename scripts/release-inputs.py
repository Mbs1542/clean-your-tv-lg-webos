#!/usr/bin/env python3
"""Conservative, data-only source equivalence for previously built candidates."""
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ALL_SCENARIOS = {'ui-controls', 'controls', 'startup', 'update-recovery'}


def metadata_path(path):
    # Do not exempt arbitrary Markdown: notices and embedded guides are packaged.
    return path in ('release-plan.json', 'README.md') or (path.startswith('docs/') and path.endswith('.md'))


def git(*args, root=ROOT):
    return subprocess.check_output(['git', *args], cwd=root)


def build_pin(plan):
    if 'build' not in plan:
        return None
    pin = plan['build']
    if (not isinstance(pin, dict) or set(pin) != {'run_id', 'attempt', 'source'}
            or type(pin['run_id']) is not int or pin['run_id'] <= 0
            or type(pin['attempt']) is not int or pin['attempt'] <= 0
            or not isinstance(pin['source'], str) or not re.fullmatch('[a-f0-9]{40}', pin['source'])):
        raise ValueError('Invalid build pin: expected positive run_id/attempt and full source SHA')
    return pin


def snapshot(commit, root=ROOT):
    if not isinstance(commit, str) or not re.fullmatch('[a-f0-9]{40}', commit):
        raise ValueError('Invalid source SHA')
    entries = {}
    for item in git('ls-tree', '-r', '-z', commit, root=root).split(b'\0'):
        if item:
            identity, name = item.split(b'\t', 1)
            path = name.decode('utf-8')
            mode, kind, blob = identity.decode().split()
            if mode == '100644' and kind == 'blob' and metadata_path(path):
                continue
            entries[path] = (mode, kind, blob)
    return entries


def verify_inputs(source, candidate, root=ROOT):
    before, after = snapshot(source, root), snapshot(candidate, root)
    if subprocess.run(['git', 'merge-base', '--is-ancestor', source, candidate], cwd=root,
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        raise ValueError('Build source must be an ancestor of the candidate')
    changed = sorted(name for name in before.keys() | after.keys() if before.get(name) != after.get(name))
    if changed:
        raise ValueError('Candidate build inputs changed; rebuild required: ' + ', '.join(changed))


def pin_at(candidate, root=ROOT):
    if not git('ls-tree', candidate, 'release-plan.json', root=root).strip():
        return None  # Historical exact-source builds predate the plan.
    return build_pin(json.loads(git('show', candidate + ':release-plan.json', root=root)))


def acceptance_scope(paths):
    """Recommend retests; hashes, preconditions and human observations remain required."""
    selected = set()
    for path in paths:
        if metadata_path(path):
            continue
        if path.startswith(('launcher/', 'root-edition/ui/', 'updater-app/')) and Path(path).suffix in ('.css', '.svg', '.png', '.woff', '.woff2'):
            selected.add('ui-controls')
        elif path.startswith(('native/', 'root-edition/service/', 'root-edition/input/')):
            selected.update(('controls', 'startup', 'update-recovery'))
        elif path.startswith(('cytv/', 'android/', 'homebrew/', 'updater-service/',
                              'root-edition/updater/', 'system-updater/')):
            selected.add('update-recovery')
        else:
            selected.update(ALL_SCENARIOS)
    return selected
