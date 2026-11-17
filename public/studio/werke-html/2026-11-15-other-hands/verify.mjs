// OTHER HANDS — open the page as a visitor does and compare what it says and draws with the Field's and the Atelier's files
// and with this work's own second reading of the acts' states (check/state-second-reading.json).
// Usage (repo root): node works/2026-11-15-other-hands/verify.mjs [out-dir-for-stills]
// The siblings' results are fetched from their repositories at the commits data.js names, not from this work's data.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2];
const CK = JSON.parse(fs.readFileSync(path.join(here, 'check', 'state-second-reading.json'), 'utf8'));
// after the presentation (session 250): the red line read again on one rule, and the faint row drawn with its interval
const VR = JSON.parse(fs.readFileSync(path.join(here, 'check', 'voice-second-reading.json'), 'utf8'));
function wilson(k, n, z) { const p = k / n, c = p + z * z / (2 * n), h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)), d = 1 + z * z / n; return [(c - h) / d, (c + h) / d]; }
function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
function sure(k, pop, found, hits, n) {  // how sure a Wilson interval is that at least k more exist, read one-sided
  const p = (k + found) / pop, below = p <= hits / n; let lo = 0, hi = 12;
  for (let i = 0; i < 80; i++) { const z = (lo + hi) / 2; if (below ? wilson(hits, n, z)[0] > p : wilson(hits, n, z)[1] < p) lo = z; else hi = z; }
  const phi = 0.5 * (1 + erf(lo / Math.SQRT2)); return below ? phi : 1 - phi;
}
const browser = await chromium.launch(); let bad = 0, n = 0;
const ok = (name, cond, detail) => { n++; if (!cond) bad++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
let R77 = null, R75 = null, RA = null, D77 = null, R78 = null, R79 = null, AFT = null, D79 = null;
for (const [w, h] of [[1132, 900], [390, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(here, 'index.html')); await page.waitForTimeout(400);
  const M = await page.evaluate(() => OH.meta);
  if (!R77) {
    const base = `https://raw.githubusercontent.com/frankbueltge/field-research/${M.field_commit}/artifacts/cycle-015/what-harm-is-on-record/`;
    R77 = await (await fetch(base + 'results77.json')).json(); R75 = await (await fetch(base + 'results75.json')).json();
    const t = await (await fetch(base + 'data77.js')).text(); D77 = JSON.parse(t.slice(t.indexOf('=') + 1).trim().replace(/;$/, ''));
    RA = (await (await fetch(`https://raw.githubusercontent.com/frankbueltge/ulysses/${M.atelier_commit}/artifacts/cycle-015/named-for-them/check.json`)).json()).res;
    // fourth state: the Field's 69 acts as corrected by its check 79, and the Atelier's reading of who asked for each
    R78 = await (await fetch(base + 'results78.json')).json(); R79 = await (await fetch(base + 'results79.json')).json();
    const t9 = await (await fetch(base + 'data79.js')).text(); D79 = JSON.parse(t9.slice(t9.indexOf('=') + 1).trim().replace(/;$/, ''));
    AFT = (await (await fetch(`https://raw.githubusercontent.com/frankbueltge/ulysses/${M.atelier_commit}/artifacts/cycle-015/named-for-them/after.json`)).json()).res;
    ok('the Field kept this work\'s second reading: the same state for all 60', CK.acts.every(a => D79.acts.find(x => x[0] === a.id)[6] === a.final));
    ok('the Field checked this work\'s six corrections and all hold', R79.offered.held === 6 && R79.state_changed.join() === CK.changed.join());
    // this work's check file against the Field's acts: it read the same 60, and its counts follow from its own rows
    const F = Object.fromEntries(D77.acts.map(a => [a[0], a]));
    ok('check file: the Field\'s 60 acts and their states', CK.acts.length === 60 && CK.acts.every(a => F[a.id] && F[a.id][8] === a.field));
    const cnt = {}; CK.acts.forEach(a => { const k = F[a.id][6] + ' ' + a.final; cnt[k] = (cnt[k] || 0) + 1; });
    ok('check file: its counts follow from its rows', ['user concluded', 'user opened', 'maker concluded', 'maker opened'].every(k => cnt[k] === CK.counts.final[k]), JSON.stringify(cnt));
    ok('check file: agreement and changes', CK.acts.filter(a => a.field === a.second).length === CK.agree && CK.disagree.length === 60 - CK.agree && CK.acts.filter(a => a.field !== a.final).map(a => a.id).join() === CK.changed.join() && CK.disagree.every(i => CK.third_reading[i]));
    ok('check file: the Field\'s own state counts', Object.keys(CK.counts.field).every(k => CK.counts.field[k] === R77.B.state[k]));
    // the second reading of the red line: the Field's 46 and the Atelier's 30, its counts from its own rows
    const tA = await (await fetch(`https://raw.githubusercontent.com/frankbueltge/ulysses/${M.atelier_commit}/artifacts/cycle-015/named-for-them/check.js`)).text();
    const VA = Object.fromEntries(JSON.parse(tA.slice(tA.indexOf('=') + 1).trim().replace(/;$/, '')).voice.map(v => [v.id, v.code]));
    const HC = (await (await fetch(`https://raw.githubusercontent.com/frankbueltge/ulysses/${M.atelier_commit}/artifacts/cycle-015/named-for-them/hand_codes.json`)).json()).check.rule;
    const carried = D77.C.filter(c => c[3] && c[2] !== 'harmed').map(c => c[0]).sort((a, b) => a - b);
    ok('voice file: it read the Field\'s 46 that quote or carry the harmed\'s words', VR.field.map(x => x.id).join() === carried.join() && carried.length === R77.press.own_words - R77.press.harmed);
    ok('voice file: the Atelier\'s 30 and its codes', VR.atelier.length === 30 && VR.atelier.every(x => VA[x.id] === x.atelier));
    ok('voice file: the rule is the Atelier\'s', ['own', 'body', 'other', 'none'].every(k => VR.rule[k] === HC[k]));
    const cf = {}; VR.field.forEach(x => { cf[x.code] = (cf[x.code] || 0) + 1; });
    ok('voice file: its counts follow from its rows', ['own', 'body', 'other', 'none'].every(k => (cf[k] || 0) === (VR.counts.field_46[k] || 0)), JSON.stringify(cf));
    ok('voice file: two readers agree, or a third reading decides', VR.field.filter(x => x.readers[0] === x.readers[1]).length === VR.counts.readers_agree_on_field && VR.field.every(x => x.readers[0] === x.readers[1] ? x.code === x.readers[0] && !x.third_reading : x.third_reading) && VR.field.filter(x => x.third_reading).length === VR.counts.third_reading);
    ok('voice file: the readings of the Atelier\'s 30', [0, 1].every(n => VR.atelier.filter(x => x.readers[n] === x.atelier).length === VR.counts.atelier_30_reader_agreement[n]));
    ok('the faint row: each mark as sure as the Field\'s Wilson interval', M.ghost_sure.length === R77.whole_record.estimate_ci[1] - R77.A.final_harmed - R77.press.harmed && M.ghost_sure.every((v, i) => Math.abs(v - sure(i + 1, R77.press.population, R77.press.harmed, R77.press.harmed, R77.press.drawn)) < 0.002));
  }
  // the numbers a visitor reads, read from the page (caption, check box, text)
  const said = await page.evaluate(() => { const o = {}; document.querySelectorAll('[data-n]').forEach(e => { const v = +e.textContent.replace(/,/g, ''); (o[e.dataset.n] = o[e.dataset.n] || new Set()).add(v); }); return Object.fromEntries(Object.entries(o).map(([k, s]) => [k, [...s]])); });
  const B = R77.B, P = R77.press, V = RA.voice, CF = CK.counts.final, N9 = R79.n69, CE = N9.cells;
  const forMaker = Object.keys(CK.for_the_maker).filter(k => /^\d+$/.test(k)).length;
  const firstRead = R77.A.agreement.n + P.drawn + V.own + V.body + V.other + V.none - RA.voice_in_field_sample.length;
  const was = (P.own_words - P.harmed) + V.own + V.body + V.other, rc = VR.counts.field_46;
  const voice = V.own + V.body + VR.field.filter(x => x.code === 'own' || x.code === 'body').length, told = V.other + VR.field.filter(x => x.code === 'other').length;
  const inside = voice + told;
  const src = {
    incidents: R75.incidents, with_report: R75.incidents_with_first_report, press: R75.first_reporter['press and other'],
    not_press: R75.incidents_with_first_report - R75.first_reporter['press and other'],
    first_read: firstRead, read_by_hand: R77.A.agreement.n, field_press: P.drawn, atelier_press: V.own + V.body + V.other + V.none, read_twice: RA.voice_in_field_sample.length,
    harmed: R77.A.final_harmed, press_wrote: P.harmed, wrote_found: R77.A.final_harmed + P.harmed, words_inside: inside,
    field_carried: P.own_words - P.harmed, own_words: V.own, body_words: V.body, through_another: V.other,
    estimate: R77.whole_record.estimate, estimate_lo: R77.whole_record.estimate_ci[0], estimate_hi: R77.whole_record.estimate_ci[1],
    estimate_not_found: R77.whole_record.estimate - R77.A.final_harmed - P.harmed,
    not_found_lo: R77.whole_record.estimate_ci[0] - R77.A.final_harmed - P.harmed, not_found_hi: R77.whole_record.estimate_ci[1] - R77.A.final_harmed - P.harmed,
    voice_inside: voice, told_inside: told, words_inside_was: was, reread: VR.field.length,
    reread_voice: rc.own + rc.body, reread_told: rc.other, reread_none: rc.none,
    reread_agree: VR.field.filter(x => x.readers[0] === x.readers[1]).length, reread_third: VR.field.filter(x => x.third_reading).length,
    calib_agree: Math.min(...[0, 1].map(n => VR.atelier.filter(x => x.readers[n] === x.atelier).length)),
    calib_agree_hi: Math.max(...[0, 1].map(n => VR.atelier.filter(x => x.readers[n] === x.atelier).length)),
    answered: B.n, public_acted: N9.n, acted_60: B.public_final, acted_new: R78.A.new_n, public_first_read: R78.A.n,
    on_user: N9.target.user, on_maker: N9.target.maker, on_maker_60: B.target.maker,
    user_concluded: CE['user against concluded'] + CE['user for concluded'], user_opened: CE['user against opened'] + (CE['user for opened'] || 0),
    maker_concluded: CE['maker against concluded'] + CE['maker for concluded'], maker_opened: CE['maker against opened'] + CE['maker for opened'],
    concluded: N9.state.concluded, begun: N9.state.opened, concluded_60: CF['user concluded'] + CF['maker concluded'],
    field_concluded: B.state['user concluded'] + B.state['maker concluded'],
    for_party: N9.direction.for, claims: AFT.claims, own_motion: AFT.own, harmed_claims: AFT.claimant_harmed_side, harmed_claims_for: AFT.claim_maker_for,
    on_public_body_was: R79.on_a_public_body.presented.length, corrections_held: R79.offered.held,
    state_read_again: CK.n, state_agree: CK.agree, state_differ: CK.disagree.length, state_changed: CK.changed.length, for_maker: forMaker,
    on_public_body: R79.on_a_public_body.corrected.length,
    general_model: Object.values((await (await fetch(`https://raw.githubusercontent.com/frankbueltge/field-research/${M.field_commit}/artifacts/cycle-015/what-harm-is-on-record/check77/adjudication.json`)).json()).frontier.general_model_makers).flat().length,
  };
  for (const k of Object.keys(said)) ok(`${w}px number ${k}`, k in src && said[k].length === 1 && said[k][0] === src[k], `${said[k]} on the page, ${src[k]} in the sources`);
  // what was drawn on the sheet and in the counts
  const d = await page.evaluate(() => window.__oh), s = d.drawn, t = d.tally;
  ok(`${w}px sheet: handwriting, red lines and broken ones`, s.H === src.wrote_found && s.T === voice && s.t === told, `${s.H} hands, ${s.T} lines, ${s.t} broken`);
  ok(`${w}px sheet: seals by side`, s.left === src.on_user && s.right === src.on_maker, `${s.left} left, ${s.right} right`);
  ok(`${w}px sheet: discs and rings`, s.Sc + (s.Vc || 0) === src.concluded && s.So + (s.Vo || 0) === src.begun && src.concluded + src.begun === src.public_acted && (s.Vc || 0) + (s.Vo || 0) === src.for_party, `${s.Sc}+${s.Vc} discs, ${s.So}+${s.Vo} rings`);
  ok(`${w}px sheet: red rims`, s.rim === src.harmed_claims && AFT.claim_on_maker === src.harmed_claims, `${s.rim}`);
  ok(`${w}px sheet: witnesses`, s.w === R77.A.final_codes.witness);
  const words = Object.entries(s).filter(([k]) => k.length === 1 && k !== '0').reduce((a, [, v]) => a + v, 0);
  ok(`${w}px sheet: one word per attached report`, words === M.words && words === 6964 && d.words - s['0'] === words, `${words}`);
  ok(`${w}px sheet: paragraphs without a report`, s['0'] === R75.incidents - R75.incidents_with_first_report);
  const firsts = 'prgmsunwtTH'.split('').reduce((a, k) => a + (t[k] || 0), 0);
  ok(`${w}px counts: first reports`, firsts === src.with_report && t.H === src.wrote_found && t.T === voice && t.t === told, `${firsts}`);
  ok(`${w}px counts: the estimate runs to its upper end, with ticks at its low end, its middle and its end`, t.G === src.not_found_hi && d.ghostTicks.join() === [src.not_found_lo, src.estimate_not_found, src.not_found_hi].join(), `${t.G}; ticks ${d.ghostTicks}`);
  ok(`${w}px counts: seals`, t.Sc + (t.Vc || 0) === src.concluded && t.Sc + t.So + (t.Vc || 0) + (t.Vo || 0) === src.public_acted && t.rim === src.harmed_claims);
  ok(`${w}px a seal is at least 10 px across`, d.sealR * 2 >= 10, `${d.sealR * 2}`);
  // the numbers written into the sheet's description and the year sentence
  const label = await page.getAttribute('#sheet', 'aria-label');
  ok(`${w}px label: the sheet's description`, label.includes(`${src.wrote_found} paragraphs begin`) && label.includes(`In ${voice} more a red line`) && label.includes(`in ${told} more a broken one`) && label.includes(`${src.public_acted} paragraphs have a seal`) && label.includes(`${src.on_user} on the left, ${src.on_maker} on the right, ${src.for_party} of them black`) && label.includes(`${src.begun} of the ${src.public_acted} seals are rings`) && label.includes(`${src.harmed_claims} seals have a red rim`) && label.includes('1,803 incidents'));
  const yr = await page.evaluate(() => [OH.inc.filter(r => r[1].slice(0, 4) === '2025').length, OH.inc.filter(r => r[1].slice(0, 4) <= '2021').length]);
  const text = await page.evaluate(() => document.body.textContent);
  ok(`${w}px the page says it is presented, not in progress`, text.includes('Presented 16 November 2026') && !/in progress/i.test(text));
  ok(`${w}px text: 2025 against the years up to 2021`, text.includes(`(${yr[0]})`) && text.includes(`(${yr[1]})`) && yr[0] > yr[1] && yr[0] === R75.years['2025'], yr.join(' / '));
  ok(`${w}px text: reports in the snapshot`, text.includes('6,964 reports attached') && M.words === 6964 && text.includes(`out of ${M.reports_in_snapshot.toLocaleString('en-US')} in the snapshot`));
  // where the sheet stands
  const top = await page.evaluate(() => document.getElementById('sheet').getBoundingClientRect().top);
  ok(`${w}px the sheet begins on the first screen`, top < h * 0.7, `${Math.round(top)} px down; ${d.height} px tall (${(d.height / h).toFixed(1)} screens)`);
  // the readings and the stepping
  await page.click('#rHand'); await page.waitForTimeout(700);
  const red = src.wrote_found + inside, seen = new Set();
  const restText = await page.textContent('#say');
  ok(`${w}px reading: what the harmed's reading says`, restText.includes(`Of ${firstRead} first reports`) && restText.includes(`wrote ${src.wrote_found}`) && restText.includes(`quoted in ${voice} more`) && restText.includes(`only told in ${told}.`) && restText.includes(`other ${(src.with_report - firstRead).toLocaleString('en-US')} were`), restText);
  for (let i = 0; i < red + 2; i++) { await page.click('#bNext'); seen.add(/Incident (\d+)/.exec(await page.textContent('#say'))[1]); }
  ok(`${w}px stepping: the harmed's paragraphs`, seen.size === red && P.harmed_ids.every(i => seen.has(String(i))), `${seen.size}`);
  if (out) await page.screenshot({ path: path.join(out, `hand-${w}.png`), fullPage: true });
  await page.click('#rSeal'); await page.waitForTimeout(700);
  const sealText = await page.textContent('#say'), acts = new Set(); let fav = 0, corrected = 0, favMaker = 0, claimed = 0, own = 0;
  ok(`${w}px reading: what the seals' reading says`, sealText.includes(`${src.public_acted} acts`) && sealText.includes(`${src.on_user} on the person`) && sealText.includes(`${src.on_maker} about`) && sealText.includes(`Black: ${src.for_party} in that party's favour`) && sealText.includes(`${src.begun} of the ${src.public_acted}`) && sealText.includes(`the ${src.harmed_claims} that answer a claim the harmed brought`), sealText);
  for (let i = 0; i < src.public_acted; i++) { await page.click('#bNext'); const tx = await page.textContent('#say'); acts.add(/Incident (\d+)/.exec(tx)[1]); if (tx.includes('in the maker\'s favour')) favMaker++; if (/in (the maker's favour|favour of the person)/.test(tx)) fav++; if (tx.includes('corrected by this work')) corrected++; if (tx.includes('a claim the harmed brought')) claimed++; if (tx.includes('own first report')) own++; }
  ok(`${w}px stepping: the acts`, acts.size === src.public_acted && D79.acts.every(a => acts.has(String(a[0]))) && fav === src.for_party && favMaker === forMaker && R79.for_the_party.length === fav && corrected === CK.changed.length && claimed === src.harmed_claims && own === src.acted_new, `${acts.size} acts, ${fav} in a party's favour, ${corrected} corrected, ${claimed} claims of the harmed, ${own} from a body's own first report`);
  await page.click('#rAll'); await page.waitForTimeout(700);
  if (out) await page.screenshot({ path: path.join(out, `all-${w}.png`), fullPage: true });
  const side = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(`${w}px no sideways scroll`, side <= 0, `${side}`);
  ok(`${w}px no errors`, errors.length === 0, errors.join(' | '));
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} of ${n} FAILED` : `all ${n} passed`);
process.exit(bad ? 1 : 0);
