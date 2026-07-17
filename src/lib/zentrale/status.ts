// src/lib/zentrale/status.ts — reines Umformen der GitHub-API-Antworten (Runs, Commits,
// Issues) und der committeten Engine-JSONs (chronicle, vital-signs) in das, was das
// Steuerzentrale-Dashboard zeigt. Kein fetch hier — das bleibt Sache der Pages Function; diese
// Datei bekommt fertige API-Antworten hereingereicht und bleibt dadurch ohne Netzwerk testbar.
// Alle Reader sind tolerant: fremde/kaputte Daten liefern null/leer statt zu werfen — eine
// ehrliche Lücke im Dashboard schlägt einen Crash oder eine erfundene Zahl.

import { parseInboxIssueTitle } from './requestsMd'

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

/** Ganze Tage, abgerundet (Verweildauer, kein Kalendertag-Delta) — 23:00 gestern bis 01:00
 * heute sind 2 Stunden, nicht "ein Tag alt". */
export function ageDays(fromIso: string, nowIso: string): number {
  const from = new Date(fromIso).getTime()
  const now = new Date(nowIso).getTime()
  return Math.floor((now - from) / 86_400_000)
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
}

const EXCERPT_LEN = 600

/** Baut die Inbox aus den offenen Issues, die der Bot pro Request-Section anlegt
 * (Titel "Request aus {repo}: {heading}", siehe requestsMd.parseInboxIssueTitle). Issues mit
 * fremdem Titelformat werden übersprungen statt geraten geparst — die Inbox zeigt nur, was sie
 * sicher versteht. */
export function buildInbox(issues: InboxIssue[], nowIso: string): InboxEntry[] {
  const out: InboxEntry[] = []
  for (const issue of issues) {
    const parsed = parseInboxIssueTitle(issue.title)
    if (!parsed) continue
    out.push({
      repo: parsed.repo,
      heading: parsed.heading,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      openedAt: issue.created_at,
      ageDays: ageDays(issue.created_at, nowIso),
      excerpt: (issue.body ?? '').slice(0, EXCERPT_LEN),
    })
  }
  return out
}
