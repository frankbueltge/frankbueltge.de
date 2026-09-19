// @ts-nocheck
// Range-capable delivery for the lab's audio (Cloudflare Pages Function, 2026-09-20).
//
// Why this exists. Served as a plain Pages asset, the recording came back with
// cf-cache-status: DYNAMIC, no Accept-Ranges, and a full 200 in answer to a Range request —
// measured against the same site's images, which answer 206 correctly. A media element that
// cannot fetch a byte range cannot seek, and Safari will not begin playback at all: its media
// stack opens with a Range request and treats a 200 as a server that cannot stream. So the
// file played in Chromium and not elsewhere, which is exactly the report that arrived.
//
// What this does: fetches the asset once, and answers the Range request itself — 206 with a
// Content-Range, or the whole file when no range was asked for. Same origin, so the page's
// CSP (default-src 'self') needs no new source, and no second host is introduced for one file.
//
// The buffer is the honest cost: 11 MB per ranged request, well inside a Worker's memory, and
// billed at nothing on the free plan. It is the price of not moving the file to a bucket.
const ONE_WEEK = 60 * 60 * 24 * 7

export async function onRequest(context) {
  const { request, env, params } = context

  // GET and HEAD only. A player often opens with HEAD to learn the length and whether ranges
  // are on offer before it asks for a byte; answering that with a 404 is how this function
  // failed its first local test.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  const bodyless = request.method === 'HEAD'

  // Only this directory's own files, and only the one extension it is for: a function that
  // will fetch any path a caller names is an open proxy, however narrow its route looks.
  const name = String(params.file || '')
  if (!/^[a-z0-9-]+\.m4a$/.test(name)) return new Response('Not found', { status: 404 })

  const origin = new URL(request.url).origin
  const asset = await env.ASSETS.fetch(new Request(`${origin}/playbook/${name}`, { method: 'GET' }))
  if (!asset.ok) return new Response('Not found', { status: 404 })

  const body = await asset.arrayBuffer()
  const total = body.byteLength
  const headers = new Headers({
    'Content-Type': 'audio/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': `public, max-age=${ONE_WEEK}`,
    'X-Content-Type-Options': 'nosniff',
  })

  const range = request.headers.get('Range')
  if (!range) {
    headers.set('Content-Length', String(total))
    return new Response(bodyless ? null : body, { status: 200, headers })
  }

  // One range, the only form a media element asks for: "bytes=START-" or "bytes=START-END".
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
  if (!m || (m[1] === '' && m[2] === '')) {
    headers.set('Content-Range', `bytes */${total}`)
    return new Response(null, { status: 416, headers })
  }
  // A suffix range ("bytes=-500") means the LAST 500 bytes, not the first.
  const suffix = m[1] === ''
  const start = suffix ? Math.max(0, total - Number(m[2])) : Number(m[1])
  const end = suffix || m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1)
  if (start > end || start >= total) {
    headers.set('Content-Range', `bytes */${total}`)
    return new Response(null, { status: 416, headers })
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
  headers.set('Content-Length', String(end - start + 1))
  return new Response(bodyless ? null : body.slice(start, end + 1), { status: 206, headers })
}
