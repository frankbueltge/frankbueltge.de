const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const reqs=[];p.on('request',r=>reqs.push(r.url()));
await p.goto('file:///tmp/claude-0/s133/mk/m13/work/index.html');await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/claude-0/s133/mk/m13/scratch/shot.png'});console.log(reqs);await b.close();})();
