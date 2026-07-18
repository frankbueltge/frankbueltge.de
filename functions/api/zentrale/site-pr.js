// @ts-nocheck
// Die Steuerzentrale — Entscheidungsweg für Site-PRs der Engines (Cloudflare Pages Function).
//
// Die PR-Schleuse (engine-site-pr.yml) eröffnet validierte Vorschläge der Kollektive als
// PRs mit Branch `<ns>/pr-<slug>`. Diese Route lässt Frank die menschliche Entscheidung
// direkt aus der Zentrale treffen:
//   - merge: PR mergen (Merge-Commit, wie im Repo üblich) → deploy-cf baut die Site neu.
//   - close: PR schließen = ablehnen (endgültig — die Schleuse belebt geschlossene PRs nie
//            wieder). Optionaler Kommentar wird vorher als PR-Kommentar abgesetzt, damit
//            die Engine die Begründung lesen kann.
// Nach beidem wird der PR-Branch best-effort gelöscht (die Engines können das nicht selbst).
//
// Sicherheitsgrenze: Vor jeder Aktion wird der PR geladen und geprüft, dass sein Head-Branch
// dem Engine-Muster entspricht (isEngineHead) — dieser Endpoint kann NIE menschliche
// Feature-PRs mergen oder schließen, egal welche Nummer hereinkommt.
//
// Scharf geschaltet ausschließlich über ZENTRALE_SECRET (Auth-Header, konstante Zeit) und
// ZENTRALE_GITHUB_TOKEN. Merge braucht auf dem Site-Repo Pull-requests- UND Contents-
// Schreibrecht im PAT — fehlt das, antwortet GitHub 403 und diese Route ehrlich mit
// code 'forbidden' (die Seite erklärt dann, dass das PAT erweitert werden muss).
// Kein Token wird je geloggt oder in eine Fehlermeldung eingebettet.
import { isEngineHead, validateSitePrAction } from '../../../src/lib/zentrale/sitePrs'
import { checkToken } from '../../../src/lib/zentrale/auth'

const API_BASE = 'https://api.github.com'
const SITE_REPO = 'frankbueltge/frankbueltge.de'
const UA = 'frankbueltge.de steuerzentrale'

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

async function gh(token, method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: ghHeaders(token, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    // Nur der Status wandert weiter — nie der Response-Body (könnte Diagnose-Fragmente tragen).
    const err = new Error(`github ${res.status}`)
    err.status = res.status
    throw err
  }
  // 204 (z. B. Branch-Delete) hat keinen Body.
  if (res.status === 204) return null
  return res.json()
}

// Branch-Aufräumen ist Komfort, keine Bedingung — ein Fehler hier darf den Erfolg der
// eigentlichen Entscheidung nicht verschlucken.
async function deleteBranch(token, ref) {
  try {
    await gh(token, 'DELETE', `/repos/${SITE_REPO}/git/refs/heads/${ref}`)
    return true
  } catch {
    return false
  }
}

export async function onRequestPost(context) {
  const { request, env } = context

  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  const token = (env.ZENTRALE_GITHUB_TOKEN || '').trim()
  if (!token) return json(503, { ok: false, code: 'not-connected' })

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { ok: false, code: 'bad-json' })
  }

  const v = validateSitePrAction(body)
  if (!v.ok) return json(422, { ok: false, code: 'validation', detail: v.detail })

  const { number, action } = body
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''

  // PR laden + Engine-Grenze prüfen — IMMER, bevor irgendetwas geschrieben wird.
  let pr
  try {
    pr = await gh(token, 'GET', `/repos/${SITE_REPO}/pulls/${number}`)
  } catch (err) {
    if (err && err.status === 404) return json(404, { ok: false, code: 'not-found' })
    return json(502, { ok: false, code: 'upstream' })
  }
  const headRef = pr && pr.head ? pr.head.ref : null
  if (!isEngineHead(headRef)) {
    return json(422, { ok: false, code: 'not-engine-pr' })
  }
  if (pr.state !== 'open') {
    return json(409, { ok: false, code: 'not-open' })
  }

  // Optionaler Kommentar zuerst (Begründung für die Engine) — scheitert er, geht die
  // Entscheidung trotzdem durch; der Verlust wird als warning gemeldet, nicht verschluckt.
  let commentWarning = null
  if (comment !== '') {
    try {
      await gh(token, 'POST', `/repos/${SITE_REPO}/issues/${number}/comments`, { body: comment })
    } catch {
      commentWarning = 'comment-failed'
    }
  }

  if (action === 'merge') {
    let merged
    try {
      merged = await gh(token, 'PUT', `/repos/${SITE_REPO}/pulls/${number}/merge`, { merge_method: 'merge' })
    } catch (err) {
      const status = err && err.status ? err.status : 0
      if (status === 403) return json(403, { ok: false, code: 'forbidden' })
      if (status === 405) return json(409, { ok: false, code: 'not-mergeable' })
      if (status === 409) return json(409, { ok: false, code: 'head-changed' })
      return json(502, { ok: false, code: 'upstream' })
    }
    const branchDeleted = await deleteBranch(token, headRef)
    return json(200, {
      ok: true,
      merged: true,
      sha: merged && merged.sha ? merged.sha : null,
      branchDeleted,
      ...(commentWarning ? { warning: commentWarning } : {}),
    })
  }

  // close = ablehnen (endgültig; die Schleuse belebt geschlossene PRs nie wieder)
  try {
    await gh(token, 'PATCH', `/repos/${SITE_REPO}/pulls/${number}`, { state: 'closed' })
  } catch (err) {
    const status = err && err.status ? err.status : 0
    if (status === 403) return json(403, { ok: false, code: 'forbidden' })
    return json(502, { ok: false, code: 'upstream' })
  }
  const branchDeleted = await deleteBranch(token, headRef)
  return json(200, { ok: true, closed: true, branchDeleted, ...(commentWarning ? { warning: commentWarning } : {}) })
}
