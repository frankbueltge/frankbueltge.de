// OTHER HANDS — open the page as a visitor does and compare what it says and draws with the Field's files.
// Usage (repo root): node works/2026-11-15-other-hands/verify.mjs [out-dir-for-stills]
// The Field's results are fetched from its repository at the commit data.js names, not from this work's data.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2];
const browser = await chromium.launch(); let bad = 0;
const ok = (name, cond, detail) => { if (!cond) bad++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
let R76 = null, R75 = null;
for (const [w, h] of [[1132, 900], [390, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(here, 'index.html')); await page.waitForTimeout(400);
  const M = await page.evaluate(() => OH.meta);
  if (!R76) {
    const base = `https://raw.githubusercontent.com/frankbueltge/field-research/${M.field_commit}/artifacts/cycle-015/what-harm-is-on-record/`;
    R76 = await (await fetch(base + 'results76.json')).json(); R75 = await (await fetch(base + 'results75.json')).json();
  }
  // the numbers a visitor reads under the sheet, read from the page
  const said = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-n]')].map(e => [e.dataset.n, +e.textContent.replace(/,/g, '')])));
  const field = {
    with_report: R75.incidents_with_first_report, press: R75.first_reporter['press and other'], public: R75.first_reporter['public body'],
    research: R75.first_reporter.research, maker: R75.first_reporter.maker, self: R75.first_reporter['self-published'],
    read_by_hand: R76.A.n, harmed: R76.A.harmed, witness: R76.A.codes.witness,
    answered: R76.B.n, maker_answered: R76.B.maker_responded, other_answered: R76.B.other_responded, public_acted: R76.B.public_body_acted,
    on_user: R76.B.act_target.user, on_maker: R76.B.act_target.maker,
  };
  for (const k of Object.keys(field)) ok(`${w}px caption ${k}`, said[k] === field[k], `${said[k]} on the page, ${field[k]} in the Field's file`);
  ok(`${w}px every caption number has a source`, Object.keys(said).every(k => k in field));
  // what was drawn on the sheet and in the two counts
  const d = await page.evaluate(() => window.__oh), s = d.drawn, t = d.tally;
  ok(`${w}px sheet: handwritten paragraphs`, s.H === field.harmed, `${s.H}`);
  ok(`${w}px sheet: seals`, s.U === field.on_user && s.K === field.on_maker, `${s.U} full, ${s.K} rings`);
  ok(`${w}px sheet: answers`, s.A === field.maker_answered && s.O === field.other_answered);
  ok(`${w}px sheet: witnesses`, s.w === field.witness);
  const words = Object.entries(s).filter(([k]) => !'AOUK0'.includes(k)).reduce((a, [, v]) => a + v, 0);
  ok(`${w}px sheet: one word per attached report`, words === M.words && words === 6964, `${words}`);
  ok(`${w}px sheet: paragraphs without a report`, s['0'] === R75.incidents - R75.incidents_with_first_report);
  ok(`${w}px counts: first reports`, t.p + t.g + t.r + t.m + t.n + t.x + t.w + t.H === field.with_report && t.H === field.harmed && t.p === field.press);
  ok(`${w}px counts: answers`, t.A === field.maker_answered && t.O === field.other_answered && t.U === field.on_user && t.K === field.on_maker);
  // the year sentence in the text
  const yr = await page.evaluate(() => [OH.inc.filter(r => r[1].slice(0, 4) === '2025').length, OH.inc.filter(r => r[1].slice(0, 4) <= '2021').length]);
  const text = await page.evaluate(() => document.body.textContent);
  ok(`${w}px text: 2025 against the years up to 2021`, text.includes(`(${yr[0]})`) && text.includes(`(${yr[1]})`) && yr[0] > yr[1] && yr[0] === R75.years['2025'], yr.join(' / '));
  // the readings and the stepping
  await page.click('#rHand'); await page.waitForTimeout(700);
  const seen = new Set();
  for (let i = 0; i < field.harmed + 2; i++) { await page.click('#bNext'); seen.add(/Incident (\d+)/.exec(await page.textContent('#say'))[1]); }
  ok(`${w}px stepping: the harmed's paragraphs`, seen.size === field.harmed && R76.A.harmed_ids.every(i => seen.has(String(i))), `${seen.size}`);
  if (out) await page.screenshot({ path: path.join(out, `hand-${w}.png`), fullPage: true });
  await page.click('#rSeal'); await page.waitForTimeout(700);
  const acts = new Set();
  for (let i = 0; i < field.public_acted + 2; i++) { await page.click('#bNext'); acts.add(/Incident (\d+)/.exec(await page.textContent('#say'))[1]); }
  ok(`${w}px stepping: the acts`, acts.size === field.public_acted && R76.B.act_on_maker_ids.every(i => acts.has(String(i))), `${acts.size}`);
  await page.click('#rAll'); await page.waitForTimeout(700);
  if (out) await page.screenshot({ path: path.join(out, `all-${w}.png`), fullPage: true });
  const side = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(`${w}px no sideways scroll`, side <= 0, `${side}`);
  ok(`${w}px no errors`, errors.length === 0, errors.join(' | '));
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} FAILED` : 'all passed');
process.exit(bad ? 1 : 0);
