// node verify_browser.mjs — UNDER WARNING in a real browser at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json'))), W = JSON.parse(fs.readFileSync(join(here, 'warnings.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const T0 = Date.UTC(2008, 0, 1), m = s => (Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12)) - T0) / 60000;
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(1500);
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' ready', await p.evaluate(() => window.__UW.state.ready));
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  // the end: every total equals build_data.py
  await p.evaluate(() => window.__UW.setT(9e9));
  const c = await p.evaluate(() => window.__UW.state.counts);
  t(`${w} end: warnings ${c.w}`, c.w === S.warnings);
  t(`${w} end: person-warnings ${c.p}`, c.p === S.person_warnings);
  t(`${w} end: never met (V) ${c.n}`, c.n === S.person_warnings_never_V);
  t(`${w} end: person-hours never met ~ ${Math.round(c.h)}`, Math.abs(c.h - S.person_hours_never_V) < 1);
  t(w + ' counter shows them', (await p.locator('#count').innerText()).includes('1,284,258,344'));
  // every rule
  for (const [r, k] of [[1, 'S'], [2, 'V0'], [3, 'V60'], [0, 'V']]) {
    await p.selectOption('#rule', String(r));
    const n = await p.evaluate(() => window.__UW.state.counts.n);
    t(`${w} rule ${k}: never met ${n}`, n === S.by_rule[k].people_never);
  }
  // a day in the past: the outbreak of 2011-04-27 21:00 UTC
  const T = m('201104272100'); await p.evaluate(T => window.__UW.setT(T), T);
  const want = W.t.filter(x => x <= T).length, act = W.t.filter((x, i) => x <= T && x + W.d[i] > T).length;
  const st = await p.evaluate(() => ({ i: window.__UW.state.i, a: window.__UW.state.active }));
  t(`${w} 2011-04-27 21:00: issued ${st.i}=${want}, standing ${st.a}=${act}`, st.i === want && st.a === act);
  t(w + ' hud names the standing', /warnings standing/.test(await p.locator('#hud').innerText()));
  // the card: the largest warning, over New York
  const iNY = W.id.indexOf('OKX.2010.6'); await p.evaluate(i => { window.__UW.setT(9e9); window.__UW.card(i) }, iNY);
  const cardTxt = await p.locator('#card').innerText();
  t(w + ' card for OKX.2010.6', /6,429,598/.test(cardTxt) && /No tornado met it/.test(cardTxt));
  const box = await p.locator('#map').boundingBox(); await p.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.6);
  t(w + ' tapping the map writes a card', /issued|No warning/.test(await p.locator('#card').innerText()));
  // EF5 field
  const ef = await p.evaluate(() => window.__UW.ef5);
  t(`${w} EF5 field: ${ef.pixels} people, ${ef.marks} marks`, ef.pixels === S.ef5_people_union && ef.marks === 323);
  t(w + ' years: 16 years drawn', (await p.locator('#years rect').count()) === 32);
  const yd = await p.evaluate(() => window.__UW.yearsData);
  t(w + ' years sum to the total', Object.values(yd).reduce((a, v) => a + v[0] + v[1], 0) === S.person_warnings);
  t(w + ' largest table: 12 rows', (await p.locator('#largest tbody tr').count()) === 12);
  // play and sound
  await p.click('#snd'); await p.evaluate(T => window.__UW.setT(T), m('201104271800'));
  await p.click('#play'); await p.waitForTimeout(1200); await p.click('#play');
  t(w + ' playing moves time forward, without errors', (await p.evaluate(() => window.__UW.state.T)) > m('201104271800') && errs.length === 0);
  await p.click('#ghost'); t(w + ' ghost toggles', await p.evaluate(() => window.__UW.state.ghost));
  await p.evaluate(() => window.__UW.setT(9e9));
  await p.screenshot({ path: join(here, `shot-${w}.png`) });
  t(w + ' no errors at the end', errs.length === 0); if (errs.length) console.log(errs);
  await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
