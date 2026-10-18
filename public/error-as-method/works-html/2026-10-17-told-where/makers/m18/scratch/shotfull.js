const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!r.url().startsWith('file:'))errs.push('REQ '+r.url())});
await p.goto('file:///tmp/claude-0/s133/mk/m18/work/index.html');await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/claude-0/s133/mk/m18/scratch/full.png'});console.log(errs);await b.close();})();
