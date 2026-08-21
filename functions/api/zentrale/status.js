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
import {
  latestRunPerWorkflow,
  summarizeCommits,
  chronicleLast,
  vitalSignsLast,
  cacheIsUsable,
  newestJournalEntry,
  journalTitle,
  buildInbox,
  protocolHeading,
} from '../../../src/lib/zentrale/status'
import { enginePrs } from '../../../src/lib/zentrale/sitePrs'
import { checkToken } from '../../../src/lib/zentrale/auth'
import { isPublicationCandidate, buildGateCandidate } from '../../../src/lib/zentrale/gate'
import { buildPostLane } from '../../../src/lib/zentrale/post'
// Der Post-Ausgang ist committete Site-Data — zur Build-Zeit gebundelt ist genau richtig,
// denn der Ledger ändert sich ohnehin nur per Deploy (kuratierte Datei, kein Live-Zustand).
import postLedger from '../../../src/data/post/ledger.json'

const API_BASE = 'https://api.github.com'
const SITE_REPO = 'frankbueltge/frankbueltge.de'
const UA = 'frankbueltge.de steuerzentrale'

// Die vier Kollektive — Reihenfolge ist auch die Anzeigereihenfolge im Dashboard.
// `integrate` ist der Workflow-Präfix (vor dem Bindestrich = Präfix für Namens-/Issue-Abgleich);
// `chronicle`/`vitalSigns`/`journal` markieren, welche zusätzliche Engine-Datei ein Kollektiv
// führt — Plenum hat keins davon.
//
// Atelier (2026-07-26): Die Vitalzeichen bleiben stehen, sind aber ein v4-Artefakt — Protokoll
// v5 (adoptiert 2026-07-24, Arbeitslinien) kennt sie nicht mehr, die Datei steht seit dem
// 19.07. still. Deshalb kommt das eigentliche "was macht die Praxis gerade" jetzt aus dem
// Journal, das Ulysses nachweislich täglich schreibt. Die tote Kennzahl wird nicht versteckt,
// sondern in der Anzeige datiert — überholte Strukturen sichtbar und datiert, nie unauffällig
// als aktuell (CLAUDE.md, Aktualitäts-Regel).
// Extended 2026-08-21 from four units to the whole family (opsroom design,
// docs/design/2026-08-21-steuerzentrale-opsroom.md): the board is only a Lagebild if it
// shows every unit that works at night. `workflow` is the integrate workflow's exact name
// (this repo's .github/workflows/*.yml `name:`); `redPrefix` is the alarm-issue prefix for
// units whose integrate opens one (n-1 and attention integrate never do — an absent alarm
// there is a fact about the workflow, not about the practice). `journalDir`/`protocolPath`
// name what each repo actually carries; absent means the repo has no such file, and the
// board stays honestly empty at that spot. n-1 keeps `protocolPath: null` on purpose: its
// constitution is the Dowry plus the Foundation, and stamping either as "the protocol"
// would invent a version the practice never declared.
const COLLECTIVES = [
  { repo: 'ulysses', label: 'Atelier · Ulysses', voice: 'ulysses', workflow: 'Atelier integrate', redPrefix: 'Atelier', vitalSigns: true, journalDir: 'journal', protocolPath: 'PROTOCOL.md' },
  { repo: 'field-research', label: 'Field · Meridian', voice: 'meridian', workflow: 'Field integrate', redPrefix: 'Field', chronicle: true, protocolPath: 'PROTOCOL.md' },
  { repo: 'studio', label: 'Studio · Ensemble', voice: 'ensemble', workflow: 'Studio integrate', redPrefix: 'Studio', chronicle: true, protocolPath: 'PROTOCOL.md' },
  { repo: 'error-as-method', label: 'Nightly line', voice: null, workflow: 'Nightly line integrate', redPrefix: 'Nightly', journalDir: 'journal', protocolPath: 'PROTOCOL.md' },
  { repo: 'n-1', label: 'n-1 · Remainder', voice: null, workflow: 'n-1 integrate', redPrefix: null, protocolPath: null },
  { repo: 'machine-attention', label: 'Machine Attention', voice: null, workflow: 'Attention integrate', redPrefix: null, protocolPath: null },
  { repo: 'data-snack-plenum', label: 'Plenum', voice: null, workflow: 'Plenum integrate', redPrefix: 'Plenum', protocolPath: null },
]

// "Field-Integrate red" / "Field-Integrate rot" / "Nightly-Integrate rot" — the integrate
// bots open an issue with this title pattern on a red run; group 1 maps to a redPrefix.
const RED_ISSUE_RE = /^(Field|Studio|Atelier|Plenum|Nightly)-Integrate (red|rot)/i

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

// Wie rawJson, nur für Text (Journal-Markdown) — wirft nie.
async function rawText(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// Jüngster Journaleintrag einer Praxis: Verzeichnis auflisten (authentifiziert — die
// Contents-API zählt sonst gegen das magere 60/h-Kontingent der Worker-IP), dann NUR die
// jüngste Datei nachladen. Zwei Anfragen, kein Massendownload von 80 Einträgen.
//
// Wirft nie: das Journal ist ein ergänzendes Signal wie Chronik/Vitalzeichen, kein
// Kernstatus. Fehlt es, bleibt die Karte an dieser Stelle ehrlich leer — die restliche
// Antwort darf davon nicht abhängen (siehe Ausfall-Politik oben).
async function journalSignal(token, repo, dir) {
  try {
    const listing = await ghGet(token, `/repos/frankbueltge/${repo}/contents/${dir}`)
    const newest = newestJournalEntry(listing)
    if (!newest) return null
    // Nur der Kopf wird gebraucht; die Einträge sind lange Prosa, der Titel steht oben.
    const markdown = newest.downloadUrl ? await rawText(newest.downloadUrl) : null
    return {
      date: newest.date,
      // Ohne lesbare Überschrift lieber der Dateiname als gar nichts — er trägt die
      // Arbeitslinie im Klartext ("negative-parallax-the-rulers-own-unit").
      title: journalTitle(markdown) ?? newest.name.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' '),
      url: newest.url,
    }
  } catch {
    return null
  }
}

// Gate-Kandidaten (v2 P2, Governance §1): Projekte, deren SCORE.md-Frontmatter
// PUBLICATION_CANDIDATE sagt und deren Verzeichnis KEIN PUBLICATION.json trägt — das
// Manifest IST die Publikation (integrate.ts leitet sie aus nichts anderem ab). Wirft nie;
// pro Refresh ~1 Listing + 1 Call je Projektverzeichnis (3-Minuten-Cache fängt das ab).
// Die SLA-Uhr läuft ehrlich als Proxy: letzter Commit an der SCORE.md, so beschriftet.
async function gateCandidates(token, repo, nowIso) {
  try {
    const listing = await ghGet(token, `/repos/frankbueltge/${repo}/contents/projects`)
    if (!Array.isArray(listing)) return []
    const out = []
    for (const d of listing.filter((e) => e.type === 'dir' && !e.name.startsWith('_'))) {
      const files = await ghGet(token, `/repos/frankbueltge/${repo}/contents/projects/${d.name}`).catch(() => null)
      if (!Array.isArray(files)) continue
      const names = files.map((f) => f.name)
      if (names.includes('PUBLICATION.json')) continue
      const score = files.find((f) => f.name === 'SCORE.md')
      if (!score || !score.download_url) continue
      const scoreMd = await rawText(score.download_url)
      if (!isPublicationCandidate(names, scoreMd)) continue
      const commits = await ghGet(token, `/repos/frankbueltge/${repo}/commits?path=projects/${d.name}/SCORE.md&per_page=1`).catch(() => null)
      const changedAt = Array.isArray(commits) && commits[0]?.commit?.committer?.date ? commits[0].commit.committer.date : null
      out.push(buildGateCandidate(repo, d.name, scoreMd, changedAt, nowIso))
    }
    return out
  } catch {
    return []
  }
}

// Matcht Workflow-Namen wie "Field integrate" oder "Field-Integrate" case-insensitiv gegen
// den Kollektiv-Präfix — die Actions-Workflow-Namen im Repo trennen Präfix und "integrate"
// mit einem Leerzeichen, die Kollektiv-Config selbst mit einem Bindestrich; beides zulassen.
function matchesIntegrate(workflowName, wanted) {
  const name = (workflowName || '').trim().toLowerCase()
  return name === wanted.trim().toLowerCase()
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
    { name: 'vitalSigns:ulysses', run: () => rawJson('frankbueltge/ulysses', 'pulse/vital-signs.json') },
    ...COLLECTIVES.filter((c) => c.journalDir).map((c) => ({
      name: `journal:${c.repo}`,
      run: () => journalSignal(token, c.repo, c.journalDir),
    })),
    // Constitution heading per unit (raw read, never throws): the board's version chip.
    ...COLLECTIVES.filter((c) => c.protocolPath).map((c) => ({
      name: `protocol:${c.repo}`,
      run: async () => {
        const md = await rawText(`https://raw.githubusercontent.com/frankbueltge/${c.repo}/main/${c.protocolPath}`)
        return protocolHeading(md)
      },
    })),
    // Nur das Atelier kennt heute den Kandidaten-Mechanismus (Protokoll v5 + human gate);
    // weitere Praxen kommen hier dazu, sobald ihre Verfassungen einen Kandidaten-Status tragen.
    { name: 'gate:ulysses', run: () => gateCandidates(token, 'ulysses', nowIso) },
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
    const runMatch = runsSummary ? runsSummary.find((r) => matchesIntegrate(r.workflow, c.workflow)) : null
    const commitsResult = results[`commits:${c.repo}`]
    const commits = Array.isArray(commitsResult) ? summarizeCommits(commitsResult, sinceIso) : null

    return {
      repo: c.repo,
      label: c.label,
      voice: c.voice ?? null,
      commitsLast24h: commits ? commits.count : null,
      lastCommit: commits ? commits.last : null,
      protocol: c.protocolPath ? (results[`protocol:${c.repo}`] ?? null) : null,
      integrate: {
        workflow: runMatch ? runMatch.workflow : null,
        conclusion: runMatch ? runMatch.conclusion : null,
        at: runMatch ? runMatch.at : null,
        runUrl: runMatch ? runMatch.url : null,
        redIssue: c.redPrefix ? redIssueFor(c.redPrefix) : null,
      },
      chronicle: c.chronicle ? chronicleLast(results[`chronicle:${c.repo}`]) : null,
      vitalSigns: c.vitalSigns ? vitalSignsLast(results[`vitalSigns:${c.repo}`]) : null,
      journal: c.journalDir ? (results[`journal:${c.repo}`] ?? null) : null,
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
    gate: results['gate:ulysses'] ?? [],
    post: buildPostLane(postLedger, nowIso),
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

  const params = new URL(request.url).searchParams
  const refresh = params.get('refresh') === '1'
  // `since` = Zeitstempel der letzten schreibenden Aktion, den der Browser mitschickt
  // (Antwort, Ack, PR-Merge/Close). Ein Cache-Eintrag, der VOR dieser Aktion gebaut wurde,
  // zeigt garantiert einen überholten Stand — dann wird neu geholt, egal welches Isolate
  // die Anfrage bekommt. Ohne das erschien eine gerade abgearbeitete Sache nach einem
  // Reload bis zu drei Minuten lang wieder als offen.
  const sinceRaw = Number(params.get('since'))
  const since = Number.isFinite(sinceRaw) && sinceRaw > 0 ? sinceRaw : null

  if (!refresh && cache.payload && cacheIsUsable(cache.at, Date.now(), CACHE_TTL_MS, since)) {
    return json(200, { ...cache.payload, cached: true })
  }

  if (!inflight) {
    // Gestempelt wird der BEGINN des Durchlaufs, nicht sein Ende: Die GitHub-Antworten
    // stammen von diesem Zeitpunkt an. Mit der Endzeit sähe ein Durchlauf, der vor einer
    // Schreibaktion begann und danach fertig wurde, jünger aus als sie — und der
    // since-Vergleich oben würde ihn fälschlich durchwinken.
    const startedAt = Date.now()
    inflight = buildPayload(token)
      .then((payload) => {
        cache = { at: startedAt, payload }
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
