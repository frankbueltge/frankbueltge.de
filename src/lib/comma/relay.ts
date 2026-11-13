// src/lib/comma/relay.ts — the site's two reads of OONI for Comma (2026-11-13), logic for functions/api/comma/.
//
// OONI's API sends no CORS header, so a visitor's browser cannot ask it directly; the site asks for it. The two
// endpoints take no parameters on purpose: a function that fetched whatever minute a caller named would be an open
// door to OONI's API on this site's account, and OONI limits how often it may be asked (on 2026-11-12 a burst of
// a few hundred requests closed it to this house for about an hour). So the site decides which minute is read —
// the newest one OONI has nearly complete — and each Cloudflare location asks OONI once per minute; every listener
// there gets the same answer. The aggregation for the rule is read once a day. Only answers are kept: a refusal is
// never cached, so the next question goes to OONI again (`cacheOptions`).

export const MINUTE_MS = 60_000
/** Tests reach OONI within about three minutes of being run (counted 2026-11-12); a fourth keeps the minute whole. */
export const LAG_MINUTES = 4
const API = 'https://api.ooni.io/api/v1'
/** More than any minute measured so far holds (about 1,100 to 1,300); OONI answers up to this many rows. */
export const ROW_LIMIT = 5000

export const minuteToRead = (now: number): number => Math.floor((now - LAG_MINUTES * MINUTE_MS) / MINUTE_MS) * MINUTE_MS

const stamp = (ms: number): string => new Date(ms).toISOString().slice(0, 19)

export function measurementsUrl(minute: number): string {
  return `${API}/measurements?since=${stamp(minute)}&until=${stamp(minute + MINUTE_MS)}&limit=${ROW_LIMIT}&test_name=web_connectivity`
}

/** The previous UTC day, as OONI's aggregation wants it. */
export function previousDay(now: number): { since: string; until: string } {
  const today = Math.floor(now / 86_400_000) * 86_400_000
  return { since: new Date(today - 86_400_000).toISOString().slice(0, 10), until: new Date(today).toISOString().slice(0, 10) }
}

export function aggregationUrl(now: number): string {
  const { since, until } = previousDay(now)
  return `${API}/aggregation?since=${since}&until=${until}&test_name=web_connectivity&axis_x=probe_cc`
}

/** Without a key a source is still a third party: say who asks and why, nothing personal. */
export const USER_AGENT = 'frankbueltge.de comma (a live artwork; reads one minute of tests a minute)'

/** Cloudflare's cache options for a read of OONI: an answer is kept for `seconds`, a refusal or an error never.
 *  A plain `cacheTtl` keeps whatever comes back, whatever its headers say (Cloudflare's documentation), refusals
 *  included, so one refusal from OONI could close a whole minute at a Cloudflare location for every listener there.
 *  A negative value tells Cloudflare not to cache at all. */
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

/** A declared standby, never half an answer: the page says the piece waits, and why. No CORS header, like every
 *  function on this site. */
export function standby(reason: 'source' | 'rate-limit' | 'shape', retryAfterSeconds = 10, extra: Record<string, string> = {}): Response {
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

/** How soon the page asks again after a standby, by how many standbys came in a row: soon at first, because
 *  someone has just clicked, then every half minute, so a listener who waits sends at most two questions a minute. */
export const RETRY_SECONDS = [5, 10, 20, 30] as const

export function retrySeconds(inARow: number): number {
  const i = Math.min(Math.max(Math.floor(inARow), 1), RETRY_SECONDS.length) - 1
  return RETRY_SECONDS[i]!
}

export function standbyReason(status: number, contentType: string | null): 'source' | 'rate-limit' | 'shape' | null {
  if (status === 429) return 'rate-limit'
  if (status < 200 || status >= 300) return 'source'
  if (!(contentType ?? '').toLowerCase().includes('application/json')) return 'shape'
  return null
}
