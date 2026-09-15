// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of CONTENT WAS.
//   node verify.mjs [path-to-index.html]
//
// Six questions.
//   THE ISLAND — is the page one file, carrying its own data, reaching for nothing?
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: every headline
//     number, the wall drawn in full, all forty-four rows of the third figure, the
//     criteria, and a page that says what the controls would have done?
//   THE DRAWING — the wall claims one character to the unit. The claim is measured out of
//     the SVG itself: the inked area of each of the three paths is counted, run by run, and
//     compared with the character counts in counts.json, which the page never sees.
//   THE ARITHMETIC — do the numbers printed on the page agree with counts.json, and do the
//     numbers in counts.json agree with each other?
//   WITH SCRIPT — does pointing at a block report that block, and does lighting a year
//     light exactly that year's characters and no others?
//   THE WITHHOLDING — the work says it kept no text of any deleted page. Is that true of
//     every file it ships?
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

const CPR = D.chars_per_row, PITCH = D.pitch, GAP = D.gap;
const STATES = ['whole', 'cut-text', 'cut-log'];

// The verifier lays the wall out again from counts.json, independently of build.py.
const starts = [];
{ let p = 0; for (const [len] of C.wall) { starts.push(p); p += len + GAP; } }
const totalSlots = starts.length ? starts[starts.length - 1] + C.wall[C.wall.length - 1][0] + GAP : 0;
const expectedRows = Math.ceil(totalSlots / CPR);
const charsBy = [0, 0, 0];
for (const [len, st] of C.wall) charsBy[st] += len;

// run lengths out of a path: every subpath is  M x y h run v1 h-run z
const runs = d => [...d.matchAll(/M[\d.]+ [\d.]+h(\d+)v1h-\d+z/g)].map(m => +m[1]);

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const offsite = [];
const watch = ctx => ctx.on('request', r => { if (!r.url().startsWith('file:')) offsite.push(r.url()); });

// ---- 0. the island ----------------------------------------------------------------------
console.log('\nTHE ISLAND — one file, carrying its own data, reaching for nothing');
{
  const m = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  ok(!!m, 'the data island is in the document');
  ok(m && m[1] === readFileSync(join(here, 'data.json'), 'utf8'),
     'the island is byte-identical to data.json');
  ok(!/<script[^>]+src=/.test(html), 'no external script is referenced');
  ok(!/<link[^>]/.test(html), 'no stylesheet or other link element is referenced');
  ok(!/(?:src|href)\s*=\s*["']https?:/i.test(html), 'no src or href points off the filesystem');
  ok(!/@import|url\(\s*["']?https?:/i.test(html), 'no stylesheet pulls anything in');
  ok(D.wall.length === C.wall.length, 'the island carries every block the measurement has');
}

// ---- 1. the floor, with JavaScript disabled ---------------------------------------------
console.log('\nWITHOUT SCRIPT — what a reader gets from the served document alone');
let noscript;
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1800 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  noscript = await page.evaluate(() => {
    const paths = {};
    document.querySelectorAll('#wall path').forEach(p => {
      paths[p.getAttribute('class') || p.id] = p.getAttribute('d') || '';
    });
    const vb = document.getElementById('wall').getAttribute('viewBox').split(' ').map(Number);
    return {
      text: document.body.innerText,
      h1: document.querySelector('h1').innerText.replace(/\s+/g, ' ').trim(),
      h2: [...document.querySelectorAll('h2')].map(h => h.innerText.trim()),
      paths, vb,
      tailCounts: [...document.querySelectorAll('.cnt')].map(t => +t.textContent),
      tailMarks: (() => {
        const rows = {};
        document.querySelectorAll('figure svg .mark').forEach(r => {
          const y = r.getAttribute('y'); rows[y] = (rows[y] || 0) + 1;
        });
        return rows;
      })(),
      tailTitles: [...document.querySelectorAll('.tl')].map(t => t.textContent),
      withheld: document.querySelectorAll('.withheld').length,
      seals: document.querySelectorAll('.seal').length,
      bars: document.querySelectorAll('.bar').length + document.querySelectorAll('.cliff').length,
      codes: [...document.querySelectorAll('.codes li')].map(li => li.textContent.replace(/\s+/g, ' ').trim()),
      ctlHidden: document.getElementById('wallctl').hidden,
      readout: document.getElementById('readout').textContent.trim(),
      nums: [...document.querySelectorAll('.nums li b')].map(b => b.textContent.trim()),
      crossKept: document.querySelectorAll('.dot-kept').length,
      crossCoded: document.querySelectorAll('.dot-coded').length,
    };
  });
  await ctx.close();

  ok(noscript.h1.replace(/\s/g, '') === 'CONTENTWAS:', 'the work is named on the page');
  const want = [
    [C.log.deletions, 'the number of deletions'],
    [C.quote.deletions_quoting_the_page, 'the number of notes that quote their page'],
    [C.quote.whole, 'the number that quote it whole'],
    [C.quote.characters_preserved_total, 'the characters preserved'],
    [C.quote.characters_preserved_whole, 'the characters preserved whole'],
    [C.quote.comment_length_255, 'the notes that stop at the ceiling'],
    [C.articles.distinct_titles, 'the emptied article titles'],
    [C.articles.live_today, 'the emptied titles that hold an article today'],
    [C.seal.titles_sealed_now, 'the titles sealed now'],
    [C.seal.ever_create_protected, 'the titles ever sealed'],
    [C.log.titles_without_a_title, 'the entries with no subject'],
    [C.log.restores_events, 'the undeletions'],
    [C.grounds_with_code, 'the deletions naming a published code'],
  ];
  for (const [v, what] of want) ok(noscript.text.includes(sp(v)), `${what} (${sp(v)}) is in the served text`);
  ok(noscript.h2.length === 9, 'all nine sections are present, without script');
  ok(noscript.ctlHidden === true, 'the controls are hidden from a reader who cannot use them');
  ok(/scripting on/i.test(noscript.readout), 'the page says what the controls would do');
  ok(noscript.bars === 26, 'the ceiling figure draws all 26 lengths from 230 to 255');
  ok(noscript.codes.length === 18, 'eighteen criteria are listed');
  ok(noscript.codes.every(c => /\d/.test(c)), 'each criterion carries its count');
  ok(/quick-deletion criteria/i.test(noscript.text), 'the criteria are attributed to the wiki');
  ok(/dumps\.wikimedia\.org/.test(noscript.text) && /CC BY-SA/.test(noscript.text),
     'the source and its licence are named on the page');
  ok(/Ọnụọha/.test(noscript.text) && /Jarpa/.test(noscript.text),
     'the nearest works are named on the page');
}

// ---- 2. the drawing ---------------------------------------------------------------------
console.log('\nTHE DRAWING — one character, one unit, measured out of the SVG');
{
  let drawn = 0;
  for (let s = 0; s < 3; s++) {
    const d = noscript.paths['w-' + STATES[s]] || '';
    const r = runs(d);
    const sum = r.reduce((a, b) => a + b, 0);
    ok(sum === charsBy[s],
       `the ${STATES[s]} path inks ${sp(sum)} units, and counts.json has ${sp(charsBy[s])} characters`);
    drawn += sum;
  }
  ok(drawn === C.quote.characters_preserved_total,
     `the whole wall inks ${sp(drawn)} units for ${sp(C.quote.characters_preserved_total)} characters`);
  ok(noscript.vb[2] === CPR, `the wall is ${CPR} characters wide, as it says`);
  ok(Math.abs(noscript.vb[3] - expectedRows * PITCH) < 0.05,
     `the wall is ${expectedRows} lines deep, laid out again from counts.json`);
  ok(noscript.text.includes(sp(expectedRows) + ' lines deep') ||
     noscript.text.includes(expectedRows + ' lines deep'),
     'the page prints the depth it actually drew');
  // no block may be split anywhere but at a row edge
  const allD = STATES.map(s => noscript.paths['w-' + s] || '').join('');
  const bad = [...allD.matchAll(/M([\d.]+) [\d.]+h(\d+)v1h-\d+z/g)]
    .filter(m => +m[1] + +m[2] > CPR).length;
  ok(bad === 0, 'no run overflows the width of the wall');
  ok((noscript.paths['wall-hi'] || '') === '', 'nothing is lit before a reader lights it');
}

// ---- 3. the third figure ----------------------------------------------------------------
console.log('\nTHE THIRD FIGURE — one mark per emptying, and the names that may be printed');
{
  const rows = C.tail.slice(0, 44);
  ok(noscript.tailCounts.length === 44, 'forty-four rows are drawn');
  ok(JSON.stringify(noscript.tailCounts) === JSON.stringify(rows.map(r => r.n)),
     'the printed counts are the counts in counts.json, in order');
  const marks = Object.values(noscript.tailMarks).reduce((a, b) => a + b, 0);
  ok(marks === rows.reduce((a, r) => a + r.n, 0),
     `${marks} marks for ${rows.reduce((a, r) => a + r.n, 0)} emptyings`);
  ok(rows.every(r => r.when.length === r.n), 'every row has one date per emptying in counts.json');
  const named = rows.filter(r => r.title);
  ok(noscript.tailTitles.length === named.length, 'a name is drawn for every nameable row');
  ok(named.every(r => noscript.tailTitles.includes(r.title)), 'each of those names is the one measured');
  ok(noscript.withheld === rows.length - named.length, 'every other row carries a withheld bar');
  ok(rows.every(r => r.title === null || r.live === true),
     'no name is printed for a title that holds no article today');
  ok(noscript.seals === rows.filter(r => r.sealed).length, 'the seals drawn are the seals measured');
}

// ---- 3b. the crossing --------------------------------------------------------------------
console.log('\nTHE CROSSING — the two shares, read back off the drawing');
{
  const T = C.by_year_table;
  ok(T.length === C.by_year.length, 'the year table covers every year the log has');
  ok(T.every(r => r[2] <= r[1] && r[3] <= r[1]), 'no year keeps or codes more than it deleted');
  ok(T.reduce((a, r) => a + r[2], 0) === C.quote.deletions_quoting_the_page,
     'the year table accounts for every note that kept a copy');
  ok(T.reduce((a, r) => a + r[3], 0) === C.grounds_with_code,
     'the year table accounts for every note that names a code');
  ok(T.reduce((a, r) => a + r[1], 0) === C.log.deletions,
     'the year table accounts for every deletion');
  const last = C.quote.last_year_kept;
  ok(T.filter(r => +r[0] > last).every(r => r[2] === 0),
     `no year after ${last} kept a single copy`);
  ok(T.find(r => +r[0] === last)[2] > 0, `${last} is the last year that kept one`);
  ok(C.quote.years_with_none.every(y => +y > last), 'the empty years are exactly the years after it');
  // the crossing itself, from the numbers rather than from the prose
  const share = r => [100 * r[2] / r[1], 100 * r[3] / r[1]];
  const a = share(T.find(r => r[0] === '2007')), b = share(T.find(r => r[0] === '2008'));
  ok(a[0] > a[1] && b[0] < b[1], 'kept leads coded in 2007 and trails it in 2008');
  ok(noscript.text.includes('between 2007 and 2008'), 'the page says where the lines change places');
  // the drawing: as many marks on each line as there are years
  ok(noscript.crossKept === T.length && noscript.crossCoded === T.length,
     'both lines are drawn with one point per year');
}

// ---- 4. the arithmetic ------------------------------------------------------------------
console.log('\nTHE ARITHMETIC — the measurement against itself');
{
  const q = C.quote;
  ok(q.whole + q.cut_by_text_limit + q.cut_by_comment_ceiling === q.deletions_quoting_the_page,
     'whole plus the two kinds of cut equals the notes that quote their page');
  ok(C.wall.length === q.deletions_quoting_the_page, 'the wall has one block per quoting note');
  ok(C.wall.reduce((a, w) => a + w[0], 0) === q.characters_preserved_total,
     'the blocks sum to the characters preserved');
  ok(C.wall.filter(w => w[1] === 0).reduce((a, w) => a + w[0], 0) === q.characters_preserved_whole,
     'the whole blocks sum to the characters preserved whole');
  ok(Math.max(...C.wall.filter(w => w[1] === 0).map(w => w[0])) === q.longest_whole,
     'the longest whole block is the longest reported');
  ok(C.grounds.reduce((a, g) => a + g[1], 0) === C.log.deletions,
     'every deletion is in exactly one ground bucket');
  ok(C.log.deletions - C.grounds.find(g => g[0] === '(no code)')[1] === C.grounds_with_code,
     'the deletions naming a code and those naming none account for all of them');
  ok(C.articles.repeat_distribution.reduce((a, r) => a + r[0] * r[1], 0) === C.articles.deletions,
     'the repeat distribution sums to the article-space deletions');
  ok(C.articles.repeat_distribution.reduce((a, r) => a + r[1], 0) === C.articles.distinct_titles,
     'the repeat distribution counts every distinct article title');
  ok(C.articles.live_today <= C.articles.distinct_titles, 'no more titles are live than were emptied');
  ok(C.tail.every(r => r.n >= 8), 'the tail is what the page says it is: emptied eight times or more');
  ok(C.tail.every((r, i, a) => i === 0 || a[i - 1].n >= r.n), 'the tail is ordered');
  ok(C.seal.titles_sealed_now <= C.seal.ever_create_protected, 'no more seals stand than were ever set');
  ok(C.namespaces.reduce((a, x) => a + x[1], 0) === C.log.deletions,
     'every deletion is in exactly one namespace');
  ok(C.by_year.reduce((a, x) => a + x[1], 0) === C.log.deletions, 'every deletion is in exactly one year');
  ok(C.by_year[0][0] === C.log.first.slice(0, 4) && C.by_year[C.by_year.length - 1][0] === C.log.last.slice(0, 4),
     'the years run from the log’s first entry to its last');
  const wallYears = new Set(C.wall.map(w => w[2]));
  ok([...wallYears].every(y => y >= 2004 && y <= 2026), 'every block is dated inside the log’s span');
}

// ---- 5. with script ---------------------------------------------------------------------
console.log('\nWITH SCRIPT — pointing at the wall, and lighting one year');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  watch(ctx);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + file);
  await page.waitForTimeout(400);
  ok(errs.length === 0, 'the page runs without throwing: ' + (errs[0] || 'no error'));
  ok(await page.evaluate(() => document.getElementById('wallctl').hidden === false),
     'the controls appear for a reader who can use them');

  // point at a chosen block, computed here rather than read from the page
  for (const k of [0, 5000, C.wall.length - 1]) {
    const mid = starts[k] + Math.floor(C.wall[k][0] / 2);
    const row = Math.floor(mid / CPR), x = mid - row * CPR;
    const got = await page.evaluate(([x, row, PITCH]) => {
      const svg = document.getElementById('wall');
      const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      const cx = r.left + (x + 0.5) / vb.width * r.width;
      const cy = r.top + (row * PITCH + 0.5) / vb.height * r.height;
      svg.dispatchEvent(new PointerEvent('pointermove', { clientX: cx, clientY: cy, bubbles: true }));
      return {
        readout: document.getElementById('readout').textContent,
        lit: document.getElementById('wall-hi').getAttribute('d') || '',
      };
    }, [x, row, PITCH]);
    const [len, , year] = C.wall[k];
    ok(got.readout.includes(String(len)) && got.readout.includes(String(year)),
       `block ${k + 1} reports ${len} characters, deleted in ${year}`);
    ok(runs(got.lit).reduce((a, b) => a + b, 0) === len,
       `block ${k + 1} lights exactly its own ${len} characters`);
  }

  // light a year
  for (const y of [2009, 2017, 2024]) {
    const lit = await page.evaluate(y => {
      const s = document.getElementById('wall-year');
      s.value = String(y);
      s.dispatchEvent(new Event('input', { bubbles: true }));
      return { d: document.getElementById('wall-hi').getAttribute('d') || '',
               out: document.getElementById('readout').textContent,
               v: document.getElementById('wall-yearv').textContent };
    }, y);
    const chars = C.wall.filter(w => w[2] === y).reduce((a, w) => a + w[0], 0);
    const blocks = C.wall.filter(w => w[2] === y).length;
    ok(runs(lit.d).reduce((a, b) => a + b, 0) === chars,
       `${y} lights ${sp(chars)} characters, exactly that year's blocks`);
    ok(lit.out.includes(String(blocks)) && lit.v === String(y),
       `${y} is reported as ${blocks} deletions that kept their page`);
  }
  const cleared = await page.evaluate(() => {
    document.getElementById('wall-all').click();
    return document.getElementById('wall-hi').getAttribute('d') || '';
  });
  ok(cleared === '', 'all years clears the light again');
  await ctx.close();
}

// ---- 6. the withholding -----------------------------------------------------------------
console.log('\nTHE WITHHOLDING — the work says it kept no text of a deleted page');
{
  const counts = readFileSync(join(here, 'counts.json'), 'utf8');
  const data = readFileSync(join(here, 'data.json'), 'utf8');
  ok(!/content was: /.test(counts + data + html), 'no quoted page text appears in any shipped file');
  ok(C.wall.every(w => w.length === 3 && Number.isInteger(w[0]) && Number.isInteger(w[1]) && Number.isInteger(w[2])),
     'every block in the measurement is three numbers and nothing else');
  ok(D.wall.every(w => w.length === 3 && typeof w[0] === 'number'),
     'every block in the island is three numbers and nothing else');
  const keys = new Set();
  C.tail.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
  ok([...keys].every(k => ['n', 'live', 'title', 'chars', 'sealed', 'sealed_since', 'restored', 'when'].includes(k)),
     'the tail carries only the fields the work describes: ' + [...keys].join(', '));
  ok(C.tail.filter(r => r.title === null).every(r => Number.isInteger(r.chars)),
     'a withheld name is kept only as a length');
  ok(/keeps the measure and drops the content/.test(noscript.text),
     'the page tells the reader it is withholding, and why');
  ok(/Section 8 says why/.test(noscript.text), 'the third figure points at the section that explains it');
}

// ---- 7. the network ---------------------------------------------------------------------
console.log('\nTHE NETWORK — the page must not reach for anything, in either state');
ok(offsite.length === 0, 'no request left the filesystem: ' + (offsite[0] || 'none'));

await browser.close();
console.log(`\n${fails.length ? 'FAILED ' + fails.length : 'all checks pass'}`);
if (fails.length) { fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
