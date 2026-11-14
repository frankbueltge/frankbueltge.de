// @ts-nocheck
// functions/api/comma/_block.js — one read of OONI for Comma, shared by now.js and next.js (2026-11-14). No route.
//
// Asks OONI for one five-minute block of deviations and passes the answer through unparsed, which keeps this
// function's own work to almost nothing; the page reads it. The answer is cached by URL at the Cloudflare location
// (`cacheOptions`), a refusal never. Nothing is stored. Fail-closed: anything but a JSON answer from OONI is a
// declared standby, and the page plays its recording and says so. The request to OONI is built here from scratch
// and carries nothing of the visitor's own request, no address and no header. Every answer carries what OONI said
// and the site's clock (src/lib/comma/relay.ts).
import { blockUrl, cacheOptions, clockHeaders, KEEP_SECONDS, standby, standbyReason, upstreamHeaders, USER_AGENT } from '../../../src/lib/comma/relay'

export async function readBlock(block, now) {
  let upstream
  try {
    upstream = await fetch(blockUrl(block), {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      cf: cacheOptions(KEEP_SECONDS),
    })
  } catch {
    return standby('source', 10, clockHeaders(block, now))
  }
  const reason = standbyReason(upstream.status, upstream.headers.get('content-type'))
  if (reason) {
    await upstream.body?.cancel()
    return standby(reason, 10, { ...upstreamHeaders(upstream), ...clockHeaders(block, now) })
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // x-comma-upstream: HIT means this Cloudflare location answered from its cache and OONI was not asked again
      ...upstreamHeaders(upstream),
      ...clockHeaders(block, now),
      // the same address answers with a new block every five minutes, so a browser must not keep it
      'cache-control': 'no-store',
    },
  })
}

export function getOnly(request) {
  return request.method === 'GET' ? null : new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
}
