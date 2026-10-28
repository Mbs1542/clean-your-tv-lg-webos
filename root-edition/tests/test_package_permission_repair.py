"""Explicit repair uses private writer bytes, never adopts installed SDK data."""
import ast,json,os,stat,unittest
from pathlib import Path
from unittest.mock import patch
import test_package_identity as fixture
p=fixture.p

class RepairTests(unittest.TestCase):
    tearDown=fixture.IdentityTests.tearDown
    package=fixture.IdentityTests.package
    install=fixture.IdentityTests.install
    def setUp(self):
        source=(Path(__file__).resolve().parents[1]/'runtime/cli.py').read_text()
        functions=[n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef) and n.name=='repair_sdk_permissions']
        self.assertEqual(len(functions),1,'explicit verified SDK repair is missing')
        ns={};exec(ast.get_source_segment(source,functions[0]),ns)
        self.function=ns['repair_sdk_permissions']
        fixture.IdentityTests.setUp(self)
    def repair(self):
        return self.function(installed=self.installed,states=self.states,uid=self.uid,version='1.0.0')
    def own(self):
        return [self.installed/name for name in self.packages[p.ROOT][2]]
    def modes(self):return {str(x):stat.S_IMODE(x.lstat().st_mode) for x in self.installed.rglob('*')}
    def test_matching_private_package_hardens_only_owned_paths_and_is_idempotent(self):
        before={x:x.read_bytes() for x in self.own()};others={x:x.stat().st_mode for x in self.installed.rglob('*') if p.ROOT not in str(x)}
        result=self.repair();self.assertGreater(result['repaired'],0)
        for path,raw in before.items():self.assertEqual(path.read_bytes(),raw);self.assertFalse(path.stat().st_mode&0o022);self.assertFalse(path.parent.stat().st_mode&0o022)
        for path,mode in others.items():self.assertEqual(path.stat().st_mode,mode)
        self.assertEqual(self.repair()['repaired'],0)
    def test_untrusted_data_or_unknown_files_prevent_all_chmod(self):
        for damage in ('bytes','cache','extra','link','hardlink','directory-link','special'):
            with self.subTest(damage=damage):
                # Independent fixture per case; the refusal must not harden anything.
                path=self.own()[0];raw=path.read_bytes();cache=self.states[p.UPDATER]/'cache'/(self.prior['sha256']+'.ipk');cached=cache.read_bytes();extra=path.parent/'foreign'
                if damage=='bytes':path.write_bytes(b'changed')
                if damage=='cache':cache.write_bytes(b'changed')
                if damage=='extra':extra.write_bytes(b'foreign')
                if damage=='link':path.unlink();path.symlink_to(cache)
                if damage=='hardlink':os.link(path,extra)
                if damage=='directory-link':extra.symlink_to(self.base,target_is_directory=True)
                if damage=='special':path.chmod(0o4777)
                before=self.modes()
                with self.assertRaises((ValueError,OSError)):self.repair()
                self.assertEqual(self.modes(),before)
                if path.is_symlink():path.unlink();path.write_bytes(raw)
                else:path.write_bytes(raw)
                path.chmod(0o777);cache.write_bytes(cached)
                if extra.is_symlink() or extra.exists():extra.unlink()
    def test_wrong_owner_is_rejected_before_chmod(self):
        original=os.fstat;target=self.own()[0].stat().st_ino
        def foreign(fd):
            info=original(fd)
            if info.st_ino==target:
                values=list(info);values[4]=self.uid+1;return os.stat_result(values)
            return info
        before=self.modes()
        with patch('os.fstat',side_effect=foreign),self.assertRaises(ValueError):self.repair()
        self.assertEqual(self.modes(),before)
    def test_private_publication_must_match_and_be_terminal(self):
        for value in ({'version':'9.0.0',**{k:v for k,v in self.prior.items() if k!='version'}},{'version':'1.0.0','sha256':'a'*64,'size':1,'local':True}):
            self.stores[p.UPDATER].write('current',value);before=self.modes()
            with self.assertRaises((ValueError,OSError)):self.repair()
            self.assertEqual(self.modes(),before)
    def test_interruption_can_retry_without_reverting_secure_modes(self):
        chmod=os.fchmod;count=0
        def interrupted(fd,mode):
            nonlocal count
            chmod(fd,mode);count+=1
            if count==2:raise OSError('interrupted')
        with patch('os.fchmod',side_effect=interrupted),self.assertRaises(OSError):self.repair()
        self.repair()
        for path in self.own():self.assertFalse(path.stat().st_mode&0o022)
    def test_concurrent_bytes_change_after_preflight_never_reports_success(self):
        chmod=os.fchmod;path=self.own()[0];changed=False
        def change(fd,mode):
            nonlocal changed
            chmod(fd,mode)
            if not changed:path.write_bytes(b'concurrent replacement');changed=True
        with patch('os.fchmod',side_effect=change),self.assertRaises(ValueError):self.repair()
