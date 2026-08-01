// src/lib/maschinenraum.ts
// Datenlage für /maschinenraum und den Hub-Teaser: der letzte GELANDETE Stand der
// Ökologie, ausschließlich aus committeten Spiegeln — keine Live-Behauptungen, kein
// Netz zur Bauzeit. Pure Funktionen; die Astro-Seiten reichen ihre import.meta.glob-
// Ergebnisse herein (Globs sind nicht parametrisierbar), Chronicles kommen über die
// bestehenden loadChronicle()-Leser der Praxen.

export interface JournalLatest {
  /** YYYY-MM-DD aus dem Dateinamen */
  date: string
  /** Dateiname ohne .md — stabiler Anker */
  slug: string
  /** erste Überschrift (ohne '#') oder erste nicht-leere Zeile, Markdown entschärft */
  firstLine: string
}

/** Defuses the markdown of ONE line: leading ATX marker, bold/italic asterisks, backticks.
 *  Exported (2026-08-01) so the requests reader builds its excerpts on the same flattening
 *  the machine room already uses for journal first lines — deliberately conservative: it
 *  leaves `_` alone (identifiers like `BOT_TOKEN` are common in these files) and does not
 *  touch link syntax, which callers that need it strip on top (see requestsMd.plainLine). */
export const stripMd = (s: string): string =>
  s
    .replace(/^#+\s*/, '')
    .replace(/\*\*?/g, '')
    .replace(/`/g, '')
    .trim()

export function trimLine(s: string, max = 150): string {
  const t = s.trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).trimEnd() + '…'
}

/** Jüngster Journal-Eintrag eines ?raw-Globs über journal/*.md (Dateinamen datumspräfigiert). */
export function latestJournal(raw: Record<string, string>): JournalLatest | null {
  const files = Object.entries(raw)
    .map(([path, content]) => {
      const base = path.split('/').pop() ?? ''
      const date = base.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
      return date ? { base, date, content } : null
    })
    .filter((f): f is NonNullable<typeof f> => f !== null)
    .sort((a, b) => b.base.localeCompare(a.base))
  const top = files[0]
  if (!top) return null
  const line =
    top.content.split('\n').find((l) => l.trim().startsWith('#')) ??
    top.content.split('\n').find((l) => l.trim() !== '') ??
    ''
  return { date: top.date, slug: top.base.replace(/\.md$/, ''), firstLine: stripMd(line) }
}

export interface AtelierLine {
  id: string
  title: string
  kind: 'work-line' | 'study' | 'project'
  encounterRef?: string
}

export interface AtelierState {
  active: AtelierLine[]
  closed: number
}

/** SCORE-Frontmatter der gespiegelten Projekte: offene Linien/Studien + Zählung. */
export function atelierState(scoresRaw: Record<string, string>): AtelierState {
  const active: AtelierLine[] = []
  let closed = 0
  for (const [path, raw] of Object.entries(scoresRaw)) {
    const id = path.match(/projects\/([^/]+)\//)?.[1] ?? path
    const fm = raw.split('\n---')[0]
    const field = (k: string): string | undefined =>
      fm.match(new RegExp(`^${k}:\\s*"?([^"#\\n]+?)"?\\s*(#.*)?$`, 'm'))?.[1]?.trim() || undefined
    const status = field('status')
    if (status !== 'ACTIVE') {
      if (status) closed++
      continue
    }
    const kindRaw = field('kind') ?? field('sub_kind') ?? 'project'
    const kind: AtelierLine['kind'] =
      kindRaw === 'work-line' ? 'work-line' : kindRaw === 'study' ? 'study' : 'project'
    active.push({
      id,
      title: field('title') ?? id,
      kind,
      encounterRef: field('encounter_ref'),
    })
  }
  active.sort((a, b) => (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind === 'work-line' ? -1 : 1))
  return { active, closed }
}

export interface JiPracticeStatus {
  present: boolean
  /** letzter mit '**Status' beginnender Satz des ji-Abschnitts, Markdown entschärft */
  status?: string
}

/** Letzter dokumentierter Status eines Joint-Inquiry-Blocks in einem gespiegelten REQUESTS.md. */
export function jiStatus(requestsRaw: string, id: string): JiPracticeStatus {
  const idx = requestsRaw.indexOf(id)
  if (idx === -1) return { present: false }
  // Abschnitt: von der Überschrift vor dem Treffer bis zur nächsten '## '-Überschrift
  const before = requestsRaw.lastIndexOf('\n## ', idx)
  const start = before === -1 ? 0 : before
  const nextHeading = requestsRaw.indexOf('\n## ', idx)
  const section = requestsRaw.slice(start, nextHeading === -1 ? undefined : nextHeading)
  const statusLines = section
    .split('\n')
    .filter((l) => /^\s*\*\*Status/.test(l))
  const last = statusLines[statusLines.length - 1]
  if (!last) return { present: true }
  return { present: true, status: trimLine(stripMd(last), 220) }
}

export interface ChronicleLike {
  seq: number
  date: string
  collective_session: number | null
  move: string
  summary: string
}

export interface ChronicleLatest {
  date: string
  session: number | null
  move: string
  summary: string
}

export function lastChronicle(entries: ChronicleLike[]): ChronicleLatest | null {
  if (entries.length === 0) return null
  const top = [...entries].sort((a, b) => b.seq - a.seq)[0]
  return {
    date: top.date,
    session: top.collective_session,
    move: top.move,
    summary: trimLine(top.summary, 180),
  }
}
