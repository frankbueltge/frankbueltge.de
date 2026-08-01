// src/lib/plenum/dossier.ts — the sitting dossier: one sitting of the Plenum, read out of its
// own minutes.
//
// WHY THE PLENUM'S DOSSIER IS NOT THE PRACTICES'. The Atelier, the Field and the Studio each
// answer "what is this house working on" with a BODY OF WORK — an instrument in service, a work
// in the spotlight, a line under way. The Plenum has no body of work on this site: it is
// data-snack.com's resident collective, a guest voice here, and its snacks live in its own
// house. What this repo mirrors is the MINUTES — one sitting at a time, chaired, tabled, gated,
// landed. So the protagonist of this dossier is a SITTING, not a work, and everything the page
// shows about it is a span of the committed minutes carried with the path it was read from.
//
// THE HOUSE RULE HOLDS: nothing here is written, summarised or rounded. Where the record says
// nothing — a sitting with no agenda section, a sitting with no goods-inward item — this returns
// null and the page states the gap in words. The one thing this module DOES do beyond quoting is
// decide WHICH section of a sitting is an agenda and which is an outcome; both rules are small,
// explicit and printed on the page beside the quotation (`label` carries the record's own
// heading), so a reader can check the attribution rather than trust it.
//
// PURE BY CONSTRUCTION. No import.meta.glob, no fs — the caller injects the committed entries
// (the pages pass `getCollection('plenum')` straight in), so this module is unit-testable
// against fixtures AND against the real mirrored files.

import { splitSessions, uniqueSessionAnchor } from '@/lib/engines/journal'
import { countWords, parseSections } from '@/lib/zentrale/requestsMd'

// ————————————————————————————————————————————————— injected inputs ——————————

/** The two fields of a content-collection entry this module reads. */
export interface PlenumEntry {
  /** collection id, e.g. `journal/2026-07-22.md` */
  id: string
  body?: string | undefined
}

const JOURNAL_DIR = 'src/content/plenum/journal'

/** A span of a committed file, carried with where it came from and what the record calls it. */
export interface Quoted {
  text: string
  /** repo-relative path — printed with the quotation */
  source: string
  /** the record's own heading for this span, in its own words */
  label: string
}

/** One H2 of a sitting — the sitting's full shape, so nothing the dossier does not quote is
 *  hidden from a reader who wants to know what else was on the table. */
export interface SittingSection {
  heading: string
  words: number
}

export interface PlenumSitting {
  /** deep-link id on /plenum — `sitting-<anchor>` */
  id: string
  /** the anchor the complete record already assigns this sitting (see `anchorsMatchRecord`) */
  anchor: string
  /** the record's own H1, verbatim */
  heading: string
  /** the ISO date the heading names, or the day file's own date where it names none */
  date: string
  /** false where the date had to be taken from the filename — an honest gap, marked */
  dateFromHeading: boolean
  /** the record's own session label ("Session 14"), or null where it names none */
  session: string | null
  sessionNumber: number | null
  /** what this sitting calls itself after the colon, verbatim; null where the heading names none */
  subject: string | null
  /** `minutes` for a sitting, `note` for an entry the record itself says is not a session */
  kind: 'minutes' | 'note'
  /** the opening italic block — chair, table, gate — verbatim */
  table: Quoted | null
  /** the sitting's own agenda section, verbatim */
  agenda: Quoted | null
  /** what the sitting settled: its own outcome sections, each verbatim under its own heading */
  decisions: Quoted[]
  /** the goods-inward inspection — the record's own standing item for what reaches it from the
   *  ecology; null where this sitting recorded none */
  goodsInward: Quoted | null
  /** the ecology's own names this sitting's text carries, in the order this module tests them */
  ecologyNames: string[]
  /** every H2 of the sitting, in the record's order */
  contents: SittingSection[]
  /** words of the whole sitting, so a reader knows what the full text costs them */
  words: number
  /** repo-relative path of the day file this sitting was read from */
  source: string
  /** where the whole sitting reads, verbatim */
  href: string
  /** true for the sitting the dossier opens on — derived, never typed */
  current: boolean
  /** true where a DIFFERENT sitting carries the same session label (the record's numbering
   *  collided twice, and the recovery sitting of 2026-07-20 says why) */
  sessionShared: boolean
}

// ————————————————————————————————————————————————— the heading ——————————————
//
// Every heading this mirror carries takes one of two shapes, and both are quoted whole on the
// page — what is parsed off them is only the machine-readable part:
//
//   `# Plenum minutes — 2026-07-22 (Session 14): concept session — "Valid + Untrusted" …`
//   `# Plenum protocol change — 2026-07-05 (post-S6): the Field Standard anchored`
//
// The second is NOT minutes and the record says so in its own opening line ("Not a session; a
// protocol amendment"). It keeps its place in the dossier — an entry the plenum wrote about its
// own constitution belongs in the record of its sittings — but it is labelled for what it is
// rather than dressed up as a sitting that never sat.

const HEADING_DATE = /(\d{4}-\d{2}-\d{2})/
const HEADING_SESSION = /\(Session (\d+)/i
const HEADING_SUBJECT = /\)\s*:\s*(.+)$/
const HEADING_MINUTES = /^Plenum minutes\b/i

/** The ISO date the heading names, or null. */
export function headingDate(heading: string): string | null {
  return HEADING_DATE.exec(heading)?.[1] ?? null
}

/** The session number the heading names, or null where it names none (the protocol change). */
export function headingSession(heading: string): number | null {
  const m = HEADING_SESSION.exec(heading)
  return m ? Number.parseInt(m[1], 10) : null
}

/** What the heading calls this sitting after the closing parenthesis and colon, verbatim.
 *  Null where the heading is bare (`… (Session 4)`), which most of the early sittings are. */
export function headingSubject(heading: string): string | null {
  const m = HEADING_SUBJECT.exec(heading)
  return m ? m[1].trim() : null
}

// ————————————————————————————————————————————————— the table ————————————————
//
// Every entry in this mirror opens with one italic block naming who chaired, who was at the
// table, who was NOT convened and why, and which ephemeral specialists ran the gate. It is the
// plenum's cast list, written by the plenum, and it is the single most useful thing to put at
// the top of a sitting's dossier.
//
// THE ASTERISKS ARE THE HARD PART. The block is delimited by a single `*` … `*` pair, and its
// prose is full of `**bold**` runs (`**Environment note, recorded openly:**`, `**Rook**`). A
// naive non-greedy match to the next `*` at end of line stops at the first bold run that happens
// to close a line — measured on the real mirror, that cut session 4's cast list from 102 words to
// 76 and silently dropped the gate. So the opening `*` must not be followed by another, and the
// closing `*` must be neither preceded nor followed by one.

const TABLE_BLOCK = /^\*(?!\*)([\s\S]*?)(?<!\*)\*(?!\*)\s*(?:\n|$)/

/** The sitting's opening italic block, verbatim and without its delimiting asterisks. Returns
 *  null where an entry opens with something else — nothing is invented in its place. */
export function readTable(text: string): string | null {
  const m = TABLE_BLOCK.exec(text.replace(/^\s+/, ''))
  return m ? m[1].trim() : null
}

// ————————————————————————————————————————————————— attribution ——————————————
//
// WHICH SECTION OF A SITTING IS WHAT. Two rules, both matched against the record's OWN H2
// headings, and both printed with the quotation so the match can be checked:
//
//   1. AGENDA — the section the sitting itself titles `Agenda`. Nine of the fifteen entries
//      write one; six do not, and for those the dossier says so and points at the contents list
//      rather than promoting some other section into the slot.
//   2. OUTCOME — the sections the plenum's own vocabulary uses for what a sitting SETTLED:
//      what it voted, what it landed or queued, what it discarded, what it recovered, what it
//      corrected, and where it left things. Every word in the set below occurs as a heading in
//      the committed mirror; none of them was invented for this module.
//
// A THIRD RULE WAS CONSIDERED AND REJECTED against the committed data: "the gate" reads like an
// outcome and is the most quoted part of these minutes, but it is the DELIBERATION — a specialist
// reading a draft line by line — and it runs to a third of a sitting. Promoting it would have
// made "what it decided" the longest block on the page and buried the actual landings inside it.
// The gate stays in the contents list, where a reader can see it and open the full sitting.

const AGENDA_HEADING = /^agenda\b/i
const OUTCOME_HEADING =
  /^(landed|land\b|queued|graduated|discarded|the recovery\b|corrections to the record\b|vote\b|decision\b|status\b|next step\b)/i

/** The plenum's own standing agenda item for what reaches it from outside — literally "goods
 *  inward". The heading is the record's own and it is the ONLY machine-readable place where
 *  contact with this ecology is recorded, which is why the dossier reads it rather than hunting
 *  the prose for practice names. */
const GOODS_INWARD_HEADING = /^wareneingang\b/i

/** The names of this ecology, as the plenum writes them. Tested against the whole sitting text
 *  and reported as a plain list — a name in the text is evidence that the sitting touched that
 *  practice, never a claim about WHAT it did with it; the goods-inward quotation above is where
 *  the record says that in its own words. */
const ECOLOGY_NAMES: readonly { label: string; re: RegExp }[] = [
  { label: 'Meridian / the Field', re: /\b(Meridian|field-research)\b/ },
  { label: 'Ulysses / the Atelier', re: /\bUlysses\b/ },
  { label: 'Ensemble / the Studio', re: /\bEnsemble\b/ },
]

// ————————————————————————————————————————————————— the dossier ——————————————

const quote = (heading: string, body: string, source: string): Quoted => ({
  text: body.trim(),
  source,
  label: heading,
})

/**
 * Every mirrored sitting as a dossier, NEWEST FIRST, with the newest marked `current`.
 *
 * ORDER IS LOAD-BEARING, DO NOT "TIDY" IT. The walk below is chronological — day files by their
 * own date, then by filename inside a date (`2026-07-20` before `2026-07-20-b`), then sittings in
 * file order — because `uniqueSessionAnchor` mutates a shared Set and the FIRST claimant of a
 * drifting number keeps the clean anchor. That is exactly the order `buildDayIndex` walks for the
 * complete record, and it has to stay exactly that order, or the dossier's deep links would point
 * at other sittings than the ones they name. `anchorsMatchRecord` in the test locks the two
 * together against the real mirror.
 */
export function buildSittings(entries: readonly PlenumEntry[]): PlenumSitting[] {
  const days = entries
    .filter((e) => e.id.startsWith('journal/'))
    .map((e) => {
      const day = e.id.replace(/^journal\//, '').replace(/\.md$/, '')
      return { day, date: /^\d{4}-\d{2}-\d{2}/.exec(day)?.[0] ?? day, body: e.body ?? '' }
    })
    .sort((a, b) => (a.date === b.date ? a.day.localeCompare(b.day) : a.date.localeCompare(b.date)))

  const anchorsUsed = new Set<string>()
  const asc: PlenumSitting[] = []

  for (const d of days) {
    const source = `${JOURNAL_DIR}/${d.day}.md`
    splitSessions(d.body).forEach((s, i) => {
      const anchor = uniqueSessionAnchor(anchorsUsed, s.heading, d.day, i)
      const sections = parseSections(s.text)
      const agendaSection = sections.find((x) => AGENDA_HEADING.test(x.heading))
      const goods = sections.find((x) => GOODS_INWARD_HEADING.test(x.heading))
      const table = readTable(s.text)
      const dateNamed = headingDate(s.heading)
      const sessionNumber = headingSession(s.heading)

      asc.push({
        id: `sitting-${anchor}`,
        anchor,
        heading: s.heading,
        date: dateNamed ?? d.date,
        dateFromHeading: dateNamed !== null,
        session: sessionNumber === null ? null : `Session ${sessionNumber}`,
        sessionNumber,
        subject: headingSubject(s.heading),
        kind: HEADING_MINUTES.test(s.heading) ? 'minutes' : 'note',
        table: table ? { text: table, source, label: 'the sitting’s own opening note' } : null,
        agenda: agendaSection ? quote(agendaSection.heading, agendaSection.body, source) : null,
        decisions: sections
          .filter((x) => OUTCOME_HEADING.test(x.heading))
          .map((x) => quote(x.heading, x.body, source)),
        goodsInward: goods ? quote(goods.heading, goods.body, source) : null,
        ecologyNames: ECOLOGY_NAMES.filter((n) => n.re.test(s.text)).map((n) => n.label),
        contents: sections.map((x) => ({ heading: x.heading, words: countWords(x.body) })),
        words: countWords(s.text),
        source,
        href: `/plenum/record#${anchor}`,
        current: false,
        sessionShared: false,
      })
    })
  }

  // The protagonist: the LAST sitting in chronological order. Derived, never typed — a new
  // mirrored sitting moves it on its own, which is the whole point of a dossier that leads with
  // the current sitting.
  if (asc.length > 0) asc[asc.length - 1].current = true

  // The record's own numbering collided twice (two sittings call themselves Session 9, two call
  // themselves Session 10). It is not this site's place to renumber a mirrored record, and it is
  // not honest to print two "Session 10" tabs as though the reader should not notice — so the
  // collision is derived here and stated on the page.
  const seen = new Map<number, number>()
  for (const s of asc) {
    if (s.sessionNumber === null) continue
    seen.set(s.sessionNumber, (seen.get(s.sessionNumber) ?? 0) + 1)
  }
  for (const s of asc) {
    s.sessionShared = s.sessionNumber !== null && (seen.get(s.sessionNumber) ?? 0) > 1
  }

  return asc.reverse()
}

/** The sitting the dossier opens on — the derived protagonist. Null on an empty mirror; the page
 *  decides whether that is a build failure (it is, for /plenum) or an empty state. */
export function currentSitting(sittings: readonly PlenumSitting[]): PlenumSitting | null {
  return sittings.find((s) => s.current) ?? null
}

/** The session numbers more than one sitting claims — printed on the page as the record's own
 *  drift, in the order they were first claimed. */
export function collidingSessions(sittings: readonly PlenumSitting[]): number[] {
  const out: number[] = []
  for (const s of [...sittings].reverse()) {
    if (s.sessionShared && s.sessionNumber !== null && !out.includes(s.sessionNumber)) {
      out.push(s.sessionNumber)
    }
  }
  return out
}

/** What the dossier's status line counts: sittings, the notes among them, and the sittings whose
 *  record carries a goods-inward inspection of this ecology's output. */
export interface SittingTally {
  sittings: number
  notes: number
  goodsInward: number
  words: number
}

export function tally(sittings: readonly PlenumSitting[]): SittingTally {
  return {
    sittings: sittings.filter((s) => s.kind === 'minutes').length,
    notes: sittings.filter((s) => s.kind === 'note').length,
    goodsInward: sittings.filter((s) => s.goodsInward !== null).length,
    words: sittings.reduce((sum, s) => sum + s.words, 0),
  }
}
