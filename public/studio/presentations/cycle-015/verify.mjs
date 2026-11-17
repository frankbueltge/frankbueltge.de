// The presentation is the work as it stands: index.html, data.js, hands.js and the check file here must be
// byte-identical to works/2026-11-15-other-hands/, and the page must open without errors and draw its 69 seals.
// Since 2026-11-17 (session 250, after the presentation): its 47 red lines and 18 broken ones, and the faint row's 135 marks.
// node verify.mjs (from this folder)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-15-other-hands');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const same = ['index.html', 'data.js', 'hands.js', 'meta.json', 'check/state-second-reading.json', 'check/voice-second-reading.json'].map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + here + '/index.html'); await page.waitForTimeout(600);
const d = await page.evaluate(() => window.__oh.drawn), t = await page.evaluate(() => window.__oh.tally);
await browser.close();
const seals = d.left + d.right, ok = same.every(([, s]) => s) && !errors.length && seals === 69 && d.H === 25 && d.rim === 8 && d.T === 47 && d.t === 18 && t.G === 135;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, seals, hands: d.H, rims: d.rim, lines: d.T, broken: d.t, faint: t.G, ok })); process.exit(ok ? 0 : 1);
