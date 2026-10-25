// src/lib/reception/handlers.ts — the reception's request handlers (2026-10-17).
//
// The route files under functions/api/reception/ are one line each; everything that decides lives
// here, so the whole chain can be tested with a fake store and a mocked network.
//
// The chain for a rating, in order (the public seed's, functions/api/seed.js, reused and shortened):
//   1. Origin, content type and size                         → 403 / 415 / 413 / 400
//   2. Honeypot (`website`)                                   → silent 200, nothing stored
//   3. In-memory burst limit per isolate (best effort)        → 429 too-fast
//   —  Standby: no RECEPTION_DB, no registry, no bot check     → 503 standby (declared, never half-working)
//   4. Mechanical check (./text.ts) and the published-works list → 422
//   5. Turnstile, server-side — visitors only                 → 403
//   6. The global daily cap                                   → 503 standby (daily-cap)
//   7. One rating per work per visitor per day (day hash)     → 429 rate-limit
//   8. A visitor's note: the text gate, with its own daily cap → 503 / 422 with the reason code
//   9. Stored in one transaction                              → 200, live at once
//
// The architect's valid cookie skips 5 to 8 and marks the entry as his. Two switches exist for his
// checks only, and are ignored on every other request: `dry_run` (run the chain, store nothing) and
// `as_visitor` (run the visitor's chain without the bot check, and store the entry as a visitor's).
//
// Invariants (.claude/rules/runtime-and-works.md): fail-closed everywhere; no secret, token or key in
// any response, error or log; no CORS headers, same origin only.

import { isWorkId, practiceOfId, RECEPTION_PRACTICES, type RatableWork } from './ids'
import { validateRating } from './text'
import { runReceptionGate } from './gate'
import {
  OWNER_COOKIE,
  dayHash,
  dayOf,
  issueOwnerCookie,
  ownerClearCookie,
  ownerKeyConfigured,
  ownerKeyMatches,
  ownerSetCookie,
  randomHex,
  readCookie,
  verifyOwnerCookie,
  hex,
} from './crypto'
import {
  bump,
  countOf,
  ensureSchema,
  hasMark,
  hiddenNotes,
  insertEntry,
  moderateEntry,
  publicRecord,
  reportEntry,
  summarize,
  todaysSalt,
  workView,
  type D1Like,
  type NoteRow,
} from './store'

export interface AssetsLike {
  fetch(request: Request): Promise<Response>
}

export interface ReceptionEnv {
  RECEPTION_DB?: D1Like
  RECEPTION_OWNER_KEY?: string
  TURNSTILE_SECRET_KEY?: string
  GEMINI_API_KEY?: string
  ASSETS?: AssetsLike
}

export interface Deps {
  fetch: typeof fetch
  now: () => Date
}

/** Entries stored per UTC day, across all works. At the cap the endpoint declares standby until
 *  midnight UTC — the named cost limit of duty 5. */
export const DAILY_CAP = 400
/** Text-gate calls per UTC day (the model's free tier is shared with /seed). At the cap notes wait
 *  until midnight UTC; a rating without a note still goes through. */
export const GATE_DAILY_CAP = 300
/** How the architect's notes are signed. */
export const OWNER_LABEL = 'Frank Bültge (architect)'
export const VISITOR_LABEL = 'a visitor'

const MAX_BODY_BYTES = 16 * 1024
const BURST_MAX = 20
const BURST_WINDOW_MS = 10 * 60 * 1000
const REGISTRY_TTL_MS = 5 * 60 * 1000
const ENTRY_ID_RE = /^r-\d{8}-[0-9a-f]{12}$/
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const json = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

const standby = (detail: string): Response => json(503, { ok: false, reason: 'standby', detail })

// ── the list of works the site publishes ──────────────────────────────────────────────────────

let registryCache: { at: number; works: Map<string, RatableWork> } | null = null

export function resetRegistryCache(): void {
  registryCache = null
}

/** dist/reception/works.json, as the build wrote it (src/lib/reception/dist.ts), or null when it is
 *  missing or malformed — in which case the endpoints declare standby rather than accept any id. */
export function parseRegistry(data: unknown): Map<string, RatableWork> | null {
  const works = (data as { works?: unknown })?.works
  if (!Array.isArray(works)) return null
  const out = new Map<string, RatableWork>()
  for (const w of works) {
    if (!w || typeof w !== 'object') return null
    const { id, practice, kind, title, href } = w as Record<string, unknown>
    if (!isWorkId(id) || practiceOfId(id) !== practice || typeof title !== 'string' || typeof href !== 'string' || typeof kind !== 'string') return null
    if (!(RECEPTION_PRACTICES as readonly string[]).includes(practice as string)) return null
    out.set(id, { id, practice: practice as RatableWork['practice'], kind: kind as RatableWork['kind'], title, href })
  }
  return out
}

async function loadRegistry(request: Request, env: ReceptionEnv, deps: Deps): Promise<Map<string, RatableWork> | null> {
  const nowMs = deps.now().getTime()
  if (registryCache && nowMs - registryCache.at < REGISTRY_TTL_MS) return registryCache.works
  if (!env.ASSETS) return null
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/reception/works.json', request.url).toString()))
    if (!res.ok) return null
    const works = parseRegistry(await res.json())
    if (!works) return null
    registryCache = { at: nowMs, works }
    return works
  } catch {
    return null
  }
}

// ── small guards ──────────────────────────────────────────────────────────────────────────────

/** A request another site started. Browsers send Origin with every POST; a request without one (a
 *  script on the command line) is not a cross-site request and meets the bot check like any other. */
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

const seconds = (d: Date): number => Math.floor(d.getTime() / 1000)

async function isOwner(request: Request, env: ReceptionEnv, deps: Deps): Promise<boolean> {
  return verifyOwnerCookie(readCookie(request.headers.get('cookie'), OWNER_COOKIE), env.RECEPTION_OWNER_KEY, seconds(deps.now()))
}

/** The seed's check (functions/api/seed.js): the token must verify against the secret. The site key
 *  is bound to this domain in Turnstile itself, so the answer's hostname adds nothing to check. */
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

/** A note as the public sees it. */
export function publicNote(row: Pick<NoteRow, 'id' | 'score' | 'name' | 'owner' | 'created_at'> & { text: string | null }) {
  const owner = row.owner === 1
  return {
    id: row.id,
    score: row.score,
    text: row.text,
    owner,
    by: owner ? OWNER_LABEL : row.name || VISITOR_LABEL,
    at: row.created_at,
  }
}

// ── GET /api/reception/work?id= ───────────────────────────────────────────────────────────────

export async function handleWork(request: Request, env: ReceptionEnv, deps: Deps): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id')
  if (!isWorkId(id)) return json(400, { ok: false, reason: 'unknown-work' })
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  const registry = await loadRegistry(request, env, deps)
  if (!registry) return standby('registry')
  const work = registry.get(id)
  if (!work) return json(404, { ok: false, reason: 'unknown-work' })
  try {
    await ensureSchema(db)
    const day = dayOf(deps.now())
    const [view, entriesToday, gateToday] = await Promise.all([workView(db, id), countOf(db, day, 'entries'), countOf(db, day, 'gate')])
    const open = Boolean(env.TURNSTILE_SECRET_KEY) && entriesToday < DAILY_CAP
    const notesOpen = open && Boolean(env.GEMINI_API_KEY) && gateToday < GATE_DAILY_CAP
    return json(200, {
      ok: true,
      work,
      ...summarize(view.totals),
      notes: view.notes.map(publicNote),
      open,
      notes_open: notesOpen,
      standby: open ? (notesOpen ? null : !env.GEMINI_API_KEY ? 'text-check' : 'gate-cap') : !env.TURNSTILE_SECRET_KEY ? 'bot-check' : 'daily-cap',
    })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── POST /api/reception/rate ──────────────────────────────────────────────────────────────────

export async function handleRate(request: Request, env: ReceptionEnv, deps: Deps): Promise<Response> {
  if (foreign(request)) return json(403, { ok: false, reason: 'origin' })
  const read = await readBody(request)
  if (!read.ok) return read.res
  const body = read.body

  // A field no person sees: filled in means a script. Answered like a success, so the script learns
  // nothing about the chain behind it, and nothing is stored.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(200, { ok: true })

  const now = deps.now()
  if (await tooFast(request, now.getTime())) return json(429, { ok: false, reason: 'too-fast' })

  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  const owner = await isOwner(request, env, deps)
  const asVisitor = owner && body.as_visitor === true
  const dryRun = owner && body.dry_run === true
  const actsAsOwner = owner && !asVisitor
  if (!owner && !env.TURNSTILE_SECRET_KEY) return standby('bot-check')

  const v = validateRating(body, { owner: actsAsOwner })
  if (!v.ok) return json(422, { ok: false, reason: v.reason })
  const registry = await loadRegistry(request, env, deps)
  if (!registry) return standby('registry')
  if (!registry.has(v.value.work)) return json(422, { ok: false, reason: 'unknown-work' })

  const ip = request.headers.get('cf-connecting-ip')
  if (!owner && !(await verifyTurnstile(deps, env.TURNSTILE_SECRET_KEY as string, body.turnstileToken, ip))) {
    return json(403, { ok: false, reason: 'turnstile' })
  }

  try {
    await ensureSchema(db)
    const day = dayOf(now)
    const nowS = seconds(now)
    let hash: string | null = null
    if (!actsAsOwner) {
      if ((await countOf(db, day, 'entries')) >= DAILY_CAP) return standby('daily-cap')
      const salt = await todaysSalt(db, day, randomHex(32), nowS)
      hash = await dayHash(salt, ip ?? 'unknown', request.headers.get('user-agent') ?? 'unknown')
      if (await hasMark(db, hash, v.value.work, 'rate')) return json(429, { ok: false, reason: 'rate-limit' })

      if (v.value.text !== null) {
        if (!env.GEMINI_API_KEY) return standby('text-check')
        if ((await countOf(db, day, 'gate')) >= GATE_DAILY_CAP) return json(503, { ok: false, reason: 'gate-cap' })
        // The daily counts are the visitors' traffic: the architect's dry runs check the chain and
        // leave no trace in them.
        if (!dryRun) await bump(db, day, 'gate')
        const verdict = await runReceptionGate(deps.fetch, env.GEMINI_API_KEY, { work: v.value.work, text: v.value.text, name: v.value.name })
        if (verdict.verdict === 'invalid') return json(503, { ok: false, reason: 'gate-unavailable', retry: true })
        if (verdict.verdict === 'block') {
          if (!dryRun) await bump(db, day, `refused:${verdict.reason}`)
          return json(422, { ok: false, reason: 'gate', code: verdict.reason })
        }
      }
    }

    const entry = {
      id: `r-${day.replace(/-/g, '')}-${randomHex(6)}`,
      work: v.value.work,
      score: v.value.score,
      text: v.value.text,
      name: actsAsOwner ? null : v.value.name,
      owner: actsAsOwner,
      createdAt: now.toISOString(),
    }
    const shown = publicNote({ id: entry.id, score: entry.score, text: entry.text, name: entry.name, owner: entry.owner ? 1 : 0, created_at: entry.createdAt })
    if (dryRun) return json(200, { ok: true, dry_run: true, entry: shown })
    if (!(await insertEntry(db, entry, { hash, nowS, day }))) return json(429, { ok: false, reason: 'rate-limit' })
    return json(200, { ok: true, status: 'live', work: entry.work, entry: shown })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET /api/reception/owner ──────────────────────────────────────────────────────────────────

const OWNER_HEADERS = { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' }

export async function handleOwner(request: Request, env: ReceptionEnv, deps: Deps): Promise<Response> {
  const url = new URL(request.url)
  if (url.searchParams.has('logout')) {
    return new Response(null, { status: 303, headers: { ...OWNER_HEADERS, location: '/reception/?owner=signed-out', 'set-cookie': ownerClearCookie() } })
  }
  const k = url.searchParams.get('k')
  if (k !== null) {
    if (!ownerKeyConfigured(env.RECEPTION_OWNER_KEY)) return json(503, { ok: false, reason: 'standby', detail: 'owner-key' }, OWNER_HEADERS)
    if (await tooFast(request, deps.now().getTime())) return json(429, { ok: false, reason: 'too-fast' }, OWNER_HEADERS)
    if (!(await ownerKeyMatches(k, env.RECEPTION_OWNER_KEY))) return json(403, { ok: false, reason: 'key' }, OWNER_HEADERS)
    const value = await issueOwnerCookie(env.RECEPTION_OWNER_KEY, seconds(deps.now()))
    return new Response(null, { status: 303, headers: { ...OWNER_HEADERS, location: '/reception/?owner=signed-in', 'set-cookie': ownerSetCookie(value) } })
  }
  return json(200, { ok: true, owner: await isOwner(request, env, deps), configured: ownerKeyConfigured(env.RECEPTION_OWNER_KEY) }, OWNER_HEADERS)
}

// ── POST /api/reception/report ────────────────────────────────────────────────────────────────

export async function handleReport(request: Request, env: ReceptionEnv, deps: Deps): Promise<Response> {
  if (foreign(request)) return json(403, { ok: false, reason: 'origin' })
  const read = await readBody(request)
  if (!read.ok) return read.res
  const id = read.body.id
  if (typeof id !== 'string' || !ENTRY_ID_RE.test(id)) return json(422, { ok: false, reason: 'unknown-note' })
  const now = deps.now()
  if (await tooFast(request, now.getTime())) return json(429, { ok: false, reason: 'too-fast' })
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  try {
    await ensureSchema(db)
    const day = dayOf(now)
    const nowS = seconds(now)
    const salt = await todaysSalt(db, day, randomHex(32), nowS)
    const hash = await dayHash(salt, request.headers.get('cf-connecting-ip') ?? 'unknown', request.headers.get('user-agent') ?? 'unknown')
    const status = await reportEntry(db, id, { hash, nowS, day, at: now.toISOString() })
    if (status === 'not-found') return json(404, { ok: false, reason: 'unknown-note' })
    return json(200, { ok: true, status })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET /api/reception/record ─────────────────────────────────────────────────────────────────

/** The public record: what the record page shows and what the nightly snapshot commits. A hidden
 *  note is listed by its id and dates only; its text stays out until the architect restores it. */
export async function handleRecord(request: Request, env: ReceptionEnv, deps: Deps): Promise<Response> {
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  const registry = (await loadRegistry(request, env, deps)) ?? new Map<string, RatableWork>()
  try {
    await ensureSchema(db)
    const r = await publicRecord(db)
    const workOf = (id: string) => {
      const w = registry.get(id)
      return { title: w?.title ?? null, href: w?.href ?? null, practice: practiceOfId(id), kind: w?.kind ?? null, published: Boolean(w) }
    }
    const counts: Record<string, Record<string, number>> = {}
    for (const c of r.counts) (counts[c.day] ??= {})[c.key] = c.n
    return json(200, {
      ok: true,
      schema: 1,
      works: r.totals
        .map((t) => ({ id: t.work, ...workOf(t.work), ...summarize(t), last_at: t.last_at }))
        .filter((w) => w.count > 0 || r.notes.some((n) => n.work === w.id)),
      notes: r.notes.map((n) => ({ work: n.work, ...publicNote(n) })),
      hidden: r.hidden,
      counts,
    })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET|POST /api/reception/moderate (the architect only) ─────────────────────────────────────

export async function handleModerate(request: Request, env: ReceptionEnv, deps: Deps): Promise<Response> {
  if (request.method === 'POST' && foreign(request)) return json(403, { ok: false, reason: 'origin' })
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  if (!(await isOwner(request, env, deps))) return json(403, { ok: false, reason: 'owner-only' })
  try {
    await ensureSchema(db)
    if (request.method !== 'POST') {
      const rows = await hiddenNotes(db)
      return json(200, { ok: true, hidden: rows.map((n) => ({ work: n.work, hidden_at: n.hidden_at, reports: n.reports, ...publicNote(n) })) })
    }
    const read = await readBody(request)
    if (!read.ok) return read.res
    const { id, action } = read.body
    if (typeof id !== 'string' || !ENTRY_ID_RE.test(id)) return json(422, { ok: false, reason: 'unknown-note' })
    if (action !== 'restore' && action !== 'remove') return json(422, { ok: false, reason: 'action' })
    const status = await moderateEntry(db, id, action, deps.now().toISOString())
    if (status === 'not-found') return json(404, { ok: false, reason: 'unknown-note' })
    return json(200, { ok: true, status })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

/** The address of a work's cached view, so a new rating can clear it. */
export const workCacheKey = (origin: string, id: string): string => `${origin}/api/reception/work?id=${encodeURIComponent(id)}`
