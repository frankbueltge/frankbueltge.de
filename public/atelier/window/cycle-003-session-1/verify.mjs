// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one
// floor: an honest still frame for a reader who has no JavaScript. That floor is a claim,
// and a claim this practice has not tested is a claim. This tests it, twice over the same
// file: once with scripting on, once with it off. Two nights running it has caught what
// reading the source did not.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-1/verify.mjs
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

const CELLS = DATA.totals.statable
const EMPTY = DATA.totals.empty
const READ = DATA.screens.n_read
const TITLE = 'The empty cell is not the missing work'

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: every cell, every grid, every read entry -----------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok((await page.title()) === TITLE, 'no-JS: the title is served')
  ok(await page.locator('svg.gridfig').count() === 10,
     'no-JS: all ten grids are in the document')
  ok(await page.locator('rect.cell').count() === CELLS,
     `no-JS: all ${CELLS} cells are drawn`)
  ok(await page.locator('svg.schemes').count() === 1, 'no-JS: figure 2 is drawn')
  ok(await page.locator('svg.spread').count() === 1, 'no-JS: figure 3 is drawn')

  // all ten grids visible: the floor is the whole figure, not a tenth of it
  const visible = await page.locator('.gridwrap:not([hidden])').count()
  ok(visible === 10, `no-JS: all ten grids are shown, not ${visible}`)
  for (let i = 0; i < 10; i++) {
    const box = await page.locator(`#gw${i} rect.cell`).first().boundingBox()
    ok(box !== null && box.width > 0,
       `no-JS: grid ${i} is really drawn on the page, not hidden by a style rule`)
  }

  // and the control must NOT be visible, because nothing can act on it
  const ctlBox = await page.locator('#controls').boundingBox().catch(() => null)
  ok(ctlBox === null,
     'no-JS: the control is not shown — a select that cannot select is a lie')
  ok(await page.locator('p.nojs').isVisible(),
     'no-JS: the reader is told the ten grids follow in sequence')

  // every read entry and the whole ranking are in the document as text
  const body = await page.locator('main').innerText()
  ok(body.includes(String(CELLS)), 'no-JS: the cell count is in the text')
  ok(body.includes(String(EMPTY)), 'no-JS: the empty count is in the text')
  const rows = await page.locator('table tbody tr').count()
  ok(rows >= CELLS + EMPTY + READ + 20,
     `no-JS: every cell, every hole and every read entry is a row (${rows})`)
  ok(body.includes('0 are art that nobody has'), 'no-JS: the finding is in the text')
  await ctx.close()
}

// ---- 2. with JavaScript: the act the page exists for --------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.goto(URL)

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(await page.locator('.gridwrap:not([hidden])').count() === 1,
     'JS: the ten grids collapse to one on load')
  ok(await page.locator('#controls').isVisible(),
     'JS: the control appears once something can act on it')
  ok(!(await page.locator('p.nojs').isVisible()),
     'JS: the sequence note is withdrawn once the grids are collapsed')

  // changing the pair is the act — every one of the ten must come up
  for (let i = 0; i < 10; i++) {
    await page.selectOption('#pick', String(i))
    const shown = await page.locator('.gridwrap:not([hidden])').count()
    ok(shown === 1, `JS: scheme ${i} shows exactly one grid`)
    const id = await page.locator('.gridwrap:not([hidden])').getAttribute('data-i')
    ok(id === String(i), `JS: scheme ${i} shows the grid that was asked for`)
    const cells = await page.locator('.gridwrap:not([hidden]) rect.cell').count()
    ok(cells === DATA.grids[i].n_cells,
       `JS: scheme ${i} shows its ${DATA.grids[i].n_cells} cells`)
  }

  // the readout must state the exact numbers of the cell the reader is on
  await page.selectOption('#pick', '5')
  const first = page.locator('.gridwrap:not([hidden]) rect.cell').first()
  await first.hover()
  const readout = await page.locator('#readout').innerText()
  ok(readout.length > 10 && (readout.includes('works')),
     `JS: the readout states the cell (${readout.slice(0, 60)})`)
  await first.focus()
  const focused = await page.locator('#readout').innerText()
  ok(focused.includes('works'), 'JS: the readout works from the keyboard too')

  // the mark toggle
  const marksOn = await page.locator('.gridwrap:not([hidden]) circle.mk').count()
  await page.uncheck('#mark')
  const stillDrawn = await page.locator('.gridwrap:not([hidden]) circle.mk').count()
  const anyVisible = await page.locator('.gridwrap:not([hidden]) circle.mk').first()
      .isVisible().catch(() => false)
  ok(marksOn > 0, 'JS: some cells are marked as holding a work about missing data')
  ok(stillDrawn === marksOn && anyVisible === false,
     'JS: unchecking hides the marks rather than removing the record')

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
