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

/** The five kinds of thing this house records about itself. */
export type NodeKind = 'work' | 'practice' | 'decision' | 'neighbor' | 'receiver'

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

/** A research practice as the records name it (post ledger + the werke register). */
export interface PracticeNode extends NodeBase {
  kind: 'practice'
  practiceId: string
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

export type GraphNode = WorkNode | PracticeNode | DecisionNode | NeighborNode | ReceiverNode

export type EdgeKind =
  /** work → neighbor: prior art the audit found for this work */
  | 'neighbor-of'
  /** decision → work: a decision whose text or evidence names this work's files or route */
  | 'touches'
  /** practice → receiver: a packet lying addressed in the post office */
  | 'addresses'
  /** practice → work: the practice's own door on this site */
  | 'door'

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
