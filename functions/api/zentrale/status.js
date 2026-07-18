// @ts-nocheck
// Die Steuerzentrale — Lagebild über die drei autonomen Kollektive (Field/Meridian,
// Studio/Ensemble, Atelier/Ulysses) und das Plenum (Cloudflare Pages Function).
//
// Zweck: EIN Blick statt vier Tabs. Diese Route bündelt, was sonst über verstreute
// GitHub-Ansichten erwandert werden müsste — Integrate-Läufe, Commit-Aktivität, offene
// Requests, rote Läufe, gestrandete Sessions, Chronik-/Vitalzeichen-Stand — zu einem
// einzigen JSON. Kein eigenes Domänenwissen hier: das Umformen der rohen GitHub-Antworten
// übernehmen die reinen, getesteten Funktionen aus src/lib/zentrale/status.ts; diese Datei
// ist nur Beschaffung (fetch) + Verdrahtung + Cache.
//
// Ausfall-Politik: EIN kaputter Teilfetch darf nie das ganze Lagebild leeren. Alle zehn
// Anfragen laufen parallel über Promise.allSettled; ein gescheiterter Teil wird null plus
// ein Eintrag in `errors` (nur der Name des Teils, nie Token/Query-Inhalt). Die drei rohen,
// unauthentifizierten chronicle/vital-signs-Reads sind grundsätzlich tolerant (404, kaputtes
// JSON, Netzwerkfehler — alles wird zu null, ohne errors-Eintrag), weil sie ergänzende
// Signale sind, keine Kernstatus-Daten.
//
// Scharf geschaltet wird die Zentrale ausschließlich über zwei Secrets in den Pages-
// Umgebungsvariablen: ZENTRALE_SECRET (Auth-Header-Vergleich, konstante Zeit über
// checkToken) und ZENTRALE_GITHUB_TOKEN (Lesezugriff auf die vier Kollektiv-Repos + dieses
// Repo). Kein Token wird je geloggt oder in eine Fehlermeldung eingebettet.
import { latestRunPerWorkflow, summarizeCommits, chronicleLast, vitalSignsLast, buildInbox } from '../../../src/lib/zentrale/status'
import { enginePrs } from '../../../src/lib/zentrale/sitePrs'
import { checkToken } from '../../../src/lib/zentrale/auth'

const API_BASE = 'https://api.github.com'
const SITE_REPO = 'frankbueltge/frankbueltge.de'
const UA = 'frankbueltge.de steuerzentrale'

// Die vier Kollektive — Reihenfolge ist auch die Anzeigereihenfolge im Dashboard.
// `integrate` ist der Workflow-Präfix (vor dem Bindestrich = Präfix für Namens-/Issue-Abgleich);
// `chronicle`/`vitalSigns` markieren, welche zusätzliche Engine-Datei ein Kollektiv führt —
// Atelier hat Vitalzeichen statt Chronik (Ulysses' eigene Konvention), Plenum hat keins von beiden.
const COLLECTIVES = [
  { repo: 'field-research', label: 'Field · Meridian', integrate: 'Field-Integrate', chronicle: true },
  { repo: 'studio', label: 'Studio · Ensemble', integrate: 'Studio-Integrate', chronicle: true },
  { repo: 'irrtum-als-methode', label: 'Atelier · Ulysses', integrate: 'Atelier-Integrate', vitalSigns: true },
  { repo: 'data-snack-plenum', label: 'Plenum', integrate: 'Plenum-Integrate' },
]

// "Field-Integrate red" / "Field-Integrate rot" — der Bot legt bei rotem Lauf ein Issue mit
// diesem Titelmuster an; Gruppe 1 ist der Präfix, der auf ein Kollektiv gemappt wird.
const RED_ISSUE_RE = /^(Field|Studio|Atelier|Plenum)-Integrate (red|rot)/i

const CACHE_TTL_MS = 3 * 60 * 1000

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

async function ghGet(token, path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': UA },
  })
  if (!res.ok) {
    const err = new Error(`github ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

// Roh-Reads (unauthentifiziert, raw.githubusercontent.com) — werfen nie. 404 heißt schlicht
// "Kollektiv hat diese Datei noch nicht geschrieben", ein kaputtes JSON heißt "noch nicht
// fertig committet" — beides ehrliche Lücken im Dashboard, kein Fehlerfall, der die restliche
// Antwort gefährden dürfte.
async function rawJson(repo, path) {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/${path}`, {
      headers: { 'user-agent': UA },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Matcht Workflow-Namen wie "Field integrate" oder "Field-Integrate" case-insensitiv gegen
// den Kollektiv-Präfix — die Actions-Workflow-Namen im Repo trennen Präfix und "integrate"
// mit einem Leerzeichen, die Kollektiv-Config selbst mit einem Bindestrich; beides zulassen.
function matchesIntegrate(workflowName, prefix) {
  const re = new RegExp(`^${prefix}[\\s-]+integrate$`, 'i')
  return re.test((workflowName || '').trim())
}

async function buildPayload(token) {
  const now = new Date()
  const nowIso = now.toISOString()
  const sinceIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const tasks = [
    { name: 'runs', run: () => ghGet(token, '/repos/frankbueltge/frankbueltge.de/actions/runs?per_page=100') },
    ...COLLECTIVES.map((c) => ({
      name: `commits:${c.repo}`,
      run: () => ghGet(token, `/repos/frankbueltge/${c.repo}/commits?per_page=30`),
    })),
    { name: 'issues', run: () => ghGet(token, '/repos/frankbueltge/frankbueltge.de/issues?state=open&per_page=100') },
    // Offene Vorschläge der PR-Schleuse (engine-site-pr.yml) — gefiltert auf `<ns>/pr-*`-Branches.
    { name: 'sitePrs', run: () => ghGet(token, '/repos/frankbueltge/frankbueltge.de/pulls?state=open&per_page=50') },
    { name: 'chronicle:field-research', run: () => rawJson('frankbueltge/field-research', 'chronicle.json') },
    { name: 'chronicle:studio', run: () => rawJson('frankbueltge/studio', 'chronicle.json') },
    { name: 'vitalSigns:irrtum-als-methode', run: () => rawJson('frankbueltge/irrtum-als-methode', 'pulse/vital-signs.json') },
  ]

  const settled = await Promise.allSettled(tasks.map((t) => t.run()))
  const errors = []
  const results = {}
  settled.forEach((r, i) => {
    const { name } = tasks[i]
    if (r.status === 'fulfilled') {
      results[name] = r.value
    } else {
      // Nur die sechs authentifizierten Calls können hier landen — rawJson wirft nie.
      results[name] = null
      const status = r.reason && r.reason.status ? r.reason.status : 'fehler'
      errors.push(`${name}: ${status}`)
    }
  })

  const runsSummary = results.runs ? latestRunPerWorkflow(results.runs.workflow_runs ?? []) : null
  // Issues-API liefert auch Pull Requests mit (unterscheidbar am pull_request-Feld) — raus damit.
  const openIssues = Array.isArray(results.issues) ? results.issues.filter((i) => !('pull_request' in i)) : []

  const inbox = buildInbox(openIssues, nowIso)

  const redIssueFor = (prefix) => {
    for (const issue of openIssues) {
      const m = RED_ISSUE_RE.exec(issue.title)
      if (m && m[1].toLowerCase() === prefix.toLowerCase()) {
        return { number: issue.number, title: issue.title, url: issue.html_url }
      }
    }
    return null
  }

  const strandedFor = (repo) =>
    openIssues
      .filter((i) => typeof i.title === 'string' && i.title.startsWith(`Gestrandete Session: ${repo}`))
      .map((i) => ({ number: i.number, title: i.title, url: i.html_url }))

  const collectives = COLLECTIVES.map((c) => {
    const prefix = c.integrate.split('-')[0]
    const runMatch = runsSummary ? runsSummary.find((r) => matchesIntegrate(r.workflow, prefix)) : null
    const commitsResult = results[`commits:${c.repo}`]
    const commits = Array.isArray(commitsResult) ? summarizeCommits(commitsResult, sinceIso) : null

    return {
      repo: c.repo,
      label: c.label,
      commitsLast24h: commits ? commits.count : null,
      lastCommit: commits ? commits.last : null,
      integrate: {
        workflow: runMatch ? runMatch.workflow : null,
        conclusion: runMatch ? runMatch.conclusion : null,
        at: runMatch ? runMatch.at : null,
        runUrl: runMatch ? runMatch.url : null,
        redIssue: redIssueFor(prefix),
      },
      chronicle: c.chronicle ? chronicleLast(results[`chronicle:${c.repo}`]) : null,
      vitalSigns: c.vitalSigns ? vitalSignsLast(results[`vitalSigns:${c.repo}`]) : null,
      strandedIssues: strandedFor(c.repo),
    }
  })

  return {
    ok: true,
    generatedAt: nowIso,
    errors,
    collectives,
    runs: runsSummary,
    inbox,
    // null = Teilfetch ausgefallen (steht dann in errors); [] = ehrlich leer.
    sitePrs: results.sitePrs ? enginePrs(results.sitePrs) : null,
  }
}

// Ein einzelner In-Isolate-Cache-Slot (die Zentrale hat nur eine Ansicht, kein Bedarf für
// mehrere Keys) plus ein In-Flight-Promise: mehrere Requests, die zeitgleich auf abgelaufenen
// Cache treffen, teilen sich EINEN Durchlauf statt N parallele GitHub-Storms auszulösen.
let cache = { at: 0, payload: null }
let inflight = null

export async function onRequestGet(context) {
  const { request, env } = context

  if (!checkToken(request.headers.get('x-zentrale-auth'), env.ZENTRALE_SECRET)) {
    return json(401, { ok: false, code: 'unauthorized' })
  }
  // trim: ein beim Einfügen ins Secret mitgerutschter Zeilenumbruch macht sonst aus einem
  // gültigen PAT ein ungültiges "Bearer xxx\n" — GitHub antwortet dann pauschal 401.
  const token = (env.ZENTRALE_GITHUB_TOKEN || '').trim()
  if (!token) return json(503, { ok: false, code: 'not-connected' })

  const refresh = new URL(request.url).searchParams.get('refresh') === '1'

  if (!refresh && cache.payload && Date.now() - cache.at < CACHE_TTL_MS) {
    return json(200, { ...cache.payload, cached: true })
  }

  if (!inflight) {
    inflight = buildPayload(token)
      .then((payload) => {
        cache = { at: Date.now(), payload }
        return payload
      })
      .finally(() => {
        inflight = null
      })
  }

  try {
    const payload = await inflight
    return json(200, { ...payload, cached: false })
  } catch {
    return json(502, { ok: false, code: 'upstream' })
  }
}
