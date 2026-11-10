// node verify63.js <abs dir of this page>   checks Figure 3 (study 63) against results63.json; writes process/3.png only
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results63.json');
global.window={};require(dir+'/data63.js');const C=window.DATA63.curves;const at=(k,d)=>C[k][d-1];
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
t(at('kivu|90|carried',42).k===28&&at('kivu|90|carried',42).n===60,'The Edge day 42: 28 of 60');
t(at('kivu|90|carried',63).k===19&&at('kivu|90|carried',63).n===50,'The Edge day 63: 19 of 50');
t(R.summary.firstBelow10['kivu|90|out']===114&&R.summary.firstBelow10['kivu|42|out']===97,'below 10 %: 114 and 97');
t(Object.values(R.predictions).filter(p=>p.held).length===4,'4 of 5 held');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const a=await p.textContent('#ans63');
 t(a.includes('28 of 60 at day 42 (47 %)')&&a.includes('19 of 50 at day 63 (38 %)'),'answer: The Edge reproduced');
 t(a.includes('18 of 53 (34 %) within 42 days, and 21 of 51 (41 %) within 90'),'answer: day 60 both windows');
 t(a.includes('22 broke within 90 days against 18 within 42'),'answer: same 53 quiets');
 t(a.includes('In Congo 2026, 2 quiets'),'answer: 2026 cannot answer');
 let rd=await p.textContent('#rd63');t(rd.includes('day 63')&&rd.includes('15 of 50 broke within 42')&&rd.includes('18 of 48 broke within 90'),'readout opens at day 63');
 await p.click('button[data-w63="carried"]');rd=await p.textContent('#rd63');t(rd.includes('19 of 50 broke within 90'),'carried at 63');
 await p.click('button[data-r63="2026"]');rd=await p.textContent('#rd63');t(rd.startsWith('Congo 2026'),'2026 switch');
 await p.click('button[data-r63="kivu"]');await p.click('button[data-w63="out"]');
 await p.$eval('#win',c=>c.scrollIntoView({block:'center'}));
 const got=await p.evaluate(()=>{const c=document.getElementById('win'),r=c.getBoundingClientRect();
   for(let x=r.left+40;x<r.right;x+=1){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:r.top+100,bubbles:true}));if(/day 60,/.test(document.getElementById('rd63').textContent))return document.getElementById('rd63').textContent}return ''});
 t(got.includes('18 of 53 broke within 42')&&got.includes('21 of 51 broke within 90'),'pointer reads day 60');
 t(await p.$$eval('#pred63 tbody tr',r=>r.length)===5&&await p.$$eval('#pred63 .failed',r=>r.length)===1,'five predictions, one failed');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|Infinity/.test(main),'no empty value');
 if(w===1100){await p.reload();await p.$eval('#win',c=>c.scrollIntoView({block:'start'}));await p.evaluate(()=>scrollBy(0,-260));
   await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/3.png',fullPage:true});await p.setViewportSize({width:1100,height:900});await p.$eval('#win',c=>c.scrollIntoView({block:'start'}));await p.evaluate(()=>scrollBy(0,-300));await p.screenshot({path:'/tmp/claude-0/-home-user-field-research/5f5bd472-bef5-572d-83ff-c81e83db1d10/scratchpad/fig3.png'});}
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
