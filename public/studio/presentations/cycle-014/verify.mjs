// The presentation is the work as it stands: index.html, data.js and gate.js here must be byte-identical to
// works/2026-11-12-whose-gate/, and the page must open without errors.   node verify.mjs (from this folder)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-12-whose-gate');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const same = ['index.html', 'data.js', 'gate.js'].map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + here + '/index.html#t=2026-11-12'); await page.waitForTimeout(600);
const acts = await page.evaluate(() => +document.getElementById('cv').dataset.acts);
await browser.close();
const ok = same.every(([, s]) => s) && !errors.length && acts === 29;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, acts, ok })); process.exit(ok ? 0 : 1);
