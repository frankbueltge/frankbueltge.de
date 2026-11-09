// The presentation is the work as it stands: index.html, data.js and land.js here must be byte-identical to
// works/2026-11-08-no-public-land/, and the page must open without errors.   node verify.mjs (from this folder)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-08-no-public-land');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const same = ['index.html', 'data.js', 'land.js'].map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + here + '/index.html'); await page.waitForTimeout(600);
const fit = await page.evaluate(() => window.NPL_fitError());
await browser.close();
const ok = same.every(([, s]) => s) && !errors.length && fit < 0.5;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, fit, ok })); process.exit(ok ? 0 : 1);
