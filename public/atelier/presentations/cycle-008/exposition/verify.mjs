// Drive the exposition in a real browser at two widths and check it against null.py. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const N = JSON.parse(fs.readFileSync(path.join(here, 'null.json')));
const Q = JSON.parse(fs.readFileSync(path.join(here, 'plate6.json')));
const V = JSON.parse(fs.readFileSync(path.join(here, 'plate7.json')));
const E = JSON.parse(fs.readFileSync(path.join(here, 'plate8.json')));
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  const t = id => pg.innerText('#' + id);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok(await pg.evaluate(() => window.__expo.REC) === N.observed && N.observed === 38, `${wd}px: the browser re-judges the record to 38, as null.py does`);
  ok((await t('aread')).includes('too high') && (await t('aread')).includes('consistent'), `${wd}px: Avenal's narrowest classes disagree on the record`);
  ok((await t('t-om')) === String(N.laws['one factor'].median) && (await t('t-ag')) === Math.round(N.laws['as written'].share_ge_observed * 100) + ' %', `${wd}px: table filled from null.json`);
  await pg.click('#draw50'); ok(await pg.evaluate(() => window.__expo.count()) === 50, `${wd}px: fifty one-factor worlds drawn`);
  const c = +(await t('wcount')); ok(c >= 0 && c <= 252, `${wd}px: a drawn world reports a count (${c})`);
  await pg.click('#b-as'); await pg.click('#draw1'); ok((await t('wread')).includes('odds as written'), `${wd}px: law switches to the odds as written`);
  await pg.click('#b-rec'); ok(+(await t('wcount')) === 38, `${wd}px: the record button shows 38`);
  const px = await pg.$eval('#hist', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; });
  ok(px > 500, `${wd}px: the histogram is drawn`);
  // plate VI (increment 2)
  ok(await pg.evaluate(() => P6R.length) === Q.heeded.n && Q.heeded.n === 13371, `${wd}px: plate VI carries all 13,371 dealt warnings`);
  ok(await pg.evaluate(() => { const c = { 1: 0, 3: 0, 4: 0 }; P6R.forEach(r => c[r[7]]++); return c[1] + '/' + c[3] + '/' + c[4]; }) === [Q.never_needed.silent_at_1_no_declaration, Q.never_needed.silent_at_3_words_do_not_name, Q.never_needed.voice_made_at_3_contradicts].join('/'), `${wd}px: per-warning moments recount to plate6.json`);
  await pg.click('#m-reset'); ok(await pg.$$eval('#sieve rect[data-k="v"]', r => r.length) === 3, `${wd}px: before the first moment all three fates can be spoken to`);
  await pg.click('#m-step'); ok(await pg.$$eval('#sieve rect[data-k="u"]', r => r.length) === 1 && (await t('mread')).includes('unmakeable'), `${wd}px: moment 1 makes heeded's silence unmakeable`);
  await pg.click('#m-step'); ok(await pg.$$eval('#sieve rect[data-k="v"]', r => r.length) === 0, `${wd}px: moment 2 leaves no fate voiced`);
  await pg.click('#m-all'); ok(await pg.$$eval('#sieve rect[data-k="r"]', r => r.length) === 1 && (await t('mread')).includes('Backed, at any moment, for any fate: 0'), `${wd}px: at the end only the reader's voice stands, and nothing is backed`);
  await pg.click('#t-atlas'); ok((await t('tcard')).includes('Pennington') && (await pg.innerText('#trace')).includes('Winter Storm Atlas'), `${wd}px: the Pennington trace shows the one named incident`);
  await pg.click('#t-rock'); ok((await pg.innerText('#trace')).includes('contradicts') && (await t('tcard')).includes('MANDATORY EVACUATION'), `${wd}px: the Rockaways warning is contradicted at retrieval`);
  await pg.click('#t-rand'); ok(await pg.evaluate(() => window.__p6.traced) >= 0, `${wd}px: any warning can be traced`);
  ok((await t('p-fill')) === Q.probe.incidents_filled.toLocaleString('en-US'), `${wd}px: probe counts filled from plate6.json`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with plate VI`);
  // plate VII (increment 3)
  const p7 = () => pg.evaluate(() => window.__p7); const near = (a, b) => Math.abs(a - b) < 0.03;
  ok(await pg.$$eval('#p7grid button', b => b.length) === 250, `${wd}px: plate VII draws 250 sequences`);
  for (const [btn, k] of [['#r-first', 'first'], ['#r-later', 'later'], ['#r-harsh', 'harshest'], ['#r-kind', 'kindest']]) {
    await pg.click(btn); const j = await p7(), v = V.readers[k];
    ok(j.o === v.observed && near(j.r, v.ratio) && j.v === v.verdict && j.sighted === v.sighted, `${wd}px: the ${k} reader recomputes in the browser to ${v.observed}/${v.stated}, ${v.verdict}`);
  }
  await pg.click('#r-first'); await pg.click('#r-hide'); await pg.click('#p7grid button[data-i="0"]');
  let j = await p7(); ok(j.hidden && !j.sighted && (await t('p7read')).includes('hidden') && await pg.$$eval('#p7grid button.h', b => b.length) === 0, `${wd}px: a click made blind stays declared, and no outcome shows`);
  await pg.click('#r-hide'); await pg.click('#p7grid button[data-i="1"]');
  j = await p7(); ok(j.sighted && (await t('p7read')).includes('after seeing'), `${wd}px: a click made sighted is marked as chosen after the outcome`);
  ok((await t('p7card')).includes('versions'), `${wd}px: a tapped sequence shows its versions`);
  await pg.click('#r-coin'); j = await p7(); ok(!j.sighted && j.later > 60 && j.later < 190, `${wd}px: a blind coin reads about half the sequences a day later (${j.later})`);
  ok((await pg.innerText('#p7tab')).includes('too low') && (await t('v-med')) === String(V.versions.median), `${wd}px: plate VII table and counts filled from plate7.json`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with plate VII`);
  await pg.$eval('#p7grid', e => e.scrollIntoView()); await pg.screenshot({ path: path.join(process.env.SHOTS || '/tmp', `expo-p7-${wd}.png`) });
  // plate VIII (increment 4)
  const p8 = () => pg.evaluate(() => window.__p8);
  ok(await pg.$$eval('#p8grid button', b => b.length) === 232 && await pg.$$eval('#p8lags button', b => b.length) === 9, `${wd}px: plate VIII draws 232 sequences and nine clock rules`);
  for (let k = 0; k < 9; k++) { await pg.click('#p8-l' + k); const j = await p8(), d = E.declared[k];
    ok(j.o === d.observed && near(j.r, d.ratio) && j.v === d.verdict && !j.sighted, `${wd}px: clock rule ${d.lag_h} h recomputes to ${d.observed}/${d.stated}, ${d.verdict}, declared`); }
  ok(await pg.$$eval('#p8grid button.h', b => b.length) === 0, `${wd}px: before showing, no outcome is drawn`);
  await pg.click('#p8-l0'); await pg.click('#p8-write');
  ok((await pg.innerText('#p8ledger')).includes('the odds ran too high') && (await p8()).ledger[0] === 'indicative', `${wd}px: a rule fixed blind writes the indicative "ran too high"`);
  await pg.click('#p8-kind'); j = await p8(); ok(j.sighted && j.o === E.sighted.kindest.observed && j.v === 'too low', `${wd}px: the kindest hand is sighted and reads too low (${j.o})`);
  await pg.click('#p8-write'); ok((await pg.innerText('#p8ledger')).includes('would have run too low') && (await p8()).ledger[1] === 'subjunctive', `${wd}px: a sighted verdict is written only in the subjunctive`);
  await pg.click('#p8-l3'); await pg.click('#p8-show'); j = await p8();
  ok(j.seen && !j.sighted && await pg.$$eval('#p8grid button.h', b => b.length) > 0, `${wd}px: showing what came keeps a reading fixed before it declared`);
  await pg.click('#p8-l1'); j = await p8(); ok(j.sighted && (await pg.innerText('#p8read')).includes('subjunctive'), `${wd}px: a clock rule chosen after showing is subjunctive`);
  ok(await pg.$eval('#p8-show', b => b.disabled), `${wd}px: the page does not offer to forget what it showed`);
  await pg.click('#p8-refuse'); ok((await pg.innerText('#p8ledger')).includes(String(E.event.changes_with_the_version) + ' of 232'), `${wd}px: restraint writes the span and the ${E.event.changes_with_the_version} moving events`);
  await pg.fill('#p8did', 'Slept in the car that week.'); await pg.click('#p8-did');
  ok((await pg.innerText('#p8ledger')).includes('might have slept in the car that week') && (await pg.innerText('#p8ledger')).includes('no record holds this'), `${wd}px: the column no reading reaches is written in the subjunctive and marked as the visitor's`);
  ok(await pg.$$eval('#p8axis [data-k="declared"]', c => c.length) === 9 && await pg.$$eval('#p8axis [data-k="ledger"]', c => c.length) === 2, `${wd}px: the axis carries nine declared rules and the two verdicts written`);
  ok((await t('p8j-ch')) === String(E.event.changes_with_the_version) && (await t('p8dv')) === E.distinct_versions.total.toLocaleString('en-US'), `${wd}px: plate VIII counts filled from plate8.json`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll with plate VIII`);
  await pg.$eval('#p8axis', e => e.scrollIntoView()); await pg.screenshot({ path: path.join(process.env.SHOTS || '/tmp', `expo-p8-${wd}.png`) });
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  await pg.screenshot({ path: path.join(process.env.SHOTS || '/tmp', `expo-${wd}.png`), fullPage: false });
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
