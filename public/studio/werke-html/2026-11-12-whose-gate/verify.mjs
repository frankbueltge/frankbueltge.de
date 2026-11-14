// WHOSE GATE — open the page as a visitor does and check what it draws.
// Usage (repo root): node works/2026-11-12-whose-gate/verify.mjs [out-dir-for-stills]
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2];
const browser = await chromium.launch(); let bad = 0;
const read = page => page.evaluate(() => { const d = document.getElementById('cv').dataset; return { born: +d.born, moving: +d.moving, held: +d.held, basin: +d.basin, pool: +d.pool, stakes: +d.stakes, acts: +d.acts, stops: +d.stops, delays: +d.delays, conditions: +d.conditions, around: +d.around, ended: +d.ended, loose: +d.loose, boxes: +d.boxes, through: +d.through, tally: d.tally, say: document.getElementById('say').textContent, side: document.documentElement.scrollWidth - window.innerWidth }; });
for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(here, 'index.html') + '#t=2026-01-01'); await page.waitForTimeout(300);
  const end25 = await read(page);
  if (out) await page.screenshot({ path: path.join(out, `2025-${w}.png`), fullPage: true });
  await page.evaluate(() => WG.seek('2022-03-31')); await page.waitForTimeout(100); const first = await read(page);
  await page.evaluate(() => WG.seek('2026-11-12')); await page.waitForTimeout(100); const today = await read(page);
  if (out) await page.screenshot({ path: path.join(out, `today-${w}.png`), fullPage: true });
  // a visitor's hand: close the border for a tenth of a year in the middle of 2025, then let go
  const hand = await page.evaluate(() => { WG.seek('2025-06-30'); WG.hold(0, true); for (let i = 0; i < 20; i++) WG.step(0.005); const d = document.getElementById('cv').dataset; const held = +d.held; const say = document.getElementById('panel').textContent; WG.hold(0, false); WG.step(0.005); return { held, after: +document.getElementById('cv').dataset.held, say }; });
  if (out) { await page.evaluate(() => { WG.seek('2025-06-30'); WG.hold(2, true); for (let i = 0; i < 30; i++) WG.step(0.005); }); await page.waitForTimeout(100); await page.screenshot({ path: path.join(out, `hand-${w}.png`), fullPage: true }); await page.evaluate(() => WG.hold(2, false)); }
  await page.click('#holds button:nth-of-type(4)'); const deal = await page.evaluate(() => document.getElementById('panel').textContent);
  await page.click('#holds button:nth-of-type(2)'); const ground = await page.evaluate(() => document.getElementById('panel').querySelectorAll('li').length);
  // state 3 (the check): the numbers a visitor reads in the sentence above the drawing, compared with the Field's checked file
  const D = await page.evaluate(() => DATA), C = D.counts, num = (re, s) => { const m = re.exec(s); return m ? +m[1] : NaN; };
  const said = { stops: num(/Standing at this date: (\d+) stops?/, today.say), around: num(/(\d+) gone around/, today.say), loose: num(/(\d+) loosened in part/, today.say),
    delays: num(/(\d+) delays?,/, today.say), conditions: num(/(\d+) conditions?/, today.say), ended: num(/(\d+) lifted or replaced/, today.say) };
  const fromData = { stops: C.stops_stand + C.stops_gone_around + C.stops_loosened, around: C.stops_gone_around, loose: C.stops_loosened,
    delays: D.acts.filter(a => a.effect === 'delayed' && a.state === 'stands').length, conditions: D.acts.filter(a => a.effect === 'conditioned' && a.state === 'stands').length,
    ended: D.acts.filter(a => ['lifted', 'superseded'].includes(a.state)).length };
  const sayOK = Object.keys(fromData).every(k => said[k] === fromData[k] && today[k === 'stops' ? 'stops' : k] === fromData[k]);
  const tallyOK = today.tally === [C.stops_stand, C.stops_loosened, C.stops_gone_around, C.stops_lifted, C.stops_superseded].join(',');
  // in mid-2025 the stream is running: grains pass through standing stops and are drawn as holes
  const mid = await page.evaluate(() => { WG.seek('2025-09-30'); WG.step(0.002); return +document.getElementById('cv').dataset.through; });
  const ok = sayOK && tallyOK && today.boxes === C.acts && mid > 0 && end25.born === 2093 && end25.stakes === 4 && end25.pool + end25.basin + end25.moving === 2093 && end25.side <= 0
    && first.born === 6 && first.stakes === 0 && first.acts === 3 && first.delays === 2 && first.conditions === 1 && first.stops === 0
    && today.stakes === 7 && today.basin === 2027 && today.pool === 66 && today.moving === 0 && today.side <= 0
    && today.acts === 28 && today.stops === 8 && today.around === 3 && today.loose === 1 && today.ended === 9 && today.delays === 2 && today.conditions === 9
    && hand.held > 20 && hand.after === 0 && hand.say.includes('United States') && deal.includes('no act found') && ground === 10 && !errors.length;
  delete today.say; delete end25.say; delete first.say;
  console.log(w, scheme, JSON.stringify({ said, fromData, sayOK, tallyOK, through_mid_2025: mid, end25, first, today, hand: { held: hand.held, after: hand.after }, errors }), ok ? 'OK' : 'FAILED'); if (!ok) bad++;
  await page.close();
}
await browser.close(); process.exit(bad ? 1 : 0);
