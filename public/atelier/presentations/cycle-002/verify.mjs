// verify.mjs — the presentation must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one
// floor: an honest still frame for a reader who has no JavaScript. That floor is a
// claim, and a claim this practice has not tested is a claim. This tests it, twice over
// the same file: once with scripting on, once with it off. Last night this verifier
// earned its keep by catching a CSS rule that outranked the browser's `hidden`
// attribute, so the controls would have been visible and inert for a reader without
// scripting. Reading the CSS did not catch that; the browser did.
//
//   node presentations/cycle-002/verify.mjs
//
// Needs a playwright driver and a chromium on the machine (NODE_PATH may have to point
// at the global module root; CHROMIUM_PATH overrides the executable). It is a check of
// the page, not part of it — the page itself loads nothing at runtime.
//
// Author: the Atelier. Licence: Apache-2.0 with the repository.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }
const { chromium } = pw

const HERE = dirname(fileURLToPath(import.meta.url))
const URL = 'file://' + join(HERE, 'index.html')
const DATA = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'))

const CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
].filter(Boolean)
const EXEC = CANDIDATES.find(p => existsSync(p))

const fails = []
let n = 0
const ok = (cond, what) => { n++; if (!cond) fails.push(what) }

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ----------------------------------------------------------------- scripting ON
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('requestfailed', r => errors.push('request failed: ' + r.url()))
  const requests = []
  page.on('request', r => requests.push(r.url()))
  await page.goto(URL)
  await page.waitForTimeout(220)

  ok(errors.length === 0, 'script threw or a request failed: ' + errors.join(' | '))
  ok(requests.every(u => u.startsWith('file://')),
    'the page fetched something at runtime: ' + requests.filter(u => !u.startsWith('file://')).join(' '))

  ok(await page.locator('#probe').isVisible(), 'the controls did not appear with scripting on')
  ok(await page.locator('#livefig').isVisible(), 'the live figure did not appear')
  ok((await page.locator('#canvas svg').count()) === 1, 'the live figure drew no svg')
  ok((await page.locator('#canvas svg circle').count()) === DATA.cancel.n,
    'the live figure drew the wrong number of points')

  const readout = await page.locator('#readout').textContent()
  ok(/\d+ comparisons/.test(readout), 'the readout said nothing: ' + readout)
  ok(readout.includes(String(DATA.cancel.n)), 'the readout miscounted at the default filter')

  // the probe: the act that produced this session, repeated in the browser
  await page.fill('#rho', '2')
  await page.waitForTimeout(120)
  const all = await page.locator('#readout').textContent()
  ok(/\(9[0-9]\.\d %\)|\(100\.0 %\)/.test(all),
    'at rho = 2 nearly everything should lie below: ' + all)
  await page.fill('#rho', '0')
  await page.waitForTimeout(120)
  ok((await page.locator('#readout').textContent()).includes('0 below'),
    'at rho = 0 nothing should lie below')

  // both sibling values, located in the browser exactly as the prose locates them
  for (const [i, v] of DATA.sibling.values.entries()) {
    await page.fill('#rho', String(v))
    await page.waitForTimeout(120)
    const t = await page.locator('#readout').textContent()
    const pctFound = Number((t.match(/\((\d+\.\d) %\)/) || [])[1])
    ok(Math.abs(pctFound - DATA.sibling.percentiles[i]) < 0.11,
      `the browser puts sibling value ${v} at ${pctFound} %, the record at ` +
      `${DATA.sibling.percentiles[i].toFixed(1)} %`)
  }

  // filtering must move both the figure and the table, and never lose a row silently
  await page.selectOption('#ffeed', 'atlas')
  await page.waitForTimeout(140)
  const atlasDefined = DATA.probe_values.filter(v => v[1] === 'atlas').length
  ok((await page.locator('#canvas svg circle').count()) === atlasDefined,
    'filtering to the atlas drew the wrong number of points')
  const shown = await page.locator('#rows tbody tr:not([hidden])').count()
  ok(shown === DATA.comparisons.filter(c => c.feed === 'atlas').length,
    'filtering to the atlas showed the wrong number of table rows')
  await page.selectOption('#ffeed', '')
  await page.waitForTimeout(140)
  ok((await page.locator('#rows tbody tr:not([hidden])').count()) === DATA.comparisons.length,
    'clearing the filter did not restore every row')

  await ctx.close()
}

// ----------------------------------------------------------------- scripting OFF
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto(URL)

  // the floor: the controls must be gone, not merely inert
  ok(!(await page.locator('#probe').isVisible()),
    'the controls are visible without scripting — they would be inert furniture')
  ok(!(await page.locator('#livefig').isVisible()),
    'the live figure frame is visible without scripting')

  // and everything the figures say must still be in the document
  ok((await page.locator('svg.fig').count()) === 3, 'a static figure is missing')
  ok((await page.locator('svg.fig circle').count()) >= DATA.cancel.n,
    'the still distribution does not draw every point')
  ok((await page.locator('#rows tbody tr').count()) === DATA.comparisons.length,
    'the comparison table is incomplete without scripting')
  ok((await page.locator('#rows tbody tr:not([hidden])').count()) === DATA.comparisons.length,
    'a row is hidden with no script to unhide it')

  const text = await page.locator('main').innerText()
  for (const needle of [
    DATA.cancel.median.toFixed(4),
    DATA.cancel.min.toFixed(3),
    DATA.cancel.max.toFixed(3),
    String(DATA.cancel.ceiling.n),
    String(DATA.boundary.ok.toLocaleString('en-US')),
    DATA.sibling.values[0].toFixed(3),
    DATA.sibling.values[1].toFixed(3),
  ]) ok(text.includes(needle), `without scripting the page does not state ${needle}`)

  ok(text.includes('Publish the range'), 'the title is missing from the served document')
  ok(/refutation|kill|would kill/i.test(text), 'the page states no refutation condition')

  await ctx.close()
}

// ----------------------------------------------------------------- the page in a phone
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } })
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.waitForTimeout(200)
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok(overflow <= 1, `the page scrolls sideways on a 360 px viewport by ${overflow} px`)
  await ctx.close()
}

await browser.close()

console.log(`${n} checks ran in a real browser, ${fails.length} failed`)
for (const f of fails) console.log('  ✗', f)
process.exit(fails.length ? 1 : 0)
