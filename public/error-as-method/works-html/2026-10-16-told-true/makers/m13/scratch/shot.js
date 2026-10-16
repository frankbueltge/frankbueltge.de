const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800},deviceScaleFactor:2});
const reqs=[];p.on('request',r=>reqs.push(r.url().slice(0,60)));p.on('console',m=>console.log('console',m.text()));p.on('pageerror',e=>console.log('err',e.message));
await p.goto('file:///tmp/claude-0/s130/mk/m13/work/index.html');await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/claude-0/s130/mk/m13/scratch/shot.png'});console.log(reqs);await b.close();})();
