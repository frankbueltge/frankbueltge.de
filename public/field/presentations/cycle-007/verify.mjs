// Renders index.html in a real browser at 390 px light and 1100 px dark; clicks every control; reports errors and overflow.
// Usage: node verify.mjs <this dir> [screenshot dir]   (needs Playwright)
import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const out=[];
for (const [w,scheme] of [[390,'light'],[1100,'dark']]) {
  const p = await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.argv[2]+'/index.html'); await p.waitForTimeout(400);
  const steps = await p.$$('#steps button'); for (const s of steps) await s.click();
  const fun = await p.evaluate(()=>document.getElementById('funtxt').innerText);
  const d0 = await p.evaluate(()=>document.getElementById('dv').innerText); await p.click('#avail');
  const d1 = await p.evaluate(()=>document.getElementById('dv').innerText);
  const evs = await p.$$('#evs button'); for (const e of evs) await e.click();
  const ev = await p.evaluate(()=>document.getElementById('evd').innerText.slice(0,120));
  const sq = await p.evaluate(()=>document.querySelectorAll('#ai2 rect').length);
  const sw = await p.evaluate(()=>document.documentElement.scrollWidth);
  await p.screenshot({path:`${process.argv[3]||'.'}/c7-${w}.png`,fullPage:true});
  out.push({w,scheme,errs,overflow:sw>w,steps:steps.length,events:evs.length,squares:sq,fun,dice:[d0,d1],ev});
}
console.log(JSON.stringify(out,null,1)); await b.close();
