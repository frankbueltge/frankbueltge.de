// The declared rule's call, run once more inside a browser engine, to see whether the rule answers the same there.
// Usage: node count_browser.mjs <texts.json>   prints {browser, counts: {id: n}, split: [[token, times], …]}
// `split` lists every word-like segment this runtime keeps whole and the browser does not, with how often it occurs
// across all texts. Needs a Chromium that the local automation library can launch.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const texts = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
function tally(T) {
  const seg = new Intl.Segmenter('en', { granularity: 'word' }), counts = {}, tok = {};
  for (const [id, t] of Object.entries(T)) {
    let n = 0;
    for (const s of seg.segment(t)) if (s.isWordLike) { n++; tok[s.segment] = (tok[s.segment] || 0) + 1; }
    counts[id] = n;
  }
  return { counts, tok };
}
const here = tally(texts);
const b = await chromium.launch();
const p = await b.newPage();
const there = await p.evaluate(`(${tally})(${JSON.stringify(texts)})`);
const browser = 'Chromium ' + b.version();
await b.close();
const split = Object.entries(here.tok).filter(([k, n]) => (there.tok[k] || 0) < n).sort((a, c) => c[1] - a[1] || (a[0] < c[0] ? -1 : 1));
process.stdout.write(JSON.stringify({ browser, counts: there.counts, split }));
