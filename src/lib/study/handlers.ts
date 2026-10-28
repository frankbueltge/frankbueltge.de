// src/lib/study/handlers.ts — the practices' studies: request handlers (2026-10-27).
//
// The route files under functions/api/study/ are one line each; everything that decides lives here.
// The chain for an answer set, in order (Third Reading's, src/lib/reading/handlers.ts, for any study):
//   1. Origin, content type and size                             → 403 / 415 / 413 / 400
//   2. Honeypot (`website`)                                       → silent 200, nothing stored
//   3. In-memory burst limit per isolate (best effort)            → 429 too-fast
//   —  Standby: no RECEPTION_DB, no bot check, no registry         → 503 standby (declared, never half-working)
//   4. The study: open (the house's check passed its file, not stopped, not closed)
//                                                                 → 404 unknown-study / 403 not-open
//   5. The consent text's version, the version of the questions the frame showed (the manifest's
//      SHA-256), and the answers (./answers.ts)                     → 422 consent / version / answers
//   6. Turnstile, server-side: solved for this study, with the frame's action, on this host → 403
//   7. The daily caps, in all and per study                       → 503 standby (daily-cap)
//   8. One answer set per study per visitor per day (day hash), and at most ADDRESS_DAILY_MAX per
//      address whatever browser it claims — both before any text leaves for the gate
//                                                                 → 429 once-a-day / address-limit
//   9. Free text: the reception's text gate, with its own cap     → 503 / 422 with the reason code
//  10. Stored in one transaction, with the manifest's SHA-256     → 200, without the answers' id
//
// The registry is the build's dist/study/studies.json (src/lib/study/registry.ts): every study the
// house knows, with its state today; only `open` takes answers. The record (GET /api/study/record)
// releases only finished days, in batches and without their day, and every call to it — whatever it
// then answers — first clears the finished day's salts, marks and address counts. Invariants
// (.claude/rules/runtime-and-works.md): fail-closed everywhere; no secret in any response, error or
// log; no CORS headers, same origin only.
//
// The Turnstile check binds a token to the frame (action `study`), to the study (cData) and to the host
// that receives it, so a token another of the house's forms obtained cannot be spent here. It is not a
// wall against a work on the same origin, which could render the widget with the same values; what the
// house can and cannot hold is in docs/design/2026-10-27-practice-studies.md.
import type { D1Like } from '../reception/store'
import { dayHash, dayOf, hex, randomHex } from '../reception/crypto'
import { runReceptionGate } from '../reception/gate'
import { checkAnswers, textOf } from './answers'
import { CONSENT_VERSION } from './consent'
import { hasText, isClosed, type StudyManifest } from './manifest'
import { BATCH_SIZE, releaseBatches } from './record'
import { addressCount, ADDRESS_DAILY_MAX, bump, cleanup, countOf, ensureSchema, finishedEntries, hasMark, insertAnswers, studyTotal, todaysSalt } from './store'

export interface AssetsLike {
  fetch(request: Request): Promise<Response>
}

export interface StudyEnv {
  RECEPTION_DB?: D1Like
  TURNSTILE_SECRET_KEY?: string
  GEMINI_API_KEY?: string
  ASSETS?: AssetsLike
}

export interface Deps {
  fetch: typeof fetch
  now: () => Date
}

/** Answer sets stored per UTC day across all studies, and per study; at either the work declares
 *  standby until midnight UTC — the named cost limit of duty 5. */
export const DAILY_CAP = 600
export const STUDY_DAILY_CAP = 300
/** Text-gate calls per UTC day for studies (the model's free tier is shared with /seed and the reception). */
export const GATE_DAILY_CAP = 200

const MAX_BODY_BYTES = 24 * 1024
const BURST_MAX = 10
const BURST_WINDOW_MS = 10 * 60 * 1000
const REGISTRY_TTL_MS = 5 * 60 * 1000
const STUDY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SHA256 = /^[0-9a-f]{64}$/
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
/** The action the frame renders its widget with. */
export const TURNSTILE_ACTION = 'study'
/** Cloudflare's published test secrets, whose answers carry no action, cData or real hostname. */
const TEST_SECRET = /^[123]x0+AA$/

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })
const standby = (detail: string): Response => json(503, { ok: false, reason: 'standby', detail })

// ── the registry the build wrote ──────────────────────────────────────────────────────────────

export type RegistryState = 'open' | 'closed' | 'stopped' | 'unchecked' | 'refused' | 'gone'
const REGISTRY_STATES: readonly string[] = ['open', 'closed', 'stopped', 'unchecked', 'refused', 'gone']

export interface KnownStudy {
  id: string
  work: string
  href: string | null
  state: RegistryState
  /** the SHA-256 of the file the check passed, stored with every answer set */
  sha256: string
  manifest: StudyManifest | null
}

let registryCache: { at: number; studies: Map<string, KnownStudy> } | null = null

export function resetRegistryCache(): void {
  registryCache = null
}

/** dist/study/studies.json, or null when it is missing or malformed, or names a study twice — the
 *  endpoints then declare standby rather than accept any id, or guess which entry holds. */
export function parseRegistry(data: unknown): Map<string, KnownStudy> | null {
  const list = (data as { known?: unknown })?.known
  if ((data as { schema?: unknown })?.schema !== 1 || !Array.isArray(list)) return null
  const out = new Map<string, KnownStudy>()
  for (const raw of list) {
    const s = raw as KnownStudy
    if (!s || typeof s.id !== 'string' || !STUDY_ID.test(s.id) || typeof s.work !== 'string' || out.has(s.id)) return null
    if (!REGISTRY_STATES.includes(s.state) || typeof s.sha256 !== 'string' || !SHA256.test(s.sha256)) return null
    if (s.state === 'open' && (!s.manifest || !Array.isArray(s.manifest.questions))) return null
    out.set(s.id, s)
  }
  return out
}

async function loadRegistry(request: Request, env: StudyEnv, deps: Deps): Promise<Map<string, KnownStudy> | null> {
  const nowMs = deps.now().getTime()
  if (registryCache && nowMs - registryCache.at < REGISTRY_TTL_MS) return registryCache.studies
  if (!env.ASSETS) return null
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/study/studies.json', request.url).toString()))
    if (!res.ok) return null
    const studies = parseRegistry(await res.json())
    if (!studies) return null
    registryCache = { at: nowMs, studies }
    return studies
  } catch {
    return null
  }
}

// ── small guards (the reception's, repeated rather than shared) ───────────────────────────────

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

async function verifyTurnstile(
  deps: Deps,
  secret: string,
  token: unknown,
  ip: string | null,
  expected: { cdata: string; hostname: string },
): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0 || token.length > 4096) return false
  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', token)
  if (ip) form.set('remoteip', ip)
  try {
    const res = await deps.fetch(TURNSTILE_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form.toString() })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: unknown; action?: unknown; cdata?: unknown; hostname?: unknown }
    if (data?.success !== true) return false
    if (TEST_SECRET.test(secret)) return true
    return data.action === TURNSTILE_ACTION && data.cdata === expected.cdata && data.hostname === expected.hostname
  } catch {
    return false
  }
}

const askedStudy = (request: Request): string | null => {
  const id = new URL(request.url).searchParams.get('study')
  return id && STUDY_ID.test(id) ? id : null
}

// ── POST /api/study/submit ────────────────────────────────────────────────────────────────────

export async function handleSubmit(request: Request, env: StudyEnv, deps: Deps): Promise<Response> {
  if (foreign(request)) return json(403, { ok: false, reason: 'origin' })
  const read = await readBody(request)
  if (!read.ok) return read.res
  const body = read.body
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(200, { ok: true })

  const now = deps.now()
  if (await tooFast(request, now.getTime())) return json(429, { ok: false, reason: 'too-fast' })

  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  if (!env.TURNSTILE_SECRET_KEY) return standby('bot-check')
  const registry = await loadRegistry(request, env, deps)
  if (!registry) return standby('registry')

  const day = dayOf(now)
  const study = typeof body.study === 'string' ? registry.get(body.study) : undefined
  if (!study) return json(404, { ok: false, reason: 'unknown-study' })
  if (study.state !== 'open' || !study.manifest || isClosed(study.manifest, day)) return json(403, { ok: false, reason: 'not-open' })
  if (body.consent !== CONSENT_VERSION) return json(422, { ok: false, reason: 'consent' })
  // answers given to the questions a reader saw, never to a newer version of a changed file
  if (body.manifest !== study.sha256) return json(422, { ok: false, reason: 'version' })
  const checked = checkAnswers(study.manifest, body.answers)
  if (!checked.ok) return json(422, { ok: false, reason: 'answers', question: checked.question ?? null })

  const ip = request.headers.get('cf-connecting-ip')
  const expected = { cdata: study.id, hostname: new URL(request.url).hostname }
  if (!(await verifyTurnstile(deps, env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip, expected))) return json(403, { ok: false, reason: 'turnstile' })

  try {
    await ensureSchema(db)
    if ((await countOf(db, day, 'entries')) >= DAILY_CAP || (await countOf(db, day, `study:${study.id}`)) >= STUDY_DAILY_CAP) return standby('daily-cap')
    const salt = await todaysSalt(db, day, randomHex(32))
    const hash = await dayHash(salt, ip ?? 'unknown', request.headers.get('user-agent') ?? 'unknown')
    const addr = await dayHash(salt, `address:${ip ?? 'unknown'}`, '')
    if (await hasMark(db, hash, study.id)) return json(429, { ok: false, reason: 'once-a-day' })
    if ((await addressCount(db, addr, study.id)) >= ADDRESS_DAILY_MAX) return json(429, { ok: false, reason: 'address-limit' })

    const text = textOf(study.manifest, checked.value)
    if (text !== null) {
      if (!env.GEMINI_API_KEY) return standby('text-check')
      if ((await countOf(db, day, 'gate')) >= GATE_DAILY_CAP) return json(503, { ok: false, reason: 'gate-cap' })
      await bump(db, day, 'gate')
      const verdict = await runReceptionGate(deps.fetch, env.GEMINI_API_KEY, { work: study.work, text, name: null })
      if (verdict.verdict === 'invalid') return json(503, { ok: false, reason: 'gate-unavailable', retry: true })
      if (verdict.verdict === 'block') {
        await bump(db, day, `refused:${verdict.reason}`)
        return json(422, { ok: false, reason: 'gate', code: verdict.reason })
      }
    }

    const stored = await insertAnswers(
      db,
      `s-${randomHex(8)}`,
      { study: study.id, consent: CONSENT_VERSION, manifest: study.sha256, answers: checked.value },
      { hash, addr, day },
    )
    if (stored !== 'stored') return json(429, { ok: false, reason: stored })
    return json(200, { ok: true, status: 'stored', study: study.id, entries: await studyTotal(db, study.id) })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET /api/study/status?study= ──────────────────────────────────────────────────────────────

export async function handleStatus(request: Request, env: StudyEnv, deps: Deps): Promise<Response> {
  const id = askedStudy(request)
  if (!id) return json(400, { ok: false, reason: 'unknown-study' })
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  const registry = await loadRegistry(request, env, deps)
  if (!registry) return standby('registry')
  const study = registry.get(id)
  if (!study) return json(404, { ok: false, reason: 'unknown-study' })
  try {
    await ensureSchema(db)
    const day = dayOf(deps.now())
    const entries = await studyTotal(db, id)
    let standbyReason: string | null = null
    if (study.state !== 'open' || !study.manifest) standbyReason = study.state
    else if (isClosed(study.manifest, day)) standbyReason = 'closed'
    else if (!env.TURNSTILE_SECRET_KEY) standbyReason = 'bot-check'
    else if (hasText(study.manifest) && !env.GEMINI_API_KEY) standbyReason = 'text-check'
    else if ((await countOf(db, day, 'entries')) >= DAILY_CAP || (await countOf(db, day, `study:${id}`)) >= STUDY_DAILY_CAP) standbyReason = 'daily-cap'
    return json(200, { ok: true, study: id, open: standbyReason === null, standby: standbyReason, entries })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}

// ── GET /api/study/record?study= ──────────────────────────────────────────────────────────────

/** The released batches of one study's finished days. What the nightly snapshot commits and hands
 *  to the practice. Every call first clears what a finished day kept to stop a second answer set —
 *  also when no study is open, the registry stands by, or the id is unknown — so the nightly
 *  snapshot's call keeps the promise "by the next night at the latest" whatever else is true. */
export async function handleRecord(request: Request, env: StudyEnv, deps: Deps): Promise<Response> {
  const db = env.RECEPTION_DB
  if (!db) return standby('store')
  const today = dayOf(deps.now())
  try {
    await ensureSchema(db)
    await cleanup(db, today)
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  const id = askedStudy(request)
  if (!id) return json(400, { ok: false, reason: 'unknown-study' })
  const registry = await loadRegistry(request, env, deps)
  if (!registry) return standby('registry')
  const study = registry.get(id)
  if (!study) return json(404, { ok: false, reason: 'unknown-study' })
  try {
    const entries = releaseBatches(await finishedEntries(db, id, today))
    return json(200, { ok: true, schema: 1, study: id, work: study.work, state: study.state, batch_size: BATCH_SIZE, entries_count: entries.length, entries })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
}
