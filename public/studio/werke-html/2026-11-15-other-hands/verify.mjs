// OTHER HANDS — open the page as a visitor does and compare what it says and draws with the Field's and the Atelier's files.
// Usage (repo root): node works/2026-11-15-other-hands/verify.mjs [out-dir-for-stills]
// The siblings' results are fetched from their repositories at the commits data.js names, not from this work's data.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2];
const browser = await chromium.launch(); let bad = 0;
const ok = (name, cond, detail) => { if (!cond) bad++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')); };
let R77 = null, R75 = null, RA = null, ADJ = null;
for (const [w, h] of [[1132, 900], [390, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(here, 'index.html')); await page.waitForTimeout(400);
  const M = await page.evaluate(() => OH.meta);
  if (!R77) {
    const base = `https://raw.githubusercontent.com/frankbueltge/field-research/${M.field_commit}/artifacts/cycle-015/what-harm-is-on-record/`;
    R77 = await (await fetch(base + 'results77.json')).json(); R75 = await (await fetch(base + 'results75.json')).json();
    ADJ = await (await fetch(base + 'check77/adjudication.json')).json();
    RA = (await (await fetch(`https://raw.githubusercontent.com/frankbueltge/ulysses/${M.atelier_commit}/artifacts/cycle-015/named-for-them/check.json`)).json()).res;
  }
  // the numbers a visitor reads under the sheet, read from the page
  const said = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-n]')].map(e => [e.dataset.n, +e.textContent.replace(/,/g, '')])));
  const B = R77.B, P = R77.press, V = RA.voice;
  const field = {
    with_report: R75.incidents_with_first_report, press: R75.first_reporter['press and other'], public: R75.first_reporter['public body'],
    research: R75.first_reporter.research, maker: R75.first_reporter.maker, self: R75.first_reporter['self-published'],
    read_by_hand: R77.A.agreement.n, harmed: R77.A.final_harmed,
    field_press: P.drawn, press_wrote: P.harmed, field_carried: P.own_words - P.harmed,
    atelier_press: V.own + V.body + V.other + V.none, own_words: V.own, body_words: V.body, through_another: V.other, atelier_none: V.none,
    first_read: R77.A.agreement.n + P.drawn + V.own + V.body + V.other + V.none - M.read_twice,
    estimate: R77.whole_record.estimate, estimate_lo: R77.whole_record.estimate_ci[0], estimate_hi: R77.whole_record.estimate_ci[1],
    wrote_found: R77.A.final_harmed + P.harmed, estimate_not_found: R77.whole_record.estimate - R77.A.final_harmed - P.harmed,
    answered: B.n, maker_answered: B.counts.M.first, other_answered: B.counts.O.first, public_acted: B.public_final,
    on_user: B.target.user, on_maker: B.target.maker,
    user_concluded: B.state['user concluded'], user_opened: B.state['user opened'],
    maker_concluded: B.state['maker concluded'], maker_opened: B.state['maker opened'],
    on_public_body: B.target_is_public_body.by_deployer_column.length,
  };
  const witness = R77.A.final_codes.witness;
  for (const k of Object.keys(field)) ok(`${w}px caption ${k}`, said[k] === field[k], `${said[k]} on the page, ${field[k]} in the siblings' files`);
  ok(`${w}px every caption number has a source`, Object.keys(said).every(k => k in field));
  ok(`${w}px one report was read by both`, Array.isArray(RA.voice_in_field_sample) && M.read_twice === RA.voice_in_field_sample.length, `${M.read_twice} / ${JSON.stringify(RA.voice_in_field_sample)}`);
  // what was drawn on the sheet and in the counts
  const d = await page.evaluate(() => window.__oh), s = d.drawn, t = d.tally;
  const carried = field.field_carried + V.body + V.other, none = P.drawn - P.own_words + V.none - M.read_twice;
  ok(`${w}px sheet: handwritten paragraphs`, s.H === field.harmed && s.W === field.press_wrote, `${s.H} + ${s.W}`);
  ok(`${w}px sheet: the harmed's words in the type`, s.q === V.own && s.c === carried && s.e === none, `${s.q} own, ${s.c} carried, ${s.e} read and none`);
  ok(`${w}px sheet: seals`, s.U === field.on_user && s.K === field.on_maker, `${s.U} discs, ${s.K} rings`);
  ok(`${w}px sheet: whole and half seals`, s.Uc === field.user_concluded && s.Uo === field.user_opened && s.Kc === field.maker_concluded && s.Ko === field.maker_opened, `${s.Uc}/${s.Uo} ${s.Kc}/${s.Ko}`);
  const gm = ADJ.frontier.general_model_makers;
  ok(`${w}px sheet: marked seals`, s.fb === field.on_public_body && s.fg === gm.concluded.length + gm.opened.length + gm.inquiry_into_the_incident.length + gm.for_the_maker.length, `${s.fb} on a public body, ${s.fg} on a maker of a general model`);
  ok(`${w}px sheet: answers`, s.A === field.maker_answered && s.O === field.other_answered);
  ok(`${w}px sheet: witnesses`, s.w === witness);
  const words = Object.entries(s).filter(([k]) => k.length === 1 && !'AOUK0'.includes(k)).reduce((a, [, v]) => a + v, 0);
  ok(`${w}px sheet: one word per attached report`, words === M.words && words === 6964, `${words}`);
  ok(`${w}px sheet: paragraphs without a report`, s['0'] === R75.incidents - R75.incidents_with_first_report);
  const firsts = 'prmgecqWnxywH'.split('').reduce((a, k) => a + (t[k] || 0), 0);
  ok(`${w}px counts: first reports`, firsts === field.with_report && t.H === field.harmed && t.W === field.press_wrote && t.q === V.own && t.c === carried && t.e === none, `${firsts}`);
  ok(`${w}px counts: the estimate`, t.G === field.estimate_not_found && t.H + t.W + t.G === field.estimate, `${t.G}`);
  ok(`${w}px counts: answers`, t.A === field.maker_answered && t.O === field.other_answered && t.Uc === field.user_concluded && t.Uo === field.user_opened && t.Kc === field.maker_concluded && t.Ko === field.maker_opened && t.fb === field.on_public_body);
  // the numbers written into the page's sentences
  const prose = await page.evaluate(() => document.querySelector('.progress').textContent + document.querySelector('.lede').textContent + [...document.querySelectorAll('section p')].map(p => p.textContent).join(' ') + document.getElementById('sheet').getAttribute('aria-label'));
  ok(`${w}px text: 60, not 50`, prose.includes(`in ${B.public_final} incidents, not ${B.public_first}`) && prose.includes(`ten of the ${B.public_final}`) && B.missed_by_reading_the_opening === 10);
  ok(`${w}px text: the limits`, prose.includes(`Only ${field.first_read} of 1,801`) && prose.includes(`the Field's ${field.field_carried} quote`) && prose.includes(`the Atelier's ${V.own} are`) && prose.includes(`The ${field.harmed} written on platforms`) && prose.includes(`the ${field.estimate} is an estimate from ${P.drawn} reports`) && prose.includes(`The ${B.public_final} acts are a floor`));
  ok(`${w}px text: general-model makers`, prose.includes('five acts') && gm.concluded.length === 1 && gm.opened.length === 2 && gm.inquiry_into_the_incident.length === 1 && gm.for_the_maker.length === 1);
  ok(`${w}px label: the sheet's description`, prose.includes('Twenty-one paragraphs') && field.harmed === 21 && prose.includes('four more') && field.press_wrote === 4 && prose.includes('sixty-eight paragraphs') && V.own + carried === 68 && prose.includes('Sixty paragraphs') && prose.includes('twenty-six of them only half') && field.user_opened + field.maker_opened === 26);
  // the year sentence in the text
  const yr = await page.evaluate(() => [OH.inc.filter(r => r[1].slice(0, 4) === '2025').length, OH.inc.filter(r => r[1].slice(0, 4) <= '2021').length]);
  const text = await page.evaluate(() => document.body.textContent);
  ok(`${w}px text: 2025 against the years up to 2021`, text.includes(`(${yr[0]})`) && text.includes(`(${yr[1]})`) && yr[0] > yr[1] && yr[0] === R75.years['2025'], yr.join(' / '));
  // the readings and the stepping
  await page.click('#rHand'); await page.waitForTimeout(700);
  const seen = new Set();
  const red = field.harmed + field.press_wrote + V.own + carried;
  const restText = await page.textContent('#say');
  ok(`${w}px reading: what the harmed's reading says`, restText.includes(`${field.first_read} first reports`) && restText.includes(`wrote ${field.wrote_found}`) && restText.includes(`in ${V.own} more`) && restText.includes(`carried in ${carried}`) && restText.includes(`other ${(field.with_report - field.first_read).toLocaleString('en-US')} were`), restText);
  for (let i = 0; i < red + 2; i++) { await page.click('#bNext'); seen.add(/Incident (\d+)/.exec(await page.textContent('#say'))[1]); }
  ok(`${w}px stepping: the harmed's paragraphs`, seen.size === red && P.harmed_ids.every(i => seen.has(String(i))) && RA.press_harmed_ids.every(i => seen.has(String(i))), `${seen.size}`);
  if (out) await page.screenshot({ path: path.join(out, `hand-${w}.png`), fullPage: true });
  await page.click('#rSeal'); await page.waitForTimeout(700);
  const acts = new Set();
  const sealText = await page.textContent('#say');
  ok(`${w}px reading: what the seals' reading says`, sealText.includes(`${field.public_acted} acts`) && sealText.includes(`${field.on_user} discs`) && sealText.includes(`${field.on_maker} rings`) && sealText.includes(`${field.user_opened} of the discs, ${field.maker_opened} of the rings`), sealText);
  for (let i = 0; i < field.public_acted + 2; i++) { await page.click('#bNext'); acts.add(/Incident (\d+)/.exec(await page.textContent('#say'))[1]); }
  ok(`${w}px stepping: the acts`, acts.size === field.public_acted && B.admitted.every(i => acts.has(String(i))) && B.target_is_public_body.by_deployer_column.every(i => acts.has(String(i))), `${acts.size}`);
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
