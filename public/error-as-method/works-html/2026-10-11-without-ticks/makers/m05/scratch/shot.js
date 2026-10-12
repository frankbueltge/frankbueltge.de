const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('request',r=>{if(!r.url().startsWith('file:'))errs.push('REQ '+r.url())});
await p.goto('file:///tmp/claude-0/s121/mk/m05/work/index.html');await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/claude-0/s121/mk/m05/scratch/shot.png'});console.log(errs);await b.close();})();
