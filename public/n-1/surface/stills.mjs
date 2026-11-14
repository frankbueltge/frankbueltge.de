// surface/stills.mjs — a still for every declared work that has none.
//
// The works view shows a picture per work (`still` in margin.json). Until 2026-11-14 a still was
// made by hand on the founder's side, so every work declared after 2026-10-10 showed the striped
// placeholder. This script makes the missing ones from the committed pages: it opens each work's
// own page at 1440 x 900 in a headless browser, finds its first large figure (svg, canvas, figure,
// img) and saves a 16:10 crop around it. A page without such a figure gives the top of the page.
// It then names the still in margin.json. A work that already names a still is never touched, so
// the practice can replace any of these with a picture of its own choosing.
//
//   node surface/stills.mjs            make what is missing
//   node surface/stills.mjs --check    exit 1 when a work has no still (nothing written)
//
// Run by .github/workflows/stills.yml on every push to main; no session has to remember it.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const marginFile = join(root, 'surface', 'margin.json')
const text = readFileSync(marginFile, 'utf8')
const margin = JSON.parse(text)
const missing = margin.works.filter((w) => !w.still)

if (process.argv.includes('--check')) {
  for (const w of missing) console.log(`no still: ${w.title} (${w.href})`)
  process.exit(missing.length ? 1 : 0)
}
if (!missing.length) {
  console.log('every work has a still')
  process.exit(0)
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.csv': 'text/csv', '.txt': 'text/plain', '.wasm': 'application/wasm' }
const server = createServer((req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (p.endsWith('/')) p += 'index.html'
  const file = join(root, p)
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/`

const { chromium } = createRequire(import.meta.url)('playwright') // require, so NODE_PATH counts
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
let made = 0

for (const w of missing) {
  const slug = w.href.replace(/\/$/, '').split('/').pop()
  const out = `surface/stills/${slug}.png`
  await page.goto(base + w.href, { waitUntil: 'load' })
  await page.waitForTimeout(2500) // canvases draw after load
  // the first figure large enough to be the work's picture, in page coordinates
  const box = await page.evaluate(() => {
    for (const el of document.querySelectorAll('svg, canvas, figure, img')) {
      const r = el.getBoundingClientRect()
      if (r.width >= 400 && r.height >= 140) return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }
    }
    return null
  })
  const full = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }))
  // a 16:10 frame: as wide as the figure (at most the page), centred on it; the page top otherwise
  let cw = Math.min(box ? Math.max(box.w, 720) : 1100, full.w)
  let ch = Math.min(cw / 1.6, full.h)
  cw = ch * 1.6
  let cx = box ? box.x + box.w / 2 - cw / 2 : (full.w - cw) / 2
  let cy = box ? (box.h >= ch ? box.y : box.y + box.h / 2 - ch / 2) : 0
  cx = Math.max(0, Math.min(cx, full.w - cw))
  cy = Math.max(0, Math.min(cy, full.h - ch))
  await page.screenshot({ path: join(root, out), fullPage: true,
    clip: { x: Math.round(cx), y: Math.round(cy), width: Math.round(cw), height: Math.round(ch) } })
  w.still = out
  made++
  console.log(`still made: ${out}${box ? '' : ' (no figure found, top of page)'}`)
}

await browser.close()
server.close()
// margin.json keeps its hand-written layout: only the new `still` lines change
writeFileSync(marginFile, JSON.stringify(margin, null, detectIndent(text)) + '\n')
console.log(`${made} still(s) made`)

function detectIndent(s) {
  const m = s.match(/\n( +|\t)"/)
  return m ? m[1] : 2
}
