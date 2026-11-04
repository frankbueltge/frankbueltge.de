// Check 51's page: node verify.js <abs dir of this page>
const {chromium}=require('playwright');const R=require(process.argv[2]+'/results51.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const st=async()=>[+(await p.$eval('#st',e=>e.dataset.b)),+(await p.$eval('#st',e=>e.dataset.h))];
 const ex=R.exploratory_42_by_day_kind;
 t(JSON.stringify(await st())===JSON.stringify([ex.calendar.broke_reaching_42,ex.calendar.held_reaching_42]),'calendar 11/11');
 await p.click('button[data-k="uwa"]');t(JSON.stringify(await st())===JSON.stringify([ex.report_days.broke_reaching_42,ex.report_days.held_reaching_42]),'report days');
 await p.click('button[data-k="w"]');t(JSON.stringify(await st())===JSON.stringify([ex.written_only.broke_reaching_42,ex.written_only.held_reaching_42]),'written only');
 await p.click('button[data-k="nuwa"]');
 const txt=await p.textContent('main');
 for(const s of [R.P1.no_report_days+'',R.P2.written.toLocaleString('en'),R.P4.dates_after_30_may+'',R.P5.agree.toLocaleString('en'),'493','146 and 147'])t(txt.includes(s),'text has '+s);
 t(await p.$$eval('#pred .held',r=>r.length)===5,'5 held as worded');
 const bx=await p.$eval('#cv',e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});
 await p.mouse.move(bx[0]+bx[2]*0.5,bx[1]+40);t((await p.textContent('#rd')).includes('quiet from'),'readout on hover');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 if(w===1100){await p.mouse.move(0,0);await p.setViewportSize({width:1100,height:1450});await p.screenshot({path:process.argv[2]+'/shot.png'})}
 else await p.screenshot({path:process.argv[2]+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
