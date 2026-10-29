"""Reviewed-source rollback of finalize failures before recovery registration.

No retained code is executed. The original snapshot remains immutable; the
cancellation receipt authorizes only original/installed bytes during rollback.
This is not a routing adapter and never writes a Home setting.
"""
import hashlib
import json
import os
from pathlib import Path
import stat
import tempfile

from updater.package import safe_bytes

EXTRA={'ls2-provision-snapshot.json','recovery-provision.pending.json','recovery-failure.json',
       'service','run-recovery-service','recovery-service.json','bootstrap.pid'}


def write_registration(path, entry):
    """Publish original ownership and mode together, including across power loss."""
    fd,name=tempfile.mkstemp(prefix='.cytv-cancel-',dir=path.parent)
    try:
        with os.fdopen(fd,'wb') as stream:
            os.fchown(stream.fileno(),entry['uid'],entry['gid'])
            os.fchmod(stream.fileno(),entry['mode'])
            stream.write(entry['original'].encode());stream.flush();os.fsync(stream.fileno())
        os.replace(name,path)
        directory=os.open(path.parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
        try:os.fsync(directory)
        finally:os.close(directory)
    finally:
        if os.path.lexists(name):os.unlink(name)


class PendingProvision:
    def __init__(self, recovery):
        self.recovery=recovery;self.root=recovery.root;self.uid=recovery.store.uid

    def read(self, path):
        os.close(self.recovery.store._walk(str(path.parent)))
        return safe_bytes(path,uid=self.uid)

    def inspect(self, *, admitted=False, removed=False, restored=False):
        import provision as p
        # These fixed maintained paths, never paths selected by a snapshot,
        # delimit every possible registration write.
        expected={str(path):key for key,path in p.FILES.items()}
        if any(self.recovery.system not in path.parents for path in p.FILES.values()):
            raise ValueError('unexpected_provision_registration_root')
        saved=json.loads(self.read(self.root/'ls2-provision-snapshot.json'))
        if (not isinstance(saved,dict) or set(saved)!={'version','service','files'}
                or type(saved['version']) is not int or saved['version']!=1
                or saved['service']!=p.NAME or not isinstance(saved['files'],dict)
                or set(saved['files'])!=set(expected)):
            raise ValueError('original_pending_provision_snapshot_required')
        original={}
        for name,key in expected.items():
            entry=saved['files'][name]
            if (not isinstance(entry,dict) or set(entry)!={'original','original_sha256','installed_sha256','mode','uid','gid'}
                    or not isinstance(entry['original'],str)
                    or hashlib.sha256(entry['original'].encode()).hexdigest()!=entry['original_sha256']
                    or any(type(entry[k]) is not int or entry[k]<0 for k in ('mode','uid','gid'))
                    or entry['mode']>0o777 or entry['mode']&0o022 or entry['uid']!=self.uid
                    or str(self.root) in entry['original']):
                raise ValueError('invalid_original_provision_registration')
            original[key]=entry['original']
        updated=p.plan(original)
        for name,key in expected.items():
            path=Path(name);entry=saved['files'][name]
            if hashlib.sha256(updated[key]).hexdigest()!=entry['installed_sha256']:
                raise ValueError('pending_provision_plan_changed')
            if removed:
                if os.path.lexists(path):raise ValueError('removed_provision_registration_remains')
                continue
            raw=self.read(path);info=path.lstat()
            allowed=(entry['original_sha256'],) if restored else (entry['original_sha256'],entry['installed_sha256']) if admitted else (entry['installed_sha256'],)
            if (hashlib.sha256(raw).hexdigest() not in allowed
                    or (stat.S_IMODE(info.st_mode),info.st_uid,info.st_gid)!=(entry['mode'],entry['uid'],entry['gid'])):
                raise ValueError('pending_provision_registration_drift')
        failure=json.loads(self.read(self.root/'recovery-failure.json'))
        if (not isinstance(failure,dict) or type(failure.get('schema')) is not int or failure['schema']!=1
                or failure.get('phase') not in ('stock-home','status')):
            raise ValueError('pre_registration_finalize_failure_required')
        service=self.root/'service'
        os.close(self.recovery.store._walk(str(service)))
        if {path.name for path in service.iterdir()}!=set(p.PRIVATE_FILES):raise ValueError('unknown_private_service_entry')
        release=json.loads(self.read(self.root/'release.json'))
        for name in p.PRIVATE_FILES:
            if hashlib.sha256(self.read(service/name)).hexdigest()!=release['files'].get('usr/palm/services/'+p.NAME+'/'+name):
                raise ValueError('private_recovery_service_changed')
        if self.read(self.root/'run-recovery-service')!=p.runner_bytes():raise ValueError('private_recovery_runner_changed')
        pending=json.loads(self.read(self.root/'recovery-provision.pending.json'))
        if pending!=p.manifest():raise ValueError('pending_recovery_manifest_changed')
        settings=self.recovery.device.rpc('com.webos.settingsservice/getSystemSettings',{'category':'general','keys':['defaultApps']})
        defaults=settings.get('settings',{}).get('defaultApps')
        if (not isinstance(defaults,dict) or ('home' in defaults and defaults['home']!='com.webos.app.home')):
            raise ValueError('stock_home_settings_unconfirmed')
        activities=self.recovery.device.rpc('com.palm.activitymanager/list',{'details':True,'subscribers':True,'current':False,'internal':False}).get('activities')
        if not isinstance(activities,list):raise ValueError('activity_absence_unconfirmed')
        for item in activities:
            if (not isinstance(item,dict) or item.get('name')==p.NAME+'.recovery'
                    or str(item.get('callback',{}).get('method','')).startswith('luna://'+p.NAME+'/')):
                raise ValueError('recovery_activity_present')
        optional={name:hashlib.sha256(self.read(self.root/name)).hexdigest()
                  for name in ('recovery-service.json','bootstrap.pid') if os.path.lexists(self.root/name)}
        return dict(snapshot=saved,pending=pending,failure=failure,settings=defaults,optional=optional)

    def restore(self, evidence):
        import provision as p
        # The caller holds the original ownership/provision locks and has
        # durably blocked old resume before this first reversible write.
        if self.inspect(admitted=True)!=evidence:raise ValueError('pending_provision_proof_changed')
        for path,entry in evidence['snapshot']['files'].items():write_registration(Path(path),entry)
        if self.inspect(admitted=True,restored=True)!=evidence:raise ValueError('provision_restore_unconfirmed')
        if p.refresh().get('returnValue') is not True:raise ValueError('provision_refresh_unconfirmed')
