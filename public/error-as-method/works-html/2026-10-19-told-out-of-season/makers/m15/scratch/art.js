function build(G){
  const W=1100,H=800,NC=296,ND=61,cpd=NC/ND;
  const top=104,bot=748,rowH=(bot-top)/ND;
  const xL=150,xR=1000; // value: image row 84 (low) -> xL, row 5 (high) -> xR
  const vx=r=>xL+(84-r)/(84-5)*(xR-xL);
  const ink='#1d1b19', paper='#f3efe6';
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  s+=`<rect width="${W}" height="${H}" fill="${paper}"/>`;
  // per-day weighted centre for the hairline
  const cen=[];
  for(let d=0;d<ND;d++){
    let sw=0,sy=0;
    for(let c=Math.floor(d*cpd);c<Math.min(NC,Math.ceil((d+1)*cpd));c++)for(let r=0;r<90;r++){const w=parseInt(G[r][c],16);sw+=w;sy+=w*r;}
    cen.push(sy/sw);
  }
  // dots: each pixel column is a slice of a day; its hour-position sets a small drop inside the row
  let dots='';
  for(let c=0;c<NC;c++){
    const t=(c+0.5)/cpd, d=Math.floor(t), f=t-d;
    const y=top+d*rowH+1.5+f*(rowH-3);
    for(let r=0;r<90;r++){
      const w=parseInt(G[r][c],16); if(w<2) continue;
      const a=(w/15)*0.62;
      dots+=`<ellipse cx="${vx(r).toFixed(1)}" cy="${y.toFixed(1)}" rx="7.6" ry="1.3" fill-opacity="${a.toFixed(2)}"/>`;
    }
  }
  s+=`<g fill="${ink}">${dots}</g>`;
  // centre hairline
  let p='';
  cen.forEach((r,d)=>{p+=(d?'L':'M')+vx(r).toFixed(1)+' '+(top+(d+0.5)*rowH).toFixed(1);});
  s+=`<path d="${p}" fill="none" stroke="#b5432a" stroke-width="0.9" stroke-opacity="0.7"/>`;
  // margins: date marks every Monday-free, just month starts and ends
  const lab=(d,t)=>`<text x="${xL-26}" y="${(top+(d+0.5)*rowH+3.5).toFixed(1)}" text-anchor="end">${t}</text>`+
    `<line x1="${xL-18}" x2="${xL-8}" y1="${(top+(d+0.5)*rowH).toFixed(1)}" y2="${(top+(d+0.5)*rowH).toFixed(1)}" stroke="${ink}" stroke-width="0.6"/>`;
  s+=`<g font-family="Georgia, 'Times New Roman', serif" font-size="11" fill="#6b645a" letter-spacing="0.6">`;
  s+=lab(0,'15 Oct')+lab(17,'1 Nov')+lab(47,'1 Dec')+lab(60,'14 Dec');
  s+=`<text x="${xR}" y="${bot+30}" text-anchor="end" font-style="italic">one row per day · within a row, the day’s hours fall gently downward · further right is more</text>`;
  s+=`</g>`;
  s+=`<text x="${xL}" y="62" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="${ink}" letter-spacing="1">Sixty-one Breaths</text>`;
  s+=`<text x="${xL}" y="84" font-family="Georgia, 'Times New Roman', serif" font-size="12" fill="#6b645a" font-style="italic" letter-spacing="0.5">an hourly record, 15 October – 14 December 2025, turned on its side</text>`;
  return s+'</svg>';
}
if(typeof module!=='undefined') module.exports=build;
