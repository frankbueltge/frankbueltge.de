// @ts-nocheck
// POST /api/reception/rate — a rating from 1 to 5, with an optional note (2026-10-17).
// The chain and its invariants: src/lib/reception/handlers.ts.
import { handleRate, workCacheKey } from '../../../src/lib/reception/handlers'
import { deps, edgeCache } from './_deps'

export async function onRequestPost(context) {
  const res = await handleRate(context.request, context.env, deps)
  const cache = edgeCache()
  if (cache && res.status === 200) {
    // A new rating clears the work's cached view here, so the page that posted it reads it back.
    try {
      const { work, status } = await res.clone().json()
      if (status === 'live' && typeof work === 'string') {
        context.waitUntil(cache.delete(new Request(workCacheKey(new URL(context.request.url).origin, work))))
      }
    } catch {
      // the cached view expires on its own within thirty seconds
    }
  }
  return res
}
