#!/usr/bin/env python3
"""Select CI checks from changed paths; unknown inputs keep all checks enabled."""
import json
import os
from pathlib import Path
import re
import runpy
import subprocess

INPUTS = runpy.run_path(str(Path(__file__).with_name('release-inputs.py')))

COMPONENTS = ('tv', 'installer', 'android', 'setup', 'preview')


def components(paths):
    selected = set()
    for path in paths:
        if path in ('README.md', 'release-plan.json'):
            selected.add('setup')
            continue
        if (path.startswith(('docs/', '.github/ISSUE_TEMPLATE/', '.github/PULL_REQUEST_TEMPLATE/'))
                or path.lower().endswith(('.md', '.rst'))
                or path == 'LICENSE'):
            continue
        if path.startswith('homebrew/'):
            selected.update(('installer', 'tv', 'setup'))
        elif path.startswith('cytv/'):
            selected.add('installer')
            if Path(path).name not in ('desktop.py', 'desktop_entry.py', 'gui_style.py', 'build-requirements.txt'):
                selected.update(('android', 'setup'))
        elif path.startswith(('launcher/', 'root-edition/', 'native/', 'renewal-service/', 'updater-app/', 'updater-service/')):
            selected.update(('tv', 'installer', 'setup'))
            if path.startswith(('launcher/', 'root-edition/ui/', 'updater-app/')) or path == 'root-edition/preview.py':
                selected.add('preview')
        elif path.startswith(('android/',)):
            selected.add('android')
        elif path.startswith('tests/cytv/'):
            selected.add('installer')
        elif path.startswith('tests/setup/'):
            selected.add('setup')
        elif path.startswith(('showcase/', 'tests/showcase/')) or path in (
                'scripts/build-showcase.cjs', 'scripts/check-theme-submissions.cjs'):
            selected.add('preview')
        elif path.startswith('theme-api/') or path == 'scripts/export-theme-runtime.py':
            selected.update(COMPONENTS)
        elif path.startswith('preview/') or path in ('scripts/preview.py', 'tests/test_preview.py', 'tests/preview-bridge.cjs'):
            selected.add('preview')
        elif path.startswith('tests/updates/'):
            selected.update(('tv', 'setup'))
        elif path.startswith('tests/'):
            selected.add('tv')
        else:
            selected.update(COMPONENTS)
    return selected


def prepared_version(plan, version, previous):
    def number(value):
        return tuple(map(int, value.split('.'))) if re.fullmatch(r'\d{1,4}\.\d{1,4}\.\d{1,4}', value or '') else ()
    return bool(number(version) and number(previous) and plan.get('version') == version
                and number(version) > number(previous))


def is_candidate(plan, version, previous):
    acceptance = plan.get('acceptance')
    return bool(prepared_version(plan, version, previous)
                and isinstance(acceptance, str) and acceptance.strip())


def draft_branch_build(event, kind, ref):
    requested = event.get('inputs', {}).get('test_build')
    repository = event.get('repository', {}).get('full_name')
    expected = os.environ.get('GITHUB_REPOSITORY')
    return bool(kind == 'workflow_dispatch' and (requested is True or requested == 'true')
                and isinstance(ref, str) and ref.startswith('refs/heads/')
                and ref not in ('refs/heads/', 'refs/heads/main')
                and expected and isinstance(repository, str) and repository.lower() == expected.lower())


def build_installers(event, kind, ref, plan, version, previous, notes):
    release_branch = ref == 'refs/heads/release/next'
    if not notes or not (kind == 'push' and release_branch or draft_branch_build(event, kind, ref)):
        return False
    return prepared_version(plan, version, previous)


def git(*args):
    return subprocess.check_output(['git', *args])


def main():
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    kind = os.environ['GITHUB_EVENT_NAME']
    if kind == 'pull_request':
        pr = event['pull_request']
        diff = (pr['base']['sha'] + '...' + pr['head']['sha'],)
    elif kind == 'push' and event.get('before', '').strip('0'):
        diff = (event['before'], event['after'])
    else:
        diff = None
    selected = components(git('diff', '--name-only', '--no-renames', '-z', *diff).decode().split('\0')[:-1]) if diff and os.environ.get('CI_FULL_SUITE') != 'true' else set(COMPONENTS)
    candidate = installers = False
    ref = os.environ.get('GITHUB_REF')
    release_branch = ref == 'refs/heads/release/next'
    if kind in ('push', 'workflow_dispatch') and (release_branch or draft_branch_build(event, kind, ref)):
        plan = json.loads(Path('release-plan.json').read_text())
        version = json.loads(Path('release-versions.json').read_text())['release']
        previous = json.loads(git('show', 'origin/main:release-versions.json'))['release']
        notes = Path('docs/RELEASE-' + version + '.md').is_file()
        candidate = release_branch and is_candidate(plan, version, previous) and notes
        installers = build_installers(event, kind, ref, plan, version, previous, notes)
    # A selected build survives only documentation/evidence edits. Never skip on trust alone.
    if installers and INPUTS['build_pin'](plan) and not (kind == 'workflow_dispatch' and event.get('inputs', {}).get('test_build') in (True, 'true')):
        try:
            INPUTS['verify_inputs'](plan['build']['source'], git('rev-parse', 'HEAD').decode().strip(), Path.cwd())
        except ValueError:
            pass  # Changed inputs need a new build and an updated pin before release.
        else:
            installers = False
    if (kind == 'pull_request' and event['pull_request']['base'].get('ref') == 'main'
            and event['pull_request']['head'].get('ref') == 'release/next'
            and os.environ.get('CI_FULL_SUITE') != 'true'):
        selected = {'setup'}  # Release policy requires full tests from the trusted build.
    outputs = {name: name in selected for name in COMPONENTS}
    outputs.update(any=bool(selected), runtime=bool(selected - {'setup'}), candidate=candidate, installers=installers)
    lines = ''.join(f'{name}={str(value).lower()}\n' for name, value in outputs.items())
    print(lines, end='')
    with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
        output.write(lines)


if __name__ == '__main__':
    main()
