const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s128/mk/m03/work/index.html');await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/claude-0/s128/mk/m03/scratch/shot.png'});
const logs=[];await b.close();})();
