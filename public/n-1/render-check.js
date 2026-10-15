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
  {
    // project 1, session 3 (night 37): the first study, built by
    // projects/earth-rotation/study-1/build.py
    path: 'projects/earth-rotation/study-1/index.html',
    probe: () => ({
      bars: document.querySelectorAll('svg.strip rect').length,
      leaps: document.querySelectorAll('svg.strip line.leap').length,
      nos: document.querySelectorAll('svg.strip line.no').length,
      play_shown: !!document.getElementById('play') &&
        getComputedStyle(document.querySelector('.controls')).display !== 'none',
    }),
    ok: (r) => r.bars > 0 && r.leaps === 26 && r.nos === 40 && r.play_shown,
  },
  {
    // project 1, session 4 (night 38): the study promoted to a work, built by
    // works/the-days-end-to-end/build.py; the same strips as the study
    path: 'works/the-days-end-to-end/index.html',
    probe: () => ({
      bars: document.querySelectorAll('svg.strip rect').length,
      leaps: document.querySelectorAll('svg.strip line.leap').length,
      nos: document.querySelectorAll('svg.strip line.no').length,
      play_shown: !!document.getElementById('play') &&
        getComputedStyle(document.querySelector('.controls')).display !== 'none',
    }),
    ok: (r) => r.bars > 0 && r.leaps === 26 && r.nos === 40 && r.play_shown,
  },
  {
    // project 7, session 3 (night 58): the work Corrected Silently, built by
    // projects/transcribers-notes/build_work.py; one square per book, and the
    // readout must answer a click
    path: 'projects/transcribers-notes/silently/index.html',
    probe: () => {
      const t = document.querySelectorAll('.field .t');
      const before = document.getElementById('r').textContent;
      if (t.length) t[t.length - 1].click();
      return {
        squares: t.length,
        listed: document.querySelectorAll('.field .t.l').length,
        hover: document.querySelectorAll('.field .t.h').length,
        none: document.querySelectorAll('.field .t.s').length,
        readout_changed: document.getElementById('r').textContent !== before,
      };
    },
    ok: (r) => r.squares === 384 && r.listed === 126 && r.hover === 17 && r.none === 241 && r.readout_changed,
  },
  {
    // project 8, session 1 (night 59): I will write, built by
    // projects/will-write/build.py; one mark per promise, twenty lanes, and
    // the sentence panel must answer a click; session 2 (night 60) adds the
    // 179 marks with a letter on their bill filed within sixty days; session 3
    // (night 61) adds the 'Outside the bills' section, no marks
    path: 'projects/will-write/index.html',
    probe: () => {
      const m = document.querySelectorAll('.ms .m');
      const before = document.getElementById('say').textContent;
      if (m.length) m[m.length - 1].click();
      return {
        marks: m.length,
        library: document.querySelectorAll('.ms .m.l').length,
        back: document.querySelectorAll('.ms .m.b').length,
        lanes: document.querySelectorAll('.lane').length,
        panel_changed: document.getElementById('say').textContent !== before,
        outside: !!document.getElementById('outside'),
      };
    },
    ok: (r) => r.outside && r.marks === 2645 && r.library === 113 && r.back === 179 && r.lanes === 20 && r.panel_changed,
  },
  {
    // project 9, session 1 (night 62): Named into the sky, built by
    // projects/minor-planet-names/build.py; one dot per honouree, living and
    // dead; the panel must answer a click; no link on any under-18 dot
    path: 'projects/minor-planet-names/index.html',
    probe: () => {
      const d = document.querySelectorAll('.d');
      const before = document.getElementById('say').textContent;
      if (d.length) d[d.length - 1].click();
      const liv = document.querySelectorAll('#liv .d');
      return {
        dots: d.length,
        living: liv.length,
        dead: document.querySelectorAll('#dead .d').length,
        year_bars: document.querySelectorAll('#yrs .yb').length,
        panel_changed: document.getElementById('say').textContent !== before,
        redated_lines: (document.querySelectorAll('svg.sl')[0] || document).querySelectorAll('.ln').length,
        lag_lines: (document.querySelectorAll('svg.sl')[1] || document).querySelectorAll('.ln').length,
      };
    },
    // session 2 (night 63): dots placed by the year of naming (12 living and 4 dead whose naming year is unknown set
    // aside, so 34 years of naming carry a citation, not 30); two line charts, 156 re-dated citations and the
    // competition-to-naming pairs
    ok: (r) => r.dots === 1719 && r.living === 1340 && r.dead === 379 && r.year_bars === 34 && r.panel_changed
      && r.redated_lines === 156 && r.lag_lines > 20,
  },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
    // 2026-09-18 (night 29): this session's pre-installed chromium build has
    // dropped "old" headless, which this playwright version still requests by
    // default against an executablePath override; explicit --headless=new
    // (a later flag overrides an earlier one) launches on both old and new
    // builds and is a no-op where the default already is "new". First found
    // and fixed the same way on an orphaned branch, night 27 by another
    // session's numbering (claude/fervent-hamilton-ym8pey, commit fbd271c,
    // pull request #2) that never reached main — verified independently in
    // this session's own container before porting (nights/55-twenty-ninth-night.md).
    args: ['--headless=new'],
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
