// src/lib/graph/types.ts — the shape of the house's own knowledge graph.
//
// An INSTRUMENT, not an experiment (docs/design/2026-08-09-usp-rework-program.md, "Parked"):
// it answers "what touches X?" for a session at its start, and it is the substrate the
// neighbourhood figure at /holdings/neighbors is drawn from.
//
// The one law of this graph: EVERY node and EVERY edge is derived from a committed file and
// carries the verbatim string it was derived from. Nothing here is typed by hand — a fact
// without a quote in a source file cannot enter, and graph.test.ts holds every quote against
// its file, so the graph goes red rather than stale when a source moves underneath it.

/** The kinds of thing this house records about itself.
 *
 *  `work` is an experiment of the lab (the /holdings shelf and the practice doors);
 *  `practice-work` is a work one of the practices MADE — the ecology's own production, which
 *  the graph was blind to until 2026-08-09 although 59 of them sit committed in this repo. */
export type NodeKind =
  | 'work'
  | 'practice-work'
  | 'practice'
  | 'encounter'
  | 'decision'
  | 'neighbor'
  | 'receiver'

/** Where a fact came from, and the words it was read out of. `quote` must occur verbatim
 *  (whitespace-normalised) in `file` — that assertion is the graph's honesty harness. */
export interface Provenance {
  /** repo-relative path of the committed file this was derived from */
  file: string
  /** the verbatim string in that file which carries the fact */
  quote: string
}

interface NodeBase {
  /** `<kind>:<slug>` — stable across rebuilds, so edges survive a re-derivation */
  id: string
  kind: NodeKind
  /** what a human calls it — always a string that occurs in the source */
  label: string
  source: Provenance
}

/** An experiment or practice door of this site (src/data/werke.ts). */
export interface WorkNode extends NodeBase {
  kind: 'work'
  /** the werk id — the token the rest of the repo names it by */
  werkId: string
  href: string
  since: string
  /** rank on /holdings; absent for the works the register excludes (practice doors, MRR) */
  rank?: number
  tier?: string
  /** the audit's draft verdict class, present only for audited works */
  verdict?: 'UNIQUE' | 'ADDED VALUE' | 'REDUNDANT'
  /** the audit's verdict sentence, verbatim */
  verdictLabel?: string
  /** the audit's (d) paragraph — where the daylight is named, verbatim */
  daylight?: string
  /** the house line this work says it belongs to, quoted from its own description */
  line?: string
  /** provenance for verdict/daylight, which come from the audit rather than werke.ts */
  auditSource?: Provenance
}

/** A research practice as the records name it (post ledger + the werke register).
 *
 *  The id is the NORMALISED voice — the records spell one practice four ways (`field`,
 *  `field-research`, `meridian`, and its door's own title), and this house already keeps the
 *  one place where those spellings are reconciled: `normaliseVoice` in
 *  src/lib/begegnungen/crossings.ts. The graph reuses it rather than opening a second register
 *  of aliases that could disagree with the first. */
export interface PracticeNode extends NodeBase {
  kind: 'practice'
  practiceId: string
  /** every spelling of this practice the sources actually used, so a reader can follow back */
  spellings: string[]
  /** dated scalars a practice puts on record about itself (attention export contract §figures) */
  figures?: Array<{ key: string; value: number; asOf: string }>
}

/** A work one of the practices made — read from the work's own committed `meta.json`. */
export interface PracticeWorkNode extends NodeBase {
  kind: 'practice-work'
  slug: string
  /** normalised voice of the practice that made it */
  practiceId: string
  date: string
  /** the work's own statement of what it enacts, verbatim from its meta */
  embodies?: string
  medium?: string
  href: string
  /** present only where the ecology audit has actually examined this work. Absent means
   *  UNEXAMINED, never CLEARED — 55 of 59 carry nothing on 2026-08-09 and the audit says so. */
  verdict?: 'UNIQUE' | 'ADDED VALUE' | 'REDUNDANT'
  verdictLabel?: string
  daylight?: string
  auditSource?: Provenance
}

/** A crossing between practices, from the encounter register the ecology exports. */
export interface EncounterNode extends NodeBase {
  kind: 'encounter'
  encounterId: string
  recordUrl?: string
}

/** A row of docs/decision-log.md — one dated approval that changed what this repo publishes. */
export interface DecisionNode extends NodeBase {
  kind: 'decision'
  date: string
}

/** A project outside this house that the USP audit named as prior art. */
export interface NeighborNode extends NodeBase {
  kind: 'neighbor'
  url?: string
}

/** A named addressee of the post office — the world, as this house has actually addressed it. */
export interface ReceiverNode extends NodeBase {
  kind: 'receiver'
}

export type GraphNode =
  | WorkNode
  | PracticeWorkNode
  | PracticeNode
  | EncounterNode
  | DecisionNode
  | NeighborNode
  | ReceiverNode

export type EdgeKind =
  /** work → neighbor: prior art the audit found for this work */
  | 'neighbor-of'
  /** decision → work: a decision whose text or evidence names this work's files or route */
  | 'touches'
  /** practice → receiver: a packet lying addressed in the post office */
  | 'addresses'
  /** practice → work: the practice's own door on this site */
  | 'door'
  /** practice-work → practice: who made it, from the work's own location in the repo */
  | 'made-by'
  /** encounter → practice: a voice at a crossing, with its role as the edge's state */
  | 'participates'
  /** encounter → practice-work: the work the crossing actually moved */
  | 'concerns'

export interface GraphEdge {
  kind: EdgeKind
  from: string
  to: string
  /** the audit's one-line characterisation, the packet's title, … — verbatim where present */
  note?: string
  /** 'prepared' | 'withheld' | … for addresses edges; the audit verdict class for neighbor-of */
  state?: string
  source: Provenance
}

export interface GraphSource {
  file: string
  sha256: string
  /** set for a GROUP of files (the practices' work metas): how many were read into the digest.
   *  One digest over a sorted path+content concat keeps meta.sources readable at 59 files and
   *  still turns red when any one of them moves. */
  files?: number
}

export interface KnowledgeGraph {
  meta: {
    /** what this file is, for anyone who opens it without the design doc */
    instrument: string
    /** the committed files the whole graph was read out of, with digests: a session can tell
     *  whether the graph is current without running the build */
    sources: GraphSource[]
    counts: { nodes: number; edges: number; nodesByKind: Record<string, number>; edgesByKind: Record<string, number> }
  }
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/** Slugify a label into an id fragment — lowercase, ascii-ish, dash-separated. */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâã]/g, 'a')
    .replace(/[öòóô]/g, 'o')
    .replace(/[üùúû]/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
