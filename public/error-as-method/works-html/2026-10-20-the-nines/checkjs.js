const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const orig=fs.readFileSync(process.argv[2],'utf8');
for(const f of process.argv.slice(3)){const ctx={window:{}};ctx.self=ctx.window;ctx.globalThis=ctx;vm.createContext(ctx);
 try{vm.runInContext(fs.readFileSync(f,'utf8'),ctx);}catch(e){console.log(f,'ERR',e.message);continue;}
 const strs=[...Object.values(ctx),...Object.values(ctx.window)].filter(v=>typeof v==='string');
 const same=strs.some(s=>s===orig); const trim=strs.some(s=>s.trim()===orig.trim());
 console.log(f.split('/').slice(-3).join('/'),fs.statSync(f).size,'identical:',same,'identical-after-trim:',trim);}
