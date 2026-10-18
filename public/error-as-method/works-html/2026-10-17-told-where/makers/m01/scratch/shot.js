const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s133/mk/m01/work/index.html');await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/claude-0/s133/mk/m01/scratch/shot.png'});await b.close();})();
