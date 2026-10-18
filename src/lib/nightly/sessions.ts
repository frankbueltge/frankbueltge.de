// src/lib/nightly/sessions.ts — how many sessions the nightly line has worked, read off its research days.
//
// Until 2026-10-18 the line's room said "N nights since" the fork and counted the works the fork had
// made. A work is not a night: some nights build nothing and read instead (the restoration's one added
// condition), and a calendar day can hold several sessions (two on the fork's own first day, six on
// 2026-10-07). So the count is taken where the line takes it itself. Its repository answers the question "which session
// is this?" with tools/sessions.py, which reads the session number each journal file claims in its
// head, never a number written in prose. This module reads the same files the same way: the research
// days the mirror carries (src/data/nightly/journal/, everything after the fork), each claiming the
// first "Session N" in its first 600 characters.
//
// The mirror's journal is data the build reads, not a page: since 2026-10-17 the site no longer
// publishes the line's journal, and links its repository instead.

/** Where tools/sessions.py looks for the number, and how far into a file. */
export const SESSION_IN_HEAD = /\b(?:Session|Sitzung)\s*(\d+)\b/i
export const HEAD_CHARS = 600

/** The session a research day claims in its head, if it claims one. */
export function sessionClaimed(text: string): number | undefined {
  const m = SESSION_IN_HEAD.exec(text.slice(0, HEAD_CHARS))
  return m ? Number(m[1]) : undefined
}

export interface SessionLedger {
  /** distinct session numbers the research days claim */
  sessions: number
  /** distinct calendar days with at least one numbered session */
  days: number
  first?: number
  last?: number
  /** the day of the highest-numbered session */
  lastDate?: string
  /** research days that claim no number, by file name, so a count never hides them */
  unnumbered: string[]
}

const dateOf = (name: string): string => /(\d{4}-\d{2}-\d{2})[^/]*$/.exec(name)?.[1] ?? ''

/** The ledger of a set of research days, by file name or path. Only days after `after`, when given:
 *  the inherited half of the line is counted by the Atelier's mirror, never twice. */
export function ledgerOf(files: Record<string, string>, after = ''): SessionLedger {
  const days = new Set<string>()
  const numbers = new Map<number, string>()
  const unnumbered: string[] = []
  for (const [name, text] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const date = dateOf(name)
    if (!date || date <= after) continue
    const n = sessionClaimed(text)
    if (n === undefined) {
      unnumbered.push(name.slice(name.lastIndexOf('/') + 1))
      continue
    }
    days.add(date)
    if (!numbers.has(n) || date > numbers.get(n)!) numbers.set(n, date)
  }
  const sorted = [...numbers.keys()].sort((a, b) => a - b)
  const last = sorted.at(-1)
  return {
    sessions: numbers.size,
    days: days.size,
    ...(sorted.length ? { first: sorted[0], last } : {}),
    ...(last !== undefined ? { lastDate: numbers.get(last) } : {}),
    unnumbered,
  }
}

/** The research days the mirror carries. */
export function journalFiles(): Record<string, string> {
  return import.meta.glob('/src/data/nightly/journal/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>
}
