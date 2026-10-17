// scripts/engines/frame-dist.ts — the second half of `npm run build` (2026-10-17).
// Usage: tsx scripts/engines/frame-dist.ts [dist]
//
// Frames the built site's standalone work pages with the teasers on record today, so a wall text
// reaches its page with the next deploy instead of waiting for the next integrate of its practice
// (src/lib/engines/frame-dist.ts says why that wait had become a deadlock). It prints one line and
// never fails the build: every practice's integrate runs this build as its gate, and a page this
// step cannot frame still has the frame its mirror carries.
import { frameDist } from '../../src/lib/engines/frame-dist'

const dist = process.argv[2] ?? 'dist'
try {
  const r = frameDist(dist)
  const failed = r.failed.length ? `; ${r.failed.length} left as mirrored: ${r.failed.join('; ')}` : ''
  console.log(`[frame-dist] wall texts: ${r.reframed} of ${r.pages} standalone work page(s) framed anew with the teasers on record${failed}`)
} catch (e) {
  console.error(`[frame-dist] the built pages keep their mirrors' frames: ${(e as Error).message}`)
}
