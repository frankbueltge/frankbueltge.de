(function(){
const D=window.D57, P=D.predictions, Z=D.input.funnelZ, p0=D.input.p;
const days=D.days, S=['2026-07-30','2026-08-31'];
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const pct=x=>(100*x).toFixed(1)+' %';
const fmtD=s=>{const d=new Date(s+'T00:00:00Z');return d.getUTCDate()+' '+['January','February','March','April','May','June','July','August','September','October','November','December'][d.getUTCMonth()]};
const zn=z=>z||'an unnamed row (Boma Mangbetu, by the report’s prose)';
const sgn=x=>(x<0?'−':'+')+Math.abs(x).toFixed(2);
let dropMode=false, sel=S[0];

// answer
const a=P.P21.value[S[0]], b=P.P21.value[S[1]], C=D.correction54.study55_corrected;
document.getElementById('ans').innerHTML=
 `<p><b>No change is written down.</b> The zone table carries the same column labels on 30 July as on the report days either side of it, and on 31 August the same as on 30 August and 1 September. Across all 80 report days the labels were reworded once, on 17 August, a day inside the funnel. Neither report says that the swabbing of the dead changed; the lines about swabs are the day's tallies in sentences that keep their form.</p>`+
 `<p><b>Zones, not the instrument, carry the two days.</b> On 30 July, ${a.top.new} of the ${days.find(d=>d.date===S[0]).n} new cases were in ${a.top.zone}, and only ${a.top.comm} of them were found dead; ${a.top.zone} alone gives ${Math.round(100*a.topShare)} % of the day's shortfall. On 31 August the excess is spread: ${b.contrib.slice(0,3).map(c=>c.zone).join(', ')} together give most of it, ${b.top.zone} the largest part (${Math.round(100*b.topShare)} %). Without its most deviant zone each day falls back inside the funnel (z ${a.z.toFixed(2).replace('-','−')} → ${a.z2.toFixed(2).replace('-','−')}; ${b.z.toFixed(2)} → ${b.z2.toFixed(2)}). That test is weak: the same step pulls every day inside.</p>`+
 `<p>Four predictions, ${Object.values(P).filter(x=>x.held).length} held. On the way a parsing error in study 54 surfaced and is corrected below; the pooled share becomes ${pct(C.s)}, and the same two days stay outside.</p>`;

// canvas helper
function setup(id){const c=document.getElementById(id),r=window.devicePixelRatio||1,w=c.clientWidth,h=+c.getAttribute('height');c.width=w*r;c.height=h*r;c.style.height=h+'px';const x=c.getContext('2d');x.setTransform(r,0,0,r,0,0);return {c,x,w,h}}

// Figure 1: funnel
let pts=[];
function drawFun(){
 const {c,x,w,h}=setup('fun');const m={l:46,r:12,t:12,b:34};const W=w-m.l-m.r,H=h-m.t-m.b;
 const nmax=Math.max(...days.map(d=>d.n))*1.05;
 const X=n=>m.l+W*n/nmax, Y=s=>m.t+H*(1-s/0.8);
 x.font='12px system-ui,sans-serif';x.fillStyle=css('--mute');x.strokeStyle=css('--line');x.lineWidth=1;
 for(const s of [0,.2,.4,.6,.8]){x.beginPath();x.moveTo(m.l,Y(s));x.lineTo(w-m.r,Y(s));x.stroke();x.fillText(Math.round(100*s)+' %',4,Y(s)+4)}
 for(let n=0;n<=nmax;n+=50){x.fillText(n,X(n)-6,h-m.b+16)}
 x.fillText('new confirmed cases that day',w-m.r-190,h-4);
 x.strokeStyle=css('--fun');x.lineWidth=1.5;
 for(const sg of [1,-1]){x.beginPath();for(let n=8;n<=nmax;n+=1){const s=p0+sg*Z*Math.sqrt(p0*(1-p0)/n);const yy=Y(Math.max(0,Math.min(.8,s)));n===8?x.moveTo(X(n),yy):x.lineTo(X(n),yy)}x.stroke()}
 x.setLineDash([3,3]);x.beginPath();x.moveTo(X(0),Y(p0));x.lineTo(X(nmax),Y(p0));x.stroke();x.setLineDash([]);
 pts=[];
 for(const d of days){const k=dropMode?d.k2:d.k,n=dropMode?d.n2:d.n;if(!n)continue;const st=S.includes(d.date);
  const px=X(n),py=Y(k/n);pts.push({d,px,py});
  x.fillStyle=st?css('--hi'):css('--dot');x.globalAlpha=st?1:.75;x.beginPath();x.arc(px,py,st?5.5:3.5,0,7);x.fill();x.globalAlpha=1;
  if(d.date===sel){x.strokeStyle=css('--fg');x.lineWidth=1.5;x.beginPath();x.arc(px,py,8,0,7);x.stroke()}
  if(st){x.fillStyle=css('--fg');x.fillText(fmtD(d.date),px+8,py+(d.date===S[0]?14:-6))}}
 const out=days.filter(d=>{const k=dropMode?d.k2:d.k,n=dropMode?d.n2:d.n;return n&&Math.abs((k-n*p0)/Math.sqrt(n*p0*(1-p0)))>=Z});
 document.getElementById('rd').textContent=dropMode
  ?`Each day without its most deviant zone: ${out.length} of ${days.length} days outside the funnel. 30 July drops ${a.top.zone} and sits at z ${a.z2.toFixed(2).replace('-','−')}; 31 August drops ${b.top.zone} and sits at z ${b.z2.toFixed(2)}.`
  :`All zones: ${out.length} of ${days.length} report days outside the funnel, ${out.map(d=>fmtD(d.date)).join(' and ')}. Pooled, ${D.input.K.toLocaleString('en')} of ${D.input.N.toLocaleString('en')} new cases were community deaths (${pct(p0)}).`;
}
function pick(ev){const c=document.getElementById('fun'),r=c.getBoundingClientRect();const mx=ev.clientX-r.left,my=ev.clientY-r.top;let best=null,bd=18;
 for(const q of pts){const dd=Math.hypot(q.px-mx,q.py-my);if(dd<bd){bd=dd;best=q}}if(best&&best.d.date!==sel){sel=best.d.date;drawFun();drawZon()}}
document.getElementById('fun').addEventListener('pointermove',pick);document.getElementById('fun').addEventListener('pointerdown',pick);
for(const [id,v] of [['all',false],['drop',true]])document.getElementById(id).addEventListener('click',()=>{dropMode=v;document.getElementById('all').setAttribute('aria-pressed',!v);document.getElementById('drop').setAttribute('aria-pressed',v);drawFun()});

// Figure 2: zones of the chosen day
function drawZon(){
 const d=days.find(q=>q.date===sel);const zs=d.zones.slice(0,14);
 const c=document.getElementById('zon');c.setAttribute('height',Math.max(140,26+zs.length*22));
 const {x,w,h}=setup('zon');const lab=Math.min(170,w*.34),m={l:lab,r:110,t:8};const W=w-m.l-m.r;const nmax=Math.max(...zs.map(z=>z.new));
 x.font='13px system-ui,sans-serif';
 zs.forEach((z,i)=>{const y=m.t+i*22;x.fillStyle=css('--fg');x.textAlign='right';x.fillText((z.zone||'(unnamed row)').slice(0,22),lab-8,y+14);x.textAlign='left';
  x.fillStyle=css('--dot');x.globalAlpha=.5;x.fillRect(m.l,y+3,W*z.new/nmax,14);x.globalAlpha=1;
  x.fillStyle=css('--fg');x.fillRect(m.l,y+3,W*z.comm/nmax,14);
  x.strokeStyle=css('--fun');x.lineWidth=2;x.beginPath();x.moveTo(m.l+W*z.new*p0/nmax,y+1);x.lineTo(m.l+W*z.new*p0/nmax,y+19);x.stroke();
  x.fillStyle=css('--mute');x.fillText(`${z.comm} of ${z.new}  (${sgn(z.comm-z.new*p0)})`,m.l+W*z.new/nmax+6,y+14)});
 const more=d.zones.length-zs.length;
 document.getElementById('rd2').textContent=`${fmtD(d.date)} (report ${d.report}): ${d.k} of ${d.n} new cases were community deaths, ${pct(d.k/d.n)}, z ${d.z.toFixed(2).replace('-','−')}. The zone that pulls it furthest is ${zn(d.top.zone)}, ${d.top.comm} of ${d.top.new}; without it the day stands at ${d.k2} of ${d.n2}, z ${d.z2.toFixed(2).replace('-','−')}.`+(more>0?` ${more} smaller zones not drawn.`:'');
}

// Figure 3: wording by day
const H=D.headers.byDay;let hpos=[];
function drawHdr(){const {c,x,w,h}=setup('hdr');const m={l:4,r:4,t:22};const cw=(w-m.l-m.r)/H.length;hpos=[];
 x.font='12px system-ui,sans-serif';
 H.forEach((q,i)=>{const col=q.cls==='main'?css('--main'):q.cls==='layout'?css('--lay'):css('--alt');x.fillStyle=col;x.fillRect(m.l+i*cw+.5,m.t,Math.max(1,cw-1),46);hpos.push(m.l+i*cw);
  if(S.includes(q.date)){x.fillStyle=css('--hi');x.beginPath();x.moveTo(m.l+i*cw+cw/2,m.t+50);x.lineTo(m.l+i*cw+cw/2-5,m.t+60);x.lineTo(m.l+i*cw+cw/2+5,m.t+60);x.fill();x.fillStyle=css('--fg');x.textAlign=i>H.length/2?'right':'left';x.fillText(fmtD(q.date),m.l+i*cw+cw/2+(i>H.length/2?-8:8),m.t+74);x.textAlign='left'}});
 x.fillStyle=css('--mute');x.fillText(fmtD(H[0].date),m.l,14);x.textAlign='right';x.fillText(fmtD(H[H.length-1].date),w-m.r,14);x.textAlign='left';
}
function hdrAt(ev){const c=document.getElementById('hdr'),r=c.getBoundingClientRect();const mx=ev.clientX-r.left;const cw=(r.width-8)/H.length;const i=Math.max(0,Math.min(H.length-1,Math.floor((mx-4)/cw)));showHdr(i)}
function showHdr(i){const q=H[i],v=D.headers.versions[q.v];
 document.getElementById('rd3').textContent=`${fmtD(q.date)} (report ${q.report}): `+(q.cls==='main'?'the main wording, carried on '+v.days+' of '+H.length+' report days.':q.cls==='layout'?'the main wording, broken differently by the page layout.':'reworded: the labels read “nouveaux cas (24h)”, “décès communautaires”, “décès intra-CTE” and “ZS ayant notifié des cas”, and the tag “(Swab+)” is missing. The day is inside the funnel.')}
document.getElementById('hdr').addEventListener('pointermove',hdrAt);document.getElementById('hdr').addEventListener('pointerdown',hdrAt);

// predictions
const tb=document.querySelector('#pred tbody');
const f19=P.P19.value,f22=P.P22.value;
const rows=[
 ['P19',PREDtext('P19'),`30 July = 26 and 31 July: ${f19[S[0]].same_before&&f19[S[0]].same_after?'yes':'no'}; 31 August = 30 August and 1 September: ${f19[S[1]].same_before&&f19[S[1]].same_after?'yes':'no'}. First run (whole lines) said failed; the instrument, not the table, was at fault (READING57.md).`,P.P19],
 ['P20',PREDtext('P20'),`${P.P20.value[S[0]].new_lines.length} and ${P.P20.value[S[1]].new_lines.length} lines new against the neighbours, all read: day tallies, a re-sample note, a burial team attacked; none a change of practice.`,P.P20],
 ['P21',PREDtext('P21'),`${a.top.zone}: z ${a.z.toFixed(2).replace('-','−')} → ${a.z2.toFixed(2).replace('-','−')}; ${b.top.zone}: ${b.z.toFixed(2)} → ${b.z2.toFixed(2)}. The same drop brings every day inside, so the test is weak.`,P.P21],
 ['P22',PREDtext('P22'),`30 July ${f22[S[0]].prov_sum} of ${f22[S[0]].prov_new} = ours ${f22[S[0]].zone_sum} of ${f22[S[0]].zone_new}; 31 August ${f22[S[1]].prov_sum} of ${f22[S[1]].prov_new} = ours ${f22[S[1]].zone_sum} of ${f22[S[1]].zone_new}.`,P.P22]];
function PREDtext(k){return {P19:'The zone table’s column labels on both days are word for word those of both neighbouring report days.',P20:'Neither report holds a new sentence that, read, describes a change in sampling or testing the dead.',P21:'Removing the single most deviant zone brings each day inside the funnel.',P22:'The report’s own province rows print the same day counts as our zone sum.'}[k]}
for(const [k,t,f,v] of rows){const tr=document.createElement('tr');const cls=v.informative===false?'uninf':v.held?'held':'failed';
 tr.innerHTML=`<td>${k}</td><td>${t}</td><td>${f}</td><td class="${cls}">${v.held?'held':'failed'}${v.informative===false?' (weak)':''}</td>`;tb.appendChild(tr)}

// correction
const L=D.correction54.leaked[0],A=D.correction54.study55_as_published;
document.getElementById('corr').innerHTML=`<p><b>Corrected 2026-11-06.</b> On 26 July (report ${L.report}) study 54 read the table from a mention of it in the prose above Tableau 1, so the day’s Total, Ituri and Haut-Uélé rows were counted as zones: the day stood at ${L.before.k} of ${L.before.n}, and is ${L.after.k} of ${L.after.n}. Corrected, the pooled share is <b>${C.k.toLocaleString('en')} of ${C.n.toLocaleString('en')} = ${pct(C.s)}</b> (${pct(C.wilson[0])}–${pct(C.wilson[1])}), not ${A.k.toLocaleString('en')} of ${A.n.toLocaleString('en')} = ${pct(A.s)}; φ is ${C.phi.toFixed(2)}, not ${A.phi.toFixed(2)}; ρ(date) ${C.rho_date.toFixed(2).replace('-','−')}; the halves ${pct(C.halves[0])} and ${pct(C.halves[1])}. The same two days stay outside the funnel. No conclusion of studies 54 or 55 changes. The figures above use study 55’s series as published, so that the two days are the ones the Studio asked about.</p>`;

function all(){drawFun();drawZon();drawHdr()}
all();showHdr(H.findIndex(q=>q.date===S[0]));
let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(all,120)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',all);
})();
