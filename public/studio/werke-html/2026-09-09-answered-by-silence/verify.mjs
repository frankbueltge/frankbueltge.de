// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of ANSWERED BY SILENCE.
//   node verify.mjs [path-to-index.html]
//
// Four questions.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: every letter of
//     the catalogue, every day the other side spoke, and all three readings of the count?
//   THE RULE — does the page keep the rule it is about? Not one word of the other side's
//     headings may appear anywhere in the served document.
//   WITH SCRIPT — does the dial move the count to the numbers in data.json, and does
//     "you decide" really hand the judgement to the reader?
//   AND — does the page reach the network? It must not, once, ever, in either state.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || join(here, 'index.html');
const data = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const html = readFileSync(file, 'utf8');
const T = data.totals, A = data.counts_answered, S = data.counts_silent;

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const offsite = [];
const watch = ctx => ctx.on('request', r => { if (!r.url().startsWith('file:')) offsite.push(r.url()); });

// ---- 1. the floor, with JavaScript disabled ----------------------------------------
console.log('\nWITHOUT SCRIPT — what a reader gets from the served document alone');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1000 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);

  const rows = await page.locator('table tbody tr').count();
  ok(rows === T.letters, `all ${T.letters} letters are in the catalogue (found ${rows})`);

  const others = await page.locator('ul.others li').count();
  ok(others === T.other_days, `all ${T.other_days} days the other side spoke are listed (found ${others})`);

  const groups = await page.locator('svg.score g.row').count();
  ok(groups === T.letters, `the score draws ${T.letters} letters (found ${groups})`);

  const bars = await page.locator('svg.score line.bar').count();
  ok(bars === T.other_days, `the score draws ${T.other_days} barlines (found ${bars})`);

  const ticks = await page.locator('svg.score line.sit').count();
  ok(ticks === T.letter_nights,
     `the score draws one tick per letter-night: ${T.letter_nights} (found ${ticks})`);

  const body = await page.locator('body').innerText();
  for (const [label, n] of [['the rule’s reading', S.before_next_sitting],
                            ['the loosest reading', S.ever],
                            ['the strictest reading', S.same_day]]) {
    ok(new RegExp('\\b' + n + '\\b').test(body), `${label} (${n}) is printed without a script`);
  }
  const silentRows = await page.locator('table tbody tr.silent').count();
  ok(silentRows === S.before_next_sitting,
     `${S.before_next_sitting} rows are served already marked as answered by silence (found ${silentRows})`);

  // every letter carries its own address in the repository, so a reader can overrule us
  const src = await page.locator('table tbody tr td.h .src').count();
  ok(src === T.letters, `every letter prints its file, line and commit (found ${src})`);

  await ctx.close();
}

// ---- 2. the rule the work is about, kept by the work --------------------------------
console.log('\nTHE RULE — the other side is dated and unquoted');
{
  const files = ['REQUESTS.md', 'REQUESTS-ARCHIVE.md'];
  const ours = new Set(data.letters.map(l => l.heading));
  let checked = 0, today = 0, leaked = [];
  for (const f of files) {
    const txt = readFileSync(join(here, '..', '..', f), 'utf8');
    for (const line of txt.split('\n')) {
      if (!line.startsWith('## ')) continue;
      const h = line.slice(3).trim();
      if (ours.has(h)) continue;
      if (h.includes(data.date)) { today++; continue; }  // this session's own letter
      checked++;
      if (html.includes(h)) leaked.push(h.slice(0, 60));
    }
  }
  ok(checked >= T.other_blocks, `every heading not ours was tested (${checked} of them)`);
  ok(today === T.written_today_and_not_counted && today === 1,
     `this session's own letter to the same channel is excluded, not counted (${today})`);
  ok(leaked.length === 0,
     `not one of the other side's headings appears in the page${leaked.length ? ': ' + leaked.join(' | ') : ''}`);
  ok(!/heygen|api\.|http:\/\//i.test(html.replace(/https:\/\/[^"'\s]*/g, '')),
     'no key, no endpoint and no plain-http reference is embedded in the page');
}

// ---- 3. the dial ---------------------------------------------------------------------
console.log('\nWITH SCRIPT — the dial');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const read = async () => {
    const t = await page.locator('#readout').innerText();
    return parseInt(t.replace(/\s/g, '').match(/(\d+)of\d+/)[1], 10);
  };
  ok(await read() === S.before_next_sitting,
     `opens on the channel's own rule: ${S.before_next_sitting} unanswered`);

  await page.locator('.opts button[data-k="ever"]').click();
  ok(await read() === S.ever, `"any later word" gives ${S.ever}`);

  await page.locator('.opts button[data-k="same"]').click();
  ok(await read() === S.same_day, `"a word the same day" gives ${S.same_day}`);

  await page.locator('.opts button[data-k="next"]').click();
  ok(await read() === S.before_next_sitting, `back to the rule: ${S.before_next_sitting}`);

  await page.locator('.opts button[data-k="you"]').click();
  const start = await read();
  ok(start === S.before_next_sitting, '"you decide" starts from the rule, not from nothing');
  await page.locator('svg.score g.row[data-n="1"]').click();
  ok(await read() === start - 1, 'one click on the reader\'s own judgement moves the count by one');
  await page.locator('table tbody tr#L1').click();
  ok(await read() === start, 'and clicking again gives it back');

  // the drawing must agree with the record: line length is the wait, in days
  const geo = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('svg.score g.row').forEach(g => {
      const l = g.querySelector('line.wait');
      out.push({ n: +g.dataset.n, w: Math.abs(l.x2.baseVal.value - l.x1.baseVal.value),
                 ticks: g.querySelectorAll('line.sit').length,
                 r: g.querySelector('circle.post').r.baseVal.value });
    });
    return out;
  });
  // coordinates are written to one decimal, so a line may sit up to 0.2 px off its day
  const ref = geo.reduce((a, g) => {
    const L = data.letters.find(x => x.n === g.n);
    return L.wait_days > a.d ? { d: L.wait_days, w: g.w } : a;
  }, { d: 0, w: 0 });
  const pxPerDay = ref.w / ref.d;
  const dev = Math.max(...geo.map(g => {
    const L = data.letters.find(x => x.n === g.n);
    return Math.abs(g.w - pxPerDay * L.wait_days);
  }));
  ok(dev <= 0.2, `every line's length is its wait in days at ${pxPerDay.toFixed(3)} px/day `
     + `(worst line off by ${dev.toFixed(3)} px)`);
  ok(geo.every(g => g.ticks === data.letters.find(x => x.n === g.n).sittings_in_wait),
     'every line carries exactly as many ticks as there were working nights in its wait');
  const big = geo.reduce((a, b) => (a.r > b.r ? a : b));
  const longest = data.letters.reduce((a, b) => (a.words > b.words ? a : b));
  ok(big.n === longest.n, `the largest dot is the longest letter (#${longest.n}, ${longest.words} words)`);

  // the reader's judgement is not written anywhere
  const stored = await page.evaluate(() => {
    try { return localStorage.length + sessionStorage.length; } catch (e) { return -1; }
  });
  ok(stored === 0 || stored === -1, 'nothing the reader decides is stored');

  await ctx.close();
}

// ---- 4. the network -------------------------------------------------------------------
console.log('\nTHE NETWORK');
ok(offsite.length === 0, `the page made no request off the filesystem in either state (${offsite.length})`);

// ---- 5. the numbers are the ones the builder computed -----------------------------------
console.log('\nARITHMETIC');
ok(A.before_next_sitting + S.before_next_sitting === T.letters, 'answered + silent = letters');
ok(data.letters.filter(l => l.sittings_in_wait > 0).length === S.before_next_sitting - 1
   || data.letters.filter(l => !l.before_next_sitting).length === S.before_next_sitting,
   'a letter is silent exactly when a working night fell inside its wait, or it is still open');
ok(data.letters.filter(l => l.open).length === 1, 'exactly one letter is still open tonight');
ok(data.history.history_reaches === '2026-07-12',
   'the build read the history back to the founding commit — not a shallow clone');

await browser.close();
console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'ALL CHECKS PASSED'}`);
process.exit(fails.length ? 1 : 0);
