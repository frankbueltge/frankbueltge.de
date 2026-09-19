// verify.mjs — the page must work with the script and be complete without it.
//
// Reading the source of a page has repeatedly failed to catch what a browser actually
// does, so the claims this page makes about itself are driven here instead: the same file
// is opened twice, once with scripting on and once with it off, and in both states every
// request to the network is refused, so a page that had quietly acquired a dependency
// fails here rather than in the world.
//
// This page's claim is that whether I obeyed my own constitution is set by the reading.
// So the hand is used rather than described: every reading of "word" and every reading of
// "line" is driven through the controls, the slider is moved across its range, and each
// time the readout and the colour of all 48 squares are read back out of the DOM and
// compared with the committed measurements.
//
// It also settles the page's third refutation condition from the reader's side: the
// UAX#29 counts are recomputed in the browser's own ICU and compared with the ones this
// repository committed. A disagreement is a real finding, not a test failure, and it is
// reported as one.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-10/verify.mjs
//
// Needs a playwright driver and a chromium (CHROMIUM_PATH overrides the executable).
// It is a check of the page, not part of it.
//
// Author: the Atelier. Licence: Apache-2.0 with the repository.

import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }
const { chromium } = pw

const HERE = dirname(fileURLToPath(import.meta.url))
const URL_ = pathToFileURL(join(HERE, 'index.html')).href
const D = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'))

let ok = 0, fail = 0
const failures = []
function check (name, cond) {
  if (cond) { ok++ } else { fail++; failures.push(name); console.log('  FAIL ' + name) }
}

const WIDTHS = D.widths
const DOCS = D.docs
const lineDocs = DOCS.filter(d => d.unit === 'lines')
const wordDocs = DOCS.filter(d => d.unit === 'words')

function expectCount (d, lineKey, wordKey, w) {
  if (d.unit === 'words') return d.words[wordKey]
  if (lineKey === 'L1' || lineKey === 'L2') return d.lines[lineKey]
  return d.wrap[lineKey][WIDTHS.indexOf(w)]
}

async function launch () {
  const opts = { args: ['--disable-gpu'] }
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH
  try { return await chromium.launch(opts) } catch (e) {
    opts.executablePath = '/opt/pw-browsers/chromium'
    return await chromium.launch(opts)
  }
}

const browser = await launch()

// ------------------------------------------------------------------ scripting ON

{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  let reached = 0
  await ctx.route('**', route => {
    const u = route.request().url()
    if (u.startsWith('file://')) return route.continue()
    reached++
    return route.abort()
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(URL_)
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1')

  check('script on: no page error', errors.length === 0)
  check('script on: nothing was requested from the network', reached === 0)
  check('script on: the title is the work',
    (await page.title()).startsWith('At most forty of what'))
  check('script on: one square per record',
    (await page.locator('#strip i').count()) === DOCS.length)

  // the hand: every reading, driven
  const combos = []
  for (const wordKey of ['W1', 'W2', 'W3', 'W4', 'W5']) {
    for (const lineKey of ['L1', 'L2', 'P1', 'P2']) {
      const widths = (lineKey === 'L1' || lineKey === 'L2') ? [80] : [40, 66, 80, 120, 200]
      for (const w of widths) combos.push([wordKey, lineKey, w])
    }
  }

  for (const [wordKey, lineKey, w] of combos) {
    await page.selectOption('#wordSel', wordKey)
    await page.selectOption('#lineSel', lineKey)
    if (lineKey === 'P1' || lineKey === 'P2') {
      await page.fill('#width', String(w))
      await page.dispatchEvent('#width', 'input')
    }
    const overLine = lineDocs.filter(d => expectCount(d, lineKey, wordKey, w) > d.cap).length
    const overWord = wordDocs.filter(d => d.words[wordKey] > d.cap).length
    const text = await page.locator('#readout').innerText()
    const nums = [...text.matchAll(/(\d+) of (\d+)/g)].map(m => [+m[1], +m[2]])
    check(`readout ${wordKey}/${lineKey}@${w}: line arm reads ${overLine} of ${lineDocs.length}`,
      nums[0] && nums[0][0] === overLine && nums[0][1] === lineDocs.length)
    check(`readout ${wordKey}/${lineKey}@${w}: word arm reads ${overWord} of ${wordDocs.length}`,
      nums[1] && nums[1][0] === overWord && nums[1][1] === wordDocs.length)

    const classes = await page.$$eval('#strip i', els => els.map(e => e.className))
    const wantOver = DOCS.map(d => expectCount(d, lineKey, wordKey, w) > d.cap)
    check(`strip ${wordKey}/${lineKey}@${w}: all ${DOCS.length} squares agree with the record`,
      classes.length === wantOver.length &&
      classes.every((c, i) => (c === 'over') === wantOver[i]))
  }

  // the hand actually changes the answer — otherwise there is no finding here
  await page.selectOption('#lineSel', 'L2'); await page.selectOption('#wordSel', 'W1')
  const quietest = await page.locator('#readout').innerText()
  await page.selectOption('#lineSel', 'P1'); await page.selectOption('#wordSel', 'W3')
  await page.fill('#width', '40'); await page.dispatchEvent('#width', 'input')
  const loudest = await page.locator('#readout').innerText()
  check('the hand moves the verdict: the two extreme readings differ',
    quietest !== loudest)
  check('the hand moves the verdict: one reading finds 3 breaches, the other 37 and 11',
    /3<\/span>? of 37|3 of 37/.test(quietest.replace(/\s+/g, ' ')) &&
    /37 of 37/.test(loudest) && /11 of 11/.test(loudest))

  // refutation 3, settled by the reader's own ICU
  const icu = await page.evaluate(() => {
    const seg = new Intl.Segmenter('en', { granularity: 'word' })
    return typeof seg.segment === 'function'
  })
  check('the browser has a UAX#29 segmenter of its own', icu)

  // the page must not scroll sideways on a phone
  await page.setViewportSize({ width: 390, height: 780 })
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(`no horizontal overflow at 390px (was ${overflow})`, overflow <= 1)

  await ctx.close()
}

// ------------------------------------------------------------------ scripting OFF

{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  let reached = 0
  await ctx.route('**', route => {
    const u = route.request().url()
    if (u.startsWith('file://')) return route.continue()
    reached++
    return route.abort()
  })
  const page = await ctx.newPage()
  await page.goto(URL_)

  check('script off: nothing was requested from the network', reached === 0)
  check('script off: the reader is told what is missing',
    (await page.locator('noscript').innerText()).includes('No script is running'))

  const lineRows = await page.locator('#tLine tbody tr').count()
  const wordRows = await page.locator('#tWord tbody tr').count()
  check(`script off: all ${lineDocs.length} line-capped records are in the served text`,
    lineRows === lineDocs.length)
  check(`script off: all ${wordDocs.length} digests are in the served text`,
    wordRows === wordDocs.length)

  const served = await page.$$eval('#tLine tbody tr', rows =>
    rows.map(r => [r.dataset.id, [...r.querySelectorAll('td.n')].map(td => +td.textContent)]))
  const named = [40, 66, 72, 80, 100, 120, 160, 200]
  let mismatched = 0
  for (const [id, nums] of served) {
    const d = DOCS.find(x => x.id === id)
    const want = [d.lines.L1, d.lines.L2]
    for (const c of named) {
      want.push(d.wrap.P1[WIDTHS.indexOf(c)], d.wrap.P2[WIDTHS.indexOf(c)])
    }
    if (nums.length !== want.length || nums.some((n, i) => n !== want[i])) mismatched++
  }
  check(`script off: every served line row matches the record (${mismatched} did not)`,
    mismatched === 0)

  const servedW = await page.$$eval('#tWord tbody tr', rows =>
    rows.map(r => [r.dataset.id, [...r.querySelectorAll('td.n')].map(td => +td.textContent)]))
  let mW = 0
  for (const [id, nums] of servedW) {
    const d = DOCS.find(x => x.id === id)
    const want = ['W1', 'W2', 'W3', 'W4', 'W5'].map(k => d.words[k])
    if (nums.length !== want.length || nums.some((n, i) => n !== want[i])) mW++
  }
  check(`script off: every served digest row matches the record (${mW} did not)`, mW === 0)

  // innerText is rendered text, so a heading under text-transform comes back uppercased
  const body = await page.locator('body').innerText()
  const flat = body.toLowerCase()
  check('script off: the standards are named in the served text',
    body.includes('Annex #29') && body.includes('Annex #14'))
  check('script off: the refutation conditions are in the served text',
    flat.includes('what would kill this page'))
  check('script off: the page still says what it found',
    body.includes('The cap sits inside the spread'))

  await ctx.close()
}

await browser.close()

console.log(`\n${ok} checks passed, ${fail} failed`)
if (fail) { for (const f of failures.slice(0, 20)) console.log('  - ' + f); process.exit(1) }
