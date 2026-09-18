// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one floor:
// an honest still frame for a reader with no JavaScript. That floor is a claim, and reading
// source has repeatedly failed to catch what a browser actually does, so it is tested — twice
// over the same file, once with scripting on and once with it off, and in both states the page
// is denied the network, so a page that had quietly started fetching something fails here
// rather than in the world.
//
// This page's claim is that the size of the unseen class is set by the schedule of the looking
// and by a reading the record does not supply. So the hand is actually used: every choice of
// nights and every reading is driven through the buttons, and each time the live table and the
// bar geometry are read back out of the DOM and compared with the committed grid.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-9/verify.mjs
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

const NIGHTS = D.nights
const FEEDS = ['atlas', 'papers', 'datasets']
const READINGS = ['all', 'birth', 'edge']
const thin = v => v.toLocaleString('en-GB').replace(/,/g, '\u202f')
const near = (a, b, eps = 0.02) => Math.abs(a - b) <= eps
const grid = (feed, nights) =>
  D.grid[feed].find(g => g.nights.length === nights.length &&
                         g.nights.every((x, i) => x === nights[i]))

async function denyNetwork (page, outbound) {
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
}

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: the whole grid is served as text ---------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `no-JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok((await page.title()).includes('The night nobody looked'), 'no-JS: the title is served')

  const body = await page.locator('body').innerText()

  // every cell of the grid: 3 feeds x 7 choices of nights x 3 readings
  const rows = await page.locator('tr[data-feed][data-nights]').count()
  ok(rows === 21, `no-JS: the grid table serves 21 rows (saw ${rows})`)
  for (const feed of FEEDS) {
    for (const g of D.grid[feed]) {
      const label = g.nights.map(x => x.slice(5)).join('+')
      const tds = await page.locator(`tr[data-feed="${feed}"][data-nights="${label}"] td`)
        .allInnerTexts()
      // td order: nights, seen, Q2, then (Q1, f0) per reading
      ok(tds[1].replace(/\s/g, '') === String(g.s_obs),
        `no-JS: ${feed} ${label} serves ${g.s_obs} seen (saw ${tds[1]})`)
      ok(tds[2].replace(/\s/g, '') === String(g.q2),
        `no-JS: ${feed} ${label} serves ${g.q2} doubletons`)
      READINGS.forEach((r, i) => {
        ok(tds[3 + i * 2].replace(/\s/g, '') === String(g.readings[r].q1),
          `no-JS: ${feed} ${label} ${r} serves Q1 = ${g.readings[r].q1}`)
        ok(tds[4 + i * 2].trim() === g.readings[r].f0.dec,
          `no-JS: ${feed} ${label} ${r} serves ${g.readings[r].f0.dec}`)
      })
    }
  }

  // the capture histories and the load-bearing numbers of the other sections
  for (const [pat, count] of Object.entries(D.patterns.papers)) {
    ok(body.includes(pat) && body.includes(thin(count)),
      `no-JS: the served page states pattern ${pat} (${count})`)
  }
  for (const v of [D.membership.papers.left, D.membership.papers.arrived,
    D.membership.papers.gross, D.repair.records_compared, D.repair.changed,
    D.counts.papers['2026-09-14'], D.counts.papers['2026-09-18'],
    D.absent_on_16.papers, D.returned.papers]) {
    ok(body.includes(thin(v)), `no-JS: the served page states ${thin(v)}`)
  }
  for (const a of D.arxiv_series) {
    ok(body.includes(a.share_pct), `no-JS: the share of ${a.night} is served`)
  }
  for (const d of D.repair.detail) {
    ok(body.includes(d.k), `no-JS: the record ${d.k} that changed inside is named`)
  }
  ok(/Moss/.test(body) && /2507\.14638/.test(body), 'no-JS: the outside source is named')
  ok(/2026-09-17/.test(body), 'no-JS: the night nobody looked is named')
  ok(/Date the entry/.test(body), 'no-JS: the ask is served')

  // the hand is hidden, and its caption says so
  ok(!(await page.locator('.hand').isVisible()), 'no-JS: the interactive box is not shown')
  ok(await page.locator('.still').isVisible(), 'no-JS: the still caption is shown')
  await ctx.close()
}

// ---- 2. with JavaScript: the hand is driven through every state ------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)
  await page.waitForFunction(() => document.querySelectorAll('#live tr').length > 0)

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok(await page.locator('.hand').isVisible(), 'JS: the interactive box is shown')

  const pressed = async () => {
    const out = []
    for (const b of await page.locator('.nbtn').all()) {
      if (await b.getAttribute('aria-pressed') === 'true') out.push(await b.getAttribute('data-night'))
    }
    return out
  }
  ok((await pressed()).join() === NIGHTS.join(), 'JS: all three nights are chosen to begin with')

  async function readLive () {
    const out = {}
    for (const tr of await page.locator('#live tr').all()) {
      const key = (await tr.locator('th').innerText()).trim()
      const tds = await tr.locator('td').allInnerTexts()
      const w = await tr.locator('.bar').getAttribute('data-width')
      out[key] = { s: tds[0].trim(), q1: tds[1].trim(), q2: tds[2].trim(), f0: tds[3].trim(),
        cov: tds[4].trim(), width: parseFloat(w) }
    }
    return out
  }

  async function setNights (want) {
    for (const b of await page.locator('.nbtn').all()) {
      const nt = await b.getAttribute('data-night')
      const on = await b.getAttribute('aria-pressed') === 'true'
      if (on !== want.includes(nt)) await b.click()
    }
  }

  // every choice of nights x every reading, driven through the buttons
  const choices = [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]]
  for (const c of choices) {
    const want = c.map(i => NIGHTS[i])
    await setNights(want)
    for (const r of READINGS) {
      await page.locator(`.rbtn[data-reading="${r}"]`).click()
      const live = await readLive()
      for (const feed of FEEDS) {
        const g = grid(feed, want)
        const row = live[feed]
        ok(row !== undefined, `JS: ${feed} has a row for ${want.join('+')}`)
        if (!row) continue
        ok(row.s.replace(/\s/g, '') === String(g.s_obs),
          `JS: ${feed} ${want.join('+')} ${r} shows ${g.s_obs} seen (saw ${row.s})`)
        ok(row.q1.replace(/\s/g, '') === String(g.readings[r].q1),
          `JS: ${feed} ${want.join('+')} ${r} shows Q1 = ${g.readings[r].q1}`)
        ok(row.q2.replace(/\s/g, '') === String(g.q2),
          `JS: ${feed} ${want.join('+')} ${r} shows Q2 = ${g.q2}`)
        ok(row.f0 === g.readings[r].f0.dec,
          `JS: ${feed} ${want.join('+')} ${r} shows ${g.readings[r].f0.dec} (saw ${row.f0})`)
        ok(row.cov.replace(' %', '') === g.readings[r].coverage_pct,
          `JS: ${feed} ${want.join('+')} ${r} shows coverage ${g.readings[r].coverage_pct}`)
        const f0 = g.readings[r].f0.num / g.readings[r].f0.den
        const wpc = g.s_obs > 0 ? Math.min(100, 100 * f0 / g.s_obs) : 0
        ok(near(row.width, wpc, 0.01),
          `JS: ${feed} ${want.join('+')} ${r} draws the bar at ${wpc.toFixed(3)}%`)
      }
      // the reading's own gloss is the one on show
      const live2 = await page.locator('.rgloss.live').count()
      ok(live2 === 1, `JS: exactly one reading is explained (${want.join('+')}, ${r})`)
      const gl = await page.locator('.rgloss.live').getAttribute('data-reading')
      ok(gl === r, `JS: the explanation on show is ${r}`)
    }
  }

  // one look answers zero, and says why
  await setNights([NIGHTS[1]])
  const one = await readLive()
  ok(one.papers.f0 === '0.00', 'JS: one look answers nothing missing')
  const v1 = await page.locator('#verdict').innerText()
  ok(/single snapshot cannot be asked/.test(v1), 'JS: and the page says why')

  // no look at all
  await setNights([])
  const empty = await page.locator('#live').innerText()
  ok(/No look at all/.test(empty), 'JS: with no night chosen the table says so')

  // back to all three: the headline of the prose must be what the hand shows
  await setNights(NIGHTS)
  await page.locator('.rbtn[data-reading="all"]').click()
  const back = await readLive()
  const g3 = grid('papers', NIGHTS)
  ok(back.papers.f0 === g3.readings.all.f0.dec, 'JS: the hand returns to the printed figure')
  ok(back.atlas.f0 === '0.00' && back.datasets.f0 === '0.00',
    'JS: the two unmoving feeds answer nothing missing whatever the hand does')
  const v3 = await page.locator('#verdict').innerText()
  ok(v3.includes(g3.readings.all.f0.dec), 'JS: the verdict line carries the figure')
  await ctx.close()
}

await browser.close()

console.log(`${n} checks in a real browser, ${fails.length} failed`)
for (const f of fails.slice(0, 40)) console.log('  ✗', f)
process.exit(fails.length ? 1 : 0)
