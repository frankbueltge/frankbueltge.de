const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const tiles=async()=>p.$$eval('.tile b',e=>e.map(x=>+x.textContent));
 t(JSON.stringify(await tiles())==='[5,0,39,11]','default '+await tiles());
 await p.click('button[data-v="loose"]');t(JSON.stringify(await tiles())==='[8,0,36,11]','loose '+await tiles());
 await p.click('button[data-v="exact"]');
 for(const v of ['0','0.1']){await p.click(`button[data-k="tol"][data-v="${v}"]`);t((await tiles())[0]===5,'tol '+v);}
 await p.click('button[data-k="tol"][data-v="0.05"]');
 await p.click('button[data-k="y26"][data-v="0"]');t((await tiles())[0]===5,'no2026');
 await p.click('button[data-k="y26"][data-v="1"]');
 t(await p.$$eval('#pred tbody tr',r=>r.length)===5,'pred rows');
 t(await p.$$eval('#pred .held',r=>r.length)===3,'held 3');
 const sw=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);t(sw,'no side scroll at '+w);
 await p.screenshot({path:process.argv[3]+`/shot-${w}.png`,fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
