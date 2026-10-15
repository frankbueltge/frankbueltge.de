// verify.mjs — the page in a real browser: scripting on and off, every non-local request
// refused, at phone and desk widths, light and dark. Checks that nothing overflows, that the
// three figures carry every mark the results hold, that the tables are whole, and that the
// body has its own background in both schemes.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-18/verify.mjs

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }

const HERE = dirname(fileURLToPath(import.meta.url))
const URL = 'file://' + resolve(HERE, 'index.html')
const R = JSON.parse(readFileSync(resolve(HERE, 'results.json'), 'utf8'))
const BARS = R.bands.filter(b => b.night >= 30).length
const DOWN = R.bands.filter(b => b.night >= 30 && b.ratio < 1).length

let n = 0
const fails = []
function ok (cond, what) { n++; if (!cond) fails.push(what) }

const browser = await pw.chromium.launch()
const bgs = {}
for (const js of [true, false]) for (const width of [390, 1100]) for (const scheme of ['light', 'dark']) {
  const tag = `js ${js ? 'on' : 'off'} · ${width}px · ${scheme}`
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width, height: 900 }, colorScheme: scheme })
  let offsite = 0
  await ctx.route('**', route => {
    if (route.request().url().startsWith('file:')) return route.continue()
    offsite++
    return route.abort()
  })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'load' })
  ok(offsite === 0, `${tag}: no off-site request`)
  const docW = await page.evaluate(() => document.documentElement.scrollWidth).catch(() => null)
  if (docW !== null) ok(docW <= width, `${tag}: no page-wide horizontal scroll (${docW})`)
  ok(await page.locator('svg.f1 rect.bar').count() === BARS, `${tag}: f1 every band`)
  ok(await page.locator('svg.f1 rect.bar.dn').count() === DOWN, `${tag}: f1 bands below the line`)
  ok(await page.locator('svg.f2 polyline').count() === 2, `${tag}: f2 two lines`)
  ok(await page.locator('svg.f2 circle').count() === 18, `${tag}: f2 all points`)
  ok(await page.locator('svg.f3 circle').count() === 6, `${tag}: f3 six subsets`)
  for (const f of ['svg.f1', 'svg.f2', 'svg.f3']) {
    const box = await page.locator(f).boundingBox()
    ok(box && box.width > 300, `${tag}: ${f} drawn`)
  }
  ok(await page.locator('table').nth(0).locator('tr').count() === 5, `${tag}: band table whole`)
  ok(await page.locator('table').nth(1).locator('tr').count() === 10, `${tag}: floor table whole`)
  ok(await page.locator('table').nth(2).locator('tr').count() === 7, `${tag}: subset table whole`)
  const bg = await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor).catch(() => null)
  if (bg !== null) { ok(bg !== 'rgba(0, 0, 0, 0)', `${tag}: body background`); bgs[scheme] = bg }
  const text = await page.locator('main').innerText()
  ok(text.includes('The hour it was written'), `${tag}: heading`)
  if (js && width === 390 && scheme === 'light') await page.screenshot({ path: process.env.SHOT || '/dev/null', fullPage: true }).catch(() => {})
  await ctx.close()
}
await browser.close()
ok(bgs.light && bgs.dark && bgs.light !== bgs.dark, 'dark scheme changes the background')

console.log(`${n - fails.length} of ${n} browser checks passed`)
for (const f of fails) console.log('  FAIL ' + f)
process.exit(fails.length ? 1 : 0)
