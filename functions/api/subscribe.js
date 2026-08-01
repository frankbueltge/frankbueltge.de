// @ts-nocheck
// Digest subscription — the community foundation (spec 2026-08-01-rueckweg-email-design.md).
//
// POST { email, turnstileToken } → Brevo double-opt-in: Brevo mails its confirmation
// template, and the address joins the list only after the visitor clicks. This function
// stores NOTHING itself — the address exists in Brevo and nowhere else (spec D2), and
// the one automated mail this triggers is the confirmation the visitor just asked for
// (spec D3).
//
// Guardrail chain mirrors the letterbox (functions/api/post.js), minus KV writes:
//   1. Method/Content-Type/size guard      → 4xx
//   2. Honeypot (`website` field)          → silent 200
//   3. In-memory rate limit (best effort)  → 429
//   —  Standby guard: missing secret/id ⇒ 503 with the missing names on GET (spec D4)
//   4. Mechanical validation (isEmail)     → 422
//   5. Turnstile server-side               → 403
//   6. Brevo DOI call                      → 502 on upstream error
//
// Security invariants: fail-closed; no secret and NO ADDRESS in any log or error;
// same-origin only (no CORS headers).
import { isEmail, brevoDoiRequest, brevoMissing, brevoId, NEED } from '../../src/lib/post/brevo'

const MAX_BODY_BYTES = 2048
const RATE_MAX = 3
const RATE_WINDOW_MS = 10 * 60 * 1000
const rateMap = new Map()

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const REDIRECT_URL = 'https://frankbueltge.de/post/?subscribed=1'

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

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

/** Everything the subscribe path needs; ids must parse as positive integers too. */
function missingPieces(env) {
  const missing = brevoMissing(env, NEED.subscribe)
  if (!env.TURNSTILE_SECRET_KEY) missing.push('TURNSTILE_SECRET_KEY')
  if (!missing.includes('BREVO_LIST_ID') && brevoId(env.BREVO_LIST_ID) === null) missing.push('BREVO_LIST_ID (not a number)')
  if (!missing.includes('BREVO_DOI_TEMPLATE_ID') && brevoId(env.BREVO_DOI_TEMPLATE_ID) === null)
    missing.push('BREVO_DOI_TEMPLATE_ID (not a number)')
  return missing
}

export async function onRequestGet(context) {
  const missing = missingPieces(context.env)
  return json(200, { ready: missing.length === 0, missing })
}

export async function onRequestPost(context) {
  const { request, env } = context

  if ((request.headers.get('content-type') || '').split(';')[0].trim() !== 'application/json') {
    return json(415, { ok: false, reason: 'content-type' })
  }
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, reason: 'too-large' })
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { ok: false, reason: 'bad-json' })
  }

  // Honeypot: bots fill every field; people never see this one.
  if (typeof body.website === 'string' && body.website !== '') return json(200, { ok: true })

  if (rateLimited(await clientHash(request))) return json(429, { ok: false, reason: 'rate-limit' })

  if (missingPieces(env).length > 0) return json(503, { ok: false, reason: 'standby' })

  if (!isEmail(body.email)) return json(422, { ok: false, reason: 'email' })

  const ip = request.headers.get('cf-connecting-ip') || undefined
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip))) {
    return json(403, { ok: false, reason: 'turnstile' })
  }

  const req = brevoDoiRequest({
    apiKey: env.BREVO_API_KEY,
    email: body.email,
    listId: brevoId(env.BREVO_LIST_ID),
    templateId: brevoId(env.BREVO_DOI_TEMPLATE_ID),
    redirectionUrl: REDIRECT_URL,
  })
  let res
  try {
    res = await fetch(req.url, req.init)
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  // Brevo answers 201 (created) or 204 (already known — it re-mails the confirmation).
  // Both mean: the visitor now has a confirmation mail. Anything else is upstream trouble;
  // the class is reported, the address never is.
  if (res.status !== 201 && res.status !== 204) return json(502, { ok: false, reason: 'upstream' })

  return json(200, { ok: true, status: 'confirmation-sent' })
}
