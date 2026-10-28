"""Real ownership lock contention, bounded only around health context entry."""
import contextlib
import importlib
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
if os.name!='posix':raise unittest.SkipTest('System ownership health wait requires POSIX flock')
from test_core import CoreBase,RootIO,IO,profile

class HealthLockTests(CoreBase):
    def setUp(self):
        super().setUp();self.io=RootIO();self.io.integrity=lambda:None;self.m=self.Manager(self.store,self.io)
        self.m.install('root','v1.1.0',profile());self.tx=self.advance('verifying')
        self.cli=importlib.import_module('system_updater.cli');self.installation=importlib.import_module('installation')
        self.owner=self.installation.Ownership(self.store.__class__(Path(self.tmp.name).resolve()/'ownership',uid=os.getuid()))
        self.records={str(path):None for path,field,done in self.installation.JOURNALS.values()}
        self.records[str(self.installation.JOURNALS['system-update'][0])]=self.tx
        pending=self.installation.pending_journals
        self.stack=contextlib.ExitStack();self.addCleanup(self.stack.close)
        self.stack.enter_context(patch.object(self.installation,'Ownership',return_value=self.owner))
        operation=self.installation.device_operation
        self.stack.enter_context(patch.object(self.installation,'device_operation',side_effect=lambda name,recovery=False:operation(name,recovery,ownership=self.owner,read=lambda p:self.records[str(p)])))
        self.stack.enter_context(patch.object(self.installation,'pending_journals',side_effect=lambda owner,*a:pending(owner,read=lambda p:self.records[str(p)])))
        self.payload={'edition':'root','transaction':self.tx['id'],'version':'1.1.0'}
        with self.owner.operation('system-update','transaction.json'):pass

    def test_waits_for_real_lock_release_then_handles_health_once(self):
        import subprocess,sys
        child_code='''import os,sys
sys.path.insert(0,sys.argv[1])
from installation import Ownership
from updater.store import Store
owner=Ownership(Store(sys.argv[2],uid=os.getuid()))
with owner.operation('system-update','transaction.json',resume=sys.argv[3]):
 print('LOCKED',flush=True);assert sys.stdin.readline().strip()=='release'
'''
        child=subprocess.Popen([sys.executable,'-c',child_code,str(Path(__file__).resolve().parents[2]/'root-edition'),self.owner.store.root,self.owner.status()['id']],stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True)
        try:
            self.assertEqual(child.stdout.readline().strip(),'LOCKED')
            sleeps=[];real_sleep=self.cli.time.sleep
            def release(delay):
                sleeps.append(delay);child.stdin.write('release\n');child.stdin.flush()
                with patch.object(self.cli.time,'sleep',real_sleep):self.assertEqual(child.wait(timeout=3),0)
            with patch.object(self.cli.time,'sleep',side_effect=release):
                with self.cli.healthy_operation(self.payload,self.store,self.io):
                    result=self.cli.handle('healthy',self.payload,self.store,self.io,wake=lambda:None)
            self.assertEqual(result['transaction'],self.tx['id']);self.assertEqual(len(sleeps),1)
        finally:
            if child.poll() is None:child.kill();child.wait()
            child.stdin.close();child.stdout.close()

    def test_busy_inside_acquired_handler_is_not_retried(self):
        count=[]
        with self.assertRaises(self.installation.Busy):
            with self.cli.healthy_operation(self.payload,self.store,self.io):
                count.append(True);raise self.installation.Busy()
        self.assertEqual(count,[True])

    def test_lock_wait_stops_at_ten_monotonic_seconds(self):
        now=[0.0]
        with self.owner.operation('system-update','transaction.json',resume=self.owner.status()['id']),patch.object(self.cli.time,'monotonic',side_effect=lambda:now[0]),patch.object(self.cli.time,'sleep',side_effect=lambda d:now.__setitem__(0,now[0]+d)):
            with self.assertRaises(self.installation.Busy):
                with self.cli.healthy_operation(self.payload,self.store,self.io):self.fail('lock entered')
        self.assertLessEqual(now[0],10.00001);self.assertGreaterEqual(now[0],10)

    def test_wait_stops_at_original_health_deadline(self):
        now=[0.0];self.io.time=self.tx['deadline']-.15
        def sleep(d):now[0]+=d;self.io.time+=d
        with self.owner.operation('system-update','transaction.json',resume=self.owner.status()['id']),patch.object(self.cli.time,'monotonic',side_effect=lambda:now[0]),patch.object(self.cli.time,'sleep',side_effect=sleep):
            with self.assertRaises((ValueError,self.installation.Busy)):
                with self.cli.healthy_operation(self.payload,self.store,self.io):self.fail('expired health entered')
        self.assertLessEqual(now[0],.151)

    def test_foreign_pending_journal_never_waits(self):
        path=self.installation.JOURNALS['root-update'][0];self.records[str(path)]={'phase':'installing'}
        with patch.object(self.cli.time,'sleep') as sleep,self.assertRaises(self.installation.Busy):
            with self.cli.healthy_operation(self.payload,self.store,self.io):self.fail('foreign journal admitted')
        sleep.assert_not_called()

    def test_rejects_changed_lease_transaction_phase_edition_or_version(self):
        for key,value in [('transaction','0'*32),('edition','no-root'),('version','9.0.0')]:
            with self.subTest(key=key),self.assertRaises(ValueError):
                with self.cli.healthy_operation(dict(self.payload,**{key:value}),self.store,self.io):self.fail('foreign request admitted')
        for phase in ('complete','recovery-required','rolling-back'):
            changed=dict(self.tx,phase=phase);self.store.write('transaction',changed)
            with self.subTest(phase=phase),self.assertRaises(ValueError):
                with self.cli.healthy_operation(self.payload,self.store,self.io):self.fail('wrong phase admitted')
        self.store.write('transaction',self.tx)
        with self.owner.operation('system-update','transaction.json',resume=self.owner.status()['id']):
            def replace(d):
                changed=self.owner.status();changed['id']='0'*32;self.owner.store.write('operation',changed)
            with patch.object(self.cli.time,'sleep',side_effect=replace),self.assertRaises(ValueError):
                with self.cli.healthy_operation(self.payload,self.store,self.io):self.fail('new lease admitted')

    def test_shared_endpoint_accepts_no_root_and_retained_rollback_health(self):
        self.m.healthy('root',self.tx['id'],'1.1.0');self.advance('complete');self.m.rollback();self.tx=self.advance('verifying-rollback')
        self.records[str(self.installation.JOURNALS['system-update'][0])]=self.tx
        with self.cli.healthy_operation(dict(self.payload,version='1.0.0'),self.store,self.io):pass
        other=self.store.__class__(Path(self.tmp.name).resolve()/'no-root',uid=os.getuid());device=IO()
        manager=self.Manager(other,device);tx=manager.install('no-root','v1.1.0',profile())
        for _ in range(20):
            tx=manager.run()
            if tx['phase']=='verifying':break
        self.assertEqual(tx['phase'],'verifying');self.records[str(self.installation.JOURNALS['system-update'][0])]=tx
        with self.cli.healthy_operation({'transaction':tx['id'],'edition':'no-root','version':'1.1.0'},other,device):pass

    def test_original_root_identity_and_manager_accept_gated_descriptor(self):
        import copy,hashlib,json,tarfile,types
        project=Path(__file__).resolve().parents[2]
        fixture=project/'tests/system_updates/fixtures/public-1.3.0-supervisor.tar.gz'
        provenance=json.loads(fixture.with_suffix('.provenance.json').read_text())
        with tarfile.open(fixture) as archive:raw=archive.extractfile('infrastructure/support/package_identity.py').read()
        self.assertEqual(hashlib.sha256(raw).hexdigest(),provenance['files']['infrastructure/support/package_identity.py'])
        original=types.ModuleType('original_root_identity');exec(compile(raw,'immutable_original_root_identity','exec'),original.__dict__)
        gated=copy.deepcopy(self.tx);gated['candidate']['minimumSupervisorVersion']='1.1.1'
        self.store.write('transaction',gated)
        self.assertEqual(self.m._load()['candidate']['minimumSupervisorVersion'],'1.1.1')
        self.assertIs(original._journal(gated,system=True),gated)

    def test_changed_health_window_during_wait_is_rejected(self):
        now=[0.0]
        def change_window(delay):
            now[0]+=delay
            changed=dict(self.tx,launched=self.tx['launched']-1,deadline=self.tx['deadline']-1)
            self.store.write('transaction',changed)
        with self.owner.operation('system-update','transaction.json',resume=self.owner.status()['id']),patch.object(self.cli.time,'monotonic',side_effect=lambda:now[0]),patch.object(self.cli.time,'sleep',side_effect=change_window):
            with self.assertRaisesRegex(ValueError,'window'):
                with self.cli.healthy_operation(self.payload,self.store,self.io):self.fail('changed window admitted')
        self.assertLessEqual(now[0],.05)
