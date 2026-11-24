// Draw images on a canvas in Chromium, then write JPEG directly and GIFs with a tiny encoder.
const { chromium } = require('playwright');
const fs = require('fs');
const D = process.argv[2];

function gif(w, h, frames, palette, opts = {}) {
  // frames: arrays of palette indices (length w*h). palette: [[r,g,b],...] <=256
  const n = 256; const pal = palette.slice(); while (pal.length < n) pal.push([0,0,0]);
  const out = [];
  const push = (...b) => out.push(...b);
  const u16 = v => [v & 255, v >> 8];
  push(...Buffer.from('GIF89a')); push(...u16(w), ...u16(h), 0xF7, 0, 0);
  pal.forEach(c => push(...c));
  if (frames.length > 1) push(0x21,0xFF,0x0B,...Buffer.from('NETSCAPE2.0'),3,1,0,0,0);
  for (const fr of frames) {
    const t = opts.transparent;
    push(0x21,0xF9,4, (t!==undefined?1:0) | (2<<2), ...u16(opts.delay||0), t!==undefined?t:0, 0);
    push(0x2C, 0,0,0,0, ...u16(w), ...u16(h), 0);
    push(8);
    // "uncompressed" LZW: 9-bit codes, clear every 254 literals
    const codes = []; const CLEAR = 256, EOI = 257;
    let cnt = 0; codes.push(CLEAR);
    for (const p of fr) { if (cnt === 254) { codes.push(CLEAR); cnt = 0; } codes.push(p); cnt++; }
    codes.push(EOI);
    const bytes = []; let acc = 0, bits = 0;
    for (const c of codes) { acc |= c << bits; bits += 9; while (bits >= 8) { bytes.push(acc & 255); acc >>= 8; bits -= 8; } }
    if (bits) bytes.push(acc & 255);
    for (let i = 0; i < bytes.length; i += 255) { const s = bytes.slice(i, i+255); push(s.length, ...s); }
    push(0);
  }
  push(0x3B);
  return Buffer.from(out);
}
function toIdx(rgba, palette) {
  const idx = new Array(rgba.length/4);
  for (let i = 0; i < idx.length; i++) {
    const r = rgba[i*4], g = rgba[i*4+1], b = rgba[i*4+2], a = rgba[i*4+3];
    if (a < 128) { idx[i] = 0; continue; }
    let best = 1, bd = 1e9;
    for (let k = 1; k < palette.length; k++) { const p = palette[k]; const dd = (p[0]-r)**2+(p[1]-g)**2+(p[2]-b)**2; if (dd < bd) { bd = dd; best = k; } }
    idx[i] = best;
  }
  return idx;
}

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<canvas id=c></canvas>');
  const draw = (w, h, fn, arg) => p.evaluate(([w, h, src, arg]) => {
    const c = document.getElementById('c'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.clearRect(0,0,w,h);
    (new Function('x','w','h','arg', src))(x, w, h, arg);
    return { data: Array.from(x.getImageData(0,0,w,h).data), jpg: c.toDataURL('image/jpeg', 0.5) };
  }, [w, h, fn, arg]);

  // 1. snapshot of the rain gauge on the fence post
  const photo = await draw(240, 300, `
    let s=7; const R=()=>{s=(s*16807)%2147483647; return s/2147483647;};
    for(let y=0;y<120;y++){x.fillStyle='rgb('+(176+y/5|0)+','+(188+y/6|0)+','+(198+y/8|0)+')';x.fillRect(0,y,w,1);}
    for(let i=0;i<w;i+=2){const t=96+R()*14; x.fillStyle='rgb('+(55+R()*20|0)+','+(78+R()*20|0)+',48)'; x.fillRect(i,t,2,130-t);}
    for(let y=125;y<h;y++)for(let i=0;i<w;i+=2){const g=100+R()*50+(y-125)/5; x.fillStyle='rgb('+(80+R()*30|0)+','+(g|0)+',50)'; x.fillRect(i,y,2,1);}
    x.strokeStyle='#7a5a38'; x.lineWidth=4; for(let i=0;i<5;i++){x.beginPath();x.moveTo(0,160+i*28);x.lineTo(w,170+i*28);x.stroke();}
    x.fillStyle='#7c654c'; x.fillRect(104,70,32,h);
    x.strokeStyle='#5a4834'; x.lineWidth=1; for(let y=78;y<h;y+=7){x.beginPath();x.moveTo(108,y);x.lineTo(132,y+R()*3);x.stroke();}
    x.strokeStyle='#666'; [170,215].forEach(y=>{x.beginPath();x.moveTo(0,y);x.lineTo(104,y-4);x.moveTo(136,y-4);x.lineTo(w,y);x.stroke();});
    x.fillStyle='#8a8a8a'; x.fillRect(136,64,8,52);
    x.fillStyle='rgba(225,232,236,0.95)'; x.fillRect(144,22,26,100); x.strokeStyle='#7c8890'; x.strokeRect(144,22,26,100);
    x.fillStyle='#c8d0d6'; x.beginPath(); x.moveTo(138,20); x.lineTo(176,20); x.lineTo(170,32); x.lineTo(144,32); x.fill(); x.stroke();
    x.strokeStyle='#223'; for(let y=38;y<120;y+=7){x.beginPath();x.moveTo(145,y);x.lineTo(y%14?150:153,y);x.stroke();}
    x.fillStyle='rgba(120,150,190,0.7)'; x.fillRect(145,96,24,25);
    const im=x.getImageData(0,0,w,h),d=im.data; for(let i=0;i<d.length;i+=4){d[i]=Math.min(255,d[i]+14);d[i+2]=Math.max(0,d[i+2]-10);}
    x.putImageData(im,0,0); x.filter='blur(0.7px)'; x.drawImage(x.canvas,0,0); x.filter='none';
    x.fillStyle='#e8701a'; x.font='bold 11px monospace'; x.fillText("'98 6 14",176,292);
  `);
  fs.writeFileSync(D + '/gauge.jpg', Buffer.from(photo.jpg.split(',')[1], 'base64'));

  // 2. counter
  const cpal = [[255,0,255],[0,0,0],[255,255,255],[70,70,70]];
  const cnt = await draw(78, 20, `
    const s='002318'; x.fillStyle='#000'; x.fillRect(0,0,w,h);
    for(let i=0;i<6;i++){x.strokeStyle='#464646'; x.strokeRect(i*13+0.5,0.5,12,19); x.fillStyle='#fff'; x.font='bold 15px monospace'; x.fillText(s[i],i*13+2,15);}
  `);
  fs.writeFileSync(D + '/counter.gif', gif(78, 20, [toIdx(cnt.data, cpal)], cpal));

  // 3. raindrop bullet
  const dpal = [[255,255,255],[30,80,200],[140,180,240]];
  const drop = await draw(12, 16, `
    x.fillStyle='rgb(30,80,200)'; x.beginPath(); x.moveTo(6,0); x.lineTo(11,10); x.arc(6,10,5,0,Math.PI); x.lineTo(6,0); x.fill();
    x.fillStyle='rgb(140,180,240)'; x.fillRect(3,8,2,3);
  `);
  fs.writeFileSync(D + '/drop.gif', gif(12, 16, [toIdx(drop.data, dpal)], dpal, { transparent: 0 }));

  // 4. animated rain cloud
  const rpal = [[255,255,255],[120,120,130],[40,90,210],[200,200,208]];
  const frames = [];
  for (let k = 0; k < 4; k++) {
    const f = await draw(60, 52, `
      const k=arg; x.fillStyle='rgb(200,200,208)'; x.strokeStyle='rgb(120,120,130)';
      [[16,18,10],[30,12,13],[44,18,10]].forEach(([a,b2,r])=>{x.beginPath();x.arc(a,b2,r,0,7);x.fill();x.stroke();});
      x.fillRect(8,18,44,9); x.beginPath(); x.moveTo(6,27); x.lineTo(54,27); x.stroke();
      x.strokeStyle='rgb(40,90,210)'; x.lineWidth=1.5;
      for(let i=0;i<6;i++){const xx=12+i*7, y0=30+((k*5+i*3)%16); x.beginPath(); x.moveTo(xx,y0); x.lineTo(xx-2,y0+5); x.stroke();}
    `, k);
    frames.push(toIdx(f.data, rpal));
  }
  fs.writeFileSync(D + '/rain.gif', gif(60, 52, frames, rpal, { transparent: 0, delay: 18 }));
  await b.close(); console.log('ok');
})();
