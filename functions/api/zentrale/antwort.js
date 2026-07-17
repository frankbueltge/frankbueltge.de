// @ts-nocheck
// Die Steuerzentrale — Antwortweg zurück in die REQUESTS.md-Dateien der Kollektive
// (Cloudflare Pages Function).
//
// Drei Aktionen, alle über `action` im Body unterschieden:
//   - answer:      REQUESTS.md-Section beantworten (Status + Response-Zeile) + Inbox-Issue
//                   kommentieren/schließen.
//   - acknowledge: nur das Inbox-Issue kommentieren/schließen, REQUESTS.md bleibt unberührt
//                   (Frank hat gelesen, entscheidet aber bewusst nichts — die Standing Rule
//                   vom 2026-07-17 erlaubt das Kollektiv ohnehin, nach Frist selbst zu
//                   entscheiden; "gelesen" ist trotzdem mehr als Stille).
//   - seed:        eine neue Seed-Section anhängen (kein Issue-Bezug, reiner Angebots-Text).
//
// Das Textumformen selbst (answerRequest/appendSeed) übernehmen die reinen, getesteten
// Funktionen aus src/lib/zentrale/requestsMd.ts — diese Datei ist nur Beschaffung (fetch),
// SHA-Konflikt-Behandlung (ein Retry, danach ehrlich 409) und Issue-Verdrahtung.
//
// Scharf geschaltet ausschließlich über zwei Secrets in den Pages-Umgebungsvariablen:
// ZENTRALE_SECRET (Auth-Header, konstante Zeit über checkToken) und ZENTRALE_GITHUB_TOKEN
// (Schreibzugriff Contents + Issues). Kein Token wird je geloggt oder in eine Fehlermeldung
// eingebettet — Upstream-Fehler tragen nur den HTTP-Status, nie den Response-Body (der könnte
// im Prinzip Token-Fragmente aus einer Diagnosemeldung enthalten).
import { answerRequest, appendSeed } from '../../../src/lib/zentrale/requestsMd'
import { checkToken } from '../../../src/lib/zentrale/auth'

const API_BASE = 'https://api.github.com'
const SITE_REPO = 'frankbueltge/frankbueltge.de'
const UA = 'frankbueltge.de steuerzentrale'

const COLLECTIVE_REPOS = ['field-research', 'studio', 'irrtum-als-methode', 'data-snack-plenum']
const ACTIONS = ['answer', 'acknowledge', 'seed']
const DECISIONS = ['enabled', 'declined', 'note']

const MAX_TITLE_LEN = 200
const MAX_BODY_LEN = 4000
const MAX_MESSAGE_LEN = 4000

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

function ghHeaders(token, withContentType) {
  const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': UA }
  if (withContentType) headers['content-type'] = 'application/json'
  return headers
}

function truncate(str, n) {
  return str.length > n ? `${str.slice(0, n)}…` : str
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

async function readMd(token, repo) {
  const res = await fetch(`${API_BASE}/repos/frankbueltge/${repo}/contents/REQUESTS.md`, {
    headers: ghHeaders(token),
  })
  if (!res.ok) {
    const err = new Error(`github read ${res.status}`)
    err.status = res.status
    throw err
  }
  const body = await res.json()
  const md = new TextDecoder().decode(Uint8Array.from(atob(body.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)))
  return { md, sha: body.sha }
}

// Base64 in Blöcken statt per Spread: String.fromCharCode(...bytes) schlägt oberhalb der
// Engine-Argumentgrenze (~64k) fehl — die REQUESTS.md von field-research liegt schon bei
// ~50 KB und wächst mit jeder Session.
function b64encode(md) {
  const bytes = new TextEncoder().encode(md)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin)
}

async function writeMd(token, repo, md, sha, message) {
  const content = b64encode(md)
  const res = await fetch(`${API_BASE}/repos/frankbueltge/${repo}/contents/REQUESTS.md`, {
    method: 'PUT',
    headers: ghHeaders(token, true),
    body: JSON.stringify({
      message,
      content,
      sha,
      committer: { name: 'Steuerzentrale', email: 'steuerzentrale@frankbueltge.de' },
    }),
  })
  if (!res.ok) {
    const err = new Error(`github write ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

// Lesen → Editierfunktion anwenden → schreiben; bei SHA-Konflikt (409, jemand anders hat
// zwischenzeitlich committet) EINMAL frisch lesen und erneut anwenden — REQUESTS.md ändert
// sich selten genug, dass ein zweiter Konflikt ehrlich als "gerade jetzt zu viel los" gemeldet
// werden darf statt endlos zu pollen. `editFn` bekommt den frischen Text und liefert entweder
// { ok:true, md } oder { ok:false, reason } (z. B. answerRequest's "Section nicht mehr da").
async function commitEdit(token, repo, editFn, commitMessage) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { md, sha } = await readMd(token, repo)
    const result = editFn(md)
    if (!result.ok) return { ok: false, reason: result.reason }
    try {
      const put = await writeMd(token, repo, result.md, sha, commitMessage)
      return { ok: true, put }
    } catch (err) {
      if (err && err.status === 409 && attempt === 0) continue
      if (err && err.status === 409) return { ok: false, reason: 'conflict' }
      throw err
    }
  }
  return { ok: false, reason: 'conflict' }
}

async function commentOnIssue(token, issueNumber, body) {
  const res = await fetch(`${API_BASE}/repos/${SITE_REPO}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: ghHeaders(token, true),
    body: JSON.stringify({ body }),
  })
  if (!res.ok) {
    const err = new Error(`comment ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

async function closeIssue(token, issueNumber) {
  // Ein bereits geschlossenes Issue nochmal zu schließen ist idempotent (GitHub antwortet
  // trotzdem mit 2xx) — kein Sonderfall nötig.
  const res = await fetch(`${API_BASE}/repos/${SITE_REPO}/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: ghHeaders(token, true),
    body: JSON.stringify({ state: 'closed' }),
  })
  if (!res.ok) {
    const err = new Error(`close ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

function issueHtmlUrl(issueNumber) {
  return `https://github.com/${SITE_REPO}/issues/${issueNumber}`
}

function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, detail: 'body muss ein Objekt sein' }
  }
  if (!COLLECTIVE_REPOS.includes(body.repo)) {
    return { ok: false, detail: 'repo unbekannt' }
  }
  if (!ACTIONS.includes(body.action)) {
    return { ok: false, detail: 'action unbekannt' }
  }

  if (body.action === 'answer') {
    if (typeof body.heading !== 'string' || body.heading.trim() === '') {
      return { ok: false, detail: 'heading fehlt' }
    }
    if (!DECISIONS.includes(body.decision)) {
      return { ok: false, detail: 'decision ungültig' }
    }
    if (body.message !== undefined && typeof body.message !== 'string') {
      return { ok: false, detail: 'message muss ein String sein' }
    }
    const message = body.message ?? ''
    if (message.length > MAX_MESSAGE_LEN) {
      return { ok: false, detail: 'message zu lang' }
    }
    if ((body.decision === 'declined' || body.decision === 'note') && message.trim() === '') {
      return { ok: false, detail: 'message fehlt' }
    }
    if (!Number.isInteger(body.issueNumber) || body.issueNumber <= 0) {
      return { ok: false, detail: 'issueNumber ungültig' }
    }
    return { ok: true }
  }

  if (body.action === 'acknowledge') {
    if (!Number.isInteger(body.issueNumber) || body.issueNumber <= 0) {
      return { ok: false, detail: 'issueNumber ungültig' }
    }
    if (body.note !== undefined && typeof body.note !== 'string') {
      return { ok: false, detail: 'note muss ein String sein' }
    }
    return { ok: true }
  }

  // seed
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return { ok: false, detail: 'title fehlt' }
  }
  if (body.title.length > MAX_TITLE_LEN) {
    return { ok: false, detail: 'title zu lang' }
  }
  if (typeof body.body !== 'string' || body.body.trim() === '') {
    return { ok: false, detail: 'body fehlt' }
  }
  if (body.body.length > MAX_BODY_LEN) {
    return { ok: false, detail: 'body zu lang' }
  }
  return { ok: true }
}

async function handleAnswer(token, body) {
  const { repo, heading, decision, issueNumber } = body
  const message = typeof body.message === 'string' ? body.message : ''
  const date = todayUtc()
  const commitMessage = `requests: response to '${truncate(heading, 60)}' (steuerzentrale)`

  let result
  try {
    result = await commitEdit(token, repo, (md) => answerRequest(md, heading, { decision, message, date }), commitMessage)
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
  if (!result.ok) {
    if (result.reason === 'not-found') return json(404, { ok: false, code: 'not-found' })
    return json(409, { ok: false, code: 'conflict' })
  }

  const commit = { sha: result.put?.commit?.sha ?? null, htmlUrl: result.put?.content?.html_url ?? null }
  const commentBody = message.trim() !== '' ? `→ ${decision}: ${message}` : `→ ${decision}`

  let closeResult
  try {
    await commentOnIssue(token, issueNumber, commentBody)
    closeResult = await closeIssue(token, issueNumber)
  } catch {
    // Die REQUESTS.md-Antwort ist schon committet — das ist der Teil, der zählt. Das Issue
    // bleibt notfalls offen liegen, statt den ganzen Erfolg zu verschlucken.
    return json(200, { ok: true, commit, warning: 'issue-close-failed' })
  }

  return json(200, { ok: true, commit, issue: { number: issueNumber, htmlUrl: closeResult.html_url ?? issueHtmlUrl(issueNumber) } })
}

async function handleAcknowledge(token, body) {
  const { issueNumber } = body
  const note = typeof body.note === 'string' && body.note.trim() !== '' ? body.note : null
  const commentBody = note ? `gelesen — entscheidet selbst.\n${note}` : 'gelesen — entscheidet selbst.'

  let closeResult
  try {
    await commentOnIssue(token, issueNumber, commentBody)
    closeResult = await closeIssue(token, issueNumber)
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }

  return json(200, { ok: true, issue: { number: issueNumber, htmlUrl: closeResult.html_url ?? issueHtmlUrl(issueNumber) } })
}

async function handleSeed(token, body) {
  const { repo, title } = body
  const seedBody = body.body
  const date = todayUtc()
  const commitMessage = `requests: seed '${truncate(title, 60)}' (steuerzentrale)`

  let result
  try {
    result = await commitEdit(token, repo, (md) => ({ ok: true, md: appendSeed(md, { title, body: seedBody, date }) }), commitMessage)
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
  if (!result.ok) {
    // appendSeed selbst kennt kein "not-found" — der einzige Fehlerfall, den commitEdit hier
    // noch liefern kann, ist ein zweifacher SHA-Konflikt.
    return json(409, { ok: false, code: 'conflict' })
  }

  const commit = { sha: result.put?.commit?.sha ?? null, htmlUrl: result.put?.content?.html_url ?? null }
  return json(200, { ok: true, commit })
}

export async function onRequestPost(context) {
  const { request, env } = context

  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  const token = env.ZENTRALE_GITHUB_TOKEN
  if (!token) return json(503, { ok: false, code: 'not-connected' })

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { ok: false, code: 'bad-json' })
  }

  const v = validateBody(body)
  if (!v.ok) return json(422, { ok: false, code: 'validation', detail: v.detail })

  if (body.action === 'answer') return handleAnswer(token, body)
  if (body.action === 'acknowledge') return handleAcknowledge(token, body)
  return handleSeed(token, body)
}
