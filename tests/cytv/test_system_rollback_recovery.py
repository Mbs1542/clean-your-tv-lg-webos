"""Readiness-only recovery uses real journals and genuine manager health receipts."""
import copy
from contextlib import contextmanager
import importlib
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

if os.name != 'posix':
    raise unittest.SkipTest('TV rollback recovery requires POSIX locks and filesystem semantics')

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tests/system_updates'))
fixture_spec=importlib.util.spec_from_file_location('_rollback_recovery_core_fixture',ROOT/'tests/system_updates/test_core.py')
core_fixture=importlib.util.module_from_spec(fixture_spec);fixture_spec.loader.exec_module(core_fixture)
RootIO,profile,Store=core_fixture.RootIO,core_fixture.profile,core_fixture.Store
from system_updater.core import Manager
import hashlib,tarfile
fixture=ROOT/'tests/system_updates/fixtures/public-1.3.0-supervisor.tar.gz'
provenance=json.loads(fixture.with_suffix('.provenance.json').read_text())
assert hashlib.sha256(fixture.read_bytes()).hexdigest()==provenance['sha256']
with tarfile.open(fixture) as archive:
    original_core=archive.extractfile('supervisor/system_updater/core.py').read()
    original_device=archive.extractfile('supervisor/system_updater/device.py').read()
assert hashlib.sha256(original_core).hexdigest()==provenance['files']['supervisor/system_updater/core.py']
original_namespace={'__name__':'system_updater.original_recovery_core','__package__':'system_updater'}
exec(compile(original_core,'<verified original supervisor core>','exec'),original_namespace)
Manager=original_namespace['Manager']
assert hashlib.sha256(original_device).hexdigest()==provenance['files']['supervisor/system_updater/device.py']
original_namespace={'__name__':'system_updater.original_recovery_device','__package__':'system_updater','__file__':str(ROOT/'system-updater/device.py')}
exec(compile(original_device,'<verified original supervisor device>','exec'),original_namespace)
OriginalDevice=original_namespace['Device']
assert hashlib.sha256((ROOT/'root-edition/package_identity.py').read_bytes()).hexdigest()==provenance['files']['supervisor/package_identity.py']
from installation import Ownership, Busy

class RecoveryIO(RootIO):
    legacy_states=[]
    root_updater=Path('/unused-root-updater')
    def _root_integrity(self):pass
    def integrity(self,**kw):return {'schema':1,'code':{'original':'a'*64}}
    def require_components(self):pass
    def _verify_release(self,value,edition):return value
    def install(self,c,submitted,terminal,intent):
        self.calls.append('install:'+c['name']);intent();submitted({'application':c.get('application'),'component':c['name'],'sha256':c['sha256']})
        for old in self.current['components']:
            if old['name']==c['name']:old['version']=c['version']
        terminal({'success':True,'sha256':c['sha256'],'event':{'id':c.get('application'),'statusValue':30,'details':{'packageId':c.get('application'),'client':'com.webos.lunasend-99','ipkFile':'/var/lib/clean-your-tv-installer/cytv-root-install-test/package.ipk'}}})
    def close_launcher(self):self.calls.append('close')

class Tests(unittest.TestCase):
    def setUp(self):
        try:self.module=importlib.import_module('cytv.system_rollback_recovery')
        except ModuleNotFoundError:self.fail('explicit rollback-readiness recovery is missing')
        import types
        namespace={};exec(self.module.SCRIPT,namespace);self.module=types.SimpleNamespace(**namespace)
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.store=Store(os.path.realpath(self.tmp.name)+'/system',uid=os.getuid())
        self.ownership=Ownership(Store(os.path.realpath(self.tmp.name)+'/installation',uid=os.getuid()))
        self.io=RecoveryIO();self.manager=Manager(self.store,self.io)
        self.manager.install('root','v1.1.0',profile());self.advance('verifying');self.manager.healthy('root',self.manager.status()['id'],'1.1.0');self.advance('complete');self.manager.rollback();self.advance('verifying-rollback');self.io.time+=121;self.advance('recovery-required')
        tx=self.store.read('transaction');self.ownership.store.write('operation',{'schema':1,'id':'e'*32,'owner':'system-update','journal':'transaction.json','stage':'recovery-required','terminal':False})
        self.original=copy.deepcopy(tx);self.locked=False;self.health=True;self.interrupt=False
    def advance(self,phase):
        for _ in range(30):
            tx=self.manager.run()
            if tx['phase']==phase:return tx
        self.fail(tx)
    @contextmanager
    def mutation(self):
        current=self.ownership.status()
        with self.ownership.operation('system-update','transaction.json',resume=current['id']) as record:
            self.locked=True
            try:yield record
            finally:self.locked=False
    def launch(self):
        self.assertFalse(self.locked,'old Root one-shot health must run outside global ownership lock')
        self.io.calls.append('close-relaunch')
        if self.interrupt:raise KeyboardInterrupt('lost SSH')
        if self.health:self.manager.healthy('root',self.original['id'],'1.0.0')
    def sleep(self,seconds):self.io.time+=seconds
    def recover(self):
        return self.module.recover(self.manager,self.io,self.store,self.ownership,self.mutation,self.launch,self.sleep)
    def test_real_health_completes_original_manager_without_installing(self):
        calls=len([c for c in self.io.calls if c.startswith('install:')]);result=self.recover()
        self.assertEqual(result['phase'],'rolled-back');self.assertEqual(result['homeResumePhase'],'rolled-back')
        self.assertEqual(self.store.read('current-root'),self.original['prior']);self.assertTrue(self.ownership.status()['terminal'])
        self.assertEqual(len([c for c in self.io.calls if c.startswith('install:')]),calls)
        self.assertEqual(self.store.read('transaction')['components'],self.original['components'])
        audit=self.store.read('readiness-recovery-'+self.original['id']);self.assertEqual(audit['state'],'complete');self.assertEqual(audit['original'],self.original)
    def test_unknown_installer_and_wrong_terminal_binding_refused(self):
        for change in ('unknown','wrong-app'):
            tx=copy.deepcopy(self.original)
            if change=='unknown':tx['components'][0]['rollbackEvidence']['terminal']=None
            else:tx['components'][0]['rollbackEvidence']['terminal']['event']['id']='foreign'
            self.store.write('transaction',tx)
            with self.assertRaises(ValueError):self.recover()
            self.assertEqual(self.store.read('transaction'),tx)
    def test_wrong_cause_and_profile_damage_refused(self):
        tx=copy.deepcopy(self.original);tx['error']='Rollback failed; no retry permitted';self.store.write('transaction',tx)
        with self.assertRaises(ValueError):self.recover()
        tx=self.original;self.store.write('transaction',tx);(Path(self.store.root)/(tx['profile']+'.json')).write_text('{"invalid":true}')
        with self.assertRaises(ValueError):self.recover()
    def test_foreign_lease_and_changed_installed_bytes_refused(self):
        record=self.ownership.status();record['owner']='deploy';self.ownership.store.write('operation',record)
        with self.assertRaises((ValueError,Busy)):self.recover()
        record['owner']='system-update';self.ownership.store.write('operation',record)
        self.io.verify_installed=lambda c:False
        with self.assertRaises(ValueError):self.recover()
    def test_no_health_retains_timeout_and_never_publishes_prior(self):
        before=self.store.read('current-root');self.health=False;result=self.recover()
        self.assertEqual(result['phase'],'recovery-required');self.assertEqual(self.store.read('current-root'),before)
        self.assertFalse(self.ownership.status()['terminal'])
        with self.assertRaises(ValueError):self.recover()
    def test_interruption_reuses_original_attempt_deadline(self):
        self.interrupt=True
        with self.assertRaises(KeyboardInterrupt):self.recover()
        original_deadline=self.store.read('transaction')['deadline'];audit=self.store.read('readiness-recovery-'+self.original['id'])
        self.interrupt=False;result=self.recover();self.assertEqual(result['phase'],'rolled-back')
        self.assertEqual(result['deadline'],original_deadline);self.assertEqual(self.store.read('readiness-recovery-'+self.original['id'])['id'],audit['id'])
    def test_concurrent_worker_is_refused_without_writes(self):
        import fcntl
        lock=Path(self.store.root)/'daemon.lock'
        with lock.open('a') as stream:
            fcntl.flock(stream,fcntl.LOCK_EX|fcntl.LOCK_NB)
            with self.assertRaises((ValueError,BlockingIOError)):self.recover()
        self.assertEqual(self.store.read('transaction'),self.original)

    def test_stale_health_refused_before_any_rearm_or_audit(self):
        self.store.write('healthy-rollback-'+self.original['id'],{'transaction':self.original['id'],'version':'1.0.0','at':self.original['launched']})
        with self.assertRaises(ValueError):self.recover()
        self.assertEqual(self.store.read('transaction'),self.original)
        self.assertIsNone(self.store.read('readiness-recovery-'+self.original['id']))
    def test_completed_repeat_is_read_only_and_never_relaunches(self):
        self.recover();before=self.store.read('transaction');lease=self.ownership.status();calls=list(self.io.calls)
        result=self.recover();self.assertEqual(result,before);self.assertEqual(self.ownership.status(),lease);self.assertEqual(self.io.calls.count('close-relaunch'),calls.count('close-relaunch'));self.assertEqual(self.io.calls.count('finish'),calls.count('finish'))
    def test_corrupt_armed_deadline_cannot_extend_attempt(self):
        self.interrupt=True
        with self.assertRaises(KeyboardInterrupt):self.recover()
        name='readiness-recovery-'+self.original['id'];audit=self.store.read(name);audit['armed']['deadline']+=100;self.store.write(name,audit)
        self.interrupt=False
        with self.assertRaises(ValueError):self.recover()
    def test_expired_interrupted_attempt_does_not_relaunch(self):
        self.interrupt=True
        with self.assertRaises(KeyboardInterrupt):self.recover()
        self.io.time+=121;calls=list(self.io.calls);self.interrupt=False
        result=self.recover();self.assertEqual(result['phase'],'recovery-required');self.assertEqual(self.io.calls.count('close-relaunch'),calls.count('close-relaunch'))
    def test_clock_reversal_cannot_extend_health_wait(self):
        self.health=False
        def backwards(seconds):self.io.time-=1
        self.sleep=backwards
        import signal
        old=signal.signal(signal.SIGALRM,lambda *args:(_ for _ in ()).throw(AssertionError('clock reversal left recovery unbounded')))
        signal.alarm(2)
        try:result=self.recover();self.assertEqual(result['phase'],'recovery-required')
        finally:signal.alarm(0);signal.signal(signal.SIGALRM,old)
    def test_source_loader_ignores_ambient_module_and_bytecode(self):
        self.assertTrue(hasattr(self.module,'load_sources'),'verified source-only loader missing')
        import hashlib,py_compile
        code=Path(os.path.realpath(self.tmp.name))/'code';code.mkdir();source=code/'recovery_fixture.py';source.write_text('value="poison"')
        py_compile.compile(str(source),cfile=str(code/'recovery_fixture.pyc'))
        source.write_text('value="verified"');source.chmod(0o600)
        finder=self.module.load_sources(code,{'recovery_fixture.py':hashlib.sha256(source.read_bytes()).hexdigest()})
        self.addCleanup(lambda:sys.meta_path.remove(finder));self.addCleanup(lambda:sys.modules.pop('recovery_fixture',None))
        self.assertEqual(importlib.import_module('recovery_fixture').value,'verified')

    def test_prepared_audit_interruption_resumes_exact_first_window(self):
        write=self.store.write
        def interrupted(name,value):
            write(name,value)
            if name.startswith('readiness-recovery-') and value.get('state')=='prepared':raise KeyboardInterrupt('audit durable before rearm')
        self.store.write=interrupted
        with self.assertRaises(KeyboardInterrupt):self.recover()
        audit=self.store.read('readiness-recovery-'+self.original['id']);self.assertEqual(self.store.read('transaction'),self.original)
        self.store.write=write;result=self.recover();self.assertEqual(result['deadline'],audit['armed']['deadline'])
    def test_completion_before_audit_finalization_resumes_without_relaunch(self):
        write=self.store.write
        def interrupted(name,value):
            if name.startswith('readiness-recovery-') and value.get('state')=='complete':raise KeyboardInterrupt('completion durable, audit pending')
            write(name,value)
        self.store.write=interrupted
        with self.assertRaises(KeyboardInterrupt):self.recover()
        self.assertEqual(self.store.read('transaction')['phase'],'rolled-back');calls=self.io.calls.count('close-relaunch')
        self.store.write=write;result=self.recover();self.assertEqual(result['phase'],'rolled-back');self.assertEqual(self.io.calls.count('close-relaunch'),calls)
    def test_healthy_ownership_exit_contention_is_retried(self):
        mutation=self.mutation;entries=[]
        @contextmanager
        def contended():
            entries.append(1)
            if len(entries)==2:raise Busy()
            with mutation() as record:yield record
        self.mutation=contended;self.assertEqual(self.recover()['phase'],'rolled-back');self.assertEqual(len(entries),3)
    def test_terminal_foreign_lease_is_not_reserved_or_changed(self):
        record=self.ownership.status();record.update(owner='deploy',terminal=True);self.ownership.store.write('operation',record)
        with self.assertRaises(ValueError):self.recover()
        self.assertEqual(self.ownership.status(),record);self.assertEqual(self.store.read('transaction'),self.original)
    def test_loaded_ambient_supervisor_module_is_refused(self):
        import types,hashlib
        code=Path(os.path.realpath(self.tmp.name))/'code';code.mkdir();source=code/'recovery_fixture.py';source.write_text('value="verified"');source.chmod(0o600)
        sys.modules['recovery_fixture']=types.ModuleType('recovery_fixture');self.addCleanup(lambda:sys.modules.pop('recovery_fixture',None))
        with self.assertRaises(ValueError):self.module.load_sources(code,{'recovery_fixture.py':hashlib.sha256(source.read_bytes()).hexdigest()})

    def test_received_health_before_interruption_resumes_without_relaunch(self):
        launch=self.launch
        def interrupted():launch();raise KeyboardInterrupt('health received before SSH loss')
        self.launch=interrupted
        with self.assertRaises(KeyboardInterrupt):self.recover()
        calls=self.io.calls.count('close-relaunch');self.launch=launch
        self.assertEqual(self.recover()['phase'],'rolled-back');self.assertEqual(self.io.calls.count('close-relaunch'),calls)

    def test_original_owner_observation_defers_only_authenticated_transition(self):
        Device=OriginalDevice
        from package_identity import TransitionUnknown
        import types
        observed=[]
        def observe(owner):
            observed.append(owner)
            if owner!='com.cleanyourtv.system.updater' and self.store.read('transaction')['phase']=='recovery-required':raise TransitionUnknown('Private transaction requires recovery')
            return {'id':owner}
        self.io.owner_identity=observe;self.io.store=self.store
        self.io.components_present=types.MethodType(Device.components_present,self.io)
        self.io.require_components=types.MethodType(Device.require_components,self.io)
        self.assertEqual(self.recover()['phase'],'rolled-back')
        self.assertTrue({'com.cleanyourtv.system.updater','com.cleanyourtv.root.preview','com.cleanyourtv.root.updater'}<=set(observed))
    def test_original_owner_missing_or_corrupt_proof_dominates_transition(self):
        Device=OriginalDevice
        from package_identity import TransitionUnknown
        import types
        self.io.store=self.store
        self.io.components_present=types.MethodType(Device.components_present,self.io)
        self.io.require_components=types.MethodType(Device.require_components,self.io)
        for failure in [FileNotFoundError('removed supervisor'),ValueError('corrupt original receipt')]:
            def observe(owner):
                if owner=='com.cleanyourtv.system.updater':raise failure
                raise TransitionUnknown('Private transaction requires recovery')
            self.io.owner_identity=observe
            with self.assertRaises(ValueError):self.recover()
            self.assertEqual(self.store.read('transaction'),self.original)
    def test_preflight_never_calls_mutating_legacy_lockdown(self):
        self.io.check_legacy=lambda:self.fail('legacy lockdown is a write before verified rearm')
        self.assertEqual(self.recover()['phase'],'rolled-back')
    def test_root_recovery_proof_damage_rejected_before_audit(self):
        def damaged():raise ValueError('Root recovery receipt mismatch')
        self.io._root_integrity=damaged
        with self.assertRaises(ValueError):self.recover()
        self.assertEqual(self.store.read('transaction'),self.original);self.assertIsNone(self.store.read('readiness-recovery-'+self.original['id']))

if __name__=='__main__':unittest.main()
