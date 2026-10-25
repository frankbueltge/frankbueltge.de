// src/lib/reading/handlers.ts — Third Reading's request handlers (2026-10-26).
//
// The route files under functions/api/reading/ are one line each; everything that decides lives here,
// so the chain can be tested with a fake store and a mocked network — the reception's arrangement
// (src/lib/reception/handlers.ts), whose guards are repeated below rather than shared, so neither
// feature can loosen the other's.
//
// The chain for a reading, in order:
//   1. Origin, content type and size                            → 403 / 415 / 413 / 400
//   2. Honeypot (`website`)                                      → silent 200, nothing stored
//   3. In-memory burst limit per isolate (best effort)           → 429 too-fast
//   —  Standby: no RECEPTION_DB, no bot check                     → 503 standby (declared, never half-working)
//   4. The mechanical check against the round (./reading.ts)     → 422 with the reason
//   5. Turnstile, server-side                                    → 403
//   6. The global daily cap                                      → 503 standby (daily-cap)
//   7. One reading per round per visitor per day (day hash)      → 429 once-a-day
//   8. Stored in one transaction                                 → 200
//
// Invariants (.claude/rules/runtime-and-works.md): fail-closed everywhere; no secret, token or key in
// any response, error or log; no CORS headers, same origin only.
import type { D1Like } from '../reception/store'
import { dayHash, dayOf, hex, randomHex } from '../reception/crypto'
import { CURRENT_ROUND, roundById } from './rounds'
import { validateReading } from './reading'
import { countOf, ensureSchema, hasMark, insertReading, roundEntries, roundTotal, todaysSalt } from './store'

export interface ReadingEnv {
  RECEPTION_DB?: D1Like
  TURNSTILE_SECRET_KEY?: string
}

export interface Deps {
  fetch: typeof fetch
  now: () => Date
}

/** Readings stored per UTC day, across all rounds. At the cap the endpoint declares standby until
 *  midnight UTC — the named cost limit of duty 5. */
export const DAILY_CAP = 300

const MAX_BODY_BYTES = 8 * 1024
const BURST_MAX = 10
const BURST_WINDOW_MS = 10 * 60 * 1000
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const standby = (detail: string): Response => json(503, { ok: false, reason: 'standby', detail })

function foreign(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return true
  const site = request.headers.get('sec-fetch-site')
  return Boolean(site && site !== 'same-origin' && site !== 'none')
}

async function readBody(request: Request): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; res: Response }> {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return { ok: false, res: json(415, { ok: false, reason: 'content-type' }) }
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return { ok: false, res: json(413, { ok: false, reason: 'too-large' }) }
  let raw: string
  try {
    raw = await request.text()
  } catch {
    return { ok: false, res: json(400, { ok: false, reason: 'bad-json' }) }
  }
  if (raw.length > MAX_BODY_BYTES) return { ok: false, res: json(413, { ok: false, reason: 'too-large' }) }
  try {
    const body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, res: json(400, { ok: false, reason: 'bad-json' }) }
    return { ok: true, body }
  } catch {
    return { ok: false, res: json(400, { ok: false, reason: 'bad-json' }) }
  }
}

const burst = new Map<string, number[]>()

async function tooFast(request: Request, nowMs: number): Promise<boolean> {
  const material = `${request.headers.get('cf-connecting-ip') ?? 'unknown'}·${request.headers.get('user-agent') ?? 'unknown'}`
  const key = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material))).slice(0, 8))
  const hits = (burst.get(key) ?? []).filter((t) => nowMs - t < BURST_WINDOW_MS)
  if (hits.length >= BURST_MAX) return true
  hits.push(nowMs)
  burst.set(key, hits)
  if (burst.size > 5000) burst.clear()
  return false
}

export function resetBurst(): void {
  burst.clear()
}

async function verifyTurnstile(deps: Deps, secret: string, token: unknown, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0 || token.length > 4096) return false
  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', token)
  if (ip) form.set('remoteip', ip)
  try {
    const res = await deps.fetch(TURNSTILE_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form.toString() })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: unknown }
    return data?.success === true
  } catch {
    return false
  }
}

const seconds = (d: Date): number => Math.floor(d.getTime() / 1000)

// ── POST /api/reading/submit ──────────────────────────────────────────────────────────────────

export async function handleSubmit(request: Request, env: ReadingEnv, deps: Deps): Promise<Response> {
  if (foreign(request)) return json(403, { ok: false, reason: 'origin' })
  const read = await readBody(request)
  if (!read.ok) return read.res
  const body = read.body

  // A field no person sees: filled in means a script. Answered like a success, nothing stored.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(200, { ok: true })

  const now = deps.now()
  if (await tooFast(request, now.getTime())) return json(429, { ok: false, reason: 'too-fast' })

  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  if (!env.TURNSTILE_SECRET_KEY) return standby('bot-check')

  const v = validateReading(body, CURRENT_ROUND)
  if (!v.ok) return json(422, { ok: false, reason: v.reason })

  const ip = request.headers.get('cf-connecting-ip')
  if (!(await verifyTurnstile(deps, env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip))) return json(403, { ok: false, reason: 'turnstile' })

  try {
    await ensureSchema(db)
    const day = dayOf(now)
    const nowS = seconds(now)
    if ((await countOf(db, day, 'readings')) >= DAILY_CAP) return standby('daily-cap')
    const salt = await todaysSalt(db, day, randomHex(32), nowS)
    const hash = await dayHash(salt, ip ?? 'unknown', request.headers.get('user-agent') ?? 'unknown')
    if (await hasMark(db, hash, v.value.round)) return json(429, { ok: false, reason: 'once-a-day' })
    const id = `t-${day.replace(/-/g, '')}-${randomHex(6)}`
    if (!(await insertReading(db, id, v.value, { hash, nowS, day }))) return json(429, { ok: false, reason: 'once-a-day' })
    return json(200, { ok: true, status: 'stored', id, round: v.value.round, readings: await roundTotal(db, v.value.round) })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET /api/reading/status ───────────────────────────────────────────────────────────────────

/** Whether the current round takes readings now, and how many it holds. */
export async function handleStatus(_request: Request, env: ReadingEnv, deps: Deps): Promise<Response> {
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  try {
    await ensureSchema(db)
    const today = await countOf(db, dayOf(deps.now()), 'readings')
    const open = Boolean(env.TURNSTILE_SECRET_KEY) && today < DAILY_CAP
    return json(200, {
      ok: true,
      round: CURRENT_ROUND.id,
      open,
      standby: open ? null : !env.TURNSTILE_SECRET_KEY ? 'bot-check' : 'daily-cap',
      readings: await roundTotal(db, CURRENT_ROUND.id),
    })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET /api/reading/record?round= ────────────────────────────────────────────────────────────

/** The public record of a round: every reading, as stored. What the nightly snapshot commits. */
export async function handleRecord(request: Request, env: ReadingEnv): Promise<Response> {
  const asked = new URL(request.url).searchParams.get('round')
  const round = asked === null ? CURRENT_ROUND : roundById(asked)
  if (!round) return json(404, { ok: false, reason: 'unknown-round' })
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  try {
    await ensureSchema(db)
    const entries = await roundEntries(db, round.id)
    return json(200, { ok: true, schema: 1, round: round.id, readings: entries.length, entries })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}
