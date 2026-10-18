const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s135/mk/m06/work/index.html');await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/claude-0/s135/mk/m06/scratch/shot.png'});await b.close();})();
