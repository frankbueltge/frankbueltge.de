// node verify61.js <abs dir of this page>   checks Figure 6 against results61.json; writes process/4.png (1100 px, light) only
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results61.json');const R59=require(dir+'/results59.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
const P=R.predictions, rep=R.reports;
t(rep.length===80,'80 report days');
t(Object.values(P).every(p=>p.held),'four held');
// recompute from the per-report rows
const inv=rep.reduce((a,r)=>a+r.invalid.length,0);
t(inv===Object.values(R.invalid_by_reason).reduce((a,b)=>a+b,0),'rejections add up: '+inv);
const r169=rep.find(r=>r.report===169), r145=rep.find(r=>r.report===145);
t(r169.invalid.filter(v=>v.prov==='ituri').length===7,'seven Ituri rows rejected on 30 Oct');
const j169=R59.days.find(d=>d.report===169);
t(j169.new+r169.invalid.filter(v=>v.prov==='ituri').reduce((a,v)=>a+v.cells[0],0)===34,'21 + rejected new = 34');
t(j169.comm+r169.invalid.filter(v=>v.prov==='ituri').reduce((a,v)=>a+v.cells[1],0)===13,'7 + rejected community = 13');
t(r145.lone.length===1&&r145.lone[0].after==='Adja'&&r145.lone[0].value===1,'Adja lone cell');
t(R.post_hoc.same_as_previous_report===6&&R.post_hoc.rows.filter(x=>x.report===169).length===8,'6 of 8 previous-day rates');
t(Math.abs(P.P35.value.move)<0.01,'study 59 moves < 1 point');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const ans=await p.textContent('#ans61');
 t(ans.includes('sum to 33 new cases and 10 community deaths'),'answer: 6 Oct');
 t(ans.includes('sum to 34 and 13')&&ans.includes('says 34 and 12'),'answer: 30 Oct');
 t(ans.includes('rejected 8 rows in Ituri and North Kivu on that ground alone, and 6 of them'),'answer: stale rate');
 t(ans.includes('+4.7 points (95 % interval −1.2 to +10.5)')&&ans.includes('against +4.9 (−1.0 to +10.6)'),'answer: study 59');
 t(ans.includes('15 of 4,753 zone rows')&&ans.includes('8 of Ituri'),'answer: counts');
 t(ans.includes('32.20 % to 32.21 %')&&ans.includes('Four predictions, 4 held'),'answer: series');
 await p.$eval('#thrown',c=>c.scrollIntoView({block:'center'}));
 const hits=await p.evaluate(()=>{const c=document.getElementById('thrown'),r=c.getBoundingClientRect(),out={};for(let x=r.left+1;x<r.right;x+=1){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+r.height/2,bubbles:true}));const s=document.getElementById('rd61').textContent;const m=s.match(/\(report (\d+)\)/);if(m)out[m[1]]=s}return out});
 t(Object.keys(hits).length===80,'every day reachable at '+w+': '+Object.keys(hits).length);
 t(/beneath Adja's row carries 1 and 0/.test(hits['145']||''),'145 readout');
 t(/Lita \(Ituri\): new 1, community 1/.test(hits['169']||'')&&/Mongbwalu.*total 10.*total does not add up/.test(hits['169']||'')&&/sum to 34 new and 13 community/.test(hits['169']||''),'169 readout');
 t(/Nothing thrown away/.test(hits['150']||''),'150 readout');
 t(await p.$$eval('#pred61 tbody tr',r=>r.length)===4&&await p.$$eval('#pred61 .held',r=>r.length)===4,'four predictions shown held');
 t(await p.$$eval('#pred59 tbody s',r=>r.length)===1,'P31 note struck');
 t(await p.$$eval('#pred60 tbody tr',r=>r.length)===6,'study 60 table still there');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/4.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
