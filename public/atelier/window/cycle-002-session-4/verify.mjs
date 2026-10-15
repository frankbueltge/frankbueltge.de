// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one
// floor: an honest still frame for a reader who has no JavaScript. That floor is a
// claim, and a claim this practice has not tested is a claim. This tests it, twice over
// the same file: once with scripting on, once with it off.
//
//   node window/cycle-002-session-4/verify.mjs
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
].filter(Boolean)
const EXEC = CANDIDATES.find(p => existsSync(p))

const fails = []
let n = 0
const ok = (cond, what) => { n++; if (!cond) fails.push(what) }

const N = DATA.summary.n_statements
const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: every statement, both figures, nothing lost but sorting
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok((await page.title()) === 'The line and the curve', 'no-JS: the title is served')
  ok(await page.locator('#tbl tbody tr').count() === N,
     `no-JS: all ${N} statements are in the document`)
  ok(await page.locator('svg.plane circle.pt').count() === N,
     `no-JS: all ${N} points are drawn in the plane`)
  ok(await page.locator('svg.matched').count() === 1, 'no-JS: the control figure is drawn')
  ok(await page.locator('svg.plane line.boundary').count() === 1,
     'no-JS: the survival boundary is drawn')

  // every headline number is readable without scripting
  const text = await page.locator('main').innerText()
  for (const needle of [
    `${N.toLocaleString('en-US')}`,
    (100 * DATA.standardised.raw_level).toFixed(1),
    (100 * DATA.standardised.matched_comparison).toFixed(1),
    (100 * DATA.standardised.expected_level).toFixed(1),
    DATA.geometry.median_r_cmp.toFixed(4),
    DATA.geometry.median_cancel.toFixed(3),
    DATA.feeds[0].sha256.slice(0, 16),
  ]) ok(text.includes(needle), `no-JS: the page states ${needle}`)

  // the controls that need scripting are hidden until it runs
  ok(await page.locator('#planeControls').isHidden(), 'no-JS: the plane controls stay hidden')

  ok(await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(r => !r.name.startsWith('file:')).length) === 0,
     'no-JS: the page fetches nothing')
  await ctx.close()
}

// ---- 2. with JavaScript: the filters, the sort and the readout all do what is claimed
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.goto(URL)
  await page.waitForFunction(() => !document.getElementById('planeControls').hidden)

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(await page.locator('#planeControls').isVisible(), 'JS: the plane controls appear')

  const visibleRows = () => page.locator('#tbl tbody tr:visible').count()
  ok(await visibleRows() === N, 'JS: the table starts complete')
  ok((await page.locator('#tCount').innerText()).includes(String(N)),
     'JS: the readout counts every statement')

  await page.selectOption('#tKind', 'comparison')
  const nCmp = DATA.standardised.n_comparison
  ok(await visibleRows() === nCmp, `JS: filtering to comparisons leaves ${nCmp}`)

  await page.selectOption('#tSurv', '1')
  const held = DATA.statements.filter(s => s.kind === 'comparison' && s.survives).length
  ok(await visibleRows() === held, `JS: comparisons that hold are ${held}`)

  await page.selectOption('#tKind', '')
  await page.selectOption('#tSurv', '')
  await page.selectOption('#tFam', 'act')
  const nAct = DATA.statements.filter(s => s.family === 'act').length
  ok(await visibleRows() === nAct, `JS: the act family has ${nAct} statements`)
  await page.selectOption('#tFam', '')

  await page.fill('#tQ', 'decisive_move')
  const nDm = DATA.statements.filter(s => s.field === 'decisive_move').length
  ok(await visibleRows() === nDm, `JS: searching the sentence finds the ${nDm} decisive_move statements`)
  await page.fill('#tQ', '')

  // sorting by half-travel must actually order the column
  await page.click('#tbl th[data-sort="r"]')
  const col = await page.$$eval('#tbl tbody tr td:nth-child(3)',
    tds => tds.slice(0, 60).map(td => parseFloat(td.textContent)))
  ok(col.every((v, i) => i === 0 || col[i - 1] <= v) ||
     col.every((v, i) => i === 0 || col[i - 1] >= v), 'JS: the half-travel column sorts')

  // the plane readout names the statement under the point
  await page.locator('svg.plane circle.pt').first().dispatchEvent('click')
  const ro = await page.locator('#ro').innerText()
  ok(ro.includes('half-travel') && ro.includes('standoff'),
     'JS: a point reads out its own geometry')
  ok(/holds|turns/.test(ro), 'JS: a point reads out its verdict')

  // filtering the plane hides points rather than redrawing them
  await page.selectOption('#fKind', 'level')
  const shown = await page.locator('svg.plane circle.pt:visible').count()
  ok(shown === DATA.standardised.n_level, `JS: the plane filters to ${DATA.standardised.n_level} levels`)

  ok(await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(r => !r.name.startsWith('file:')).length) === 0,
     'JS: the page still fetches nothing')
  await ctx.close()
}

await browser.close()
console.log(`${n} checks in a real browser, ${fails.length} failing`)
for (const f of fails) console.log('  FAIL:', f)
process.exit(fails.length ? 1 : 0)
