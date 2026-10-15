const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>errs.push(m.text()));
await p.goto('file:///tmp/claude-0/s128/mk/m10/scratch/test.html');await p.waitForTimeout(500);
await p.screenshot({path:__dirname+'/shot.png'});console.log('errs',errs);await b.close();})().catch(e=>{console.error(e.message);process.exit(1)});
