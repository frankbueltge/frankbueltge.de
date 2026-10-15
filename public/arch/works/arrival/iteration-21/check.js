// The check this iteration was published against, committed with it.
//
// Session 23 wrote a harness of this kind and did not commit it, which made its
// state counts uncomparable with the next session's. This one is committed so
// that the claim "checked at N states" can be checked.
//
// It drives an instance through states of its four controls using the file's
// own state variables and redraw(), then reads the rendered DOM back and
// compares it against a second computation made here from D.felt — the file's
// pinned list of published changes — and never from FELT, the file's own
// expansion of it. It calls none of the file's functions.
//
// What it checks: page errors; horizontal document overflow; that every text of
// every figure lies inside that figure's box in screen space, horizontally and
// vertically; that the number of present block marks and the number of
// withdrawn block marks each equal what the record says at that instant and
// above that threshold.
//
// From iteration 15 it also checks the split the file now makes: a block drawn
// as the other publisher's record is drawn with its own mark, so the harness
// counts those separately and against the same pinned change list.
//
// Requires Node and Playwright's chromium; neither is in this repository.
//     node check.js hv75018296.html us6000tmta.html ...

const {chromium} = require('playwright');
const path = require('path');

const FILES = process.argv.slice(2);
const WIDTHS = [1440, 1100, 820];

(async () => {
  // CHROMIUM=/path/to/chrome if Playwright's own download is not present
  const browser = await chromium.launch(
    process.env.CHROMIUM ? {executablePath: process.env.CHROMIUM} : {});
  let bad = 0;
  for (const f of FILES) {
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({viewport: {width: w, height: 1000}});
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push('pageerror: ' + e.message));
      page.on('console', m => {
        if (m.type() === 'error') errs.push('console: ' + m.text());
      });
      await page.goto('file://' + path.resolve(f));
      await page.waitForTimeout(250);

      const nWhen = await page.evaluate(() => WHEN.length);
      const nRung = await page.evaluate(() => RUNGS.length);
      const nNear = await page.evaluate(() => NEAR.length);
      const maxN = await page.evaluate(() => maxN);

      // states: every instant at the default thresholds, then a sweep of the
      // other three controls at the last instant and at a middle one.
      const states = [];
      for (let i = 0; i < nWhen; i++) states.push([i, 0, 0, 1]);
      const mid = Math.floor(nWhen / 2);
      for (let r = 0; r < nRung; r++) states.push([nWhen - 1, r, 0, 1], [mid, r, 0, 1]);
      for (let g = 0; g < nNear; g++) states.push([nWhen - 1, 0, g, 1], [mid, 0, g, 1]);
      for (let n = 1; n <= Math.min(maxN, 12); n++) states.push([nWhen - 1, 0, 0, n], [mid, 0, 0, n]);

      let maxGone = 0, sawGone = 0, maxNote = '', maxAlt = 0;
      for (const [wi_, ri_, gi_, n_] of states) {
        const r = await page.evaluate(([a, b, c, d]) => {
          wi = a; ri = b; gi = c; minN = d;
          redraw();
          // second implementation, from the pinned change list and not FELT
          const upTo = FEAT[wi];
          const st = new Map();          // i -> {n, cdi, gone}
          for (let j = 0; j <= upTo && upTo >= 0; j++) {
            const v = D.felt[j];
            for (const [i, n, cdi] of v.a) st.set(i, {n, cdi, gone: false});
            for (const [i, n, cdi] of v.c) st.set(i, {n, cdi, gone: false});
            for (const i of v.d) { const s = st.get(i); if (s) s.gone = true; }
          }
          let wantGone = 0, wantHere = 0, wantAlt = 0;
          for (const [i, s] of st) {
            if (s.n < minN) continue;
            if (s.gone) { wantGone++; continue; }
            wantHere++;
            if (D.blocks[i].s !== D.counts.mainStream) wantAlt++;
          }
          const felt = document.getElementById('felt');
          const gotGone = felt.querySelectorAll('rect.blkgone').length;
          const gotAlt = felt.querySelectorAll('rect.blkalt').length;
          const gotHere = felt.querySelectorAll('rect.blk').length + gotAlt;
          // every text of every figure inside its own box, in screen space
          const bad = [];
          for (const svg of document.querySelectorAll('svg')) {
            const b = svg.getBoundingClientRect();
            for (const t of svg.querySelectorAll('text')) {
              const r = t.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) continue;
              if (r.left < b.left - 0.5 || r.right > b.right + 0.5 ||
                  r.top < b.top - 0.5 || r.bottom > b.bottom + 0.5)
                bad.push((svg.id || '?') + ': "' +
                         t.textContent.slice(0, 40) + '"');
            }
          }
          return {
            wantGone, wantHere, gotGone, gotHere, wantAlt, gotAlt, bad,
            note: document.getElementById('noteB').textContent,
            overflowX: document.documentElement.scrollWidth >
                       document.documentElement.clientWidth,
          };
        }, [wi_, ri_, gi_, n_]);

        const tag = `${path.basename(f)} @${w} [wi=${wi_} ri=${ri_} gi=${gi_} n=${n_}]`;
        if (r.gotGone !== r.wantGone) {
          console.log(`FAIL ${tag}: withdrawn marks ${r.gotGone}, expected ${r.wantGone}`);
          bad++;
        }
        if (r.gotHere !== r.wantHere) {
          console.log(`FAIL ${tag}: present marks ${r.gotHere}, expected ${r.wantHere}`);
          bad++;
        }
        if (r.gotAlt !== r.wantAlt) {
          console.log(`FAIL ${tag}: other-publisher marks ${r.gotAlt}, expected ${r.wantAlt}`);
          bad++;
        }
        if (r.bad.length) {
          console.log(`FAIL ${tag}: text outside its figure: ${r.bad.slice(0, 3).join(' | ')}`);
          bad++;
        }
        if (r.overflowX) { console.log(`FAIL ${tag}: document overflows horizontally`); bad++; }
        if (r.gotGone > maxGone) { maxGone = r.gotGone; maxNote = r.note; }
        if (r.gotGone > 0) sawGone++;
        if (r.gotAlt > maxAlt) maxAlt = r.gotAlt;
      }
      if (errs.length) { console.log(`FAIL ${path.basename(f)} @${w}: ${errs.slice(0, 3).join(' | ')}`); bad++; }
      console.log(`checked ${path.basename(f)} @${w}: ${states.length} states; withdrawn marks drawn in ${sawGone} of them, at most ${maxGone}; other-publisher marks at most ${maxAlt} — "${maxNote}"`);
      await ctx.close();
    }
  }
  await browser.close();
  console.log(bad ? `\n${bad} failure(s)` : '\nall states pass');
  process.exit(bad ? 1 : 0);
})();
