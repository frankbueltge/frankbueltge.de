// verify.mjs — the page must work with the script and be complete without it.
//
// Reading the source of a page has repeatedly failed to catch what a browser actually
// does, so the claims this page makes about itself are driven here instead: the same
// file is opened twice, once with scripting on and once with it off, and in both states
// every request to the network is refused, so a page that had quietly acquired a
// dependency fails here rather than in the world.
//
// This page's claim is that the verdict on whether this practice obeyed its own
// two-minute rule is the reader's to set. So the hand is used rather than described:
// every language the standard publishes, both units, both readings of what a session's
// record is, and the free slider are driven through the controls, and each time the
// readout and every row of the ledger are read back out of the DOM and compared with the
// measurements this repository committed.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-11/verify.mjs
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
const CAP = D.cap_seconds

let pass = 0, fail = 0
const failures = []
function ok (name, cond, detail = '') {
  if (cond) pass++
  else { fail++; failures.push(`${name} — ${detail}`); console.log(`  FAIL ${name} — ${detail}`) }
}
function eq (name, got, want) { ok(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`) }

const mmss = s => {
  const m = Math.floor(Math.round(s) / 60), r = Math.round(s) % 60
  return m + ':' + (r < 10 ? '0' : '') + r
}
const rateFor = (code, unit) => code === 'mean' ? D.means[unit] : D.rates[code][unit]
const itemsFor = kind => kind === 'doc' ? D.records : D.sessions

async function open (browser, javaScriptEnabled) {
  const ctx = await browser.newContext({ javaScriptEnabled })
  let blocked = 0
  await ctx.route('**/*', route => {
    const u = route.request().url()
    if (u.startsWith('file://')) return route.continue()
    blocked++
    return route.abort()
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto(URL_)
  return { ctx, page, errors, blocked: () => blocked }
}

const main = async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  })

  // ------------------------------------------------------------ scripting ON
  {
    const { ctx, page, errors, blocked } = await open(browser, true)
    eq('no page error on load', errors.length, 0)

    for (const kind of ['doc', 'session']) {
      await page.click(`label:has(input[name=kind][value="${kind}"])`)
      const items = itemsFor(kind)
      for (const unit of ['words', 'characters']) {
        await page.click(`label:has(input[name=unit][value="${unit}"])`)
        for (const code of ['mean', ...Object.keys(D.rates)]) {
          await page.click(`label:has(input[name=lang][value="${code}"])`)
          const rate = rateFor(code, unit)

          const slider = await page.inputValue('#rate')
          eq(`slider follows ${code}/${unit}`, Number(slider), rate)

          const want = items.filter(x => (x[unit] / rate * 60) > CAP).length
          const readout = await page.textContent('#readout')
          ok(`readout names the rate (${kind}/${unit}/${code})`,
            readout.includes(`${rate} ${unit}/min`), readout)
          ok(`readout names the budget (${kind}/${unit}/${code})`,
            readout.includes(`buys ${Math.round(rate * 2)} ${unit}`), readout)
          ok(`readout names the verdict (${kind}/${unit}/${code})`,
            readout.includes(`${want} of ${items.length} records over`), readout)

          const rows = await page.$$eval(
            `#wrap-${kind} table tbody tr`,
            trs => trs.map(tr => ({
              id: tr.getAttribute('data-id'),
              time: tr.querySelector('td.t').textContent,
              cls: tr.querySelector('td.t').className,
              need: tr.querySelector('td.r').textContent,
            })))
          eq(`ledger length (${kind}/${unit}/${code})`, rows.length, items.length)
          let bad = 0, wrongClass = 0, wrongNeed = 0
          for (const r of rows) {
            const x = items.find(y => y.id === r.id)
            const sec = x[unit] / rate * 60
            if (r.time !== mmss(sec)) bad++
            if (r.cls.includes('over') !== (sec > CAP)) wrongClass++
            if (Number(r.need) !== Math.round(x[unit] / 2)) wrongNeed++
          }
          eq(`every time is right (${kind}/${unit}/${code})`, bad, 0)
          eq(`every verdict colour is right (${kind}/${unit}/${code})`, wrongClass, 0)
          eq(`every required rate is right (${kind}/${unit}/${code})`, wrongNeed, 0)
          eq(`only one ledger is shown (${kind}/${unit}/${code})`,
            await page.isVisible(`#wrap-${kind === 'doc' ? 'session' : 'doc'}`), false)
        }
      }
    }

    // the free hand: rates nobody has published
    await page.click('label:has(input[name=kind][value="doc"])')
    await page.click('label:has(input[name=unit][value="words"])')
    for (const r of [100, 192, 506, 1269, 1500]) {
      await page.fill('#rate', String(r))
      await page.dispatchEvent('#rate', 'input')
      const want = D.records.filter(x => (x.words / r * 60) > CAP).length
      const readout = await page.textContent('#readout')
      ok(`free rate ${r}`, readout.includes(`${want} of ${D.records.length} records over`), readout)
    }
    // the page's own claim: at the rate the median record needs, half of them comply
    await page.fill('#rate', String(Math.round(D.headline.median_required)))
    await page.dispatchEvent('#rate', 'input')
    const half = D.records.filter(
      x => (x.words / Math.round(D.headline.median_required) * 60) > CAP).length
    ok('the median required rate leaves about half over',
      Math.abs(half - D.records.length / 2) <= 1, `${half} of ${D.records.length}`)

    eq('nothing reached the network with scripting on', blocked(), 0)
    eq('still no page error after driving every control', errors.length, 0)
    await ctx.close()
  }

  // ----------------------------------------------------------- scripting OFF
  {
    const { ctx, page, blocked } = await open(browser, false)
    const text = await page.textContent('body')
    ok('the noscript block is shown', text.includes('Scripting is off'), 'not rendered')
    for (const kind of ['doc', 'session']) {
      const rows = await page.$$eval(`#wrap-${kind} table tbody tr`, t => t.length)
      eq(`ledger ${kind} is complete without scripting`, rows, itemsFor(kind).length)
    }
    const shown = await page.$$eval(
      '#wrap-doc table tbody td.t', tds => tds.map(td => td.textContent))
    let bad = 0
    for (let i = 0; i < D.records.length; i++) {
      const sec = D.records[i].words / D.means.words * 60
      if (shown[i] !== mmss(sec)) bad++
    }
    eq('the served times are the all-language-mean times', bad, 0)
    for (const n of [D.headline.n_records, D.headline.n_any_in, D.headline.n_sessions]) {
      ok(`the served text carries ${n}`, text.includes(String(n)), 'missing')
    }
    ok('the verdict grid is in the served text',
      text.includes('Records over two minutes'), 'missing')
    eq('nothing reached the network with scripting off', blocked(), 0)
    await ctx.close()
  }

  await browser.close()
  console.log(`\n${pass} checks passed in a real browser, ${fail} failed`)
  if (fail) { failures.forEach(f => console.log('  -', f)); process.exit(1) }
}

main().catch(e => { console.error(e); process.exit(1) })
