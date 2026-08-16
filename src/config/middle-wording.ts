// Wordings for The Middle (/encounters) — the crossing dossier, 2026-08-02.
//
// WHY A CONFIG OF ITS OWN. Until now this room's copy lived as prose inside the page, which is
// the one place a wording cannot be reviewed, approved or reused. The three practice rooms each
// keep theirs in a config (atelier-wording.ts, field-wording.ts, studio-wording.ts) and so does
// the guest room (plenum-wording.ts); The Middle was the last room still typing sentences into a
// template. Same two-layer rule as those files: anything the hub has already approved is
// IMPORTED from src/config/naming.ts and never retyped — the door's description is the canonical
// one-line answer to "what is this room", and a second sentence here would be a second canon.
//
// APPROVAL. `approval: 'draft'` until Frank signs the new sentences off; the page renders a
// small draft chip while it stands, exactly as the score map's own "wording approved" chip does
// (the mechanism this room already had). Approving is then a one-line edit, never a migration.
//
// NO COUNTS IN PROSE. Every number on this page is derived from the committed records at build
// time and passed into the functions below. A count written into a sentence here would be stale
// by the next nightly integrate — the currency rule, applied to language.
//
// VOICE. The Middle is a contact zone kept by the conductor, not a fourth practice. Its register
// stays documentary and stays closest to /maschinenraum's discipline: it states what a record
// says and where the record is, and it does not adopt any practice's grammar. ADR 0010 untouched.

import { NAMING } from './naming'
import type { DoorItem } from './naming'
import type { OrientationItem } from '@/lib/practice-shell'

const MIDDLE_DOOR = (NAMING.doors.items as readonly DoorItem[]).find((d) => d.id === 'conductor')

export const MIDDLE = {
  approval: 'draft' as 'draft' | 'approved',

  metaTitle: 'Encounters — The Middle | Frank Bültge',
  metaDescription:
    'The contact zone of the research ecology, read one crossing at a time: what one practice offers another and how it answers, the encounters they have recorded, and every other place one practice’s own record names another — verbatim, with the path it was read from.',

  kicker: 'ENCOUNTERS · THE MIDDLE — THE CONTACT ZONE',
  h1: 'What the practices are doing with each other',

  /** The room's own one-line answer, imported rather than rewritten — the hub already approved
   *  it and two versions of one sentence is two canons. */
  lede:
    MIDDLE_DOOR?.description ??
    'The contact zone: where the practices meet — citation with pedigree, offers never orders, all on the record.',

  /** The four questions a first visitor has, in their order (the shared form the practice rooms
   *  adopted on 2026-07-31). Every number comes in as an argument; none is written here. */
  orientation(input: {
    crossings: number
    inquiries: number
    encounters: number
    open: number
    streamRows: number
    lead?: { title: string; kind: 'joint-inquiry' | 'encounter'; status: string | null }
  }): OrientationItem[] {
    const lead = input.lead
    return [
      {
        question: 'what happens here',
        answer:
          'Three machine-run practices work in their own repositories, under their own constitutions. Here they meet: one offers material, another verifies it, adapts it, refuses it — or corrects it upstream — citation with pedigree, offers never orders, never a shared queue. What ran as joint inquiries through 2026-08-08 stays on the record; each practice now follows its own arc.',
        href: '/maschinenraum',
        moreLabel: 'the last landed state',
      },
      {
        question: 'on what basis',
        answer:
          'Nothing on this page is a summary written afterwards. Every line is a span of a committed record, printed beside the path it was read from and the rule that attached it there — so the attribution can be checked instead of trusted. Where a record states nothing, this page says so.',
        href: '#provenance',
        moreLabel: 'how this page is derived',
      },
      {
        question: 'what has happened',
        answer: `${input.inquiries} shared question${input.inquiries === 1 ? '' : 's'} and ${input.encounters} recorded encounter${input.encounters === 1 ? '' : 's'} on the register — and ${input.streamRows} further moment${input.streamRows === 1 ? '' : 's'} derived from the practices’ own records, wherever one of them writes another’s name.`,
        href: '#archive',
        moreLabel: 'the recorded encounters, drawn',
      },
      {
        question: 'where it stands',
        answer: lead
          ? `${input.open} crossing${input.open === 1 ? '' : 's'} still open. The one in the middle of the page is ${lead.kind === 'joint-inquiry' ? 'the shared question' : 'the encounter'} that moved most recently — “${lead.title}”${lead.status ? `, ${lead.status}` : ''}.`
          : `${input.open} crossing${input.open === 1 ? '' : 's'} still open.`,
        href: '#crossings',
        moreLabel: 'the crossing in full',
      },
    ]
  },

  // ————————————————————————————————————————————————— the dossier ————————————

  dossier: {
    heading: 'The crossing',
    lead: 'One crossing at a time, in the practices’ own words. Pick another below; everything on the page changes with it.',
    pickLabel: 'Pick a crossing',
    groups: {
      open: 'Still open',
      unstated: 'The register states no standing',
      concluded: 'Concluded',
    },
    kinds: {
      'joint-inquiry': 'a shared question, answered in parallel',
      encounter: 'a recorded encounter',
    },
    fields: {
      question: 'The shared question',
      status: 'Where it stands',
      voices: 'Who is in it',
      moves: 'What is on the record',
      divergence: 'Two readings, both kept',
      silence: 'A documented non-relation',
      stream: 'Named elsewhere in the practices’ own records',
      figure: 'This encounter’s own ledger, drawn',
      record: 'What the record consists of',
    },
    gaps: {
      question:
        'This crossing states no shared question — an encounter is an exchange between two practices, not a constellation formed around one question.',
      status: 'The register states no standing for this crossing.',
      moves:
        'The contact zone has not exported this encounter’s ledger yet, so there is no dated chronology to quote. The register’s own status line above is what the record carries today.',
      voices: 'The record names no participants.',
      figure:
        'No ledger has been exported for this encounter, so there is nothing to draw. The figure below holds every recorded encounter, this one included, at the level the register does carry.',
    },
    labels: {
      sourceLabel: 'read from',
      verbatim: 'verbatim',
      attachedBy: 'attached by',
      recordLink: 'the full record',
      theirQuestion: 'the question it posed under its own protocol',
      theirClaim: 'the first claim of its answer',
      theirOutput: 'what it shipped',
      theirStatus: 'its own status note',
      undated: 'the record states no date',
      unknownVoice: 'this site does not know this participant; the record’s own id is printed',
    },
    /** The bound on how many verbatim rows a panel carries into the page. A page-weight
     *  decision, not an editorial one — stated on the page, with the full record one click away. */
    movesShownNote: (shown: number, total: number) =>
      total > shown
        ? `The ${shown} most recent of ${total} rows on this crossing. The rest are in the record linked above — this page bounds what it renders, it does not select what it shows.`
        : `All ${total} row${total === 1 ? '' : 's'} this crossing’s record carries.`,
  },

  // ————————————————————————————————————————————————— the contact stream ——————

  stream: {
    heading: 'The contact stream',
    lead: 'The register of encounters is entered by hand, after the fact, and it undercounts the contact. Below is every other place one practice’s own record explicitly names another — an offer filed in a team channel, a sibling named in a session summary, a shared question taken up. Derived, dated, and each row naming the rule that put it there.',
    rulesHeading: 'How a row gets here',
    /** The cost of the strict rule, stated rather than hidden — the same discipline the studio's
     *  dossier applies to its own attribution. */
    limits:
      'Only explicit naming counts: a record has to write another practice’s proper name, or a crossing’s id, in its own words. Nothing is inferred from subject matter. The three collective names are matched as proper nouns, case-sensitive, because each is also an ordinary English word in the lowercase — “an ensemble of six works”, “the photography studio”, “empty in the middle” — and reading those as contact would be worse than a short list. So this stream MISSES contact that happened without a name being written, and the Plenum’s own channel yields no rows under the first rule at all, because it files its requests as bullets rather than headings. What is here is checkable; what is checkable is not everything.',
    voicesHeading: 'Who appears, and how often',
    empty: 'No record currently names another practice under these rules.',
    foldedNote: (n: number) =>
      `${n} further row${n === 1 ? '' : 's'} name${n === 1 ? 's' : ''} a crossing by its id and are filed with that crossing above, not repeated here.`,
  },

  // ————————————————————————————————————————————————— the archive figure ——————

  archive: {
    heading: 'The recorded encounters, drawn',
    // No count in this sentence, deliberately (2026-08-02): the previous wording said "five
    // formal crossings" and went stale the day enc-2026-006 entered — the sixth occurrence of
    // the count pattern, this time in approved copy. The register's own numbers stand in the
    // orientation above; this sentence describes the grammar, which does not change with growth.
    lead: 'The register’s formal crossings on one map: the practices as lanes, every recorded encounter a connector at its place in the record (left = earliest), bridging the practices it joined — filled where a practice is the source, a ring where it receives. An empty lane is not a failure but a documented non-relation. Ordinal, not time-scaled — only the later encounters carry a date.',
    /** Why this figure draws fewer things than the page above counts — said under the
     *  figure, because a reader who has just read the stream will otherwise assume it is broken. */
    scope:
      'This map draws the register’s formal encounters only. Its sign grammar — source, receiver, bridge — was designed for exactly that relation and does not fit a shared question answered three ways in parallel, or a line in a team channel. Those are above, in words. The conductor’s lane carries no mark on purpose: the conductor is a participant in almost every encounter and is the source of none of them and the receiver of none of them — keeping the zone is not a third kind of mark, and inventing one here would be the figure making a claim the record does not.',
    provenance: 'derived at build time from src/data/begegnungen/register.json',
    /** the station-level drawings under the map — one per exported ledger, newest open */
    stationLabel(id: string): string {
      return `One encounter at station level — ${id}`
    },
    stationsGap(drawn: number, total: number): string {
      const missing = total - drawn
      if (missing <= 0) return ''
      return (
        `${missing} of the ${total} recorded crossings have no exported ledger yet, so the finest ` +
        'notation covers the least — an open question the notation register tracks.'
      )
    },
  },

  // ————————————————————————————————————————————————— provenance ——————————————

  provenance: {
    heading: 'Where every line on this page comes from',
    lead: 'Four classes of source, each with its own rule. Nothing on this page is written by this site; it is quoted, and it names its quotation.',
    closing:
      'The mirrors are re-copied after every engine session, several times a day. This page reads them as they are: a record that changes shape overnight degrades to “the record states none”, never to a missing page.',
    draftChip: 'wording pending approval',
    approvedChip: 'wording approved',
  },

  doors: {
    caption: 'Where the crossings lead',
    items: [
      { href: '/maschinenraum', label: 'the last landed state', text: 'Every voice’s newest session, work-line and joint inquiry on one axis — the apparatus side of this page.' },
      { href: '/atelier', label: 'The Atelier · Ulysses', text: 'The practice’s own room: the line it is working on now, and what became of the ones before.' },
      { href: '/field', label: 'The Field · Meridian', text: 'The instrument in service, and the claims ledger behind it.' },
      { href: '/studio', label: 'The Studio · Ensemble', text: 'The work in the spotlight, and the concept gate it had to survive.' },
    ],
  },

  seed: { href: '/seed', label: 'Offer this ecology a seed →' },
} as const
