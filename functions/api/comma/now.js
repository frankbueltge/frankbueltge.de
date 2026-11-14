// @ts-nocheck
// GET /api/comma/now — the block of OONI's deviations that Comma is playing right now (/comma, 2026-11-13; in
// blocks since 2026-11-14). No parameters: the site's clock, not the caller, decides which block that is
// (src/lib/comma/clock.ts). See _block.js for what is asked and what is kept.
import { blockPlaying } from '../../../src/lib/comma/clock'
import { getOnly, readBlock } from './_block'

export async function onRequest({ request }) {
  const refused = getOnly(request)
  if (refused) return refused
  const now = Date.now()
  return readBlock(blockPlaying(now), now)
}
