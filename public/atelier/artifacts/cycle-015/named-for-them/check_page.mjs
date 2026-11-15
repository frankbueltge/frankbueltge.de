// Open the page as a visitor does, read the numbers it shows, compare them with named.json, voice.json, check.json.
// Run from this folder: node check_page.mjs [shot-path]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const J = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')).res;
const res = J('named.json'), vr = J('voice.json'), cr = J('check.json');
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch();
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9.]/g, '');
const lane = res.lane_n, claim = lane['claimant'], named = res.incidents - res.named_none;
const self = Object.values(res.first_by_lane).reduce((a, x) => a + (x['self-published'] || 0), 0);
const resp = Object.values(res.response_by_lane).reduce((a, x) => a + x, 0);
const at = (o, p) => p.split('.').reduce((v, k) => v[k], o);
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url); await p.waitForTimeout(400);
  const litN = async () => (await p.$$('#field rect.on')).length;
  const press = async l => { await p.click(`button[data-l="${l}"]`) };
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll`);
  // every figure of the check, by its key
  const spans = await p.$$eval('[data-c]', es => es.map(e => [e.getAttribute('data-c'), e.textContent]));
  let bad = spans.filter(([k, t]) => num(t) !== at(cr, k));
  ok(spans.length >= 30 && bad.length === 0, `${w}px ${spans.length} figures of the check read from the page ${JSON.stringify(bad)}`);
  ok(num(await p.textContent('#s-named')) === named, `${w}px named ${named}`);
  ok(num(await p.textContent('#s-claim')) === claim, `${w}px could claim ${claim}`);
  ok(num(await p.textContent('#s-self')) === self, `${w}px self-published first ${self}`);
  ok(num(await p.textContent('#s-resp')) === resp, `${w}px response ${resp}`);
  ok(num(await p.textContent('#s-wrote')) === cr.writer_harmed, `${w}px the harmed wrote ${cr.writer_harmed}`);
  ok(num(await p.textContent('#s-pub')) === cr.acted && num(await p.textContent('#s-user')) === cr.acted_on_user, `${w}px public acts ${cr.acted}, on the user ${cr.acted_on_user}`);
  ok(num(await p.textContent('#c-twice')) === vr.twice, `${w}px check box, named twice ${vr.twice}`);
  ok((await p.$$('#field rect')).length === res.incidents, `${w}px ${res.incidents} squares`);
  // squares are large enough to press on a narrow screen
  const side = await p.$eval('#field rect', e => e.getBoundingClientRect().width);
  ok(w > 600 || side >= 8, `${w}px a square is ${side.toFixed(1)} px wide`);
  // row one, alone
  ok(await litN() === res.incidents_with_kind.value, `${w}px lit for a good = ${res.incidents_with_kind.value}`);
  ok((await p.textContent('#count')).startsWith(res.incidents_with_kind.value.toLocaleString('en-US') + ' of'), `${w}px count line`);
  await press('noclaim');
  ok(await litN() === cr.no_claimant + cr.none_named, `${w}px no claimant lit ${cr.no_claimant} + ${cr.none_named}`);
  ok((await p.textContent('#say')).includes(`${cr.no_claimant} name only`) && (await p.textContent('#say')).includes(`${cr.none_named} names nobody`), `${w}px no claimant says what it lights`);
  await press('k:1');
  ok(await litN() === res.incidents_with_kind.users, `${w}px users lit`);
  await press('k:1');                                   // let go: row one empty
  ok(await litN() === 0, `${w}px nothing chosen, nothing lit`);
  // row two, alone
  const stepN = cr.step2_matched.length;
  for (const [l, k] of [['w:harmed', cr.writer_harmed], ['w:witness', vr.writer.witness], ['ph', cr.press_harmed], ['t:user', cr.acted_on_user],
    ['t:maker', cr.acted_on_maker], ['pubdep', cr.public_deployer.length], ['twice', vr.twice], ['resp', resp], ['act', stepN]]) {
    await press(l);
    ok(await litN() === k, `${w}px ${l} lit ${k}`);
  }
  // two questions crossed
  await press('t:user'); await press('k:3');
  const cross = await litN();
  ok(cross > 0 && cross < cr.acted_on_user && (await p.textContent('#count')).endsWith('meet both'), `${w}px a good and an act on a user cross: ${cross}`);
  await press('k:3'); await press('twice'); await press('k:0');
  await press('k:0');
  ok(await litN() === vr.twice, `${w}px row one released, named twice alone ${vr.twice}`);
  // stepping and opening by number
  await press('twice'); await press('t:user');
  await p.click('#next');
  ok((await p.textContent('#det h4')).startsWith('Incident ') && (await p.textContent('#det')).includes('a public body acted'), `${w}px stepping opens a lit incident with its act`);
  await p.fill('#goto', '1497'); await p.click('#go');
  ok((await p.textContent('#det h4')).startsWith('Incident 1497') && (await p.textContent('#det')).includes('also named as deployer'), `${w}px opening by number`);
  await p.$eval('#field rect[data-i="1500"]', e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  ok((await p.textContent('#det h4')).startsWith('Incident '), `${w}px a square opens its entry`);
  await press('t:user'); await press('k:3');
  // the drift, split
  const B = cr.blocks;
  ok((await p.textContent('#d-first')) === `${B['1'].value} of ${B['1'].n}`, `${w}px first block ${B['1'].value}`);
  ok((await p.textContent('#d-last')) === `${B['1601'].value} of ${B['1601'].n}`, `${w}px last full block ${B['1601'].value}`);
  ok(num(await p.textContent('#d-ei0')) === B['1'].ei && num(await p.textContent('#d-ei1')) === B['1601'].ei, `${w}px epistemic integrity ${B['1'].ei} to ${B['1601'].ei}`);
  for (const [c, k] of [['ei', 'ei'], ['pr', 'privacy'], ['og', 'othergood']]) {
    const sum = (await p.$$eval(`#drift rect.${c}`, es => es.map(e => +e.getAttribute('data-n')))).reduce((a, x) => a + x, 0);
    ok(sum === Object.values(B).reduce((a, x) => a + x[k], 0), `${w}px drift bars ${k} sum ${sum}`);
  }
  const fs11 = await p.$eval('#drift text', e => e.getBoundingClientRect().height);
  ok(fs11 >= 9, `${w}px drift labels ${fs11.toFixed(1)} px high`);
  ok((await p.$$('#goods tbody tr')).length === res.top.value.length, `${w}px goods table`);
  const HB = cr.hand_blocks;
  ok((await p.$$('#hand-b tbody tr')).length === Object.keys(HB).length, `${w}px whose-hand table`);
  ok((await p.textContent('#hd-a')) === `${HB['601'].top_good} of ${HB['601'].top}` && (await p.textContent('#hd-b')) === `${HB['1401'].top_good} of ${HB['1401'].top}`, `${w}px the one account's entries`);
  // the thirty
  ok((await p.$$('#vgrid button')).length === 30, `${w}px 30 first reports`);
  for (const c of ['own', 'body', 'other', 'none']) ok((await p.$$(`#vgrid button.${c}`)).length === cr.voice[c], `${w}px voice ${c} ${cr.voice[c]}`);
  const say = await p.textContent('#v-say');
  ok(say.includes(`In ${cr.voice.own} of the thirty`) && say.includes(`In ${cr.voice.body} a body`) && say.includes(`In ${cr.voice.other} the harmed`) && say.includes(`In ${cr.voice.none} they`), `${w}px voice sentence`);
  ok(num(await p.textContent('#v-lo')) === cr.voice_own_ci_pct[0] && num(await p.textContent('#v-hi')) === cr.voice_own_ci_pct[1], `${w}px voice interval`);
  ok(num(await p.textContent('#v-moved')) === cr.voice_moved.length, `${w}px ${cr.voice_moved.length} codes moved`);
  await p.click('#vgrid button.body');
  ok((await p.textContent('#vdet')).includes('The first reading had this as own words'), `${w}px a moved report says how it was first read`);
  // named twice, on the checked acts
  ok(num(await p.textContent('#t-n')) === vr.twice && num(await p.textContent('#t-dep')) === vr.twice_deployer && num(await p.textContent('#t-dev')) === vr.twice_developer, `${w}px named twice ${vr.twice}`);
  ok(num(await p.textContent('#t-acted')) === cr.acted && num(await p.textContent('#t-user')) === cr.acted_on_user, `${w}px acts ${cr.acted}, ${cr.acted_on_user}`);
  ok(num(await p.textContent('#t-both')) === cr.acted_user_twice.length && (await p.$$('#t-list li')).length === cr.acted_user_twice.length, `${w}px acted on and named twice ${cr.acted_user_twice.length}`);
  // the rule by hand
  ok(num(await p.textContent('#h-ok')) === vr.names_as_ruled && num(await p.textContent('#h-body')) === vr.names_persons_body && num(await p.textContent('#h-pers')) === vr.names_ruled_persons, `${w}px rule by hand ${vr.names_as_ruled} of ${vr.names_n}`);
  ok((await p.$$('#hand-t tbody tr')).length === vr.names_n - vr.names_as_ruled, `${w}px misfit table`);
  if (shot) { await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  await p.close();
}
await b.close(); srv.close();
console.log(fail ? `${fail} of ${n} FAILED` : `all ${n} passed`); process.exit(fail ? 1 : 0);
