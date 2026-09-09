// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one
// floor: an honest still frame for a reader who has no JavaScript. That floor is a claim,
// and this practice has now had three separate nights where reading the source did not
// catch what a browser did. So it is tested rather than asserted, twice over the same
// file: once with scripting on, once with it off.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-2/verify.mjs
//
// Needs a playwright driver and a chromium on the machine (CHROMIUM_PATH overrides the
// executable). It is a check of the page, not part of it — the page loads nothing at
// runtime.
//
// Author: the Atelier. Licence: Apache-2.0 with the repository.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
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

function findChromium () {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers'
  const named = [join(root, 'chromium', 'chrome-linux', 'chrome')]
  if (existsSync(root)) {
    for (const d of readdirSync(root)) {
      if (d.startsWith('chromium')) named.push(join(root, d, 'chrome-linux', 'chrome'))
    }
  }
  return named.find(p => existsSync(p))
}

const EXEC = findChromium()
const fails = []
let n = 0
const ok = (cond, what) => { n++; if (!cond) fails.push(what) }

const TITLE = DATA.meta.title
const C = DATA.counts
const REGIONS = DATA.regions
const NAMES = ['floor', 'monotone', 'recall']
const key = ks => ks.slice().sort().join('|')
const findReg = ks => REGIONS.find(r => key(r.assume) === key(ks))
const FREE = findReg([])
const pct2 = v => (100 * v).toFixed(2) + ' %'
const pts2 = v => (100 * v).toFixed(2) + ' points'

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: all eight compositions, drawn ---------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok((await page.title()) === TITLE, 'no-JS: the title is served')

  // the still frame is the whole figure, not a sample of it
  ok(await page.locator('svg.ladder').count() === 1, 'no-JS: the ladder is drawn')
  const bands = await page.locator('svg.ladder rect.band').count()
  const deads = await page.locator('svg.ladder rect.dead').count()
  ok(bands + deads === REGIONS.length,
     `no-JS: all ${REGIONS.length} compositions are drawn (${bands} bars, ${deads} struck)`)
  ok(deads === REGIONS.filter(r => !r.feasible).length,
     'no-JS: the empty compositions are drawn as empty, not omitted')
  const box = await page.locator('svg.ladder rect.band').first().boundingBox()
  ok(box !== null && box.width > 0,
     'no-JS: the bars are really on the page, not hidden by a style rule')
  ok(await page.locator('svg.detect').count() === 1, 'no-JS: figure 2 is drawn')
  ok(await page.locator('svg.width').count() === 1, 'no-JS: figure 3 is drawn')

  // the control must NOT be shown, because nothing can act on it
  const ctlBox = await page.locator('#controls').boundingBox().catch(() => null)
  ok(ctlBox === null, 'no-JS: the control is not shown — a checkbox that does nothing is a lie')
  const liveBox = await page.locator('#live').boundingBox().catch(() => null)
  ok(liveBox === null, 'no-JS: the live bar and its readout are not shown either')
  ok(!(await page.locator('#cap1js').isVisible()),
     'no-JS: the caption does not promise a control the reader has not got')

  // every number the argument turns on is in the document as text
  const body = await page.locator('main').innerText()
  for (const [what, needle] of [
    ['the entry count', String(C.n)],
    ['the yes count', String(C.yes)],
    ['the free count', String(C.free)],
    ['the assumption-free width', pts2(FREE.width)],
    ['the assumption-free ends', pct2(FREE.lo)],
    ['the Lincoln-Petersen total', DATA.capture.lincoln_petersen.toFixed(1)],
    ['the source', 'arXiv:2205.07388'],
    ['the refutation section', 'What would refute this page']
  ]) ok(body.includes(needle), `no-JS: ${what} is in the text (${needle})`)

  // the full table of compositions, and every verdict the intervals rest on
  const rows = await page.locator('table tbody tr').count()
  ok(rows === REGIONS.length + DATA.yes_rows.length,
     `no-JS: every composition and every verdict is a row (${rows})`)
  ok(body.includes('no value of the fraction satisfies these together'),
     'no-JS: the refutation of the two joint assumptions is stated in words')
  await ctx.close()
}

// ---- 2. with JavaScript: holding an assumption is the act the page exists for --------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.goto(URL)

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(await page.locator('#controls').isVisible(),
     'JS: the control appears once something can act on it')
  ok(await page.locator('#live').isVisible(), 'JS: the live bar appears')
  ok(await page.locator('#cap1js').isVisible(),
     'JS: the caption now names the control it has')
  ok(await page.locator('svg.ladder rect.band').first().isVisible(),
     'JS: the still frame of all eight stays, it is not replaced')

  // every one of the eight compositions, held in turn
  for (let mask = 0; mask < 8; mask++) {
    const held = NAMES.filter((_, i) => (mask >> i) & 1)
    for (let i = 0; i < NAMES.length; i++) {
      await page.setChecked('#a-' + NAMES[i], Boolean((mask >> i) & 1))
    }
    const r = findReg(held)
    const readout = await page.locator('#readout').innerText()
    if (r.feasible) {
      ok(readout.includes(pct2(r.lo)) && readout.includes(pct2(r.hi)),
         `JS: [${held}] reads out its interval (${pct2(r.lo)}, ${pct2(r.hi)})`)
      ok(readout.includes(pts2(r.width)),
         `JS: [${held}] reads out its width ${pts2(r.width)}`)
      const bars = await page.locator('#livefig rect.band').count()
      ok(bars === 1, `JS: [${held}] draws one live bar`)
      ok(await page.locator('#livefig rect.dead').count() === 0,
         `JS: [${held}] is feasible and is not drawn struck`)
    } else {
      ok(readout.toLowerCase().includes('empty'),
         `JS: [${held}] says in words that it admits no value`)
      ok(await page.locator('#livefig rect.dead').count() === 1,
         `JS: [${held}] draws the empty band`)
      ok(await page.locator('#livefig rect.band').count() === 0,
         `JS: [${held}] draws no interval, because there is none`)
    }
    for (const k of held) {
      ok(readout.includes(DATA.rungs.status[k][0]),
         `JS: [${held}] names the status of ${k}`)
    }
  }

  // the finding the page is for: the published point is an END of the widest interval
  for (const k of NAMES) await page.setChecked('#a-' + k, false)
  const wide = await page.locator('#readout').innerText()
  ok(wide.includes('inside this interval'),
     'JS: with nothing assumed, the published point is inside — at the edge')
  ok(wide.includes(pct2(DATA.published_point)),
     'JS: the published point is named in the readout')

  // and the one composition that refuses to exist
  await page.setChecked('#a-floor', true)
  await page.setChecked('#a-recall', true)
  const dead = await page.locator('#readout').innerText()
  ok(dead.includes(String(DATA.capture.lincoln_petersen.toFixed(1))),
     'JS: the empty case names the floor that makes it empty')
  ok(dead.includes(String(C.yes + C.borderline)),
     'JS: the empty case names the ceiling that makes it empty')

  ok(await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(r => !r.name.startsWith('file://')).length) === 0,
     'JS: the page fetched nothing over the network')
  await ctx.close()
}

await browser.close()

if (fails.length) {
  console.error(`${fails.length} of ${n} browser checks failed:`)
  for (const f of fails) console.error('  ✗ ' + f)
  process.exit(1)
}
console.log(`${n} browser checks passed — with the script and without it.`)
