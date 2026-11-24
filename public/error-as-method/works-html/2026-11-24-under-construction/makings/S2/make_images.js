// Draws the page's images on a canvas in headless Chromium and writes them into this folder.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const D = __dirname;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = await page.evaluate(() => {
    let seed = 1999;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const res = {};
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
    const BG = [214, 232, 247];

    // 1. pale blue paper tile
    {
      const [c, g] = mk(96, 96);
      const id = g.createImageData(96, 96);
      for (let i = 0; i < 96 * 96; i++) {
        const n = ri(-9, 9);
        id.data[i * 4] = BG[0] + n; id.data[i * 4 + 1] = BG[1] + n; id.data[i * 4 + 2] = BG[2] + n; id.data[i * 4 + 3] = 255;
      }
      g.putImageData(id, 0, 0);
      g.filter = 'blur(0.6px)'; g.drawImage(c, 0, 0); g.filter = 'none';
      res['bluepaper.png'] = c.toDataURL('image/png');
    }

    // martin silhouette
    function martin(g, ox, oy, s, col) {
      g.fillStyle = col;
      // flying martin seen from below: long swept wings, short forked tail, head at top
      const pts = [[20, 3], [22, 6], [23, 9], [31, 7], [39, 9], [37, 10], [30, 11], [23, 13], [22, 17], [24, 22], [21, 19], [20, 18], [19, 19], [16, 22], [18, 17], [17, 13], [10, 11], [3, 10], [1, 9], [9, 7], [17, 9], [18, 6]];
      g.beginPath();
      pts.forEach(([x, y], i) => i ? g.lineTo(ox + x * s, oy + y * s) : g.moveTo(ox + x * s, oy + y * s));
      g.closePath(); g.fill();
    }
    // hard-edged (no anti-alias look) by drawing then thresholding alpha
    function harden(c, g) {
      const id = g.getImageData(0, 0, c.width, c.height);
      for (let i = 3; i < id.data.length; i += 4) id.data[i] = id.data[i] > 100 ? 255 : 0;
      g.putImageData(id, 0, 0);
    }
    {
      const [c, g] = mk(40, 24); martin(g, 0, 0, 1, '#281e5a'); harden(c, g); res['martin.png'] = c.toDataURL();
      const [c2, g2] = mk(80, 48); martin(g2, 0, 0, 2, '#281e5a'); harden(c2, g2); res['martin2.png'] = c2.toDataURL();
    }

    // 3. snapshot of the martin house
    {
      const W = 300, H = 225;
      const [c, g] = mk(W, H);
      for (let y = 0; y < H; y++) { const t = y / H; g.fillStyle = `rgb(${150 + 60 * t | 0},${180 + 45 * t | 0},${222 + 20 * t | 0})`; g.fillRect(0, y, W, 1); }
      for (let x = 0; x < W; x += 3) { const h = 148 + ri(0, 12) + ((x / 40 | 0) % 2 ? 8 : 0); g.fillStyle = `rgb(${58 + ri(-8, 8)},${82 + ri(-8, 8)},48)`; g.fillRect(x, h, 4, 176 - h); }
      g.fillStyle = 'rgb(96,132,58)'; g.fillRect(0, 172, W, H);
      for (let i = 0; i < 1200; i++) { g.fillStyle = `rgb(${70 + ri(0, 50)},${110 + ri(0, 40)},40)`; g.fillRect(ri(0, W), ri(172, H), 1, 2); }
      // garage corner
      g.fillStyle = 'rgb(196,184,160)'; g.beginPath(); g.moveTo(250, 120); g.lineTo(300, 105); g.lineTo(300, 190); g.lineTo(250, 190); g.fill();
      g.fillStyle = 'rgb(92,60,50)'; g.beginPath(); g.moveTo(244, 122); g.lineTo(300, 100); g.lineTo(300, 108); g.lineTo(250, 126); g.fill();
      g.fillStyle = 'rgb(120,140,160)'; g.fillRect(262, 140, 24, 20);
      // pole
      g.fillStyle = '#969696'; g.fillRect(128, 92, 6, 114); g.fillStyle = '#c8c8c8'; g.fillRect(128, 92, 1, 114);
      // house
      g.fillStyle = 'rgb(236,236,230)'; g.fillRect(98, 46, 66, 46); g.strokeStyle = '#999'; g.strokeRect(98.5, 46.5, 66, 46);
      [60, 75].forEach(fy => { g.fillStyle = 'rgb(222,222,216)'; g.fillRect(94, fy - 1, 74, 3); g.fillStyle = '#aaa'; g.fillRect(94, fy + 2, 74, 1); });
      g.fillStyle = 'rgb(222,222,216)'; g.fillRect(94, 90, 74, 3);
      [51, 66, 81].forEach(yy => [105, 120, 136, 151].forEach(xx => { g.fillStyle = '#19191e'; g.beginPath(); g.ellipse(xx, yy + 1, 3.5, 4, 0, 0, 7); g.fill(); }));
      g.fillStyle = 'rgb(52,110,70)'; g.beginPath(); g.moveTo(91, 47); g.lineTo(131, 25); g.lineTo(171, 47); g.fill();
      g.fillStyle = '#555'; g.fillRect(130, 15, 2, 11);
      // birds on rails and in air
      g.fillStyle = 'rgb(30,25,60)';
      [[101, 55], [140, 70], [156, 55], [113, 86]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 3, 2.5, 0, 0, 7); g.fill(); });
      g.strokeStyle = 'rgb(35,30,60)'; g.lineWidth = 2;
      [[60, 40], [200, 30], [215, 62], [40, 75], [182, 18]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 5, y - 2); g.lineTo(x, y); g.lineTo(x + 5, y - 2); g.stroke(); });
      // soften, warm, grain
      const [c2, g2] = mk(W, H); g2.filter = 'blur(0.7px)'; g2.drawImage(c, 0, 0); g2.filter = 'none';
      const id = g2.getImageData(0, 0, W, H);
      for (let i = 0; i < W * H; i++) { const n = ri(-7, 7); id.data[i * 4] += 12 + n; id.data[i * 4 + 1] += n; id.data[i * 4 + 2] += -10 + n; }
      // corner vignette
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2); const v = Math.max(0, (dx * dx + dy * dy) - 0.6) * 40; const k = (y * W + x) * 4; id.data[k] -= v; id.data[k + 1] -= v; id.data[k + 2] -= v; }
      g2.putImageData(id, 0, 0);
      g2.font = 'bold 11px monospace'; g2.fillStyle = 'rgb(255,140,40)'; g2.fillText("'98 6 14", 236, 214);
      res['ourhouse.jpg'] = c2.toDataURL('image/jpeg', 0.55);
    }

    // 4. counter
    {
      const digits = '002317', cw = 13, ch = 19;
      const [c, g] = mk(cw * digits.length, ch);
      g.fillStyle = '#000'; g.fillRect(0, 0, c.width, ch);
      [...digits].forEach((d, i) => {
        g.fillStyle = '#161616'; g.fillRect(i * cw + 1, 1, cw - 2, ch - 2);
        g.fillStyle = '#5a5a5a'; g.fillRect(i * cw + 1, ch / 2 | 0, cw - 2, 1);
        g.font = 'bold 14px "Courier New", monospace'; g.fillStyle = '#ffffff'; g.fillText(d, i * cw + 2, 15);
      });
      res['counter.png'] = c.toDataURL();
    }

    // 5. under construction
    {
      const [c, g] = mk(88, 31);
      g.fillStyle = 'rgb(255,210,0)'; g.fillRect(0, 0, 88, 31);
      g.fillStyle = '#000';
      for (let x = -31; x < 88; x += 12) { g.beginPath(); g.moveTo(x, 31); g.lineTo(x + 6, 31); g.lineTo(x + 37, 0); g.lineTo(x + 31, 0); g.fill(); }
      g.fillStyle = 'rgb(255,210,0)'; g.fillRect(5, 8, 78, 15); g.strokeStyle = '#000'; g.strokeRect(5.5, 8.5, 77, 14);
      g.font = 'bold 8px Arial, sans-serif'; g.fillStyle = '#000'; g.fillText('UNDER', 30, 15); g.font = 'bold 6px Arial, sans-serif'; g.fillText('CONSTRUCTION', 22, 21);
      res['constr.png'] = c.toDataURL();
    }

    // 6. divider with a bird
    {
      const [c, g] = mk(460, 14);
      for (let x = 0; x < 460; x++) { const t = Math.abs(x - 230) / 230; g.fillStyle = `rgb(${60 + 120 * t | 0},${40 + 150 * t | 0},${140 + 80 * t | 0})`; g.fillRect(x, 6, 1, 2); }
      g.clearRect(214, 0, 32, 14);
      martin(g, 218, 0, 0.6, '#281e5a'); harden(c, g);
      res['birdline.png'] = c.toDataURL();
    }

    // 7. mailbox
    {
      const [c, g] = mk(48, 40);
      g.fillStyle = 'rgb(110,80,50)'; g.fillRect(21, 22, 5, 18);
      g.fillStyle = 'rgb(70,70,80)'; g.fillRect(6, 9, 34, 15); g.beginPath(); g.ellipse(23, 9, 17, 7, 0, Math.PI, 0); g.fill();
      g.fillStyle = 'rgb(95,95,105)'; g.fillRect(8, 10, 30, 12);
      g.fillStyle = 'rgb(210,30,30)'; g.fillRect(37, 3, 3, 12); g.fillRect(31, 3, 9, 3);
      g.font = 'bold 9px Arial'; g.fillStyle = '#fff'; g.fillText('ED', 15, 20);
      harden(c, g);
      res['mailbox.png'] = c.toDataURL();
    }
    return res;
  });
  for (const [name, url] of Object.entries(out)) {
    fs.writeFileSync(path.join(D, name), Buffer.from(url.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log(Object.keys(out).join(' '));
})();
