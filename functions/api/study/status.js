// @ts-nocheck
// GET /api/study/status?study= — whether a study takes answers now, and how many it holds (2026-10-27).
// Cached at the edge for half a minute under one key per study, whatever else the query string says.
import { handleStatus } from '../../../src/lib/study/handlers'
import { deps, edgeCache } from '../reception/_deps'

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const study = url.searchParams.get('study') ?? ''
  const key = new Request(`${url.origin}/api/study/status?study=${encodeURIComponent(study)}`, { method: 'GET' })
  const cache = edgeCache()
  if (cache) {
    const hit = await cache.match(key)
    if (hit) return hit
  }
  const res = await handleStatus(key, context.env, deps)
  if (cache && res.status === 200) {
    const copy = new Response(res.clone().body, res)
    copy.headers.set('cache-control', 'public, max-age=30')
    context.waitUntil(cache.put(key, copy))
  }
  return res
}
