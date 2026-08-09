// src/lib/graph/graph.test.ts — the graph's honesty harness.
//
// Same principle as the ecology anatomy's (src/lib/ecology/anatomy.test.ts): a figure may only
// show what a committed file still says. Here it binds harder, because the graph is a derived
// artifact rather than a hand-written one, and it is checked from three sides:
//
//   1. every quote a node or edge carries is still in the file it names — a source that moves
//      under the graph turns it red instead of leaving a plausible line on a page;
//   2. the committed src/data/graph/graph.json IS what today's sources derive to — the file
//      cannot be edited by hand, and it cannot fall behind the records it summarises;
//   3. structural invariants that would otherwise rot quietly — chief among them: every
//      experiment ranked on /holdings carries a neighbour audit. That one is the USP
//      obligation of 2026-08-09 made mechanical (docs/decision-log.md): a new experiment
//      cannot reach the shelf without an answer to "does the world already have this?".

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { HOLDINGS_RANKED, WERKE } from '@/data/werke'
import { normaliseVoice } from '@/lib/begegnungen/crossings'
import { SOURCE_FILES, WORK_META_DIRS, buildGraph, digest, groupDigest, readWorkMetas } from './build'
import { parseAudit, type LedgerEntry } from './derive'
import type { EncounterNode, KnowledgeGraph, PracticeNode, PracticeWorkNode, WorkNode } from './types'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const read = (p: string): string => readFileSync(`${ROOT}${p}`, 'utf8')

/** Collapse every run of whitespace — the sources are hard-wrapped markdown, so a quotation
 *  spans a line break in the file and not in the graph. The words are what is asserted. */
const flat = (s: string): string => s.replace(/\s+/g, ' ').trim()

const texts: Record<string, string> = {}
for (const file of SOURCE_FILES) texts[file] = read(file)
const workMetas = readWorkMetas(ROOT)

const committed = JSON.parse(read('src/data/graph/graph.json')) as KnowledgeGraph
const derived = buildGraph({ texts, workMetas })
/** Every file a claim may name: the four fixed records, plus each practice work's own meta. */
const flatSources = new Map<string, string>([
  ...SOURCE_FILES.map((f) => [f as string, flat(texts[f])] as const),
  ...Object.entries(workMetas).map(([path, text]) => [path, flat(text)] as const),
])

describe('every line the graph carries is still in the file it came from', () => {
  const claims = [
    ...committed.nodes.map((n) => ({ where: `node ${n.id}`, ...n.source })),
    ...committed.nodes
      .filter((n): n is WorkNode => n.kind === 'work' && Boolean(n.auditSource))
      .map((n) => ({ where: `verdict of ${n.id}`, ...(n.auditSource as { file: string; quote: string }) })),
    ...committed.edges.map((e) => ({ where: `edge ${e.kind} ${e.from}→${e.to}`, ...e.source })),
  ]

  it('has claims to check', () => {
    expect(claims.length).toBeGreaterThan(150)
  })

  it.each(claims)('$where is still in its source', ({ where, file, quote }) => {
    expect(flatSources.get(file), `${where} names ${file}, which is not a declared source`).toBeDefined()
    expect(
      flatSources.get(file),
      `${where} quotes ${file}, which no longer contains: "${quote}"`,
    ).toContain(flat(quote))
  })

  it('reads only from the declared sources — there is no other way into this graph', () => {
    const declared = (file: string): boolean =>
      (SOURCE_FILES as readonly string[]).includes(file) ||
      WORK_META_DIRS.some((home) => new RegExp(`^${home.dir}/[^/]+/meta\\.json$`).test(file))
    for (const node of committed.nodes) expect(declared(node.source.file), node.source.file).toBe(true)
    for (const edge of committed.edges) expect(declared(edge.source.file), edge.source.file).toBe(true)
  })

  it('keeps the works’ own line quotes verbatim, curly quotes and all', () => {
    const werke = flat(texts['src/data/werke.ts'])
    for (const node of committed.nodes) {
      if (node.kind === 'work' && node.line) expect(werke).toContain(flat(node.line))
    }
  })
})

describe('the committed graph is the derivation, not a copy of it', () => {
  it('matches a fresh build of today’s sources — run `npm run graph:build` if this fails', () => {
    expect(committed).toEqual(derived)
  })

  it('names a digest per source, and each one is that file today', () => {
    expect(committed.meta.sources.map((s) => s.file)).toEqual([
      ...SOURCE_FILES,
      ...WORK_META_DIRS.map((home) => `${home.dir}/*/meta.json`),
    ])
    for (const source of committed.meta.sources) {
      const home = WORK_META_DIRS.find((d) => source.file === `${d.dir}/*/meta.json`)
      const current = home ? groupDigest(home.dir, workMetas) : { sha256: digest(texts[source.file]) }
      expect(
        source.sha256,
        `${source.file} changed since the graph was built — run \`npm run graph:build\``,
      ).toBe(current.sha256)
    }
  })

  it('counts the works it read per directory, so a vanished work is visible in the file itself', () => {
    for (const home of WORK_META_DIRS) {
      const recorded = committed.meta.sources.find((s) => s.file === `${home.dir}/*/meta.json`)
      expect(recorded?.files).toBe(groupDigest(home.dir, workMetas).files)
    }
  })

  it('counts what it contains', () => {
    expect(committed.meta.counts.nodes).toBe(committed.nodes.length)
    expect(committed.meta.counts.edges).toBe(committed.edges.length)
  })

  it('never points an edge at a node it does not carry', () => {
    const ids = new Set(committed.nodes.map((n) => n.id))
    for (const edge of committed.edges) {
      expect(ids, `${edge.kind} edge leaves from an unknown ${edge.from}`).toContain(edge.from)
      expect(ids, `${edge.kind} edge points at an unknown ${edge.to}`).toContain(edge.to)
    }
  })

  it('gives every node a unique id', () => {
    expect(new Set(committed.nodes.map((n) => n.id)).size).toBe(committed.nodes.length)
  })
})

describe('the register and the audit still describe the same shelf', () => {
  const works = committed.nodes.filter((n): n is WorkNode => n.kind === 'work')

  it('carries every werk of the register', () => {
    expect(works.map((w) => w.werkId).sort()).toEqual(WERKE.map((w) => w.id).sort())
  })

  it('resolves every audited route to a work — a renamed route must not orphan its audit', () => {
    const routes = new Set(WERKE.map((w) => w.href))
    for (const entry of parseAudit(texts['docs/audits/2026-08-09-usp-audit.md'])) {
      expect(routes, `the audit's §${entry.number} names ${entry.route}, which no werk carries`).toContain(
        entry.route,
      )
    }
  })

  // The USP obligation, made mechanical. If this fails, an experiment reached /holdings without
  // anyone asking whether the world already has it — the audit is where that answer lives.
  it('gives every experiment ranked on /holdings a verdict, a daylight and named prior art', () => {
    const neighbours = new Set(
      committed.edges.filter((e) => e.kind === 'neighbor-of').map((e) => e.from),
    )
    for (const id of HOLDINGS_RANKED) {
      const node = works.find((w) => w.werkId === id) as WorkNode
      expect(node.verdict, `${id} is ranked on /holdings but the USP audit has no verdict for it`).toBeDefined()
      expect(node.daylight, `${id} has no named daylight — see the audit's (d) paragraph`).toBeTruthy()
      expect(neighbours, `${id} names no prior art at all`).toContain(node.id)
    }
  })

  it('classifies every verdict as one of the audit’s three', () => {
    for (const work of works) {
      if (!work.verdict) continue
      expect(['UNIQUE', 'ADDED VALUE', 'REDUNDANT']).toContain(work.verdict)
      expect(work.verdictLabel?.startsWith(work.verdict)).toBe(true)
    }
  })
})

describe('the ecology lane — the practices’ own production', () => {
  const practiceWorks = committed.nodes.filter((n): n is PracticeWorkNode => n.kind === 'practice-work')
  const practices = committed.nodes.filter((n): n is PracticeNode => n.kind === 'practice')
  const encounters = committed.nodes.filter((n): n is EncounterNode => n.kind === 'encounter')

  it('carries every work that has a committed meta, and no work that has not', () => {
    expect(practiceWorks.length).toBe(Object.keys(workMetas).length)
    expect(practiceWorks.length).toBeGreaterThan(50)
  })

  it('gives every practice work a maker, read from where the work lives', () => {
    const made = new Set(committed.edges.filter((e) => e.kind === 'made-by').map((e) => e.from))
    for (const work of practiceWorks) {
      expect(made, `${work.id} names no practice`).toContain(work.id)
      expect(work.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  // The house keeps ONE register of voice spellings (src/lib/begegnungen/crossings.ts, whose
  // own comment calls a second one "one drift waiting"). This asserts the graph really uses
  // it: no practice may appear twice under two of its own names.
  it('files each practice under one normalised voice, never twice under two spellings', () => {
    const ids = practices.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const practice of practices) {
      expect(practice.spellings.length).toBeGreaterThan(0)
      for (const spelling of practice.spellings) {
        const voice = normaliseVoice(spelling)
        const expected = voice === 'unknown' ? practice.practiceId : voice
        expect(practice.practiceId, `"${spelling}" is filed under ${practice.id}`).toBe(expected)
      }
    }
    // the four spellings that made this necessary
    const meridian = practices.find((p) => p.practiceId === 'meridian')
    expect(meridian?.spellings).toEqual(['field', 'meridian'])
  })

  it('sends every participant of an encounter to a practice the graph carries', () => {
    const ids = new Set(practices.map((p) => p.id))
    const participations = committed.edges.filter((e) => e.kind === 'participates')
    expect(participations.length).toBeGreaterThan(encounters.length)
    for (const edge of participations) {
      expect(ids).toContain(edge.to)
      expect(edge.state, 'a crossing without a role would hide who gave and who received').toBeTruthy()
    }
  })

  it('only claims a crossing moved a work when this repo actually carries that work', () => {
    const slugs = new Map(practiceWorks.map((w) => [w.id, w.slug]))
    for (const edge of committed.edges.filter((e) => e.kind === 'concerns')) {
      expect(slugs.has(edge.to), `${edge.to} is not a work in this repo`).toBe(true)
      const named = /"work_slug": "(.+?)"/.exec(edge.source.quote)?.[1] as string
      expect(slugs.get(edge.to)?.endsWith(named)).toBe(true)
    }
    // enc-2026-006 names `sixty-cases-decision`, which lives in the ulysses repo and not here.
    // The absent edge is the point: the graph shows what this checkout can show.
    const register = texts['src/data/begegnungen/register.json']
    expect(register).toContain('sixty-cases-decision')
    expect(committed.edges.some((e) => e.kind === 'concerns' && e.to.includes('sixty-cases'))).toBe(false)
  })

  it('reaches the ecology from a practice: work → practice → encounter → another practice', () => {
    const madeBy = committed.edges.find((e) => e.kind === 'made-by' && e.from.startsWith('practice-work:studio/'))
    expect(madeBy?.to).toBe('practice:ensemble')
    const crossing = committed.edges.find((e) => e.kind === 'concerns')
    const roles = committed.edges
      .filter((e) => e.kind === 'participates' && e.from === crossing?.from)
      .map((e) => e.state)
    expect(roles).toContain('source')
    expect(roles).toContain('receiver')
  })
})

describe('the post office lane', () => {
  const ledger = JSON.parse(texts['src/data/post/ledger.json']) as LedgerEntry[]

  it('quotes the packets’ own titles', () => {
    const pieces = new Set(ledger.map((e) => e.piece).filter(Boolean))
    for (const edge of committed.edges) {
      if (edge.kind !== 'addresses') continue
      expect(pieces, `an addresses edge carries a piece title the ledger does not have`).toContain(edge.note)
    }
  })

  // The relation is the fact; the address is not this instrument's business. The ledger names
  // real people's inboxes, and this graph is a second published surface — it stays out.
  it('carries no receiver channel — no address of a real person travels into this file', () => {
    const serialised = JSON.stringify(committed)
    for (const entry of ledger as Array<LedgerEntry & { receiver_channel?: string }>) {
      if (!entry.receiver_channel) continue
      expect(serialised).not.toContain(entry.receiver_channel)
    }
    expect(serialised).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
  })
})
