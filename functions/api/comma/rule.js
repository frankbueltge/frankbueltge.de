// @ts-nocheck
// GET /api/comma/rule — OONI's count of the previous UTC day by country, the ground of Comma's suspicion rule
// (src/lib/comma/rule.ts). No parameters; cached at the Cloudflare location for an hour, so OONI is asked about once
// an hour per location. Passed through unparsed, nothing stored, fail-closed like /api/comma/now.
import { aggregationUrl, standby, standbyReason, USER_AGENT } from '../../../src/lib/comma/relay'

export async function onRequest({ request }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
  }
  const now = Date.now()
  let upstream
  try {
    upstream = await fetch(aggregationUrl(now), {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      cf: { cacheTtl: 3600, cacheEverything: true },
    })
  } catch {
    return standby('source', 300)
  }
  const reason = standbyReason(upstream.status, upstream.headers.get('content-type'))
  if (reason) return standby(reason, 300)
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-comma-day': new Date(Math.floor(now / 86_400_000) * 86_400_000 - 86_400_000).toISOString().slice(0, 10),
    },
  })
}
