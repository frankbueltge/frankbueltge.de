(function(){
const D=window.D60, S=D.strip, Q=D.post;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtD=s=>{const d=new Date(s+'T00:00:00Z');return d.getUTCDate()+' '+MON[d.getUTCMonth()]};
const of=a=>`${a[0]} of ${a[1]}`;
const held=Object.values(D.P).filter(x=>x.held).length;
document.getElementById('ans60').innerHTML=
 `<p><b>Yes, a change in format coincides, but the day is hidden.</b> North Kivu writes “sans échec” for the last time in report ${D.last} (18 October). The next six reports, 158 to 163 (19 to 24 October), are not in the archive. Whatever changed, changed inside that hole.</p>`+
 `<p><b>What changed across the hole is the whole section, not North Kivu's sentence alone.</b> From report 164 a document make never seen before carries the reports: Word 2016, in ${of(Q.word2016.after_hole)} reports after the hole and ${of(Q.word2016.before_hole)} before it. Both provinces' sentences take the same new template, “N burials done on N alerts … N bodies swabbed”: Ituri in ${of(Q.templates_after_hole.ituri_B)} reports, North Kivu in ${of(Q.templates_after_hole.nk_B)}. Before the hole, 6 to 18 October, both opened “On N alerts received …” (Ituri ${of(Q.templates_145_157.ituri_A)}, North Kivu ${of(Q.templates_145_157.nk_A)}). The phrase “sans échec” appears in no report after the hole, in any province.</p>`+
 `<p>Six predictions, ${held} held. The hypothesis, that North Kivu's writer changed and the document did not, is refuted. The make alone is no explanation: it changes between neighbouring reports ${of(Q.make_changes)} times, and the two reports after the hole made with Word 2021 also use the new template.</p>`;
function setup(id){const c=document.getElementById(id),r=window.devicePixelRatio||1,w=c.clientWidth,h=+c.getAttribute('height');c.width=w*r;c.height=h*r;c.style.height=h+'px';const x=c.getContext('2d');x.setTransform(r,0,0,r,0,0);return {c,x,w,h}}
const MK={'LTSC':'--dot','2021':'--main','2016':'--fun'};
const TC={'A':'--lo','B':'--fun','C':'--lay'};
let hov=null, geo=null;
function draw(){
 const {x,w,h}=setup('fmt');
 const narrow=w<620, lab=narrow?0:150, mm={l:8+lab,r:8,t:narrow?28:14,b:28};
 const W=w-mm.l-mm.r, n=S.length, cw=W/n, rows=[['make','the document’s make'],['it','Ituri’s sentence'],['nk','North Kivu’s sentence']];
 const rh=(h-mm.t-mm.b-14)/3;
 geo={mm,cw,n};
 x.font='12px system-ui,sans-serif';x.textBaseline='middle';
 rows.forEach(([k,l],j)=>{const y0=mm.t+j*rh;
  x.fillStyle=css('--mute');if(narrow){x.fillText(l,mm.l,y0-8+ (j===0?0:4))}else x.fillText(l,8,y0+rh/2);
  S.forEach((d,i)=>{const x0=mm.l+i*cw,yy=y0+(narrow?4:2),hh=rh-(narrow?8:4);
   if(!d.present){x.strokeStyle=css('--line');x.lineWidth=1;x.save();x.beginPath();x.rect(x0,yy,cw,hh);x.clip();for(let s=-hh;s<cw+hh;s+=4){x.beginPath();x.moveTo(x0+s,yy);x.lineTo(x0+s-hh,yy+hh);x.stroke()}x.restore();return}
   let col=null;if(k==='make')col=MK[d.make];else col=d[k]?TC[d[k]]:null;
   if(col){x.fillStyle=css(col);x.fillRect(x0+.5,yy,Math.max(1,cw-1),hh)}else{x.strokeStyle=css('--line');x.strokeRect(x0+1,yy+1,Math.max(1,cw-2),hh-2)}
   if(k==='nk'&&d.nksans){x.fillStyle=css('--fg');x.beginPath();x.arc(x0+cw/2,yy+hh/2,Math.min(cw*.3,5),0,7);x.fill()}
   if(k!=='make'&&d[k]&&cw>11){x.fillStyle=css('--bg');x.textAlign='center';x.fillText(d[k],x0+cw/2,yy+hh-7);x.textAlign='left'}
  });
 });
 // the hole
 const i0=S.findIndex(d=>d.n===158),i1=S.findIndex(d=>d.n===163);
 const hx=mm.l+i0*cw, hw=(i1-i0+1)*cw, yb=mm.t+3*rh;
 x.strokeStyle=css('--hi');x.lineWidth=1.5;x.strokeRect(hx,mm.t,hw,3*rh);
 x.fillStyle=css('--hi');x.textAlign='center';x.fillText('not in the archive',Math.min(Math.max(hx+hw/2,60),w-60),yb+10);x.textAlign='left';
 x.fillStyle=css('--mute');x.fillText(fmtD(S[0].date)+' · report '+S[0].n,mm.l,yb+24);x.textAlign='right';x.fillText('report '+S[n-1].n+' · '+fmtD(S[n-1].date),mm.l+W,yb+24);x.textAlign='left';
 if(hov!==null){x.strokeStyle=css('--fg');x.lineWidth=2;x.strokeRect(mm.l+hov*cw,mm.t,cw,3*rh)}
 read();
}
const tr={'A':'opens “On N alerts …”','B':'opens “N burials done on N alerts …”','C':'another opening'};
function read(){
 const el=document.getElementById('rd60');
 if(hov===null){el.innerHTML='Point at a report, or tap it, to read its make and both provinces’ sentences on the dead.';return}
 const d=S[hov];
 if(!d.present){el.innerHTML=`<b>Report ${d.n}</b> is not in the archive (INRB-UMIE/BDBV2026-Data at 338e578): no PDF.`;return}
 const q=(p,k,c)=>c?`${p}: <i>« ${d[k]} »</i> (${tr[c]})`:`${p}: no line on the dead`;
 el.innerHTML=`<b>${fmtD(d.date)} (report ${d.n})</b> · made with Word ${d.make}, ${d.pages} pages · “sans échec” ${d.sans?`appears ${d.sans} time${d.sans>1?'s':''}`:'does not appear'} in the report<br>${q('Ituri','itq',d.it)}<br>${q('North Kivu','nkq',d.nk)}${d.nksans?' · <b>writes no failure</b>':''}`;
}
const cv=document.getElementById('fmt');
function pick(e){const r=cv.getBoundingClientRect(),i=Math.floor((e.clientX-r.left-geo.mm.l)/geo.cw);hov=(i>=0&&i<geo.n)?i:null;draw()}
cv.addEventListener('pointermove',pick);cv.addEventListener('pointerdown',pick);cv.addEventListener('pointerleave',()=>{hov=null;draw()});
draw();
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,120)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
const PT={P32:['The make holds: Creator and Producer of reports 164 and 165 equal those of 157.','157 Word 2021; 164 and 165 Word 2016'],
 P33:['The outline holds: the headings of 165 differ from 157 by no more than the median between neighbours (140–157).',`${D.p33.d} headings differ; the median is ${D.p33.med}`],
 P34:['Ituri’s sentence keeps its template from 157 to 165.','157 another opening; 165 “N burials done on N alerts”'],
 P35:['North Kivu opens “On N alerts” on at least 80 % of 145–157 and on none of 165–174 (partly seen before writing).',`${of(Q.templates_145_157.nk_A)} before; 0 after`],
 P36:['“sans échec” appears in no report 164–174, in any province.','0 in 10 reports'],
 P37:['The archive’s own processed table has a row for a date 19–24 October (partly seen).','19, 21 and 24 October']};
document.querySelector('#pred60 tbody').innerHTML=Object.entries(PT).map(([k,[p,f]])=>`<tr><td>${k}</td><td>${p}</td><td>${f}</td><td class="${D.P[k].held?'held':'failed'}">${D.P[k].held?'held':'failed'}</td></tr>`).join('');
})();
