const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1100,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('requestfailed',r=>errs.push('REQ '+r.url()));
  await p.goto('file:///tmp/claude-0/s128/mk/m12/work/index.html'); await p.waitForTimeout(800);
  await p.screenshot({path:'/tmp/claude-0/s128/mk/m12/scratch/shot.png'}); console.log(errs, await p.evaluate(()=>window.__z)); await b.close();
})();
