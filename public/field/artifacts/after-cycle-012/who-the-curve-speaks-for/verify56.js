// node verify56.js <abs dir of this page>   checks the page's numbers against results56.json and the data; writes process/1.png and shot-390.png
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results56.json');
global.window={};require(dir+'/data56.js');const D=window.DATA56;
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
// the page's own status rule must give study 53's counted population at every d >= 21
for(const [lab,rec] of Object.entries(D)){let same=true;
 for(const p of rec.perD.filter(p=>p.d>=21)){let c=0,k=0;for(const q of rec.quiets){if(q.L!==null&&q.L<=p.d)continue;if(q.a+p.d+42>rec.N-1)continue;c++;if(q.L!==null&&q.L<=p.d+42)k++}if(c!==p.n||k!==p.k)same=false}
 t(same,'page rule reproduces study 53 counts, '+lab)}
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const c=R.records['Congo 2026'],k=R.records['Kivu 2018-2020'];const ans=await p.textContent('#ans');
 t(ans.includes('all '+k.p42.n+' quiets'),'answer: Kivu population at 42');
 t(ans.includes('Of the '+c.p42.n+' quiets counted at day 42, '+c.band.n),'answer: 2026 band');
 t(ans.includes(c.p42.k+' of '+c.p42.n)&&ans.includes(c.matched.k+' of '+c.matched.n),'answer: 2026 shares');
 t(ans.includes('speaks for '+c.p60.n),'answer: 2026 at 60');
 t(ans.includes(String(Math.round(100*c.gap)).replace('-','−')+' points'),'answer: gap');
 let rd=await p.textContent('#rd');t(rd.includes('42 days quiet')&&rd.includes('counts '+c.p42.n+' quiets'),'figure 1 opens on 2026, day 42');
 await p.$eval('#d',e=>{e.value=60;e.dispatchEvent(new Event('input'))});rd=await p.textContent('#rd');
 t(rd.includes('counts '+c.p60.n+' quiets, '+c.p60.k+' broke'),'figure 1 at day 60');
 await p.click('button[data-r="Kivu 2018-2020"]');rd=await p.textContent('#rd');
 t(rd.includes('counts '+k.p60.n+' quiets, '+k.p60.k+' broke'),'Kivu at day 60');
 t((await p.textContent('#rd2')).includes('Day 60'),'figure 2 follows the slider');
 await p.$eval('#cal',c=>c.scrollIntoView({block:'center'}));
 const hit=await p.evaluate(()=>{const c=document.getElementById('cal'),r=c.getBoundingClientRect();for(let y=r.top+20;y<r.bottom;y+=2){c.dispatchEvent(new PointerEvent('pointermove',{clientX:r.left+r.width/2,clientY:y,bubbles:true}));if(/quiet from/.test(document.getElementById('rd').textContent))return true}return false});
 t(hit,'figure 1 reads a quiet');
 t(await p.$$eval('#pred tbody tr',r=>r.length)===4,'four predictions');
 t(await p.$$eval('#pred .failed',r=>r.length)===Object.values(R.predictions).filter(x=>!x.held).length,'failed count');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|null|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/1.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
