"""Use the verified bundled runtime's permission code without replacing retained code."""
import ast
import hashlib
import json
from pathlib import Path


def program(bundle, enable=True, repair=False):
    bundle=Path(bundle)
    manifest=json.loads((bundle/'bundle.json').read_bytes())
    source=bundle/'runtime/cli.py'
    if source.is_symlink() or hashlib.sha256(source.read_bytes()).hexdigest()!=manifest.get('files',{}).get('runtime/cli.py'):
        raise ValueError('Firmware permission source integrity mismatch')
    raw=source.read_text();tree=ast.parse(raw)
    functions=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='firmware_access']
    if len(functions)!=1 or type(enable) is not bool or type(repair) is not bool or repair and not enable:raise ValueError('Unsupported firmware permission source')
    if repair:
        repairs=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='repair_sdk_permissions']
        if len(repairs)!=1:raise ValueError('Package repair source unavailable')
        modules={'updater.store':'updater/store.py','updater.package':'updater/package.py','package_data':'package_data.py','installation':'installation.py','package_identity':'package_identity.py'}
        sources={}
        for name,relative in modules.items():
            path=bundle/relative;value=path.read_bytes()
            if path.is_symlink() or hashlib.sha256(value).hexdigest()!=manifest.get('files',{}).get(relative):raise ValueError('Package repair dependency integrity mismatch')
            sources[name]=value.decode()
        prefix="import sys,types\nupdater=types.ModuleType('updater');updater.__path__=[];sys.modules['updater']=updater\n"
        for name,value in sources.items():
            prefix+='module=types.ModuleType('+repr(name)+');sys.modules['+repr(name)+']=module;exec(compile('+repr(value)+', '+repr('<verified '+name+'>')+", 'exec'),module.__dict__)\n"
        return prefix+ast.get_source_segment(raw,repairs[0])+'\n'+ast.get_source_segment(raw,functions[0])+"\nimport json\nprint(json.dumps(firmware_access(repair=lambda version:repair_sdk_permissions(version=version))))\n"
    return ast.get_source_segment(raw,functions[0])+'\nimport json\nprint(json.dumps(firmware_access(enable='+repr(enable)+')))\n'
