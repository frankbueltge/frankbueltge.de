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
// The crop is made from the image libvips reads through sharp, which ships with Astro's image
// service; nothing here is fetched.

import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { readPoolEntries } from '../src/lib/ops/shelf-pool.ts'
import { makerStill, shelfCrop, SHELF_STILL_DIR, STILL_FRAME } from '../src/lib/ops/shelf-stills.ts'

const root = process.cwd()
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
  if (!source) continue
  const crop = shelfCrop(pick.work)
  kept.add(crop.file)
  const image = sharp(join(root, source))
  const { width = 0, height = 0 } = await image.metadata()
  // the largest 16 : 10 window the picture holds, centred across, placed down it by `focus`
  const w = Math.min(width, Math.round(height * frame))
  const h = Math.min(height, Math.round(w / frame))
  const focus = 'focus' in pick && typeof pick.focus === 'number' ? Math.min(1, Math.max(0, pick.focus)) : 0
  const left = Math.round((width - w) / 2)
  const top = Math.round((height - h) * focus)
  await image
    .extract({ left, top, width: w, height: h })
    .resize(STILL_FRAME.width, STILL_FRAME.height)
    .webp({ quality: 72 })
    .toFile(join(root, crop.file))
  console.log(`shelf-stills: ${crop.file} ← ${source} (${w} × ${h} from ${left}, ${top})`)
}

for (const name of readdirSync(dir)) {
  const file = `${SHELF_STILL_DIR}/${name}`
  if (!kept.has(file) && existsSync(join(root, file))) {
    rmSync(join(root, file))
    console.log(`shelf-stills: removed ${file}, which no piece uses`)
  }
}
