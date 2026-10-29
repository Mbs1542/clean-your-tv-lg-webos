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
 await tools.build(path.join(root,'themes/itachi'),rt,{out,repository:'https://github.com/razdva122/clean-your-tv-lg-webos',commit});
 fs.copyFileSync(path.join(root,'themes/itachi/README.md'),path.join(out,'README.md'));
 console.log(out);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
