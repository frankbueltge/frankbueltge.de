// @ts-nocheck
// src/lib/saat/publish.js — geteilte GitHub-Publish-Logik der "Öffentlichen Saat"
// (Moderations-Warteschlange, Design-Spec 2026-07-20-saat-moderationsqueue-design.md §4).
//
// Diese Helfer waren ursprünglich in functions/api/seed.js. Seit Option A committet NICHT mehr
// die Einreich-Function, sondern der Freigabe-Endpunkt (functions/api/zentrale/seed-review.js) —
// beide teilen sich diese Logik, statt sie zu duplizieren. Reine Bewegung, keine Änderung der
// Commit-Semantik: Register-Read/Write auf `main` mit SHA-409-Retry, REQUESTS.md-Forwards
// idempotent (Seed-id im Body = Idempotenz-Schlüssel).
//
// Sicherheit (wie zuvor): Upstream-Fehler tragen NUR Label + HTTP-Status, nie den Response-Body
// (könnte Diagnose-/Token-Fragmente enthalten) und nie die URL (könnte einen Key im
// Query-String tragen). Der GitHub-Token wird von der aufrufenden Function übergeben.
import { emptyRegister, publicSeedBlock } from './saat'
import { appendBlockToSection } from '../zentrale/requestsMd'

const API_BASE = 'https://api.github.com'
const SITE_REPO = 'frankbueltge/frankbueltge.de'
const REGISTER_PATH = 'src/data/saat/register.json'
const REGISTER_URL = `${API_BASE}/repos/${SITE_REPO}/contents/${REGISTER_PATH}`
const PUBLIC_SECTION = 'Seeds from the public'
const UA = 'frankbueltge.de oeffentliche saat'
const COMMITTER = { name: 'Öffentliche Saat', email: 'saat@frankbueltge.de' }

export function upstreamError(label, status) {
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
// REQUESTS.md von field-research liegt schon bei ~50 KB).
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

// --- Register (Site-Repo, Branch main) -------------------------------------------------------

export async function readRegister(token) {
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

export async function writeRegister(token, register, sha, message) {
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
export async function forwardToRepo(token, repo, seed) {
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
// Vorgang: der Register-Commit (Quelle der Wahrheit) steht schon, der Watchdog gleicht ab.
export async function recordForwarded(token, seedId, repos) {
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
