#!/usr/bin/env python3
"""Explicit, private signed Root acceptance admission; run with python -I -B.

stdin: action, release, envelopeSha256, envelope (base64 exact JSON bytes),
packages (component name -> base64 bytes); install additionally requires profile.
No discovery, signing, rollback, installer or health implementation lives here.
"""
import base64
from contextlib import contextmanager
import hashlib
import importlib
import importlib.abc
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import stat
import sys
import types
import uuid

STATE = Path('/var/lib/clean-your-tv-system-updater')
MAX_REQUEST = 264 * 1024 * 1024  # Three bounded 64 MiB packages plus encoding/profile.
REQUIRED = {'package_identity.py', 'package_data.py', 'installation.py', 'python_binding.py',
            'infrastructure-paths.json', 'run-system-updater.py'} | {
    'system_updater/' + name for name in ('__init__.py', 'core.py', 'device.py', 'cli.py',
        'support/__init__.py', 'support/store.py', 'support/package.py', 'support/profile.py',
        'support/luna.py', 'policy.js', 'release-public.pem')}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def read_private(path, uid, limit=4 * 1024 * 1024):
    """Authenticate ancestors and file before any byte becomes executable."""
    path = Path(path)
    for parent in path.parents:
        info = parent.lstat()
        if (not stat.S_ISDIR(info.st_mode) or info.st_uid not in (0, uid)
                or info.st_mode & 0o022 and not info.st_mode & stat.S_ISVTX):
            raise ValueError('Unsafe acceptance ancestor')
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, 'rb') as stream:
        info = os.fstat(stream.fileno())
        if (not stat.S_ISREG(info.st_mode) or info.st_uid != uid or info.st_nlink != 1
                or info.st_mode & 0o022 or info.st_size > limit):
            raise ValueError('Unsafe acceptance file')
        raw = stream.read(limit + 1)
        if len(raw) > limit:
            raise ValueError('Oversized acceptance file')
        return raw


def unique(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate request field')
        result[key] = value
    return result


def decode_json(raw):
    return json.loads(raw, object_pairs_hook=unique,
                      parse_constant=lambda _: (_ for _ in ()).throw(ValueError('Invalid JSON number')))


@contextmanager
def supervisor(state, uid):
    """Execute only captured receipt-authenticated sources, never adjacent pyc."""
    code = state / 'code'
    receipt = decode_json(read_private(state / 'infrastructure.json', uid))
    inventory = receipt.get('code') if isinstance(receipt, dict) and receipt.get('schema') == 1 else None
    if not isinstance(inventory, dict) or not REQUIRED <= set(inventory):
        raise ValueError('Authenticated supervisor code required')
    sources = {}
    for name, expected in inventory.items():
        path = Path(name)
        if (path.is_absolute() or '..' in path.parts or str(path) != name
                or not isinstance(expected, str) or not re.fullmatch('[a-f0-9]{64}', expected)):
            raise ValueError('Unsafe supervisor inventory')
        raw = read_private(code / name, uid)
        if digest(raw) != expected:
            raise ValueError('Supervisor code changed')
        sources[str(code / name)] = raw
    alias = '_cytv_acceptance_' + uuid.uuid4().hex
    helpers = {Path(name).stem: str(code / name) for name in inventory
               if '/' not in name and name.endswith('.py') and Path(name).stem.isidentifier()}
    helpers.update({'updater.store': str(code / 'system_updater/support/store.py'),
                    'updater.package': str(code / 'system_updater/support/package.py')})

    class VerifiedSource(importlib.abc.MetaPathFinder, importlib.abc.Loader):
        def find_spec(self, name, path=None, target=None):
            package = False
            if name in helpers:
                filename = helpers[name]
            elif name == alias or name.startswith(alias + '.'):
                relative = name[len(alias):].lstrip('.').replace('.', '/')
                filename = str(code / 'system_updater' / (relative + '.py'))
                if filename not in sources:
                    filename = str(code / 'system_updater' / relative / '__init__.py')
                    package = True
            else:
                return None
            if filename not in sources:
                raise ImportError('Unauthenticated supervisor import')
            return importlib.util.spec_from_loader(name, self, origin=filename, is_package=package)

        def create_module(self, spec):
            return None

        def exec_module(self, module):
            module.__file__ = module.__spec__.origin
            exec(compile(sources[module.__file__], module.__file__, 'exec'), module.__dict__)

    names = set(helpers) | {'updater'}
    names.update(name for name in sys.modules if name.startswith('updater.'))
    missing = object()
    saved = {name: sys.modules.get(name, missing) for name in names}
    for name in names:
        sys.modules.pop(name, None)
    namespace = types.ModuleType('updater')
    namespace.__path__ = []
    sys.modules['updater'] = namespace
    finder = VerifiedSource()
    sys.meta_path.insert(0, finder)
    try:
        yield types.SimpleNamespace(
            device=importlib.import_module(alias + '.device'),
            core=importlib.import_module(alias + '.core'),
            store=importlib.import_module(alias + '.support.store'),
            cli=importlib.import_module(alias + '.cli'),
            installation=importlib.import_module('installation'))
    finally:
        sys.meta_path.remove(finder)
        for name in list(sys.modules):
            if name == alias or name.startswith(alias + '.') or name.startswith('updater.'):
                sys.modules.pop(name, None)
        for name, value in saved.items():
            if value is missing:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = value


def validate_request(request):
    fields = {'action', 'release', 'envelopeSha256', 'envelope', 'packages'}
    if isinstance(request, dict) and request.get('action') == 'install':
        fields.add('profile')
    if (not isinstance(request, dict) or set(request) != fields
            or request.get('action') not in ('preflight', 'install')
            or not isinstance(request.get('release'), str)
            or not re.fullmatch(r'v(0|[1-9][0-9]{0,3})\.(0|[1-9][0-9]{0,3})\.(0|[1-9][0-9]{0,3})', request['release'])
            or not isinstance(request.get('envelopeSha256'), str)
            or not re.fullmatch('[a-f0-9]{64}', request['envelopeSha256'])
            or not isinstance(request.get('envelope'), str) or len(request['envelope']) > 180000
            or not isinstance(request.get('packages'), dict)):
        raise ValueError('Invalid acceptance request')
    raw = base64.b64decode(request['envelope'], validate=True)
    if digest(raw) != request['envelopeSha256']:
        raise ValueError('Envelope digest mismatch')
    proof = decode_json(raw)
    if not isinstance(proof, dict) or set(proof) != {'payload', 'signature'}:
        raise ValueError('Invalid signed envelope')
    return proof


def check_admission(modules, store, device, candidate, packages):
    """Read-only checks: never call offer(), check_legacy() or enforcing integrity."""
    device.integrity(enforce=False)
    device.require_components()
    tx = modules.core.Manager(store, device)._load()
    if tx and (tx['phase'] not in modules.core.FINISHED or tx.get('homeResumePhase') != tx['phase']):
        raise ValueError('Unfinished system update requires recovery')
    for path in device.legacy_states:
        if os.path.lexists(path):
            value = decode_json(read_private(path, device.uid, 5 * 1024 * 1024))
            phase = value.get('phase', value.get('status'))
            if phase not in ('complete', 'completed', 'rolled-back', 'aborted', 'idle'):
                raise ValueError('Legacy updater transaction requires recovery')
            if path == device.root_updater / 'transaction.json' and value.get('homeResumePhase') != phase:
                raise ValueError('Legacy Root Home recovery pending')
    # Original offer() enforces this receipt. Admission requires it already
    # enforced, so a later offer cannot unexpectedly repair permissions.
    lockdown = store.read('legacy-lockdown')
    if (not isinstance(lockdown, dict) or lockdown.get('schema') != 1
            or not isinstance(lockdown.get('files'), dict)):
        raise ValueError('Legacy updater exclusion setup required')
    allowed = device._legacy_lockdown_paths()
    for name, record in lockdown['files'].items():
        if (name not in allowed or not isinstance(record, dict)
                or set(record) != {'original', 'disabled', 'mode'}
                or not isinstance(record['original'], str) or not isinstance(record['disabled'], str)
                or type(record['mode']) is not int or record['mode'] & ~0o777
                or read_private(Path(name), device.uid, 1024 * 1024) != record['disabled'].encode()):
            raise ValueError('Legacy updater exclusion requires recovery')
    prior = device._baseline('root')
    if (modules.core.version(candidate['release'][1:]) <= modules.core.version(prior['release'][1:])
            or any(modules.core.version(c['version']) < modules.core.version(p['version'])
                   for c, p in zip(candidate['components'], prior['components']))
            or all(c['version'] == p['version'] for c, p in zip(candidate['components'], prior['components']))):
        raise ValueError('Candidate is not a forward update')
    if not device.verify_baseline(prior):
        raise ValueError('Installed baseline changed')
    for component in prior['components']:
        device.inspect(device.cache_bytes(component), component)
    for component in candidate['components']:
        raw = packages[component['name']]
        device.inspect(raw, component)
        if os.path.lexists(device.cached(component)) and device.cache_bytes(component) != raw:
            raise ValueError('Candidate cache conflict')
    if shutil.disk_usage(device.state).free < sum(c['size'] for c in candidate['components']) + 128 * 1024 * 1024:
        raise ValueError('Insufficient space for complete update and rollback')
    return prior


def accept(request, *, state=STATE, root_state=Path('/var/lib/clean-your-tv-root'),
           root_updater=Path('/var/lib/clean-your-tv-root-updater'),
           installed=Path('/media/developer/apps'), uid=0):
    proof = validate_request(request)
    state = Path(state)
    with supervisor(state, uid) as modules:
        # Store.__init__ may create directories. Preflight must not invoke it.
        store = modules.store.Store.__new__(modules.store.Store)
        store.root, store.uid = str(state), uid
        original = modules.device.Device
        device = original(store, code=state / 'code', root_state=root_state,
                          root_updater=root_updater, installed=installed, uid=uid)
        verified = modules.core.release_set(device.fetch('verify', {'proof': proof}), 'root')
        if verified['release'] != request['release']:
            raise ValueError('Signed release mismatch')
        candidate = dict(verified, proof=proof)
        if set(request['packages']) != {c['name'] for c in candidate['components']}:
            raise ValueError('Complete candidate packages required')
        packages = {}
        for component in candidate['components']:
            value = request['packages'][component['name']]
            if not isinstance(value, str) or len(value) > ((component['size'] + 2) // 3) * 4:
                raise ValueError('Invalid candidate package encoding')
            packages[component['name']] = base64.b64decode(value, validate=True)
        if request['action'] == 'install':
            modules.core.validate_profile(request['profile'], 'root')
        prior = check_admission(modules, store, device, candidate, packages)
        phase = 'preflight'
        if request['action'] == 'install':
            class CandidateDevice(original):
                def fetch(self, method, payload=None, binary=False):
                    if method == 'offer':
                        return {'candidate': candidate}
                    return super().fetch(method, payload, binary)
            admitted = CandidateDevice(store, code=state / 'code', root_state=root_state,
                                       root_updater=root_updater, installed=installed, uid=uid)
            with modules.installation.device_operation('system-update', recovery=True):
                check_admission(modules, store, admitted, candidate, packages)
                for component in candidate['components']:
                    if not os.path.lexists(admitted.cached(component)):
                        admitted.atomic(admitted.cached(component), packages[component['name']], exclusive=True)
                tx = modules.core.Manager(store, admitted).install('root', request['release'], request['profile'])
                phase = tx['phase']
            # Original worker obtains the lease itself and follows its real journal.
            modules.cli.spawn_worker()
        summary = lambda release: [{'name': c['name'], 'version': c['version'], 'sha256': c['sha256']}
                                   for c in release['components']]
        return {'phase': phase, 'release': candidate['release'], 'prior': summary(prior), 'candidate': summary(candidate)}


def main():
    if os.geteuid() != 0:
        raise PermissionError('Root acceptance controller required')
    raw = sys.stdin.buffer.read(MAX_REQUEST + 1)
    if len(raw) > MAX_REQUEST:
        raise ValueError('Acceptance request too large')
    return accept(decode_json(raw))


if __name__ == '__main__':
    try:
        print(json.dumps({'returnValue': True, 'result': main()}, allow_nan=False), flush=True)
    except Exception:
        # Device error strings may contain private paths or application identities.
        print(json.dumps({'returnValue': False, 'errorText': 'Signed candidate acceptance refused; no success is implied.'}), flush=True)
        sys.exit(1)
