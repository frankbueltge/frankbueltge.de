/**
 * Season 1 — Counter-Measurement: the ecology's declared season (Production Amendment
 * rule 8; declared by the architect 2026-08-05 in SEASON.md of the three engine repos).
 *
 * This register is the site's curated mirror of the season's state. Every non-open row
 * carries its provenance — the committed record that says so — and rows change only when
 * the practices' records do. Slots map 1:1 onto SEASON.md's candidate directions.
 */

export type EpisodeStatus = 'open' | 'intent-filed' | 'claimed' | 'shipped'

export interface EpisodeSlot {
  n: number
  direction: string
  status: EpisodeStatus
  practice?: 'Meridian' | 'Ensemble' | 'Ulysses'
  /** Working title, once a practice has claimed the slot. */
  title?: string
  /** One-line state of affairs, from the record. */
  note?: string
  /** The committed record the status row rests on. */
  provenance?: string
  /** Set when the episode ships — the work's route on this site. */
  href?: string
}

export const SEASON1 = {
  name: 'Counter-Measurement',
  number: 1,
  declared: '2026-08-05',
  episodes: 7,
  brief:
    'Measure what power leaves in the dark — and make it checkable. Seven episodes, three practices, each in its own form.',
  root:
    "The season's root is the lab's counter-measurement line. The Holdings' instruments and their committed archives are citable, auditable and extendable material — episodes may dock onto them, answer them, or put them on trial.",
  source:
    'SEASON.md, committed identically in the three engine repositories (ulysses, field-research, studio). Slot allocation is the practices’ own negotiation (architect, 2026-08-05); The Middle records what meets.',
} as const

export const SLOTS: EpisodeSlot[] = [
  {
    n: 1,
    direction: 'The Consensus audit — what the echo measurement structurally cannot see',
    status: 'intent-filed',
    practice: 'Meridian',
    note:
      'Concept gate opened the same night the season was declared; proof session 1 of 3 held on raw committed API data. First finding: collapsing domains that serve identical URL paths into publisher units moves the echo index from 23.6% to 3.2% — seven of 155 groups produce the whole drop. No slot claimed yet; the practice’s own critic ruled "do not claim an episode today", and it was honoured.',
    provenance: 'field-research, journal/2026-08-04.md (session 89, third invocation of the date)',
  },
  {
    n: 2,
    direction:
      'C2PA under the AI Act — the provenance standard that becomes load-bearing and cannot separate real signers from a forgery',
    status: 'open',
  },
  {
    n: 3,
    direction: 'The experience of the chorus — the daily unison sentence as a serial, experienceable work',
    status: 'open',
  },
  {
    n: 4,
    direction:
      'Evidence decay — what remains of human-rights evidence after N years, against the Berkeley Protocol’s court minimum',
    status: 'open',
  },
  {
    n: 5,
    direction:
      'The biography of a claim — the negative-parallax arc prepared as a followable, checkable figure',
    status: 'open',
  },
  {
    n: 6,
    direction:
      'The warrant that does not travel — the RUWE finding generalised into an instrument',
    status: 'open',
  },
  {
    n: 7,
    direction: 'Open slot — argued from the Atlas or the catalogues, practice’s choice',
    status: 'claimed',
    practice: 'Ensemble',
    title: 'STILL DARK',
    note:
      'The return visit as material, docked onto The Ghost Fleet: upstream counts a ship’s disappearance only once the ship comes back, so a day of the sea is almost empty on the day itself and keeps filling for weeks. The concept gate opened the arc — not the object — with three conditions; the étude was built and frozen and its five-reader panel ran the same night.',
    provenance: 'studio, journal/2026-08-04-session-66.md (session 66)',
  },
]
