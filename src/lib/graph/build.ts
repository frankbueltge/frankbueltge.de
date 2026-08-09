// src/lib/graph/build.ts — the derivation itself: committed files in, one graph out.
//
// Run by `npm run graph:build` (writes src/data/graph/graph.json) and by graph.test.ts, which
// rebuilds in memory and compares against the committed file. That comparison is what keeps
// the artifact honest: the graph can never be edited by hand, and it can never quietly fall
// behind the sources it claims to summarise.
//
// This module touches the filesystem and node:crypto, so it belongs to the build side only —
// pages read the committed JSON, never this.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { WERKE, HOLDINGS_RANKED, werkTitle, type Werk } from '../../data/werke'
import { parseAudit, parseDecisionLog, repoPathsIn, tokens, type LedgerEntry } from './derive'
import type {
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
  NeighborNode,
  Provenance,
  WorkNode,
} from './types'
import { slug } from './types'

/** The committed files this graph is read out of. Adding a source here is the only way to add
 *  a kind of fact — there is no path into the graph that does not pass through a file. */
export const SOURCE_FILES = [
  'src/data/werke.ts',
  'docs/audits/2026-08-09-usp-audit.md',
  'docs/decision-log.md',
  'src/data/post/ledger.json',
] as const

const WERKE_FILE = SOURCE_FILES[0]
const AUDIT_FILE = SOURCE_FILES[1]
const DECISIONS_FILE = SOURCE_FILES[2]
const LEDGER_FILE = SOURCE_FILES[3]

export interface RawSources {
  /** file path → file contents, for every entry of SOURCE_FILES */
  texts: Record<string, string>
}

/** Needles that identify a work inside a repo path. Derived from the register alone: the werk
 *  id, plus the last segment of its route and of its method sheet — split the way file names
 *  are split. Needles under four characters are dropped, because a two-letter token ("on")
 *  matches half the repo and an edge nobody can defend is worse than a missing one. */
function needlesFor(werk: Werk): Set<string> {
  const last = (href?: string | null): string => (href ? href.split('/').filter(Boolean).pop() ?? '' : '')
  const raw = [werk.id, last(werk.href), last(werk.methodHref)].filter(Boolean).join(' ')
  return new Set([...tokens(raw)].filter((t) => t.length >= 4))
}

const provenance = (file: string, quote: string): Provenance => ({ file, quote })

export function buildGraph(sources: RawSources): KnowledgeGraph {
  // werke.ts is imported as a module rather than read as text here; its text is still hashed
  // into meta.sources, so a change to the register shows up as a stale digest.
  const auditText = sources.texts[AUDIT_FILE]
  const decisionText = sources.texts[DECISIONS_FILE]
  const ledgerText = sources.texts[LEDGER_FILE]

  const nodes = new Map<string, GraphNode>()
  const edges: GraphEdge[] = []
  const add = (node: GraphNode): void => {
    if (!nodes.has(node.id)) nodes.set(node.id, node)
  }

  // ── works ───────────────────────────────────────────────────────────────────────────────
  // The register is imported as a module rather than parsed, so a renamed field breaks the
  // build instead of silently emptying the graph. The quote is the id line, which is what a
  // reader greps for anyway.
  const audit = parseAudit(auditText)
  const auditByRoute = new Map(audit.map((a) => [a.route, a]))

  for (const werk of WERKE) {
    const entry = auditByRoute.get(werk.href)
    const rank = HOLDINGS_RANKED.indexOf(werk.id)
    const node: WorkNode = {
      id: `work:${werk.id}`,
      kind: 'work',
      label: werkTitle(werk, 'en'),
      werkId: werk.id,
      href: werk.href,
      since: werk.since,
      source: provenance(WERKE_FILE, `id: '${werk.id}'`),
      ...(rank >= 0 ? { rank: rank + 1 } : {}),
      ...(werk.tier ? { tier: werk.tier } : {}),
    }

    // The line a work says it belongs to, in its own words. Curly quotes are blanked (same
    // length, so the index still points into the original) before matching, then the sentence
    // is cut out of the ORIGINAL description — the graph must quote the file, not a copy of it
    // that has been tidied up.
    const description = werk.description.en
    const flat = description.replace(/[“”„"]/g, ' ')
    // `\s+` because blanking the curly quotes of “Counter-Measurement” leaves two spaces here.
    const hit = /counter-measurement\s+line/i.exec(flat)
    if (hit) {
      const start = flat.lastIndexOf('.', hit.index) + 1
      const end = flat.indexOf('.', hit.index + hit[0].length)
      node.line = description.slice(start, end === -1 ? undefined : end + 1).trim()
    }

    if (entry) {
      node.verdict = entry.verdictClass
      node.verdictLabel = entry.verdictLabel
      node.daylight = entry.direction
      node.auditSource = provenance(AUDIT_FILE, entry.verdictLabel)
    }
    add(node)
  }

  // ── neighbours (the audit's prior art) ──────────────────────────────────────────────────
  const worksByRoute = new Map(WERKE.map((w) => [w.href, w]))
  for (const entry of audit) {
    const werk = worksByRoute.get(entry.route)
    if (!werk) continue // a route the register no longer carries — caught loudly by the test
    for (const neighbor of entry.neighbors) {
      // One node per project, even when several works cite it: a shared neighbour is a finding
      // (two experiments standing in the same shadow), not a duplicate.
      const key = neighbor.url ? neighbor.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '') : neighbor.label
      const id = `neighbor:${slug(key)}`
      const node: NeighborNode = {
        id,
        kind: 'neighbor',
        label: neighbor.label,
        source: provenance(AUDIT_FILE, neighbor.raw),
        ...(neighbor.url ? { url: neighbor.url } : {}),
      }
      add(node)
      edges.push({
        kind: 'neighbor-of',
        from: `work:${werk.id}`,
        to: id,
        note: neighbor.note,
        state: entry.verdictClass,
        source: provenance(AUDIT_FILE, neighbor.raw),
      })
    }
  }

  // ── decisions ───────────────────────────────────────────────────────────────────────────
  // A decision reaches a work through the FILES it names, never through prose: the evidence
  // column is where this log is precise, and "correction" in a sentence is an English word.
  const seenPerDate = new Map<string, number>()
  const needles = new Map(WERKE.map((w) => [w.id, needlesFor(w)]))
  for (const row of parseDecisionLog(decisionText)) {
    const n = (seenPerDate.get(row.date) ?? 0) + 1
    seenPerDate.set(row.date, n)
    const id = `decision:${row.date}-${n}`
    add({
      id,
      kind: 'decision',
      label: row.title,
      date: row.date,
      source: provenance(DECISIONS_FILE, row.title),
    })

    const paths = repoPathsIn(row.body)
    for (const werk of WERKE) {
      const werkNeedles = needles.get(werk.id) as Set<string>
      const path = paths.find((p) => [...tokens(p)].some((t) => werkNeedles.has(t)))
      const route = new RegExp(`${werk.href}(?![\\w-])`).test(row.body) ? werk.href : undefined
      const locator = path ?? route
      if (!locator) continue
      edges.push({
        kind: 'touches',
        from: id,
        to: `work:${werk.id}`,
        source: provenance(DECISIONS_FILE, locator),
      })
    }
  }

  // ── practices and receivers (the post office) ───────────────────────────────────────────
  const ledger = JSON.parse(ledgerText) as LedgerEntry[]
  for (const packet of ledger) {
    if (!packet.practice || !packet.receiver) continue
    const practiceId = `practice:${packet.practice}`
    add({
      id: practiceId,
      kind: 'practice',
      label: packet.practice,
      practiceId: packet.practice,
      source: provenance(LEDGER_FILE, `"practice": "${packet.practice}"`),
    })
    const receiverId = `receiver:${slug(packet.receiver)}`
    add({
      id: receiverId,
      kind: 'receiver',
      label: packet.receiver,
      source: provenance(LEDGER_FILE, `"receiver": "${packet.receiver}"`),
    })
    edges.push({
      kind: 'addresses',
      from: practiceId,
      to: receiverId,
      note: packet.piece,
      state: packet.status,
      source: provenance(LEDGER_FILE, `"receiver": "${packet.receiver}"`),
    })
    // A practice that also keeps a door on this site is the same body in two records; the id
    // match is the whole evidence, and werke.ts is where it is checkable.
    const door = WERKE.find((w) => w.id === packet.practice)
    if (door) {
      edges.push({
        kind: 'door',
        from: practiceId,
        to: `work:${door.id}`,
        source: provenance(WERKE_FILE, `id: '${door.id}'`),
      })
    }
  }

  // ── shape it deterministically ──────────────────────────────────────────────────────────
  const nodeList = [...nodes.values()].sort((a, b) => (a.kind === b.kind ? cmp(a.id, b.id) : cmp(a.kind, b.kind)))
  const edgeList = dedupeEdges(edges).sort(
    (a, b) => cmp(a.kind, b.kind) || cmp(a.from, b.from) || cmp(a.to, b.to),
  )

  const nodesByKind: Record<string, number> = {}
  for (const node of nodeList) nodesByKind[node.kind] = (nodesByKind[node.kind] ?? 0) + 1
  const edgesByKind: Record<string, number> = {}
  for (const edge of edgeList) edgesByKind[edge.kind] = (edgesByKind[edge.kind] ?? 0) + 1

  return {
    meta: {
      instrument:
        'The house’s own records as a graph — derived from the files listed below, never typed. ' +
        'Rebuild with `npm run graph:build`; src/lib/graph/graph.test.ts fails if this file and ' +
        'those files disagree, or if any quote here is no longer in the file it names.',
      sources: SOURCE_FILES.map((file) => ({ file, sha256: digest(sources.texts[file]) })),
      counts: { nodes: nodeList.length, edges: edgeList.length, nodesByKind, edgesByKind },
    },
    nodes: nodeList,
    edges: edgeList,
  }
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** One relation per (kind, from, to): the decision log names a work's files more than once per
 *  row, and three identical edges would overstate how connected this house is. */
function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Map<string, GraphEdge>()
  for (const edge of edges) {
    const key = `${edge.kind}|${edge.from}|${edge.to}`
    if (!seen.has(key)) seen.set(key, edge)
  }
  return [...seen.values()]
}

export function digest(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16)
}

/** Read every source out of a repo checkout and derive the graph. */
export function buildGraphFromRepo(root: string): KnowledgeGraph {
  const texts: Record<string, string> = {}
  for (const file of SOURCE_FILES) texts[file] = readFileSync(`${root}${file}`, 'utf8')
  return buildGraph({ texts })
}
