// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one floor:
// an honest still frame for a reader with no JavaScript. That floor is a claim, and reading
// source has repeatedly failed to catch what a browser actually does, so it is tested — twice
// over the same file, once with scripting on and once with it off, and in both states the page
// is denied the network, so a page that had quietly started fetching something fails here
// rather than in the world.
//
// The checks that matter most are the last two groups. This page's claim is that the ledger's
// verdicts are the intersection over six readings, and that the departure of 157 entries is
// invisible to all of them. So the ledger is re-derived from the DOM at every reading, and the
// marks of both nights are counted in the DOM and compared with the committed numbers.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-7/verify.mjs
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

const ORDER = D.readings.map(r => r.id)
const DEP = D.departure
const thin = v => v.toLocaleString('en-GB').replace(/,/g, ' ')

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
  ok((await page.title()).includes('what the record cannot say it lost'),
    'no-JS: the title is served')

  // the ledger is served whole, with every cell of every reading
  const rows = await page.locator('#ledger tbody tr').count()
  ok(rows === D.statements.length,
    `no-JS: the ledger serves ${D.statements.length} rows (saw ${rows})`)
  const cells = await page.locator('#ledger tbody td.mk').count()
  ok(cells === D.statements.length * ORDER.length,
    `no-JS: every statement is served under every reading (saw ${cells})`)
  for (const s of D.statements) {
    const v = await page.locator(`#ledger tbody tr[data-verdict="${s.verdict}"]`).count()
    ok(v > 0, `no-JS: a ${s.verdict} verdict is served`)
  }

  // the still cohort figure stands at last night's state and the count is drawn, not promised
  const dots = await page.locator('#cohort .dot').count()
  ok(dots === DEP.was, `no-JS: the cohort figure is drawn at ${DEP.was} marks (saw ${dots})`)
  const btn = await page.locator('#nightbtn').innerText()
  ok(btn.includes(thin(DEP.was)) && btn.includes(D.prior_date),
    'no-JS: the figure says which night it stands at')

  // the controls are present and dead
  await page.locator('.rbtn[data-reading="R3"]').click({ force: true }).catch(() => {})
  await page.locator('#nightbtn').click({ force: true }).catch(() => {})
  ok(await page.locator('#cohort .dot').count() === dots,
    'no-JS: the figure does not move when a dead control is clicked')

  // every number the controls would reveal is in the served text
  const body = await page.locator('body').innerText()
  for (const d of D.directions) {
    const shown = d.kind === 'rate'
      ? (100 * d.now).toFixed(2).replace('.', '.')
      : thin(d.now)
    ok(body.includes(shown), `no-JS: the served page states ${d.id} tonight (${shown})`)
    const before = d.kind === 'rate' ? (100 * d.was).toFixed(2) : thin(d.was)
    ok(body.includes(before), `no-JS: the served page states ${d.id} last night (${before})`)
  }
  for (const v of [DEP.gone, DEP.was, DEP.now, D.arxiv.now_entries, D.arxiv.was_entries]) {
    ok(body.includes(thin(v)), `no-JS: the served page states ${v}`)
  }
  ok(/Libkin/.test(body) && /PODS/.test(body), 'no-JS: the outside source is named in the text')
  ok(/Refutation condition/.test(body), 'no-JS: the refutation condition is served')

  await ctx.close()
}

// ---- 2. with JavaScript: the ledger is the intersection, and the marks are the record ----
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)
  await page.waitForSelector('#ledger tbody tr')

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)

  // (a) every reading, one at a time: the verdicts shown are that reading's own
  for (const id of ORDER) {
    await page.locator(`.rbtn[data-reading="${id}"]`).click()
    await page.waitForSelector(`.rbtn[data-reading="${id}"][aria-pressed="true"]`)
    const shown = await page.locator('#ledger tbody .verdict .vword').evaluateAll(
      els => els.map(t => t.textContent.trim()))
    const want = D.statements.map(s => {
      const c = s.cells[id]
      return c.v === null ? 'not evaluable' : (c.v ? 'true' : 'false')
    })
    ok(JSON.stringify(shown) === JSON.stringify(want),
      `JS: at ${id} the ledger shows that reading's verdicts`)
    const lit = await page.locator('#ledger tbody td.mk.lit').count()
    ok(lit === D.statements.length, `JS: at ${id} exactly its own column is lit (saw ${lit})`)
    const pressed = await page.locator('.rbtn[aria-pressed="true"]').count()
    ok(pressed === 1, `JS: exactly one reading is pressed at ${id} (saw ${pressed})`)
  }

  // (b) all readings at once: the last column is the intersection
  await page.locator('#allbtn').click()
  await page.waitForSelector('#allbtn[aria-pressed="true"]')
  const verdicts = await page.locator('#ledger tbody .verdict .vword').evaluateAll(
    els => els.map(t => t.textContent.trim()))
  ok(JSON.stringify(verdicts) === JSON.stringify(D.statements.map(s => s.verdict)),
    'JS: with every reading at once the ledger shows the certain answers')
  const counts = verdicts.reduce((a, v) => (a[v] = (a[v] || 0) + 1, a), {})
  for (const k of ['certain', 'contingent', 'refuted', 'blind']) {
    ok((counts[k] || 0) === D.verdicts[k],
      `JS: ${D.verdicts[k]} statements are ${k} in the DOM (saw ${counts[k] || 0})`)
  }
  ok((counts.blind || 0) === 1, 'JS: exactly one statement no reading reaches')
  const reaches = await page.locator('#ledger tbody .reach').evaluateAll(
    els => els.map(t => t.textContent.trim()))
  ok(JSON.stringify(reaches) === JSON.stringify(
    D.statements.map(s => `${s.evaluable} of ${ORDER.length} readings reach it`)),
  'JS: with every reading at once each row says how many readings reach it')
  await page.locator('.rbtn[data-reading="R6"]').click()
  const why = await page.locator('#ledger tbody tr[data-verdict="blind"] .reach').innerText()
  ok(why.length > 0 && !/readings reach it/.test(why),
    'JS: at a single reading the row says why that reading cannot evaluate it')
  await page.locator('#allbtn').click()

  // (c) the two nights: the marks are the record, and the departure is drawn as unseen
  const was = await page.locator('#cohort .dot').count()
  ok(was === DEP.was, `JS: last night draws ${DEP.was} marks (saw ${was})`)
  await page.locator('#nightbtn').click()
  await page.waitForSelector('#nightbtn[aria-pressed="true"]')
  const live = await page.locator('#cohort .dot:not(.out)').count()
  const gone = await page.locator('#cohort .dot.out').count()
  const arrived = await page.locator('#cohort .dot.in').count()
  // The record gives net movement per cohort, not departures: the two shrinking cohorts lost
  // 160 and the growing one gained 3, which is the published net of 157. The figure draws all
  // three, because drawing only the net would claim an identity the record does not carry.
  const shrank = ['arxiv', 'doi', 'other']
    .map(h => (DEP.hosts_now[h] || 0) - (DEP.hosts_was[h] || 0))
    .filter(d => d < 0).reduce((a, d) => a - d, 0)
  const grew = ['arxiv', 'doi', 'other']
    .map(h => (DEP.hosts_now[h] || 0) - (DEP.hosts_was[h] || 0))
    .filter(d => d > 0).reduce((a, d) => a + d, 0)
  ok(live === DEP.now, `JS: tonight draws ${DEP.now} live marks (saw ${live})`)
  ok(gone === shrank, `JS: ${shrank} marks are drawn as gone (saw ${gone})`)
  ok(arrived === grew, `JS: ${grew} marks are drawn as new (saw ${arrived})`)
  ok(gone - arrived === DEP.gone, `JS: the net drawn is the published ${DEP.gone}`)
  ok(live + gone - arrived === DEP.was, 'JS: the two nights reconcile to last night\'s register')
  const arx = await page.locator('#cohort .dot.a').count()
  ok(arx === DEP.hosts_now.arxiv,
    `JS: tonight's arXiv cohort is ${DEP.hosts_now.arxiv} marks (saw ${arx})`)
  const readout = await page.locator('#cohort-readout').innerText()
  ok(readout.includes(String(DEP.gone)) && /no reading/i.test(readout),
    'JS: the readout says the gone marks are counted by no reading')
  ok(readout.includes(String(shrank)) && readout.includes(String(grew)),
    'JS: the readout states the loss and the gain separately, not only the net')

  // (d) and back
  await page.locator('#nightbtn').click()
  ok(await page.locator('#cohort .dot').count() === DEP.was, 'JS: the toggle returns')
  ok(await page.locator('#cohort .dot.out').count() === 0,
    'JS: last night has nothing greyed out')
  ok(await page.locator('#cohort .dot.in').count() === 0,
    'JS: last night has no arrivals drawn')

  await ctx.close()
}

await browser.close()

console.log(`${n} checks · ${n - fails.length} pass · ${fails.length} fail`)
for (const f of fails) console.log('  FAIL:', f)
process.exit(fails.length ? 1 : 0)
