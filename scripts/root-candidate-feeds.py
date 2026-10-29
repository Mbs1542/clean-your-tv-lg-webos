#!/usr/bin/env python3
"""Prepare Root-only QA signing inputs from one successful trusted CI artifact.

No signing key is read here. This cannot publish a release or authorize No-root.
"""
import argparse,base64,hashlib,json,os,re,runpy,stat,subprocess,sys,tempfile,zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REPO='Razdva122/clean-your-tv-lg-webos'
BUILD_JOBS=runpy.run_path(str(ROOT/'scripts/release-flow.py'))['BUILD_JOBS']
MAX_ARCHIVE=128*1024*1024


def digest(raw):return hashlib.sha256(raw).hexdigest()

def validate_run(run,jobs,tag,versions,published):
    if (run.get('head_repository',{}).get('full_name')!=REPO
            or run.get('head_branch')!='release/next' or run.get('event') not in ('push','workflow_dispatch')
            or run.get('path')!='.github/workflows/cytv.yml'
            or run.get('status')!='completed' or run.get('conclusion')!='success'
            or type(run.get('id')) is not int or run['id']<=0
            or type(run.get('run_attempt')) is not int or run['run_attempt']<=0
            or not re.fullmatch('[a-f0-9]{40}',run.get('head_sha',''))):
        raise ValueError('A completed successful origin release/next candidate build is required')
    if not BUILD_JOBS<={j['name'] for j in jobs if j.get('conclusion')=='success'}:
        raise ValueError('Required candidate jobs did not all succeed')
    if not re.fullmatch(r'v\d{1,4}\.\d{1,4}\.\d{1,4}',tag) or tag!='v'+versions.get('release','') or tag in published:
        raise ValueError('Exact unpublished candidate version required')
    runpy.run_path(str(ROOT/'scripts/prepare-release.py'))['validate_versions'](versions)
    return {'schema':1,'release':tag,'source':run['head_sha'],'run_id':run['id'],'attempt':run['run_attempt'],'versions':versions}

def artifact_info(artifacts,run):
    matches=[a for a in artifacts if a.get('name')=='cytv-macos-arm64']
    if len(matches)!=1:raise ValueError('Exactly one candidate CLI artifact is required')
    a=matches[0]
    if (a.get('expired') is not False or type(a.get('id')) is not int or a['id']<=0
            or type(a.get('size_in_bytes')) is not int or not 0<a['size_in_bytes']<=MAX_ARCHIVE
            or not isinstance(a.get('digest'),str) or not re.fullmatch('sha256:[a-f0-9]{64}',a['digest'])
            or a.get('workflow_run',{}).get('id')!=run['id']
            or a['workflow_run'].get('head_sha')!=run['head_sha']):
        raise ValueError('Missing, expired or unbound candidate artifact digest')
    return {'id':a['id'],'sha256':a['digest'][7:],'size':a['size_in_bytes']}

def read_cli_archive(archive,expected,target):
    archive=Path(archive)
    if archive.stat().st_size>MAX_ARCHIVE or digest(archive.read_bytes())!=expected:raise ValueError('Candidate archive digest mismatch')
    with zipfile.ZipFile(archive) as z:
        entries=z.infolist()
        if len(entries)!=1 or entries[0].filename!='cytv' or entries[0].is_dir() or stat.S_ISLNK(entries[0].external_attr>>16) or not 0<entries[0].file_size<=MAX_ARCHIVE:
            raise ValueError('Unexpected candidate CLI archive layout')
        Path(target).write_bytes(z.read(entries[0]))

def api(path,paginate=False):
    command=['gh','api','repos/'+REPO+'/'+path]
    if paginate:command+=['--paginate','--slurp']
    return json.loads(subprocess.check_output(command))

def contents(name,source):
    value=api('contents/'+name+'?ref='+source)
    if value.get('encoding')!='base64':raise ValueError('Missing committed candidate metadata')
    return json.loads(base64.b64decode(value['content'],validate=False))

def inspect_build(run_id,tag):
    run=api('actions/runs/'+str(run_id))
    jobs=[j for page in api('actions/runs/'+str(run_id)+'/jobs?filter=latest&per_page=100',True) for j in page['jobs']]
    source=run.get('head_sha','')
    if not re.fullmatch('[a-f0-9]{40}',source):raise ValueError('Invalid candidate source')
    versions=contents('release-versions.json',source)
    releases=[r for page in api('releases?per_page=100',True) for r in page]
    metadata=validate_run(run,jobs,tag,versions,[r['tag_name'] for r in releases if not r['draft']])
    if contents('release-plan.json',source).get('version')!=versions['release']:raise ValueError('Candidate plan/version mismatch')
    stable=contents('release-versions.json','main')['release']
    if tuple(map(int,versions['release'].split('.')))<=tuple(map(int,stable.split('.'))):raise ValueError('Candidate must advance the published baseline')
    artifacts=[a for page in api('actions/runs/'+str(run_id)+'/artifacts?per_page=100',True) for a in page['artifacts']]
    metadata['artifact']=artifact_info(artifacts,run)
    return metadata

def recheck(metadata):
    if inspect_build(metadata['run_id'],metadata['release'])!=metadata:raise ValueError('Candidate run, attempt or artifact changed')

def prepare(metadata,source,output):
    from PyInstaller.archive.readers import CArchiveReader
    source=Path(source).resolve(strict=True);output=Path(output).absolute()
    if subprocess.check_output(['git','rev-parse','HEAD'],cwd=source,text=True).strip()!=metadata['source'] or subprocess.check_output(['git','status','--porcelain'],cwd=source).strip():
        raise ValueError('Clean checkout of the exact build source is required')
    if (source/'updater-service/release-public.pem').read_bytes()!=(ROOT/'updater-service/release-public.pem').read_bytes():raise ValueError('Candidate release key differs from trusted signing tools')
    recheck(metadata)
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='root-candidate-',dir=output.parent) as tmp:
        tmp=Path(tmp);archive=tmp/'cli.zip'
        with archive.open('wb') as stream:subprocess.run(['gh','api','repos/'+REPO+'/actions/artifacts/'+str(metadata['artifact']['id'])+'/zip'],stdout=stream,check=True)
        if archive.stat().st_size!=metadata['artifact']['size']:raise ValueError('Candidate archive size mismatch')
        cli=tmp/'cytv';read_cli_archive(archive,metadata['artifact']['sha256'],cli)
        packaged=CArchiveReader(str(cli));entries=[(name,entry) for name,entry in packaged.toc.items() if name.replace('\\','/').startswith('payload/')]
        if not entries or len(entries)>2048 or any(entry[2]>64*1024*1024 for _,entry in entries) or sum(entry[2] for _,entry in entries)>256*1024*1024:raise ValueError('Oversized embedded candidate payload')
        payload=tmp/'payload';payload.mkdir()
        sys.path.insert(0,str(ROOT))
        from cytv.package import safe_name
        for name,_ in entries:
            relative=safe_name(name.replace('\\','/')[len('payload/'):]);target=payload/relative
            target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(packaged.extract(name))
        # Run source-dependent builders before the signing step receives its key.
        program='''import json,runpy,sys\nfrom pathlib import Path\nroot,payload,out=map(Path,sys.argv[1:4]);sys.path.insert(0,str(root))\nfrom cytv import package\npackage.verify_payload(payload)\nversions=json.loads((root/'release-versions.json').read_text())\nrunpy.run_path(str(root/'scripts/build-cytv.py'))['verify_release_versions'](payload,versions)\nbuild=runpy.run_path(str(root/'system-updater/build.py'))\nmanifest,raws=build['release_set'](payload,'root',sys.argv[4],local=False,notes=sys.argv[5])\nout.mkdir(parents=True,exist_ok=False)\n(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\\n')\nfor c in manifest['components']:(out/package.safe_name(c['url'].rsplit('/',1)[1])).write_bytes(raws[c['name']])\n'''
        notes='Unpublished Root QA only; source '+metadata['source']+'; build '+str(metadata['run_id'])+':'+str(metadata['attempt'])+'; artifact '+metadata['artifact']['sha256']+'. No stable publication or No-root approval.'
        subprocess.run([sys.executable,'-c',program,str(source),str(payload),str(output),metadata['release'],notes],check=True,cwd=source)
    manifest=json.loads((output/'manifest.json').read_text())
    metadata=dict(metadata,files={c['url'].rsplit('/',1)[1]:c['sha256'] for c in manifest['components']})
    (output/'PROVENANCE.json').write_text(json.dumps(metadata,indent=2)+'\n')
    recheck({k:v for k,v in metadata.items() if k!='files'})

def main():
    os.umask(0o077)
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('action',choices=('inspect','prepare','recheck'));p.add_argument('--run-id',type=int);p.add_argument('--tag');p.add_argument('--metadata',type=Path,required=True);p.add_argument('--source',type=Path);p.add_argument('--output',type=Path);args=p.parse_args()
    if args.action=='inspect':
        if not args.run_id or not args.tag:p.error('inspect needs --run-id and --tag')
        value=inspect_build(args.run_id,args.tag);args.metadata.parent.mkdir(parents=True,exist_ok=True);args.metadata.write_text(json.dumps(value,indent=2)+'\n')
        if os.environ.get('GITHUB_OUTPUT'):
            with open(os.environ['GITHUB_OUTPUT'],'a') as f:f.write('source='+value['source']+'\nattempt='+str(value['attempt'])+'\n')
    else:
        value=json.loads(args.metadata.read_text())
        if args.action=='recheck':recheck(value)
        else:
            if not args.source or not args.output:p.error('prepare needs --source and --output')
            prepare(value,args.source,args.output)
    print('Verified Root-only candidate inputs; no release published.')

if __name__=='__main__':main()
