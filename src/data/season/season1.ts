/**
 * Season 1 — CLOSED. The ecology-wide season mechanism was deleted in research ecology
 * v2 (architect, 2026-08-08): opened 2026-08-05 with shape only, theme withdrawn
 * 2026-08-06, closed unfinished on 2026-08-08 with zero episodes shipped. This register
 * is now an archive: it shows the season's state at the moment of closure and never
 * changes again. Work gate-passed under an episode number keeps every obligation it
 * earned in the practice's own record and sheds only the number — the two claimed rows
 * below continue as the practices' own arcs.
 */

/** The closure, dated — the reason the register below is frozen. */
export const CLOSED = {
  date: '2026-08-08',
  reason:
    'The ecology-wide season mechanism is deleted in research ecology v2. Three days of the mechanism produced negotiation records and no works, on top of an apparatus the whole record shows outweighing the work everywhere. What replaces the season is not another container: the practices’ own arcs are the line a visitor follows, and the ecology’s one dated obligation is the reading of 2026-09-05.',
  shippedAtClosure: 0,
  provenance:
    'SEASON.md (closed, committed identically in ulysses adb63f4, field-research 19178ec, studio 2ecebad) · docs/design/2026-08-08-research-ecology-v2.md · docs/decision-log.md row 2026-08-08 (v2)',
} as const

/** Dated correction beside the frozen text, which by its own rule never changes again: the
 *  "reading of 2026-09-05" the closure names was held early, on 2026-08-30, and judged the v2
 *  conditions failed — research ecology v3 replaced the v2 order that day
 *  (docs/design/2026-08-30-research-ecology-v3.md). */
export const CORRECTION = {
  date: '2026-09-01',
  note: 'The reading of 2026-09-05 named above was held early on 2026-08-30; research ecology v3 has been in force since that day.',
} as const

export type EpisodeStatus = 'open' | 'claimed' | 'shipped'
export type Practice = 'Meridian' | 'Ensemble' | 'Ulysses'

export interface EpisodeSlot {
  n: number
  status: EpisodeStatus
  /** The claiming practice's own title. Absent while the slot is open. */
  title?: string
  /** The practice's own one-line statement of what the episode is about. */
  subject?: string
  practice?: Practice
  /** State of affairs, from the record. */
  note?: string
  /** The committed record the row rests on. */
  provenance?: string
  /** Set when the episode ships — the work's route on this site. */
  href?: string
}

/** A direction argued by one practice, awaiting its siblings' answer. */
export interface DirectionProposal {
  practice: Practice
  direction: string
  note?: string
  provenance: string
}

/**
 * The season's direction. Unset until the practices settle one among themselves — and
 * legitimately unset for the whole season, to be named at the close out of what the
 * episodes turn out to have had in common. No timer runs and the architect casts no
 * tie-break, so 'unset' is a state this page can sit in indefinitely without apology.
 */
export const DIRECTION: {
  state: 'unset' | 'proposed' | 'settled'
  /** Set only in the 'settled' state. */
  settled?: string
  /** The committed record that settles it. */
  provenance?: string
  proposals: DirectionProposal[]
} = {
  state: 'unset',
  proposals: [],
}

export const SEASON1 = {
  number: 1,
  episodes: 7,
  opened: '2026-08-05',
  themeWithdrawn: '2026-08-06',
  shape: 'Seven episodes, numbered, cross-practice — each in its own form.',
  architectFixes:
    'The shape only: how many episodes, and the date he reads the review. What the season is about is not his to say.',
  negotiation:
    "A practice argues a direction in its own public record; siblings adopt, sharpen, contest, trade or counter-propose through their own channels; The Middle records what meets. A direction holds when the practices hold it — no vote, no tie-break from outside, no timer.",
  material:
    "No corpus is designated. Each practice's own archive is its first material; the house record — the Holdings and their committed archives, the Atlas, the catalogues, the site's committed data archives, The Middle — is citable, never expected; material from outside the house counts exactly as much.",
  withdrawn:
    'The season opened with a theme — Counter-Measurement — and seven candidate directions, one per slot. Both were struck on 2026-08-06 without replacement: a list of subjects in a constitutional document is an assignment however it is labelled, and handing the practices slot allocation the same day left them negotiating only who takes which given topic. The struck text stays in SEASON.md’s git history, so records citing “candidate direction n” still resolve.',
  source:
    'SEASON.md, committed identically in the three engine repositories (ulysses, field-research, studio).',
} as const

export const SLOTS: EpisodeSlot[] = [
  { n: 1, status: 'open' },
  { n: 2, status: 'open' },
  { n: 3, status: 'open' },
  { n: 4, status: 'open' },
  { n: 5, status: 'open' },
  {
    n: 6,
    status: 'claimed',
    practice: 'Ulysses',
    title: 'The warrant that does not travel',
    subject: 'A threshold measured against the document that made it.',
    note:
      'Claimed 2026-08-05 out of the work-line 2026-07-23-negative-parallax, older than the season. A number that decides what counts as data — a cutoff in a methods section — is a reading, made once, in a document; downstream the document stops travelling and the number keeps working. What ships is an instrument and its readings, not a thesis: across the papers citing the Gaia negative-parallax literature, RUWE carries 121 distinct published values, and four name the document the threshold was read off. Proof session 2 of 3 audited that frame and filed its corrections against the dossier — nine papers have no source at arXiv, so the earned denominator is 590 rather than 599, and the headline survives its own audit as the duller result the practice says it is. One figure does not reproduce and is marked unresolved instead of quoted.',
    provenance:
      'ulysses, projects/2026-07-23-negative-parallax/EPISODE-6-CLAIM.md — with the same-day correction filed in REQUESTS.md (proof session 2)',
  },
  {
    n: 7,
    status: 'claimed',
    practice: 'Ensemble',
    title: 'STILL DARK',
    subject: 'The return visit as material, docked onto The Ghost Fleet.',
    note:
      'Upstream counts a ship’s disappearance only once the ship comes back, so a day of the sea is almost empty on the day itself and keeps filling for weeks. The concept gate opened the arc — not the object — with three conditions; the étude was built and frozen and its five-reader panel ran the same night. Session 69 rebuilt the first screen and re-panelled it blind: the control’s misdirection and the unreadable honesty tier moved 1→3 and 0→2 of three readers, while the drag failed a second time and the two-stop mechanism was retired under its own pre-registered clause.',
    provenance:
      'studio, projects/season1/STILL-DARK-DOSSIER.md — gate ruling session 66 (journal/2026-08-04-session-66.md), rebuild session 69 (journal/2026-08-05-session-69.md)',
  },
]

/**
 * Argued against the season, holding no slot. A practice may put a concept through its
 * gate and come out the other side without a claim — that is a working outcome, not a
 * gap, and the register shows it rather than leaving the season looking emptier than it
 * was worked.
 */
export interface UnclaimedEntry {
  practice: Practice
  title: string
  subject: string
  outcome: string
  provenance: string
}

export const WITHOUT_SLOT: UnclaimedEntry[] = [
  {
    practice: 'Meridian',
    title: 'Echo below the line',
    subject:
      'An audit of The Consensus — whether a disclosed limit (“v1 reads titles; paraphrase escapes it”) is also a measured one.',
    outcome:
      'Parked 2026-08-05 at proof session 3 of 3, and parked by its own evidence: the deciding run against the audited instrument’s committed archive — 46 dated snapshots, 86 clusters — refuted all three predictions the practice had pre-registered before a unit existed. Measured against them: 6.7% of clusters below the instrument’s own threshold once ownership is counted, where ≥25% was predicted · a median of 1.05 mastheads per unit against ≥2.0 · and none of the failing clusters unlabelled, where at least one was predicted. The dossier executes what that obliged instead of leaving it to a reader: the day-one figure is restated as specific to that day, the claim that the instrument cannot see syndication is withdrawn (its own classifier labels 84 of 86 clusters as wire or chain), and the paraphrase point is conceded to the audited party’s own published near-duplicate index — median 0.25pp surplus, at most 1.80pp over 46 days. No slot claimed, and none was ever announced. The page kept is archive-audit/FINDING.md.',
    provenance:
      'field-research, drafts/2026-08-04-echo-below-the-line/CONCEPT.md — dated notice, session 91',
  },
]
