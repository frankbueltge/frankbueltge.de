// @ts-nocheck
// GET /api/comma/rule — OONI's count of the previous UTC day by country, the ground of Comma's suspicion rule
// (src/lib/comma/rule.ts). No parameters; an answer is cached at the Cloudflare location for an hour, so OONI is
// asked about once an hour per location; a refusal is never cached (`cacheOptions`), so it cannot silence suspicion
// at a location for an hour. Passed through unparsed, nothing stored, fail-closed like /api/comma/now.
import { aggregationUrl, cacheOptions, standby, standbyReason, upstreamHeaders, USER_AGENT } from '../../../src/lib/comma/relay'

export async function onRequest({ request }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
  }
  const now = Date.now()
  let upstream
  try {
    upstream = await fetch(aggregationUrl(now), {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      cf: cacheOptions(3600),
    })
  } catch {
    return standby('source', 60)
  }
  const reason = standbyReason(upstream.status, upstream.headers.get('content-type'))
  if (reason) {
    await upstream.body?.cancel()
    return standby(reason, 60, upstreamHeaders(upstream))
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // x-comma-upstream: HIT means this Cloudflare location answered from its cache and OONI was not asked again
      ...upstreamHeaders(upstream),
      'cache-control': 'public, max-age=3600',
      'x-comma-day': new Date(Math.floor(now / 86_400_000) * 86_400_000 - 86_400_000).toISOString().slice(0, 10),
    },
  })
}
