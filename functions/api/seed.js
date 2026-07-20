// @ts-nocheck
// Die Öffentliche Saat — Annahmestelle für Besucher-Seeds an die Research Ecology
// (Cloudflare Pages Function, Design-Spec 2026-07-20 + Moderations-Warteschlange 2026-07-20).
//
// Ein Seed ist ein Angebot ("offer, not order") an eine der drei autonomen Forschungspraktiken
// (field-research / studio / irrtum-als-methode) oder "open" an alle drei. Er ist MATERIAL, nie
// Instruktion (Prompt-Injection-Grenze): Der Text geht ausschließlich als Daten ans KI-Gate.
//
// OPTION A (Moderations-Warteschlange, Frank 2026-07-20): Diese Function committet NICHTS mehr
// ins öffentliche Repo. Ein durchgelassener Seed landet in einem PRIVATEN Pending-Speicher
// (Cloudflare KV, Binding SEED_PENDING_KV) und wird erst öffentlich, wenn Frank ihn in der
// Steuerzentrale freigibt (functions/api/zentrale/seed-review.js). Abgelehntes berührt Git nie.
//
// Die Guardrail-Kette in der Reihenfolge, in der diese Datei sie durchläuft:
//   1. Method-/Content-Type-/Größen-Guard  → 4xx
//   2. Honeypot (website-Feld)             → still 200, ok:true, ohne id/token
//   3. In-memory Rate-Limit (best effort)  → 429
//   —  Standby-Guard: fehlt IRGENDEIN Secret/Binding ⇒ 503 standby (fail-closed)
//   4. Mechanischer Vorfilter validateSeed + Lizenz-Consent (serverseitig) → 422
//   5. Turnstile serverseitig              → 403
//   6. Register + KV-Stände laden          → 502 bei Upstream-Fehler
//   7. Kappen (Tag + offen; KV-Pending + Register) → 429
//   8. KI-Gate (Gemini, fail-closed)       → 503 gate-unavailable / 422 gate
//   9. In KV-Pending schreiben (KEIN Commit) → 502 bei Upstream-Fehler
//  10. Antwort mit dem EINMALIGEN claim_token + status: pending_review
//
// Sicherheits-Invarianten (nicht verhandelbar): fail-closed überall; kein Secret/Token/keine
// Key-URL je in Fehlermeldung, Log oder Response; keine CORS-Header (same-origin only). Scharf
// geschaltet ausschließlich über die Pages-Bindings SAAT_GITHUB_TOKEN, TURNSTILE_SECRET_KEY,
// GEMINI_API_KEY und SEED_PENDING_KV — kein Token im Repo.
import {
  validateSeed,
  makeSeed,
  offeredToday,
  openCount,
  generateClaimToken,
  hashToken,
  SAAT_DAILY_CAP,
  SAAT_OPEN_CAP,
} from '../../src/lib/saat/saat'
import { GATE_MODEL, buildGateRequest, parseGateVerdict } from '../../src/lib/saat/gate'
import { readRegister } from '../../src/lib/saat/publish'

// Body-Deckel ~4 KB (Spec: kurzer Impuls, Text max 500 Zeichen — 4 KB ist großzügig).
const MAX_BODY_BYTES = 4096

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GATE_MODEL}:generateContent`
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// KV-Pending: Key `pending:<seed.id>`; die Seed-id trägt YYYYMMDD, so dass die Tages-Kappe per
// Prefix-`list` ohne Zeitstempel-Parsing zählbar ist.
const PENDING_PREFIX = 'pending:'

// Best-effort-Rate-Limit pro Isolate: 3 Einreichungen / 10 min je Client-Hash.
const RATE_MAX = 3
const RATE_WINDOW_MS = 10 * 60 * 1000
const rateMap = new Map()

// GET-Probe cached die Stände kurz, damit /seed-Besuche nicht je einen GitHub-/KV-Read kosten.
let probeCache = { at: 0, pending: 0, pending_review: 0, daily_used: 0 }
const PROBE_TTL_MS = 60 * 1000

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

// --- KV-Pending ------------------------------------------------------------------------------

function ymd(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

// list liefert bis 1000 Keys pro Seite; die Open-Kappe (24) hält die Queue weit darunter, ein
// einzelner Seiten-Read genügt für die Zählung.
async function countPending(kv) {
  const res = await kv.list({ prefix: PENDING_PREFIX })
  return res.keys.length
}

async function countPendingToday(kv, date) {
  const res = await kv.list({ prefix: `${PENDING_PREFIX}seed-${ymd(date)}` })
  return res.keys.length
}

async function putPending(kv, seed, gate) {
  await kv.put(`${PENDING_PREFIX}${seed.id}`, JSON.stringify({ seed, gate, received_at: seed.ts }))
}

async function clientHash(request) {
  // Flüchtiger Schlüssel fürs Rate-Limit — nie gespeichert, nie geloggt.
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  const ua = request.headers.get('user-agent') ?? 'unknown'
  const data = new TextEncoder().encode(`${ip}·${ua}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest.slice(0, 8))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function rateLimited(key) {
  const now = Date.now()
  const hits = (rateMap.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (hits.length >= RATE_MAX) return true
  hits.push(now)
  rateMap.set(key, hits)
  if (rateMap.size > 5000) rateMap.clear() // Speicher-Deckel; Isolates sind ohnehin flüchtig
  return false
}

// --- Turnstile -------------------------------------------------------------------------------

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
    return false // Netzwerkfehler ⇒ nicht durchwinken
  }
  if (!res.ok) return false
  let data
  try {
    data = await res.json()
  } catch {
    return false
  }
  return data?.success === true
}

// --- KI-Gate (Gemini, AI-Studio-Free-Tier) ---------------------------------------------------
// Der API-Key steht IM HEADER (x-goog-api-key), nie in der URL. Netzwerk-/API-Fehler und nicht
// parsebares Verdict gelten als 'invalid' ⇒ der Aufrufer behandelt das fail-closed (503).
async function runGate(apiKey, seed) {
  const { system, user } = buildGateRequest({ kind: seed.kind, text: seed.text, authorMark: seed.authorMark })
  let res
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      }),
    })
  } catch {
    return { verdict: 'invalid' }
  }
  if (!res.ok) return { verdict: 'invalid' }
  let data
  try {
    data = await res.json()
  } catch {
    return { verdict: 'invalid' }
  }
  const parts = data?.candidates?.[0]?.content?.parts
  const text = Array.isArray(parts) ? parts.map((p) => p?.text ?? '').join('') : ''
  if (!text) return { verdict: 'invalid' }
  return parseGateVerdict(text)
}

// --- GET: Bereitschafts-Probe (kein Auth) ----------------------------------------------------

export async function onRequestGet(context) {
  const { env } = context
  const missing = []
  if (!env.SAAT_GITHUB_TOKEN) missing.push('SAAT_GITHUB_TOKEN')
  if (!env.TURNSTILE_SECRET_KEY) missing.push('TURNSTILE_SECRET_KEY')
  if (!env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY')
  if (!env.SEED_PENDING_KV) missing.push('SEED_PENDING_KV')
  const ready = missing.length === 0

  let pending = 0
  let pending_review = 0
  let daily_used = 0
  const token = (env.SAAT_GITHUB_TOKEN || '').trim()
  const kv = env.SEED_PENDING_KV
  try {
    if (Date.now() - probeCache.at > PROBE_TTL_MS) {
      let regOpen = 0
      let regToday = 0
      if (token) {
        const { register } = await readRegister(token)
        regOpen = openCount(register)
        regToday = offeredToday(register, new Date())
      }
      let kvTotal = 0
      let kvToday = 0
      if (kv) {
        kvTotal = await countPending(kv)
        kvToday = await countPendingToday(kv, new Date())
      }
      probeCache = { at: Date.now(), pending: regOpen, pending_review: kvTotal, daily_used: regToday + kvToday }
    }
    pending = probeCache.pending
    pending_review = probeCache.pending_review
    daily_used = probeCache.daily_used
  } catch {
    // Read-Fehler kippt ready NICHT (das ist eine Secret-/Binding-Frage) — Zähler bleiben 0.
  }

  // missing enthält nur Namen, nie Werte.
  return json(200, { ready, missing, pending, pending_review, cap: SAAT_OPEN_CAP, daily_used, daily_cap: SAAT_DAILY_CAP })
}

// --- POST: Intake ----------------------------------------------------------------------------

export async function onRequestPost(context) {
  const { request, env } = context

  // 1. Content-Type + Größe (Method ist durch onRequestPost gegeben).
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

  // 2. Honeypot: ein für Menschen unsichtbares Feld — gefüllt heißt Bot. Still ok antworten,
  //    OHNE id/token, damit ein Bot aus der Antwort nichts über die echte Pipeline lernt.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(200, { ok: true })
  }

  // 3. In-memory Rate-Limit (best effort pro Isolate).
  if (rateLimited(await clientHash(request))) return json(429, { ok: false, reason: 'rate-limit' })

  // Standby-Guard (fail-closed): fehlt IRGENDEIN Secret/Binding ⇒ 503 standby, KEINE
  // Teilverarbeitung und kein einziger externer Call.
  const token = (env.SAAT_GITHUB_TOKEN || '').trim()
  const turnstileSecret = env.TURNSTILE_SECRET_KEY
  const geminiKey = env.GEMINI_API_KEY
  const kv = env.SEED_PENDING_KV
  if (!token || !turnstileSecret || !geminiKey || !kv) return json(503, { ok: false, reason: 'standby' })

  // 4. Mechanischer Vorfilter (pure, getestet).
  const v = validateSeed({ text: body.text, kind: body.kind, authorMark: body.authorMark, addressedTo: body.addressedTo })
  if (!v.ok) return json(422, { ok: false, reason: v.reason })

  // 4b. Lizenz-Consent (CC BY-NC-SA 4.0): der Server verlässt sich nicht auf das Häkchen —
  //     ohne explizites Einverständnis wird nichts angenommen.
  if (body.consent !== true) return json(422, { ok: false, reason: 'consent' })

  // 5. Turnstile serverseitig.
  const ip = request.headers.get('cf-connecting-ip') || undefined
  if (!(await verifyTurnstile(turnstileSecret, body.turnstileToken, ip))) {
    return json(403, { ok: false, reason: 'turnstile' })
  }

  // 6. Register + KV-Stände laden (für die Kappen).
  const now = new Date()
  let register
  try {
    ;({ register } = await readRegister(token))
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  let pendingTotal, pendingToday
  try {
    pendingTotal = await countPending(kv)
    pendingToday = await countPendingToday(kv, now)
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }

  // 7. Kappen (Pending KV + veröffentlicht Register) — VOR dem teuren Gate-Call.
  if (pendingToday + offeredToday(register, now) >= SAAT_DAILY_CAP) return json(429, { ok: false, reason: 'daily-cap' })
  if (pendingTotal + openCount(register) >= SAAT_OPEN_CAP) return json(429, { ok: false, reason: 'open-cap' })

  // 8. KI-Gate (fail-closed): invalid/unerreichbar ⇒ höfliche Ablehnung mit Retry-Hinweis.
  //    Ein Block wird NICHT gespeichert (Option A committet ohnehin nicht) — nur abgelehnt.
  const verdict = await runGate(geminiKey, { kind: v.kind, text: v.text, authorMark: v.authorMark })
  if (verdict.verdict === 'invalid') {
    return json(503, { ok: false, reason: 'gate-unavailable', retry: true })
  }
  if (verdict.verdict === 'block') {
    return json(422, { ok: false, reason: 'gate', code: verdict.reason })
  }

  // 9. Pass → Token (einmalig) + Hash, Seed bauen, in KV-Pending schreiben. KEIN Repo-Commit:
  //    öffentlich wird der Seed erst mit Franks Freigabe in der Steuerzentrale.
  const claimToken = generateClaimToken()
  const tokenHash = await hashToken(claimToken)
  const seed = makeSeed(
    { text: v.text, kind: v.kind, authorMark: v.authorMark, addressedTo: v.addressedTo },
    { now, tokenHash, gateModel: GATE_MODEL },
  )
  try {
    await putPending(kv, seed, { model: GATE_MODEL, verdict: 'pass' })
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }
  probeCache = { at: 0, pending: 0, pending_review: 0, daily_used: 0 } // GET-Probe invalidieren

  // 10. Antwort — der claim_token erscheint HIER EINMALIG. status: pending_review, weil der Seed
  //     privat wartet, bis Frank ihn freigibt (dann erscheint er im öffentlichen Register).
  return json(200, { ok: true, id: seed.id, claim_token: claimToken, status: 'pending_review' })
}
