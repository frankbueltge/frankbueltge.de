// Check 52's page: node verify.js <abs dir of this page>
const {chromium}=require('playwright');const R=require(process.argv[2]+'/results52.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 t((await p.textContent('#rd')).includes('Beni'),'opens on Beni');
 const st=async()=>[+(await p.$eval('#st',e=>e.dataset.m)),+(await p.$eval('#st',e=>e.dataset.n))];
 const K=R.kivu.curve,B=R.bundibugyo.curve;const at=(c,T)=>c.find(x=>x.T===T).mismatch;
 t(JSON.stringify(await st())===JSON.stringify([at(K,49),R.kivu.long]),'kivu at 49');
 await p.click('#best');t((await st())[0]===R.kivu.bestMismatch,'kivu best');
 await p.click('button[data-o="bdbv"]');await p.$eval('#T',e=>{e.value=49;e.dispatchEvent(new Event('input'))});
 t(JSON.stringify(await st())===JSON.stringify([at(B,49),R.bundibugyo.long]),'2026 at 49 exact');
 await p.$eval('#T',e=>{e.value=42;e.dispatchEvent(new Event('input'))});t((await st())[0]===at(B,42),'2026 at 42');
 await p.click('button[data-o="kivu"]');
 const txt=await p.textContent('main');
 for(const s of ['94 days','576 of 685','8,914','721','728','61 days',String(R.kivu.long)])t(txt.includes(s),'text has '+s);
 t(await p.$$eval('#pred .held',r=>r.length)===Object.values(R.predictions).filter(x=>x.held).length,'held count');
 t(await p.$$eval('#pred .failed',r=>r.length)===1,'one failed');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 await p.$eval('#T',e=>{e.value=49;e.dispatchEvent(new Event('input'))});
 await p.reload();if(w===1100){await p.setViewportSize({width:1100,height:1250});await p.screenshot({path:process.argv[2]+'/shot.png'})}
 else await p.screenshot({path:process.argv[2]+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
