const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s123/mk/m12/work/index.html');await p.screenshot({path:'/tmp/claude-0/s123/mk/m12/scratch/shot.png'});await b.close();})();
