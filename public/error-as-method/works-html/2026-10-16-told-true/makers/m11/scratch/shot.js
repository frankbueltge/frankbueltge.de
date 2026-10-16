const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('console',m=>errs.push(m.text()));p.on('pageerror',e=>errs.push(e.message));
p.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))errs.push('REQ '+r.url())});
await p.goto('file:///tmp/claude-0/s130/mk/m11/work/index.html');await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/claude-0/s130/mk/m11/scratch/shot.png'});console.log(errs);await b.close();})();
