'use strict';
// Packaged next to the descriptor and the toolkit's existing bounded LAN transport.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,policy=require('./theme-policy.cjs');
const manifest=policy.validateManifest(JSON.parse(fs.readFileSync(path.join(root,'cytv-theme.json'),'utf8')));
function read(file){
 const target=fs.realpathSync(path.join(root,file.path));
 if(!target.startsWith(root+path.sep))throw Error('Package file leaves its directory');
 const bytes=fs.readFileSync(target);
 if(bytes.length!==file.size||crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Package integrity failed: '+file.path);
 return bytes;
}
const output={manifest,rules:policy.validateRules(JSON.parse(read(manifest.rules))),assets:manifest.assets.map(a=>({...a,data:read(a)})),documents:manifest.documents.map(a=>({...a,data:read(a)}))};
if(process.argv.includes('--check'))console.log('PASS theme descriptor, rules and all asset/document hashes');
else require('./lan-share.cjs').start(output).then(session=>{
 console.log('TV → Settings → Themes → From computer');
 console.log('Computer: '+(session.addresses.join(' or ')||'No private IPv4 network found')+' · PIN: '+session.pin);
 console.log('Expires in 10 minutes. Ctrl+C stops sharing. This does not change or install anything on the TV automatically.');
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>session.stop());
}).catch(error=>{console.error(error.message);process.exitCode=1;});
