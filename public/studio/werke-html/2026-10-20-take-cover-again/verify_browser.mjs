// node verify_browser.mjs — TAKE COVER, AGAIN in a real browser at 390 px (light) and 1100 px (dark)
// Session 187: increment 1 (a county dealt, take cover / stay, the dark wait, the record's answer, the ledger).
// Session 188: increment 2 (the final database's toll, the empty warnings it fills, the tornadoes under no warning).
// Session 189: increment 3 (the warner's word: the dark ends where the office took the warning back; the belief columns).
// Session 190: increment 4 (the record whole: every county's run on one map, the dead, the Atelier's OBSERVED rings).
// Session 191: increment 5 (finished; the method folded; the 15-minute window corrected against window.json).
// Session 192: a coda after the presentation (the Field's correction of the 39 %: resample.json, the deadliest tornado set aside).
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
const R = JSON.parse(fs.readFileSync(join(here, 'record.js'), 'utf8').replace(/^window\.TCA_RECORD=/, '').replace(/;\s*$/, ''));
const RS = JSON.parse(fs.readFileSync(join(here, 'record.json')));
const WIN = JSON.parse(fs.readFileSync(join(here, 'window.json')));
const RES = JSON.parse(fs.readFileSync(join(here, 'resample.json')));
const PE = JSON.parse(fs.readFileSync(join(here, 'people.js'), 'utf8').replace(/^window\.TCA_PEOPLE=/, '').replace(/;\s*$/, ''));
const PJ = JSON.parse(fs.readFileSync(join(here, 'people.json')));
const PPL = new Map(PE.i.map((w, k) => [w, PE.p[k]]));
const est = n => (n < 100 ? Math.round(n) : +n.toPrecision(2)).toLocaleString('en-US');
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
// the record whole, recomputed by a second path: county runs in order of each warning's end, the dead from toll.js
const endOf = w => D.issue[w] + D.dur[w];
let fin3 = 0, fin10 = 0, lmax = 0, lOk = true, mN = 0, m3 = 0;
D.counties.forEach((c, ci) => { let r = 0, mx = 0; for (const w of [...c[2]].sort((a, b) => endOf(a) - endOf(b) || a - b)) { if (D.met[w]) { mN++; if (r >= 3) m3++; } r = D.met[w] ? 0 : r + 1; mx = Math.max(mx, r); } if (r >= 3) fin3++; if (r >= 10) fin10++; lmax = Math.max(lmax, mx); if (R.longest[ci] !== mx) lOk = false; });
t('whole: counties three and ten deep at the end (' + fin3 + ', ' + fin10 + ')', fin3 === RS.counties_in_a_run_of_3_or_more_at_the_end && fin10 === RS.counties_in_a_run_of_10_or_more_at_the_end);
t('whole: every county\'s longest run (max ' + lmax + ')', lOk && lmax === RS.longest_run_anywhere);
const deadT = X.T.filter(r => r[5] > 0);
t('whole: the dead are the final database\'s, tornado by tornado', R.dead.length === deadT.length && R.dead.every((d, i) => d[0] === deadT[i][0] && d[1] === deadT[i][5]));
const noneDead = X.T.reduce((a, r, k) => a + (NONE.has(k) ? r[5] : 0), 0);
t('whole: the dead under no warning have no run (' + noneDead + ')', R.dead.filter(d => d[4] === -1).reduce((a, d) => a + d[1], 0) === noneDead && noneDead === RS.dead_by_run_before.none);
// the run before a deadly tornado's warning, read again from the county sequence
let rbOk = 0;
for (const d of R.dead) { if (d[4] < 0) continue; const seq = D.counties[d[3]][2]; const k = X.T.findIndex(r => r[0] === d[0] && r[5] === d[1]); const ws = seq.filter(w => (X.wt[w] || []).includes(k)); if (!ws.length) continue; const i = seq.indexOf(ws[0]); let r = 0; for (let j = i - 1; j >= 0 && !D.met[seq[j]]; j--) r++; if (r === d[4]) rbOk++; else console.log('run mismatch', d); }
t('whole: each placed death\'s run read again from its county (' + rbOk + ')', rbOk === R.dead.filter(d => d[4] >= 0).length);
const dead3 = R.dead.filter(d => d[4] >= 3).reduce((a, d) => a + d[1], 0);
t('whole: dead after three or more empty (' + dead3 + ')', dead3 === RS.dead_by_run_before['3-9'] + RS.dead_by_run_before['10+']);
t('whole: the Atelier\'s rings are empty in both records', R.observed.every(w => !D.met[w] && !X.wt[w]) && R.observed.length === RS.atelier_observed_joined_unbacked_here);
const fake = n => Array.from({ length: n }, (_, i) => ({ i, act: 'stay', paid: 0, run: 0, met: D.met[HOME[2][i]] }));
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && !/Failed to load resource|CORS|mesonet/.test(x.text()) && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html') + '?at=999999999&speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' finished, dated, at the top', /^Finished · 2026-10-21 · cycle 009.*corrected 2026-10-22 in a coda/.test(await p.locator('#wip').textContent()));
  t(w + ' the method is folded, the work is not', !(await p.locator('#method').getAttribute('open')) && await p.locator('#map').isVisible() && await p.locator('#card').isVisible());
  { const c = await p.locator('#corr').textContent(), V = WIN.by_window, f = n => n.toLocaleString('en-US');
    t(w + ' the correction carries window.json\'s counts', [V['15'].atelier_classes_2008_to_db_end.CAT.filled_later, V['60'].atelier_classes_2008_to_db_end.CAT.filled_later, V['120'].atelier_classes_2008_to_db_end.CAT.filled_later, V['15'].met_warnings_with_no_track, V['60'].met_warnings_with_no_track, V['15'].empty_warnings_filled_later, V['60'].empty_warnings_filled_later, V['15'].deaths_under_none, V['60'].deaths_under_none].every(n => c.includes(' ' + f(n) + ' ') || c.includes(' ' + f(n) + ',') || c.includes(' ' + f(n) + ';') || c.includes(' ' + f(n) + '.'))); }
  // the record whole
  await p.waitForFunction(() => window.TCA_WHOLE && document.getElementById('wcount').textContent.length > 0);
  const wc = await p.locator('#wcount').textContent();
  t(w + ' whole: the map opens on the record\'s end, with its counts', wc.includes(S.warnings.toLocaleString('en-US')) && wc.includes(fin3.toLocaleString('en-US')) && wc.includes(dead3.toLocaleString('en-US')));
  const pcS = (x, y) => Math.round(100 * x / y) + ' %';
  t(w + ' whole: the baseline line at the end (' + pcS(m3, mN) + ' of met, ' + pcS(dead3, RS.dead) + ' of the dead)', (await p.locator('#wbase').textContent()).includes(pcS(m3, mN)) && (await p.locator('#wbase').textContent()).includes(pcS(dead3, RS.dead)));
  t(w + ' whole: the county taken below is marked on the map', await p.evaluate(() => window.TCA_current()[0] === 'OKC027'));
  t(w + ' whole: the page\'s runs at the end equal the second path', await p.evaluate(([a, b]) => { const r = window.TCA_WHOLE.run; let x = 0, y = 0; for (const v of r) { if (v >= 3) x++; if (v >= 10) y++; } return x === a && y === b; }, [fin3, fin10]));
  // the coda: the resampled interval and the deadliest tornado set aside
  { const c = await p.locator('#corr2').textContent(), pr = x => Math.round(100 * x);
    t(w + ' coda: the correction carries resample.json', [pr(RES.interval_95_all_dead[0]), pr(RES.interval_95_all_dead[1]), RES.largest_tornado.dead, pr(RES.largest_tornado.share_of_the_550)].every(n => c.includes(String(n))) && c.includes(String(Math.round(1000 * RES.without_the_largest.share_of_all_dead) / 10)));
    t(w + ' coda: the line under the map gives the interval at the end', (await p.locator('#wbase').textContent()).includes(pr(RES.interval_95_all_dead[0]) + ' to ' + pr(RES.interval_95_all_dead[1]) + ' %'));
    await p.locator('#aside').check();
    const ab = await p.locator('#wbase').textContent(), big = R.dead.reduce((a, d) => d[1] > a[1] ? d : a);
    t(w + ' coda: set aside, the dead\'s share is ' + pcS(dead3 - big[1], RS.dead - big[1]) + ', the hits\' ' + pcS(m3, mN), ab.includes(pcS(dead3 - big[1], RS.dead - big[1])) && ab.includes(pcS(m3, mN)) && ab.includes(pr(RES.without_the_largest.interval_95_all_dead[0]) + ' to ' + pr(RES.without_the_largest.interval_95_all_dead[1]) + ' %'));
    await p.locator('#aside').uncheck(); }
  const may = Math.round((Date.parse('2011-05-01T00:00Z') - Date.parse(D.t0)) / 60000);
  await p.evaluate(m => window.TCA_WHOLE.seek(m), may);
  const wc2 = await p.locator('#wcount').textContent();
  const n11 = D.issue.filter((_, w) => endOf(w) <= may).length;
  t(w + ' whole: seeking to 1 May 2011 counts the warnings ended by then (' + n11 + ')', wc2.includes(n11.toLocaleString('en-US')) && (await p.locator('#wdate').textContent()) === '2011-05-01');
  await p.selectOption('#mode', 'ever');
  t(w + ' whole: the longest-run view counts the counties ever three deep', (await p.locator('#wcount').textContent()).includes('ever sat three or more'));
  await p.selectOption('#mode', 'now');
  await p.click('#play'); await p.waitForTimeout(700); await p.click('#play');
  t(w + ' whole: play advances the day', await p.evaluate(m => window.TCA_WHOLE.t > m, may));
  // a tap on Cleveland County deals it to the card
  await p.evaluate(() => { const r = document.getElementById('map').getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top - 10); });
  const box = await p.locator('#map').boundingBox();
  const vh = await p.evaluate(() => innerHeight);
  const hit = await p.evaluate(([bx, by, bw, bh, ugc, vh0]) => { const hs = []; for (let y = by + 2; y < Math.min(by + bh, vh0); y += 2) for (let x = bx + 2; x < bx + bw; x += 2) { const c = window.TCA_WHOLE.at(x, y); if (c !== null && window.TCA.counties[c][0] === ugc) hs.push([Math.round(x), Math.round(y)]); } return hs.length ? hs[hs.length >> 1] : null; }, [box.x, box.y, box.width, box.height, 'OKC027', vh]);
  if (hit) { await p.mouse.click(hit[0], hit[1]); await p.waitForTimeout(1200); }
  t(w + ' whole: a tap on Cleveland County takes it to the card', !!hit && (await p.locator('#cname').textContent()).startsWith('Cleveland OK'));
  await p.evaluate(m => window.TCA_WHOLE.seek(m), 1e9);
  t(w + ' Cleveland OK dealt with all its warnings', (await p.locator('#strip i').count()) === HOME[2].length &&
    (await p.locator('#cname').textContent()).includes(HOME[2].length + ' warnings'));
  const first = HOME[2][0];
  t(w + ' first warning shows its issued minutes', (await p.locator('#clen').textContent()).includes(`Issued for ${D.dur[first]} minutes`));
  // stay on the first
  await p.click('#stay');
  const a1 = await p.locator('#answer').textContent(); if (!a1) console.log('a1 empty; card', await p.locator('#cnum').textContent(), await p.locator('#acts').isVisible());
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
  await p.goto('file://' + join(here, 'index.html') + '?at=999999999&speed=60');
  await p.waitForSelector('#strip i');
  t(w + ' reload resumes the county at warning 4', (await p.locator('#cnum').textContent()).startsWith('Warning 4 of'));
  await p.click('#reset');
  t(w + ' reset starts again at 1', (await p.locator('#cnum').textContent()).startsWith('Warning 1 of'));
  await p.click('#deal');
  t(w + ' a dealt county has 20 or more warnings', parseInt((await p.locator('#cname').textContent()).split('·')[1]) >= 20);
  // the toll: jump to Moore's warning (the ledger stored as if answered up to it), stay, read the final database
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tca:' + HOME[0], JSON.stringify(fake(mPos))]);
  await p.goto('file://' + join(here, 'index.html') + '?at=999999999&speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  await p.click('#stay');
  const am = await p.locator('#answer').textContent();
  t(w + ' Moore: the final database names an EF5 and 24 killed', am.includes('The final database') && am.includes('EF5') && am.includes('24 people killed'));
  t(w + ' Moore: the tally counts the dead under a warning stayed for', +(await p.locator('#tally div').nth(5).locator('b').textContent()) >= 24);
  t(w + ' ledger has the final database column', (await p.locator('#ledger tbody tr').first().textContent()).includes('EF5'));
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tca:' + HOME[0], JSON.stringify(fake(uPos))]);
  await p.goto('file://' + join(here, 'index.html') + '?at=999999999&speed=60&county=' + HOME[0]);
  await p.waitForSelector('#strip i');
  t(w + ' a tornado under no warning is shown before the next warning', await p.locator('#unw').isVisible() && /under no warning at all/.test(await p.locator('#unw').textContent()));
  // the warner's word: a Cleveland County warning taken back early, covered for
  const kPos = WD.taken[ci].find(r => r[1] >= 3 && D.dur[HOME[2][r[0]]] - r[1] >= 5 && WD.prod[r[2]]);
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['tca:' + HOME[0], JSON.stringify(fake(kPos[0]))]);
  await p.goto('file://' + join(here, 'index.html') + '?at=999999999&speed=60&county=' + HOME[0]);
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
  // coda II (session 194): the people under the warning, in the dark and after it
  t(w + ' coda II paragraph carries the joined count and the hours', (await p.locator('#coda2').textContent()).includes(PJ.joined.toLocaleString('en-US')) &&
    (await p.locator('#coda2').textContent()).includes(Math.round(PJ.person_hours_empty / 1e6) + ' million hours'));
  t(w + ' the top line names the second coda', /second coda/.test(await p.locator('#wip').textContent()));
  {
    const kp = HOME[2].findIndex(x => PPL.has(x) && !D.met[x]);
    await p.goto('file://' + join(here, 'index.html') + '?at=999999999&speed=240&county=' + HOME[0]);
    await p.waitForSelector('#strip i'); await p.click('#reset');
    for (let k = 0; k < kp; k++) { await p.click('#stay'); await p.click('#next'); }
    const x = HOME[2][kp];
    await p.click('#cover');
    const dl = await p.locator('#dppl').textContent();
    t(w + ` in the dark, warning ${kp + 1}: the people under it with you`, dl === `About ${est(PPL.get(x))} other people are under this warning with you.`);
    await p.waitForSelector('#dark', { state: 'hidden', timeout: 15000 });
    const ap = await p.locator('#ppl').textContent();
    t(w + ' after it: their hours under an empty warning', ap.includes(`${est(PPL.get(x) * D.dur[x] / 60)} hours of theirs under a warning no tornado met`));
    t(w + ' the tally counts other people\'s hours', (await p.locator('#tally').textContent()).includes('hours other people stood under those empty warnings'));
    const k0 = HOME[2].findIndex(x => !PPL.has(x));
    t(w + ' a warning outside the estimate says nothing of people', k0 < kp);
  }
  t(w + ' no errors after the coda', errs.length === 0);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await ctx.close();
}
await b.close();
console.log('live word:', live.slice(0, 300));
console.log(`${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
