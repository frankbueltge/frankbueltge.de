const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('requestfailed',r=>errs.push('REQ '+r.url()));p.on('request',r=>{if(!r.url().startsWith('file:'))errs.push('NET '+r.url())});
await p.goto('file:///tmp/claude-0/s121/mk/m06/work/index.html');await p.waitForTimeout(800);
await p.screenshot({path:process.argv[2]||'/tmp/claude-0/s121/mk/m06/scratch/shot.png'});console.log(errs.join('\n')||'ok');await b.close();})();
