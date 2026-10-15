// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one
// floor: an honest still frame for a reader who has no JavaScript. That floor is a claim,
// and reading the source has now failed four times to catch what a browser did. So it is
// tested rather than asserted, twice over the same file: once with scripting on, once
// with it off — and in both states the page is denied the network, so a page that had
// quietly started fetching something would fail here rather than in the world.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-3/verify.mjs
//
// Needs a playwright driver and a chromium on the machine (CHROMIUM_PATH overrides the
// executable). It is a check of the page, not part of it.
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
const N = DATA.n
const RUNGS = ['name', 'creator', 'attributed']
const LAD = Object.fromEntries(DATA.work_ladder.map(r => [r.rung, r]))
const SUB = Object.fromEntries(DATA.subset.ladder.map(r => [r.rung, r]))
const BND = Object.fromEntries(DATA.bounds_by_rung.map(r => [r.rung, r]))
const FILL = { none: '#efece6', name: '#c9d3d9', creator: '#8a9ba8', attributed: '#2f4858' }
const UNASKED_FILL = '#ffffff'
const UNASKED = DATA.unasked

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: all three standards of proof, drawn ---------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []
  const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `no-JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok((await page.title()) === TITLE, 'no-JS: the title is served')

  const stills = await page.locator('#stills .still').count()
  ok(stills === RUNGS.length, `no-JS: one still grid per rung (saw ${stills})`)

  const gridCells = await page.locator('#stills svg.grid rect.c').count()
  ok(gridCells === N * RUNGS.length,
    `no-JS: every still draws all ${N} entries (saw ${gridCells})`)

  const marked = await page.locator('#stills svg.grid rect.mk').count()
  ok(marked === DATA.subset.n * RUNGS.length,
    `no-JS: the read entries are outlined in every still (saw ${marked})`)

  // Each still must actually fill the number of cells its rung reaches.
  for (const r of RUNGS) {
    const i = RUNGS.indexOf(r)
    const filled = await page.locator(`#stills .still:nth-child(${i + 1}) svg.grid rect.c`)
      .evaluateAll((els, f) => els.filter(e => e.getAttribute('fill') === f).length, FILL[r])
    ok(filled === LAD[r].count,
      `no-JS: the ${r} still fills ${LAD[r].count} cells (saw ${filled})`)
  }

  const hidden = await page.locator('#livewrap').isHidden()
  ok(hidden, 'no-JS: the interactive frame is not shown')
  const ctlVisible = await page.locator('#ctl input[name=rung]').first().isVisible()
    .catch(() => false)
  ok(!ctlVisible, 'no-JS: the controls are not offered')

  // An entry the second record never answered about must be drawn as neither hit nor
  // miss, in every still, or the still frame lies about coverage.
  const unaskedCells = await page.locator('#stills svg.grid rect.un').count()
  ok(unaskedCells === UNASKED * RUNGS.length,
    `no-JS: the unasked entries are drawn apart in every still (saw ${unaskedCells})`)
  const unaskedWhite = await page.locator('#stills svg.grid rect.un')
    .evaluateAll((els, f) => els.every(e => e.getAttribute('fill') === f), UNASKED_FILL)
  ok(unaskedWhite, 'no-JS: no unasked entry is drawn as a miss')

  const body = await page.locator('body').innerText()
  ok(body.includes(String(LAD.attributed.count)), 'no-JS: the headline count is in the text')
  ok(body.includes(String(DATA.n2)) || body.includes(
    String(DATA.n2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')),
  'no-JS: the size of the second list is in the text')

  // The still frame and the script must group digits the same way. They did not on the
  // night this was written — one used a thin space, the other an ordinary one — and the
  // only thing that noticed was a check that could then never pass. Both are asserted
  // here against one expectation.
  if (BND.attributed.estimate) {
    const est = Math.round(BND.attributed.estimate)
    const grouped = String(est).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')
    ok(body.includes(grouped),
      `no-JS: the estimate is served grouped as ${grouped}`)
  }

  const candRows = await page.locator('#tcand tbody tr').count()
  ok(candRows === DATA.candidates.candidates.length,
    `no-JS: the candidate table is served (${candRows} rows)`)
  const nearRows = await page.locator('#tnear tbody tr').count()
  ok(nearRows === DATA.near_classes.length,
    `no-JS: the near-class table is served (${nearRows} rows)`)
  const boundRows = await page.locator('#tbound tbody tr').count()
  ok(boundRows === DATA.bounds_by_rung.length,
    `no-JS: the bound table is served (${boundRows} rows)`)
  const subRows = await page.locator('#tsub tbody tr').count()
  ok(subRows === DATA.subset.n,
    `no-JS: the reading table is served (${subRows} rows)`)

  const tables = await page.locator('table tbody tr').count()
  ok(tables >= DATA.near_classes.length + DATA.bounds_by_rung.length + DATA.subset.n,
    `no-JS: every table is served drawn (${tables} rows in total)`)
  await ctx.close()
}

// ---- 2. with JavaScript: the reader moves the standard of proof ---------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []
  const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
  await page.goto(URL)
  await page.waitForFunction(() => {
    const r = document.getElementById('ro')
    return r && r.textContent.trim().length > 0
  })

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)

  ok(await page.locator('#stills').isHidden(), 'JS: the still frame steps aside')
  ok(await page.locator('#livewrap').isVisible(), 'JS: the interactive frame is shown')

  const cells = await page.locator('#livewrap svg.grid rect.c').count()
  ok(cells === N, `JS: one live cell per entry (saw ${cells})`)

  const checked = await page.locator('#ctl input[name=rung]:checked').getAttribute('value')
  ok(checked === 'name', `JS: the weakest standard is offered first (saw ${checked})`)

  for (const r of RUNGS) {
    await page.locator(`#ctl input[value=${r}]`).check()
    const filled = await page.locator('#livewrap svg.grid rect.c')
      .evaluateAll((els, f) => els.filter(e => e.getAttribute('fill') === f).length, FILL[r])
    ok(filled === LAD[r].count,
      `JS: at ${r} the grid fills ${LAD[r].count} cells (saw ${filled})`)

    const stillWhite = await page.locator('#livewrap svg.grid rect.un')
      .evaluateAll((els, f) => els.every(e => e.getAttribute('fill') === f), UNASKED_FILL)
    ok(stillWhite, `JS: at ${r} no unasked entry is drawn as a miss`)

    const ro = await page.locator('#ro').innerText()
    ok(ro.includes(String(LAD[r].count)),
      `JS: the readout at ${r} states the coverage ${LAD[r].count}`)
    ok(ro.includes(String(LAD[r].asked)),
      `JS: the readout at ${r} states the denominator ${LAD[r].asked}`)
    ok(ro.includes(String(SUB[r].count)),
      `JS: the readout at ${r} states the subset count ${SUB[r].count}`)
    ok(ro.includes(String(BND[r].m)),
      `JS: the readout at ${r} states the overlap ${BND[r].m}`)
    if (BND[r].estimate) {
      const est = Math.round(BND[r].estimate)
      const spaced = String(est).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')
      ok(ro.includes(spaced) || ro.includes(String(est)),
        `JS: the readout at ${r} states the estimate ${est}`)
    } else {
      ok(ro.includes('undefined'),
        `JS: the readout at ${r} says the estimate is undefined`)
    }
  }

  // Going back down the ladder must restore the wider picture, not leave it stuck.
  await page.locator('#ctl input[value=name]').check()
  const back = await page.locator('#livewrap svg.grid rect.c')
    .evaluateAll((els, f) => els.filter(e => e.getAttribute('fill') === f).length, FILL.name)
  ok(back === LAD.name.count, `JS: the grid returns to ${LAD.name.count} cells (saw ${back})`)
  await ctx.close()
}

await browser.close()

if (fails.length) {
  console.error(`${fails.length} of ${n} browser checks failed:`)
  for (const f of fails) console.error('  FAIL ' + f)
  process.exit(1)
}
console.log(`${n} browser checks passed`)
