// Draws Dale's GIFs on a canvas in headless Chromium, then writes real GIF89a files
// (fixed palettes, nearest-colour mapping, uncompressed LZW). Run: node make_images.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const OUT = __dirname;

function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }

function encodeGif(w, h, palette, frames, delay, transparent) {
  const pal = palette.map(hex);
  while (pal.length < 256) pal.push([0, 0, 0]);
  const b = [];
  const u16 = v => b.push(v & 255, (v >> 8) & 255);
  b.push(...Buffer.from('GIF89a'));
  u16(w); u16(h); b.push(0xF7, 0, 0);
  pal.forEach(c => b.push(...c));
  if (frames.length > 1) {
    b.push(0x21, 0xFF, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0);
  }
  for (const idx of frames) {
    b.push(0x21, 0xF9, 4, (transparent != null ? 1 : 0) | (frames.length > 1 ? 8 : 0));
    u16(delay); b.push(transparent != null ? transparent : 0, 0);
    b.push(0x2C); u16(0); u16(0); u16(w); u16(h); b.push(0);
    b.push(8);
    // uncompressed LZW: 9-bit codes, clear every 254 literals
    const bytes = []; let acc = 0, nb = 0;
    const put = c => { acc |= c << nb; nb += 9; while (nb >= 8) { bytes.push(acc & 255); acc >>= 8; nb -= 8; } };
    let n = 0; put(256);
    for (const p of idx) { if (n === 254) { put(256); n = 0; } put(p); n++; }
    put(257); if (nb > 0) bytes.push(acc & 255);
    for (let i = 0; i < bytes.length; i += 255) {
      const chunk = bytes.slice(i, i + 255); b.push(chunk.length, ...chunk);
    }
    b.push(0);
  }
  b.push(0x3B);
  return Buffer.from(b);
}

function quantize(rgba, palette, transparent) {
  const pal = palette.map(hex);
  const out = new Uint8Array(rgba.length / 4);
  for (let i = 0; i < out.length; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], bl = rgba[i * 4 + 2], a = rgba[i * 4 + 3];
    if (a < 128 && transparent != null) { out[i] = transparent; continue; }
    let best = 0, bd = 1e9;
    for (let k = 0; k < pal.length; k++) {
      if (k === transparent) continue;
      const d = (pal[k][0] - r) ** 2 + (pal[k][1] - g) ** 2 + (pal[k][2] - bl) ** 2;
      if (d < bd) { bd = d; best = k; }
    }
    out[i] = best;
  }
  return out;
}

const specs = require('./image_specs.js');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const s of specs) {
    const frames = [];
    for (let f = 0; f < (s.frames || 1); f++) {
      const data = await page.evaluate(([src, w, h, f]) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        let seed = 1998 + f * 7;
        const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        const fn = new Function('ctx', 'f', 'w', 'h', 'rnd', src);
        fn(ctx, f, w, h, rnd);
        return Array.from(ctx.getImageData(0, 0, w, h).data);
      }, [s.draw, s.w, s.h, f]);
      frames.push(quantize(data, s.palette, s.transparent));
    }
    fs.writeFileSync(path.join(OUT, s.name), encodeGif(s.w, s.h, s.palette, frames, s.delay || 0, s.transparent));
    console.log('wrote', s.name);
  }
  await browser.close();
})();
