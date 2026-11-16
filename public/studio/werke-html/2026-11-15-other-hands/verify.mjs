// OTHER HANDS — open the page as a visitor does and compare what it says and draws with the Field's and the Atelier's files
// and with this work's own second reading of the acts' states (check/state-second-reading.json).
// Usage (repo root): node works/2026-11-15-other-hands/verify.mjs [out-dir-for-stills]
// The siblings' results are fetched from their repositories at the commits data.js names, not from this work's data.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2];
const CK = JSON.parse(fs.readFileSync(path.join(here, 'check', 'state-second-reading.json'), 'utf8'));
const browser = await chromium.launch(); let bad = 0, n = 0;
const ok = (name, cond, detail) => { n++; if (!cond) bad++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
let R77 = null, R75 = null, RA = null, D77 = null;
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
    // this work's check file against the Field's acts: it read the same 60, and its counts follow from its own rows
    const F = Object.fromEntries(D77.acts.map(a => [a[0], a]));
    ok('check file: the Field\'s 60 acts and their states', CK.acts.length === 60 && CK.acts.every(a => F[a.id] && F[a.id][8] === a.field));
    const cnt = {}; CK.acts.forEach(a => { const k = F[a.id][6] + ' ' + a.final; cnt[k] = (cnt[k] || 0) + 1; });
    ok('check file: its counts follow from its rows', ['user concluded', 'user opened', 'maker concluded', 'maker opened'].every(k => cnt[k] === CK.counts.final[k]), JSON.stringify(cnt));
    ok('check file: agreement and changes', CK.acts.filter(a => a.field === a.second).length === CK.agree && CK.disagree.length === 60 - CK.agree && CK.acts.filter(a => a.field !== a.final).map(a => a.id).join() === CK.changed.join() && CK.disagree.every(i => CK.third_reading[i]));
    ok('check file: the Field\'s own state counts', Object.keys(CK.counts.field).every(k => CK.counts.field[k] === R77.B.state[k]));
  }
  // the numbers a visitor reads, read from the page (caption, check box, text)
  const said = await page.evaluate(() => { const o = {}; document.querySelectorAll('[data-n]').forEach(e => { const v = +e.textContent.replace(/,/g, ''); (o[e.dataset.n] = o[e.dataset.n] || new Set()).add(v); }); return Object.fromEntries(Object.entries(o).map(([k, s]) => [k, [...s]])); });
  const B = R77.B, P = R77.press, V = RA.voice, CF = CK.counts.final;
  const forMaker = Object.keys(CK.for_the_maker).filter(k => /^\d+$/.test(k)).length;
  const firstRead = R77.A.agreement.n + P.drawn + V.own + V.body + V.other + V.none - RA.voice_in_field_sample.length;
  const inside = (P.own_words - P.harmed) + V.own + V.body + V.other;
  const src = {
    incidents: R75.incidents, with_report: R75.incidents_with_first_report, press: R75.first_reporter['press and other'],
    not_press: R75.incidents_with_first_report - R75.first_reporter['press and other'],
    first_read: firstRead, read_by_hand: R77.A.agreement.n, field_press: P.drawn, atelier_press: V.own + V.body + V.other + V.none, read_twice: RA.voice_in_field_sample.length,
    harmed: R77.A.final_harmed, press_wrote: P.harmed, wrote_found: R77.A.final_harmed + P.harmed, words_inside: inside,
    field_carried: P.own_words - P.harmed, own_words: V.own, body_words: V.body, through_another: V.other,
    estimate: R77.whole_record.estimate, estimate_lo: R77.whole_record.estimate_ci[0], estimate_hi: R77.whole_record.estimate_ci[1],
    estimate_not_found: R77.whole_record.estimate - R77.A.final_harmed - P.harmed,
    answered: B.n, public_acted: B.public_final, on_user: B.target.user, on_maker: B.target.maker,
    user_concluded: CF['user concluded'], user_opened: CF['user opened'], maker_concluded: CF['maker concluded'], maker_opened: CF['maker opened'],
    concluded: CF['user concluded'] + CF['maker concluded'], field_concluded: B.state['user concluded'] + B.state['maker concluded'],
    state_read_again: CK.n, state_agree: CK.agree, state_differ: CK.disagree.length, state_changed: CK.changed.length, for_maker: forMaker,
    on_public_body: B.target_is_public_body.by_deployer_column.length,
    general_model: Object.values((await (await fetch(`https://raw.githubusercontent.com/frankbueltge/field-research/${M.field_commit}/artifacts/cycle-015/what-harm-is-on-record/check77/adjudication.json`)).json()).frontier.general_model_makers).flat().length,
  };
  for (const k of Object.keys(said)) ok(`${w}px number ${k}`, k in src && said[k].length === 1 && said[k][0] === src[k], `${said[k]} on the page, ${src[k]} in the sources`);
  // what was drawn on the sheet and in the counts
  const d = await page.evaluate(() => window.__oh), s = d.drawn, t = d.tally;
  ok(`${w}px sheet: handwriting and red lines`, s.H === src.wrote_found && s.T === inside, `${s.H} hands, ${s.T} lines`);
  ok(`${w}px sheet: seals by side`, s.left === src.on_user && s.right === src.on_maker, `${s.left} left, ${s.right} right`);
  ok(`${w}px sheet: discs and rings`, s.Sc + (s.Vc || 0) === src.concluded && s.So + (s.Vo || 0) === 60 - src.concluded && (s.Vc || 0) + (s.Vo || 0) === forMaker, `${s.Sc}+${s.Vc} discs, ${s.So}+${s.Vo} rings`);
  ok(`${w}px sheet: witnesses`, s.w === R77.A.final_codes.witness);
  const words = Object.entries(s).filter(([k]) => k.length === 1 && k !== '0').reduce((a, [, v]) => a + v, 0);
  ok(`${w}px sheet: one word per attached report`, words === M.words && words === 6964 && d.words - s['0'] === words, `${words}`);
  ok(`${w}px sheet: paragraphs without a report`, s['0'] === R75.incidents - R75.incidents_with_first_report);
  const firsts = 'prgmsunwTH'.split('').reduce((a, k) => a + (t[k] || 0), 0);
  ok(`${w}px counts: first reports`, firsts === src.with_report && t.H === src.wrote_found && t.T === inside, `${firsts}`);
  ok(`${w}px counts: the estimate`, t.G === src.estimate_not_found && t.H + t.G === src.estimate, `${t.G}`);
  ok(`${w}px counts: seals`, t.Sc + (t.Vc || 0) === src.concluded && t.Sc + t.So + (t.Vc || 0) + (t.Vo || 0) === src.public_acted);
  ok(`${w}px a seal is at least 10 px across`, d.sealR * 2 >= 10, `${d.sealR * 2}`);
  // the numbers written into the sheet's description and the year sentence
  const label = await page.getAttribute('#sheet', 'aria-label');
  ok(`${w}px label: the sheet's description`, label.includes(`${src.wrote_found} paragraphs begin`) && label.includes(`In ${inside} more`) && label.includes(`${src.public_acted} paragraphs have a seal`) && label.includes(`${src.on_user} on the left, ${src.on_maker} on the right, ${forMaker} of those black`) && label.includes(`${60 - src.concluded} of the 60 seals are rings`) && label.includes('1,803 incidents'));
  const yr = await page.evaluate(() => [OH.inc.filter(r => r[1].slice(0, 4) === '2025').length, OH.inc.filter(r => r[1].slice(0, 4) <= '2021').length]);
  const text = await page.evaluate(() => document.body.textContent);
  ok(`${w}px text: 2025 against the years up to 2021`, text.includes(`(${yr[0]})`) && text.includes(`(${yr[1]})`) && yr[0] > yr[1] && yr[0] === R75.years['2025'], yr.join(' / '));
  ok(`${w}px text: reports in the snapshot`, text.includes('6,964 reports attached') && M.words === 6964 && text.includes(`out of ${M.reports_in_snapshot.toLocaleString('en-US')} in the snapshot`));
  // where the sheet stands
  const top = await page.evaluate(() => document.getElementById('sheet').getBoundingClientRect().top);
  ok(`${w}px the sheet begins on the first screen`, top < h * 0.7, `${Math.round(top)} px down; ${d.height} px tall (${(d.height / h).toFixed(1)} screens)`);
  // the readings and the stepping
  await page.click('#rHand'); await page.waitForTimeout(700);
  const red = src.wrote_found + inside, seen = new Set();
  const restText = await page.textContent('#say');
  ok(`${w}px reading: what the harmed's reading says`, restText.includes(`Of ${firstRead} first reports`) && restText.includes(`wrote ${src.wrote_found}`) && restText.includes(`in ${inside} more`) && restText.includes(`other ${(src.with_report - firstRead).toLocaleString('en-US')} were`), restText);
  for (let i = 0; i < red + 2; i++) { await page.click('#bNext'); seen.add(/Incident (\d+)/.exec(await page.textContent('#say'))[1]); }
  ok(`${w}px stepping: the harmed's paragraphs`, seen.size === red && P.harmed_ids.every(i => seen.has(String(i))), `${seen.size}`);
  if (out) await page.screenshot({ path: path.join(out, `hand-${w}.png`), fullPage: true });
  await page.click('#rSeal'); await page.waitForTimeout(700);
  const sealText = await page.textContent('#say'), acts = new Set(); let fav = 0, corrected = 0;
  ok(`${w}px reading: what the seals' reading says`, sealText.includes(`${src.public_acted} acts`) && sealText.includes(`${src.on_user} on the person`) && sealText.includes(`${src.on_maker} about`) && sealText.includes(`${forMaker} of them in the maker's favour`) && sealText.includes(`${60 - src.concluded} of the ${src.public_acted}`), sealText);
  for (let i = 0; i < src.public_acted; i++) { await page.click('#bNext'); const tx = await page.textContent('#say'); acts.add(/Incident (\d+)/.exec(tx)[1]); if (tx.includes('in the maker\'s favour')) fav++; if (tx.includes('corrected by this work')) corrected++; }
  ok(`${w}px stepping: the acts`, acts.size === src.public_acted && B.admitted.every(i => acts.has(String(i))) && fav === forMaker && corrected === CK.changed.length, `${acts.size} acts, ${fav} for the maker, ${corrected} corrected`);
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
