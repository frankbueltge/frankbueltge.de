// @ts-nocheck
// Answering a letter by email — the outbound half of the reply route (spec
// 2026-08-01-rueckweg-email-design.md §2.3).
//
// POST (authed) { letterId, subject, text } → reads the letter from the KV queue, requires
// its contact field to be an email address, sends Frank's text via Brevo transactional from
// the verified sender, and marks the letter `answered` in KV (it stays visible in the
// Briefkasten until dismissed — an answered letter is a state worth seeing, not a deletion).
//
// "Nothing sends itself" (post office rule / spec D3) holds by construction: the only caller
// is the Steuerzentrale behind the bearer token, and the text is written by Frank in the
// moment. No template, no schedule, no automation.
//
// Security invariants: fail-closed; the contact address never appears in any log or error;
// errors are reported by class. Same-origin only.
import { checkToken } from '../../../src/lib/zentrale/auth'
import { isEmail, brevoReplyRequest, brevoMissing, NEED } from '../../../src/lib/post/brevo'

const MAX_BODY_BYTES = 16384
const LETTER_PREFIX = 'letter:'

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

function field(value, min, max) {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (t.length < min || t.length > max) return null
  return t
}

export async function onRequestGet(context) {
  const { request, env } = context
  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  const missing = brevoMissing(env, NEED.reply)
  if (!env.SEED_PENDING_KV) missing.push('SEED_PENDING_KV')
  return json(200, { ready: missing.length === 0, missing })
}

export async function onRequestPost(context) {
  const { request, env } = context

  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  if ((request.headers.get('content-type') || '').split(';')[0].trim() !== 'application/json') {
    return json(415, { ok: false, code: 'content-type' })
  }
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, code: 'too-large' })
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { ok: false, code: 'bad-json' })
  }

  if (brevoMissing(env, NEED.reply).length > 0 || !env.SEED_PENDING_KV) {
    return json(503, { ok: false, code: 'standby' })
  }

  const letterId = field(body.letterId, 6, 80)
  const subject = field(body.subject, 3, 160)
  const text = field(body.text, 10, 8000)
  if (!letterId) return json(422, { ok: false, code: 'letter-id' })
  if (!subject) return json(422, { ok: false, code: 'subject' })
  if (!text) return json(422, { ok: false, code: 'text' })

  let letter
  try {
    const stored = await env.SEED_PENDING_KV.get(`${LETTER_PREFIX}${letterId}`)
    letter = stored ? JSON.parse(stored) : null
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
  if (!letter) return json(404, { ok: false, code: 'not-found' })
  // The contact field is free-form ("email or similar") — a handle or phone number can sit
  // there. This route exists only for addresses; everything else needs a different channel.
  if (!isEmail(letter.contact)) return json(409, { ok: false, code: 'no-email' })

  const req = brevoReplyRequest({
    apiKey: env.BREVO_API_KEY,
    senderEmail: env.BREVO_SENDER_EMAIL,
    senderName: env.BREVO_SENDER_NAME || undefined,
    to: letter.contact,
    subject,
    text,
  })
  let res
  try {
    res = await fetch(req.url, req.init)
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
  if (res.status !== 201) return json(502, { ok: false, code: 'send-failed' })

  // Mark, don't delete: the Briefkasten shows the letter as answered until Frank dismisses
  // it. If this write fails the mail is already out — report that honestly instead of
  // pretending the send failed.
  try {
    await env.SEED_PENDING_KV.put(
      `${LETTER_PREFIX}${letterId}`,
      JSON.stringify({ ...letter, status: 'answered', answered_at: new Date().toISOString() }),
    )
  } catch {
    return json(200, { ok: true, sent: true, marked: false })
  }
  return json(200, { ok: true, sent: true, marked: true })
}
