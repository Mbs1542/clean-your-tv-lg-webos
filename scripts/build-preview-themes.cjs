#!/usr/bin/env node
'use strict';
// Browser preview only: reuse reviewed data and the ordinary theme envelope validator.
const fs=require('node:fs'),path=require('node:path');
const {loadRegistry,readLocal}=require('./check-theme-submissions.cjs');
const root=path.resolve(__dirname,'../showcase');
const entries=loadRegistry(root).filter(e=>!e.record.availability);
const themes=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../launcher/theme-catalog.json'))).themes;
const packages={};
for(const {record,base,files} of entries){
 packages[record.id]={schemaVersion:1,descriptor:readLocal(root,base+'cytv-theme.json',65536).toString('base64'),files:{}};
 for(const file of files.filter(f=>f!=='cytv-theme.json'))packages[record.id].files[file]=readLocal(root,base+file,6291456).toString('base64');
}
if(themes.some(t=>!t.builtin&&!packages[t.id]))throw Error('Preview catalog has no reviewed package');
process.stdout.write(JSON.stringify({themes,packages}));
