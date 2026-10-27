"""Acceptance uses the immutable public supervisor; TV effects stay offline."""
import os
import unittest

if os.name != 'posix':
    raise unittest.SkipTest('Root supervisor acceptance fixture requires POSIX ownership and fcntl')

from pathlib import Path
import subprocess
import sys

PROJECT = Path(__file__).resolve().parents[2]


class RootCandidateAcceptanceTests(unittest.TestCase):

    def test_nonposix_discovery_skips_before_fixture_imports(self):
        from unittest.mock import patch
        import importlib.util
        spec = importlib.util.spec_from_file_location('acceptance_nonposix_test', __file__)
        module = importlib.util.module_from_spec(spec)
        with patch.object(os, 'name', 'nt'):
            with self.assertRaises(unittest.SkipTest):
                spec.loader.exec_module(module)

    def scenario(self, body):
        setup = '''
from legacy_ota_fixture import LegacyOTA,sha
from pathlib import Path
from unittest.mock import patch
import base64,importlib.util,json,os,shutil,subprocess,sys
spec=importlib.util.spec_from_file_location('acceptance',Path('scripts/root-candidate-acceptance.py'))
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
# The retained fixture omits CLI/launcher. Restore exact public-tag CLI and
# deterministic build launcher solely in the temporary offline tree.
OriginalFixture=LegacyOTA
class LegacyOTA(OriginalFixture):
 def __enter__(self):
  f=super().__enter__()
  cli_path=Path('tests/system_updates/fixtures/public-1.3.0-system-cli.py')
  cli=cli_path.read_bytes();assert sha(cli)==json.loads(cli_path.with_suffix('.provenance.json').read_bytes())['sha256']
  for name,raw in {'system_updater/cli.py':cli,'run-system-updater.py':b'from system_updater.cli import entry\\nentry()\\n'}.items():f.write(f.code/name,raw)
  receipt=f.store.read('infrastructure')
  for name in ('system_updater/cli.py','run-system-updater.py'):receipt['code'][name]=sha((f.code/name).read_bytes())
  f.store.write('infrastructure',receipt)
  return f
def request(f,action='preflight'):
 raw=json.dumps(f.candidate['proof']).encode()
 r=dict(action=action,release=f.candidate['release'],envelopeSha256=sha(raw),envelope=base64.b64encode(raw).decode(),packages={c['name']:base64.b64encode(f.device.cache_bytes(c)).decode() for c in f.candidate['components']})
 if action=='install':r['profile']={'schema':1,'inventory':{'apps':[],'inputs':[]},'config':{'columns':5,'dockApps':[],'hiddenApps':[]},'settings':{}}
 return r
def snapshot(f):
 return {str(p.relative_to(f.base)):(p.lstat().st_mode,p.lstat().st_uid,p.lstat().st_gid,p.lstat().st_nlink,p.lstat().st_mtime_ns,p.read_bytes() if p.is_file() else None) for p in f.base.rglob('*')}
def accept(f,r):
 run=subprocess.run
 def local_run(args,*args2,**kwargs):
  if isinstance(args,(list,tuple)) and args[0]=='/usr/bin/node':args=[shutil.which('node'),*args[1:]]
  return run(args,*args2,**kwargs)
 with patch.object(subprocess,'run',side_effect=local_run):
  return a.accept(r,state=f.state,root_state=f.root,root_updater=f.updater,installed=f.installed,uid=os.getuid())
'''
        result = subprocess.run([sys.executable, '-B', '-c', setup + '\n' + body], cwd=PROJECT,
                                env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1', 'PYTHONPATH': str(PROJECT / 'tests/system_updates')},
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=180)
        self.assertEqual(result.returncode, 0, result.stdout)

    def test_preflight_original_signature_inspection_and_baseline_are_read_only(self):
        self.scenario('''
with LegacyOTA() as f:
 f.prior['release']='v0.0.0';f.store.write('baseline',f.prior)
 r=request(f);before=snapshot(f)
 result=accept(f,r)
 assert result['phase']=='preflight'
 assert result['release']=='v1.4.0'
 assert snapshot(f)==before
 assert 'profile' not in json.dumps(result)
''')

    def test_refuses_invalid_requests_and_trust_without_writes(self):
        self.scenario('''
for damage in ('signature','edition','release','hash','unknown-field','profile','code','missing-source','cache','unfinished','pending-home','ownership','legacy-receipt','package'):
 with LegacyOTA() as f:
  r=request(f,'install')
  if damage=='signature':
   proof=dict(f.candidate['proof'],signature='AAAA');raw=json.dumps(proof).encode();r['envelope']=base64.b64encode(raw).decode();r['envelopeSha256']=sha(raw)
  elif damage=='edition':
   r['edition']='no-root'
  elif damage=='release':r['release']='v9.9.9'
  elif damage=='hash':r['envelopeSha256']='0'*64
  elif damage=='unknown-field':r['url']='https://example.org'
  elif damage=='profile':r['profile']={}
  elif damage=='code':
   p=f.code/'system_updater/core.py';p.write_bytes(p.read_bytes()+b'\\nraise AssertionError("executed unauthenticated source")')
  elif damage=='missing-source':
   receipt=f.store.read('infrastructure');del receipt['code']['system_updater/core.py'];f.store.write('infrastructure',receipt)
  elif damage=='cache':f.write(f.device.cached(f.candidate['components'][0]),b'conflict')
  elif damage in ('unfinished','pending-home'):
   f.manager.install('root',f.candidate['release'],{'schema':1,'inventory':{'apps':[],'inputs':[]},'config':{'columns':5,'dockApps':[],'hiddenApps':[]},'settings':{}})
   if damage=='pending-home':
    tx=f.store.read('transaction');tx['phase']='aborted';f.store.write('transaction',tx)
  elif damage=='ownership':(f.code/'system_updater/core.py').chmod(0o666)
  elif damage=='package':r['packages']['root']=base64.b64encode(b'invalid').decode()
  elif damage=='legacy-receipt':
   # Relocate this original allowed destination for offline inspection only.
   receipt=f.store.read('legacy-lockdown');receipt['files'][str(f.base/'legacy-permission')]=dict(original='enabled',disabled='disabled',mode=0o600);f.store.write('legacy-lockdown',receipt)
   f.write(f.base/'legacy-permission',b'enabled')
  before=snapshot(f)
  try:accept(f,r)
  except (ValueError,OSError,ImportError):pass
  else:raise AssertionError('Accepted '+damage)
  assert snapshot(f)==before,damage
''')

    def test_captured_sources_ignore_bytecode_and_ambient_helpers(self):
        self.scenario('''
with LegacyOTA() as f:
 import py_compile,types
 r=request(f)
 for name in ('system_updater/device.py','package_identity.py'):
  p=f.code/name;original=p.read_bytes();info=p.stat();poison=b"raise AssertionError('poison bytecode executed')"
  p.write_bytes(poison+b' '*(len(original)-len(poison)));os.utime(p,ns=(info.st_atime_ns,info.st_mtime_ns));py_compile.compile(str(p),doraise=True)
  p.write_bytes(original);os.utime(p,ns=(info.st_atime_ns,info.st_mtime_ns))
 sentinel=types.ModuleType('package_identity')
 with patch.dict(sys.modules,{'package_identity':sentinel}):
  before=snapshot(f);assert accept(f,r)['phase']=='preflight';assert snapshot(f)==before
  assert sys.modules['package_identity'] is sentinel
''')



    def test_validly_signed_wrong_edition_and_incompatible_infrastructure_are_rejected(self):
        self.scenario('''
from legacy_ota_fixture import packed
for damage in ('edition','infrastructure'):
 with LegacyOTA() as f:
  f.candidate.pop('proof')
  if damage=='edition':f.candidate['edition']='no-root'
  else:
   raw=packed({**f.new,'runtime/foreign.py':b'not part of the original destination contract'})
   c=f.candidate['components'][-1];c['sha256']=sha(raw);c['size']=len(raw);f.write(f.device.cached(c),raw)
  f.sign_candidate()
  receipt=f.store.read('infrastructure');receipt['code']['system_updater/release-public.pem']=sha((f.code/'system_updater/release-public.pem').read_bytes());f.store.write('infrastructure',receipt)
  r=request(f);before=snapshot(f)
  try:accept(f,r)
  except ValueError:pass
  else:raise AssertionError('Accepted signed '+damage)
  assert snapshot(f)==before
''')


    def test_legacy_exclusion_requires_disabled_bytes_without_repair(self):
        self.scenario('''
from contextlib import contextmanager
with LegacyOTA() as f:
 path=f.base/'legacy-permission';f.write(path,b'enabled')
 f.store.write('legacy-lockdown',{'schema':1,'files':{str(path):dict(original='enabled',disabled='disabled',mode=0o600)}})
 real_supervisor=a.supervisor
 @contextmanager
 def relocated(state,uid):
  with real_supervisor(state,uid) as m:
   with patch.object(m.device.Device,'_legacy_lockdown_paths',return_value={str(path)}):yield m
 with patch.object(a,'supervisor',side_effect=relocated):
  r=request(f);before=snapshot(f)
  try:accept(f,r)
  except ValueError:pass
  else:raise AssertionError('Enabled legacy permissions accepted')
  assert snapshot(f)==before
  f.write(path,b'disabled');before=snapshot(f)
  assert accept(f,r)['phase']=='preflight'
  assert snapshot(f)==before
''')

    def test_original_manager_admits_then_worker_continues_after_lease_release(self):
        self.scenario('''
from contextlib import contextmanager
with LegacyOTA() as f:
 r=request(f,'install');baseline=(f.state/'baseline.json').read_bytes();code={str(p):p.read_bytes() for p in f.code.rglob('*') if p.is_file()}
 for c in f.candidate['components']:(f.state/'cache'/c['sha256']).unlink()
 events=[];real_supervisor=a.supervisor
 @contextmanager
 def adapted(state,uid):
  with real_supervisor(state,uid) as m:
   operation=m.installation.device_operation
   m.installation.JOURNALS={owner:(f.base/path.relative_to('/var/lib'),field,finished) for owner,(path,field,finished) in m.installation.JOURNALS.items()}
   def read(path):
    store=m.store.Store.__new__(m.store.Store);store.root=str(path.parent);store.uid=uid
    return store.read(path.name) if path.parent.exists() else None
   @contextmanager
   def lease(*args,**kwargs):
    events.append('lease-enter')
    with operation(*args,**kwargs,ownership=f.owner,read=read):yield
    events.append('lease-exit')
   def wake():
    assert events[-1]=='lease-exit',events
    assert f.store.read('transaction')['phase']=='preparing'
    # Reacquiring the real ownership lock proves worker handoff is outside it.
    with f.product_operation():events.append('worker')
   with patch.object(m.installation,'device_operation',side_effect=lease),patch.object(m.cli,'spawn_worker',side_effect=wake):yield m
 with patch.object(a,'supervisor',side_effect=adapted):result=accept(f,r)
 assert result['phase']=='preparing'
 assert events==['lease-enter','lease-exit','worker'],events
 tx=f.store.read('transaction')
 assert tx['candidate']['proof']==f.candidate['proof']
 assert tx['prior']==f.prior
 assert all(not c['installEvidence']['intent'] for c in tx['components'])
 assert (f.state/'baseline.json').read_bytes()==baseline
 assert {str(p):p.read_bytes() for p in f.code.rglob('*') if p.is_file()}==code
 # The unchanged original supervisor consumes its own journal and staged cache.
 assert f.run_until('verifying')['phase']=='verifying'
 assert all(c['installEvidence']['terminal']['success'] for c in f.store.read('transaction')['components'])
 assert f.off.read_bytes()==f.off_bytes
''')


if __name__ == '__main__':unittest.main()
