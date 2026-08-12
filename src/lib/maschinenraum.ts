// src/lib/maschinenraum.ts
// The data behind /maschinenraum and the hub's teaser: the last LANDED state of the ecology,
// read exclusively from committed mirrors — no live claims, no network at build time. Pure
// functions; the Astro pages hand in their own import.meta.glob results (globs cannot be
// parameterised), and chronicles come through the practices' existing loadChronicle() readers.
//
// What this module deliberately no longer reads (2026-08-02): the joint inquiry's per-practice
// status out of the mirrored REQUESTS.md channels. /encounters reads the same channels under
// named, printed rules and quotes each practice's own commitment beside its path, which is
// strictly more than the one line this module cut out of them — so the reading moved there
// rather than being kept in two places to disagree with itself.
import { buildJointInquiry, normaliseVoice, sortCrossings, type JointInquiryInput } from '@/lib/begegnungen/crossings'
import { jiStart, type VoiceId as LaneId } from '@/lib/partitur'

export interface JournalLatest {
  /** YYYY-MM-DD, from the file name */
  date: string
  /** file name without .md — a stable anchor */
  slug: string
  /** the first heading (without '#') or the first non-empty line, markdown defused */
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

/** The newest journal entry of a ?raw glob over journal/*.md (file names carry the date prefix). */
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

/** The SCORE frontmatter of the mirrored projects: the open lines/studies, and a count. */
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

// ————————————————————————————————— the joint-inquiry bracket ——————————————————

/** The crossing register's voice ids ↔ the score's lane ids: two vocabularies for one quartet. */
const LANE_OF: Partial<Record<string, LaneId>> = {
  ulysses: 'atelier',
  meridian: 'field',
  ensemble: 'studio',
  plenum: 'plenum',
}

export interface JiBracket {
  id: string
  label: string
  start: string | null
  voices: LaneId[]
}

/**
 * The bracket both scores draw over the running joint inquiry — the entrance's compact one and the
 * machine room's full one.
 *
 * DERIVED, because until 2026-08-02 it was typed twice: `ji-2026-002` / “Model Collapse” stood
 * hardcoded in HubEntrance.astro AND in maschinenraum.astro. Two copies of a name the contact zone
 * owns, on two pages that show the same figure — the day a second inquiry opens, one of them is a
 * lie and nothing fails. Now both read the mirrored register through the crossing dossier's own
 * builder, so the bracket moves with the record.
 *
 * It takes the raw fixture rather than built crossings on purpose: a bracket needs the inquiries
 * and nothing else, and making the entrance assemble the register and every exported ledger just
 * to draw one rectangle would be work for no reading.
 *
 * Only an OPEN inquiry gets a bracket, because the bracket's own caption says "still open" — and
 * `null` where the register carries none, which the callers render as no bracket rather than as an
 * empty one.
 */
export function jiBracket(
  inquiries: readonly JointInquiryInput[],
  scoresRaw: Record<string, string>,
): JiBracket | null {
  const built = inquiries
    .map((ji) => buildJointInquiry(ji))
    .filter((c): c is NonNullable<typeof c> => c !== null)
  const running = sortCrossings(built).find((c) => c.standing === 'open')
  if (!running) return null
  return {
    id: running.id,
    label: running.title,
    start: jiStart(scoresRaw, running.id),
    voices: [
      ...new Set(
        running.voices
          .map((v) => LANE_OF[normaliseVoice(v.rawVoice)])
          .filter((v): v is LaneId => v !== undefined),
      ),
    ],
  }
}
