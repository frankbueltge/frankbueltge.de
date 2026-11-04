// Check 49's page: node verify.js <abs dir of this page> <abs dir for screenshots>
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const nd=async()=>+(await p.$eval('#cv',e=>e.dataset.nd));
 const set=async(cc,a,bb)=>{await p.selectOption('#cc',cc);await p.$eval('#a',(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'))},a);await p.$eval('#b',(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'))},bb);};
 const expect=[['MG',0,33,585],['MG',0,22,90],['MG',0,23,585],['MG',9,33,495],['MG',10,33,495],['MG',14,20,0],
  ['KE',0,17,190],['SO',0,17,56],['HT',0,17,394],['AF',0,17,0],['YE',0,33,11336],['ZW',0,33,3403],['CD',0,33,3959]];
 for(const [cc,a,bb,v] of expect){await set(cc,a,bb);const got=await nd();t(got===v,`${cc} ${a}-${bb}: ${got} != ${v}`)}
 await set('KE',0,17);t((await p.textContent('#read')).includes('equal, cell for cell'),'probe readout');
 t(await p.$$eval('#probes tbody tr',r=>r.length)===5,'probe rows');
 t(await p.$$eval('#ctab tbody tr',r=>r.length)===15,'country rows');
 t(await p.$$eval('#pred .held',r=>r.length)===5,'held 5');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 await set('MG',0,33);
 await p.screenshot({path:process.argv[3]+`/shot-${w}.png`,fullPage:w===390});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
