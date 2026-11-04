// Check 50's page: node verify.js <abs dir of this page> <abs dir for screenshots>
const {chromium}=require('playwright');const R=require(process.argv[2]+'/results50.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const set=async(id,v)=>p.$eval('#'+id,(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'))},v);
 const ds=d=>Math.round((Date.parse(d)-Date.parse('2026-05-14'))/864e5);
 await set('day',ds('2026-05-26'));t(+(await p.$eval('#cread',e=>e.dataset.sc))===1077,'sc peak');
 await set('day',ds('2026-08-04'));t(+(await p.$eval('#cread',e=>e.dataset.sc))===270,'sc last');
 await set('day',ds('2026-08-05'));t((await p.$eval('#cread',e=>e.dataset.sc))==='','sc stops');
 await set('day',ds('2026-07-11'));t(+(await p.$eval('#cread',e=>e.dataset.sd))===91,'sd last');
 await set('day',168);t((await p.textContent('#cread')).includes('10,351'),'cc final');
 for(const [k,v] of [[42,R.explore_quiet.quiet_ge_42],[21,R.explore_quiet.quiet_ge_21],[1,68-R.explore_quiet.quiet_0]]){await set('q',k);t(+(await p.$eval('#zread',e=>e.dataset.quiet))===v,`quiet ${k}`)}
 t(await p.$$eval('#pred .held',r=>r.length)===4,'held 4');t(await p.$$eval('#pred .failed',r=>r.length)===1,'failed 1');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 await set('q',42);await set('day',ds('2026-07-01'));
 await p.screenshot({path:process.argv[3]+`/shot-${w}.png`,fullPage:w===390});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
