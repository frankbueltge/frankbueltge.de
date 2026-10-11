// Renders index.html in a real browser at two widths and schemes; reports errors, overflow and live numbers.
import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
const out=[];
for (const [w,scheme] of [[390,'light'],[1100,'dark']]) {
  const p = await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.argv[2]+'/index.html'); await p.waitForTimeout(600);
  const sw = await p.evaluate(()=>document.documentElement.scrollWidth);
  const rows = await p.evaluate(()=>document.querySelectorAll('#chart .row').length);
  const stat = await p.evaluate(()=>document.getElementById('stats').innerText.replace(/\s+/g,' '));
  await p.screenshot({path:`${process.argv[3]||'.'}/s9-${w}.png`,fullPage:true});
  await p.check('#same'); await p.waitForTimeout(100);
  const same = await p.evaluate(()=>document.getElementById('stats').innerText.replace(/\s+/g,' '));
  await p.uncheck('#same'); await p.check('#unchk'); await p.waitForTimeout(100);
  const unchk = await p.evaluate(()=>[document.querySelectorAll('#chart .row').length, document.getElementById('stats').innerText.replace(/\s+/g,' ')]);
  out.push({w,scheme,errs,overflow:sw>w,rows,stat,same,unchk});
}
console.log(JSON.stringify(out,null,1)); await b.close();
