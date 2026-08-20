// src/lib/zentrale/status.ts — reines Umformen der GitHub-API-Antworten (Runs, Commits,
// Issues) und der committeten Engine-JSONs (chronicle, vital-signs) in das, was das
// Steuerzentrale-Dashboard zeigt. Kein fetch hier — das bleibt Sache der Pages Function; diese
// Datei bekommt fertige API-Antworten hereingereicht und bleibt dadurch ohne Netzwerk testbar.
// Alle Reader sind tolerant: fremde/kaputte Daten liefern null/leer statt zu werfen — eine
// ehrliche Lücke im Dashboard schlägt einen Crash oder eine erfundene Zahl.

import { parseInboxIssueTitle, isNonRequestSection } from './requestsMd'
import { fallbackSummary, parseRequestHead } from './requestHead'

export interface WorkflowRun {
  name: string
  conclusion: string | null
  status: string
  created_at: string
  html_url: string
}

export interface WorkflowRunSummary {
  workflow: string
  conclusion: string | null
  status: string
  at: string
  url: string
}

/** Pro Workflow-Name nur den jüngsten Lauf behalten. Die API liefert zwar absteigend
 * sortiert nach created_at — aber "verlassen" auf eine Fremd-Sortierung ist genau die Art
 * Bug, die erst auffällt, wenn GitHub sie mal ändert. Wir vergleichen selbst. */
export function latestRunPerWorkflow(runs: WorkflowRun[]): WorkflowRunSummary[] {
  const newest = new Map<string, WorkflowRun>()
  for (const run of runs) {
    const current = newest.get(run.name)
    if (!current || new Date(run.created_at).getTime() > new Date(current.created_at).getTime()) {
      newest.set(run.name, run)
    }
  }
  return Array.from(newest.values()).map((r) => ({
    workflow: r.name,
    conclusion: r.conclusion,
    status: r.status,
    at: r.created_at,
    url: r.html_url,
  }))
}

export interface CommitLike {
  sha: string
  commit: {
    message: string
    committer?: { date?: string } | null
    author?: { date?: string } | null
  }
}

function commitDate(c: CommitLike): string | null {
  return c.commit.committer?.date ?? c.commit.author?.date ?? null
}

export function summarizeCommits(
  commits: CommitLike[],
  sinceIso: string,
): { count: number; last: { sha: string; message: string; date: string } | null } {
  const sinceMs = new Date(sinceIso).getTime()
  let count = 0
  let last: { sha: string; message: string; date: string } | null = null
  let lastMs = -Infinity
  for (const c of commits) {
    const date = commitDate(c)
    if (!date) continue
    const ms = new Date(date).getTime()
    if (Number.isNaN(ms) || ms < sinceMs) continue
    count++
    if (ms > lastMs) {
      lastMs = ms
      last = { sha: c.sha, message: c.commit.message.split('\n')[0], date }
    }
  }
  return { count, last }
}

/** Liest chronicle.json (siehe field/REQUESTS.md, 2026-07-11-Saat: "a chronicle entry
 * alongside the journal") — jede Engine hängt Einträge nach eigenem Takt an, daher wird hier
 * nach dem größten `date` gesucht statt der Array-Reihenfolge zu vertrauen; bei Gleichstand
 * gewinnt der spätere Eintrag in der Datei. */
export function chronicleLast(
  entries: unknown,
): { date: string; summary: string; verdict: string | null; session: number | null } | null {
  try {
    if (!Array.isArray(entries)) return null
    let best: Record<string, unknown> | null = null
    for (const raw of entries) {
      if (!raw || typeof raw !== 'object') continue
      const e = raw as Record<string, unknown>
      if (typeof e.date !== 'string') continue
      if (!best || (e.date as string) >= (best.date as string)) best = e
    }
    if (!best) return null
    return {
      date: best.date as string,
      summary: typeof best.summary === 'string' ? best.summary : '',
      verdict: typeof best.verdict === 'string' ? best.verdict : null,
      session: typeof best.collective_session === 'number' ? best.collective_session : null,
    }
  } catch {
    return null
  }
}

/** Liest pulse/vital-signs.json (Atelier). Die reale Datei (src/data/atelier/vital-signs.json)
 * hat die Form { updated, history: VitalEntry[] } — history wird dort aber pro Session an den
 * ANFANG gesetzt (Session 34 zuerst, 26 zuletzt), anders als cockpit.ts' latestClosure(), die
 * den letzten Array-Eintrag als jüngsten annimmt. Um von dieser Schreibkonvention unabhängig
 * zu sein, wählen wir hier explizit nach dem größten `date`/`session` statt nach Array-Position
 * — robust in beide Richtungen. Akzeptiert defensiv auch eine reine Array-Form. */
export function vitalSignsLast(data: unknown): { date: string | null; closure: number | null; session: number | null } | null {
  try {
    let history: unknown
    if (Array.isArray(data)) history = data
    else if (data && typeof data === 'object') history = (data as Record<string, unknown>).history
    else return null
    if (!Array.isArray(history)) return null

    let best: Record<string, unknown> | null = null
    for (const raw of history) {
      if (!raw || typeof raw !== 'object') continue
      const e = raw as Record<string, unknown>
      const date = typeof e.date === 'string' ? e.date : null
      const session = typeof e.session === 'number' ? e.session : null
      if (date === null && session === null) continue
      if (!best) {
        best = e
        continue
      }
      const bestDate = typeof best.date === 'string' ? best.date : null
      const bestSession = typeof best.session === 'number' ? best.session : null
      if (date !== null && bestDate !== null) {
        if (date > bestDate) best = e
        else if (date === bestDate && session !== null && bestSession !== null && session > bestSession) best = e
      } else if (date === null && bestDate === null && session !== null && bestSession !== null && session > bestSession) {
        best = e
      }
    }
    if (!best) return null
    return {
      date: typeof best.date === 'string' ? best.date : null,
      closure: typeof best.closure === 'number' ? best.closure : null,
      session: typeof best.session === 'number' ? best.session : null,
    }
  } catch {
    return null
  }
}

/** Darf der zwischengespeicherte Lagebericht noch ausgeliefert werden?
 *
 * Zwei Bedingungen, beide müssen gelten:
 *  - Er ist jünger als die TTL (dafür ist der Cache da: ein Reload soll nicht zehn
 *    GitHub-Abfragen auslösen).
 *  - Er wurde NACH der letzten schreibenden Aktion gebaut, die der Browser kennt (`since`).
 *
 * Ohne die zweite Bedingung zeigt ein Reload direkt nach dem Abarbeiten die gerade
 * geschlossene Anfrage und den gerade gemergten Vorschlag wieder an — die Zentrale erzählt
 * einen Stand, den ihr eigener Benutzer soeben überholt hat. Das ist schlimmer als eine
 * langsame Anzeige: es sieht aus, als hätte die Aktion nicht gewirkt.
 *
 * Warum `since` vom Browser kommt und nicht aus einer serverseitigen Invalidierung: Der
 * Cache lebt im Speicher des Isolates, das die Anfrage bekommt. Ein Schreibvorgang kann ein
 * anderes Isolate treffen als der darauffolgende Reload — eine Invalidierung von innen
 * würde also nur manchmal greifen. Der Zeitstempel im Browser wirkt unabhängig davon.
 *
 * Eingehandelter Rest: `since` stammt aus der Uhr des Browsers, `cacheAt` aus der des
 * Servers. Geht die Browseruhr deutlich nach, greift die Bedingung nicht und es bleibt beim
 * alten Verhalten — begrenzt durch die TTL. Bewusst in Kauf genommen; eine Zeitsynchronisation
 * wäre für ein Ein-Personen-Werkzeug der falsche Aufwand. */
export function cacheIsUsable(cacheAt: number, nowMs: number, ttlMs: number, since: number | null): boolean {
  if (nowMs - cacheAt >= ttlMs) return false
  if (since !== null && cacheAt < since) return false
  return true
}

export interface JournalEntry {
  name: string
  date: string
  url: string | null
  downloadUrl: string | null
}

const JOURNAL_NAME_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/

/** Wählt den jüngsten Journaleintrag aus einer GitHub-Contents-Auflistung von `journal/`.
 *
 * Warum überhaupt: Das Atelier führt seit Protokoll v5 (2026-07-24, Arbeitslinien) keine
 * pulse/vital-signs.json mehr — die Datei ist ein v4-Artefakt und steht seit 2026-07-19
 * still. Sein tatsächlich täglich geschriebenes Lebenszeichen sind die Journaleinträge; die
 * Zentrale liest deshalb dort, statt eine tote Kennzahl weiterzuzeigen.
 *
 * Sortiert wird über das Datumspräfix des Dateinamens, NICHT über die Listenreihenfolge (die
 * GitHub-API sortiert alphabetisch, was zufällig meist passt — darauf zu bauen ist genau der
 * Bug, der auffällt, wenn es einmal nicht passt). Mehrere Einträge am selben Tag sind normal
 * (ein Eintrag pro Zug); ihre Reihenfolge innerhalb des Tages steht im Dateinamen nicht, also
 * gewinnt der alphabetisch letzte — willkürlich, aber deterministisch, damit die Anzeige
 * zwischen zwei Abrufen nicht springt. */
export function newestJournalEntry(listing: unknown): JournalEntry | null {
  if (!Array.isArray(listing)) return null
  let best: JournalEntry | null = null
  for (const raw of listing) {
    if (!raw || typeof raw !== 'object') continue
    const e = raw as Record<string, unknown>
    if (e.type !== 'file' || typeof e.name !== 'string') continue
    const match = JOURNAL_NAME_RE.exec(e.name)
    if (!match) continue
    const entry: JournalEntry = {
      name: e.name,
      date: match[1],
      url: typeof e.html_url === 'string' ? e.html_url : null,
      downloadUrl: typeof e.download_url === 'string' ? e.download_url : null,
    }
    if (!best || entry.date > best.date || (entry.date === best.date && entry.name > best.name)) {
      best = entry
    }
  }
  return best
}

/** Zieht die Überschrift aus einem Journaleintrag: die erste `# `-Zeile, ohne das
 * vorangestellte Datum ("# 2026-07-26 — The ruler's own unit" → "The ruler's own unit").
 * Nur der Kopf der Datei wird angesehen — findet sich dort keine Überschrift, gibt es null
 * statt einer geratenen Zeile aus dem Fließtext. */
export function journalTitle(markdown: unknown): string | null {
  if (typeof markdown !== 'string') return null
  for (const line of markdown.split('\n').slice(0, 20)) {
    const heading = /^#\s+(.*\S)\s*$/.exec(line)
    if (!heading) continue
    return heading[1].replace(/^\d{4}-\d{2}-\d{2}\s*[—–-]\s*/, '').trim() || null
  }
  return null
}

/** Ganze Tage, abgerundet (Verweildauer, kein Kalendertag-Delta) — 23:00 gestern bis 01:00
 * heute sind 2 Stunden, nicht "ein Tag alt". */
export function ageDays(fromIso: string, nowIso: string): number {
  const from = new Date(fromIso).getTime()
  const now = new Date(nowIso).getTime()
  return Math.floor((now - from) / 86_400_000)
}

/** Whole days from now until an ISO date; negative once the date has passed. */
export function daysUntil(dateIso: string, nowIso: string): number {
  return -ageDays(dateIso, nowIso)
}

/** Which tray an inbox entry belongs in.
 *
 *  · `today`      — a dated deadline within reach; Frank's silence would actually cost something
 *  · `postoffice` — a letter to forward: only his, and explicitly without urgency
 *  · `running`    — the practice proceeds on its own if he says nothing
 *  · `fyi`        — declared as needing nothing at all
 */
export type InboxTray = 'today' | 'postoffice' | 'running' | 'fyi'

/** How much runway on a dated deadline still counts as "today". Beyond this the practice is
 *  simply working and the item is not owed an answer this morning. */
export const FRIST_WINDOW_DAYS = 14

/* Claims only (Frank, 2026-08-12, second pass): the first fix kept a 3-day "window" for
 * requests without a deadline — at ~8 sections a day across the practices that window alone
 * held two dozen cards, and Frank's answer was the same as in the morning: what runs without
 * him is not his inbox. The line is now the practices' own frist mechanism: a claim on
 * Frank's attention NAMES a future deadline or is a forwarding; everything else is record
 * (REQUESTS.md), not inbox. The requests-watchdog applies the same line to the GitHub
 * issues — no issue is created for a no-claim section, existing ones are closed.
 * Mirrored in .github/workflows/requests-watchdog.yml — change both. */

/**
 * Sort an entry into its tray, following the standing rule the practices are actually bound by
 * (Frank, 2026-07-17, at the head of every REQUESTS.md): *"a request or offer addressed to Frank
 * is never a blocker. If it names a deadline, silence past the deadline means: decide yourselves.
 * If it names none, silence through your own next session means the same."*
 *
 * Until 2026-08-02 this was `braucht !== 'nichts'` — everything except an explicit "needs
 * nothing" was rendered under "Heute nötig". That put letters with no deadline, and decisions the
 * practice would take by its next session anyway, on a list headed as owed today; on 2026-08-02 it
 * showed eight items as needed and the honest count was zero. The dashboard was holding Frank
 * liable for exactly what his own rule releases him from, and the cost was his morning.
 */
export function trayFor(
  head: { structured: boolean; braucht: string | null; fristDate: string | null },
  nowIso: string,
): InboxTray {
  // Forwarding never enters "today", deadline or not. Frank, 2026-08-02: the post lies in the post
  // office, whether it is sent is his decision, and he does not want repeated reminders for it.
  if (head.braucht === 'weiterleitung') return 'postoffice'
  if (head.structured && head.braucht === 'nichts') return 'fyi'
  if (head.fristDate) {
    const left = daysUntil(head.fristDate, nowIso)
    // A deadline already past is not owed either: by the rule, that decision is theirs now.
    if (left >= 0 && left <= FRIST_WINDOW_DAYS) return 'today'
  }
  // Includes the unstructured old-format requests. They used to count as possibly-needed, which
  // is where much of the noise came from — the standing rule covers them the same way, so they
  // run too; the UI still marks them as unstructured so a missing head stays visible.
  return 'running'
}

export interface InboxIssue {
  number: number
  title: string
  html_url: string
  created_at: string
  body?: string | null
}

export interface InboxEntry {
  repo: string
  heading: string
  issueNumber: number
  issueUrl: string
  openedAt: string
  ageDays: number
  excerpt: string
  /** Triage (Steuerzentrale v2 P1): the sender's own four-line head, parsed — or the
   * fallback. `summary` is the tl;dr when structured, else the first sentences (the UI
   * marks the fallback "unstrukturiert (alt)"). `needsAction` is conservative: an
   * unstructured request counts as possibly needing Frank. */
  structured: boolean
  summary: string
  braucht: string | null
  brauchtOptionen: string[]
  frist: string | null
  fristDate: string | null
  kontext: string | null
  /** Which tray this belongs in — see trayFor(). */
  tray: InboxTray
  /** Kept for the UI's existing filter: true only for the `today` tray. */
  needsAction: boolean
  /** Days until the named deadline; null when none is named. Negative once it has passed. */
  fristInDays: number | null
}

// Raised from 600 on 2026-07-31 (Frank: "clicking 'mehr' to read the whole message does
// nothing"). 600 characters is roughly the first two paragraphs of a request — the "mehr"
// toggle in the Steuerzentrale could never have shown more than that, because the rest was
// never sent. The requests from the practices run to several thousand characters and are
// argued end to end; a decision cannot be made from the opening. Four open issues at a few
// kB each is nothing against a payload that already carries runs, commits and queues.
const EXCERPT_LEN = 12000

/** Baut die Inbox aus den offenen Issues, die der Bot pro Request-Section anlegt
 * (Titel "Request aus {repo}: {heading}", siehe requestsMd.parseInboxIssueTitle). Issues mit
 * fremdem Titelformat werden übersprungen statt geraten geparst — die Inbox zeigt nur, was sie
 * sicher versteht. */
export function buildInbox(issues: InboxIssue[], nowIso: string): InboxEntry[] {
  const out: InboxEntry[] = []
  for (const issue of issues) {
    const parsed = parseInboxIssueTitle(issue.title)
    if (!parsed) continue
    // Team-eigene Sections (Seeds/Team note/Team responses) sind keine Anfragen an Frank —
    // auch wenn der Watchdog sie (früher) zu Issues gemacht hat, gehören sie nicht in die Inbox.
    if (isNonRequestSection(parsed.heading)) continue
    const body = issue.body ?? ''
    const head = parseRequestHead(body)
    const tray = trayFor(head, nowIso)
    const age = ageDays(issue.created_at, nowIso)
    const fristInDays = head.fristDate ? daysUntil(head.fristDate, nowIso) : null
    // Claims only: the dashboard carries what names a claim on Frank — a dated deadline in
    // reach ('today') or a forwarding ('postoffice'). Everything else runs without him and
    // is record, not inbox. A deadline still beyond FRIST_WINDOW_DAYS classifies as
    // 'running' here and stays off the dashboard too — its issue stays open (the watchdog
    // keeps claims), so it surfaces under "Heute nötig" the day it comes within reach.
    if (tray === 'running' || tray === 'fyi') continue
    out.push({
      repo: parsed.repo,
      heading: parsed.heading,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      openedAt: issue.created_at,
      ageDays: age,
      excerpt: body.slice(0, EXCERPT_LEN),
      structured: head.structured,
      summary: head.structured && head.tlDr ? head.tlDr : fallbackSummary(body),
      braucht: head.structured ? head.braucht : null,
      brauchtOptionen: head.optionen,
      frist: head.frist,
      fristDate: head.fristDate,
      kontext: head.kontext,
      tray,
      needsAction: tray === 'today',
      fristInDays,
    })
  }
  return out
}
