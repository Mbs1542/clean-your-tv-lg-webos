# Frozen from root-edition/runtime/cli.py at 7fb6986f4d7805170dbef70a51590d4e01827e1d.
def firmware_access(root='/var/lib/clean-your-tv-root', base='/var/luna-service2-dev', installed='/media/developer/apps/usr/palm', installation='/var/lib/clean-your-tv-installation', enable=True, lock_product=True, refresh=None, uid=0, automatic=False, repair=None):
    """Register only configuration APIs; retain legacy ACLs and updater contracts."""
    import contextlib, fcntl, hashlib, json, os, re, stat, subprocess, tempfile
    from pathlib import Path
    root,base,installed,installation=map(Path,(root,base,installed,installation))
    app='com.cleanyourtv.root.preview';service=app+'.service';group=service+'.control'
    api=root/'permissions/homebrew-configuration.api.json';receipt=root/'firmware-permissions.json'
    manifest=base/'manifests.d'/(app+'.json')
    methods=['org.webosbrew.hbchannel.service/getConfiguration','org.webosbrew.hbchannel.service/setConfiguration']
    def digest(raw):return hashlib.sha256(raw).hexdigest()
    def encoded(value):return (json.dumps(value,sort_keys=True,indent=2)+'\n').encode()
    content=encoded({group:methods})
    sdk_containers={Path(p) for p in ('/media/developer','/media/developer/apps','/media/developer/apps/usr','/media/developer/apps/usr/palm','/media/developer/apps/usr/palm/applications')}
    def directories(path,sdk=False):
        for parent in (path,*path.parents):
            info=parent.lstat()
            if not stat.S_ISDIR(info.st_mode) or info.st_uid not in (0,uid) or (info.st_mode&0o022 and not (sdk and parent in sdk_containers)):raise ValueError('Unsafe firmware permission directory')
    def secure(path,sdk=False):
        directories(path.parent,sdk)
        fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK)
        with os.fdopen(fd,'rb') as stream:
            info=os.fstat(stream.fileno())
            if not stat.S_ISREG(info.st_mode) or info.st_uid!=uid or info.st_nlink!=1 or info.st_mode&0o022 or info.st_size>4194304:raise ValueError('Unsafe firmware permission evidence')
            return stream.read(4194305)
    def read(path):return json.loads(secure(path))
    def atomic(path,data,mode=0o600,owner=None):
        fd,name=tempfile.mkstemp(prefix='.firmware-',dir=path.parent)
        try:
            with os.fdopen(fd,'wb') as stream:
                if owner is not None:os.fchown(stream.fileno(),*owner)
                os.fchmod(stream.fileno(),mode);stream.write(data);stream.flush();os.fsync(stream.fileno())
            os.replace(name,path);sync(path.parent)
        finally:
            if os.path.lexists(name):os.unlink(name)
    def sync(path):
        fd=os.open(path,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
        try:os.fsync(fd)
        finally:os.close(fd)
    def lock(path):
        fd=os.open(path,os.O_RDWR|os.O_CREAT|os.O_NOFOLLOW|os.O_NONBLOCK,0o600)
        info=os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_uid!=uid or info.st_nlink!=1 or info.st_mode&0o077:os.close(fd);raise ValueError('Unsafe firmware permission lock')
        try:fcntl.flock(fd,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BaseException:os.close(fd);raise
        return fd
    if type(enable) is not bool or repair is not None and (not enable or automatic or not callable(repair)):raise ValueError('Invalid firmware permission action')
    for path in (root,base,installation):directories(path)
    directories(installed,sdk=True)
    with contextlib.ExitStack() as locks:
        if lock_product:
            fd=lock(installation/'ownership.lock');locks.callback(os.close,fd)
            lease=read(installation/'operation.json') if os.path.lexists(installation/'operation.json') else None
            if lease is not None and (not isinstance(lease,dict) or set(lease)!={'schema','id','owner','journal','stage','terminal'} or type(lease['schema']) is not int or lease['schema']!=1 or lease['terminal'] is not True or not isinstance(lease['id'],str) or not re.fullmatch('[a-f0-9]{32}',lease['id']) or any(not isinstance(lease[k],str) or not re.fullmatch('[a-zA-Z0-9_.-]{1,128}',lease[k]) for k in ('owner','journal','stage'))):raise ValueError('Installation or recovery is pending')
        fd=lock(root/'firmware-permissions.lock');locks.callback(os.close,fd)
        journals=[(root/'deploy.json','stage',{'installed-recovery-only'}),(root/'profile-trial.json','state',{'restored'})]
        for folder in ('clean-your-tv-root-updater','clean-your-tv-system-updater'):
            state=root.parent/folder
            journals.extend(((state/'bootstrap.json','phase',{'complete'}),(state/'transaction.json','phase',{'complete','rolled-back','aborted'})))
            if os.path.lexists(state/'cytv-removal.json'):raise ValueError('Removal is pending')
        if lock_product:
            for path,field,finished in journals:
                if not os.path.lexists(path):continue
                value=read(path)
                if not isinstance(value,dict) or value.get(field) not in finished:raise ValueError('Component recovery is pending')
                if path.name=='transaction.json' and value.get('homeResumePhase')!=value.get('phase'):raise ValueError('Home restoration is pending')
            if any(os.path.lexists(root/name) for name in ('update-block.json','cytv-removal.json')):raise ValueError('Root recovery is pending')
        proof=read(root/'recovery-provision.json')
        if not isinstance(proof,dict) or proof.get('version')!=1 or proof.get('mode')!='recovery-only' or not isinstance(proof.get('files'),dict) or not proof['files']:raise ValueError('Missing Root recovery proof')
        for name,expected in proof['files'].items():
            path=Path(name)
            if not path.is_absolute() or '..' in path.parts or root not in path.parents or not isinstance(expected,str) or not re.fullmatch('[a-f0-9]{64}',expected) or digest(secure(path))!=expected:raise ValueError('Root recovery code changed')
        snapshot=read(root/'ls2-provision-snapshot.json')
        paths={key:base/folder/(service+suffix) for key,folder,suffix in (('service','services.d','.service'),('role','roles.d','.service.json'),('client','client-permissions.d','.service.json'),('api','api-permissions.d','.api.json'))}
        if not isinstance(snapshot,dict) or snapshot.get('version')!=1 or snapshot.get('service')!=service or snapshot.get('phase') is not None or set(snapshot.get('files',{}))!={str(p) for p in paths.values()}:raise ValueError('Root provisioning is not active')
        for path in paths.values():
            entry=snapshot['files'][str(path)];meta=path.stat()
            if (not isinstance(entry,dict) or not isinstance(entry.get('original'),str) or digest(entry['original'].encode())!=entry.get('original_sha256') or digest(secure(path))!=entry.get('installed_sha256') or (meta.st_uid,meta.st_gid,stat.S_IMODE(meta.st_mode))!=(entry.get('uid'),entry.get('gid'),entry.get('mode'))):raise ValueError('Root registration drift')
        clients=read(paths['client']);original_clients=json.loads(snapshot['files'][str(paths['client'])]['original'])
        if not isinstance(clients,dict) or not isinstance(original_clients,dict) or {name for name,groups in clients.items() if isinstance(groups,list) and group in groups}!={app,app+'-*'} or any(isinstance(groups,list) and group in groups for groups in original_clients.values()):raise ValueError('Root Home group ownership changed')
        raw=secure(manifest);value=json.loads(raw);meta=manifest.stat()
        # Revocation needs only the protected manifest, never SDK caller authority.
        info=json.loads(secure(installed/'applications'/app/'appinfo.json',sdk=True)) if enable and repair is None else value
        version=info.get('version') if isinstance(info,dict) else None
        if not isinstance(info,dict) or info.get('id')!=app or not isinstance(version,str) or not re.fullmatch(r'\d{1,4}\.\d{1,4}\.\d{1,4}',version):raise ValueError('Root Home identity changed')
        normal={'version':version,'id':app,'serviceFiles':[str(paths['service'])],'apiPermissionFiles':[str(paths['api'])],
            'roleFiles':[str(paths['role']),str(base/'roles.d'/(app+'.app.json'))],
            'clientPermissionFiles':[str(paths['client']),str(base/'client-permissions.d'/(app+'.app.json'))]}
        granted=dict(normal,apiPermissionFiles=[str(paths['api']),str(api)])
        if value not in (normal,granted):raise ValueError('Unknown SDK manifest')
        saved=read(receipt) if os.path.lexists(receipt) else None
        fields={'schema','phase','api_sha256','original','original_sha256','version'}
        if saved is not None:
            if (not isinstance(saved,dict) or set(saved)!=fields or type(saved['schema']) is not int or saved['schema']!=1 or saved['phase'] not in ('enabling','enabled','disabling','disabled') or saved['api_sha256']!=digest(content) or not isinstance(saved['original'],str) or digest(saved['original'].encode())!=saved['original_sha256']):raise ValueError('Firmware permission receipt changed')
            prior=json.loads(saved['original'])
            if not isinstance(prior,dict) or prior.get('version')!=saved['version'] or dict(prior,version=version)!=normal:raise ValueError('Firmware manifest provenance changed')
            if (saved['phase']=='disabling' and enable) or (saved['phase']=='enabling' and not enable):raise ValueError('Resume the same firmware permission action')
        elif value==granted or os.path.lexists(api):raise ValueError('Firmware permission collision')
        if os.path.lexists(api) and secure(api)!=content:raise ValueError('Firmware API drift')
        if automatic and saved is not None and saved['phase']=='disabled':return {'returnValue':True,'permissions_installed':False}
        if repair is not None:
            repair(version)  # All protected registration/provenance checks precede SDK mutation.
            checked=json.loads(secure(installed/'applications'/app/'appinfo.json',sdk=True))
            if not isinstance(checked,dict) or checked.get('id')!=app or checked.get('version')!=version:raise ValueError('Repaired SDK identity changed')
        if enable and saved is not None and saved['phase']=='enabled' and value==granted and os.path.lexists(api):return {'returnValue':True,'permissions_installed':True,'effective_verified':False,'reopen_home':True}
        if not enable and saved is None:return {'returnValue':True,'permissions_installed':False}
        if enable:
            if saved is None or value==normal and saved['version']!=version:
                saved={'schema':1,'phase':'enabling','api_sha256':digest(content),'original':raw.decode(),'original_sha256':digest(raw),'version':version}
            else:saved=dict(saved,phase='enabling')
            atomic(receipt,encoded(saved))
            if not os.path.lexists(api.parent):api.parent.mkdir(mode=0o700);sync(api.parent.parent)
            directories(api.parent)
            if not os.path.lexists(api):atomic(api,content)
            if value!=granted:atomic(manifest,encoded(granted),stat.S_IMODE(meta.st_mode),(meta.st_uid,meta.st_gid))
        else:
            saved=dict(saved,phase='disabling');atomic(receipt,encoded(saved))
            original=saved['original'].encode() if saved['version']==version else encoded(normal)
            if value!=normal:atomic(manifest,original,stat.S_IMODE(meta.st_mode),(meta.st_uid,meta.st_gid))
        if refresh is None:
            ctl=next((p for p in ('/usr/bin/ls-control','/usr/sbin/ls-control') if Path(p).is_file()),None)
            if not ctl:raise ValueError('LS2 scanner unavailable')
            subprocess.run([ctl,'scan-services'],check=True,timeout=15,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        else:refresh()
        expected=granted if enable else normal
        if read(manifest)!=expected:raise ValueError('Firmware manifest readback failed')
        if enable:
            if secure(api)!=content:raise ValueError('Firmware API readback failed')
            atomic(receipt,encoded(dict(saved,phase='enabled')))
        else:
            if os.path.lexists(api):api.unlink();sync(api.parent)
            atomic(receipt,encoded(dict(saved,phase='disabled')))
        return {'returnValue':True,'permissions_installed':enable,'effective_verified':False,'reopen_home':True}
