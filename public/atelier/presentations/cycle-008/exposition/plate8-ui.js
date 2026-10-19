// Plate VIII, In the Subjunctive: the page sets each verdict in the mood its reading earned.
// Rows of P8R: [id, mag, date, [[came, stated] x 9 lags], distinct versions, harshest lag index, kindest lag index]
(function(){
const $=id=>document.getElementById(id), N=P8R.length, L=P8.lags_h, fmt=(x,d=2)=>x.toFixed(d);
const LN=L.map(h=>h===0?'the first version':h<168?h+' h':(h/24)+' days');
let pick=new Array(N).fill(0), seen=false, sighted=false, label='lag0', sel=-1, ledger=[];
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(20261019), BOOT=Array.from({length:1000},()=>Array.from({length:N},()=>Math.floor(R()*N))), coin=rng(Date.now()%1e9);
function judge(p){
  const o=p.map((k,i)=>P8R[i][3][k][0]), e=p.map((k,i)=>P8R[i][3][k][1]);
  const so=o.reduce((a,b)=>a+b,0), se=e.reduce((a,b)=>a+b,0);
  const rs=BOOT.map(b=>{let x=0,y=0;for(const j of b){x+=o[j];y+=e[j]}return x/y}).sort((a,b)=>a-b);
  const lo=rs[Math.floor(.025*(rs.length-1))], hi=rs[Math.floor(.975*(rs.length-1))];
  return {o:so,e:se,r:so/se,lo,hi,v:hi<1?'too high':lo>1?'too low':'cannot be told from right'};
}
// a change of reading made after the page has shown what came makes the reading sighted
function setReading(p,name,bySight){pick=p.slice();label=name;sighted=bySight||seen;draw()}
const lagBox=$('p8lags');
L.forEach((h,k)=>{const b=document.createElement('button');b.id='p8-l'+k;b.textContent=k?'≥ '+LN[k]:'first version';b.onclick=()=>setReading(new Array(N).fill(k),'lag'+k,false);lagBox.appendChild(b)});
$('p8-blind').onclick=()=>setReading(Array.from({length:N},()=>Math.floor(coin()*L.length)),'blind',false);
$('p8-harsh').onclick=()=>setReading(P8R.map(r=>r[5]),'harshest',true);
$('p8-kind').onclick=()=>setReading(P8R.map(r=>r[6]),'kindest',true);
$('p8-show').onclick=()=>{if(seen)return;seen=true;const b=$('p8-show');b.setAttribute('aria-pressed','true');b.disabled=true;b.textContent='What came is shown';
  $('p8-seen').textContent='Shown. From now on, a reading you change is a reading chosen after looking. Reload the page to forget, which is the limit of what a page can know.';draw()};
const grid=$('p8grid');
P8R.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.dataset.i=i;b.setAttribute('aria-label','sequence '+r[0]);
  b.onclick=()=>{const p=pick.slice();p[i]=(p[i]+1)%L.length;sel=i;setReading(p,'yours',false)};grid.appendChild(b)});
const NAME=k=>k.startsWith('lag')?(k==='lag0'?'Read at the first version':'Read at the earliest version issued '+LN[+k.slice(3)]+' or more after the first'):
  ({blind:'Read at a lag drawn blind for each sequence',harshest:'Read by the harshest hand',kindest:'Read by the kindest hand',yours:'Read your way'})[k];
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function shade(k){return 'color-mix(in srgb, var(--calm) '+Math.round(18+82*k/(L.length-1))+'%, var(--bg))'}
$('p8key').innerHTML=L.map((h,k)=>'<i style="background:'+shade(k)+';margin:0 2px'+(k?'':' 0 0')+'"></i>').join('')+' first version → 30 days';
function axis(j){
  const svg=$('p8axis'), W=svg.clientWidth||600, a=Math.log(0.008), b=Math.log(6), x=v=>14+(W-28)*(Math.log(Math.max(v,0.008))-a)/(b-a), ns='http://www.w3.org/2000/svg';
  const el=(t,at,txt)=>{const n=document.createElementNS(ns,t);for(const k in at)n.setAttribute(k,at[k]);if(txt!=null)n.textContent=txt;svg.appendChild(n);return n};
  svg.textContent='';const F={'font-family':'system-ui,sans-serif','font-size':11};
  el('line',{x1:x(.008),x2:x(6),y1:70,y2:70,stroke:css('--rule'),'stroke-width':2});
  for(const t of [0.01,0.1,0.5,1,2,5])el('text',{x:x(t),y:146,'text-anchor':'middle',fill:css('--mute'),...F},t);
  el('line',{x1:x(1),x2:x(1),y1:22,y2:132,stroke:css('--ink'),'stroke-dasharray':'3 3'});
  el('text',{x:x(1),y:16,'text-anchor':'middle',fill:css('--ink'),...F},'right');
  P8.declared.forEach((d,k)=>{const y=40+k*4;el('line',{x1:x(d.ci[0]),x2:x(d.ci[1]),y1:y,y2:y,stroke:css('--calm'),'stroke-width':1.5,opacity:.6});el('circle',{cx:x(d.ratio),cy:y,r:2.5,fill:css('--calm'),'data-k':'declared'})});
  for(const s of ['harshest','kindest'])el('circle',{cx:x(P8.sighted[s].ratio),cy:70,r:4,fill:'none',stroke:css('--accent'),'stroke-width':1.5,'data-k':'sighted'});
  el('text',{x:x(P8.declared[0].ratio)-6,y:34,'text-anchor':'end',fill:css('--calm'),...F},'declared');
  el('text',{x:x(P8.sighted.kindest.ratio),y:90,'text-anchor':'end',fill:css('--accent'),...F},'a hand that looked');
  ledger.forEach(s=>{if(s.r==null)return;el('rect',{x:x(s.r)-3,y:102,width:6,height:12,rx:1,fill:s.mood==='indicative'?css('--ink'):'none',stroke:css('--ink'),'data-k':'ledger'})});
  if(!seen&&!sighted)return;
  el('circle',{cx:x(j.r),cy:70,r:6,fill:sighted?'none':css('--ink'),stroke:css('--ink'),'stroke-width':2,id:'p8now'});
}
function sentence(j){
  const n=`${j.o} came where ${fmt(j.e,1)} were stated (${fmt(j.r)}; 95 %: ${fmt(j.lo)} to ${fmt(j.hi)})`;
  if(!sighted){const w=j.v==='cannot be told from right'?'cannot be told from right':'ran '+j.v;return {mood:'indicative',text:`${NAME(label)}, the odds ${w}: ${n}.`}}
  const w=j.v==='cannot be told from right'?'could not have been told from right':'would have run '+j.v;
  return {mood:'subjunctive',text:`Had these been the warnings, the odds ${w}: ${j.o} would have come where ${fmt(j.e,1)} were stated (${fmt(j.r)}).`};
}
function addLedger(s){ledger.push(s);const li=document.createElement('li');li.dataset.mood=s.mood;
  li.innerHTML=(s.mood==='indicative'?'':'<i>')+s.text.replace(/</g,'&lt;')+(s.mood==='indicative'?'':'</i>')+` <span style="color:var(--accent)">[${s.mood}${s.note?'; '+s.note:''}]</span>`;
  $('p8ledger').appendChild(li);draw()}
$('p8-write').onclick=()=>{const j=judge(pick),s=sentence(j);addLedger({...s,r:j.r,note:s.mood==='subjunctive'?'chosen after what came was shown':''})};
$('p8-refuse').onclick=()=>{const d=P8.declared_span,h=P8.sighted.harshest.ratio,k=P8.sighted.kindest.ratio;
  addLedger({mood:'restraint',r:null,text:`Which hour was the warning, the record does not say. Read by a clock declared in advance, the odds would run from ${fmt(d[0])} to ${fmt(d[1])}, too high only at the first hour; read by a hand that has looked, anywhere from ${fmt(h)} to ${fmt(k)}. In ${P8.event.changes_with_the_version} of ${N} sequences, whether an aftershock came in the warned week at all changes with the version.`,note:'no verdict'})};
$('p8-did').onclick=()=>{const t=$('p8did').value.trim().replace(/[.!?]+$/,'');if(!t)return;
  addLedger({mood:'subjunctive',r:null,text:`Someone, on reading it, might have ${t.charAt(0).toLowerCase()+t.slice(1)}.`,note:'written by you; no record holds this; not saved'});$('p8did').value=''};
function card(){if(sel<0)return;const r=P8R[sel],k=pick[sel],c=r[3][k];
  $('p8card').innerHTML=`<b>Sequence ${r[0]}</b>${r[1]?', M '+r[1]:''}${r[2]?', '+r[2]:''}. The nine clock rules read ${r[4]} distinct versions of its forecast. Read now: <b>${LN[k]}</b>${k?' or later':''}, stated chances summing to ${fmt(c[1],3)} for its own week`+(seen?`, ${c[0]} came true.`:'; what came is hidden.')}
function draw(){
  [...grid.children].forEach((b,i)=>{b.style.background=shade(pick[i]);b.className=(seen&&P8R[i][3][pick[i]][0]>0?'h':'')+(i===sel?' sel':'')});
  const j=judge(pick);window.__p8={label,seen,sighted,...j,ledger:ledger.map(s=>s.mood)};axis(j);
  if(!seen&&!sighted)$('p8read').innerHTML=`<b>${NAME(label)}.</b> What came is hidden, so no verdict is drawn yet. Show what came, or write the verdict now: a reading fixed before looking is written in the indicative.`;
  else{const s=sentence(j);$('p8read').innerHTML=(s.mood==='indicative'?s.text:'<i>'+s.text+'</i>')+` <b>Mood: ${s.mood}.</b>`+(s.mood==='indicative'?' This reading was fixed before the page showed what came.':' This reading was chosen after what came was shown.')}
  L.forEach((h,k)=>$('p8-l'+k).setAttribute('aria-pressed',label==='lag'+k));
  for(const k of ['blind','harsh','kind'])$('p8-'+k).setAttribute('aria-pressed',label===({blind:'blind',harsh:'harshest',kind:'kindest'})[k]);
  card();
}
$('p8b-lo').textContent=fmt(P8.blind.range_95[0]);$('p8b-hi').textContent=fmt(P8.blind.range_95[1]);$('p8dv').textContent=P8.distinct_versions.total.toLocaleString('en-US');
$('p8j-ch').textContent=P8.event.changes_with_the_version;$('p8j-no').textContent=P8.event.came_in_none;$('p8j-all').textContent=P8.event.came_in_every_version||0;
addEventListener('resize',()=>draw());
draw();
})();
