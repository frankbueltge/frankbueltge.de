// node verify_browser.mjs — TAKE COVER, AGAIN in a real browser at 390 px (light) and 1100 px (dark)
// Session 187: increment 1 (a county dealt, take cover / stay, the dark wait, the record's answer, the ledger).
// Session 188: increment 2 (the final database's toll, the empty warnings it fills, the tornadoes under no warning).
// Session 189: increment 3 (the warner's word: the dark ends where the office took the warning back; the belief columns).
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json')));
const D = JSON.parse(fs.readFileSync(join(here, 'data.js'), 'utf8').replace(/^window\.TCA=/, '').replace(/;\s*$/, ''));
const X = JSON.parse(fs.readFileSync(join(here, 'toll.js'), 'utf8').replace(/^window\.TCA_TOLL=/, '').replace(/;\s*$/, ''));
const XS = JSON.parse(fs.readFileSync(join(here, 'toll.json')));
const WD = JSON.parse(fs.readFileSync(join(here, 'word.js'), 'utf8').replace(/^window\.TCA_WORD=/, '').replace(/;\s*$/, ''));
const WS = JSON.parse(fs.readFileSync(join(here, 'word.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
let pass = 0, fail = 0, live = ''; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };

// data checks, outside the browser
t('data: arrays align', ['dur', 'met', 'rep', 'wfo'].every(k => D[k].length === D.issue.length) && D.issue.length === S.warnings);
t('data: met count', D.met.reduce((a, x) => a + x, 0) === S.met);
t('data: every met warning has a report, no empty one has', D.rep.every((r, i) => (r >= 0) === (D.met[i] === 1)));
t('data: county sequences in order of issue', D.counties.every(c => c[2].every((w, i) => i === 0 || D.issue[c[2][i - 1]] <= D.issue[w])));
t('data: durations 1..240', D.dur.every(x => x >= 1 && x <= 240));
let after3 = 0; for (const c of D.counties) { let r = 0; for (const w of c[2]) { if (D.met[w]) { if (r >= 3) after3++; r = 0; } else r++; } }
t('data: the fable count recomputed (' + after3 + ')', after3 === S.fable_met_after_3plus_empty);

// the toll, recomputed from toll.js by a second path
const NONE = new Set(X.none), B = XS.by_window[String(X.win)];
const under = new Set(Object.values(X.wt).flat());
t('toll: every tornado is under a warning or under none, never both', X.T.every((_, k) => under.has(k) !== NONE.has(k)) && under.size === B.tornadoes_under_a_warning);
t('toll: deaths add up', X.T.reduce((a, r) => a + r[5], 0) === XS.deaths && [...under].reduce((a, k) => a + X.T[k][5], 0) === B.deaths_under_a_warning);
const inDb = w => D.issue[w] + D.dur[w] <= X.end;
const emptyFilled = D.issue.filter((_, w) => inDb(w) && !D.met[w] && X.wt[w]).length;
const metBare = D.issue.filter((_, w) => inDb(w) && D.met[w] && !X.wt[w]).length;
t('toll: empty warnings the final database fills (' + emptyFilled + ')', emptyFilled === B.empty_warnings_with_a_tornado);
t('toll: met warnings it leaves bare (' + metBare + ')', metBare === B.met_warnings - B.met_warnings_with_a_tornado);
t('toll: every tornado under a warning began 15 min before to its expiry', Object.entries(X.wt).every(([w, ks]) => ks.every(k => X.T[k][0] >= D.issue[w] - 15 && X.T[k][0] <= D.issue[w] + D.dur[w])));
const moore = X.T.findIndex(r => r[5] === 24 && r[6] === 'OK');
const HOME = D.counties.find(c => c[1] === 'Cleveland OK');
const mPos = HOME[2].findIndex(w => (X.wt[w] || []).includes(moore) && X.T[moore][0] - D.issue[w] === 16);
t('toll: Moore 2013 under a Cleveland County warning issued 16 min before it began (#' + (mPos + 1) + ')', mPos >= 0);
const ci = D.counties.indexOf(HOME);
const uPos = HOME[2].findIndex((w, i) => i > 0 && (X.byc[ci] || []).some(k => NONE.has(k) && X.T[k][0] > D.issue[HOME[2][i - 1]] && X.T[k][0] <= D.issue[w]));
t('toll: Cleveland OK has a tornado under no warning between two of its warnings (#' + (uPos + 1) + ')', uPos > 0);
// the warner's word, recomputed from word.js by a second path
let tb = [0, 0], tbe = [0, 0], okStood = true;
D.counties.forEach((c, ci) => WD.taken[ci].forEach(([pos, s, pi]) => {
  const w = c[2][pos], m = D.met[w]; tb[m]++; if (s <= D.dur[w] - 5) tbe[m]++;
  if (!(s >= 0 && s <= D.dur[w] - 1 && WD.prod[pi] !== undefined)) okStood = false;
}));
t('word: every entry taken back stood less than issued, with its product', okStood);
t('word: taken back, met and empty (' + tb + ')', tb[1] === WS.met.taken_back && tb[0] === WS.empty.taken_back);
t('word: taken back five or more minutes early (' + tbe + ')', tbe[1] === WS.met.taken_back_early && tbe[0] === WS.empty.taken_back_early);
const br = {}; for (const c of D.counties) { let r = null; for (const w of c[2]) { if (r !== null) { const k = Math.min(r, 10); br[k] = br[k] || [0, 0]; br[k][0]++; br[k][1] += D.met[w]; } r = D.met[w] ? 0 : (r || 0) + 1; } }
t('word: the record\'s belief column recomputed', Object.entries(br).every(([k, v]) => WS.belief_record[k].entries === v[0] && WS.belief_record[k].met === v[1]));
const fake = n => Array.from({ length: n }, (_, i) => ({ i, act: 'stay', paid: 0, run: 0, met: D.met[HOME[2][i]] }));
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && !/Failed to load resource|CORS|mesonet/.test(x.text()) && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html') + '?speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' in progress, dated, at the top', /In progress · increment 3 of 5 · 2026-10-20/.test(await p.locator('#wip').textContent()));
  t(w + ' Cleveland OK dealt with all its warnings', (await p.locator('#strip i').count()) === HOME[2].length &&
    (await p.locator('#cname').textContent()).includes(HOME[2].length + ' warnings'));
  const first = HOME[2][0];
  t(w + ' first warning shows its issued minutes', (await p.locator('#clen').textContent()).includes(`Issued for ${D.dur[first]} minutes`));
  // stay on the first
  await p.click('#stay');
  const a1 = await p.locator('#answer').textContent();
  t(w + ' the record answers after staying', D.met[first] ? a1.includes('A tornado was reported') && a1.includes('You stayed') : a1.startsWith('No tornado was reported'));
  // cover on the second; speed 60 makes a minute pass in a second of the test
  await p.click('#next');
  const second = HOME[2][1];
  const tk2 = (WD.taken[ci].find(r => r[0] === 1) || [1, D.dur[second]])[1];
  await p.click('#cover');
  t(w + ' the dark comes up', await p.locator('#dark').isVisible());
  await p.waitForSelector('#dark', { state: 'hidden', timeout: 15000 });
  const a2 = await p.locator('#answer').textContent();
  t(w + ' after the full wait the answer, and the seconds paid', D.met[second] ? a2.includes('A tornado was reported') : a2.includes(`You sat ${tk2} seconds`));
  // cover and come out early on the third
  await p.click('#next'); await p.click('#cover'); await p.click('#out');
  const ledger = await p.locator('#ledger tbody tr').count();
  t(w + ' ledger holds three rows', ledger === 3);
  const tally = await p.locator('#tally').textContent();
  t(w + ' tally counts three answered', tally.includes('3warnings you have answered'));
  t(w + ' drift table drawn', (await p.locator('#drift tr').count()) === 6);
  t(w + ' the fable line carries the record count', (await p.locator('#fable').textContent()).includes(S.fable_met_after_3plus_empty.toLocaleString('en-US')));
  // persistence: reload keeps the county and the position
  await p.goto('file://' + join(here, 'index.html') + '?speed=60');
  await p.waitForSelector('#strip i');
  t(w + ' reload resumes the county at warning 4', (await p.locator('#cnum').textContent()).startsWith('Warning 4 of'));
  await p.click('#reset');
  t(w + ' reset starts again at 1', (await p.locator('#cnum').textContent()).startsWith('Warning 1 of'));
  await p.click('#deal');
  t(w + ' a dealt county has 20 or more warnings', parseInt((await p.locator('#cname').textContent()).split('·')[1]) >= 20);
  // the toll: jump to Moore's warning (the ledger stored as if answered up to it), stay, read the final database
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tca:' + HOME[0], JSON.stringify(fake(mPos))]);
  await p.goto('file://' + join(here, 'index.html') + '?speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  await p.click('#stay');
  const am = await p.locator('#answer').textContent();
  t(w + ' Moore: the final database names an EF5 and 24 killed', am.includes('The final database') && am.includes('EF5') && am.includes('24 people killed'));
  t(w + ' Moore: the tally counts the dead under a warning stayed for', +(await p.locator('#tally div').nth(5).locator('b').textContent()) >= 24);
  t(w + ' ledger has the final database column', (await p.locator('#ledger tbody tr').first().textContent()).includes('EF5'));
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tca:' + HOME[0], JSON.stringify(fake(uPos))]);
  await p.goto('file://' + join(here, 'index.html') + '?speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  t(w + ' a tornado under no warning is shown before the next warning', await p.locator('#unw').isVisible() && /under no warning at all/.test(await p.locator('#unw').textContent()));
  // the warner's word: a Cleveland County warning taken back early, covered for
  const kPos = WD.taken[ci].find(r => r[1] >= 3 && D.dur[HOME[2][r[0]]] - r[1] >= 5 && WD.prod[r[2]]);
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tca:' + HOME[0], JSON.stringify(fake(kPos[0]))]);
  await p.goto('file://' + join(here, 'index.html') + '?speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  await p.click('#cover');
  await p.waitForFunction(() => document.getElementById('dback').textContent.length > 0, null, { timeout: 15000 });
  t(w + ' in the dark: the office takes the warning back (#' + (kPos[0] + 1) + ')', /taken the warning back for this county/.test(await p.locator('#dback').textContent()));
  await p.waitForSelector('#dark', { state: 'hidden', timeout: 15000 });
  const ak = await p.locator('#answer').textContent();
  t(w + ' a dark ended by the office is not called coming out early', !ak.includes('come out early'));
  t(w + ' the answer: seconds paid are the minutes it stood here', ak.includes(`after ${kPos[1]} minutes of its ${D.dur[HOME[2][kPos[0]]]}`) && (D.met[HOME[2][kPos[0]]] || ak.includes(`You sat ${kPos[1]} seconds`)));
  await p.waitForFunction(() => !/Fetching/.test(document.getElementById('wordtext').textContent), null, { timeout: 20000 }).catch(() => {});
  const wt = await p.locator('#wordtext').textContent();
  live = wt; t(w + ' the office\'s words fetched live, or the fetch failing plainly', /In its own words|could not be fetched|names no cancellation/.test(wt));
  t(w + ' the tally counts the seconds given back', (await p.locator('#tally').textContent()).includes(`${D.dur[HOME[2][kPos[0]]] - kPos[1]} sthe warner gave back`));
  t(w + ' belief table has five columns', (await p.locator('#drift tr').first().locator('th').count()) === 5);
  t(w + ' the word facts carry the counts', (await p.locator('#wordfacts').textContent()).includes(WS.empty.taken_back_early.toLocaleString('en-US')));
  t(w + ' the toll facts carry the database counts', (await p.locator('#tollfacts').textContent()).includes(B.empty_warnings_with_a_tornado.toLocaleString('en-US')));
  t(w + ' no horizontal overflow after the toll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' no errors after play', errs.length === 0);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await ctx.close();
}
await b.close();
console.log('live word:', live.slice(0, 300));
console.log(`${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
