// scripts/engines/frame-dist.ts — the second half of `npm run build` (2026-10-17).
// Usage: tsx scripts/engines/frame-dist.ts [dist]
//
// Finishes the built site's practice pages, after Astro's build and the publication rule's prune:
//
//   1. frames the standalone work pages with the teasers on record today, so a wall text reaches
//      its page with the next deploy instead of waiting for the next integrate of its practice
//      (src/lib/engines/frame-dist.ts says why that wait had become a deadlock);
//   2. since 2026-10-18, gives every published work, presentation and closing report of the
//      practices what a shared link needs — preview tags and a preview image — and a line back to
//      the site where no frame stands (src/lib/engines/share-dist.ts).
//
// It prints one line per step and never fails the build: every practice's integrate runs this
// build as its gate, and a page these steps cannot finish is served as Astro built it.
import { frameDist } from '../../src/lib/engines/frame-dist'
import { shareDist } from '../../src/lib/engines/share-dist'

const dist = process.argv[2] ?? 'dist'
try {
  const r = frameDist(dist)
  const failed = r.failed.length ? `; ${r.failed.length} left as mirrored: ${r.failed.join('; ')}` : ''
  console.log(`[frame-dist] wall texts: ${r.reframed} of ${r.pages} standalone work page(s) framed anew with the teasers on record${failed}`)
} catch (e) {
  console.error(`[frame-dist] the built pages keep their mirrors' frames: ${(e as Error).message}`)
}

try {
  const started = Date.now()
  const r = await shareDist({ dist, publicDir: 'public' })
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  console.log(
    `[share-dist] ${r.pages} practice page(s) finished for sharing in ${seconds}s: ${r.written} written, ` +
      `${r.stills} maker's still(s), ${r.cards} card(s), ${r.ownImages} with an image of their own, ${r.strips} back strip(s)`,
  )
  if (r.failed.length) console.warn(`[share-dist] ${r.failed.length} problem(s): ${r.failed.join('; ')}`)
} catch (e) {
  console.error(`[share-dist] the practice pages are served as built, without preview tags: ${(e as Error).message}`)
}
