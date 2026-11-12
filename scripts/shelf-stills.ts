// Cuts each still on the selected-works shelf to the shelf's frame and writes it to public/shelf/:
// the picks of src/config/selected-works.ts and, since 2026-10-22, every piece of the pool the
// edition draws its eight cards from (src/lib/ops/shelf-pool.ts). A pool piece without a crop shows
// a plate until this runs again. Run after changing a pick, or when new works have landed:
//
//   npm run shelf:stills
//
// The picture is always the maker's own (src/lib/ops/shelf-stills.ts names whose): a Studio work's
// full-page screenshot, or the still n-1 committed for a work. This script only crops it to the
// card's 16 : 10 — centred across, and as far down as the pick's `focus` says — scales it to the
// frame and writes it as WebP, so the entrance loads tens of kilobytes instead of a screenshot of
// a whole page. Crops no piece uses any more are deleted, so the folder holds exactly the pool.
// src/lib/ops/selected-works.test.ts fails while a pick's crop is missing or a stray one remains.
//
// Since 2026-11-03 every crop is written twice, in the page's two duotones (src/lib/ops/duotone.ts,
// scripts/shelf-duotone.ts): <key>.webp for the light theme, <key>.dark.webp for the dark one.
//
// The crop is made from the image libvips reads through sharp, which ships with Astro's image
// service; nothing here is fetched.

import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { readPoolEntries } from '../src/lib/ops/shelf-pool.ts'
import { makerStill, shelfCrop, shelfKey, SHELF_STILL_DIR, SHELF_STILL_SOURCES, STILL_FRAME } from '../src/lib/ops/shelf-stills.ts'
import { writeDuotones } from './shelf-duotone.ts'

const root = process.cwd()
// Since 2026-11-13 the workflow shelf-pictures.yml runs this after every mirror, so a crop is cut only
// when it is missing or its source has changed (SHELF_STILL_SOURCES remembers the source by its hash).
// A crop from before that record is taken as it stands. `--all` cuts every crop again.
const all = process.argv.includes('--all')
const recordFile = join(root, SHELF_STILL_SOURCES)
const before: Record<string, string> = existsSync(recordFile) ? JSON.parse(readFileSync(recordFile, 'utf8')) : {}
const after: Record<string, string> = {}
let cutCount = 0
let withoutPicture = 0
const sharp = (await import('sharp').catch(() => null))?.default
if (!sharp) {
  console.error('shelf-stills: sharp is not installed (run npm ci); no still was written')
  process.exit(1)
}

const dir = join(root, SHELF_STILL_DIR)
mkdirSync(dir, { recursive: true })
const frame = STILL_FRAME.width / STILL_FRAME.height
const kept = new Set<string>()

for (const { pick } of readPoolEntries(root)) {
  const source = makerStill(pick.work, root)
  // a piece without a still of its maker's keeps the shot of its page (scripts/shelf-shots.ts)
  if (!source) {
    kept.add(shelfCrop(pick.work).file)
    kept.add(shelfCrop(pick.work).darkFile)
    if (!existsSync(join(root, shelfCrop(pick.work).file))) withoutPicture++
    continue
  }
  const crop = shelfCrop(pick.work)
  kept.add(crop.file)
  kept.add(crop.darkFile)
  const key = shelfKey(pick.work)
  const hash = createHash('sha256').update(readFileSync(join(root, source))).digest('hex').slice(0, 16)
  after[key] = hash
  const standing = existsSync(join(root, crop.file)) && existsSync(join(root, crop.darkFile))
  if (!all && standing && (before[key] === undefined || before[key] === hash)) continue
  cutCount++
  const image = sharp(join(root, source))
  const { width = 0, height = 0 } = await image.metadata()
  // the largest 16 : 10 window the picture holds, centred across, placed down it by `focus`
  const w = Math.min(width, Math.round(height * frame))
  const h = Math.min(height, Math.round(w / frame))
  const focus = 'focus' in pick && typeof pick.focus === 'number' ? Math.min(1, Math.max(0, pick.focus)) : 0
  const left = Math.round((width - w) / 2)
  const top = Math.round((height - h) * focus)
  const cut = await image.extract({ left, top, width: w, height: h }).resize(STILL_FRAME.width, STILL_FRAME.height).png().toBuffer()
  await writeDuotones(sharp, cut, crop, root)
  console.log(`shelf-stills: ${crop.file} ← ${source} (${w} × ${h} from ${left}, ${top})`)
}

for (const name of readdirSync(dir)) {
  const file = `${SHELF_STILL_DIR}/${name}`
  if (!kept.has(file) && existsSync(join(root, file))) {
    rmSync(join(root, file))
    console.log(`shelf-stills: removed ${file}, which no piece uses`)
  }
}

const record = `${JSON.stringify(Object.fromEntries(Object.entries(after).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`
if (!existsSync(recordFile) || readFileSync(recordFile, 'utf8') !== record) {
  mkdirSync(dirname(recordFile), { recursive: true })
  writeFileSync(recordFile, record)
}
console.log(`shelf-stills: ${cutCount} crop(s) cut, ${withoutPicture} piece(s) without a picture (npm run shelf:shots takes one of their pages)`)
// for the workflow: whether the site has to be built so that a page can be photographed
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `without_picture=${withoutPicture}\n`)
