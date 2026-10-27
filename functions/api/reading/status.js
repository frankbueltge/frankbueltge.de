// @ts-nocheck
// GET /api/reading/status — whether the current round takes readings now, and how many it holds
// (2026-10-26). Cached at the edge for half a minute under one key, whatever the query string says.
import { handleStatus } from '../../../src/lib/reading/handlers'
import { deps, edgeCache } from '../reception/_deps'

export async function onRequestGet(context) {
  const key = new Request(`${new URL(context.request.url).origin}/api/reading/status`, { method: 'GET' })
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
