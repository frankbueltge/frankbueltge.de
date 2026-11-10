// node verify57.js <abs dir of this page>   checks the page against results57.json; writes process/1.png and shot-390.png
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results57.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
// the data's own arithmetic
const S=['2026-07-30','2026-08-31'];
t(R.days.length===80&&R.days.reduce((s,d)=>s+d.k,0)===1921&&R.days.reduce((s,d)=>s+d.n,0)===5966,'series = study 55');
for(const s of S){const d=R.days.find(x=>x.date===s);t(d.zones.reduce((a,z)=>a+z.new,0)===d.n&&d.zones.reduce((a,z)=>a+z.comm,0)===d.k,'zones sum '+s);
 t(d.k2===d.k-d.top.comm&&d.n2===d.n-d.top.new,'drop arithmetic '+s)}
t(R.correction54.study55_corrected.outside.map(x=>x.date).join()===S.join(),'corrected: same two days outside');
t(R.headers.byDay.filter(x=>x.cls==='reworded').map(x=>x.date).join()==='2026-08-17','one reworded day');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const ans=await p.textContent('#ans');const a=R.predictions.P21.value[S[0]],c=R.predictions.P21.value[S[1]];
 t(ans.includes(a.top.new+' of the 73 new cases were in Bunia'),'answer: Bunia');
 t(ans.includes('('+Math.round(100*c.topShare)+' %)')&&ans.includes('Katwa, Komanda, Butembo'),'answer: 31 Aug zones');
 t(ans.includes('Four predictions, 4 held')&&ans.includes('32.3 %'),'answer: verdicts and corrected share');
 let rd=await p.textContent('#rd');t(rd.includes('2 of 80 report days outside')&&rd.includes('30 July and 31 August'),'figure 1 all zones');
 await p.click('#drop');rd=await p.textContent('#rd');t(rd.includes('0 of 80 days outside'),'figure 1 drop mode');await p.click('#all');
 let rd2=await p.textContent('#rd2');t(rd2.includes('30 July (report 77): 11 of 73')&&rd2.includes('7 of 41'),'figure 2 opens on 30 July');
 // point at 31 Aug in figure 1
 await p.$eval('#fun',c=>c.scrollIntoView({block:'center'}));
 const hit=await p.evaluate(()=>{const c=document.getElementById('fun'),r=c.getBoundingClientRect();for(let x=r.left;x<r.right;x+=2)for(let y=r.top;y<r.top+r.height*.5;y+=3){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));if(/31 August \(report 109\)/.test(document.getElementById('rd2').textContent))return true}return false});
 t(hit,'figure 1 opens 31 August');
 rd2=await p.textContent('#rd2');t(rd2.includes('43 of 86')&&rd2.includes('Katwa, 10 of 14'),'figure 2 on 31 August');
 t((await p.textContent('#rd3')).includes('30 July (report 77): the main wording'),'figure 3 names 30 July');
 const h17=await p.evaluate(()=>{const c=document.getElementById('hdr'),r=c.getBoundingClientRect();for(let x=r.left+1;x<r.right;x+=1){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+40,bubbles:true}));if(/17 August/.test(document.getElementById('rd3').textContent))return document.getElementById('rd3').textContent}return ''});
 t(/reworded/.test(h17),'figure 3 finds 17 August reworded');
 t(await p.$$eval('#pred tbody tr',r=>r.length)===4,'four predictions');
 t(await p.$$eval('#pred .failed',r=>r.length)===0&&await p.$$eval('#pred .uninf',r=>r.length)===1,'verdict classes');
 t((await p.textContent('#corr')).includes('1,888 of 5,850')&&(await p.textContent('#corr')).includes('17 of 56'),'correction box');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|null|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/1.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
