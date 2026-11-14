// @ts-nocheck
// GET /api/comma/next — the block Comma plays after the current one (2026-11-14). It can be read whole in the last
// minute before it is due; asked earlier, the answer is a declared standby that says how long to wait. No
// parameters: the site's clock decides which block that is. See _block.js for what is asked and what is kept.
import { BLOCK_MS, blockPlaying, readableFrom } from '../../../src/lib/comma/clock'
import { clockHeaders, standby } from '../../../src/lib/comma/relay'
import { getOnly, readBlock } from './_block'

export async function onRequest({ request }) {
  const refused = getOnly(request)
  if (refused) return refused
  const now = Date.now()
  const block = blockPlaying(now) + BLOCK_MS
  const wait = readableFrom(block) - now
  if (wait > 0) return standby('early', Math.ceil(wait / 1000), clockHeaders(block, now))
  return readBlock(block, now)
}
