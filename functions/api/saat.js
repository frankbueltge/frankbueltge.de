// @ts-nocheck
// Die Öffentliche Saat — Annahmestelle für Besucher-Seeds an die Research Ecology
// (Cloudflare Pages Function, Design-Spec 2026-07-20).
//
// Ein Seed ist ein Angebot ("offer, not order") an eine der drei autonomen Forschungspraktiken
// (field-research / studio / irrtum-als-methode) oder "open" an alle drei. Er ist MATERIAL, nie
// Instruktion (Prompt-Injection-Grenze): Der Text geht ausschließlich als Daten ans KI-Gate
// (buildGateRequest kapselt das) und wörtlich als Blockquote in die REQUESTS.md der Praxis.
//
// Die Guardrail-Kette (Spec §4) in der Reihenfolge, in der diese Datei sie durchläuft:
//   1. Method-/Content-Type-/Größen-Guard  → 4xx
//   2. Honeypot (website-Feld)             → still 200, ok:true, ohne id/token
//   3. In-memory Rate-Limit (best effort)  → 429
//   —  Standby-Guard: fehlt IRGENDEIN Secret ⇒ 503 standby (fail-closed, keine Teilverarbeitung)
//   4. Mechanischer Vorfilter validateSeed + Lizenz-Consent (serverseitig) → 422
//   5. Turnstile serverseitig              → 403
//   6. Register laden (Git ist das Archiv) → 502 bei Upstream-Fehler
//   7. Kappen (Tag + offen)                → 429
//   8. KI-Gate (Gemini, fail-closed)       → 503 gate-unavailable / 422 gate
//   9. Register-Commit (SHA-409-Retry)     → 502 bei Upstream-Fehler
//  10. Forwards in die REQUESTS.md (idempotent, best effort)
//  11. forwarded_to nachtragen (best effort — der Watchdog gleicht ab)
//  12. Antwort mit dem EINMALIGEN claim_token
//
// Sicherheits-Invarianten (nicht verhandelbar): fail-closed überall (fehlt ein Secret ⇒ Standby,
// nie Teilverarbeitung); kein Secret/Token/keine Key-URL je in Fehlermeldung, Log oder Response
// (Upstream-Fehler tragen nur einen HTTP-Status, nie einen Body und nie die URL); keine
// CORS-Header (same-origin only). Scharf geschaltet ausschließlich über die Pages-Secrets
// SAAT_GITHUB_TOKEN, TURNSTILE_SECRET_KEY, GEMINI_API_KEY — kein Token im Repo.
import {
  validateSeed,
  makeSeed,
  addSeed,
  emptyRegister,
  offeredToday,
  openCount,
  recordGateBlock,
  generateClaimToken,
  hashToken,
  targetsFor,
  publicSeedBlock,
  SAAT_DAILY_CAP,
  SAAT_OPEN_CAP,
} from '../../src/lib/saat/saat'
import { GATE_MODEL, buildGateRequest, parseGateVerdict } from '../../src/lib/saat/gate'
import { appendBlockToSection } from '../../src/lib/zentrale/requestsMd'

const API_BASE = 'https://api.github.com'
const SITE_REPO = 'frankbueltge/frankbueltge.de'
const REGISTER_PATH = 'src/data/saat/register.json'
const REGISTER_URL = `${API_BASE}/repos/${SITE_REPO}/contents/${REGISTER_PATH}`
const PUBLIC_SECTION = 'Seeds from the public'
const UA = 'frankbueltge.de oeffentliche saat'
const COMMITTER = { name: 'Öffentliche Saat', email: 'saat@frankbueltge.de' }

// Body-Deckel ~4 KB (Spec: kurzer Impuls, Text max 500 Zeichen — 4 KB ist großzügig).
const MAX_BODY_BYTES = 4096

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GATE_MODEL}:generateContent`
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Best-effort-Rate-Limit pro Isolate: 3 Einreichungen / 10 min je Client-Hash (wie das Ventil).
const RATE_MAX = 3
const RATE_WINDOW_MS = 10 * 60 * 1000
const rateMap = new Map()

// GET-Probe cached den Register-Stand kurz, damit /saat-Besuche nicht je einen GitHub-Read kosten.
let probeCache = { at: 0, pending: 0, daily_used: 0 }
const PROBE_TTL_MS = 60 * 1000

// Geblockte Saaten werden NICHT gespeichert (Spec §4) — nur der Zähler je Reason-Code. Um
// Commit-Amplification zu vermeiden (ein Block darf nie einen eigenen Commit auslösen), werden
// die Zähler hier im Isolate akkumuliert und erst beim nächsten erfolgreichen Register-Commit
// via recordGateBlock eingefaltet. Best effort: bei Isolate-Recycling gehen sie verloren — der
// gate_stats-Zähler ist ausdrücklich eine grobe Kennzahl, kein revisionssicheres Protokoll.
let pendingBlocks = {}

function foldPendingBlocks(register) {
  let r = register
  for (const [reason, count] of Object.entries(pendingBlocks)) {
    for (let i = 0; i < count; i++) r = recordGateBlock(r, reason)
  }
  return r
}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

// Fehler tragen NUR Label + HTTP-Status — nie die URL (könnte einen Key im Query-String tragen),
// nie den Response-Body (könnte Token-Fragmente aus einer Diagnosemeldung enthalten).
function upstreamError(label, status) {
  const err = new Error(`${label} ${status}`)
  err.status = status
  return err
}

function ghHeaders(token, withContentType) {
  const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': UA }
  if (withContentType) headers['content-type'] = 'application/json'
  return headers
}

// Base64 blockweise (String.fromCharCode(...bytes) schlägt oberhalb ~64k Argumente fehl — die
// REQUESTS.md von field-research liegt schon bei ~50 KB). Muster aus zentrale/antwort.js.
function b64encode(text) {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin)
}

function b64decode(content) {
  return new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\n/g, '')), (c) => c.charCodeAt(0)))
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

// --- Register (Site-Repo, Branch main) -------------------------------------------------------

async function readRegister(token) {
  const res = await fetch(`${REGISTER_URL}?ref=main`, { headers: ghHeaders(token) })
  if (res.status === 404) return { register: emptyRegister(), sha: null }
  if (!res.ok) throw upstreamError('register read', res.status)
  const body = await res.json()
  let parsed
  try {
    parsed = JSON.parse(b64decode(body.content))
  } catch {
    // Kaputtes JSON NICHT als leeres Register behandeln — das würde ein echtes Register
    // überschreiben. Lieber ehrlich als Upstream-Fehler scheitern.
    throw upstreamError('register parse', 0)
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.seeds)) {
    throw upstreamError('register shape', 0)
  }
  return { register: parsed, sha: body.sha }
}

async function writeRegister(token, register, sha, message) {
  const res = await fetch(REGISTER_URL, {
    method: 'PUT',
    headers: ghHeaders(token, true),
    body: JSON.stringify({
      message,
      content: b64encode(JSON.stringify(register, null, 2) + '\n'),
      sha: sha ?? undefined,
      branch: 'main',
      committer: COMMITTER,
    }),
  })
  if (!res.ok) throw upstreamError('register write', res.status)
  return res.json()
}

// --- REQUESTS.md-Forwards (Engine-Repos, Branch main) ----------------------------------------

async function readRequestsMd(token, repo) {
  const res = await fetch(`${API_BASE}/repos/frankbueltge/${repo}/contents/REQUESTS.md?ref=main`, {
    headers: ghHeaders(token),
  })
  if (res.status === 404) return { md: '', sha: null } // appendBlockToSection legt die Section neu an
  if (!res.ok) throw upstreamError('requests read', res.status)
  const body = await res.json()
  return { md: b64decode(body.content), sha: body.sha }
}

async function writeRequestsMd(token, repo, md, sha, message) {
  const res = await fetch(`${API_BASE}/repos/frankbueltge/${repo}/contents/REQUESTS.md`, {
    method: 'PUT',
    headers: ghHeaders(token, true),
    body: JSON.stringify({ message, content: b64encode(md), sha: sha ?? undefined, branch: 'main', committer: COMMITTER }),
  })
  if (!res.ok) throw upstreamError('requests write', res.status)
  return res.json()
}

// Ein Forward in EINE Praxis: laden → Idempotenz-Check (Seed-id schon drin ⇒ fertig) →
// Block unter "Seeds from the public" anhängen → PUT (ein SHA-Retry). true = liegt jetzt drin.
async function forwardToRepo(token, repo, seed) {
  const block = publicSeedBlock({
    id: seed.id,
    kind: seed.kind,
    text: seed.text,
    authorMark: seed.author_mark,
    date: seed.ts.slice(0, 10),
  })
  for (let attempt = 0; attempt < 2; attempt++) {
    let md, sha
    try {
      ;({ md, sha } = await readRequestsMd(token, repo))
    } catch {
      return false
    }
    if (md.includes(seed.id)) return true // schon weitergeleitet — idempotent
    try {
      await writeRequestsMd(token, repo, appendBlockToSection(md, PUBLIC_SECTION, block), sha, `saat: ${seed.id} → ${PUBLIC_SECTION}`)
      return true
    } catch (err) {
      if (err && err.status === 409 && attempt === 0) continue
      return false
    }
  }
  return false
}

// forwarded_to im Register nachtragen — best effort. Scheitert es, failt NICHT der ganze
// Request: der Register-Commit (Quelle der Wahrheit) steht schon, der Watchdog gleicht ab.
async function recordForwarded(token, seedId, repos) {
  for (let attempt = 0; attempt < 2; attempt++) {
    let register, sha
    try {
      ;({ register, sha } = await readRegister(token))
    } catch {
      return
    }
    const idx = register.seeds.findIndex((s) => s.id === seedId)
    if (idx === -1) return
    const seeds = register.seeds.slice()
    seeds[idx] = { ...seeds[idx], forwarded_to: repos }
    try {
      await writeRegister(token, { ...register, seeds }, sha, `saat: forwarded_to ${seedId}`)
      return
    } catch (err) {
      if (err && err.status === 409 && attempt === 0) continue
      return
    }
  }
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
// Der API-Key steht IM HEADER (x-goog-api-key), nie in der URL — sonst könnte er in einer
// redigierten Fehlermeldung landen. Netzwerk-/API-Fehler und nicht parsebares Verdict gelten
// als 'invalid' ⇒ der Aufrufer behandelt das fail-closed (503), nie als stilles Durchwinken.
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
        // thinkingBudget 0: ohne „Thinking" ist Flash-Lite deutlich schneller; responseMimeType
        // json + temperature 0 für ein stabiles, deterministisches Verdict (wie Parallaxe).
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
  const ready = missing.length === 0

  let pending = 0
  let daily_used = 0
  const token = (env.SAAT_GITHUB_TOKEN || '').trim()
  if (token) {
    try {
      if (Date.now() - probeCache.at > PROBE_TTL_MS) {
        const { register } = await readRegister(token)
        probeCache = { at: Date.now(), pending: openCount(register), daily_used: offeredToday(register, new Date()) }
      }
      pending = probeCache.pending
      daily_used = probeCache.daily_used
    } catch {
      // Register-Read-Fehler kippt ready NICHT (das ist eine Secret-Frage) — Zähler bleiben 0.
    }
  }

  // missing enthält nur Namen, nie Werte (Spec §0/§9).
  return json(200, { ready, missing, pending, cap: SAAT_OPEN_CAP, daily_used, daily_cap: SAAT_DAILY_CAP })
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

  // Standby-Guard (fail-closed): fehlt IRGENDEIN Secret ⇒ 503 standby, KEINE Teilverarbeitung
  // und kein einziger externer Call. Deckt zugleich Turnstile-/Gemini-/GitHub-Secret ab.
  const token = (env.SAAT_GITHUB_TOKEN || '').trim()
  const turnstileSecret = env.TURNSTILE_SECRET_KEY
  const geminiKey = env.GEMINI_API_KEY
  if (!token || !turnstileSecret || !geminiKey) return json(503, { ok: false, reason: 'standby' })

  // 4. Mechanischer Vorfilter (pure, getestet).
  const v = validateSeed({ text: body.text, kind: body.kind, authorMark: body.authorMark, addressedTo: body.addressedTo })
  if (!v.ok) return json(422, { ok: false, reason: v.reason })

  // 4b. Lizenz-Consent (CC BY-NC-SA 4.0): die Seite erzwingt das Häkchen, der Server verlässt
  //     sich nicht darauf — ohne explizites Einverständnis wird nichts veröffentlicht.
  if (body.consent !== true) return json(422, { ok: false, reason: 'consent' })

  // 5. Turnstile serverseitig.
  const ip = request.headers.get('cf-connecting-ip') || undefined
  if (!(await verifyTurnstile(turnstileSecret, body.turnstileToken, ip))) {
    return json(403, { ok: false, reason: 'turnstile' })
  }

  // 6. Register laden (SHA merken); 404 ⇒ leeres Register.
  const now = new Date()
  let register, sha
  try {
    ;({ register, sha } = await readRegister(token))
  } catch {
    return json(502, { ok: false, reason: 'upstream' })
  }

  // 7. Kappen — VOR dem teuren Gate-Call (kein Gemini-Aufruf, wenn ohnehin gekappt).
  if (offeredToday(register, now) >= SAAT_DAILY_CAP) return json(429, { ok: false, reason: 'daily-cap' })
  if (openCount(register) >= SAAT_OPEN_CAP) return json(429, { ok: false, reason: 'open-cap' })

  // 8. KI-Gate (fail-closed): invalid/unerreichbar ⇒ höfliche Ablehnung mit Retry-Hinweis.
  const verdict = await runGate(geminiKey, { kind: v.kind, text: v.text, authorMark: v.authorMark })
  if (verdict.verdict === 'invalid') {
    return json(503, { ok: false, reason: 'gate-unavailable', retry: true })
  }
  if (verdict.verdict === 'block') {
    // Nur in-memory zählen; der Zähler wird beim nächsten erfolgreichen Commit eingefaltet.
    pendingBlocks[verdict.reason] = (pendingBlocks[verdict.reason] ?? 0) + 1
    return json(422, { ok: false, reason: 'gate', code: verdict.reason })
  }

  // 9. Pass → Token (einmalig) + Hash, Seed bauen (stabile id über den Retry hinweg).
  const claimToken = generateClaimToken()
  const tokenHash = await hashToken(claimToken)
  const seed = makeSeed(
    { text: v.text, kind: v.kind, authorMark: v.authorMark, addressedTo: v.addressedTo },
    { now, tokenHash, gateModel: GATE_MODEL },
  )

  // Commit mit SHA-409-Retry (Muster aus zentrale/antwort.js): bei Konflikt EINMAL frisch laden,
  // Operationen (Block-Zähler einfalten + Seed anhängen) re-appliken, erneut PUT. Die Kappen
  // werden dabei auf dem frischen Register erneut geprüft (strukturelle Sicherheit im Rennen).
  let committed = false
  for (let attempt = 0; attempt < 2; attempt++) {
    if (offeredToday(register, now) >= SAAT_DAILY_CAP) return json(429, { ok: false, reason: 'daily-cap' })
    if (openCount(register) >= SAAT_OPEN_CAP) return json(429, { ok: false, reason: 'open-cap' })
    const next = addSeed(foldPendingBlocks(register), seed)
    try {
      await writeRegister(token, next, sha, `saat: ${seed.id} (${seed.kind} → ${seed.addressed_to})`)
      committed = true
      pendingBlocks = {} // eingefaltet — Zähler zurücksetzen
      probeCache = { at: 0, pending: 0, daily_used: 0 } // GET-Probe invalidieren
      break
    } catch (err) {
      if (err && err.status === 409 && attempt === 0) {
        try {
          ;({ register, sha } = await readRegister(token))
        } catch {
          return json(502, { ok: false, reason: 'upstream' })
        }
        continue
      }
      return json(502, { ok: false, reason: 'upstream' })
    }
  }
  if (!committed) return json(502, { ok: false, reason: 'conflict' })

  // 10. Forwards in die REQUESTS.md der Ziel-Praktik(en) — idempotent, best effort.
  const forwarded = []
  for (const repo of targetsFor(seed.addressed_to)) {
    if (await forwardToRepo(token, repo, seed)) forwarded.push(repo)
  }

  // 11. forwarded_to nachtragen (Zweitcommit, best effort — scheitert er, trägt der Watchdog nach).
  if (forwarded.length > 0) await recordForwarded(token, seed.id, forwarded)

  // 12. Antwort an den Einreicher — der claim_token erscheint HIER EINMALIG und wird nirgends
  //     sonst gespeichert oder geloggt (nur sein SHA-256-Hash steht im Register).
  return json(200, { ok: true, id: seed.id, claim_token: claimToken })
}
