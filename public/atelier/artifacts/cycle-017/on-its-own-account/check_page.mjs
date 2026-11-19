// Open the page as a visitor does, read every figure it shows, and compare it with data/digest.json and data/deeds.json.
// Run from this folder: node check_page.mjs [wide-shot.png] [narrow-shot.png]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const D = JSON.parse(fs.readFileSync(path.join(here, 'data/digest.json'), 'utf8')), F = D.figures, V = D.versions;
const K = JSON.parse(fs.readFileSync(path.join(here, 'data/deeds.json'), 'utf8'));
const type = f => f.endsWith('.html') ? 'text/html' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream';
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': type(f) }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch();
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9.]/g, '');
// expected, recounted here from the rows, not from the page's rules
const runV = st => D.runs.filter(r => st.includes(r.status)).flatMap(r => r.versions);
const offAbout = new Set(D.reports.filter(r => !r.agree).map(r => r.about));
const ticks = D.reports.filter(r => r.figure != null);
const expectLit = { over: V.filter(v => v.after && v.over).length, off: offAbout.size, seen: runV(['seen']).length, unseen: runV(['unseen', 'missed']).length, field: D.outside.length };
ok(expectLit.over === F.over_after, `over: ${expectLit.over} = figures.over_after`);
ok(expectLit.seen + expectLit.unseen === F.over_after, `seen + unseen versions = ${F.over_after}`);
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url); await p.waitForSelector('#live[data-done="1"]', { timeout: 30000 });
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll`);
  const fs_ = await p.$$eval('[data-f]', es => es.map(e => [e.getAttribute('data-f'), e.textContent]));
  const bad = fs_.filter(([k, t]) => num(t) !== F[k]);
  ok(fs_.length >= 45 && bad.length === 0, `${w}px ${fs_.length} figures read from the page ${JSON.stringify(bad)}`);
  const d3 = await p.$$eval('[data-d="d3"]', es => es.map(e => [e.textContent, e.getAttribute('data-expect')]));
  ok(d3.length === 1 && num(d3[0][0]) === K.deeds[2].checks[1].result && d3[0][1] === String(K.deeds[2].checks[1].result), `${w}px the gate's commits: ${d3[0][0]}`);
  ok((await p.$$('#strip g.v')).length === V.length, `${w}px ${V.length} versions on the strip`);
  ok((await p.$$('#strip g.v .stem.over')).length === F.over_after + F.over_before, `${w}px ${F.over_after + F.over_before} stems over`);
  ok((await p.$$('#strip g.v .tick')).length === ticks.length, `${w}px ${ticks.length} own counts drawn`);
  ok((await p.$$('#strip g.v .tick.off')).length === ticks.filter(r => !r.agree).length, `${w}px ${ticks.filter(r => !r.agree).length} on the wrong side`);
  ok((await p.$$('#strip .rg')).length === F.runs && (await p.$$('#strip .rg .eye')).length === F.runs_seen, `${w}px ${F.runs} runs, ${F.runs_seen} written down`);
  ok((await p.$$('#strip .eye.field')).length === F.field_over, `${w}px the Field's sighting`);
  ok((await p.textContent('[data-b="name"]')) === D.browser.name, `${w}px the browser the build counted in is named: ${D.browser.name}`);
  // your browser's count: recounted here, independently of the page's script, in the same browser
  const mine = await p.evaluate(() => { const seg = new Intl.Segmenter('en', { granularity: 'word' }), c = {}; for (const [h, t] of Object.entries(window.TEXTS)) { let n = 0; for (const s of seg.segment(t)) if (s.isWordLike) n++; c[h] = n } return c });
  const engine = await p.evaluate(() => navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1]);
  if (D.browser.name === 'Chromium ' + engine) ok(V.every(v => mine[v.h] === v.nb), `${w}px this browser counts as the build's ${D.browser.name} did, version for version`);
  const rings = await p.$$eval('#strip .ring', es => es.map(e => +e.getAttribute('data-n')));
  ok(rings.length === V.length && rings.every((n, i) => n === mine[V[i].h]), `${w}px ${rings.length} rings carry this browser's count`);
  const differ = V.filter(v => mine[v.h] !== v.n), side = V.filter(v => v.after && (mine[v.h] > D.cap) !== v.over);
  const maxd = Math.max(0, ...V.map(v => Math.abs(mine[v.h] - v.n))), overMine = V.filter(v => v.after && mine[v.h] > D.cap).length;
  const live = await p.textContent('#live');
  ok(live.includes(`${V.length - differ.length} agree`) && (!differ.length || live.includes(`${differ.length} differ by up to ${maxd} words, and ${side.length} change side`)) && live.includes(`${overMine} of ${F.versions_after}`), `${w}px live line: ${live}`);
  // each reading lights what the rows say
  for (const [k, want] of Object.entries(expectLit)) {
    await p.click(`.ask button[data-l="${k}"]`);
    const on = await p.$$eval('#strip g.v', es => es.filter(e => !e.classList.contains('dim')).length);
    const say = await p.textContent('#say b');
    ok(on === want, `${w}px reading "${k}" lights ${on}, rows say ${want}; the sentence leads with ${say}`);
    await p.click(`.ask button[data-l="${k}"]`);
  }
  // a version's panel, and its text with the words past the cap marked
  const v = V.find(x => x.h === D.runs.find(r => r.status === 'unseen').versions[0]);
  await p.$eval('#pick', (e, i) => { e.value = i; e.dispatchEvent(new Event('input')) }, v.i);
  const nums = await p.$$eval('#det .nums b', es => es.map(e => e.textContent));
  ok(num(nums[0]) === v.n && num(nums[1]) === v.nb && num(nums[2]) === mine[v.h] && num(nums[3]) === v.ws, `${w}px panel of ${v.h}: ${nums.join(' / ')}`);
  await p.click('#read');
  const marks = await p.$$eval('#text mark', es => es.length);
  ok(marks === Math.max(0, mine[v.h] - D.cap), `${w}px ${marks} words past the cap marked in ${v.h}, by this browser's count`);
  await p.click('#read');
  ok((await p.$$('.card')).length === K.deeds.length && (await p.$$('.card dd.sealed')).length === 2, `${w}px ${K.deeds.length} cards, 2 with a sealed field`);
  const cardText = await p.textContent('#cards');
  const d2 = K.deeds[1].checks;
  ok(cardText.includes(`${d2[0].result.span_minutes} minutes`) && cardText.includes(`${d2[1].result.minutes_after_third_tick} minutes after the third`), `${w}px the ticks' minutes on the card`);
  if (shot) { await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  await p.close();
}
await b.close(); srv.close();
console.log(`${n - fail} of ${n} checks passed`);
process.exit(fail ? 1 : 0);
