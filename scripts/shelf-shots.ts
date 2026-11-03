// Takes a screenshot of every piece of the selected-works pool whose maker committed no still, from
// the built site, and writes it to public/shelf/ beside the maker's crops (2026-10-23). The edition
// draws its eight cards at random from the whole pool (src/lib/ops/shelf-pool.ts), and a card shows
// a picture of its piece: the maker's own still where there is one (npm run shelf:stills), else
// the piece's own first screen as this site serves it, taken here. Nothing is drawn for a card.
//
//   npm run build && npm run shelf:shots            # shots for pieces that have none yet
//   npm run shelf:shots -- --all                    # retake every shot
//
// Since 2026-11-03 every shot is written twice, in the page's two duotones (src/lib/ops/duotone.ts,
// scripts/shelf-duotone.ts): <key>.webp for the light theme, <key>.dark.webp for the dark one. A
// shot taken before then has no dark file; it is toned from the committed picture without being
// retaken, so the shelf keeps the pictures it had.
//
// The built site in dist/ is served on a local port; the browser is Chromium through playwright-core
// (CHROMIUM_PATH, else the cloud image's /opt/pw-browsers/chromium, else playwright's own). A page
// that reads live data shows what it shows on load; one that will not load in time is left without
// a shot and keeps its plate. Run npm run shelf:stills afterwards only to crop a maker's new still;
// it keeps these shots.

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { readPoolEntries } from '../src/lib/ops/shelf-pool.ts'
import { makerStill, shelfCrop, STILL_FRAME } from '../src/lib/ops/shelf-stills.ts'
import { writeDuotones } from './shelf-duotone.ts'

const root = process.cwd()
const dist = join(root, 'dist')
const all = process.argv.includes('--all')
if (!existsSync(join(dist, 'index.html'))) {
  console.error('shelf-shots: no built site in dist/ (run npm run build first); no shot was taken')
  process.exit(1)
}
const sharp = (await import('sharp').catch(() => null))?.default
const pw = await import('playwright-core').catch(() => null)
if (!sharp || !pw) {
  console.error('shelf-shots: sharp or playwright-core is not installed (run npm ci); no shot was taken')
  process.exit(1)
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.csv': 'text/csv',
  '.geojson': 'application/json',
}
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  let file = join(dist, path)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok))
const port = (server.address() as { port: number }).port

const executablePath = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].find((p) => p && existsSync(p))
const browser = await pw.chromium.launch(executablePath ? { executablePath } : {})
// the shot is taken at a desk's width, at twice the card's resolution, and scaled to the frame
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })

let taken = 0
let toned = 0
for (const { pick, card } of readPoolEntries(root)) {
  if (makerStill(pick.work, root)) continue
  const crop = shelfCrop(pick.work)
  if (!all && existsSync(join(root, crop.file))) {
    // a shot from before the duotones: tone the committed picture rather than retake it
    if (!existsSync(join(root, crop.darkFile))) {
      await writeDuotones(sharp, readFileSync(join(root, crop.file)), crop, root)
      toned++
      console.log(`shelf-shots: ${crop.file} toned in both themes`)
    }
    continue
  }
  const page = await context.newPage()
  try {
    await page.goto(`http://127.0.0.1:${port}${card.href}`, { waitUntil: 'load', timeout: 20000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(1500)
    const png = await page.screenshot({ type: 'png' })
    const cut = await sharp(png).resize(STILL_FRAME.width, STILL_FRAME.height, { fit: 'cover', position: 'top' }).png().toBuffer()
    await writeDuotones(sharp, cut, crop, root)
    taken++
    console.log(`shelf-shots: ${crop.file} ← ${card.href}`)
  } catch (e) {
    console.warn(`shelf-shots: no shot of ${card.href} — ${(e as Error).message.split('\n')[0]}`)
  } finally {
    await page.close()
  }
}
await browser.close()
server.close()
console.log(`shelf-shots: ${taken} shot(s) taken, ${toned} earlier shot(s) toned`)
