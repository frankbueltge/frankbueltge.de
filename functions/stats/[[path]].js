// @ts-nocheck
// First-party reverse proxy for self-hosted Umami (Cloudflare Pages Function).
//
// Why: the browser must never make a third-party request — the Beifang experiment claims
// "zero third-party requests", and the CF analytics beacon was removed in July 2026 for
// exactly that reason. So the Umami tracker is loaded from /stats/script.js and posts to
// /stats/api/send — both on this domain. This function forwards those to our own
// self-hosted Umami instance (EU/Frankfurt, on Vercel + Neon), which serves both:
//   /stats/script.js  -> https://stats.frankbueltge.de/script.js  (the tracker code)
//   /stats/api/send    -> https://stats.frankbueltge.de/api/send   (the collector)
// Result: no external host in the browser, no external CSP source needed, cookieless,
// and no third-country transfer (was Umami Cloud / US until 2026-07).
export async function onRequest(context) {
  const { request, params } = context
  const parts = Array.isArray(params.path) ? params.path : [params.path]
  const path = parts.filter(Boolean).join('/')

  // Self-hosted Umami serves both the tracker (script.js) and the collector (api/send)
  // on the same host, so everything proxies to the one upstream.
  const upstream = 'https://stats.frankbueltge.de'
  const target = `${upstream}/${path}`

  // Forward only what the upstream needs; pass the real client IP for geo (Umami hashes it).
  const headers = new Headers()
  for (const h of ['content-type', 'user-agent', 'accept', 'accept-language']) {
    const v = request.headers.get(h)
    if (v) headers.set(h, v)
  }
  const ip = request.headers.get('cf-connecting-ip')
  if (ip) headers.set('x-forwarded-for', ip)

  const init = { method: request.method, headers }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  const res = await fetch(target, init)

  // Re-emit; drop hop-by-hop/encoding headers that don't survive the proxy hop.
  const out = new Headers(res.headers)
  out.delete('content-encoding')
  out.delete('content-length')
  out.delete('transfer-encoding')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out })
}
