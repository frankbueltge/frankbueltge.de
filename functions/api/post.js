// @ts-nocheck
// The post office letterbox — the reply route the ecology never had (decision 2026-07-31;
// Meridian's request named it "the missing half"). A letter from outside goes into a PRIVATE
// review queue (Cloudflare KV, reusing the SEED_PENDING_KV binding under its own `letter:`
// prefix) and is read by Frank before anything reaches a practice. Letters are mail, not
// publications: no license consent, no AI gate — the human review IS the gate.
//
// Guardrail chain, in order (mirrors functions/api/seed.js, minus the AI gate):
//   1. Method/Content-Type/size guard      → 4xx
//   2. Honeypot (`website` field)          → silent 200 without id
//   3. In-memory rate limit (best effort)  → 429
//   —  Standby guard: any missing binding ⇒ 503 standby (fail-closed)
//   4. Mechanical validation               → 422
//   5. Turnstile server-side               → 403
//   6. Caps (daily + open, via KV prefix)  → 429
//   7. Write to KV pending                 → 502 on upstream error
//
// Security invariants: fail-closed everywhere; no secret in any error, log or response;
// same-origin only (no CORS headers). GET without auth is a readiness probe (names only);
// GET with the Steuerzentrale bearer lists the queue so Frank can read letters today,
// before a review surface exists.
import { checkToken } from '../../src/lib/zentrale/auth'

const MAX_BODY_BYTES = 8192
const LETTER_PREFIX = 'letter:'
const DAILY_CAP = 10
const OPEN_CAP = 50
const RATE_MAX = 3
const RATE_WINDOW_MS = 10 * 60 * 1000
const rateMap = new Map()

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
// 'frank' joined 2026-08-01: the /contact form posts into this same queue — one intake, one
// review surface (spec 2026-08-01-rueckweg-email-design.md D5). A letter to frank is personal
// mail and is never forwarded to a practice.
const TO = new Set(['ecology', 'atelier', 'field', 'studio', 'plenum', 'frank'])

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '')

async function clientHash(request) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  const ua = request.headers.get('user-agent') ?? 'unknown'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}·${ua}`))
  return [...new Uint8Array(digest.slice(0, 8))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function rateLimited(key) {
  const now = Date.now()
  const hits = (rateMap.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (hits.length >= RATE_MAX) return true
  hits.push(now)
  rateMap.set(key, hits)
  if (rateMap.size > 5000) rateMap.clear()
  return false
}

async function verifyTurnstile(secret, responseToken, ip) {
  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', typeof responseToken === 'string' ? responseToken : '')
  if (ip) form.set('remoteip', ip)
  let res
  try {
    res = await fetch(TURNSTILE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
  } catch {
    return false
  }
  if (!res.ok) return false
  try {
    return (await res.json())?.success === true
  } catch {
    return false
  }
}

/** trims, enforces a length window, strips nothing else — letters arrive verbatim */
function field(value, min, max) {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (t.length < min || t.length > max) return null
  return t
}

export async function onRequestGet(context) {
  const { request, env } = context
  const missing = []
  if (!env.TURNSTILE_SECRET_KEY) missing.push('TURNSTILE_SECRET_KEY')
  if (!env.SEED_PENDING_KV) missing.push('SEED_PENDING_KV')

  // With the Steuerzentrale header: list the queue (Frank's interim reading surface,
  // same auth as functions/api/zentrale/*: x-zentrale-auth, constant-time compare).
  if (env.SEED_PENDING_KV && checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    try {
      const listed = await env.SEED_PENDING_KV.list({ prefix: LETTER_PREFIX })
      const letters = []
      for (const k of listed.keys) {
        const v = await env.SEED_PENDING_KV.get(k.name)
        if (v) letters.push(JSON.parse(v))
      }
      return json(200, { ok: true, count: letters.length, letters })
    } catch {
      return json(502, { ok: false, reason: 'upstream' })
    }
  }

  return json(200, { ready: missing.length === 0, missing })
}

// Dismiss a handled letter (Steuerzentrale only): DELETE /api/post?id=letter-… — removes it
// from the private queue. Letters were never public, so deletion is the whole lifecycle.
export async function onRequestDelete(context) {
  const { request, env } = context
  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, reason: 'auth' })
  }
  if (!env.SEED_PENDING_KV) return json(503, { ok: false, reason: 'standby' })
  const id = new URL(request.url).searchParams.get('id') || ''
  if (!/^letter-\d{8}-[0-9a-f]{8}$/.test(id)) return json(422, { ok: false, reason: 'id' })
  try {
    await env.SEED_PENDING_KV.delete(`${LETTER_PREFIX}${id}`)
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  return json(200, { ok: true, id })
}

export async function onRequestPost(context) {
  const { request, env } = context

  const ctype = request.headers.get('content-type') || ''
  if (!ctype.includes('application/json')) return json(415, { ok: false, reason: 'content-type' })
  const declaredLen = Number(request.headers.get('content-length') || '0')
  if (Number.isFinite(declaredLen) && declaredLen > MAX_BODY_BYTES) return json(413, { ok: false, reason: 'too-large' })
  let raw
  try {
    raw = await request.text()
  } catch {
    return json(400, { ok: false, reason: 'bad-json' })
  }
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, reason: 'too-large' })
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { ok: false, reason: 'bad-json' })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { ok: false, reason: 'bad-json' })

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(200, { ok: true })
  }

  if (rateLimited(await clientHash(request))) return json(429, { ok: false, reason: 'rate-limit' })

  const turnstileSecret = env.TURNSTILE_SECRET_KEY
  const kv = env.SEED_PENDING_KV
  if (!turnstileSecret || !kv) return json(503, { ok: false, reason: 'standby' })

  const to = typeof body.to === 'string' && TO.has(body.to) ? body.to : null
  const fromMark = field(body.fromMark, 2, 80)
  const contact = body.contact === undefined || body.contact === '' ? '' : field(body.contact, 3, 200)
  const regarding = body.regarding === undefined || body.regarding === '' ? '' : field(body.regarding, 3, 120)
  const text = field(body.text, 10, 4000)
  if (!to) return json(422, { ok: false, reason: 'to' })
  if (!fromMark) return json(422, { ok: false, reason: 'from-mark' })
  if (contact === null) return json(422, { ok: false, reason: 'contact' })
  if (regarding === null) return json(422, { ok: false, reason: 'regarding' })
  if (!text) return json(422, { ok: false, reason: 'text' })

  const ip = request.headers.get('cf-connecting-ip') || undefined
  if (!(await verifyTurnstile(turnstileSecret, body.turnstileToken, ip))) {
    return json(403, { ok: false, reason: 'turnstile' })
  }

  const now = new Date()
  let openTotal, todayTotal
  try {
    openTotal = (await kv.list({ prefix: LETTER_PREFIX })).keys.length
    todayTotal = (await kv.list({ prefix: `${LETTER_PREFIX}letter-${ymd(now)}` })).keys.length
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  if (todayTotal >= DAILY_CAP) return json(429, { ok: false, reason: 'daily-cap' })
  if (openTotal >= OPEN_CAP) return json(429, { ok: false, reason: 'open-cap' })

  const rand = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('')
  const id = `letter-${ymd(now)}-${rand}`
  try {
    await kv.put(
      `${LETTER_PREFIX}${id}`,
      JSON.stringify({ id, to, fromMark, contact, regarding, text, received_at: now.toISOString(), status: 'pending_review' }),
    )
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }

  return json(200, { ok: true, id, status: 'pending_review' })
}
