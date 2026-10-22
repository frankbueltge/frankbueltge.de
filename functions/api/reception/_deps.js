// @ts-nocheck
// Shared by the reception's routes (2026-10-17). `fetch` is wrapped, never handed over bare: the
// Workers runtime refuses a fetch called with any other `this` ("Illegal invocation").
export const deps = { fetch: (input, init) => fetch(input, init), now: () => new Date() }

/** The Cache API where the runtime has one (production), nothing where it has not (tests, dev). */
export const edgeCache = () => (typeof caches !== 'undefined' && caches.default ? caches.default : null)

/**
 * A public GET answered from the edge cache for `seconds`, unless the request asks for `fresh`. Only
 * a 200 is cached; the copy the cache keeps is public for the same time, the one sent now is not.
 */
export async function cachedGet(context, seconds, handler) {
  const url = new URL(context.request.url)
  const fresh = url.searchParams.has('fresh')
  url.searchParams.delete('fresh')
  const key = new Request(url.toString(), { method: 'GET' })
  const cache = edgeCache()
  if (cache && !fresh) {
    const hit = await cache.match(key)
    if (hit) return hit
  }
  const res = await handler()
  if (cache && res.status === 200) {
    const copy = new Response(res.clone().body, res)
    copy.headers.set('cache-control', `public, max-age=${seconds}`)
    context.waitUntil(cache.put(key, copy))
  }
  return res
}
