const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!r.url().startsWith('file:'))errs.push('REQ '+r.url())});
await p.goto('file:///tmp/claude-0/s128/mk/m11/work/index.html');await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/claude-0/s128/mk/m11/scratch/shot.png'});console.log('errors',errs);await b.close();})();
