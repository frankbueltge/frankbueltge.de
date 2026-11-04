const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const tl=async()=>p.$$eval('.tile b',e=>e.map(x=>x.textContent));
 let v=await tl();t(v[0]==='99.0 %'&&v[2]==='43,941'&&v[1]==='2.7 %','all '+v);
 await p.click('button[data-k="return"]');v=await tl();t(v[0]==='98.1 %'&&v[2]==='21,972','return '+v);
 await p.click('button[data-k="bulk+redated"]');v=await tl();t(v[0]==='100.0 %'&&v[2]==='21,613'&&v[3]==='0','bulk '+v);
 await p.click('button[data-k="late"]');v=await tl();t(v[2]==='356','late '+v);
 await p.click('button[data-k="all"]');
 t(await p.$$eval('#pred tbody tr',r=>r.length)===6,'pred rows');
 t(await p.$$eval('#pred .held',r=>r.length)===5,'held 5');
 t(await p.$$eval('#fig rect',r=>r.length)>40,'bars drawn');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 await p.screenshot({path:process.argv[3]+`/shot-${w}.png`,fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
