// Studies 53-54's page (state 2): node verify.js <abs dir of this page>
const {chromium}=require('playwright');const R=require(process.argv[2]+'/results53.json');const E=require(process.argv[2]+'/results54.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
const at=(k,d)=>R.curves[k].find(x=>x.d===d);
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const ans=await p.textContent('#ans');const q=at('pooled|42|all',42);
 t(ans.includes(q.k+' of '+q.n),'answer 42-day count');
 t(ans.includes(R.predictions.P5.value.sourceless+' of '+R.predictions.P5.value.breaks),'sourceless count');
 t((await p.textContent('#rd')).includes('42 days quiet'),'opens on day 42');
 await p.click('button[data-v="21"]');t((await p.textContent('#rd')).includes(at('pooled|21|all',42).k+' of '+at('pooled|21|all',42).n),'21-day horizon');
 await p.click('button[data-v="nb"]');const r=await p.textContent('#rd');
 t(r.includes(at('pooled|21|nb',42).k+' of '+at('pooled|21|nb',42).n)&&r.includes(at('pooled|21|nonb',42).k+' of '+at('pooled|21|nonb',42).n),'split');
 await p.click('button[data-v="kivu"]');await p.click('button[data-v="42"]');
 t((await p.textContent('#rd')).includes(at('kivu|42|nb',42).k+' of '+at('kivu|42|nb',42).n),'kivu split');
 t(await p.$$eval('#pred .held',r=>r.length)===Object.values(R.predictions).filter(x=>x.held).length,'held count');
 t(await p.$$eval('#pred .failed',r=>r.length)===Object.values(R.predictions).filter(x=>!x.held).length,'failed count');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 t(!(await p.textContent('main')).includes('undefined')&&!(await p.textContent('main')).includes('null'),'no empty value');
 const a2=await p.textContent('#ans');t(a2.includes(E.predictions.P8.value.k.toLocaleString('en')+' of '+E.predictions.P8.value.n.toLocaleString('en')),'met-dead count');
 t(await p.$$eval('#pred54 tbody tr',r=>r.length)===5,'five study-54 predictions');
 t((await p.$$eval('#pred54 td',r=>r.map(x=>x.textContent).join('|'))).split('uninformative').length-1>=2,'P9 P10 uninformative');
 await p.$eval('#fd',c=>c.scrollIntoView({block:'center'}));const fb=await p.$eval('#fd',c=>{const r=c.getBoundingClientRect();return [r.left+r.width*0.6,r.top+r.height*0.7]});await p.mouse.move(fb[0],fb[1]);t(/report \d+/.test(await p.textContent('#rd3')),'figure 3 reads a day');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:process.argv[2]+'/process/2.png',fullPage:true})}
 else await p.screenshot({path:process.argv[2]+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
