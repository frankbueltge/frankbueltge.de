// EARSHOT, state 3 (the check): render the page's own sound. For every voice (the 51 passages and the record's
// sentences), the page's own audio graph is run offline in a browser twice: with the listener in the voice's room
// (inside) and on the other side of its wall (from the street; a voice of the street from the Commission's room).
// The same chain, reverbs, compressor and street air the page plays (earshot.js, renderOffline). Writes WAV files
// to the cache directory for listen.py.
// Run with a static server on this folder:  python3 -m http.server 8771 --bind 127.0.0.1   then
//   node render_page.mjs <cache dir>
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1100, height: 820 } });
await p.goto('http://127.0.0.1:8771/');
await p.waitForTimeout(800);
const items = await p.evaluate(() => window.EARSHOT.signals.map(s => [s.id, s.room]).concat(window.EARSHOT.cases.flatMap(c => c.events.filter(e => e.vid).map(e => [e.vid, e.place]))));
const plan = [];
for (const [id, room] of items) {
  plan.push([id, 'near', room]);
  plan.push([id, 'wall', room === 'street' ? 'eu' : 'street']);
}
for (const [id, side, listener] of plan) {
  const b64 = await p.evaluate(([i, l]) => window.__earshot.renderOffline(i, l), [id, listener]);
  writeFileSync(out + '/' + id + '.' + side + '.wav', Buffer.from(b64, 'base64'));
  process.stdout.write(id + '.' + side + ' ');
}
await browser.close();
console.log('\nrendered', plan.length);
