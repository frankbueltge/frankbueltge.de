// @ts-nocheck
// GET /api/comma/now — the newest nearly complete minute of OONI's web tests, for Comma (/comma, 2026-11-13).
//
// OONI's API sends no CORS header, so the site reads it for its listeners. No parameters: the site, not the caller,
// decides which minute is read (src/lib/comma/relay.ts says why), and the request to OONI is cached by URL at the
// Cloudflare location, so each location asks OONI once a minute however many people listen there. The answer is
// passed through unparsed, which keeps this function's own work to almost nothing; the page reads it. Nothing is
// stored. Fail-closed: anything but a JSON answer from OONI is a declared standby, and the page says the piece waits.
import { measurementsUrl, minuteToRead, standby, standbyReason, USER_AGENT } from '../../../src/lib/comma/relay'

export async function onRequest({ request }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
  }
  const minute = minuteToRead(Date.now())
  let upstream
  try {
    upstream = await fetch(measurementsUrl(minute), {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      cf: { cacheTtl: 600, cacheEverything: true },
    })
  } catch {
    return standby('source')
  }
  const reason = standbyReason(upstream.status, upstream.headers.get('content-type'))
  if (reason) return standby(reason, reason === 'rate-limit' ? 300 : 60)
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=15',
      'x-comma-minute': new Date(minute).toISOString(),
    },
  })
}
