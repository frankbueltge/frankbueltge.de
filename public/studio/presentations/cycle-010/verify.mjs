// The presentation is the work as it stands: index.html and data.js here must be byte-identical to
// works/2026-10-24-going-out/, and the page must open without errors.   node verify.mjs (from this folder)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-10-24-going-out');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const same = ['index.html', 'data.js'].map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }); const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + path.join(here, 'index.html')); await page.waitForTimeout(3000); await browser.close();
const ok = same.every(([, s]) => s) && !errors.length;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, ok })); process.exit(ok ? 0 : 1);
