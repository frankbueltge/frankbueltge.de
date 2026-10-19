const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const req=[];p.on('request',r=>req.push(r.url()));
await p.goto('file:///tmp/claude-0/s137/mk/m09/work/index.html');await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/claude-0/s137/mk/m09/scratch/shot.png'});console.log(req);await b.close();})();
