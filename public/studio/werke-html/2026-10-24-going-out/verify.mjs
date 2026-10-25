// GOING OUT: open the face in a browser, fail on any page error, and check the sky against two facts
// that do not depend on this code: Polaris stands at about the observer's latitude (independent of the
// hour), and Betelgeuse is above the horizon for those who reported looking at Orion (a consistency check:
// the page's projection agrees with build.py's hour check). Increment 2: a re-timed report's ringed star is under the
// horizon at the filed UT and up at the placed hour; the lost reports and the visitor's own sky open without error.
// Increment 3: at 1280 x 800 the whole band stands above the fold beside the sky; the dome's corner counts the stars gone;
// the comparison table sums to every report with a chart and a place, and the visitor's report is set against it.
//   node verify.mjs            (from this folder; writes shot-1100.png and shot-390.png)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const browser = await chromium.launch(); const errors = [];
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + path.join(here, 'index.html')); await page.waitForTimeout(5000);
const res = await page.evaluate(() => {
  const G = window.GO, S = G.stars, find = (raDeg, deDeg) => { // nearest catalogue star to a J2000 position
    let b = -1, bd = 1e9; for (let i = 0; i < S.length / 4; i++) { const d = Math.hypot(S[4*i]/100 - raDeg, S[4*i+1]/100 - deDeg); if (d < bd) { bd = d; b = i; } } return b; };
  const polaris = find(37.95, 89.26), betel = find(88.79, 7.41);
  const W = parseFloat(document.getElementById('sky').style.width), rr = W / 2 - 14;
  const alt = (p, i) => p.up[i] ? 90 * (1 - Math.hypot(p.x[i] - W/2, p.y[i] - W/2) / rr) : -1;
  let pe = 0, pn = 0, on = 0, oup = 0;
  G.reports.forEach((r, k) => {
    if (k % 7) return; const p = window.__going.project(k);
    if (r[0] > 100) { pn++; pe = Math.max(pe, Math.abs(alt(p, polaris) - r[0] / 10)); }
    if (G.consts[r[5]] === 'Orion') { on++; if (p.up[betel]) oup++; }
  });
  // increment 2: a re-timed report's ringed star stands under the horizon at the filed hour and above it at the placed one
  const g = window.__going; let tn = 0, tok = 0;
  G.reports.forEach((r, k) => {
    if (!r[7] || k % 5) return; tn++; const a = g.anchor[G.consts[r[5]]];
    const filed = g.projectAt(r[0]/10, r[1]/10, r[2] + r[9]), placed = g.projectAt(r[0]/10, r[1]/10, r[2]);
    if (!filed.up[a] || alt(filed, a) <= 5.5) { if (placed.up[a] && alt(placed, a) > 4.5) tok++; }
  });
  const cap = document.getElementById('who').textContent;
  return { polaris_max_error_deg: +pe.toFixed(2), polaris_reports: pn, orion_reports: on, orion_betelgeuse_up: oup,
    retimed_checked: tn, retimed_under_then_up: tok, caption: cap, reports: G.reports.length, lost: G.lost.length };
});
await page.screenshot({ path: path.join(here, 'shot-1100.png'), fullPage: false });
const fold = {};
await page.setViewportSize({ width: 1280, height: 800 }); await page.waitForTimeout(1500);
Object.assign(fold, await page.evaluate(() => { const b = document.getElementById('band').getBoundingClientRect(), s = document.getElementById('sky').getBoundingClientRect();
  return { band_bottom: Math.round(b.bottom), band_top: Math.round(b.top), sky_bottom: Math.round(s.bottom), cmp_total: window.GO.cmp.flat(2).reduce((a, v) => a + v, 0) }; }));
await page.screenshot({ path: path.join(here, 'shot-1280x800.png') });
await page.setViewportSize({ width: 1100, height: 1000 }); await page.waitForTimeout(1500);
res.fold_1280x800 = fold;
// a click on each of the band's two bottom rows opens that kind of lost report (the bottom-row miss of session 202)
res.band_clicks = {};
for (const [name, row] of [['nohour', 9], ['noplace', 10]]) {
  const bb = await page.evaluate(() => { const r = document.getElementById('band').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
  const gut = bb.w < 460 ? 52 : 82;
  await page.mouse.click(bb.x + gut + (bb.w - gut) * 0.5, bb.y + 60 + row * 17 + 8); await page.waitForTimeout(300);
  res.band_clicks[name] = await page.evaluate(() => document.getElementById('kind').textContent);
}
// the lost reports and the visitor's own sky must open without error
const states = {};
for (const [name, fn] of [['noplace', "window.__going.golost(window.GO.lost.findIndex(l => l[0] === 0))"],
                          ['nohour', "window.__going.golost(window.GO.lost.findIndex(l => l[0] === 1 && l[2] >= 4))"],
                          ['you', "window.__going.goyou(); window.__going.setYou(52.5, 13.5, 4)"]]) {
  await page.evaluate(fn); await page.waitForTimeout(5000);
  states[name] = await page.evaluate(() => ({ mode: window.__going.mode, caption: document.getElementById('who').textContent,
    kind: document.getElementById('kind').textContent, against: document.getElementById('yagainst').textContent }));
  await page.screenshot({ path: path.join(here, `shot-${name}.png`), fullPage: false });
}
res.states = states;
await page.evaluate("window.__going.go(window.__going.cur)");
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(here, 'shot-390.png') });
const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
await browser.close();
console.log(JSON.stringify({ ...res, errors, hscroll_at_390: hscroll }, null, 1));
const ok = !errors.length && res.polaris_max_error_deg < 1.5 && res.orion_betelgeuse_up === res.orion_reports && !hscroll
  && res.retimed_under_then_up === res.retimed_checked && res.states.noplace.mode === 'lost' && res.states.nohour.mode === 'lost'
  && /magnitude 4/.test(res.states.you.caption) && res.fold_1280x800.band_bottom <= 800 && res.fold_1280x800.cmp_total === 247546
  && /saw fewer stars than you/.test(res.states.you.against) && /no place/.test(res.states.noplace.kind) && /no hour fits/.test(res.states.nohour.kind)
  && /no hour fits/.test(res.band_clicks.nohour) && /no place/.test(res.band_clicks.noplace);
fs.writeFileSync(path.join(here, 'verify.json'), JSON.stringify({ ...res, errors, hscroll_at_390: hscroll, ok }, null, 1));
process.exit(ok ? 0 : 1);
