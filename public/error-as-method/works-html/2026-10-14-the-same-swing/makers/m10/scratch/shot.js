const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(!r.url().startsWith('file:'))errs.push('REQ '+r.url())});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(500);await p.screenshot({path:process.argv[3]});console.log(errs);await b.close();})();
