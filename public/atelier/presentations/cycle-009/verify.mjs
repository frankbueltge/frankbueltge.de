// Drive The Wolf's Ledger in a real browser at two widths and check it against plate1.json. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const P = JSON.parse(fs.readFileSync(path.join(here, 'plate1.json')));
const P2 = JSON.parse(fs.readFileSync(path.join(here, 'plate2.json')));
const P3J = JSON.parse(fs.readFileSync(path.join(here, 'plate3.json')));
const P4J = JSON.parse(fs.readFileSync(path.join(here, 'plate4.json')));
const P5J = JSON.parse(fs.readFileSync(path.join(here, 'plate5.json')));
const CJ = JSON.parse(fs.readFileSync(path.join(here, 'coda.json')));
const PJ = JSON.parse(fs.readFileSync(path.join(here, 'price.json')));
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
  // plate V
  ok(await pg.evaluate(() => window.__p5check()), `${wd}px: the browser's three villages recompute plate5.json at the defaults over the ${P5J.calibrated_on_R} calibrated offices`);
  ok(Object.values(P5J.predictions).filter(q => q.held).length === 5 && !P5J.predictions.Q5.held && P5J.predictions.Q2.held, `${wd}px: plate5.json records Q1-Q4 and Q6 held, Q5 failed`);
  ok(P5J.williams_checked === true && !!P5J.case_facts_checked, `${wd}px: Williams's quotations and plate IV's case summaries were asserted by plate5.py`);
  let v = await pg.evaluate(() => window.__p5);
  ok(v.wfo === 'OUN' && v.n0 === 20 && v.rec === 'hour' && (await t('p5-read')).includes('calibrated'), `${wd}px: plate V opens on OUN at n0 = 20 by the hour`);
  for (const n0 of [2, 200]) { await pg.$eval('#p5-n0', (e, x) => { e.value = x; e.dispatchEvent(new Event('input')); }, n0); v = await pg.evaluate(() => window.__p5);
    ok(v.n0 === n0 && v.s.all >= 0.95 && v.s.hitW > 1 && v.s.runW < 1, `${wd}px: at n0 = ${n0} the learning village does not charge on average (${v.s.all.toFixed(3)}), recovers after hits, and still falls after runs`); }
  await pg.click('#p5-later'); v = await pg.evaluate(() => window.__p5); ok(v.rec === 'later' && (await t('p5-read')).includes('more than its words'), `${wd}px: the later record switches the villages`);
  await pg.click('#p5-hour'); await pg.selectOption('#p5-off', 'MAF'); v = await pg.evaluate(() => window.__p5); ok(v.wfo === 'MAF' && v.rows > 0, `${wd}px: another office can be chosen`);
  ok((await t('p5f-run')) === '95.9 %' && (await t('p5f-rpH')) === '90.2 %' && (await t('p5f-rho')) === '0.90' && (await t('p5f-mL')) === 'none', `${wd}px: plate V figures filled from plate5.js agree with the apparatus`);
  { const n = await pg.$eval('#p5-run', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 3000, `${wd}px: p5-run is drawn`); }
  ok(await pg.$$eval('del.sup', d => d.length) >= 10 && await pg.$$eval('ins.corr', d => d.length) >= 10, `${wd}px: the corrections at the critique are visible, struck and marked`);
  ok((await t('brief')).includes('condition fires'), `${wd}px: the brief at the top states the finding`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with plate V`);
  // coda (2026-10-22)
  let cd = await pg.evaluate(() => window.__coda());
  ok(cd.win === 15 && Math.abs(cd.cat - CJ.windows[0].later.CAT) < 1e-12 && cd.read.includes('least kept'), `${wd}px: the coda opens at the Studio's 15-minute clause, catastrophic least kept`);
  await pg.click('#cd-btns button[data-i="2"]'); cd = await pg.evaluate(() => window.__coda());
  ok(cd.win === 60 && cd.read.includes('83.3 %') && cd.read.includes('as the instruction does'), `${wd}px: at 60 minutes catastrophic is met 83.3 % and the words rank as the instruction says`);
  ok(CJ.windows.every(w => w.p3_held) && CJ.windows.filter(w => w.later_rank_as_words).map(w => w.min).join() === '60,120,240', `${wd}px: coda.json: plate III's P3 holds at every window; the later rank follows the words from 60 minutes`);
  ok((await t('cdf-cat15')) === '46.7 %' && (await t('cdf-p3lo')) === '3.83' && (await t('cdf-p3hi')) === '4.17', `${wd}px: coda figures filled from coda.js`);
  ok(cd.iread.includes('learns') && cd.iread.includes('habit') && cd.iread.includes('stops listening'), `${wd}px: the record as it is holds all three villages`);
  await pg.$eval('#cd-k', e => { e.value = 6; e.dispatchEvent(new Event('input')); }); cd = await pg.evaluate(() => window.__coda());
  ok(cd.k === 6 && cd.iread.includes('learns') && !cd.iread.includes('habit') && cd.iread.includes('estimate'), `${wd}px: at six times the record habit leaves the interval, learning stays, marked as an estimate`);
  // coda III (2026-10-22, third session): set one tornado aside, the Field's study 36
  const AJ = JSON.parse(fs.readFileSync(path.join(here, 'aside.json')));
  await pg.$eval('#cd-k', e => { e.value = 1; e.dispatchEvent(new Event('input')); });
  cd = await pg.evaluate(() => window.__coda());
  ok(cd.aside === 'all' && cd.first === 'habit' && cd.xh === '5.1' && cd.xl === '7.2' && (await t('cdf-pt')) === '1.21', `${wd}px: coda III opens on the record as it is: habit leaves first, at 5.1 times, learning at 7.2, as coda I said`);
  await pg.click('#cd-aside button[data-k="without_joplin"]'); cd = await pg.evaluate(() => window.__coda());
  ok(cd.aside === 'without_joplin' && cd.xh === '3.7' && cd.xl === '12.0' && cd.iread.includes('learns') && cd.iread.includes('habit') && cd.iread.includes('stops listening'), `${wd}px: Joplin set aside: the interval still holds all three; habit 3.7, learning 12.0`);
  await pg.selectOption('#cd-loo', '613559'); cd = await pg.evaluate(() => window.__coda());
  ok(cd.aside === 613559 && cd.first === 'learning' && cd.aread.includes('reversed') && cd.xl === '3.4' && (await t('cdf-pt')) === '1.30', `${wd}px: the Louisiana tornado of 2016-02-23 set aside: point 1.30, learning leaves first at 3.4 times, the order reversed`);
  ok(AJ.loo.length === 30 && AJ.loo.every(o => o.all_inside) && AJ.loo_learning_first.join() === '613559' && (await t('cdf-loo')) === '1.17–1.30' && (await t('cdf-cross')) === '1.23', `${wd}px: aside.json: 30 fits, all hold the villages, one reverses the order; figures filled from aside.js`);
  await pg.$eval('#cd-k', e => { e.value = 4; e.dispatchEvent(new Event('input')); }); cd = await pg.evaluate(() => window.__coda());
  ok(cd.iread.includes('habit') && !cd.iread.includes('learns'), `${wd}px: with that tornado aside, at four times the record learning has left and habit stays`);
  await pg.click('#cd-aside button[data-k="all"]'); await pg.$eval('#cd-k', e => { e.value = 1; e.dispatchEvent(new Event('input')); });
  for (const id of ['cd-win', 'cd-int']) { const n = await pg.$eval('#' + id, e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 2000, `${wd}px: ${id} is drawn`); }
  // coda II (2026-10-22): the Field's prices in plate IV and in its own figure
  ok(await pg.evaluate(() => window.__pricecheck()), `${wd}px: coda II recomputes the Field's chance of a meeting and the charged empties at $7.25 and $15, as price.py did`);
  let pr = await pg.evaluate(() => window.__price);
  ok(pr.v === PJ.min_wage && pr.cH === PJ.at['7.25'].hour.charged && pr.cL === PJ.at['7.25'].later.charged && !pr.owedH.includes('R') && !pr.owedL.includes('R'), `${wd}px: coda II opens at the minimum wage, radar indicated over-warning by both records`);
  await pg.$eval('#pr-v', e => { e.value = 7.1; e.dispatchEvent(new Event('input')); }); pr = await pg.evaluate(() => window.__price);
  ok(pr.owedH.includes('R') && !pr.owedL.includes('R') && (await t('pr-read')).includes('five-cent band'), `${wd}px: at $7.10, inside the band, the two records part on radar indicated`);
  await pg.click('#pr-15'); pr = await pg.evaluate(() => window.__price); ok(pr.v === 15 && pr.cH === PJ.at['15'].hour.charged, `${wd}px: the Field's $15 button`);
  ok((await t('pr-d0')) === '$7.09' && (await t('pr-d1')) === '$7.14' && (await t('p4f-usd0')) === '$7.09' && (await t('pr-mwh')) === '92.8 %' && (await t('pr-mwl')) === '94.1 %', `${wd}px: coda II figures filled from price.js`);
  await pg.click('#p4-usd'); await pg.click('#p4-hour'); h = await pg.evaluate(() => window.__p4);
  ok(h.usd && Math.abs(h.b - 7.25 * PJ.k.hour) < 1e-9 && !h.owedCols.includes('R'), `${wd}px: plate IV priced at $7.25 by the hour's ledger: B / L ${h.b.toFixed(3)}, radar indicated not owed`);
  await pg.click('#p4-later'); h = await pg.evaluate(() => window.__p4);
  ok(h.usd && Math.abs(h.b - 7.25 * PJ.k.later) < 1e-9 && !h.owedCols.includes('R') && (await t('p4-read')).includes('Priced'), `${wd}px: priced, switching the record moves the line with it (B / L ${h.b.toFixed(3)}), and radar indicated stays not owed`);
  await pg.$eval('#p4-b', e => { e.value = 0.268; e.dispatchEvent(new Event('input')); }); h = await pg.evaluate(() => window.__p4); ok(!h.usd, `${wd}px: dragging B / L leaves the priced mode`);
  { const n = await pg.$eval('#pr-c', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 2000, `${wd}px: pr-c is drawn`); }
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with the coda`);
  // coda IV (2026-10-22, fifth session): the number and the sentence, the Field's study 37
  const SJ = JSON.parse(fs.readFileSync(path.join(here, 'survey.json')));
  ok(SJ.rows.length === 15 && (await pg.$$('#sv-cards .card')).length === 15 && SJ.rows[0].om === 315890 && SJ.rows[0].class === 'silent', `${wd}px: coda IV shows the fifteen of greatest pull; the first, McLoud, has a silent narrative`);
  ok(SJ.counts.states === 8 && SJ.counts.part === 1 && SJ.counts.mentions === 3 && SJ.counts.silent === 3 && (await t('svf-st')) === '8' && (await t('svf-sil')) === '3', `${wd}px: survey.json: 8 count, 1 in part, 3 mention, 3 silent; filled from survey.js`);
  await pg.click('#sv-cards .card[data-i="1"]'); let sv = await pg.evaluate(() => window.__survey());
  ok(sv.row === 613559 && sv.read.includes('approximately 75 injuries occurred at the RV park'), `${wd}px: the Louisiana tornado's card quotes its narrative: about 75 injured at an RV park`);
  await pg.click('#sv-cards .card[data-i="0"]'); sv = await pg.evaluate(() => window.__survey());
  ok(sv.row === 315890 && sv.read.includes('no sentence of its narrative speaks of anyone hurt'), `${wd}px: McLoud's card says its narrative speaks of no one hurt`);
  ok((await pg.$eval('#sv-oun mark', e => e.textContent)) === ', and injuring the truck driver' && !(await t('sv-se')).includes('injur') && (await t('svf-ounj')) === '1' && (await t('svf-sej')) === '32', `${wd}px: the two accounts side by side, the clause the database lacks marked`);
  ok(sv.n === 32 && sv.irr === 1.214 && sv.first === 'habit', `${wd}px: the count opens at the database's 32: the Field's 1.214, habit first`);
  await pg.click('#sv-btns button[data-n="1"]'); sv = await pg.evaluate(() => window.__survey());
  ok(sv.n === 1 && sv.irr === 1.334 && sv.first === 'learning' && sv.iread.includes('reversed') && sv.iread.includes('office'), `${wd}px: at the office's 1 injured the ratio is 1.334 and the order reverses`);
  ok(SJ.sweep.every(x => x.all_inside) && SJ.habit_first_from === 27 && SJ.sweep.filter(x => x.first_of_two === 'habit').every(x => x.inj >= 27) && (await t('svf-flip')) === '27', `${wd}px: every count 0-32 holds all three villages; habit goes first only from 27 injured`);
  ok(SJ.field.full.irr === 1.214 && SJ.field.without_315890.irr === 1.338 && SJ.mcloud.oun_day_injuries === 293 && SJ.mcloud.storm_events_day_injuries_ok === 342, `${wd}px: the refits reproduce the Field's fit and leave-out; the day's injured 293 by the office, 342 by the database`);
  { const n = await pg.$eval('#sv-int', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 1500, `${wd}px: coda IV's interval is drawn`); }
  await pg.click('#sv-btns button[data-n="32"]');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with coda IV`);
  // coda IV corrected (2026-10-23, sixth session): the office's two accounts
  const XJ = JSON.parse(fs.readFileSync(path.join(here, 'accounts.json'))), cac = k => XJ.accounts.find(x => x.key === k);
  ok(XJ.accounts.length === 4 && (await pg.$$('#ac-cards .card')).length === 4 && cac('page').D3 === 1 && cac('storm_data').D3 === 32 && cac('storm_events').D3 === 32 && cac('spc').D3 === 32, `${wd}px: four accounts of McLoud: the page 1, the official report, the database and SPC 32`);
  ok(cac('storm_data').official === true && cac('storm_data').B4 === 18 && cac('page').B4 === 0 && cac('spc').B4 === 18 && XJ.narrative_same_as_database && cac('storm_data').sentence === false && XJ.sources.storm_data.printed === '10/14/2011', `${wd}px: the official report, printed 2011-10-14, gives 32 and 18, with the database's narrative and no sentence of anyone hurt`);
  ok((await t('ac-sd3')) === '32' && (await t('ac-printed')) === '2011-10-14' && (await pg.$eval('#ac-cards .card[data-k="storm_data"]', e => e.getAttribute('aria-pressed'))) === 'true', `${wd}px: the correction opens on the official report, filled from accounts.js`);
  await pg.click('#ac-cards .card[data-k="page"]'); let ac = await pg.evaluate(() => window.__accounts()); sv = await pg.evaluate(() => window.__survey());
  ok(ac.n === 1 && sv.n === 1 && sv.irr === 1.334 && ac.read.includes('defers') && ac.read.includes('reversed'), `${wd}px: choosing the event page moves coda IV's count to 1 (1.334, reversed)`);
  await pg.click('#ac-cards .card[data-k="storm_data"]'); ac = await pg.evaluate(() => window.__accounts()); sv = await pg.evaluate(() => window.__survey());
  ok(ac.n === 32 && sv.irr === 1.214 && sv.first === 'habit' && ac.read.includes('official'), `${wd}px: choosing the official report moves it back to 32 (1.214, habit first)`);
  ok((await pg.$$eval('s', es => es.filter(e => /office's count/.test(e.textContent)).length)) === 2, `${wd}px: "the office's count" is struck through in two places, not removed`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with the correction`);
  // coda IV corrected again (2026-10-23, seventh session): one tornado, two rows, at the Field's correction
  const TJ = JSON.parse(fs.readFileSync(path.join(here, 'tracks.json'))), tc = (m, l) => TJ.cells.find(c => c.mcloud === m && c.louisiana === l);
  ok(TJ.cells.length === 4 && (await pg.$$('#tr-cards .card')).length === 4 && tc(32, 'two rows').irr === 1.214 && tc(1, 'two rows').irr === 1.334 && tc(32, 'one track').irr === 1.277 && tc(1, 'one track').irr === 1.419, `${wd}px: four readings, equal to the Field's study 38 (1.214, 1.334, 1.277, 1.419)`);
  ok(TJ.track.segments[0].stop.join() === TJ.track.segments[1].start.join() && TJ.track.segments[0].end === TJ.track.segments[1].begin && TJ.track.spc_rows.length === 2 && TJ.official_mcloud === 32, `${wd}px: the two parish segments meet at one point and one minute; the SPC file counts two`);
  let tr = await pg.evaluate(() => window.__tracks());
  ok(tr.mc === 32 && tr.la === 'two rows' && tr.first === 'habit' && tr.read.includes('as the Field fitted'), `${wd}px: the figure opens on the record as fitted, habit first`);
  await pg.click('#tr-cards .card[data-mc="32"][data-la="one track"]'); tr = await pg.evaluate(() => window.__tracks());
  ok(tr.irr === 1.277 && tr.first === 'learning' && tr.read.includes('reversed') && tr.read.includes('official report') && (await t('trf-one')) === '1.277', `${wd}px: official 32 with one track reads 1.277, above the parting, order reversed`);
  ok(TJ.cells.every(c => c.all_inside), `${wd}px: every reading's interval holds all three villages`);
  ok((await t('tr-s0')).includes('crossed into St. James Parish') && (await t('tr-s1')).includes('moved out of Assumption Parish'), `${wd}px: both crossing sentences quoted from the database file`);
  for (const id of ['tr-map', 'tr-int']) { const n = await pg.$eval('#' + id, e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; }); ok(n > 1000, `${wd}px: ${id} is drawn`); }
  ok((await pg.$$eval('del.sup', es => es.filter(e => /the order coda I read stands/.test(e.textContent)).length)) === 1, `${wd}px: "the order coda I read stands" struck through and dated, not removed`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with the second correction`);
  // how it grew (2026-10-22, fourth session): PROCESS.json as columns, each state's shot on a click
  const GJ = JSON.parse(fs.readFileSync(path.join(here, 'PROCESS.json'))).states;
  ok(GJ.every((s, i) => s.n === i + 1 && fs.existsSync(path.join(here, s.shot))) && (await pg.$$('#grow button')).length === GJ.length, `${wd}px: one column per state of PROCESS.json (${GJ.length}), every shot on disk`);
  let gw = await pg.evaluate(() => window.__grow); ok(gw.n === GJ.length && (await pg.$eval('#grow-img', e => e.getAttribute('src'))) === GJ.at(-1).shot, `${wd}px: the figure opens on the latest state`);
  await pg.click('#grow button:nth-child(1)'); await pg.waitForFunction(() => document.getElementById('grow-img').complete);
  gw = await pg.evaluate(() => window.__grow); const nat = await pg.$eval('#grow-img', e => [e.naturalWidth, e.naturalHeight]);
  ok(gw.n === 1 && nat[0] === 1100 && nat[1] === gw.height && (await t('grow-read')).includes('84ea08e'), `${wd}px: state 1 shows its own shot, 1100 x ${gw.height}, and its commit`);
  const hs = await pg.$$eval('#grow button', bs => bs.map(b => b.getBoundingClientRect().height));
  ok(hs.every((h, i) => !i || h >= hs[i - 1]), `${wd}px: the columns never shrink: the page only grew`);
  await pg.click('#grow-next'); ok((await pg.evaluate(() => window.__grow)).n === 2, `${wd}px: "later" steps to state 2`);
  await pg.screenshot({ path: path.join(here, `shot-${wd}.png`), fullPage: false });
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
