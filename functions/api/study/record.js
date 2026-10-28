// @ts-nocheck
// GET /api/study/record?study= — the released batches of a study, without their days (2026-10-27).
// Read by the nightly snapshot (.github/workflows/study-snapshot.yml) and by the practices' own works.
// Cached at the edge for an hour under one key per study: polling it neither reveals arrivals nor
// spends the store's reads.
import { handleRecord } from '../../../src/lib/study/handlers'
import { deps, edgeCache } from '../reception/_deps'

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const study = url.searchParams.get('study') ?? ''
  const key = new Request(`${url.origin}/api/study/record?study=${encodeURIComponent(study)}`, { method: 'GET' })
  const cache = edgeCache()
  if (cache) {
    const hit = await cache.match(key)
    if (hit) return hit
  }
  const res = await handleRecord(key, context.env, deps)
  if (cache && res.status === 200) {
    const copy = new Response(res.clone().body, res)
    copy.headers.set('cache-control', 'public, max-age=3600')
    context.waitUntil(cache.put(key, copy))
  }
  return res
}
