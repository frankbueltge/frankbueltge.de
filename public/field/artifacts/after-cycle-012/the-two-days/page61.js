(function(){
const D=window.D61, R=D.reports;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtD=s=>{const d=new Date(s+'T00:00:00Z');return d.getUTCDate()+' '+MON[d.getUTCMonth()]};
const pts1=x=>(x<0?'−':'+')+Math.abs(100*x).toFixed(1);
const PROV={ituri:'Ituri',nordkivu:'North Kivu',hautuele:'Haut-Uélé',total:'below the total row'};
const p35=D.p35, fx=p35.fixes, held=Object.values(D.P).filter(x=>x.held).length;
const inv=R.reduce((a,r)=>a+r.invalid.length,0);
const st=D.stale, s169=D.self169;
document.getElementById('ans61').innerHTML=
 `<p><b>No zone is missing on either day. Our parser lost one cell on the first and threw away seven readable rows on the second.</b> On 6 October Adja's one new case is printed on a line of its own beneath Adja's row, and the parser read the row as empty: with it, Ituri's zones sum to ${fx[0].now[0]} new cases and ${fx[0].now[1]} community deaths, the report's own row. On 30 October all 29 of Ituri's rows were read, every one with its four day-cells, and seven were rejected by the guard that catches a row shifted out of its columns. Read whole, the zones sum to ${s169.zones.new} and ${s169.zones.comm}; the report's Ituri row says ${s169.province.new} and ${s169.province.comm}. On that day the report disagrees with itself by one community death, and by one death in a treatment centre (${s169.zones.cte} against ${s169.province.cte}).</p>`+
 `<p><b>Why the guard fired.</b> It rejects a row whose printed fatality rate does not match the row's own cumulative cases and deaths. On 30 October it rejected ${st.rows.filter(r=>r.report===169).length} rows in Ituri and North Kivu on that ground alone, and ${st.same_as_previous_report} of them print exactly the rate of the report before: the counts were updated and the rate was not. The seventh of Ituri's rows, Mongbwalu, was rejected for its total: 10 deaths for a day of 1. Both were found after the predictions were scored, and are descriptive.</p>`+
 `<p><b>Study 59 stands.</b> With both days restored the difference is ${pts1(p35.restored.diff)} points (95 % interval ${pts1(p35.restored.ci95[0])} to ${pts1(p35.restored.ci95[1])}), against ${pts1(p35.published.diff)} (${pts1(p35.published.ci95[0])} to ${pts1(p35.published.ci95[1])}) as published. Across all 80 report days the parser rejected ${inv} of ${D.rows.toLocaleString('en')} zone rows; ${D.p36.guard_only} of Ituri's and North Kivu's ${D.p36.rows.toLocaleString('en')} were readable rows rejected for their rate alone, all on 30 October. Adja's kind of wrapped cell occurs once (${D.p37.reports} report). Readmitting every such row moves the series' share of community deaths from ${(100*D.p38.published[2]).toFixed(2)} % to ${(100*D.p38.readmitted[2]).toFixed(2)} %. Four predictions, ${held} held.</p>`;

function setup(id){const c=document.getElementById(id),r=window.devicePixelRatio||1,w=c.clientWidth,h=+c.getAttribute('height');c.width=w*r;c.height=h*r;c.style.height=h+'px';const x=c.getContext('2d');x.setTransform(r,0,0,r,0,0);return {c,x,w,h}}
const kind=v=>v.why.length===1&&v.why[0]==='fatality'&&v.how==='k4'?'rate':v.why.includes('total')?'total':v.why.includes('community')?'comm':'other';
const KC={rate:'--fun',total:'--hi',comm:'--lo',other:'--lay'};
let hov=null, geo=null;
function draw(){
 const {x,w,h}=setup('thrown');
 const mm={l:34,r:10,t:16,b:40};const W=w-mm.l-mm.r,H=h-mm.t-mm.b,n=R.length,cw=W/n;
 const maxk=Math.max(...R.map(r=>r.invalid.length+r.lone.length)),sq=Math.min((H-6)/maxk,14),sw=Math.max(2,Math.min(cw-1,sq));
 geo={mm,cw,n};
 x.font='12px system-ui,sans-serif';x.textBaseline='alphabetic';
 x.strokeStyle=css('--line');x.lineWidth=1;x.beginPath();x.moveTo(mm.l,mm.t+H);x.lineTo(mm.l+W,mm.t+H);x.stroke();
 x.fillStyle=css('--mute');for(const k of [0,5,10]){if(k>maxk)continue;const yy=mm.t+H-k*sq;x.fillText(String(k),6,yy+4)}
 R.forEach((r,i)=>{const x0=mm.l+i*cw;
  if(hov===i){x.fillStyle=css('--card');x.fillRect(x0,mm.t,cw,H)}
  x.fillStyle=css('--line');x.fillRect(x0+cw/2-.5,mm.t+H,1,4);
  let k=0;
  r.invalid.forEach(v=>{const yy=mm.t+H-(k+1)*sq;x.fillStyle=css(KC[kind(v)]);x.fillRect(x0+(cw-sw)/2,yy+.5,sw,sq-1);if(v.prov==='ituri'&&sw>4){x.strokeStyle=css('--fg');x.lineWidth=1;x.strokeRect(x0+(cw-sw)/2+.5,yy+1,sw-1,sq-2)}else if(v.prov==='ituri'){x.fillStyle=css('--fg');x.fillRect(x0+(cw-sw)/2,yy+sq-2.5,sw,1.5)}k++});
  r.lone.forEach(()=>{const yy=mm.t+H-(k+.5)*sq;x.strokeStyle=css('--fg');x.lineWidth=1.5;x.beginPath();x.arc(x0+cw/2,yy,Math.max(2.5,Math.min(sq,cw)/2-1.5),0,7);x.stroke();k++});
 });
 x.fillStyle=css('--mute');x.fillText(fmtD(R[0].date),mm.l,mm.t+H+18);x.textAlign='right';x.fillText(fmtD(R[n-1].date),mm.l+W,mm.t+H+18);
 for(const q of [145,169]){const i=R.findIndex(r=>r.report===q);if(i>=0){x.fillStyle=css('--fg');const lab=w<620?fmtD(R[i].date).replace(/ (\w{3})\w*/,' $1'):fmtD(R[i].date),tw=x.measureText(lab).width;const cx=Math.min(mm.l+(i+.5)*cw-tw/2,w-mm.r-tw);x.fillText(lab,cx,mm.t+H+34)}}
 read();
}
function cellsTxt(v){const c=v.cells.map(a=>a===null?'–':a);return `${v.name} (${PROV[v.prov]||v.prov}): new ${c[0]}, community ${c[1]}, in a centre ${c[2]}, total ${c[3]}; printed rate ${v.cfr} %, its own counts give ${v.calc} %`}
function read(){
 let s;
 if(hov===null){s=`80 report days, from ${fmtD(R[0].date)} to ${fmtD(R[R.length-1].date)}. Point at a day to read the rows the parser threw away.`}
 else{const r=R[hov];
  s=`${fmtD(r.date)} (report ${r.report}), ${r.zones} zone rows. `;
  if(!r.invalid.length&&!r.lone.length)s+='Nothing thrown away.';
  if(r.lone.length)s+=r.lone.map(l=>`A line of its own beneath ${l.after}'s row carries ${l.cells.join(' and ')}: ${l.after}'s new cases and total, which the parser read as empty. `).join('');
  if(r.invalid.length)s+=`Rejected: `+r.invalid.map(v=>cellsTxt(v)+(kind(v)==='rate'?' (rate only)':kind(v)==='total'?' (total does not add up)':kind(v)==='comm'?' (more community deaths than new cases)':'')).join('; ')+'.';
  if(r.report===169)s+=` Read whole, Ituri's zones sum to ${s169.zones.new} new and ${s169.zones.comm} community; the report's row says ${s169.province.new} and ${s169.province.comm}.`;
 }
 document.getElementById('rd61').textContent=s;
}
function pick(ev){const c=document.getElementById('thrown'),r=c.getBoundingClientRect();const mx=ev.clientX-r.left;const i=Math.floor((mx-geo.mm.l)/geo.cw);const nv=i>=0&&i<geo.n?i:null;if(nv!==hov){hov=nv;draw()}}
const cv=document.getElementById('thrown');
cv.addEventListener('pointermove',pick);cv.addEventListener('pointerdown',pick);cv.addEventListener('pointerleave',()=>{hov=null;draw()});
const RT={P35:`${pts1(p35.published.diff)} → ${pts1(p35.restored.diff)} points; interval ${pts1(p35.restored.ci95[0])} to ${pts1(p35.restored.ci95[1])}`,
 P36:`${D.p36.guard_only} of ${D.p36.rows.toLocaleString('en')} rows (${(100*D.p36.share).toFixed(2)} %), all in report 169`,
 P37:`${D.p37.reports} report, ${D.p37.cells} line (report 145, Adja)`,
 P38:`${(100*D.p38.published[2]).toFixed(2)} % → ${(100*D.p38.readmitted[2]).toFixed(2)} % (${D.p38.readmitted_rows} rows readmitted)`};
const tb=document.querySelector('#pred61 tbody');
for(const k of ['P35','P36','P37','P38']){const tr=document.createElement('tr');tr.innerHTML=`<td>${k}</td><td>${D.P[k].text}</td><td>${RT[k]}</td><td class="${D.P[k].held?'held':'failed'}">${D.P[k].held?'held':'failed'}</td>`;tb.appendChild(tr)}
draw();
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,120)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
})();
