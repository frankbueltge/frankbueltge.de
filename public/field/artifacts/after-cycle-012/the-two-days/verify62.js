// node verify62.js <abs dir of this page>   checks Figure 7 against results62.json; writes process/5.png (1100 px, light) and shot-390.png
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results62.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
const P=R.predictions, A=R.studio_day.answer, I=R.studio_day.ituri;
t(R.reports===80&&R.pairs===62,'80 reports, 62 pairs');
t(['P39','P41','P42','P43'].every(k=>P[k].held)&&!P.P40.held,'four held, P40 failed');
// recompute the Studio's day from the per-report Ituri rows
t(I[1].row.dth-I[0].row.dth===19&&I[1].row.comm+I[1].row.cte===19,'30 Oct: row step 19 = 12 + 7');
t(I[1].zones.comm===13&&I[1].zones.cte===8,'30 Oct: zones print 13 + 8');
t((I[1].zones.dth+I[1].vent)-(I[0].zones.dth+I[0].vent)===18,'30 Oct: zones step 18');
t(I[2].row.dth===I[2].zones.dth+I[2].vent&&I[2].row.dth===3483,'31 Oct: the two agree at 3,483');
t(R.studio_day.zones_169.reduce((a,z)=>a+z.step,0)===18,'zone steps sum to 18');
t(P.P42.first_run.share<P.P42.value.share,'both P42 runs recorded');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const ans=await p.textContent('#ans62');
 t(ans.includes('from 3,436 on 29 October to 3,455 on 30 October: a step of 19, exactly the row\'s 12 community and 7'),'answer: step');
 t(ans.includes('add up to 21 (13 and 8)')&&ans.includes('printed totals to 30'),'answer: zones');
 t(ans.includes('moved by 18 that day')&&ans.includes('moved by 29 against the row\'s 28')&&ans.includes('agree again at 3,483'),'answer: zone cumulatives');
 t(ans.includes('98.8 % of the time (405 of 410)')&&ans.includes('Ituri by 77 for a day of 37'),'answer: provinces');
 t(ans.includes('96.7 % of the time (722 of 747')&&ans.includes('in 17 of 25; 10 of the 25 breaks fall on 17 August'),'answer: zones share');
 t(ans.includes('Five predictions, 4 held'),'answer: tally');
 await p.$eval('#steps',c=>c.scrollIntoView({block:'center'}));
 const hits=await p.evaluate(()=>{const c=document.getElementById('steps'),r=c.getBoundingClientRect(),out={};for(let x=r.left+1;x<r.right;x+=1){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+r.height/2,bubbles:true}));const s=document.getElementById('rd62').textContent;const m=s.match(/\(report (\d+),/);if(m)out[m[1]]=s}return out});
 t(Object.keys(hits).length===62,'every pair reachable at '+w+': '+Object.keys(hits).length);
 t(/Mongbwalu \(Ituri\): cumulative \+0, day printed 10/.test(hits['169']||'')&&/its zones together \+18/.test(hits['169']||''),'169 readout');
 t(/Ituri, cumulative \+77 for a day of 37/.test(hits['94']||''),'94 readout');
 t(/Every zone steps by its printed day/.test(hits['150']||''),'150 readout');
 t(await p.$$eval('#pred62 tbody tr',r=>r.length)===5&&await p.$$eval('#pred62 .held',r=>r.length)===4,'five predictions, four shown held');
 t(await p.$$eval('#pred61 tbody tr',r=>r.length)===4,'study 61 table still there');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/5.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
