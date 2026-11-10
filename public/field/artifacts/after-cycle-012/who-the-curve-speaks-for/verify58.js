// node verify58.js <abs dir of this page>   checks the page (studies 56 and 58) against results56/58.json and the data; writes process/2.png and shot-390.png
const {chromium}=require('playwright');const dir=process.argv[2];const R=require(dir+'/results56.json'),R58=require(dir+'/results58.json');
global.window={};require(dir+'/data56.js');require(dir+'/data58.js');const D=window.DATA56,D58=window.DATA58;
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,n=0;const t=(c,m)=>{n++;if(c)ok++;else console.log('FAIL',m)};
// the page's status rule, both readings, must give the second implementation's counts at every d >= 21
for(const [lab,rec] of Object.entries(D))for(const [o,key] of [[0,'A'],[1,'B']]){let same=true;
 for(const p of D58[lab][key].perD.filter(p=>p.d>=21)){let c=0,k=0;const e=p.d-o;for(const q of rec.quiets){if(q.L!==null&&q.L<=e)continue;if(q.a+e+42>rec.N-1)continue;c++;if(q.L!==null&&q.L<=e+42)k++}if(c!==p.n||k!==p.k)same=false}
 t(same,'page rule = analyse58, '+lab+' reading '+key)}
t(R58.derivationHolds===true,'B(d) = A(d-1)');
t(Object.values(R58.predictions.P26.value).every(v=>v.identical),'P26: second implementation identical');
for(const [w,scheme] of [[1100,'light'],[390,'dark']]){
 const p=await b.newPage({viewport:{width:w,height:900},colorScheme:scheme});
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+dir+'/index.html');
 const c=R.records['Congo 2026'],k=R.records['Kivu 2018-2020'];const ans=await p.textContent('#ans');
 t(ans.includes('all '+k.p42.n+' quiets')&&ans.includes('Of the '+c.p42.n+' quiets counted at day 42, '+c.band.n),'study 56 answer stands');
 t(ans.includes('speaks for '+c.p60.n)&&!/began|begun/.test(ans),'study 56 answer, wording corrected');
 const a58=await p.textContent('#ans58');const cb=R58.records['Congo 2026'].B,ka=R58.records['Kivu 2018-2020'];
 t(a58.includes('9,120 in Kivu, 3,913 in 2026'),'58: reproduction counts');
 t(a58.includes('day '+ka.B.firstEdge+' (not '+ka.A.firstEdge+')')&&a58.includes('day '+ka.B.below10+' (not '+ka.A.below10+')'),'58: Kivu thresholds');
 t(a58.includes(cb.p42[0]+' of '+cb.p42[1]+' instead of 8 of 15')&&a58.includes('leaves out '+cb.band[1]+' of them'),'58: 2026 figures');
 t(a58.includes('P16 would fail'),'58: the verdict that flips');
 let rd=await p.textContent('#rd');t(rd.includes('counts '+c.p42.n+' quiets'),'figure 1 opens on 2026, day 42, as counted');
 await p.click('button[data-o="1"]');rd=await p.textContent('#rd');
 t(rd.includes('the rise day as day 1')&&rd.includes('counts '+cb.p42[1]+' quiets, '+cb.p42[0]+' broke'),'figure 1, other reading, day 42');
 t((await p.textContent('#rd2')).includes('the rise day as day 1'),'figure 2 follows the switch');
 await p.$eval('#d',e=>{e.value=60;e.dispatchEvent(new Event('input'))});rd=await p.textContent('#rd');
 t(rd.includes('counts '+cb.p60[1]+' quiets, '+cb.p60[0]+' broke'),'figure 1, other reading, day 60');
 await p.click('button[data-o="0"]');rd=await p.textContent('#rd');
 t(rd.includes('counts '+c.p60.n+' quiets, '+c.p60.k+' broke'),'figure 1 back, day 60');
 await p.click('button[data-r="Kivu 2018-2020"]');rd=await p.textContent('#rd');
 t(rd.includes('counts '+k.p60.n+' quiets, '+k.p60.k+' broke'),'Kivu at day 60');
 await p.$eval('#cal',c=>c.scrollIntoView({block:'center'}));
 const hit=await p.evaluate(()=>{const c=document.getElementById('cal'),r=c.getBoundingClientRect();for(let y=r.top+20;y<r.bottom;y+=2){c.dispatchEvent(new PointerEvent('pointermove',{clientX:r.left+r.width/2,clientY:y,bubbles:true}));if(/count rose .*, quiet from/.test(document.getElementById('rd').textContent))return true}return false});
 t(hit,'figure 1 reads a quiet: rise and first day');
 t(await p.$$eval('#pred tbody tr',r=>r.length)===4&&await p.$$eval('#pred58 tbody tr',r=>r.length)===4,'four plus four predictions');
 t(await p.$$eval('#pred58 .failed',r=>r.length)===Object.values(R58.predictions).filter(x=>!x.held).length,'58 failed count');
 t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no side scroll at '+w);
 const main=await p.textContent('main');t(!/undefined|NaN|null|Infinity/.test(main),'no empty value');
 await p.reload();
 if(w===1100){await p.setViewportSize({width:1100,height:1300});await p.screenshot({path:dir+'/process/2.png',fullPage:true})}
 else await p.screenshot({path:dir+'/shot-390.png',fullPage:true});
}
t(errs.length===0,'errors '+errs.join('|'));console.log(`${ok} of ${n} pass`);await b.close();})();
