const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///tmp/claude-0/s121/mk/m12/work/index.html');await p.screenshot({path:'/tmp/claude-0/s121/mk/m12/scratch/shot.png'});await b.close();})();
