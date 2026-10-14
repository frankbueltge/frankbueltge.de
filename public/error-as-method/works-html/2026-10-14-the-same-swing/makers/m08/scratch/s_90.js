const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s124/mk/m08/scratch/p_90.html');await p.screenshot({path:'/tmp/claude-0/s124/mk/m08/scratch/shot_90.png'});
const reqs=[];await b.close();})();
