const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
  const pg=await b.newPage({viewport:{width:1100,height:800}});
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>errs.push(m.text()));
  pg.on('request',r=>{ if(!r.url().startsWith('file:')&&!r.url().startsWith('data:')) errs.push('NET '+r.url())});
  await pg.goto('file://'+process.argv[2]); await pg.waitForTimeout(300);
  await pg.screenshot({path:process.argv[3]}); console.log(errs.join('\n')||'ok'); await b.close();
})();
