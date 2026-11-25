// Study 94 -- read every figure from the rendered page at two widths and recount it from receivers94.json,
// names94.json and quotes94.json, independently of build94.py; also compare with results94.json.
// Usage: node verify94.mjs [--shot]   (needs playwright; reads index.html from this folder)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const Rw = J('receivers94.json').receivers, N = J('names94.json'), Q = J('quotes94.json'), RES = J('results94.json');
const FIVE = ['acknowledge', 'investigate', 'order', 'pass_on', 'tell_public'];
const ACTS = [...FIVE, 'tell_public_aggregate'];
const pb = Rw.filter(r => r.receiver === 'public body');
const law = Rw.filter(r => r.binding === 'law');
const obliged = law.filter(r => r.sender_failure.v !== 'n/a');
const anyDuty = (rs, ok = ['duty']) => rs.filter(r => FIVE.some(a => ok.includes(r.acts[a].v)));
const clocked = rs => rs.flatMap(r => ACTS.filter(a => ['duty', 'power'].includes(r.acts[a].v) && typeof r.acts[a].deadline_h === 'number').map(a => [r.id, a]));
const actv = (rs, a, v) => rs.filter(r => r.acts[a].v === v).length;
const rfNamed = rs => rs.filter(r => r.receiver_failure.v === 'named');
const p158 = anyDuty(Rw), p159 = clocked(Rw), p160rf = rfNamed(Rw);
const limb1 = obliged.every(r => ['penalty', 'enforcement'].includes(r.sender_failure.v));
const out = h => h ? 'held' : 'failed';
const cop5 = Rw.find(r => r.id === 'COP5').acts.pass_on;
const fines = law.filter(r => ['sb53', 'raise'].includes(r.instrument)).map(r => r.sender_failure.max || 0);
const doubts = Rw.reduce((n, r) => n + ACTS.filter(a => r.acts[a].doubt).length + ['sender_failure', 'receiver_failure'].filter(k => r[k].doubt).length, 0);

const E = {
  'signals': Rw.length,
  'receiver.public body': pb.length,
  'pb.investigate.duty.length': actv(pb, 'investigate', 'duty'),
  'pb.investigate.power.length': actv(pb, 'investigate', 'power'),
  'pb.acknowledge.duty.length': actv(pb, 'acknowledge', 'duty'),
  'pb.order.duty.length': actv(pb, 'order', 'duty'),
  'pb.order.power.length': actv(pb, 'order', 'power'),
  'pb.tell_public.duty.length': actv(pb, 'tell_public', 'duty'),
  'pb.tell_public_aggregate.duty.length': actv(pb, 'tell_public_aggregate', 'duty'),
  'pb.clocked.length': clocked(pb).length,
  'pb.receiver_failure_named.length': rfNamed(pb).length,
  'pb.party_no.length': pb.filter(r => r.receiver_party === 'no').length,
  'pb.any_duty_five.length': anyDuty(pb).length,
  'senders.law_obliged.length': obliged.length,
  'senders.law_obliged_penalty.length': obliged.filter(r => ['penalty', 'enforcement'].includes(r.sender_failure.v)).length,
  'senders.sender_clock_numeric.length': Rw.filter(r => typeof r.sender_deadline_h === 'number').length,
  'senders.max_fine_usd_text': '$' + (Math.max(...fines) / 1e6) + ' million',
  'p159.cop5_min_days': cop5.deadline_h / 24,
  'p159.cop5_max_days': cop5.deadline_max_h / 24,
  'P158.out': out(p158.length <= 3), 'P158.n': p158.length, 'P158.ids': p158.map(r => r.id).join(', '),
  'P158.with_recommended': anyDuty(Rw, ['duty', 'recommended']).length,
  'P159.out': out(p159.length === 0), 'P159.n': p159.length,
  'P160.out': out(limb1 && !p160rf.length), 'P160.law_obliged': obliged.length,
  'P160.law_obliged_penalty': obliged.filter(r => ['penalty', 'enforcement'].includes(r.sender_failure.v)).length,
  'P160.receiver_failure_named.length': p160rf.length,
  'predictions_held': [p158.length <= 3, p159.length === 0, limb1 && !p160rf.length].filter(Boolean).length,
  'names.architect_only': N.architect_only, 'names.deeds': N.deeds, 'names.atelier_rows_agreeing': N.atelier.rows_agreeing,
  'names.says_machine_in_message': N.says_machine_in_message, 'names.architect_only_through_forge': N.architect_only_through_forge,
  'names.control_site_session_link': N.control['frankbueltge.de'].session_link,
  'names.control_site_coauthor': N.control['frankbueltge.de'].coauthor_trailer,
  'quotes.found': Q.items.filter(i => i.found).length, 'quotes.n': Q.items.length,
  'doubts': doubts,
};
// the same keys from results94.json, so build and recount must agree
const fromRes = {
  'signals': RES.signals, 'receiver.public body': RES.receiver['public body'],
  'pb.investigate.duty.length': RES.public_body.acts.investigate.duty.length, 'pb.clocked.length': RES.public_body.clocked.length,
  'P158.n': RES.predictions.P158.n, 'P159.n': RES.predictions.P159.n, 'predictions_held': RES.predictions_held,
  'P158.with_recommended': RES.predictions.P158.with_recommended, 'doubts': RES.doubts, 'quotes.found': RES.quotes.found,
  'names.architect_only': RES.names.architect_only, 'names.atelier_rows_agreeing': RES.names.atelier_rows_agreeing,
};
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
for (const k in fromRes) ok(String(fromRes[k]) === String(E[k]), `results94.json ${k}: ${fromRes[k]} vs recount ${E[k]}`);

const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  const seen = await page.$$eval('[data-k]', els => els.map(e => [e.dataset.k, e.textContent.trim()]));
  const keys = new Set();
  for (const [k, v] of seen) { keys.add(k); ok(k in E, `${width}px: unknown key ${k}`); if (k in E) ok(String(E[k]) === v, `${width}px: ${k} shows ${v}, recount ${E[k]}`); }
  for (const k in E) ok(keys.has(k), `${width}px: key ${k} not on the page`);
  // the figure: one row per receiver, glyphs as coded
  const glyphs = await page.$$eval('#door g.row', gs => gs.map(g => [g.dataset.id, [...g.querySelectorAll('[data-v]')].map(m => m.dataset.v)]));
  ok(glyphs.length === Rw.length, `${width}px: ${glyphs.length} rows drawn`);
  for (const [id, vs] of glyphs) { const r = Rw.find(x => x.id === id); ok(r && JSON.stringify(vs) === JSON.stringify(ACTS.map(a => r.acts[a].v)), `${width}px: glyphs of ${id}`); }
  // a row opens its passages
  await page.click('#door g.row[data-id="NY4"]');
  const det = await page.textContent('#detail');
  ok(det.includes('The office shall review critical safety incident reports'), `${width}px: NY4 detail shows its passage`);
  ok(!errs.length, `${width}px: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= width, `${width}px: page scrolls sideways (${sw})`);
  if (process.argv.includes('--shot') && width === 1100) {
    await page.click('#door g.row[data-id="CA4"]');
    await page.screenshot({ path: join(here, 'process', '1.png'), fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`verify94: ${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
