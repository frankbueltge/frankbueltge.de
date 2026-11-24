// Writes railroad.mid: a plain one-track tune Dale would have had playing in the background.
const fs = require('fs'), path = require('path');
// [note, beats]  (0 = rest)  "I've Been Working on the Railroad", roughly, in F
const tune = [
  [60,1],[65,1],[65,1],[65,1],[65,1],[69,1],[72,2],[69,1],[65,2],[0,1],
  [67,1],[67,1],[67,1],[67,1],[65,1],[67,3],[0,2],
  [60,1],[65,1],[65,1],[65,1],[65,1],[69,1],[72,2],[69,1],[65,2],[0,1],
  [67,1],[67,1],[69,1],[67,1],[64,1],[65,3],[0,2],
];
const TPB = 96;
const vlq = n => { const o = [n & 127]; while ((n >>= 7)) o.unshift((n & 127) | 128); return o; };
const ev = [];
ev.push(0, 0xFF, 0x51, 3, 0x07, 0xA1, 0x20); // tempo 500000 -> 120bpm
ev.push(0, 0xC0, 0);                         // acoustic piano
let wait = 0;
for (const [n, b] of tune) {
  if (!n) { wait += b * TPB; continue; }
  ev.push(...vlq(wait), 0x90, n, 96);
  ev.push(...vlq(b * TPB - 8), 0x80, n, 0);
  wait = 8;
}
ev.push(...vlq(wait), 0xFF, 0x2F, 0);
const hdr = [0x4D,0x54,0x68,0x64,0,0,0,6,0,0,0,1,0,TPB];
const len = ev.length;
const trk = [0x4D,0x54,0x72,0x6B,(len>>>24)&255,(len>>16)&255,(len>>8)&255,len&255];
fs.writeFileSync(path.join(__dirname, 'railroad.mid'), Buffer.from([...hdr, ...trk, ...ev]));
console.log('wrote railroad.mid', len);
