"""Missing Home interfaces must fail before package/state mutation."""
import copy
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import deploy
import install_device
import install_driver
from installation import Ownership
from updater.store import Store

spec=importlib.util.spec_from_file_location('home_interface_provision',ROOT/'provision.py')
provision=importlib.util.module_from_spec(spec);spec.loader.exec_module(provision)
STOCK='com.webos.app.home'

class HomeInterfaceTests(unittest.TestCase):
    def bus(self,method):
        self.calls.append(method)
        if method=='home-read':return {'returnValue':True,'settings':{'defaultApps':copy.deepcopy(self.settings)}}
        if method=='home-profiles':
            if self.missing:
                error=provision.RecoveryRPCError('negative-reply',code=-1)
                error.details['luna_reason']='service-missing'
                raise error

            return copy.deepcopy(self.profiles)
        self.fail('Unexpected mutation: '+method)

    def setUp(self):
        self.calls=[];self.missing=False;self.settings={'MembershipApp':'membership'}
        self.profiles={'returnValue':True,'profiles':{'defaultApps':{'categories':{'home':STOCK}},'idleApp':{'appId':STOCK,'support':True}}}
        self.addCleanup(patch.stopall)
        patch.dict(sys.modules,{'provision':provision}).start()
        patch.object(provision,'rpc',side_effect=self.bus).start()

    def test_absent_settings_override_is_supported_without_writes(self):
        provision.require_home_interfaces()
        self.assertEqual(self.calls,['home-read','home-profiles'])
        self.assertNotIn('home',self.settings)

    def test_incomplete_or_negative_profile_readback_is_rejected(self):
        for reply in ({'returnValue':False}, {'returnValue':True,'profiles':{}},
                      {'returnValue':True,'profiles':{'defaultApps':{'categories':{'home':STOCK}},'idleApp':{'appId':STOCK}}}):
            self.profiles=reply
            with self.subTest(reply=reply),self.assertRaises((ValueError,RuntimeError)):
                provision.require_home_interfaces()

    def test_negative_and_malformed_settings_are_rejected_without_writes(self):
        for reply in ({'returnValue':False,'settings':{'defaultApps':{}}},
                      {'returnValue':True,'settings':{'defaultApps':[]}},
                      {'returnValue':True,'settings':{'defaultApps':{'home':None}}}):
            def bus(method):
                self.calls.append(method)
                if method=='home-read':return reply
                if method=='home-profiles':return self.profiles
                self.fail('Unexpected bus mutation')
            with self.subTest(reply=reply),patch.object(provision,'rpc',side_effect=bus):
                with self.assertRaisesRegex(RuntimeError,'Home routing interfaces'):
                    provision.require_home_interfaces()

    def test_missing_service_rejects_product_before_lease_and_request(self):
        self.missing=True
        with tempfile.TemporaryDirectory() as tmp:
            owner=Ownership(Store(Path(tmp).resolve()/'state',uid=os.getuid()))
            device=install_device.LocalDevice()
            with patch.object(deploy,'require_device'),patch.object(deploy,'require_node'),patch.object(install_device,'require_product_abi'):
                with self.assertRaisesRegex(RuntimeError,'Home routing interfaces') as failure:
                    install_driver.Coordinator(device,owner).install('a'*32,'/unused')
            self.assertIsInstance(failure.exception.__cause__,provision.RecoveryRPCError)
            self.assertEqual(failure.exception.__cause__.details['luna_reason'],'service-missing')
            self.assertIsNone(owner.status());self.assertIsNone(owner.store.read('request-'+'a'*32))
            self.assertEqual(sorted(p.name for p in (Path(tmp)/'state').iterdir()),[])

    def test_low_level_install_checks_interfaces_before_state_creation(self):
        self.missing=True
        with tempfile.TemporaryDirectory() as tmp,patch.object(deploy,'STATE',Path(tmp)/'root'),patch.object(deploy,'installed_paths',return_value=[]),patch.object(deploy,'verify_bundle',return_value={}):
            with self.assertRaisesRegex(RuntimeError,'Home routing interfaces'):
                deploy.install(Path('/unused'))
            self.assertFalse((Path(tmp)/'root').exists())
