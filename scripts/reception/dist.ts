// scripts/reception/dist.ts — the last step of `npm run build` (2026-10-17).
// Usage: tsx scripts/reception/dist.ts [dist]
//
// Puts the reception band below every bare published work and writes dist/reception/works.json, the
// list the reception's endpoints accept (src/lib/reception/dist.ts says what and why). Prints one line
// and never fails the build: without the list the endpoints declare standby, which is fail-closed.
import { receptionDist } from '../../src/lib/reception/dist'

const dist = process.argv[2] ?? 'dist'
try {
  const r = receptionDist(dist, process.cwd())
  const failed = r.failed.length ? `; ${r.failed.length} page(s) left without it: ${r.failed.join('; ')}` : ''
  console.log(`[reception] ${r.works} ratable work(s) listed: ${r.banded} bare page(s) carry the band, ${r.astro} page(s) rendered with the block${failed}`)
} catch (e) {
  console.error(`[reception] no list of ratable works was written, so the reception stays in standby: ${(e as Error).message}`)
}
