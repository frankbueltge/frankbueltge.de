const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const p=await b.newPage({viewport:{width:1100,height:800}});
 const errs=[];p.on('console',m=>errs.push(m.text()));p.on('pageerror',e=>errs.push(String(e)));
 const reqs=[];p.on('request',r=>reqs.push(r.url()));
 await p.goto('file://'+process.argv[2]);await p.waitForTimeout(500);
 await p.screenshot({path:process.argv[3]});
 console.log('errors',errs,'requests',reqs);await b.close();})();
