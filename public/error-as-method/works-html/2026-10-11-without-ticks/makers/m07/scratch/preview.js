const fs = require('fs'), zlib = require('zlib');
const { renderInk, G } = require('./render.js');
const enc = fs.readFileSync(__dirname + '/ink.enc', 'utf8');
const W = G.W, H = G.H, px = renderInk(enc, W, H);
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1); }
function chunk(t, d) { const b = Buffer.alloc(8 + d.length + 4); b.writeUInt32BE(d.length, 0); b.write(t, 4); d.copy(b, 8);
  const crc = zlib.crc32 ? zlib.crc32(Buffer.concat([Buffer.from(t), d])) : 0; b.writeUInt32BE(crc >>> 0, 8 + d.length); return b; }
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
fs.writeFileSync(__dirname + '/preview.png', Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('ok', !!zlib.crc32);
