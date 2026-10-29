'use strict';
// Build with the separately maintained toolkit; never fetch or execute a theme repository.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return path.resolve(i<0?fallback:args[i+1]);}
const toolkit=option('--toolkit',path.join(root,'../clean-your-tv-lg-theme'));
const runtime=option('--runtime',path.join(root,'build/itachi-css-runtime'));
const out=option('--out',path.join(root,'build/itachi-theme-1.0.0'));
(async()=>{
 const tools=require(path.join(toolkit,'lib/toolkit.cjs')),rt=tools.runtime(runtime);
 const commit=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 await tools.build(path.join(root,'themes/itachi'),rt,{out,repository:'https://github.com/Razdva122/clean-your-tv-lg-webos',commit});
 for(const [source,target] of [[path.join(toolkit,'lib/lan-share.cjs'),'lan-share.cjs'],[path.join(root,'launcher/theme-policy.js'),'theme-policy.cjs'],[path.join(root,'scripts/theme-package-share.cjs'),'share.cjs'],[path.join(root,'themes/itachi/README.md'),'README.md'],[path.join(root,'LICENSE'),'TOOLING-LICENSE.txt']])fs.copyFileSync(source,path.join(out,target));
 fs.writeFileSync(path.join(out,'share.command'),'#!/bin/sh\ncd "$(dirname "$0")" || exit 1\nexec node share.cjs\n',{mode:0o755});
 fs.writeFileSync(path.join(out,'share.cmd'),'@echo off\r\nnode "%~dp0share.cjs"\r\npause\r\n');
 cp.execFileSync(process.execPath,[path.join(out,'share.cjs'),'--check'],{stdio:'inherit'});
 console.log(out);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
