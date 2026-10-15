// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one floor:
// an honest still frame for a reader with no JavaScript. That floor is a claim, and reading
// source has repeatedly failed to catch what a browser actually does, so it is tested — twice
// over the same file, once with scripting on and once with it off, and in both states the page
// is denied the network, so a page that had quietly started fetching something fails here
// rather than in the world.
//
// The check that matters most is the last group. This page's claim is that the same record
// yields five different counts of its own holes. The live figure draws one mark per hole and
// the script recomputes nothing the record does not state, so the marks are counted in the DOM
// at each of the five settings and compared with the committed numbers.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-6/verify.mjs
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
const D = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'))

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

const R = Object.fromEntries(D.readings.map(r => [r.id, r]))
const ORDER = ['R1', 'R2', 'R4', 'R5', 'R3']

async function denyNetwork (page, outbound) {
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
}

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: the still frame is a complete page ------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `no-JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok((await page.title()).includes('empty cell is not an absence'), 'no-JS: the title is served')

  const dots = await page.locator('#field .dot').count()
  ok(dots === R.R1.value, `no-JS: figure 1 is drawn at R1 with ${R.R1.value} marks (saw ${dots})`)
  ok(await page.locator('#field').getAttribute('data-reading') === 'R1',
    'no-JS: the still figure says which rule it shows')

  const readout = await page.locator('#readout').innerText()
  ok(/every empty slot/.test(readout), 'no-JS: the readout names the rule it stands at')

  const rows = await page.locator('#ledger-body tr').count()
  ok(rows === D.classes.length, `no-JS: the ledger has ${D.classes.length} rows (saw ${rows})`)

  const runs = await page.locator('#runs').getAttribute('data-runs')
  ok(Number(runs) === D.runs.record, `no-JS: the record-order run count is served (saw ${runs})`)
  const runsTxt = await page.locator('#runs').innerText()
  for (const k of ['frame', 'holder', 'ground']) {
    ok(runsTxt.includes(String(D.runs[k])), `no-JS: the served run count for ${k} is stated`)
  }

  // the controls are present and dead
  await page.locator('.rbtn[data-reading="R3"]').click({ force: true }).catch(() => {})
  const dots2 = await page.locator('#field .dot').count()
  ok(dots2 === dots, 'no-JS: the figure does not move when a dead control is clicked')

  // every number the controls would show is in the served text
  const body = await page.locator('body').innerText()
  const thin = v => v.toLocaleString('en-GB').replace(/,/g, ' ')
  for (const id of ORDER) {
    ok(body.includes(thin(R[id].value)), `no-JS: the served page states ${id} = ${R[id].value}`)
  }
  ok(body.includes(thin(D.totals.records)), 'no-JS: the served page states the record count')
  ok(/177\.8/.test(body), 'no-JS: the served page states the spread')
  for (const f of D.feeds) {
    ok(body.includes(f.sha256.slice(0, 12)), `no-JS: the hash of ${f.key} is served`)
  }

  // the two sizeless classes are visible as sizeless without a script
  const none = await page.locator('#ledger-body .nonum').count()
  ok(none === D.countability.unframed,
    `no-JS: ${D.countability.unframed} rows are served as having no number (saw ${none})`)

  await ctx.close()
}

// ---- 2. with JavaScript: the marks are the record --------------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)
  await page.waitForSelector('#field[data-reading="R1"]')

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)

  // the whole claim: one mark per hole, at each of the five rules
  for (const id of ORDER) {
    await page.locator(`.rbtn[data-reading="${id}"]`).click()
    await page.waitForSelector(`#field[data-reading="${id}"]`)
    const c = await page.locator('#field .dot').count()
    ok(c === R[id].value, `JS: ${id} draws ${R[id].value} marks (saw ${c})`)
    const txt = await page.locator('#readout').innerText()
    ok(txt.includes(R[id].name), `JS: the readout names the rule at ${id}`)
    const pressed = await page.locator('.rbtn[aria-pressed="true"]').count()
    ok(pressed === 1, `JS: exactly one rule is pressed at ${id} (saw ${pressed})`)
  }

  // the extremes really are 177.8 apart in the DOM, not only in the prose
  await page.locator('.rbtn[data-reading="R3"]').click()
  const lo = await page.locator('#field .dot').count()
  await page.locator('.rbtn[data-reading="R1"]').click()
  const hi = await page.locator('#field .dot').count()
  ok(lo === D.spread.low && hi === D.spread.high, 'JS: the drawn extremes are the published ones')
  ok(Math.abs(hi / lo - D.spread.float) < 1e-9, 'JS: the drawn ratio is the published spread')
  await page.locator('.rbtn[data-reading="R3"]').click()
  await page.waitForSelector('#field[data-reading="R3"]')
  ok(lo === 14 && (await page.locator('#field .dot.big').count()) === 14,
    'JS: at 14 holes the marks are drawn large enough to be counted by eye')
  await page.locator('.rbtn[data-reading="R1"]').click()
  await page.waitForSelector('#field[data-reading="R1"]')
  ok((await page.locator('#field .dot.big').count()) === 0,
    'JS: at 2489 holes the marks are drawn small')

  // ---- the ledger: only one sort resolves the last column
  const seen = {}
  for (const [key, label] of [['record', 'as published'], ['frame', 'by frame'],
    ['holder', 'by holder'], ['ground', 'by ground']]) {
    await page.locator(`.sbtn[data-sort="${key}"]`).click()
    const flags = await page.locator('#ledger-body tr').evaluateAll(
      trs => trs.map(t => t.getAttribute('data-frame') === 'true'))
    let runs = 0; let last = null
    for (const f of flags) { if (f !== last) { runs++; last = f } }
    seen[key] = runs
    ok(runs === D.runs[key], `JS: sorting ${label} gives ${D.runs[key]} blocks (saw ${runs})`)
    const shown = await page.locator('#runs').getAttribute('data-runs')
    ok(Number(shown) === runs, `JS: the readout reports the blocks it actually produced (${label})`)
    ok(flags.length === D.classes.length, `JS: no row is lost by sorting ${label}`)
  }
  ok(seen.frame === 2, 'JS: frame separates the ledger completely')
  ok(seen.holder > 2 && seen.ground > 2, 'JS: holder and ground break the separation')
  ok(seen.holder === seen.ground, 'JS: holder and ground are the same property in this material')

  // sorting must not invent or drop a sizeless row
  const none = await page.locator('#ledger-body .nonum').count()
  ok(none === D.countability.unframed, 'JS: the sizeless rows survive every sort')

  await ctx.close()
}

await browser.close()

console.log(`${n} checks · ${n - fails.length} pass · ${fails.length} fail`)
for (const f of fails) console.log('  FAIL:', f)
process.exit(fails.length ? 1 : 0)
