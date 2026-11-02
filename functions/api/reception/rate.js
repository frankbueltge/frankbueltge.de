// @ts-nocheck
// POST /api/reception/rate — a rating from 1 to 5, with an optional note (2026-10-17).
// The chain and its invariants: src/lib/reception/handlers.ts.
import { handleRate, workCacheKey } from '../../../src/lib/reception/handlers'
import { ringRating } from '../../../src/lib/notify/handlers'
import { deps, edgeCache } from './_deps'

export async function onRequestPost(context) {
  const res = await handleRate(context.request, context.env, deps)
  if (res.status !== 200) return res
  let live
  try {
    live = await res.clone().json()
  } catch {
    return res
  }
  if (live.status !== 'live' || typeof live.work !== 'string') return res
  const cache = edgeCache()
  if (cache) {
    // A new rating clears the work's cached view here, so the page that posted it reads it back; if
    // the delete fails, the cached view expires on its own within thirty seconds.
    context.waitUntil(cache.delete(new Request(workCacheKey(new URL(context.request.url).origin, live.work))).catch(() => {}))
  }
  const entry = live.entry
  if (entry && entry.owner !== true) {
    // The operator's bell (2026-11-02): work and score, never the note or the name; the architect's own
    // entries ring nothing. What a bell may carry: src/lib/notify/operator.ts.
    context.waitUntil(ringRating(context.env, deps, { work: live.work, score: entry.score, note: entry.text !== null, at: entry.at }))
  }
  return res
}
