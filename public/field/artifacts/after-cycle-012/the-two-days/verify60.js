// node verify60.js <abs dir of this page>   checks Figure 5 against results60.json; writes process/3.png (1100 px, light) and shot-390.png (390 px, dark)
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results60.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
const rep=R.reports, pres=rep.filter(r=>r.present), Q=R.post_hoc;
t(rep.length===67&&pres.length===60,'67 reports, 60 present');
t(JSON.stringify(R.input.absent)==='[158,159,160,161,162,163,172]','absent list');
const mk=r=>r.creator.replace('Microsoft® Word','').replace(/ /g,' ').trim();
t(pres.filter(r=>r.report<=157&&mk(r)==='2016').length===0&&pres.filter(r=>r.report>=164&&mk(r)==='2016').length===8,'Word 2016 0 before, 8 after (recomputed)');
t(pres.filter(r=>r.report>=164).every(r=>r.sans_echec===0),'no sans échec after hole (recomputed)');
t(pres.filter(r=>r.report>=165).every(r=>r.ituri.class==='B'),'Ituri B after hole');
t(R.descriptive.studio_quotes_found[0]===R.descriptive.studio_quotes_found[1],'every quote found');
t(Object.values(R.predictions).filter(x=>x.held).length===3,'three held');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const ans=await p.textContent('#ans60');
 t(ans.includes('report 157 (18 October)')&&ans.includes('158 to 163'),'answer: last day and hole');
 t(ans.includes('in 8 of 10 reports after the hole and 0 of 50 before it'),'answer: make');
 t(ans.includes('Ituri in 9 of 9')&&ans.includes('North Kivu in 8 of 9')&&ans.includes('Ituri 12 of 13, North Kivu 8 of 10'),'answer: templates');
 t(ans.includes('Six predictions, 3 held')&&ans.includes('12 of 59 times'),'answer: verdicts and make changes');
 await p.$eval('#fmt',c=>c.scrollIntoView({block:'center'}));
 const hits=await p.evaluate(()=>{const c=document.getElementById('fmt'),r=c.getBoundingClientRect(),out={};for(let x=r.left+1;x<r.right;x+=1){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+r.height/2,bubbles:true}));const s=document.getElementById('rd60').textContent;const m=s.match(/report (\d+)/i);if(m)out[m[1]]=s}return out});
 t(Object.keys(hits).length===67,'every report reachable by pointer at '+w+': '+Object.keys(hits).length);
 t(/made with Word 2021/.test(hits['157']||'')&&/writes no failure/.test(hits['157']||''),'157 readout');
 t(/not in the archive/.test(hits['160']||''),'160 readout');
 t(/made with Word 2016/.test(hits['165']||'')&&/59 EDS réalisés sur 108 alertes/.test(hits['165']||''),'165 readout');
 t(await p.$$eval('#pred60 tbody tr',r=>r.length)===6&&await p.$$eval('#pred60 .held',r=>r.length)===3,'six predictions, three shown held');
 t(await p.$$eval('#pred59 tbody tr',r=>r.length)===5,'study 59 table still there');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/3.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
