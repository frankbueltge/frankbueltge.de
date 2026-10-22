// Plate XII, The Hour of Deciding: a rule on the words is blind only if it can be decided at the hour each version is written.
// Rows come from plate8.js (P8R: [id, mag, date, [[came, stated] x 9 lags], ...]); intervals, checks and exact picks from plate12.js (P12, P12K).
(function(){
const $=id=>document.getElementById(id), N=P8R.length, L=P12.lags_h, fmt=(x,d=2)=>x.toFixed(d);
const LN=L.map(h=>h===0?'first hour':h<168?h+' h':(h/24)+' days');
const RATE=L.map((_,k)=>{let o=0,e=0;P8R.forEach(r=>{o+=r[3][k][0];e+=r[3][k][1]});return o/e});
const DEC=P12.decidable.map(d=>({...d,name:d.rule==='raise'?(d.c===1?'the first later version that states more than the first hour':'the first later version that states '+d.c+' times the first hour or more'):'the first later version that states '+(d.c===0.5?'half':d.c+' times')+' the first hour or less'}));
let rule='least', H=8, sel=-1;
// exact picks from plate12.py: P8R's stated chances are rounded, and rounding would break ties differently
function pickOf(){return [...P12K[rule==='least'||rule==='most'?rule[0]+H:rule]].map(Number)}
// hours of the picked version's week that the deciding words could have seen
const hind=k=>rule==='least'||rule==='most'?Math.min(L[H]-L[k],168):0;
function tot(p){let o=0,e=0,a=0;p.forEach((k,i)=>{const c=P8R[i][3][k];o+=c[0];e+=c[1];a+=c[1]*RATE[k]});return {o,e,r:o/e,adj:o/a}}
function stat(){return rule==='least'||rule==='most'?P12.deciding_at_H[rule][H]:DEC[+rule.slice(1)]}
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function axis(s){
  const svg=$('p12axis'), W=svg.clientWidth||600, a=Math.log(0.25), b=Math.log(3), x=v=>14+(W-28)*(Math.log(Math.min(Math.max(v,0.25),3))-a)/(b-a), ns='http://www.w3.org/2000/svg';
  const el=(t,at,txt)=>{const n=document.createElementNS(ns,t);for(const k in at)n.setAttribute(k,at[k]);if(txt!=null)n.textContent=txt;svg.appendChild(n);return n};
  svg.textContent='';const F={'font-family':'system-ui,sans-serif','font-size':11};
  for(const t of [0.25,0.5,1,2,3])el('text',{x:x(t),y:146,'text-anchor':'middle',fill:css('--mute'),...F},t);
  const lo=Math.min(...P12.clocks.map(c=>c.ratio)),hi=Math.max(...P12.clocks.map(c=>c.ratio));
  el('rect',{x:x(lo),y:22,width:x(hi)-x(lo),height:30,fill:css('--card'),'data-k':'clocks'});
  el('text',{x:x(lo)+3,y:18,fill:css('--mute'),...F},'the nine clocks');
  el('line',{x1:x(1),x2:x(1),y1:16,y2:132,stroke:css('--ink'),'stroke-dasharray':'3 3'});
  el('text',{x:x(1)+4,y:132,fill:css('--ink'),...F},'right');
  el('line',{x1:x(s.ci[0]),x2:x(s.ci[1]),y1:38,y2:38,stroke:css('--ink'),'stroke-width':1.5});
  el('rect',{x:x(s.ratio)-5,y:33,width:10,height:10,fill:css('--ink'),'data-k':'raw'});
  el('text',{x:14,y:66,fill:css('--mute'),...F},'what came ÷ what was stated');
  const moved=s.adj_ci[0]>1||s.adj_ci[1]<1;
  el('line',{x1:x(s.adj_ci[0]),x2:x(s.adj_ci[1]),y1:96,y2:96,stroke:moved?css('--accent'):css('--calm'),'stroke-width':2});
  el('circle',{cx:x(s.clock_adjusted),cy:96,r:6,fill:moved?css('--accent'):css('--calm'),'data-k':'adj'});
  el('text',{x:14,y:120,fill:css('--mute'),...F},'the same, over what its clocks would have brought');
}
const grid=$('p12grid');
P8R.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.dataset.i=i;b.setAttribute('aria-label','sequence '+r[0]);
  b.onclick=()=>{sel=i;draw()};grid.appendChild(b)});
function card(p){
  if(sel<0){$('p12card').textContent='Tap a square: the nine versions of that forecast, the one the rule chose, and which words it read.';return}
  const r=P8R[sel], k=p[sel], h=hind(k), seen=r[3].map((c,j)=>j>k&&L[j]<L[k]+168&&(rule==='least'||rule==='most')&&j<=H);
  const items=r[3].map((c,j)=>{let s=LN[j]+' '+fmt(c[1],3)+(c[0]>0?' ■':'');if(seen[j])s='<u>'+s+'</u>';return j===k?'<b>'+s+'</b>':s}).join(' · ');
  $('p12card').innerHTML=`<b>Sequence ${r[0]}</b>${r[1]?', M '+r[1]:''}${r[2]?', '+r[2]:''}.<br><span class="note">Stated chance for each version's own week (■ an aftershock came in it); chosen in bold; underlined, the versions the rule read that were written after the chosen week had begun.</span><br>${items}<br>`+
    (h>0?`<b>Decided with ${h} hours of hindsight.</b> To choose the ${LN[k]} version, the rule read words written inside its week.`:`<b>Decided at the hour of writing.</b> Nothing written after the chosen version was read.`);
}
function draw(){
  const p=pickOf(), t=tot(p), s=stat(), hs=p.map(hind), nh=hs.filter(x=>x>0).length;
  [...grid.children].forEach((b,i)=>{b.className=(hs[i]>0?'s':'n')+(P8R[i][3][p[i]][0]>0?' h':'')+(i===sel?' sel':'')});
  for(const r of ['least','most',...DEC.map((_,j)=>'d'+j)])$('p12-'+r).setAttribute('aria-pressed',r===rule);
  for(let k=0;k<9;k++){$('p12-H'+k).setAttribute('aria-pressed',k===H);$('p12-H'+k).disabled=!(rule==='least'||rule==='most')}
  window.__p12={rule,H,o:t.o,e:t.e,r:t.r,adj:t.adj,hind:nh};
  axis(s);
  const name=rule==='least'||rule==='most'?`the version that stated ${rule}, among those written by ${H===0?'the first hour':LN[H]}`:DEC[+rule.slice(1)].name+', else the last';
  const moved=s.adj_ci[0]>1||s.adj_ci[1]<1;
  $('p12read').innerHTML=`<b>Rule:</b> ${name}. Observed ${t.o} against ${fmt(t.e)} stated: <b>${fmt(t.r)}</b> (${s.verdict}). Against what its own clocks would have brought: <b>${fmt(t.adj)}</b>, ${moved?'<b>the choosing moved it</b>':'it reads what its clocks read'}.<br>`+
    (nh>0?`${nh} of ${N} choices read words written after the chosen week had begun. The rule was declared before any outcome; it is <b>decided</b> with hindsight. Declared, but not blind.`:`Every choice is made at the hour its version is written, from the words written so far. ${rule==='least'||rule==='most'?'This is the first-hour clock.':'Declared and decidable: blind in the strict sense.'}`);
  card(p);
}
$('p12-least').onclick=()=>{rule='least';draw()};$('p12-most').onclick=()=>{rule='most';draw()};
DEC.forEach((_,j)=>$('p12-d'+j).onclick=()=>{rule='d'+j;draw()});
for(let k=0;k<9;k++)$('p12-H'+k).onclick=()=>{H=k;draw()};
const w=P12.the_writing;
$('p12f-hit').textContent=Math.round(w.after_a_hit.share*100)+' %';$('p12f-none').textContent=Math.round(w.after_none.share*100)+' %';
$('p12f-hn').textContent=w.after_a_hit.states_more+' of '+w.after_a_hit.pairs;$('p12f-nn').textContent=w.after_none.states_more+' of '+w.after_none.pairs;
$('p12f-ci').textContent=Math.round(w.ci[0]*100)+' to '+Math.round(w.ci[1]*100);
$('p12bar-hit').style.width=(w.after_a_hit.share*100)+'%';$('p12bar-none').style.width=Math.max(w.after_none.share*100,0.6)+'%';
const D=P12.deciding_at_H;
$('p12f-l12').textContent=fmt(D.least[2].clock_adjusted);$('p12f-l12ci').textContent=fmt(D.least[2].adj_ci[0],3)+'–'+fmt(D.least[2].adj_ci[1]);
$('p12f-l720').textContent=fmt(D.least[8].clock_adjusted);$('p12f-l720ci').textContent=fmt(D.least[8].adj_ci[0])+'–'+fmt(D.least[8].adj_ci[1]);
$('p12f-m168').textContent=fmt(D.most[6].clock_adjusted);$('p12f-m168ci').textContent=fmt(D.most[6].adj_ci[0])+'–'+fmt(D.most[6].adj_ci[1],3);
$('p12f-to720').textContent=P12.decidable.filter(d=>(d.lags['720']||0)>=200).length;
draw();window.addEventListener('resize',draw);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
})();
