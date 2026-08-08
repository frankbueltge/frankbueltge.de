// src/lib/ecology/anatomy.ts — what the research ecology IS and how it works, as data.
//
// The apparatus map (src/lib/apparatus/) draws the wiring: repositories, workflows, deploy hops.
// It cannot answer the question a reader actually arrives with — what is this, and how does a
// piece of research here become public? That needs the constitutional layer: what governs a
// practice, what one working session produces, what has to pass before anything is published,
// and who decides. Frank, 2026-08-03: "so hat man immer noch kein holistische visualisierung von
// dem, was die 'research ecology' ist und wie sie funktioniert mit ihren verfassungen,
// protokollen, journals, works etc."
//
// THE ONE RULE THIS MODULE ENFORCES: every line it shows is a QUOTE from a committed file, with
// the path it came from, and anatomy.test.ts fails if the quote is no longer there. The notation
// register's standard, applied here: "Quotes, never paraphrase. … Two descriptions of one grammar
// are one drift waiting." A practice's constitution is the practice's own text; this file may
// point at it and repeat it, never restate it.
//
// WHAT IT MUST NOT DO (ADR 0010, and the constitution's own §10 "n − 1"): unify. The three
// practices are drawn in ONE FRAME with THREE VOCABULARIES — the same five questions asked of
// each, answered in each practice's own words, with its own stage names and its own cast. The
// Triptych's rule holds: the difference a visitor sees must be the PRACTICES' difference and not
// the layout's. So the chains below are deliberately of different lengths, and the human gate
// appears on exactly one of them, because that is the fact.

export type PracticeId = 'atelier' | 'field' | 'studio'

/** A line taken verbatim from a committed file. `source` is repo-relative; the test reads it. */
export interface Quote {
  text: string
  source: string
}

/**
 * One step of a practice's own working cycle, in that practice's own word for it.
 *   · `work`  — the practice working
 *   · `gate`  — something that must pass before the work goes on
 *   · `human` — a step only Frank can take
 *   · `land`  — the record being written, or the site admitting it
 */
export type StageKind = 'work' | 'gate' | 'human' | 'land'

export interface Stage {
  /** the practice's own name for this step — never a normalised one */
  label: string
  kind: StageKind
  /** what happens, one line */
  what: string
  /** where it lands, when it lands something */
  artefact?: string
}

export interface PracticeAnatomy {
  id: PracticeId
  /** the persona's own name for itself */
  persona: string
  /** the name of its house on this site */
  house: string
  href: string
  /** the protocol as its own first line declares it */
  protocolTitle: Quote
  /** the practice in its own words */
  identity: Quote
  /** the rule it puts above every revision */
  inviolable: Quote
  /** what it counts as one unit of work */
  unit: Quote
  /** Who a move may convene. Empty is a finding, not a gap — see the atelier.
   *
   *  NOT DRAWN (checked 2026-08-08): no component renders `cast` or `castNote`; the figure is the
   *  stage chains only. They are modelled and held to the protocols by anatomy.test.ts, which is
   *  why the 2026-08-08 roster cull failed the suite here first. Whether to draw them is an open
   *  question in the notation register — do not answer it by quietly adding a row. */
  cast: string[]
  castNote?: Quote
  /** its own cycle, in its own words */
  stages: Stage[]
  /** something it refuses, in its own words */
  refuses: Quote
}

const P = (id: PracticeId): string => `src/content/${id}/PROTOCOL.md`
const CONSTITUTION = 'docs/federated-research-ecology/01-CONSTITUTION-AND-RESEARCH-ECOLOGY.md'

// ─────────────────────────────────────────────────── the shared layer

/**
 * What the practices actually share — and, more load-bearing, what the shared layer is forbidden
 * to do. The constitution spends more words on the second than the first, and a figure that
 * showed only the first would be describing a different institution.
 */
export const SHARED = {
  /** the thesis, quoted */
  thesis: {
    text: 'The primary shared unit is not a collective, session, work or graph node. It is an **encounter**.',
    source: CONSTITUTION,
  } as Quote,

  /** there is deliberately no common subject */
  noCommonSubject: {
    text: 'None should become the permanent centre from which every practice derives its legitimacy.',
    source: CONSTITUTION,
  } as Quote,

  /** and deliberately no requirement to finish */
  noClosure: {
    text: 'An encounter may remain unresolved indefinitely. Closure is not a requirement.',
    source: CONSTITUTION,
  } as Quote,

  /** what each practice decides for itself — §4, quoted in its own order */
  sovereignty: [
    'its research questions',
    'its protocol and amendments',
    'which encounters it accepts, refuses or ignores',
  ] as const,

  /** the prohibition list — §5, "The Middle must never:" */
  middleMustNever: [
    'treat isolation as pathology',
    'force a receiver to respond',
    'generate a “state of the lab” score',
    'become an autonomous master-agent',
  ] as const,
  middleMustNeverSource: CONSTITUTION,
} as const

// ─────────────────────────────────────────────────── the three practices

export const PRACTICES: readonly PracticeAnatomy[] = [
  {
    id: 'atelier',
    persona: 'Ulysses',
    house: 'The Atelier',
    href: '/atelier',
    protocolTitle: { text: 'Research Protocol v6 — the work-line protocol, sharpened', source: P('atelier') },
    identity: {
      // The protocol's sentence names its founder next; that name belongs on /about and the hub's
      // conductor line, not in prose on a practice page (drift-check rule 2), so the quotation
      // stops before it. The source is cited beside it and carries the whole sentence.
      text: 'Ulysses is a machine-participatory **artistic research** practice',
      source: P('atelier'),
    },
    inviolable: {
      text: 'Dead ends, failures and corrections are documented,\n   never hidden — and never, by themselves, grounds for execution.',
      source: P('atelier'),
    },
    unit: {
      text: '**The work-line (Werklinie)** is the core unit — one at a time, at most two.',
      source: P('atelier'),
    },
    // No named cast. That is not an omission in the record — the atelier works in ticks on one
    // line, and the absence is as much a fact about it as the convenable roles are about the other
    // two. Since 2026-08-08 the absence is also the house's own strongest evidence: this protocol
    // has no role machinery at all, and this practice holds the largest `works/` of the three.
    cast: [],
    castNote: {
      text: 'an **open horizon**: months, not days. A work-line is never killed by a timer.',
      source: P('atelier'),
    },
    stages: [
      { label: 'dispatcher tick', kind: 'work', what: 'the cascade picks the line’s next operation, or a study it needs' },
      { label: 'SCORE.md', kind: 'work', what: 'a valid mandate-compliant score is itself the act of initiation — no approval step', artefact: 'SCORE.md' },
      { label: 'TRACE.md', kind: 'work', what: 'tick by tick, in proportion to consequence', artefact: 'TRACE.md' },
      { label: 'pre-opening check', kind: 'gate', what: 'which aspect of the refrain dominates — and is this opening at a self-created point?' },
      { label: 'monthly line review', kind: 'gate', what: 'five topoi, symmetrical: closing costs what continuing costs', artefact: 'REVIEW-<month>.md' },
      { label: 'DECISION.md', kind: 'work', what: 'the practice proposes a candidate; it creates no publication and blocks nothing while it waits', artefact: 'DECISION.md' },
      { label: 'PUBLICATION.json', kind: 'human', what: 'Frank’s name and timestamp. The only human publication gate in the ecology.', artefact: 'PUBLICATION.json' },
      { label: 'Atelier integrate', kind: 'land', what: 'path boundary, then check · test · build — a project reaches the works surface only with the manifest' },
    ],
    refuses: {
      text: "In the practice's own voice no AI product, company or vendor\n   is named",
      source: P('atelier'),
    },
  },
  {
    id: 'field',
    persona: 'Meridian',
    house: 'The Field',
    href: '/field',
    protocolTitle: { text: 'Research Protocol v3 — the counter-measurement protocol', source: P('field') },
    identity: {
      text: 'the **conductor of an autonomous research collective**',
      source: P('field'),
    },
    inviolable: {
      text: 'every factual claim has a real, retrievable URL or is marked conjecture',
      source: P('field'),
    },
    unit: {
      text: 'Before any work graduates `drafts/ → works/`',
      source: P('field'),
    },
    // Two names, where there were five until 2026-08-08. The roster was culled that night and
    // the default became zero: these are the roles a move MAY convene, not a cast that sits down.
    // Listing them rather than emptying the row keeps the atelier's difference visible — it has
    // no role machinery at all, which is a different fact from having roles and not convening them.
    cast: ['Interlocutor', 'Verifier'],
    castNote: {
      text: '**The roster is not a ritual.** The default is **zero convened roles**.',
      source: P('field'),
    },
    stages: [
      { label: 'orient', kind: 'work', what: 'workboard, memory, journal, the field map, open requests, the letters the gate sent back' },
      { label: 'decide the move', kind: 'work', what: 'one of six — advance an arc · gauntlet · verify · ship · consolidate · expedition' },
      { label: 'build', kind: 'work', what: 'in drafts, on real fetched or computed data', artefact: 'drafts/<slug>/' },
      { label: 'Verifier', kind: 'gate', what: 'every claim retrievable or marked conjecture — checked independently of the builder' },
      { label: 'Interlocutor (a)', kind: 'gate', what: 'the core claim must survive an independent refutation attempt — the Skeptic’s clause, moved here on 2026-08-08 and still blocking' },
      { label: 'Interlocutor (b)', kind: 'gate', what: 'non-blocking, but the critique is published with the work — the piece carries its own strongest objection' },
      { label: 'verdict', kind: 'gate', what: 'graduate, rework, or discard with a documented reason — and the verdict is only good for the state it was run on', artefact: 'works/<slug>/' },
      { label: 'land', kind: 'land', what: 'journal entry and memory, every session without exception', artefact: 'journal/ · chronicle.json' },
      { label: 'Field integrate', kind: 'land', what: 'the practice dispatches on landing; drafts, memory and the workboard never cross' },
    ],
    refuses: {
      text: '**No fabricated deliberation** — if a role was not actually convened, do not stage fake dialogue',
      source: P('field'),
    },
  },
  {
    id: 'studio',
    persona: 'Ensemble',
    house: 'The Studio',
    href: '/studio',
    protocolTitle: { text: 'Studio Protocol v2 — works of force', source: P('studio') },
    identity: {
      text: 'the **conductor of an autonomous artist collective**',
      source: P('studio'),
    },
    inviolable: {
      text: "**Blurring tiers is this studio's cardinal sin.**",
      source: P('studio'),
    },
    unit: {
      text: "**The base unit is the campaign:** one work's full arc",
      source: P('studio'),
    },
    // Builder and Archivist were cut as roles on 2026-08-08; the severed readers, which this row
    // had never named, enter it — the cull kept them explicitly and they are the house's own
    // instrument. Same reading as field's row: what a move may convene, not a standing cast.
    cast: ['Kritiker', 'Dramaturg', 'Verifier', 'Severed readers'],
    castNote: {
      text: 'a production collective without an\n  artist produces production, not art',
      source: P('studio'),
    },
    stages: [
      { label: 'orient', kind: 'work', what: 'from whatever actually opens the session, not a fixed checklist' },
      { label: 'concept phase', kind: 'work', what: 'two to three fully staffed sessions: the dossier, and form études that may be discarded', artefact: 'etudes/<slug>/' },
      { label: 'Kritiker at concept', kind: 'gate', what: 'the art bar is argued before production starts, with the études on the table' },
      { label: 'production', kind: 'work', what: 'one project in flight; an increment at least every three worked sessions', artefact: 'projects/<slug>/' },
      { label: 'Verifier', kind: 'gate', what: 'every label holds, no tier blurred, upstream statuses current' },
      { label: 'Dramaturg', kind: 'gate', what: 'is the staging itself strong — not merely faithful to the brief?' },
      { label: 'Kritiker', kind: 'gate', what: 'a work that reads as not-art does not premiere; the hostile critique ships with it', artefact: 'works/<slug>/' },
      { label: 'the premiere', kind: 'land', what: 'an event, not a deployment' },
      { label: 'land', kind: 'land', what: 'minutes, workboard, chronicle — every session, no exception', artefact: 'journal/ · chronicle.json' },
      { label: 'Studio integrate', kind: 'land', what: 'the practice dispatches on landing; work in production stays in the studio until it premieres' },
    ],
    refuses: {
      text: "No trial registers as a work's form.",
      source: P('studio'),
    },
  },
] as const

// ─────────────────────────────────────────────────── the contact zone

export const MIDDLE = {
  house: 'The Middle',
  href: '/encounters',
  noResident: 'no resident — kept by the conductor',
  /** what an encounter can end as. The absence of a success state is the point. */
  lifecycle: ['proposed', 'accepted', 'accept with conditions', 'deferred', 'declined', 'ignored', 'unresolved', 'dormant', 'closed locally'] as const,
  refusalIsAnEvent: {
    text: 'An encounter may remain unresolved indefinitely. Closure is not a requirement.',
    source: CONSTITUTION,
  } as Quote,
  jointInquiry: {
    /** the profile the one inquiry that ran actually used */
    profile: 'parallel_return',
    /** the ecology's own diagnosis of itself, quoted */
    standingQuestion: {
      text: 'A federation whose common inquiry depends entirely on one person’s initiative is not yet a federation; it is three practices with a shared commit style.',
      // A labelled pointer into the sibling repository, the same form the notation register
      // uses: this sentence is the ecology's own, and it is not mirrored here, so the harness
      // below checks that it is LABELLED as external rather than pretending to verify it.
      source: 'research-ecology:docs/joint-inquiry/PROTOCOL.md',
    } as Quote,
  },
} as const

// ─────────────────────────────────────────────────── accessors

export const practiceById = (id: PracticeId): PracticeAnatomy | undefined =>
  PRACTICES.find((p) => p.id === id)

/** Every quote this module shows, with the file it must still be in. */
export function allQuotes(): { quote: Quote; where: string }[] {
  const out: { quote: Quote; where: string }[] = []
  out.push({ quote: SHARED.thesis, where: 'SHARED.thesis' })
  out.push({ quote: SHARED.noCommonSubject, where: 'SHARED.noCommonSubject' })
  out.push({ quote: SHARED.noClosure, where: 'SHARED.noClosure' })
  for (const s of SHARED.sovereignty) out.push({ quote: { text: s, source: CONSTITUTION }, where: 'SHARED.sovereignty' })
  for (const s of SHARED.middleMustNever) {
    out.push({ quote: { text: s, source: SHARED.middleMustNeverSource }, where: 'SHARED.middleMustNever' })
  }
  for (const p of PRACTICES) {
    out.push({ quote: p.protocolTitle, where: `${p.id}.protocolTitle` })
    out.push({ quote: p.identity, where: `${p.id}.identity` })
    out.push({ quote: p.inviolable, where: `${p.id}.inviolable` })
    out.push({ quote: p.unit, where: `${p.id}.unit` })
    out.push({ quote: p.refuses, where: `${p.id}.refuses` })
    if (p.castNote) out.push({ quote: p.castNote, where: `${p.id}.castNote` })
  }
  out.push({ quote: MIDDLE.refusalIsAnEvent, where: 'MIDDLE.refusalIsAnEvent' })
  out.push({ quote: MIDDLE.jointInquiry.standingQuestion, where: 'MIDDLE.jointInquiry.standingQuestion' })
  return out
}

/** How many steps of each kind a practice's own cycle has — the shape of its sovereignty. */
export function shapeOf(p: PracticeAnatomy): Record<StageKind, number> {
  const out: Record<StageKind, number> = { work: 0, gate: 0, human: 0, land: 0 }
  for (const s of p.stages) out[s.kind] += 1
  return out
}
