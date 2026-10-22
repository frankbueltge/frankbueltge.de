// Plate IX, The Closed World: the visitor decides which registers are held closed, and the page writes
// the column of false alarms that decision makes. Rows of P9R: [index into P6R, class, met, placebo].
(function(){
const $=id=>document.getElementById(id), CLS=P9.classes, NONE=CLS.length, N=P9R.length, f=n=>n.toLocaleString('en-US');
const KIND=CLS.concat(['no lower register']);
// a reading: are the declarations closed below their threshold; is Storm Events consulted; over which kinds is it closed
let decl=true, storm=false, closed=new Set(), name='A', sel=-1;
const NAMED={A:[true,false,[]],B:[true,true,[0,1,2,3,4,5,6]],C:[false,true,[0,1,2,3,4,5]],D:[false,true,[]]};
const LABEL={A:'A. The declarations, closed over every danger',B:'B. Both registers, closed over every danger',C:'C. Each register closed only over what it keeps',D:'D. The open world',yours:'Your reading'};
function fate(r){const c=r[1],m=r[2];
  if(storm&&m)return 'c';
  const isClosed=decl||(storm&&closed.has(c)), openKeeper=storm&&c!==NONE&&!closed.has(c);
  return isClosed&&!openKeeper?'n':'u'}
function count(){const o={n:0,c:0,u:0};for(const r of P9R)o[fate(r)]++;return o}
// order the squares once: by kind, then met first, so a closure is seen to take whole blocks
const ORD=P9R.map((r,i)=>i).sort((a,b)=>P9R[a][1]-P9R[b][1]||P9R[b][2]-P9R[a][2]||a-b);
const POS=new Array(N);ORD.forEach((j,k)=>POS[j]=k);
const cv=$('p9grid'), css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
let geo={s:4,cols:100};
function draw(){
  const W=cv.clientWidth||600, dpr=devicePixelRatio||1, s=W<500?3:4, cols=Math.floor(W/s), rows=Math.ceil(N/cols), H=rows*s;
  geo={s,cols};cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  const col={n:css('--accent'),c:css('--calm'),u:css('--grey')};
  for(let k=0;k<N;k++){const j=ORD[k],x=(k%cols)*s,y=Math.floor(k/cols)*s;g.fillStyle=col[fate(P9R[j])];g.fillRect(x,y,s-(s>3?1:.6),s-(s>3?1:.6))}
  if(sel>=0){const k=POS[sel];g.strokeStyle=css('--ink');g.lineWidth=1.5;g.strokeRect((k%cols)*s-1.5,Math.floor(k/cols)*s-1.5,s+2,s+2)}
  const o=count();
  $('p9read').innerHTML='<b>'+LABEL[name]+'.</b> The column of false alarms this reading writes: <b id="p9n">'+f(o.n)+'</b> of '+f(N)+
    ' warnings. Contradicted by a register: <b id="p9c">'+f(o.c)+'</b>'+(o.c?' (the same counties on the same day a year earlier are met '+f(P9.placebo)+' times, so about that many could be coincidence)':'')+
    '. Unknown: <b id="p9u">'+f(o.u)+'</b>. Backed by a row that says the danger did not come: <b id="p9b">0</b>.'+
    (o.n?' Every one of the '+f(o.n)+' is written by the rule, not read from a record.':' Nothing is written into the column at all.');
  ['decl','storm'].forEach(k=>$('p9-'+k).setAttribute('aria-pressed',String(k==='decl'?decl:storm)));
  $('p9-decl').textContent='Declarations: '+(decl?'closed':'open')+' below their threshold';
  $('p9-storm').textContent='Storm Events: '+(storm?'consulted':'not consulted');
  CLS.concat(['other']).forEach((c,k)=>{const b=$('p9-k'+k);b.disabled=!storm;b.setAttribute('aria-pressed',String(storm&&closed.has(k)));
    b.textContent=(k<NONE?c:'kinds it keeps nothing of')+': '+(storm?(closed.has(k)?'closed':'open'):'—')});
  Object.keys(NAMED).forEach(k=>$('p9-'+k).setAttribute('aria-pressed',String(name===k)));
  window.__p9={n:o.n,c:o.c,u:o.u,b:0,name};
}
function setNamed(k){const [d,st,cl]=NAMED[k];decl=d;storm=st;closed=new Set(cl);name=k;draw()}
Object.keys(NAMED).forEach(k=>$('p9-'+k).onclick=()=>setNamed(k));
$('p9-decl').onclick=()=>{decl=!decl;name='yours';draw()};
$('p9-storm').onclick=()=>{storm=!storm;name='yours';draw()};
const box=$('p9kinds');
CLS.concat(['other']).forEach((c,k)=>{const b=document.createElement('button');b.id='p9-k'+k;b.type='button';
  b.onclick=()=>{closed.has(k)?closed.delete(k):closed.add(k);name='yours';draw()};box.appendChild(b)});
// the warrant: how often each kind is met, against the same day a year earlier
$('p9tab').innerHTML=CLS.map(c=>{const b=P9.by_class[c];return '<tr><td>'+c+'</td><td>'+f(b.n)+'</td><td>'+(100*b.met/b.n).toFixed(1)+' %</td><td>'+(100*b.placebo/b.n).toFixed(1)+' %</td></tr>'}).join('')+
  '<tr><td>no lower register</td><td>'+f(P9.by_class.none.n)+'</td><td>—</td><td>—</td></tr>';
const day=t=>new Date(t*60000).toISOString().slice(0,10);
function card(j){sel=j;const r=P9R[j],w=P6R[r[0]],k=fate(r);
  const says={n:'<b>Never needed</b>, by this reading: no register holds its danger, and the reading takes that silence as a fact.',c:'<b>Contradicted</b>: Storm Events records a '+CLS[r[1]]+' event in its counties within a day.',u:'<b>Unknown</b>: no register this reading holds closed can speak to it.'}[k];
  $('p9card').innerHTML='<b>'+(P6N[w[1]]||w[1])+'</b>, '+day(w[0])+', '+w[3]+(w[4]>1?' and '+(w[4]-1)+' more':'')+': “'+w[2].replace(/</g,'&lt;')+'”<br>Kind, by the Field\'s rules: '+KIND[r[1]]+
    (r[1]<NONE?'. Met in Storm Events: '+(r[2]?'yes':'no')+'; a year earlier: '+(r[3]?'yes':'no'):'')+'.<br>'+says;draw()}
cv.onclick=e=>{const b=cv.getBoundingClientRect(),x=Math.floor((e.clientX-b.left)/geo.s),y=Math.floor((e.clientY-b.top)/geo.s),k=y*geo.cols+x;if(x<geo.cols&&k>=0&&k<N)card(ORD[k])};
const find=re=>P9R.findIndex(r=>re.test(P6R[r[0]][2]));
const CASE={fire:find(/Fire near Lyons Valley/),flood:P9R.findIndex(r=>r[1]===1&&!r[2]&&/flooding/i.test(P6R[r[0]][2])),outage:P9R.findIndex(r=>r[1]===NONE&&P6R[r[0]][1]==='TOE')};
$('p9-cfire').onclick=()=>card(CASE.fire);$('p9-cflood').onclick=()=>card(CASE.flood);$('p9-cout').onclick=()=>card(CASE.outage);
window.__p9cases=CASE;
['pool','covered','met','placebo','evacuations_for_fire_unmet'].forEach(k=>{const e=$('p9-'+k);if(e)e.textContent=f(P9[k])});
$('p9-none').textContent=f(P9.by_class.none.n);$('p9-share').textContent=(100*P9.excess_share_of_pool).toFixed(1)+' %';
setNamed('A');card(CASE.fire);
window.addEventListener('resize',draw);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
})();
