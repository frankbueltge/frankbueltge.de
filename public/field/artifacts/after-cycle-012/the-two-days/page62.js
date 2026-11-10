(function(){
const D=window.D62, F=D.fig, A=D.answer, P=D.P;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtD=s=>{const d=new Date(s+'T00:00:00Z');return d.getUTCDate()+' '+MON[d.getUTCMonth()]};
const PROV={ituri:'Ituri',nordkivu:'North Kivu',hautuele:'Haut-Uélé',tshopo:'Tshopo',basuele:'Bas-Uélé',sudkivu:'South Kivu',sudubangi:'Sud-Ubangi',nordubangi:'Nord-Ubangi'};
const pc=v=>(100*v.share).toFixed(1)+' %';
const held=Object.values(P).filter(x=>x.held).length;
const it=D.ituri, i168=it[0], i169=it[1], i170=it[2];
const zb=F.reduce((a,f)=>a+f.zb.length,0), zn=F.reduce((a,f)=>a+f.zones,0);
const zup=F.reduce((a,f)=>a+f.zb.filter(v=>v.step>v.day).length,0), z94=(F.find(f=>f.report===94)||{zb:[]}).zb.length;
document.getElementById('ans62').innerHTML=
 `<p><b>The cumulative sides with the report's own Ituri row.</b> Ituri's cumulative deaths go from ${i168.row.dth.toLocaleString('en')} on 29 October to ${i169.row.dth.toLocaleString('en')} on 30 October: a step of ${A.row_step_30oct}, exactly the row's ${i169.row.comm} community and ${i169.row.cte} treatment-centre deaths. The zones' own cells for that day add up to ${A.zone_comm_cte_30oct} (${i169.zones.comm} and ${i169.zones.cte}), and their printed totals to ${A.zone_day_30oct}, because Mongbwalu prints 10 beside 1 and 0. Neither entered the cumulative.</p>`+
 `<p><b>The zones' own cumulatives went their own way.</b> Summed, they moved by ${A.zone_step_30oct} that day, one fewer than the row: Mongbwalu's printed death never entered its cumulative, and Mambasa and Nizi each added one fewer than they printed. On 31 October the zones moved by ${A.zone_step_31oct} against the row's ${A.row_step_31oct}, and the two cumulatives agree again at ${i170.row.dth.toLocaleString('en')}. A cumulative counts deaths, not where they were met, so whether the twelfth or the thirteenth community death is right cannot be read from it: what can be read is that the row's day, not the zones', is the one the province carried forward.</p>`+
 `<p><b>Across 62 pairs of consecutive report days</b> the province rows step by their own printed day ${pc(P.P39.value)} of the time (${P.P39.value.k} of ${P.P39.value.n}); the 5 that do not fall on 4 August and on 17 August, when every province's cumulative jumped (Ituri by ${D.post_hoc.report94_province_steps[0].step} for a day of ${D.post_hoc.report94_province_steps[0].day}). The zones keep their step ${pc(D.post_hoc.named_zone_pairs)} of the time (${D.post_hoc.named_zone_pairs.k} of ${D.post_hoc.named_zone_pairs.n} zone-pairs with a death on either side), and when a zone breaks it, the cumulative took more than the day printed in ${zup} of ${zb}; ${z94} of the ${zb} breaks fall on 17 August. Five predictions, ${held} held: the zones are looser than the provinces, but not as loose as predicted.</p>`;

function setup(id){const c=document.getElementById(id),r=window.devicePixelRatio||1,w=c.clientWidth,h=+c.getAttribute('height');c.width=w*r;c.height=h*r;c.style.height=h+'px';const x=c.getContext('2d');x.setTransform(r,0,0,r,0,0);return {c,x,w,h}}
let hov=null, geo=null;
function draw(){
 const {x,w,h}=setup('steps');
 const mm={l:34,r:10,t:30,b:40};const W=w-mm.l-mm.r,H=h-mm.t-mm.b,n=F.length,cw=W/n;
 const maxk=Math.max(...F.map(f=>f.zb.length)),sq=Math.min((H-6)/maxk,14),sw=Math.max(2,Math.min(cw-1,sq));
 geo={mm,cw,n};
 x.font='12px system-ui,sans-serif';
 x.strokeStyle=css('--line');x.lineWidth=1;x.beginPath();x.moveTo(mm.l,mm.t+H);x.lineTo(mm.l+W,mm.t+H);x.stroke();
 x.fillStyle=css('--mute');for(const k of [0,5,10]){if(k>maxk)continue;x.fillText(String(k),6,mm.t+H-k*sq+4)}
 x.fillText('province',w<620?2:mm.l,12);
 F.forEach((f,i)=>{const x0=mm.l+i*cw;
  if(hov===i){x.fillStyle=css('--card');x.fillRect(x0,mm.t-14,cw,H+14)}
  x.fillStyle=css('--line');x.fillRect(x0+cw/2-.5,mm.t+H,1,4);
  if(f.pb.length){x.fillStyle=css('--hi');x.fillRect(x0+(cw-sw)/2,mm.t-22,sw,Math.min(10,4+2*f.pb.length))}
  f.zb.forEach((v,k)=>{const yy=mm.t+H-(k+1)*sq;x.fillStyle=css(v.step>v.day?'--fun':'--lo');x.fillRect(x0+(cw-sw)/2,yy+.5,sw,sq-1);
   if(v.prov==='ituri'){if(sw>4){x.strokeStyle=css('--fg');x.lineWidth=1;x.strokeRect(x0+(cw-sw)/2+.5,yy+1,sw-1,sq-2)}else{x.fillStyle=css('--fg');x.fillRect(x0+(cw-sw)/2,yy+sq-2.5,sw,1.5)}}});
 });
 x.fillStyle=css('--mute');x.textAlign='left';x.fillText(fmtD(F[0].date),mm.l,mm.t+H+18);x.textAlign='right';x.fillText(fmtD(F[n-1].date),mm.l+W,mm.t+H+18);x.textAlign='left';
 for(const q of [94,169]){const i=F.findIndex(f=>f.report===q);if(i>=0){x.fillStyle=css('--fg');const lab=w<620?fmtD(F[i].date).replace(/ (\w{3})\w*/,' $1'):fmtD(F[i].date),tw=x.measureText(lab).width;const cx=Math.max(mm.l,Math.min(mm.l+(i+.5)*cw-tw/2,w-mm.r-tw));x.fillText(lab,cx,mm.t+H+34)}}
 read();
}
const one=v=>`${v.zone} (${PROV[v.prov]||v.prov}): cumulative ${v.step>=0?'+':'−'}${Math.abs(v.step)}, day printed ${v.day}`;
function read(){
 let s;
 if(hov===null){s=`${F.length} pairs of consecutive report days, from ${fmtD(F[0].date)} to ${fmtD(F[F.length-1].date)}; ${zb} of ${zn} zone steps with a death on either side break. Point at a day to read them.`}
 else{const f=F[hov];
  s=`${fmtD(f.date)} (report ${f.report}, against the report before): ${f.zones} zone steps with a death on either side. `;
  if(f.pb.length)s+='Province rows that break their step: '+f.pb.map(v=>`${PROV[v.prov]||v.prov}, cumulative +${v.step} for a day of ${v.day}`).join('; ')+'. ';
  s+=f.zb.length?'Zones that break it: '+f.zb.map(one).join('; ')+'.':'Every zone steps by its printed day.';
  if(f.report===169)s+=` Ituri's row: cumulative +${A.row_step_30oct}, its day ${A.row_day_30oct}; its zones together +${A.zone_step_30oct}.`;
 }
 document.getElementById('rd62').textContent=s;
}
function pick(ev){const c=document.getElementById('steps'),r=c.getBoundingClientRect();const i=Math.floor((ev.clientX-r.left-geo.mm.l)/geo.cw);const nv=i>=0&&i<geo.n?i:null;if(nv!==hov){hov=nv;draw()}}
const cv=document.getElementById('steps');
cv.addEventListener('pointermove',pick);cv.addEventListener('pointerdown',pick);cv.addEventListener('pointerleave',()=>{hov=null;draw()});
const RT={P39:`${P.P39.value.k} of ${P.P39.value.n} (${pc(P.P39.value)})`,
 P40:`${P.P40.value.k} of ${P.P40.value.n} (${pc(P.P40.value)}); below the provinces, but not under 90 %`,
 P41:`cases ${P.P41.value.k} of ${P.P41.value.n} (${pc(P.P41.value)}) against deaths ${pc(P.P40.value)}`,
 P42:`${P.P42.value.k} of ${P.P42.value.n} (${pc(P.P42.value)}); first reader of “A ventiler” ${pc(P.P42.first_run)}`,
 P43:`Ituri ${P.P43.value.ituri.k} of ${P.P43.value.ituri.n} (${pc(P.P43.value.ituri)}), North Kivu ${P.P43.value.nordkivu.k} of ${P.P43.value.nordkivu.n} (${pc(P.P43.value.nordkivu)})`};
const TX={P39:'Province rows step their cumulative deaths by their own printed day in at least 90 % of pairs.',
 P40:'Zone rows keep their death step less often than provinces, and in under 90 % of zone-pairs with a death on either side.',
 P41:'Zone rows keep their case step more often than their death step.',
 P42:"The zones' cumulative deaths plus “A ventiler” sum to the province row's on at least 90 % of province-reports.",
 P43:"Ituri's zones break their death step more often than North Kivu's."};
const tb=document.querySelector('#pred62 tbody');
for(const k of ['P39','P40','P41','P42','P43']){const tr=document.createElement('tr');tr.innerHTML=`<td>${k}</td><td>${TX[k]}</td><td>${RT[k]}</td><td class="${P[k].held?'held':'failed'}">${P[k].held?'held':'failed'}</td>`;tb.appendChild(tr)}
draw();
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,120)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
})();
