(function(){
const D=window.D59, days=D.days;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const pct=x=>(100*x).toFixed(1)+' %';
const pts1=x=>(x<0?'−':'+')+Math.abs(100*x).toFixed(1);
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtD=s=>{const d=new Date(s+'T00:00:00Z');return d.getUTCDate()+' '+MON[d.getUTCMonth()]};
let lagMode=false, hov=null;
const M=()=>lagMode?D.lag:D.main;
const val=d=>lagMode?(d.next&&d.next.new?{k:d.next.comm,n:d.next.new}:null):(d.new?{k:d.comm,n:d.new}:null);

// answer box
const m=D.main;
document.getElementById('ans59').innerHTML=
 `<p><b>Not shown to differ.</b> On the ${m.written.days} report days whose Ituri line writes how many bodies were not swabbed, ${m.written.k} of Ituri's ${m.written.n} new confirmed cases were community deaths (${pct(m.written.share)}). On the ${m.none.days} days whose line writes none, ${m.none.k} of ${m.none.n.toLocaleString("en")} (${pct(m.none.share)}). The difference is ${pts1(m.diff)} points, and its 95 % interval, from ${pts1(m.ci95[0])} to ${pts1(m.ci95[1])}, contains zero. It also reaches past ten points: a moderate difference is not ruled out.</p>`+
 `<p><b>Writing a failure count is a habit of stretches.</b> Read in report order, the days that write one come in runs (${D.runs.runs} runs where chance would give ${D.runs.expected}, p ${D.runs.p.toFixed(3)}). On the days that write one, the failure rate does not move with the share (ρ ${D.rho.rho.toFixed(2).replace('-','−')}, ${D.rho.days} days).</p>`+
 `<p>Five predictions, ${Object.values(D.P).filter(x=>x.held).length} held. Every sentence the Studio quotes stands in our text of the same report (${D.p30} of ${D.joined} days), and our Ituri sum equals the report's own Ituri row on ${D.p31} of ${D.joined}.</p>`;

function setup(id){const c=document.getElementById(id),r=window.devicePixelRatio||1,w=c.clientWidth,h=+c.getAttribute('height');c.width=w*r;c.height=h*r;c.style.height=h+'px';const x=c.getContext('2d');x.setTransform(r,0,0,r,0,0);return {c,x,w,h}}

let pts=[];
function draw(){
 const {x,w,h}=setup('fail');
 const narrow=w<620, side=narrow?0:170;
 const mm={l:46,r:12+side,t:14,b:narrow?150:34};const W=w-mm.l-mm.r,H=h-mm.t-mm.b;
 const n=days.length, X=i=>mm.l+W*(i+.5)/n, Y=s=>mm.t+H*(1-s);
 x.font='12px system-ui,sans-serif';
 // shade the days that write failures
 days.forEach((d,i)=>{if(d.written){x.fillStyle=css('--hi');x.globalAlpha=.10;x.fillRect(mm.l+W*i/n,mm.t,W/n,H);x.globalAlpha=1}});
 x.strokeStyle=css('--line');x.fillStyle=css('--mute');x.lineWidth=1;
 for(const s of [0,.25,.5,.75,1]){x.beginPath();x.moveTo(mm.l,Y(s));x.lineTo(mm.l+W,Y(s));x.stroke();x.fillText(Math.round(100*s)+' %',4,Y(s)+4)}
 x.fillText(fmtD(days[0].date),mm.l,mm.t+H+16);x.textAlign='right';x.fillText(fmtD(days[n-1].date),mm.l+W,mm.t+H+16);x.textAlign='left';
 // pooled lines
 const mo=M();
 for(const [g,col] of [['written','--hi'],['none','--lo']]){x.strokeStyle=css(col);x.lineWidth=1.5;x.setLineDash([5,4]);x.beginPath();x.moveTo(mm.l,Y(mo[g].share));x.lineTo(mm.l+W,Y(mo[g].share));x.stroke();x.setLineDash([])}
 const nmax=Math.max(...days.map(d=>d.new));
 pts=[];
 days.forEach((d,i)=>{const v=val(d);if(!v)return;const r=2+7*Math.sqrt(v.n/nmax);const px=X(i),py=Y(v.k/v.n);pts.push({d,i,px,py});
  x.fillStyle=css(d.written?'--hi':'--lo');x.globalAlpha=.85;x.beginPath();x.arc(px,py,r,0,7);x.fill();x.globalAlpha=1;
  if(hov===i){x.strokeStyle=css('--fg');x.lineWidth=1.5;x.beginPath();x.arc(px,py,r+4,0,7);x.stroke()}});
 // pooled bars with intervals
 const bx=narrow?mm.l:mm.l+W+40, by=narrow?mm.t+H+44:mm.t, bw=narrow?W:side-50, bh=narrow?90:H;
 const groups=[['written','writes failures','--hi'],['none','writes none','--lo']];
 if(narrow){
  const XS=s=>bx+bw*s/0.6;
  groups.forEach(([g,lab,col],j)=>{const yy=by+j*40,v=mo[g];x.fillStyle=css(col);x.globalAlpha=.8;x.fillRect(bx,yy,XS(v.share)-bx,16);x.globalAlpha=1;
   x.strokeStyle=css('--fg');x.lineWidth=1.5;x.beginPath();x.moveTo(XS(v.wilson[0]),yy+8);x.lineTo(XS(v.wilson[1]),yy+8);x.stroke();
   x.fillStyle=css('--fg');x.fillText(`${lab}: ${pct(v.share)} (${v.k} of ${v.n.toLocaleString("en")}, ${v.days} days)`,bx,yy+30)});
 }else{
  const YS=s=>by+bh*(1-s);
  groups.forEach(([g,lab,col],j)=>{const xx=bx+j*(bw/2),v=mo[g];x.fillStyle=css(col);x.globalAlpha=.8;x.fillRect(xx+6,YS(v.share),bw/2-12,YS(0)-YS(v.share));x.globalAlpha=1;
   x.strokeStyle=css('--fg');x.lineWidth=1.5;x.beginPath();x.moveTo(xx+bw/4,YS(v.wilson[0]));x.lineTo(xx+bw/4,YS(v.wilson[1]));x.stroke();
   x.fillStyle=css('--fg');x.textAlign='center';x.fillText(pct(v.share),xx+bw/4,YS(v.wilson[1])-6);x.fillStyle=css('--mute');x.fillText(lab.split(' ')[0],xx+bw/4,YS(0)+14);x.fillText(lab.split(' ')[1],xx+bw/4,YS(0)+28);x.textAlign='left'});
 }
 read();
}
function read(){
 const mo=M();let s;
 if(hov!==null){const d=days[hov],v=val(d);
  s=`${fmtD(d.date)} (report ${d.report}). Ituri's line: ${d.alerts} calls, ${d.swabbed} bodies swabbed, `+(d.written?`${d.unread} written as not swabbed.`:'no failure written.')+' '+
   (v?(lagMode?`Next report day (${fmtD(d.next.date)}): `:'That day: ')+`${v.k} of Ituri's ${v.n} new confirmed cases were community deaths, ${pct(v.k/v.n)}.`:'No new confirmed case in Ituri on the report day read.');
 }else{
  s=(lagMode?'Share read on the next report day. ':'Share read on the same report day. ')+`Days that write failures ${pct(mo.written.share)}, days that write none ${pct(mo.none.share)}: difference ${pts1(mo.diff)} points (95 % interval ${pts1(mo.ci95[0])} to ${pts1(mo.ci95[1])}).`;
 }
 document.getElementById('rd59').textContent=s;
}
function pick(ev){const c=document.getElementById('fail'),r=c.getBoundingClientRect();const mx=ev.clientX-r.left,my=ev.clientY-r.top;let best=null,bd=22;
 for(const q of pts){const dd=Math.hypot(q.px-mx,(q.py-my)*.4);if(dd<bd){bd=dd;best=q}}const nv=best?best.i:null;if(nv!==hov){hov=nv;draw()}}
const cv=document.getElementById('fail');
cv.addEventListener('pointermove',pick);cv.addEventListener('pointerdown',pick);cv.addEventListener('pointerleave',()=>{hov=null;draw()});
for(const [id,v] of [['same',false],['next',true]])document.getElementById(id).addEventListener('click',()=>{lagMode=v;document.getElementById('same').setAttribute('aria-pressed',!v);document.getElementById('next').setAttribute('aria-pressed',v);draw()});

// predictions table
const R={P27:`${pts1(m.diff)} points, 95 % interval ${pts1(m.ci95[0])} to ${pts1(m.ci95[1])}`,
 P28:`${D.runs.runs} runs, ${D.runs.expected} expected, z ${D.runs.z.toFixed(2).replace('-','−')}, p ${D.runs.p.toFixed(4)}`,
 P29:`ρ ${D.rho.rho.toFixed(2).replace('-','−')} over ${D.rho.days} days`,
 P30:`${D.p30} of ${D.joined} days`,
 P31:`${D.p31} of ${D.joined} days (6 Oct: one new case more in the province row; 30 Oct: <s>seven of Ituri's rows unreadable</s> seven readable rows rejected by our guard; corrected 2026-11-07, Figure 6)`};
const tb=document.querySelector('#pred59 tbody');
for(const k of Object.keys(D.P)){const tr=document.createElement('tr');tr.innerHTML=`<td>${k}</td><td>${D.P[k].text}</td><td>${R[k]}</td><td class="${D.P[k].held?'held':'failed'}">${D.P[k].held?'held':'failed'}</td>`;tb.appendChild(tr)}

draw();
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,120)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
})();
