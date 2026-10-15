const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const reqs=[];p.on('request',r=>reqs.push(r.url()));
await p.goto('file:///tmp/claude-0/s122/mk/m09/work/index.html');await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/claude-0/s122/mk/m09/scratch/shot.png'});console.log(reqs);await b.close();})();
