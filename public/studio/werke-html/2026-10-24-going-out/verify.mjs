// GOING OUT: open the face in a browser, fail on any page error, and check the sky against two facts
// that do not depend on this code: Polaris stands at about the observer's latitude (independent of the
// hour), and Betelgeuse is above the horizon for those who reported looking at Orion (a consistency check:
// the page's projection agrees with build.py's hour check).
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
  const cap = document.getElementById('who').textContent;
  return { polaris_max_error_deg: +pe.toFixed(2), polaris_reports: pn, orion_reports: on, orion_betelgeuse_up: oup, caption: cap, reports: G.reports.length };
});
await page.screenshot({ path: path.join(here, 'shot-1100.png'), fullPage: false });
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(here, 'shot-390.png') });
const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
await browser.close();
console.log(JSON.stringify({ ...res, errors, hscroll_at_390: hscroll }, null, 1));
const ok = !errors.length && res.polaris_max_error_deg < 1.5 && res.orion_betelgeuse_up === res.orion_reports && !hscroll;
fs.writeFileSync(path.join(here, 'verify.json'), JSON.stringify({ ...res, errors, hscroll_at_390: hscroll, ok }, null, 1));
process.exit(ok ? 0 : 1);
