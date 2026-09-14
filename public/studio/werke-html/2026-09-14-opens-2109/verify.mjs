// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of OPENS 01/01/2109.
//   node verify.mjs [path-to-index.html]
//
// Five questions.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: the headline
//     numbers, every line of the board drawn, the milestone table, every department named
//     with its counts?
//   THE DRAWING — the board claims one scale for every line on it. The scale is taken from
//     the board's own last line and every other line is then measured against it, out of
//     the SVG itself, along with the count each line prints beside it.
//   THE ARITHMETIC — do the numbers on the page agree with counts.json, which the page
//     never sees, and does the published closure rule hold on the entries the page quotes?
//   WITH SCRIPT — does standing in a year grey exactly the lines that have passed and
//     report the right number still shut, and does running to the end leave the residue?
//   AND — does the page reach the network? It must not, once, in either state.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || join(here, 'index.html');
const D = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(here, 'counts.json'), 'utf8'));
const html = readFileSync(file, 'utf8');

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');


const [LO, HI] = D.span;
const YEARS = HI - LO + 1;

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const offsite = [];
const watch = ctx => ctx.on('request', r => { if (!r.url().startsWith('file:')) offsite.push(r.url()); });

// ---- 0. the island ----------------------------------------------------------------------
console.log('\nTHE ISLAND — the page carries the file beside it, byte for byte');
{
  const m = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  ok(!!m, 'the data island is in the document');
  ok(m && m[1] === readFileSync(join(here, 'data.json'), 'utf8'),
     'the island is byte-identical to data.json');
  ok(!/<script[^>]+src=/.test(html) && !/<link[^>]+href=/.test(html),
     'no external script and no external stylesheet is referenced');
  ok(!/https?:\/\/[^"'\s]+\.(?:js|css|png|jpg|woff2?)/.test(html),
     'no off-site asset URL appears anywhere in the document');
}

// ---- 1. the floor, with JavaScript disabled ---------------------------------------------
console.log('\nWITHOUT SCRIPT — what a reader gets from the served document alone');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1600 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const text = await page.locator('body').innerText();

  ok(text.includes(sp(D.read.closed)), `the headline ${sp(D.read.closed)} closed records is in the served text`);
  ok(text.includes(sp(D.residue)), `the residue ${sp(D.residue)} is in the served text`);
  ok(text.includes(sp(D.withheld.wholly_closed)), `the ${sp(D.withheld.wholly_closed)} unnameable entries are in the served text`);
  ok(text.includes(String(HI)), `the last opening year ${HI} is in the served text`);
  ok(text.includes(D.law.pct + '%'), `the rule's share ${D.law.pct}% is printed`);

  const strayN = Object.keys(D.stray).length;
  ok((await page.locator('svg.board .row[data-year]').count()) === YEARS + strayN,
     `all ${YEARS} years of the board are drawn, plus the ${strayN} outside the span`);
  ok((await page.locator('svg.board rect.res').count()) === 1,
     'the line with no year is drawn');
  ok(!(await page.locator('.control').isVisible()),
     'the year control is not shown to a reader who cannot use it');

  // the milestone table must carry every milestone, and its numbers must be the data's
  for (const y of D.milestones) {
    if (D.remaining[String(y)] === undefined) continue;
    const row = page.locator('tbody tr', { hasText: `1 January ${y}` }).first();
    const t = await row.innerText();
    ok(t.includes(sp(D.remaining[String(y)])),
       `standing in ${y}: the table says ${sp(D.remaining[String(y)])} still shut`);
  }
  // Every department, named, with its counts. Matched on the code cell, not on the name:
  // four of the eight names begin "Records created or inherited by", so a text match on
  // the name picks the wrong row — the verifier's own defect, found on its first run.
  const deptRows = await page.locator('table tbody tr').evaluateAll(
    els => els.map(tr => Array.from(tr.children).map(td => td.textContent.trim())));
  for (const d of D.read.departments) {
    const row = deptRows.find(r => r[0] === d.code && r.length === 6);
    ok(!!row, `${d.code} has a row of its own in the department table`);
    ok(row && row[1] === d.name, `${d.code} is given the catalogue's own name for it`);
    ok(row && row[2] === sp(d.closed) && row[3] === sp(d.dated) && row[4] === sp(d.undated),
       `${d.code}: ${sp(d.closed)} closed, ${sp(d.dated)} dated, ${sp(d.undated)} without a date`);
  }
  await ctx.close();
}

// ---- 2. the drawing measures what it says -----------------------------------------------
console.log('\nTHE DRAWING — one scale for every line, measured back out of the SVG');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1600 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);

  const rows = await page.locator('svg.board .row[data-year]').evaluateAll(
    els => els.map(e => ({
      year: +e.dataset.year, n: +e.dataset.n,
      w: +e.querySelector('rect').getAttribute('width'),
      y: +e.querySelector('rect').getAttribute('y'),
      count: e.querySelector('text.cnt').textContent,
    })));
  const res = await page.locator('svg.board rect.res').evaluate(
    e => ({ w: +e.getAttribute('width'), n: +e.dataset.n, y: +e.getAttribute('y') }));

  // One scale for the whole board, and the board's own longest line sets it. Every line is
  // measured against that scale rather than against a number the page prints beside it.
  const scale = res.w / res.n;
  const off = rows.filter(r => Math.abs(r.w - Math.max(r.n * scale, 0.35)) > 0.002);
  ok(off.length === 0, `every line is exactly as long as its count, at one scale (${off.length} off)`);
  ok(res.n === D.residue && Math.abs(res.w - 800) < 1e-9,
     `the line with no year is ${sp(res.n)} records long and sets the scale of the board`);
  ok(res.w > Math.max(...rows.map(r => r.w)),
     `it is the longest line on the board — ${(res.n / D.tallest.n).toFixed(2)}× the busiest year`);
  ok(res.y > Math.max(...rows.map(r => r.y)), 'and it is the last line on the board');

  const total = rows.reduce((s, r) => s + r.n, 0);
  ok(total === D.read.dated,
     `the board's lines hold ${sp(total)} records, which is every dated record`);
  const inSpan = rows.filter(r => r.year >= LO);
  ok(inSpan[0].year === LO && inSpan[inSpan.length - 1].year === HI && inSpan.length === YEARS,
     `the board runs ${LO} to ${HI} with no year skipped`);
  ok(rows.every((r, i) => i === 0 || rows[i - 1].year < r.year), 'the years are in order');
  ok(rows.filter(r => r.n === 0).length === D.years_empty.length,
     `${D.years_empty.length} years are drawn with nothing in them, exactly the ones the data names`);
  ok(rows.every(r => r.count === (r.n ? sp(r.n) : '—')),
     'every line prints its own count, so the years with twelve records are readable too');
  ok(Math.max(...rows.map(r => r.n)) === D.tallest.n,
     `the busiest line is ${sp(D.tallest.n)}, the count of ${D.tallest.year}`);

  const bars = await page.locator('svg.hist .ln').evaluateAll(
    els => els.map(e => ({ len: +e.dataset.len, n: +e.dataset.n })));
  ok(bars.reduce((s, b) => s + b.n, 0) === D.length_stats.n,
     `the length histogram holds all ${sp(D.length_stats.n)} closures`);
  ok(Math.min(...bars.map(b => b.len)) === D.length_stats.min &&
     Math.max(...bars.map(b => b.len)) === D.length_stats.max,
     `it runs from ${D.length_stats.min} to ${D.length_stats.max} years`);
  await ctx.close();
}

// ---- 3. the arithmetic, against the file the page never sees ----------------------------
console.log('\nTHE ARITHMETIC — the page against counts.json, and the rule against the entries');
{
  const depts = Object.values(C.departments);
  ok(depts.reduce((s, d) => s + d.n, 0) === D.read.closed,
     'the closed total is the sum of the eight departments in counts.json');
  ok(depts.every(d => d.n === d.reported),
     'every department was pulled complete — pulled equals the count the interface reported');
  ok(D.residue === C.retained.undated + D.read.undated,
     'the residue is the undated retained plus the undated closed, and nothing else');
  const tt = Object.values(D.timetable).reduce((a, b) => a + b, 0);
  ok(tt + Object.values(D.stray).reduce((a, b) => a + b, 0) === D.read.dated,
     'the timetable plus the stray year accounts for every dated record');

  // The published rule, checked on every entry the page prints. An entry that opens on
  // 1 January is the year rule; one that opens on any other day is the day-exact rule the
  // page names as the stricter case, and the year is then one lower. Both are the rule.
  const quoted = [...D.longest, ...D.latest, ...D.withheld.examples];
  const bad = [];
  let testable = 0;
  for (const q of quoted) {
    const oy = +(q.opens || '').slice(-4);
    const ey = (q.covering || '').match(/(\d{4})(?!.*\d{4})/);
    const code = +q.code;
    if (!oy || !ey || !code) continue;
    testable++;
    const newYear = (q.opens || '').slice(0, 5) === '01/01';
    if (oy !== +ey[1] + code + (newYear ? 1 : 0)) bad.push(`${q.reference} (${q.opens}, code ${code}, ends ${ey[1]})`);
  }
  ok(testable > 0 && bad.length === 0,
     `the closure rule holds on all ${testable} quoted entries that can be tested`
     + (bad.length ? ` — ${bad.join('; ')}` : ''));
  ok(D.law.hold + D.law.break === depts.reduce((s, d) => s + d.law_hold + d.law_break, 0),
     'the rule is counted over every entry with both a date and a code');
  ok(D.remaining[String(HI + 1)] === 0,
     `nothing dated is left shut on 1 January ${HI + 1}`);
}

// ---- 4. the hand ------------------------------------------------------------------------
console.log('\nWITH SCRIPT — standing in a year');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  ok(await page.locator('.control').isVisible(), 'the year control appears for a reader who can use it');

  const set = async y => {
    await page.locator('#now').evaluate((el, v) => {
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, y);
    await page.waitForTimeout(30);
  };

  for (const y of [2040, 2075, HI + 1]) {
    await set(y);
    const past = await page.locator('svg.board .row.past').count();
    const want = [...Object.keys(D.timetable), ...Object.keys(D.stray)]
      .filter(k => +k < y).length;
    ok(past === want, `standing in ${y}: ${past} lines are drawn as opened, and ${want} have passed`);
    const left = [...Object.entries(D.timetable), ...Object.entries(D.stray)]
      .filter(([k]) => +k >= y).reduce((s, [, v]) => s + v, 0);
    const said = await page.locator('#readout').innerText();
    ok(said.includes(sp(left)), `and it reports ${sp(left)} still shut`);
    ok(said.includes(sp(D.residue)), `and reports the ${sp(D.residue)} with no date, unchanged`);
  }
  await set(HI + 1);
  const end = await page.locator('#readout').innerText();
  ok(/^0\s/.test(end.trim()) && end.includes(sp(D.residue)),
     `at the end of the board nothing dated is left and the ${sp(D.residue)} remain`);
  const resW = await page.locator('svg.board rect.res').getAttribute('width');
  ok(+resW === 800 && !(await page.locator('svg.board rect.res').evaluate(
       e => e.closest('g')?.classList.contains('past') || false)),
     'the line with no year is untouched by the control — it has no year to pass');

  // pointing at a line
  const target = D.tallest.year;
  const box = await page.locator(`svg.board .row[data-year="${target}"] rect`).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(60);
  ok(await page.locator(`svg.board .row[data-year="${target}"].hot`).count() === 1,
     `pointing at ${target} marks that line and no other`);
  ok(await page.locator('svg.board .row.hot').count() === 1,
     'exactly one line is marked at a time');
  await ctx.close();
}

// ---- 5. the network ---------------------------------------------------------------------
console.log('\nTHE NETWORK');
ok(offsite.length === 0, `no request left the file, in either state (${offsite.length})`);

await browser.close();
console.log(`\n${fails.length ? 'FAILED ' + fails.length : 'all checks passed'}`);
process.exit(fails.length ? 1 : 0);
