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
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { WERKE, HOLDINGS_RANKED, werkTitle, type Werk } from '../../data/werke'
import { normaliseVoice, VOICES } from '../begegnungen/crossings'
import { parseAudit, parseDecisionLog, repoPathsIn, tokens, type LedgerEntry } from './derive'
import type {
  EncounterNode,
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
  NeighborNode,
  PracticeNode,
  PracticeWorkNode,
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
  'src/data/begegnungen/register.json',
  'docs/audits/2026-08-09-ecology-usp-audit.md',
] as const

const WERKE_FILE = SOURCE_FILES[0]
const AUDIT_FILE = SOURCE_FILES[1]
const DECISIONS_FILE = SOURCE_FILES[2]
const LEDGER_FILE = SOURCE_FILES[3]
const ENCOUNTERS_FILE = SOURCE_FILES[4]
const ECOLOGY_AUDIT_FILE = SOURCE_FILES[5]

/** The practices' own production: every work carries a committed `meta.json` beside it, and
 *  these four directories are where the register at /works reads them from
 *  (src/lib/engines/register.ts). Listed rather than globbed at random so that a new home for
 *  works is a decision someone makes here, in the open. */
export const WORK_META_DIRS = [
  { dir: 'src/components/field/werke', ns: 'field', hrefBase: '/field/werke' },
  { dir: 'src/components/atelier/werke', ns: 'atelier', hrefBase: '/atelier/werke' },
  { dir: 'src/content/atelier/works', ns: 'atelier', hrefBase: '/atelier/works' },
  { dir: 'src/content/studio/works', ns: 'studio', hrefBase: '/studio/works' },
] as const

/** The one OPTIONAL source: Machine Attention is the second constitution and lives in its own
 *  repository, mirrored here only as rendered HTML. Parsing pages back into facts would be a
 *  brittle re-derivation, so the practice exports what it wants known
 *  (docs/design/2026-08-09-attention-export-contract.md). Until that file appears the graph has
 *  no attention lane — stated in a test rather than left as an unexplained gap. */
export const ATTENTION_FILE = 'src/data/attention/export.json'
export const ATTENTION_CONTRACT = 'attention-export/1'

export interface RawSources {
  /** file path → file contents, for every entry of SOURCE_FILES */
  texts: Record<string, string>
  /** every practice work's meta, keyed by its repo-relative path */
  workMetas: Record<string, string>
  /** the attention export, when the practice has published one */
  attention?: string
}

interface AttentionExport {
  $contract?: string
  generated_from?: { repo?: string; commit?: string }
  practice?: { id?: string; label?: string }
  projects?: Array<{ id?: string; title?: string; since?: string; site_route?: string | null; status?: string }>
  figures?: Array<{ key?: string; value?: number; as_of?: string }>
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

  // ── practices, spelled four ways and reconciled once ────────────────────────────────────
  // The records disagree with each other on names: the ledger says `field`, the encounter
  // register says `meridian`, the works sit under `src/components/field/werke`. This house
  // already keeps one place where that is reconciled — normaliseVoice in
  // src/lib/begegnungen/crossings.ts, whose own comment says a second register would be "one
  // drift waiting". So the graph borrows it instead of opening one.
  const spellings = new Map<string, Set<string>>()
  const practiceNode = (raw: string, source: Provenance): string => {
    const voice = normaliseVoice(raw)
    // A name the house's own register does not know keeps its raw spelling rather than being
    // filed under `unknown`: 'ecology' is a real addressee in the post office, not a mistake.
    const id = voice === 'unknown' ? `practice:${slug(raw)}` : `practice:${voice}`
    const seen = spellings.get(id) ?? new Set<string>()
    seen.add(raw)
    spellings.set(id, seen)
    const node: PracticeNode = {
      id,
      kind: 'practice',
      label: voice === 'unknown' ? raw : VOICES[voice].label,
      practiceId: voice === 'unknown' ? slug(raw) : voice,
      spellings: [...seen].sort(),
      source,
    }
    const existing = nodes.get(id) as PracticeNode | undefined
    if (existing) existing.spellings = [...seen].sort()
    else nodes.set(id, node)
    return id
  }

  // ── the practices' own works ────────────────────────────────────────────────────────────
  // 59 of them sat committed in this repo while the graph knew the practices only as names in
  // the post office. Each work's own meta.json is the source; the directory it sits in is the
  // evidence of who made it (the same derivation /works runs).
  for (const [path, text] of Object.entries(sources.workMetas)) {
    const home = WORK_META_DIRS.find((d) => path.startsWith(`${d.dir}/`))
    if (!home) continue
    const workSlug = path.slice(home.dir.length + 1).replace(/\/meta\.json$/, '')
    const meta = JSON.parse(text) as {
      title?: string
      date?: string
      embodies?: string
      verkoerpert?: string
      medium?: string
    }
    if (!meta.title || !meta.date) continue
    const practiceId = practiceNode(home.ns, provenance(path, `"title": ${JSON.stringify(meta.title)}`))
    const id = `practice-work:${home.ns}/${workSlug}`
    const node: PracticeWorkNode = {
      id,
      kind: 'practice-work',
      label: meta.title,
      slug: workSlug,
      practiceId: practiceId.replace(/^practice:/, ''),
      date: meta.date,
      href: `${home.hrefBase}/${workSlug}`,
      source: provenance(path, `"title": ${JSON.stringify(meta.title)}`),
      ...(meta.embodies ?? meta.verkoerpert ? { embodies: meta.embodies ?? meta.verkoerpert } : {}),
      ...(meta.medium ? { medium: meta.medium } : {}),
    }
    add(node)
    edges.push({
      kind: 'made-by',
      from: id,
      to: practiceId,
      source: provenance(path, `"date": ${JSON.stringify(meta.date)}`),
    })
  }

  // ── the ecology audit: the USP obligation, extended to the practices' own works ─────────
  // Same document form as the Holdings audit, joined by the work's directory instead of a
  // route. A work with no section carries no verdict, and that means UNEXAMINED — never
  // cleared. Section 4 of the audit refuses to sign off on its own search ("NOT SETTLED"), so
  // the parser drops it and the graph shows exactly that: no verdict, no prior art.
  for (const entry of parseAudit(sources.texts[ECOLOGY_AUDIT_FILE])) {
    const home = WORK_META_DIRS.find((d) => entry.route.startsWith(`${d.dir}/`))
    if (!home) continue
    const workSlug = entry.route.slice(home.dir.length + 1)
    const node = nodes.get(`practice-work:${home.ns}/${workSlug}`) as PracticeWorkNode | undefined
    if (!node) continue // an audited path this repo does not carry — the test says so loudly
    node.verdict = entry.verdictClass
    node.verdictLabel = entry.verdictLabel
    node.daylight = entry.direction
    node.auditSource = provenance(ECOLOGY_AUDIT_FILE, entry.verdictLabel)
    for (const neighbor of entry.neighbors) {
      const key = neighbor.url
        ? neighbor.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '')
        : neighbor.label
      const id = `neighbor:${slug(key)}`
      add({
        id,
        kind: 'neighbor',
        label: neighbor.label,
        source: provenance(ECOLOGY_AUDIT_FILE, neighbor.raw),
        ...(neighbor.url ? { url: neighbor.url } : {}),
      } as NeighborNode)
      edges.push({
        kind: 'neighbor-of',
        from: node.id,
        to: id,
        note: neighbor.note,
        state: entry.verdictClass,
        source: provenance(ECOLOGY_AUDIT_FILE, neighbor.raw),
      })
    }
  }

  // ── encounters (The Middle) ─────────────────────────────────────────────────────────────
  // The one place where practices actually touch each other. The register is an export of the
  // research-ecology repo; roles ride the edge, because "source" and "receiver" is the whole
  // asymmetry a crossing has.
  const encounters = JSON.parse(sources.texts[ENCOUNTERS_FILE]) as Array<{
    encounter_id?: string
    title?: string
    record_url?: string
    participants?: Array<{ id?: string; role?: string }>
    observed?: { work_slug?: string; engine_repo?: string }
  }>
  for (const encounter of encounters) {
    if (!encounter.encounter_id || !encounter.title) continue
    const id = `encounter:${encounter.encounter_id}`
    const quote = `"encounter_id": ${JSON.stringify(encounter.encounter_id)}`
    const node: EncounterNode = {
      id,
      kind: 'encounter',
      label: encounter.title,
      encounterId: encounter.encounter_id,
      source: provenance(ENCOUNTERS_FILE, quote),
      ...(encounter.record_url ? { recordUrl: encounter.record_url } : {}),
    }
    add(node)
    for (const participant of encounter.participants ?? []) {
      if (!participant.id) continue
      const practiceId = practiceNode(
        participant.id,
        provenance(ENCOUNTERS_FILE, `"id": ${JSON.stringify(participant.id)}`),
      )
      edges.push({
        kind: 'participates',
        from: id,
        to: practiceId,
        state: participant.role,
        source: provenance(ENCOUNTERS_FILE, `"id": ${JSON.stringify(participant.id)}`),
      })
    }
    // The crossing names the work it moved; the edge exists only if that work is one this repo
    // actually carries — a slug pointing at nothing would be a claim the graph cannot show.
    const moved = encounter.observed?.work_slug
    if (moved) {
      const target = [...nodes.values()].find(
        (n): n is PracticeWorkNode => n.kind === 'practice-work' && n.slug.endsWith(moved),
      )
      if (target) {
        edges.push({
          kind: 'concerns',
          from: id,
          to: target.id,
          source: provenance(ENCOUNTERS_FILE, `"work_slug": ${JSON.stringify(moved)}`),
        })
      }
    }
  }

  // ── receivers (the post office) ─────────────────────────────────────────────────────────
  const ledger = JSON.parse(ledgerText) as LedgerEntry[]
  for (const packet of ledger) {
    if (!packet.practice || !packet.receiver) continue
    const practiceId = practiceNode(
      packet.practice,
      provenance(LEDGER_FILE, `"practice": "${packet.practice}"`),
    )
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
  }

  // ── machine attention, if it has published an export ────────────────────────────────────
  if (sources.attention) {
    const attention = JSON.parse(sources.attention) as AttentionExport
    // A version this consumer does not know is refused rather than guessed at: the contract is
    // the whole agreement between two repositories that cannot see each other's tests.
    if (attention.$contract !== ATTENTION_CONTRACT) {
      throw new Error(
        `${ATTENTION_FILE} declares "${attention.$contract}", but this consumer implements ` +
          `"${ATTENTION_CONTRACT}" (docs/design/2026-08-09-attention-export-contract.md)`,
      )
    }
    const practice = attention.practice
    if (!practice?.id || !practice.label) throw new Error(`${ATTENTION_FILE}: practice.id and .label are required`)

    const practiceId = practiceNode(
      practice.id,
      provenance(ATTENTION_FILE, `"id": ${JSON.stringify(practice.id)}`),
    )
    const node = nodes.get(practiceId) as PracticeNode
    node.label = practice.label
    if (attention.figures?.length) {
      node.figures = attention.figures
        .filter((f) => f.key && typeof f.value === 'number' && f.as_of)
        .map((f) => ({ key: f.key as string, value: f.value as number, asOf: f.as_of as string }))
    }

    for (const project of attention.projects ?? []) {
      if (!project.id || !project.title || !project.since) continue
      const quote = `"id": ${JSON.stringify(project.id)}`
      // A project with a room on this site is the same body in two records; one without is the
      // practice's own production and enters as its work.
      const room = project.site_route ? WERKE.find((w) => w.href === project.site_route) : undefined
      if (room) {
        edges.push({
          kind: 'door',
          from: practiceId,
          to: `work:${room.id}`,
          state: project.status,
          source: provenance(ATTENTION_FILE, quote),
        })
        continue
      }
      const id = `practice-work:${practice.id}/${project.id}`
      add({
        id,
        kind: 'practice-work',
        label: project.title,
        slug: project.id,
        practiceId: practiceId.replace(/^practice:/, ''),
        date: project.since,
        href: project.site_route ?? '',
        source: provenance(ATTENTION_FILE, quote),
      })
      edges.push({
        kind: 'made-by',
        from: id,
        to: practiceId,
        state: project.status,
        source: provenance(ATTENTION_FILE, quote),
      })
    }
  }

  // A practice that also keeps a door on this site is the same body in two records. The match
  // runs through the same normalisation as everything else, so `field` the werk and `meridian`
  // the voice meet without a second alias table.
  for (const werk of WERKE) {
    const voice = normaliseVoice(werk.id)
    if (voice === 'unknown') continue
    const practiceId = `practice:${voice}`
    if (!nodes.has(practiceId)) continue
    edges.push({
      kind: 'door',
      from: practiceId,
      to: `work:${werk.id}`,
      source: provenance(WERKE_FILE, `id: '${werk.id}'`),
    })
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
      sources: [
        ...SOURCE_FILES.map((file) => ({ file, sha256: digest(sources.texts[file]) })),
        ...WORK_META_DIRS.map((home) => groupDigest(home.dir, sources.workMetas)),
        // listed only when it exists — an absent optional source is not a zero digest
        ...(sources.attention ? [{ file: ATTENTION_FILE, sha256: digest(sources.attention) }] : []),
      ],
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

/** One digest over a whole directory of work metas: paths and contents, sorted, concatenated.
 *  59 separate rows in meta.sources would make the file unreadable for the reader it exists
 *  for, and one digest still goes stale the moment any single meta moves. */
export function groupDigest(dir: string, metas: Record<string, string>): {
  file: string
  sha256: string
  files: number
} {
  const entries = Object.entries(metas)
    .filter(([path]) => path.startsWith(`${dir}/`))
    .sort(([a], [b]) => cmp(a, b))
  const joined = entries.map(([path, text]) => `${path}\n${text}`).join('\n')
  return { file: `${dir}/*/meta.json`, sha256: digest(joined), files: entries.length }
}

/** Read every practice work's meta.json out of a checkout. Shallow by design: a work is one
 *  directory with one meta beside it, and a deeper walk would start collecting things that
 *  are not works. */
export function readWorkMetas(root: string): Record<string, string> {
  const metas: Record<string, string> = {}
  for (const home of WORK_META_DIRS) {
    const base = `${root}${home.dir}`
    if (!existsSync(base)) continue
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const path = `${home.dir}/${entry.name}/meta.json`
      if (existsSync(`${root}${path}`)) metas[path] = readFileSync(`${root}${path}`, 'utf8')
    }
  }
  return metas
}

/** Read every source out of a repo checkout and derive the graph. */
export function buildGraphFromRepo(root: string): KnowledgeGraph {
  const texts: Record<string, string> = {}
  for (const file of SOURCE_FILES) texts[file] = readFileSync(`${root}${file}`, 'utf8')
  const attentionPath = `${root}${ATTENTION_FILE}`
  return buildGraph({
    texts,
    workMetas: readWorkMetas(root),
    ...(existsSync(attentionPath) ? { attention: readFileSync(attentionPath, 'utf8') } : {}),
  })
}
