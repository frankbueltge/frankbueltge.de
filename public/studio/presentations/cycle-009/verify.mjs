// node verify.mjs — the cycle-009 presentation is TAKE COVER, AGAIN as it stands in works/2026-10-20-take-cover-again
// (session 191, the coda of session 192 copied in): the same page and the same files, byte for byte, and it runs in a real browser.
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url)), work = join(here, '../../works/2026-10-20-take-cover-again');
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const h = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for (const f of ['index.html', 'data.js', 'record.js', 'summary.js', 'toll.js', 'tollsum.js', 'word.js', 'wordsum.js', 'wordsample.js', 'whole.js', 'people.js',
  'vendor/d3.min.js', 'vendor/topojson-client.min.js', 'vendor/counties-10m.js', 'vendor/LICENCES.md'])
  t(`${f} identical to the work's`, h(join(here, f)) === h(join(work, f)));
const html = fs.readFileSync(join(here, 'index.html'), 'utf8');
t('every href is absolute', [...html.matchAll(/href="([^"$]*)"/g)].every(m => /^https:\/\//.test(m[1])));
t('every script the page loads is here', [...html.matchAll(/src="([^"]+)"/g)].every(m => fs.existsSync(join(here, m[1]))));
t('finished, not in progress', /<div id="wip">Finished · 2026-10-21/.test(html) && !/In progress/.test(html));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html') + '?at=' + (Date.UTC(2011, 3, 28) - Date.UTC(2008, 0, 1)) / 60000 + '&county=ALC125');
  await p.waitForFunction(() => /2011/.test(document.getElementById('wdate').textContent), null, { timeout: 20000 });
  t(`${w} the map stands at 2011-04-28`, await p.locator('#map').isVisible());
  t(`${w} the baseline line is drawn`, /%/.test(await p.locator('#wbase').textContent()));
  await p.waitForFunction(() => document.getElementById('cname').textContent.includes('Tuscaloosa'), null, { timeout: 10000 });
  t(`${w} the card holds Tuscaloosa`, true);
  t(`${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  await ctx.close();
}
await b.close();
console.log(`${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
