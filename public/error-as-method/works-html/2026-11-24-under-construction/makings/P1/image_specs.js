// Each spec: canvas size, fixed palette, frames, and a draw body (ctx, f, w, h, rnd).
const KEY = '#ff00ff';
module.exports = [
  {
    name: 'bg.gif', w: 96, h: 96,
    palette: ['#ece4ce', '#ded4ba', '#f6f0e0', '#cdc3a8'],
    draw: `
      ctx.fillStyle='#ece4ce'; ctx.fillRect(0,0,w,h);
      for (let y=0;y<h;y++) for (let x=0;x<w;x++){ const r=rnd();
        if(r<0.10){ctx.fillStyle='#ded4ba';ctx.fillRect(x,y,1,1);}
        else if(r<0.14){ctx.fillStyle='#f6f0e0';ctx.fillRect(x,y,1,1);}
        else if(r<0.15){ctx.fillStyle='#cdc3a8';ctx.fillRect(x,y,1,1);} }`
  },
  {
    name: 'track.gif', w: 468, h: 14, transparent: 0,
    palette: [KEY, '#6e4828', '#5a5a60', '#b4b4be'],
    draw: `
      ctx.fillStyle='#6e4828'; for(let x=2;x<w;x+=9) ctx.fillRect(x,1,5,12);
      ctx.fillStyle='#5a5a60'; ctx.fillRect(0,3,w,2); ctx.fillRect(0,9,w,2);
      ctx.fillStyle='#b4b4be'; ctx.fillRect(0,3,w,1); ctx.fillRect(0,9,w,1);`
  },
  {
    name: 'train.gif', w: 220, h: 42, frames: 24, delay: 9, transparent: 0,
    palette: [KEY, '#141414', '#aa1414', '#3c3c3c', '#c8c8c8', '#fadc5a', '#6e4828', '#5a5a60', '#e6e6e6', '#888888'],
    draw: `
      const H=h; ctx.fillStyle='#5a5a60'; ctx.fillRect(0,H-6,w,2);
      ctx.fillStyle='#6e4828'; for(let x=1;x<w;x+=9) ctx.fillRect(x,H-4,5,3);
      const ox=-90+f*13, oy=8;
      const R=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),ww,hh);};
      R(ox+4,oy+10,32,13,'#141414'); R(ox+36,oy+3,17,20,'#141414'); R(ox+39,oy+6,9,7,'#fadc5a');
      R(ox+33,oy+1,22,3,'#aa1414'); R(ox+8,oy+1,6,9,'#141414'); R(ox+6,oy,10,2,'#141414');
      R(ox+20,oy+6,7,4,'#141414'); R(ox+1,oy+22,54,3,'#aa1414');
      ctx.fillStyle='#aa1414'; ctx.beginPath(); ctx.moveTo(ox+4,oy+22); ctx.lineTo(ox-4,oy+29); ctx.lineTo(ox+6,oy+29); ctx.fill();
      [[ox+12,6],[ox+26,6],[ox+45,5]].forEach(([cx,r],i)=>{ ctx.fillStyle='#3c3c3c'; ctx.beginPath(); ctx.arc(cx,oy+28,r,0,7); ctx.fill();
        ctx.strokeStyle='#c8c8c8'; ctx.lineWidth=1; const a=f*0.9+i; ctx.beginPath(); ctx.moveTo(cx-Math.cos(a)*r,oy+28-Math.sin(a)*r); ctx.lineTo(cx+Math.cos(a)*r,oy+28+Math.sin(a)*r); ctx.stroke(); });
      const a=f*0.9; R(ox+12+Math.cos(a)*3,oy+27+Math.sin(a)*3,15,2,'#c8c8c8');
      R(ox+58,oy+9,24,15,'#141414'); R(ox+58,oy+7,24,2,'#3c3c3c'); R(ox+53,oy+21,5,2,'#141414');
      [ox+63,ox+77].forEach(cx=>{ctx.fillStyle='#3c3c3c';ctx.beginPath();ctx.arc(cx,oy+28,4,0,7);ctx.fill();});
      ctx.fillStyle='#fadc5a'; ctx.fillRect(ox+1,oy+12,3,3);
      for(let k=0;k<4;k++){ const sx=ox+11-k*10-(f%2)*2, sy=oy-3-k*1.5+((f+k)%2), r=2.5+k*1.2;
        ctx.fillStyle=k<2?'#e6e6e6':'#c8c8c8'; ctx.beginPath(); ctx.arc(sx,sy,r,0,7); ctx.fill(); }`
  },
  {
    name: 'constr.gif', w: 64, h: 58, frames: 2, delay: 40, transparent: 0,
    palette: [KEY, '#fad200', '#000000'],
    draw: `
      ctx.fillStyle='#fad200'; ctx.strokeStyle='#000'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(32,1); ctx.lineTo(62,29); ctx.lineTo(32,57); ctx.lineTo(2,29); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(32,5); ctx.lineTo(58,29); ctx.lineTo(32,53); ctx.lineTo(6,29); ctx.closePath(); ctx.stroke();
      ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(24,17,3,0,7); ctx.fill();
      ctx.lineWidth=2; const L=(a,b,c,d)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();};
      L(24,20,28,33); L(28,33,23,43); L(28,33,34,43);
      if(f==0){L(25,25,35,30); L(35,30,43,40);} else {L(25,25,35,22); L(35,22,44,28);}
      ctx.beginPath(); ctx.moveTo(37,44); ctx.lineTo(50,44); ctx.lineTo(44,37); ctx.fill();`
  },
  {
    name: 'new.gif', w: 34, h: 15, frames: 2, delay: 50,
    palette: ['#dc0000', '#ffff00'],
    draw: `
      ctx.fillStyle=f?'#ffff00':'#dc0000'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle=f?'#dc0000':'#ffff00'; ctx.font='bold 11px Arial'; ctx.fillText('NEW!',3,12);`
  },
  {
    name: 'mail.gif', w: 34, h: 24, transparent: 0,
    palette: [KEY, '#ffffff', '#000000', '#c80000'],
    draw: `
      ctx.fillStyle='#fff'; ctx.fillRect(1,3,31,19); ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.strokeRect(1.5,3.5,30,18);
      ctx.beginPath(); ctx.moveTo(2,4); ctx.lineTo(16.5,14); ctx.lineTo(31,4); ctx.stroke();
      ctx.fillStyle='#c80000'; ctx.fillRect(25,6,5,5);`
  },
  {
    name: 'count.gif', w: 80, h: 20,
    palette: ['#000000', '#1e1e1e', '#787878', '#50ff50'],
    draw: `
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
      const s='004127'; for(let i=0;i<6;i++){ const x=1+i*13; ctx.fillStyle='#1e1e1e'; ctx.fillRect(x,1,12,18);
        ctx.strokeStyle='#787878'; ctx.strokeRect(x+.5,1.5,11,17);
        ctx.fillStyle='#50ff50'; ctx.font='bold 14px Courier New'; ctx.fillText(s[i],x+2,15); }`
  },
  {
    name: 'bullet.gif', w: 14, h: 14, transparent: 0,
    palette: [KEY, '#961414'],
    draw: `
      ctx.fillStyle='#961414'; ctx.beginPath();
      [[1,1],[12,1],[11,5],[13,6],[6.5,13],[0,6],[2,5]].forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.fill();`
  },
  {
    name: 'ring.gif', w: 120, h: 44,
    palette: ['#000080', '#ffffff', '#ffff00', '#c0c0c0', '#ff0000'],
    draw: `
      ctx.fillStyle='#000080'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#ffff00'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(22,22,14,0,7); ctx.stroke();
      ctx.strokeStyle='#c0c0c0'; ctx.lineWidth=1; for(let a=0;a<6.28;a+=0.5){ctx.beginPath();ctx.moveTo(22+Math.cos(a)*10,22+Math.sin(a)*10);ctx.lineTo(22+Math.cos(a)*18,22+Math.sin(a)*18);ctx.stroke();}
      ctx.fillStyle='#ffffff'; ctx.font='bold 11px Arial'; ctx.fillText('Model RR',44,18);
      ctx.fillStyle='#ffff00'; ctx.fillText('WebRing',44,32);
      ctx.fillStyle='#ff0000'; ctx.fillRect(0,0,w,2); ctx.fillRect(0,h-2,w,2);`
  },
  {
    // the track plan Dale drew in Paint
    name: 'plan2.gif', w: 320, h: 220,
    palette: ['#ffffff', '#000000', '#0000ff', '#ff0000', '#008000', '#808080', '#c0c0c0'],
    draw: `
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.strokeRect(10.5,10.5,300,190);
      ctx.fillStyle='#c0c0c0'; ctx.fillRect(11,150,90,50);   // furnace corner
      ctx.lineWidth=4; ctx.strokeStyle='#000';
      ctx.beginPath(); ctx.moveTo(24,40); ctx.lineTo(150,40); ctx.arc(150,95,55,-Math.PI/2,Math.PI/2,false); ctx.lineTo(40,150); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(24,48); ctx.lineTo(150,48); ctx.arc(150,95,47,-Math.PI/2,Math.PI/2,false); ctx.lineTo(40,142); ctx.stroke();
      ctx.strokeStyle='#ff0000'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(220,30); ctx.lineTo(290,30); ctx.lineTo(290,180); ctx.lineTo(220,180); ctx.stroke();
      ctx.fillStyle='#008000'; ctx.beginPath(); ctx.arc(150,95,22,0,7); ctx.fill();
      ctx.fillStyle='#000'; ctx.font='11px Arial';
      ctx.fillText('ALTOONA',22,32); ctx.fillText('(yard)',30,62);
      ctx.fillText('Kittanning Pt.',214,96);
      ctx.fillText('to Gallitzin',45,138);
      ctx.fillStyle='#fff'; ctx.fillText('res.',140,99);
      ctx.fillStyle='#000'; ctx.fillText('FURNACE',30,180);
      ctx.fillStyle='#ff0000'; ctx.fillText('staging',232,44); ctx.fillText('NOT DONE',226,170);
      ctx.fillStyle='#808080'; ctx.fillRect(250,188,40,12); ctx.fillStyle='#000'; ctx.fillText('stairs',252,198);
      ctx.fillStyle='#0000ff'; ctx.font='10px Arial'; ctx.fillText('13 ft x 9 ft   (not to scale!)',160,214);`
  },
];
