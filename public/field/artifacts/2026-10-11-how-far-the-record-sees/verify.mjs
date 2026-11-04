import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const out=[];
for (const [w,scheme] of [[390,'light'],[1100,'dark']]) {
  const p = await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.argv[2]+'/index.html'); await p.waitForTimeout(800);
  const sw = await p.evaluate(()=>document.documentElement.scrollWidth);
  const pred = await p.evaluate(()=>document.querySelectorAll('#pred tr').length);
  const ph = await p.evaluate(()=>document.getElementById('ph').textContent.slice(0,80));
  await p.click('[data-w="sec"]'); await p.waitForTimeout(300);
  await p.screenshot({path:`/tmp/claude-0/shot-${w}.png`,fullPage:true});
  out.push({w,scheme,errs,overflow:sw>w,pred,ph});
}
console.log(JSON.stringify(out,null,1)); await b.close();
