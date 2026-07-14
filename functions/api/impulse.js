// @ts-nocheck
// Das Ventil — Annahmestelle für Leser-Impulse des Atelier-Cockpits (Cloudflare Pages Function).
//
// Fluss (Spec 2026-07-14, §2d/§5/§7.3): Leser:in wirft einen kurzen Impuls ein → dieser
// VORFILTER (mechanisch: Länge, PII, URL-Policy, Honeypot, Rate-Limit, Inbox-Kappe) →
// bei Bestehen ein Commit nach pulse/impulse-inbox.json im Engine-Repo (status: pending).
// Das eigentliche Gate ist das Kollektiv: Ulysses liest pending und setzt accepted/declined
// mit Grund — hier wird nichts kuratiert, nur Mechanik geprüft. Ein Impuls ist MATERIAL,
// nie Anweisung (Prompt-Injection-Grenze; so auch in PROTOCOL/REQUESTS verankert).
//
// Datenschutz: keine IP-Speicherung, kein Log mit Personenbezug; author_mark ist ein frei
// gewähltes Pseudonym (Vorfilter verwirft E-Mail/Telefon/URLs darin). Rate-Limit läuft
// in-memory pro Isolate (best effort) über einen NICHT persistierten IP-Hash.
//
// Scharf geschaltet wird das Ventil ausschließlich über das Secret IMPULSE_GITHUB_TOKEN
// (fine-grained PAT, nur irrtum-als-methode, nur Contents read/write) in den Pages-
// Umgebungsvariablen. Ohne Token: GET → ready:false, POST → 503. Kein Token im Repo.
import {
  validateImpulse,
  makeImpulse,
  pendingCount,
  INBOX_PENDING_CAP,
} from '../../src/lib/atelier/impulse'

const REPO = 'frankbueltge/irrtum-als-methode'
const INBOX_PATH = 'pulse/impulse-inbox.json'
const API = `https://api.github.com/repos/${REPO}/contents/${INBOX_PATH}`
const UA = 'frankbueltge.de cockpit valve'

// Best-effort-Rate-Limit pro Isolate: 3 Einwürfe / 10 min je Client-Hash.
const RATE_MAX = 3
const RATE_WINDOW_MS = 10 * 60 * 1000
const rateMap = new Map()

// GET-Probe cached den Inbox-Stand kurz, damit Cockpit-Besuche nicht je einen GitHub-Read kosten.
let probeCache = { at: 0, pending: 0 }
const PROBE_TTL_MS = 5 * 60 * 1000

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

async function clientHash(request) {
  // Flüchtiger Schlüssel fürs Rate-Limit — nie gespeichert, nie geloggt.
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  const data = new TextEncoder().encode(`${ip}·${UA}`)
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

async function readInbox(token) {
  const res = await fetch(API, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': UA },
  })
  if (res.status === 404) return { inbox: [], sha: null }
  if (!res.ok) throw new Error(`github read ${res.status}`)
  const body = await res.json()
  const decoded = new TextDecoder().decode(Uint8Array.from(atob(body.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)))
  const inbox = JSON.parse(decoded)
  return { inbox: Array.isArray(inbox) ? inbox : [], sha: body.sha }
}

async function writeInbox(token, inbox, sha, impulseId) {
  const content = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(inbox, null, 2) + '\n')))
  const res = await fetch(API, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': UA, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `impulse: ${impulseId} — ein Leser-Impuls über das Ventil (pending)`,
      content,
      sha: sha ?? undefined,
      committer: { name: 'Cockpit-Ventil', email: 'cockpit-ventil@frankbueltge.de' },
    }),
  })
  if (!res.ok) throw new Error(`github write ${res.status}`)
}

export async function onRequestGet(context) {
  const token = context.env.IMPULSE_GITHUB_TOKEN
  if (!token) return json(200, { ready: false })
  try {
    if (Date.now() - probeCache.at > PROBE_TTL_MS) {
      const { inbox } = await readInbox(token)
      probeCache = { at: Date.now(), pending: pendingCount(inbox) }
    }
    return json(200, { ready: true, pending: probeCache.pending, cap: INBOX_PENDING_CAP })
  } catch {
    return json(200, { ready: false })
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const token = env.IMPULSE_GITHUB_TOKEN
  if (!token) return json(503, { ok: false, code: 'not-connected' })

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { ok: false, code: 'bad-json' })
  }

  // Honeypot: ein für Menschen unsichtbares Feld — gefüllt heißt Bot, still ok antworten.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(200, { ok: true, id: 'imp-void' })
  }

  if (rateLimited(await clientHash(request))) {
    return json(429, { ok: false, code: 'rate-limit' })
  }

  const v = validateImpulse({ text: body.text, kind: body.kind, authorMark: body.authorMark })
  if (!v.ok) return json(422, { ok: false, code: v.reason })

  try {
    // Lesen → Kappe prüfen → anhängen → schreiben; bei SHA-Konflikt einmal frisch versuchen.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { inbox, sha } = await readInbox(token)
      if (pendingCount(inbox) >= INBOX_PENDING_CAP) {
        return json(429, { ok: false, code: 'inbox-full' })
      }
      const impulse = makeImpulse(v)
      try {
        await writeInbox(token, [...inbox, impulse], sha, impulse.id)
        probeCache = { at: 0, pending: 0 } // Probe-Cache invalidieren
        return json(200, { ok: true, id: impulse.id })
      } catch (err) {
        if (attempt === 0 && String(err).includes('409')) continue
        throw err
      }
    }
    return json(502, { ok: false, code: 'conflict' })
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
}
