// Drive The Wolf's Ledger in a real browser at two widths and check it against plate1.json. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const P = JSON.parse(fs.readFileSync(path.join(here, 'plate1.json')));
const P2 = JSON.parse(fs.readFileSync(path.join(here, 'plate2.json')));
const P3J = JSON.parse(fs.readFileSync(path.join(here, 'plate3.json')));
const P4J = JSON.parse(fs.readFileSync(path.join(here, 'plate4.json')));
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  const t = id => pg.innerText('#' + id), p1 = () => pg.evaluate(() => window.__p1), near = (a, b) => Math.abs(a - b) < 1e-6;
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok(await pg.evaluate(() => window.__p1check()), `${wd}px: the browser's village recomputes plate1.json's fifth cry for all three ledgers and both boys`);
  let j = await p1(); const F = P.model.fifth_cry;
  ok(near(j.b, F['came+wolf'].watcher) && !j.come && (await t('read')).includes('stays home'), `${wd}px: default ledger (came, wolf?) leaves the watcher's fifth cry at ${F['came+wolf'].watcher.toFixed(3)}, below t`);
  await pg.click('#c-words'); j = await p1();
  ok(near(j.b, P.model.defaults.p) && j.come, `${wd}px: with his words kept, the watcher is believed at p and the village comes`);
  for (const k of [0, 8]) { await pg.$eval('#s-k', (e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, k); j = await p1();
    ok(near(j.b, P.model.defaults.p), `${wd}px: with words, after ${k} empty cries the watcher is still believed at p (P3)`); }
  await pg.click('#b-hoax'); j = await p1();
  ok(near(j.b, P.model.defaults.w) && !j.come && (await t('read')).includes('liar is not believed'), `${wd}px: with words, the hoaxer is believed at w (the fable's moral)`);
  await pg.click('#c-words'); await pg.click('#c-wolf'); await pg.click('#b-watch');
  await pg.$eval('#s-k', e => { e.value = 4; e.dispatchEvent(new Event('input')); }); j = await p1();
  ok(near(j.b, F.came.watcher) && j.come, `${wd}px: a ledger that keeps only "came" believes the watcher at ${F.came.watcher} and comes`);
  ok(near(j.hab, P.model.habit_by_k[4] * F.came.watcher), `${wd}px: the habituated village reads the count only`);
  ok(await pg.$$eval('#ledger tr', r => r.length) === 6, `${wd}px: the ledger shows four empty cries and the next`);
  const px = await pg.$eval('#curve', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; });
  ok(px > 1500, `${wd}px: the curves are drawn`);
  ok(await pg.$$eval('#cards .card', c => c.length) === 21 && await pg.$$eval('#cards .card[data-cls=hoax]', c => c.length) === 0, `${wd}px: 21 retractions, none a hoax (P1)`);
  ok((await t('n-error')) === String(P.archive.classes.error) && (await t('n-bare')) === String(P.archive.classes.bare), `${wd}px: class counts filled from plate1.json`);
  const hi = P.archive.rows.findIndex(r => r.r === 664); await pg.click(`#cards .card[data-i="${hi}"]`);
  ok((await t('cread')).includes('BALLISTIC MISSILE') && (await t('cread')).includes('38 minutes'), `${wd}px: the Hawaii retraction shows the warning it takes back`);
  const si = P.archive.rows.findIndex(r => r.r === 1894); await pg.click(`#cards .card[data-i="${si}"]`);
  ok((await t('cread')).includes('speaks to those who acted'), `${wd}px: the ShakeAlert retraction speaks to those who acted`);
  // plate II
  ok(await pg.evaluate(() => window.__p2check()), `${wd}px: the browser recounts the runs before every hit in the ${P2.counties_shown} counties it holds, as plate2.py did`);
  let q = await pg.evaluate(() => window.__p2);
  ok(q.county === P2.longest_run.county && !q.dealt && (await t('p2-read')).includes('Brevard'), `${wd}px: plate II opens on the longest run, Brevard County`);
  const rec = q, yr = JSON.stringify(q.perYear);
  await pg.click('#p2-deal'); q = await pg.evaluate(() => window.__p2);
  ok(q.dealt && JSON.stringify(q.perYear) === yr && q.met === rec.met && Math.abs(q.rec - rec.charge) < 1e-12, `${wd}px: a deal keeps every year's hits and changes only their order`);
  let moved = false; for (let i = 0; i < 6 && !moved; i++) { await pg.click('#p2-deal'); q = await pg.evaluate(() => window.__p2); moved = Math.abs(q.charge - rec.charge) > 1e-9; }
  ok(moved && (await t('p2-read')).includes('Dealt again'), `${wd}px: dealing again moves the charge (${rec.charge.toFixed(3)} -> ${q.charge.toFixed(3)})`);
  await pg.click('#p2-rec'); q = await pg.evaluate(() => window.__p2); ok(!q.dealt && Math.abs(q.charge - rec.charge) < 1e-12, `${wd}px: the record's order restores the charge`);
  await pg.click('#p2-any'); q = await pg.evaluate(() => window.__p2); ok(q.n >= 20, `${wd}px: any county draws a county with at least 20 warnings`);
  await pg.$eval('#p2-h', e => { e.value = 0.9; e.dispatchEvent(new Event('input')); }); ok((await t('p2-hv')) === '0.90', `${wd}px: the habit slider redraws`);
  ok((await t('p2f-a3')) === '9,427' && (await t('p2f-obs')) === '31.3 %' && (await t('p2f-off')) === (100 * P2.results.between_office_share).toFixed(1) + ' %' && (await t('p2f-luck')) === (100 * P2.results.luck_share).toFixed(1) + ' %', `${wd}px: plate II figures filled from plate2.json`);
  ok(!P2.predictions.P1 && !P2.predictions.P2 && P2.predictions.P3 && (await t('p2f-r2')) === (100 * P2.results.r2_rate).toFixed(1) + ' %', `${wd}px: the page reports P1 and P2 failed and P3 held, as plate2.json says`);
  for (const id of ['p2-strip', 'p2-hist']) { const n = await pg.$eval('#' + id, e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 1500, `${wd}px: ${id} is drawn`); }
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal scroll after use`);
  // plate III
  ok(await pg.evaluate(() => window.__p3check()), `${wd}px: the browser recomputes all ${P3J.offices.length} offices' empty shares, word-expected shares and excesses from the sequences, as plate3.py did`);
  ok(await pg.evaluate(() => window.__p3moves()) === P3J.rank_moves.median, `${wd}px: the median rank move (${P3J.rank_moves.median}) recomputed in the browser`);
  { const po = await pg.evaluate(() => P3.offices); ok(Object.keys(po).length === P3J.offices.length && P3J.offices.every(o => po[o.wfo] && po[o.wfo].n === o.n && po[o.wfo].far === o.far), `${wd}px: plate3.js holds plate3.json's offices`); }
  let r = await pg.evaluate(() => window.__p3);
  ok(r.wfo === 'MAF' && r.mode === 'hour' && (await t('p3-read')).includes("The hour's ledger"), `${wd}px: plate III opens on MAF, read by the hour`);
  await pg.click('#p3-later'); r = await pg.evaluate(() => window.__p3);
  ok(r.mode === 'later' && r.flip > 0 && (await t('p3-read')).includes('overturned'), `${wd}px: the later record overturns ${r.flip} of MAF's verdicts`);
  await pg.click('#p3-said'); r = await pg.evaluate(() => window.__p3);
  ok(r.mode === 'said' && (await t('p3-read')).includes('do not account for') && Math.abs(r.excess - r.json.excess) < 1e-9, `${wd}px: against what was said, MAF's excess is ${(100 * r.excess).toFixed(1)} %`);
  await pg.selectOption('#p3-off', 'BMX'); r = await pg.evaluate(() => window.__p3);
  ok(r.wfo === 'BMX' && r.excess < 0, `${wd}px: BMX reads below what its words predicted`);
  ok(await pg.$$eval('#p3-tab tbody tr', x => x.length) === 6, `${wd}px: the table holds the six words`);
  const H = P3J.predictions.P1.hit_hour, f = x => (100 * x).toFixed(1) + ' %';
  ok((await t('p3f-hR')) === f(H.R) && (await t('p3f-hCAT')) === f(H.CAT) && (await t('p3f-fO')) === f(P3J.predictions.P3.filled_obs) && (await t('p3f-r2')) === f(P3J.predictions.P2.r2), `${wd}px: plate III figures filled from plate3.json`);
  ok(P3J.predictions.P1.held && !P3J.predictions.P2.held && P3J.predictions.P3.held && (await t('p3f-ratio')) === P3J.predictions.P3.ratio.toFixed(1) + ' times', `${wd}px: the page reports P1 and P3 held and P2 failed, as plate3.json says`);
  ok(H.R < H.O && H.R < H.RC && H.O < H.OC && H.OC < H.CAT, `${wd}px: P1's order holds in plate3.json`);
  { const n = await pg.$eval('#p3-strip', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 1500, `${wd}px: p3-strip is drawn`); }
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with plate III`);
  // plate IV
  ok(await pg.evaluate(() => window.__p4check()), `${wd}px: the browser recomputes Hand's curve for both records and every office's books at the band's middle, as plate4.py did`);
  let h = await pg.evaluate(() => window.__p4);
  ok(h.inBand && h.rec === 'hour' && h.wfo === '',`${wd}px: plate IV opens in the band, by the hour, charging the warner ${h.charged} of ${h.all}`);
  ok(h.charged === 17356 && h.all === 18698 && JSON.stringify(h.owedCols) === JSON.stringify(['O', 'RC', 'OC', 'CAT']), `${wd}px: in the band by the hour, only the observed and damage-tagged columns are owed`);
  await pg.click('#p4-later'); h = await pg.evaluate(() => window.__p4);
  ok(h.charged === 374 && h.all === P4J.empty_later && h.owedCols.includes('R') && (await t('p4-read')).includes('amber band'), `${wd}px: the same price by the later record charges ${h.charged} of ${h.all}`);
  await pg.$eval('#p4-b', e => { e.value = 0.1; e.dispatchEvent(new Event('input')); }); h = await pg.evaluate(() => window.__p4);
  ok(h.charged === 0 && h.owedCols.length === 6 && (await t('p4-read')).includes('charges nothing'), `${wd}px: below every word's chance, Hand charges the warner nothing`);
  await pg.$eval('#p4-b', e => { e.value = 0.9; e.dispatchEvent(new Event('input')); }); h = await pg.evaluate(() => window.__p4);
  ok(h.charged === h.all && h.owedCols.length === 0, `${wd}px: above every word's chance, every empty is over-warning`);
  await pg.selectOption('#p4-off', 'MAF'); await pg.$eval('#p4-b', (e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, P4J.band_mid); await pg.click('#p4-hour'); h = await pg.evaluate(() => window.__p4);
  ok(h.wfo === 'MAF' && h.charged === P4J.offices_mid.MAF.charged_hour && h.all === P4J.offices_mid.MAF.empty_hour, `${wd}px: MAF's book in the band, by the hour: ${h.charged} of ${h.all}`);
  ok(await pg.$$eval('#p4-books tr', r => r.length) === 4 && (await t('p4-books')).includes('Brown'), `${wd}px: four books of who pays`);
  const c0 = await t('p4-cards'); await pg.click('#p4-more'); ok(await pg.$$eval('#p4-cards .card', c => c.length) === 4 && (await t('p4-cards')) !== c0, `${wd}px: four of the Studio's statements, and four more`);
  ok(P4J.predictions.R1.held && P4J.predictions.R2.held && P4J.predictions.R3.held && P4J.predictions.R4.held, `${wd}px: plate4.json records R1-R4 held`);
  ok((await t('p4f-pH')) === '92.8 %' && (await t('p4f-pL')) === '2.2 %' && (await t('p4f-share')) === '88.4 %' && (await t('p4f-ou')) === String(P4J.observed.unbacked), `${wd}px: plate IV figures filled from plate4.js agree with the apparatus`);
  { const n = await pg.$eval('#p4-line', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 3000, `${wd}px: p4-line is drawn`); }
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with plate IV`);
  await pg.screenshot({ path: path.join(here, `shot-${wd}.png`), fullPage: false });
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
