// src/lib/comma/relay.ts — the site's read of OONI for Comma, logic for functions/api/comma/ (2026-11-13,
// rebuilt 2026-11-14).
//
// OONI's API answers a browser only from origins on its own list, so a visitor's browser cannot ask it; the site
// asks for it. The endpoints take no parameters on purpose: a function that fetched whatever time a caller named
// would be an open door to OONI's API on this site's account. The site's clock decides which block is read
// (src/lib/comma/clock.ts).
//
// What is asked for is set by OONI's quota. OONI charges every address that asks: 4,000 units a day in its
// published limiter, and measured on 2026-11-13 a minute of all web tests cost about 19 of them, a minute of
// deviations only about 6.5, ten such minutes in one question about 30. The first build read a minute of all
// tests every minute and ran dry within two to three hours of listening a day. So the site now reads only what
// deviated (`anomaly=true`, which holds the blockpages too), of every kind of test, five minutes in one question,
// and each Cloudflare location keeps an answer for half an hour: one question per block and location, however
// many listen there. A refusal is never kept, so the next question goes to OONI again.

import { BLOCK_MS } from './clock'

const API = 'https://api.ooni.io/api/v1'
/** Five minutes held about 500 deviations when this was measured; OONI answers up to this many rows. */
export const ROW_LIMIT = 5000
/** How long a Cloudflare location keeps a block: longer than the block is ever asked for. */
export const KEEP_SECONDS = 1800

const stamp = (ms: number): string => new Date(ms).toISOString().slice(0, 19)

export function blockUrl(block: number): string {
  return `${API}/measurements?since=${stamp(block)}&until=${stamp(block + BLOCK_MS)}&limit=${ROW_LIMIT}&anomaly=true`
}

/** Without a key a source is still a third party: say who asks and why, nothing personal. */
export const USER_AGENT = 'frankbueltge.de comma (a live artwork; reads five minutes of deviations per block)'

/** Cloudflare's cache options for a read of OONI: an answer is kept for `seconds`, a refusal or an error never.
 *  A plain `cacheTtl` keeps whatever comes back, whatever its headers say (Cloudflare's documentation), refusals
 *  included. A negative value tells Cloudflare not to cache at all. */
export function cacheOptions(seconds: number): { cacheEverything: true; cacheTtlByStatus: Record<string, number> } {
  return { cacheEverything: true, cacheTtlByStatus: { '200-299': seconds, '300-599': -1 } }
}

/** What OONI said, on every answer of the relay, so a standby can be read from outside: OONI's status, whether the
 *  Cloudflare location answered from its cache (HIT) or asked OONI, and how much of OONI's quota the address it
 *  saw has left. Nothing of the body. */
export function upstreamHeaders(upstream: { status: number; headers: Headers }): Record<string, string> {
  const headers: Record<string, string> = {
    'x-comma-upstream': upstream.headers.get('cf-cache-status') ?? 'unknown',
    'x-comma-upstream-status': String(upstream.status),
  }
  const quota = upstream.headers.get('x-ratelimit-remaining') ?? ''
  if (/^\d{1,9}$/.test(quota)) headers['x-comma-quota'] = quota
  return headers
}

/** On every answer: which block it is about and what time the site's clock shows, so a listener's own clock,
 *  which may be minutes off, never decides what is played when. */
export function clockHeaders(block: number, now: number): Record<string, string> {
  return { 'x-comma-block': new Date(block).toISOString(), 'x-comma-now': String(Math.floor(now)) }
}

export type StandbyReason = 'source' | 'rate-limit' | 'shape' | 'early'

/** A declared standby, never half an answer: the page plays its recording and says why. No CORS header, like
 *  every function on this site. */
export function standby(reason: StandbyReason, retryAfterSeconds = 10, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ standby: reason }), {
    status: 503,
    headers: {
      ...extra,
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': String(retryAfterSeconds),
    },
  })
}

export function standbyReason(status: number, contentType: string | null): Exclude<StandbyReason, 'early'> | null {
  if (status === 429) return 'rate-limit'
  if (status < 200 || status >= 300) return 'source'
  if (!(contentType ?? '').toLowerCase().includes('application/json')) return 'shape'
  return null
}
