// @ts-nocheck
// GET /api/reading/record?round= — the released batches of a round, without their days (2026-10-26).
// Read by the nightly snapshot (.github/workflows/reading-snapshot.yml), which commits it as open data.
// Cached at the edge for an hour under one key per round: no query string, and no `fresh`, reaches the
// store more than once an hour, so polling it neither reveals arrivals nor spends the store's reads.
import { handleRecord } from '../../../src/lib/reading/handlers'
import { deps, edgeCache } from '../reception/_deps'

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const round = url.searchParams.get('round')
  const key = new Request(`${url.origin}/api/reading/record${round === null ? '' : `?round=${encodeURIComponent(round)}`}`, { method: 'GET' })
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
