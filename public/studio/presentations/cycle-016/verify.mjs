// The presentation is the work as it stands: index.html, data.js, run.js, meta.json and the check file here must be
// byte-identical to works/2026-11-18-second-run/, and the page must open without errors and draw, after its run,
// the last date's frame: 10 claims on paper, 2 on 19 November 2026, 1 from 1 December 2026, of 41; 24 copies struck.
// The work's own verify.mjs reads every number of the page against the data; this one checks that this is that page.
// node verify.mjs (from this folder)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-18-second-run');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const same = ['index.html', 'data.js', 'run.js', 'meta.json', 'check/retired.json'].map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1100, height: 900 }, reducedMotion: 'reduce' })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + here + '/index.html'); await page.waitForFunction(() => document.body.dataset.run === 'done');
const d = await page.evaluate(() => window.__drawn), t = await page.evaluate(() => window.__drawnT);
await browser.close();
const ok = same.every(([, s]) => s) && !errors.length && JSON.stringify(t.counts.claims) === '[10,2,1,41]' && d.struck === 24 && d.now === 1 && d.lit === 10 && t.testLine === 1 && t.noLine === 1;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, claims: t.counts.claims, struck: d.struck, lit: d.lit, now: d.now, ok })); process.exit(ok ? 0 : 1);
