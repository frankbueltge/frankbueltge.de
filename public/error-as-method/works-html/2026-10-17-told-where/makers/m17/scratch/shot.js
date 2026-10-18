const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
p.on('request',r=>{if(!r.url().startsWith('file:'))console.log('REQ',r.url())});
await p.goto('file:///tmp/claude-0/s133/mk/m17/work/index.html');await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/claude-0/s133/mk/m17/scratch/shot.png'});await b.close();})();
