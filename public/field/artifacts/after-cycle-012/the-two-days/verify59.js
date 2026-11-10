// node verify59.js <abs dir of this page>   checks Figure 4 against results59.json, recomputing the pooled shares
// from the per-day rows; writes process/2.png (1100 px, light) and shot-390.png (390 px, dark)
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results59.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
const P=R.predictions;
// the data's own arithmetic, recomputed here from the day rows
const W=R.days.filter(d=>d.written),U=R.days.filter(d=>!d.written);
const sum=(a,f)=>a.reduce((s,d)=>s+f(d),0);
t(R.days.length===51&&W.length===20&&U.length===31,'51 joined days, 20 written');
t(sum(W,d=>d.comm)===P.P27.value.written.k&&sum(W,d=>d.new)===P.P27.value.written.n,'written pooled');
t(sum(U,d=>d.comm)===P.P27.value.none.k&&sum(U,d=>d.new)===P.P27.value.none.n,'none pooled');
t(Math.abs(sum(W,d=>d.comm)/sum(W,d=>d.new)-sum(U,d=>d.comm)/sum(U,d=>d.new)-P.P27.value.diff)<1e-4,'difference');
const seq=R.days.map(d=>d.written);t(1+seq.slice(1).filter((s,i)=>s!==seq[i]).length===P.P28.value.runs,'runs');
t(R.days.every((d,i)=>i===0||d.report>R.days[i-1].report),'report order');
t(R.days.filter(d=>d.written).every(d=>d.unread!==null)&&R.days.filter(d=>!d.written).every(d=>d.unread===null),'written = failure count set');
t(Object.values(P).every(x=>x.held),'five held');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const ans=await p.textContent('#ans59');
 t(ans.includes('235 of Ituri\'s 709')&&ans.includes('(33.1 %)')&&ans.includes('348 of 1,230 (28.3 %)'),'answer: pooled counts');
 t(ans.includes('+4.9 points')&&ans.includes('from −1.0 to +10.6'),'answer: difference and interval');
 t(ans.includes('17 runs where chance would give 25.31')&&ans.includes('ρ −0.13'),'answer: runs and rho');
 t(ans.includes('Five predictions, 5 held')&&ans.includes('51 of 51')&&ans.includes('49 of 51'),'answer: verdicts');
 let rd=await p.textContent('#rd59');t(rd.includes('same report day')&&rd.includes('+4.9 points'),'readout default');
 await p.click('#next');rd=await p.textContent('#rd59');t(rd.includes('next report day')&&rd.includes(`${(100*R.sensitivity_next_day.diff).toFixed(1)} points`),'readout next day');await p.click('#same');
 await p.$eval('#fail',c=>c.scrollIntoView({block:'center'}));
 const hit=await p.evaluate(()=>{const c=document.getElementById('fail'),r=c.getBoundingClientRect();for(let x=r.left;x<r.right;x+=2)for(let y=r.top;y<r.bottom;y+=4){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));const s=document.getElementById('rd59').textContent;if(/1 September \(report 110\)/.test(s))return s}return ''});
 t(/126 calls, 65 bodies swabbed, 42 written as not swabbed/.test(hit),'hover finds 1 September: '+hit.slice(0,90));
 const d110=R.days.find(d=>d.report===110);t(hit.includes(`${d110.comm} of Ituri's ${d110.new}`),'hover count = results');
 t(await p.$$eval('#pred59 tbody tr',r=>r.length)===5&&await p.$$eval('#pred59 .held',r=>r.length)===5,'five predictions shown held');
 t(await p.$$eval('#pred tbody tr',r=>r.length)===4,'study 57 table still there');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|null|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/2.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
