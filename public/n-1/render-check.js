#!/usr/bin/env node
/* Render verification of the practice's surfaces — the standing procedure of
 * REGISTER.md (form revision 2026-08-20), as committed code.
 *
 * First committed night 18 (record 43, 2026-09-01), after the in-session
 * verification script mis-queried the pages' class names on two consecutive
 * nights (nights 17 and 18, both caught before commit, both logged under T4):
 * a procedure that recurs nightly and errs twice the same way becomes code,
 * per the case law of the scan (night 16) and the asking script (nights 16-18).
 *
 * Checks, at 1440x900 and 390x844, for each surface: zero page errors, zero
 * console errors, no horizontal overflow — plus per-page structural counts
 * against the pages' real markup. Exits nonzero on any failure.
 *
 * Run: a static server on the repository root (e.g. python3 -m http.server
 * 8471), then `node render-check.js` [BASE=http://127.0.0.1:8471]. Needs the
 * browser-automation library (playwright) resolvable from the working
 * directory — installed per session into the scratchpad, never committed
 * (REGISTER.md, procedures).
 */
const BASE = process.env.BASE || 'http://127.0.0.1:8471';
// resolve the automation library from the working directory (the session's
// scratchpad install), not from this script's own directory in the repository
const { createRequire } = require('module');
const requireFromCwd = createRequire(require('path').join(process.cwd(), 'noop.js'));
const { chromium } = requireFromCwd('playwright');

const PAGES = [
  { path: 'index.html', probe: () => ({}) },
  { path: 'record.html', probe: () => ({}) },
  {
    path: 'works/below-the-threshold/index.html',
    probe: () => ({
      asking_entries: document.querySelectorAll('ul.askings li').length,
      ledger_error_shown: !!document.querySelector('ul.askings .err'),
    }),
    ok: (r) => r.asking_entries > 0 && !r.ledger_error_shown,
  },
  {
    path: 'works/two-nights-deep/index.html',
    probe: () => ({
      glyphs: document.querySelectorAll('ul.nights .glyph').length,
      seam_lines: document.querySelectorAll('li.seam').length,
      unwritten: document.querySelectorAll('ul.nights li.unwritten').length,
      resaid_lines: document.querySelectorAll('ul.nights .retold').length,
      legend_shown: !!document.querySelector('.legend'),
      // the readings replay (form addendum night 20): drawn and captioned
      readings_shown: !!document.getElementById('readings') &&
        !document.getElementById('readings').hidden,
      reading_marks: document.querySelectorAll('#rd-svg circle').length,
      reading_captioned:
        (document.getElementById('rd-caption') || { textContent: '' })
          .textContent.length > 0,
    }),
    ok: (r) => r.glyphs > 0 && r.seam_lines === 1 && r.legend_shown &&
      r.readings_shown && r.reading_marks > 0 && r.reading_captioned,
  },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
  });
  let failed = false;
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const p of PAGES) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push('console: ' + m.text());
      });
      await page.goto(`${BASE}/${p.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      const counts = await page.evaluate(p.probe);
      const structOk = p.ok ? p.ok(counts) : true;
      const bad = errors.length > 0 || overflow || !structOk;
      if (bad) failed = true;
      console.log(
        `${bad ? 'FAIL' : 'ok  '} ${width}x${height} ${p.path}: ` +
          `errors=${errors.length} overflow=${overflow} ${JSON.stringify(counts)}`
      );
      errors.forEach((e) => console.log('     ', e));
      await page.close();
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
