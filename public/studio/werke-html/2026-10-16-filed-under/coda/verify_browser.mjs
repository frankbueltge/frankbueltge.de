// node verify_browser.mjs — FILED UNDER, coda (sessions 178 and 181), in a real browser at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html'));
  await p.waitForSelector('#strip rect.tick');
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' the coda line says it is a coda, after the presentation', /Coda, added 2026-10-17.*session 181/.test(await p.textContent('#codaline')));
  const k = await p.evaluate(() => ({ n: __coda.closed.length, came: __coda.closed.filter(c => c.events.length).length,
    e: Math.round(__coda.closed.reduce((a, c) => a + c.p, 0) * 10) / 10, ticks: document.querySelectorAll('#strip rect.tick').length,
    fate: __coda.closed.every(c => (c.fate === 'needed') === (c.events.length > 0)) }));
  t(`${w} ${k.n} closed weeks dealt, ${k.came} came, ${k.e} stated (summary ${S.closed}, ${S.came}, ${S.stated_expected})`, k.n === S.closed && k.came === S.came && k.e === S.stated_expected && k.ticks === S.closed && k.fate);
  t(w + ' the record is sealed before filing', (await p.locator('#circle circle.ev').count()) === 0 && (await p.locator('#sealtext').count()) === 1);
  // a shut drawer refuses and the slip comes back
  await p.click('.drawer[data-d="heeded"]', { force: true });
  t(w + ' heeded is shut, nothing filed', /shut/.test(await p.textContent('#answer')) && (await p.evaluate(() => JSON.parse(localStorage.getItem('filed-under-coda-v1') || '[]').length)) === 0);
  // file card 1 (Ridgecrest, none came) under never needed by carrying the slip
  await p.locator('#slip').scrollIntoViewIfNeeded();
  const s = await p.locator('#slip').boundingBox(); const d = await p.locator('.drawer[data-d="never_needed"]').boundingBox();
  await p.mouse.move(s.x + s.width / 2, s.y + s.height / 2); await p.mouse.down();
  await p.mouse.move(d.x + d.width / 2, d.y + d.height / 2, { steps: 8 }); await p.mouse.up();
  const c1 = await p.evaluate(() => __coda.closed[0]);
  t(w + ` carried slip into never needed: ${c1.place} -> backed`, c1.events.length === 0 && /backed/.test(await p.textContent('#answer .v')));
  await p.click('#next'); await p.click('.drawer[data-d="cant_say"]');
  t(w + " can't say is contradicted for a closed week", /contradicted/.test(await p.textContent('#answer .v')));
  // a week where aftershocks came, filed never needed -> contradicted, dots drawn
  const j = await p.evaluate(() => __coda.closed.findIndex(c => c.events.length > 2));
  await p.evaluate(j => __coda.show(j), j); await p.click('.drawer[data-d="never_needed"]');
  await p.waitForTimeout(4300);
  const nev = await p.evaluate(j => __coda.closed[j].events.length, j);
  t(w + ` never needed contradicted where ${nev} came, and ${nev} dots shown`, /contradicted/.test(await p.textContent('#answer .v')) &&
    (await p.locator('#circle circle.ev[opacity="1"]').count()) === nev);
  t(w + ' a filed week cannot be refiled', await p.evaluate(() => { const n = JSON.parse(localStorage.getItem('filed-under-coda-v1')).length; document.querySelector('.drawer[data-d="needed"]').click(); return JSON.parse(localStorage.getItem('filed-under-coda-v1')).length === n; }));
  const L = await p.evaluate(() => JSON.parse(localStorage.getItem('filed-under-coda-v1')));
  t(w + ' ledger has 3, carried once, held seconds kept', L.length === 3 && L[0].filed_by === 'carried' && L.every(l => typeof l.seconds_before_filing === 'number'));
  t(w + ' tally: the record answered 3 of 3', /answered <b>3<\/b>/.test(await p.innerHTML('#tally')));
  // judge over every closed card and every drawer: no closed filing meets silence
  t(w + ' rules: every closed filing answered', await p.evaluate(() => __coda.closed.every(c => ['needed', 'never_needed', 'cant_say'].every(d => ['backed', 'contradicted'].includes(__coda.judge(c, d))))));
  t(w + ' every card links its USGS page', (await p.locator('#cplace a[href^="https://earthquake.usgs.gov/earthquakes/eventpage/"]').count()) === 1);
  // written twice (session 181)
  const W2 = S.written_twice;
  const tw = await p.evaluate(() => ({ lines: document.querySelectorAll('#twice line.pair').length,
    red: document.querySelectorAll('#twice line.pair[stroke="var(--contra)"]').length,
    pairs: __coda.closed.filter(c => c.u && c.u.closed),
    }));
  const pc = tw.pairs; const st = Math.round(pc.reduce((a, c) => a + c.u.p, 0) * 10) / 10;
  t(`${w} written twice: ${tw.lines} lines, ${tw.red} came, ${st} stated (summary ${W2.pairs}, ${W2.update_came}, ${W2.update_stated})`,
    tw.lines === W2.pairs && tw.red === W2.update_came && st === W2.update_stated && pc.every(c => (c.u.fate === 'needed') === (c.u.events.length > 0)));
  t(w + ' second-writing rules match the summary', pc.filter(c => c.fate !== c.u.fate).length === W2.fate_changed && pc.filter(c => c.u.p < c.p).length === W2.lowered);
  const ia = await p.evaluate(() => { const had = new Set(JSON.parse(localStorage.getItem('filed-under-coda-v1')).map(l => l.id)); return __coda.closed.findIndex(c => c.u && c.u.closed && c.u.events.length > 0 && !had.has(c.id)); });
  await p.evaluate(j => __coda.show(j), ia);
  t(w + ' the second writing is offered only after the first is filed', !(await p.isVisible('#againbtn')));
  await p.click('.drawer[data-d="needed"]');
  t(w + ' after filing, the keeper writes again', /wrote again/.test(await p.textContent('#againbtn')));
  await p.click('#againbtn');
  t(w + ' second card is marked, sealed, and says its earlier chance', (await p.evaluate(() => __coda.mode())) === 'again' && /written again/.test(await p.textContent('#ctag')) && /It had written/.test(await p.textContent('#cwords')) && (await p.locator('#sealtext').count()) === 1);
  await p.click('.drawer[data-d="never_needed"]');
  t(w + ' second writing judged on its own week: never needed contradicted', /contradicted/.test(await p.textContent('#answer .v')));
  const L2 = await p.evaluate(() => JSON.parse(localStorage.getItem('filed-under-coda-v1')));
  t(w + ' ledger keeps both writings of one sequence apart', L2.length === 5 && L2.filter(l => l.id === L2[4].id).length === 2 && L2[4].writing === 'second' && L2[3].writing === 'first');
  await p.click('#againbtn');
  t(w + ' back to the first writing, still filed', (await p.evaluate(() => __coda.mode())) === 'first' && (await p.textContent('#answer .v')) === L2[3].record);
  t(w + ' written-twice facts drawn', (await p.locator('#twicefacts li').count()) === 4 && (await p.textContent('#twicefacts')).includes(String(W2.warn_dropped)));
  t(w + ' no horizontal overflow after use', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' no errors after use', errs.length === 0);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await ctx.close();
}
await b.close(); console.log(`${pass} of ${pass + fail}`); process.exit(fail ? 1 : 0);
