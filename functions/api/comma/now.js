// @ts-nocheck
// GET /api/comma/now — the newest nearly complete minute of OONI's web tests, for Comma (/comma, 2026-11-13).
//
// OONI's API sends no CORS header, so the site reads it for its listeners. No parameters: the site, not the caller,
// decides which minute is read (src/lib/comma/relay.ts says why), and OONI's answer is cached by URL at the
// Cloudflare location, so each location asks OONI once a minute however many people listen there. A refusal is
// never cached (`cacheOptions`): the next listener's question goes to OONI again. The answer is passed through
// unparsed, which keeps this function's own work to almost nothing; the page reads it. Nothing is stored.
// Fail-closed: anything but a JSON answer from OONI is a declared standby, and the page says the piece waits and
// asks again within seconds. Every answer carries what OONI said (`upstreamHeaders`), a standby too.
import { cacheOptions, measurementsUrl, minuteToRead, standby, standbyReason, upstreamHeaders, USER_AGENT } from '../../../src/lib/comma/relay'

export async function onRequest({ request }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
  }
  const minute = minuteToRead(Date.now())
  let upstream
  try {
    upstream = await fetch(measurementsUrl(minute), {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      cf: cacheOptions(600),
    })
  } catch {
    return standby('source')
  }
  const reason = standbyReason(upstream.status, upstream.headers.get('content-type'))
  if (reason) {
    await upstream.body?.cancel()
    return standby(reason, 10, upstreamHeaders(upstream))
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // x-comma-upstream: HIT means this Cloudflare location answered from its cache and OONI was not asked again
      ...upstreamHeaders(upstream),
      'cache-control': 'public, max-age=15',
      'x-comma-minute': new Date(minute).toISOString(),
    },
  })
}
