// @ts-nocheck
// Die Steuerzentrale — Freigabe-Schleuse der Öffentlichen Saat (Moderations-Warteschlange,
// Design-Spec 2026-07-20-saat-moderationsqueue-design.md §4).
//
// Besucher-Seeds warten seit Option A in einem PRIVATEN Pending-Speicher (Cloudflare KV,
// Binding SEED_PENDING_KV) — functions/api/seed.js committet nichts mehr selbst. Dieser
// Endpoint ist der EINZIGE Weg ins öffentliche Register:
//   GET  → Pending-Liste (nur Anzeige)
//   POST {id, decision:"approve"} → Register-Commit + REQUESTS.md-Forward, dann KV löschen
//   POST {id, decision:"reject"}  → nur KV löschen (berührt Git NIE → kein History-Problem)
//
// Sicherheits-Invariante (kritischster Check der ganzen Änderung): Auth über ZENTRALE_SECRET
// (konstante Zeit) VOR jedem KV-/GitHub-Zugriff. Ein offener Freigabe-Endpunkt wäre schlimmer
// als das Ausgangsproblem. GitHub-Writes laufen über SAAT_GITHUB_TOKEN (auf Site- + Engine-Repos
// gescopt). Kein Token/Secret je in Log, Fehler oder Response.
import { checkToken } from '../../../src/lib/zentrale/auth'
import { addSeed, targetsFor } from '../../../src/lib/saat/saat'
import { readRegister, writeRegister, forwardToRepo, recordForwarded } from '../../../src/lib/saat/publish'

const PENDING_PREFIX = 'pending:'

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

function pendingKey(id) {
  return `${PENDING_PREFIX}${id}`
}

// Seed-id-Form (seed-YYYYMMDD-HHMMSS-XXXX) streng prüfen — ein hereingereichter Key darf nie
// ein anderer KV-Eintrag als ein Pending-Seed sein.
function validId(id) {
  return typeof id === 'string' && /^seed-\d{8}-\d{6}-[0-9a-f]{4}$/.test(id)
}

// --- GET: Pending-Liste (nur Anzeige) --------------------------------------------------------

export async function onRequestGet(context) {
  const { request, env } = context
  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  const kv = env.SEED_PENDING_KV
  if (!kv) return json(503, { ok: false, code: 'not-connected' })

  const items = []
  try {
    const listed = await kv.list({ prefix: PENDING_PREFIX })
    for (const k of listed.keys) {
      const val = await kv.get(k.name)
      if (!val) continue
      let parsed
      try {
        parsed = JSON.parse(val)
      } catch {
        continue
      }
      const s = parsed && parsed.seed
      if (!s) continue
      items.push({
        id: s.id,
        kind: s.kind,
        text: s.text,
        author_mark: s.author_mark,
        addressed_to: s.addressed_to,
        ts: s.ts,
        gate: parsed.gate ?? null,
      })
    }
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
  items.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0)) // neueste zuerst
  return json(200, { ok: true, pending: items })
}

// --- POST: Entscheidung ----------------------------------------------------------------------

export async function onRequestPost(context) {
  const { request, env } = context
  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  const kv = env.SEED_PENDING_KV
  const token = (env.SAAT_GITHUB_TOKEN || '').trim()
  if (!kv || !token) return json(503, { ok: false, code: 'not-connected' })

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { ok: false, code: 'bad-json' })
  }
  const id = body && body.id
  const decision = body && body.decision
  if (!validId(id)) return json(422, { ok: false, code: 'bad-id' })
  if (decision !== 'approve' && decision !== 'reject') return json(422, { ok: false, code: 'bad-decision' })

  const key = pendingKey(id)

  // Reject: nur aus KV löschen — nie ein Git-Zugriff. Idempotent (fehlt der Key, ist er weg).
  if (decision === 'reject') {
    try {
      await kv.delete(key)
    } catch {
      return json(502, { ok: false, code: 'upstream' })
    }
    return json(200, { ok: true, id, rejected: true })
  }

  // Approve: Seed aus KV holen …
  let raw
  try {
    raw = await kv.get(key)
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
  if (!raw) return json(404, { ok: false, code: 'not-found' })
  let seed
  try {
    seed = JSON.parse(raw).seed
  } catch {
    seed = null
  }
  if (!seed || seed.id !== id) return json(422, { ok: false, code: 'corrupt' })

  // … Register laden, Idempotenz prüfen, committen (SHA-409-Retry) …
  let register, sha
  try {
    ;({ register, sha } = await readRegister(token))
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }

  // Schon veröffentlicht (z. B. voriger Commit ok, KV-Delete verpasst)? Dann nicht doppelt
  // anhängen — nur den KV-Rest aufräumen und Erfolg melden (idempotent).
  if (register.seeds.some((s) => s.id === id)) {
    try {
      await kv.delete(key)
    } catch {
      /* best effort */
    }
    return json(200, { ok: true, id, approved: true, already: true })
  }

  let committed = false
  for (let attempt = 0; attempt < 2; attempt++) {
    const next = addSeed(register, seed)
    try {
      await writeRegister(token, next, sha, `saat: ${seed.id} (${seed.kind} → ${seed.addressed_to})`)
      committed = true
      break
    } catch (err) {
      if (err && err.status === 409 && attempt === 0) {
        try {
          ;({ register, sha } = await readRegister(token))
        } catch {
          return json(502, { ok: false, code: 'upstream' })
        }
        if (register.seeds.some((s) => s.id === id)) {
          committed = true
          break
        }
        continue
      }
      return json(502, { ok: false, code: 'upstream' })
    }
  }
  if (!committed) return json(502, { ok: false, code: 'conflict' })

  // Forwards in die REQUESTS.md der Ziel-Praktik(en) — idempotent, best effort.
  const forwarded = []
  for (const repo of targetsFor(seed.addressed_to)) {
    if (await forwardToRepo(token, repo, seed)) forwarded.push(repo)
  }
  if (forwarded.length > 0) await recordForwarded(token, seed.id, forwarded)

  // KV erst JETZT löschen — nach erfolgreichem Commit (sonst ginge der Seed verloren).
  try {
    await kv.delete(key)
  } catch {
    /* best effort — der Idempotenz-Zweig oben fängt einen liegengebliebenen Key beim nächsten Mal */
  }

  return json(200, { ok: true, id, approved: true, forwarded_to: forwarded })
}
