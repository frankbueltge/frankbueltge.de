// Plate VII, Which Warning: the visitor chooses, per sequence, which version is "the warning".
// Rows of P7R: [id, place, mag, date, versions, came_first, stated_first, came_later, stated_later, lag_h, harsh, kind]
(function(){
const $=id=>document.getElementById(id), N=P7R.length, fmt=(x,d=2)=>x.toFixed(d);
let pick=new Array(N).fill(0), hidden=false, sighted=false, label='first', sel=-1;
// a seeded generator, so the page's own intervals are the same on every visit
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rng(20261018), BOOT=Array.from({length:1000},()=>Array.from({length:N},()=>Math.floor(R()*N)));
const coin=rng(Date.now()%1e9);
function judge(p){
  const o=p.map((k,i)=>P7R[i][k?7:5]), e=p.map((k,i)=>P7R[i][k?8:6]);
  const so=o.reduce((a,b)=>a+b,0), se=e.reduce((a,b)=>a+b,0);
  const rs=BOOT.map(b=>{let x=0,y=0;for(const j of b){x+=o[j];y+=e[j]}return x/y}).sort((a,b)=>a-b);
  const lo=rs[Math.floor(.025*(rs.length-1))], hi=rs[Math.floor(.975*(rs.length-1))];
  return {o:so,e:se,r:so/se,lo,hi,v:hi<1?'too high':lo>1?'too low':'cannot be told from right',later:p.reduce((a,b)=>a+b,0)};
}
const grid=$('p7grid');
P7R.forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.dataset.i=i;
  b.setAttribute('aria-label',r[1]+', '+r[3]);b.onclick=()=>{pick[i]^=1;sel=i;if(!hidden)sighted=true;label='yours';draw()};grid.appendChild(b)});
function setReader(name,p,isSighted){pick=p.slice();label=name;sighted=isSighted;draw()}
$('r-first').onclick=()=>setReader('first',new Array(N).fill(0),false);
$('r-later').onclick=()=>setReader('later',new Array(N).fill(1),false);
$('r-coin').onclick=()=>setReader('coin',Array.from({length:N},()=>coin()<.5?1:0),false);
$('r-harsh').onclick=()=>setReader('harshest',P7R.map(r=>r[10]),true);
$('r-kind').onclick=()=>setReader('kindest',P7R.map(r=>r[11]),true);
$('r-hide').onclick=()=>{hidden=!hidden;$('r-hide').setAttribute('aria-pressed',hidden);$('r-hide').textContent=hidden?'Show what came':'Hide what came';draw()};
const NAMES={first:'The first version, for all',later:'A day later, for all',coin:'A blind coin per sequence',harshest:'The harshest reader',kindest:'The kindest reader',yours:'Your reading'};
function axis(j,blind){
  const svg=$('p7axis'), W=svg.clientWidth||600, x=v=>16+(W-32)*Math.min(v,1.8)/1.8, ns='http://www.w3.org/2000/svg';
  const el=(t,a,txt)=>{const n=document.createElementNS(ns,t);for(const k in a)n.setAttribute(k,a[k]);if(txt!=null)n.textContent=txt;svg.appendChild(n);return n};
  svg.textContent='';const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v);
  el('line',{x1:x(0),x2:x(1.8),y1:58,y2:58,stroke:css('--rule'),'stroke-width':2});
  for(const t of [0,.5,1,1.5])el('text',{x:x(t),y:90,'text-anchor':'middle','font-size':12,fill:css('--mute'),'font-family':'system-ui'},t);
  el('line',{x1:x(1),x2:x(1),y1:36,y2:70,stroke:css('--ink'),'stroke-dasharray':'3 3'});
  el('text',{x:x(1),y:30,'text-anchor':'middle','font-size':12,fill:css('--ink'),'font-family':'system-ui'},'right');
  for(const [k,v] of Object.entries(P7.readers))el('circle',{cx:x(v.ratio),cy:58,r:4,fill:css('--mute'),'data-k':k});
  if(blind)return;
  el('rect',{x:x(j.lo),y:50,width:Math.max(2,x(j.hi)-x(j.lo)),height:16,rx:3,fill:css('--accent'),opacity:.35,id:'p7ci'});
  el('circle',{cx:x(j.r),cy:58,r:7,fill:css('--accent')});
  el('text',{x:Math.min(Math.max(x(j.r),40),W-40),y:16,'text-anchor':'middle','font-size':12,fill:css('--ink'),'font-family':'system-ui'},fmt(j.r));
}
function card(){
  if(sel<0)return;const r=P7R[sel],k=pick[sel];
  $('p7card').innerHTML=`<b>${r[1]}</b>, M ${r[2]}, ${r[3]}. In the catalogue: ${r[4]} versions. `+
    `First version: stated chances summing to ${fmt(r[6])} over its week's magnitude cells${hidden?'':', '+r[5]+' came true'}. `+
    `A day later (${Math.round(r[9])} h): ${fmt(r[8])} stated for its own week${hidden?'':', '+r[7]+' came true'}. `+
    `Read now: <b>${k?'the version a day later':'the first version'}</b>.`;
}
function draw(){
  [...grid.children].forEach((b,i)=>{b.className=(pick[i]?'l':'f')+(!hidden&&P7R[i][pick[i]?7:5]>0?' h':'')+(i===sel?' sel':'')});
  const j=judge(pick); window.__p7={label,sighted,hidden,...j};
  axis(j,hidden);
  if(hidden)$('p7read').innerHTML=`<b>${NAMES[label]}.</b> What came is hidden. ${j.later} of ${N} sequences read a day later. Show what came to see the verdict on the reading you made.`;
  else{$('p7read').innerHTML=`<b>${NAMES[label]}.</b> ${j.later} of ${N} sequences read a day later. ${j.o} forecast cells came true where the stated chances sum to ${fmt(j.e,1)}: came ÷ stated <b>${fmt(j.r)}</b> (95 %: ${fmt(j.lo)} to ${fmt(j.hi)}). Verdict: <b>${j.v}</b>. `+
    (sighted?'<b>This reading was chosen after seeing what came.</b>':'This reading was declared before seeing what came.');}
  for(const k of ['first','later','harshest','kindest'])$('r-'+({first:'first',later:'later',harshest:'harsh',kindest:'kind'})[k]).setAttribute('aria-pressed',label===k);
  $('r-coin').setAttribute('aria-pressed',label==='coin');
  card();
}
const tb=$('p7tab'), row=(a)=>{const t=document.createElement('tr');t.innerHTML=a.map(x=>`<td>${x}</td>`).join('');tb.appendChild(t)};
for(const k of ['first','later','harshest','kindest']){const v=P7.readers[k];row([NAMES[k],v.sighted?'no':'yes',`${v.observed} ÷ ${v.stated} = ${fmt(v.ratio)}`,`${fmt(v.ci[0])} to ${fmt(v.ci[1])}`,v.verdict])}
const bv=P7.blind.verdicts_of_200;
row(['A blind coin (2,000 readers)','yes',`median ${fmt(P7.blind.ratio_median)}`,`ratios ${fmt(P7.blind.ratio_95[0])} to ${fmt(P7.blind.ratio_95[1])}`,`too high for ${bv['too high']||0} of 200; cannot be told for ${bv['cannot be told from right']||0}`]);
$('v-med').textContent=P7.versions.median;$('v-min').textContent=P7.versions.min;$('v-max').textContent=P7.versions.max;$('v-tot').textContent=P7.versions.total.toLocaleString('en-US');
$('b-lo').textContent=fmt(P7.blind.ratio_95[0]);$('b-hi').textContent=fmt(P7.blind.ratio_95[1]);$('j-diff').textContent=P7.outcomes_differ;$('j-bh').textContent=bv['too high']||0;
addEventListener('resize',()=>draw());
draw();
})();
