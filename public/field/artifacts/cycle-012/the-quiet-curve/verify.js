// The Quiet Curve's page (state 4): node verify.js <abs dir of this page> [n]  (n: the process shot's number)
const {chromium}=require('playwright');const R=require(process.argv[2]+'/results53.json');const E=require(process.argv[2]+'/results54.json');
const N=process.argv[3]||'4';const F=require(process.argv[2]+'/results55.json');const S=require(process.argv[2]+'/sens55.json');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;
const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
const at=(k,d)=>R.curves[k].find(x=>x.d===d);
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+process.argv[2]+'/index.html');
 const ans=await p.textContent('#ans');const k=at('kivu|42|all',42),q=at('2026|42|all',42),no=at('pooled|42|nonb',42);
 t(ans.includes(k.k+' of '+k.n),'answer: Kivu at day 42');
 t(ans.includes(q.k+' of '+q.n),'answer: 2026 at day 42');
 t(ans.includes(no.k+' of '+no.n)&&ans.includes('too few'),'answer: neighbour split with its caveat');
 t(ans.includes('97')&&ans.includes('114'),'answer: Kivu one-in-ten and one-in-twenty days');
 t(ans.includes(E.predictions.P8.value.k.toLocaleString('en')+' of '+E.predictions.P8.value.n.toLocaleString('en')),'answer: found-dead count');
 const rd=await p.textContent('#rd');
 t(rd.includes('42 days quiet')&&rd.includes('Kivu')&&rd.includes('Congo 2026'),'opens on day 42, each record');
 await p.click('button[data-v="21"]');t((await p.textContent('#rd')).includes(at('kivu|21|all',42).k+' of '+at('kivu|21|all',42).n),'21-day horizon');
 await p.click('button[data-v="nb"]');let r=await p.textContent('#rd');
 t(r.includes(at('pooled|21|nb',42).k+' of '+at('pooled|21|nb',42).n)&&r.includes('pooled'),'split under each record is pooled and says so');
 await p.click('button[data-v="kivu"]');await p.click('button[data-v="42"]');
 t((await p.textContent('#rd')).includes(at('kivu|42|nb',42).k+' of '+at('kivu|42|nb',42).n),'kivu split');
 t(await p.$$eval('#pred .held',r=>r.length)===Object.values(R.predictions).filter(x=>x.held).length,'held count');
 t(await p.$$eval('#pred .failed',r=>r.length)===Object.values(R.predictions).filter(x=>!x.held).length,'failed count');
 t(await p.$$eval('#pred54 tbody tr',r=>r.length)===5,'five study-54 predictions');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!main.includes('undefined')&&!main.includes('null')&&!main.includes('NaN'),'no empty value');
 t(!/check 5\d|ho-20|Tableau 2|state 2/.test(main),'no in-house vocabulary');
 t((await p.textContent('h2:nth-of-type(5)')).includes(E.predictions.P11.value.rho.toFixed(2))||main.includes('ρ = '+E.predictions.P11.value.rho.toFixed(2)),'figure 4 title carries rho');
 await p.$eval('#fd',c=>c.scrollIntoView({block:'center'}));const fb=await p.$eval('#fd',c=>{const r=c.getBoundingClientRect();return [r.left+r.width*0.6,r.top+r.height*0.7]});await p.mouse.move(fb[0],fb[1]);t(/report \d+/.test(await p.textContent('#rd3')),'figure 3 reads a day');
 await p.$eval('#sc',c=>c.scrollIntoView({block:'center'}));
 const hit=await p.evaluate(()=>{const c=document.getElementById('sc'),r=c.getBoundingClientRect();for(let y=r.top+5;y<r.bottom;y+=3)for(let x=r.left+40;x<r.right;x+=3){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));if(/contacts seen/.test(document.getElementById('rd5').textContent))return true}return false});
 t(hit,'figure 4 reads a day');
 t(ans.includes(F.predictions.P12.value.phi.toFixed(1)+' times'),'answer: day-to-day spread');
 t(ans.includes(S.d42.clean[0]+' of '+S.d42.clean[1])&&ans.includes(String(S.firstBelow10.clean)),'answer: Kivu without the hole');
 t(await p.$$eval('#pred55 tbody tr',r=>r.length)===3&&await p.$$eval('#pred55 .held',r=>r.length)===3,'three study-55 predictions, held');
 t(main.includes('from day 70 on'),'figure 1 says where 2026 stops');
 await p.$eval('#fn',c=>c.scrollIntoView({block:'center'}));
 const hit6=await p.evaluate(()=>{const c=document.getElementById('fn'),r=c.getBoundingClientRect();for(let y=r.top+5;y<r.bottom;y+=3)for(let x=r.left+40;x<r.right;x+=3){c.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));if(/outside the outer line/.test(document.getElementById('rd6').textContent))return true}return false});
 t(hit6,'figure 5 reads an outlying day');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:process.argv[2]+'/process/'+N+'.png',fullPage:true})}
 else await p.screenshot({path:process.argv[2]+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
