const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<canvas id=c width=320 height=400></canvas><canvas id=o width=160 height=200></canvas>');
  const jpg = await p.evaluate(() => {
    const c = document.getElementById('c'), x = c.getContext('2d'), w = 320, h = 400;
    let s = 11; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    // overcast morning sky, washed out
    const g = x.createLinearGradient(0,0,0,170); g.addColorStop(0,'#d9dcd6'); g.addColorStop(1,'#b9bdb4'); x.fillStyle=g; x.fillRect(0,0,w,170);
    // windbreak trees, irregular blobs
    for (let i=0;i<120;i++){ x.fillStyle='rgba('+(40+R()*30|0)+','+(58+R()*30|0)+','+(35+R()*15|0)+',0.8)'; x.beginPath(); x.arc(R()*w, 130+R()*30, 6+R()*14, 0, 7); x.fill(); }
    // machine shed far right
    x.fillStyle='#9a9c98'; x.fillRect(250,120,70,42); x.fillStyle='#6f716d'; x.fillRect(250,116,70,6);
    // ground: mowed grass, then garden dirt
    for (let y=160;y<h;y++){ for(let i=0;i<w;i+=3){ const d=y>250; const v=R(); x.fillStyle = d ? 'rgb('+(95+v*40|0)+','+(78+v*30|0)+','+(55+v*20|0)+')' : 'rgb('+(70+v*40|0)+','+(95+v*45|0)+','+(45+v*15|0)+')'; x.fillRect(i,y,3,1);} }
    // a few green plants in garden
    for (let i=0;i<40;i++){ x.fillStyle='rgba(60,'+(110+R()*40|0)+',40,0.9)'; const px=R()*w, py=270+R()*120; x.beginPath(); x.ellipse(px,py,4+R()*6,3+R()*3,R()*3,0,7); x.fill(); }
    // wooden post, close, slightly tilted
    x.save(); x.translate(170,90); x.rotate(0.03);
    x.fillStyle='#776048'; x.fillRect(-22,0,44,330);
    for (let y=4;y<330;y+=5){ x.strokeStyle='rgba(50,38,28,'+(0.2+R()*0.4)+')'; x.beginPath(); x.moveTo(-20+R()*6,y); x.lineTo(20-R()*6,y+R()*4); x.stroke(); }
    x.fillStyle='rgba(255,255,255,0.12)'; x.fillRect(-22,0,10,330);
    // bracket and gauge
    x.fillStyle='#8d8f8c'; x.fillRect(20,10,10,70);
    x.fillStyle='rgba(232,236,236,0.92)'; x.fillRect(30,-40,30,150); x.strokeStyle='#8a9496'; x.strokeRect(30,-40,30,150);
    x.fillStyle='#dfe3e3'; x.beginPath(); x.moveTo(24,-44); x.lineTo(66,-44); x.lineTo(60,-30); x.lineTo(30,-30); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle='#334'; for(let y=-24;y<106;y+=9){ x.beginPath(); x.moveTo(31,y); x.lineTo(y%18?37:41,y); x.stroke(); }
    x.fillStyle='rgba(140,160,175,0.6)'; x.fillRect(31,70,28,39);
    x.restore();
    // fence wire
    x.strokeStyle='rgba(70,70,70,0.8)'; [215,262].forEach(y=>{x.beginPath();x.moveTo(0,y+6);x.lineTo(148,y);x.moveTo(193,y);x.lineTo(w,y+4);x.stroke();});
    // flash falloff / vignette and warm cast
    const v = x.createRadialGradient(170,200,40,160,200,280); v.addColorStop(0,'rgba(255,240,200,0.12)'); v.addColorStop(1,'rgba(30,20,10,0.45)'); x.fillStyle=v; x.fillRect(0,0,w,h);
    const im=x.getImageData(0,0,w,h), d=im.data; for(let i=0;i<d.length;i+=4){ const n=(R()-0.5)*26; d[i]=Math.min(255,Math.max(0,d[i]+14+n)); d[i+1]=Math.min(255,Math.max(0,d[i+1]+4+n)); d[i+2]=Math.max(0,d[i+2]-12+n);} x.putImageData(im,0,0);
    // downscale like a scanner at low dpi
    const o = document.getElementById('o'), ox = o.getContext('2d'); ox.filter='blur(0.6px)'; ox.drawImage(c,0,0,160,200); ox.filter='none';
    ox.fillStyle='#ff8a1e'; ox.font='bold 9px monospace'; ox.fillText("'98  6 14",108,194);
    return o.toDataURL('image/jpeg', 0.42);
  });
  fs.writeFileSync(process.argv[2], Buffer.from(jpg.split(',')[1], 'base64')); await b.close();
})();
