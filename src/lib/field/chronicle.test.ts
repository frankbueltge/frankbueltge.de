import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { splitSessions, uniqueSessionAnchor } from '@/lib/engines/journal'
import {
  chronicleEntrySchema,
  upstreamEntrySchema,
  mergeChronicle,
  type ChronicleEntry,
  type UpstreamEntry,
} from './chronicle'
import curatedRaw from '@/data/field/chronicle.curated.json'
import upstreamRaw from '@/data/field/chronicle.upstream.json'

const curated = z.array(chronicleEntrySchema).parse(curatedRaw)
const upstream = z.array(upstreamEntrySchema).parse(upstreamRaw)
// What the site actually serves: the curated spine + the engine's self-reports. The gate
// must validate this MERGED result — since session 25 (2026-07-11) new sessions are
// legitimately covered by the synced upstream self-report alone, never hand-curated first.
const served = mergeChronicle(curated, upstream)

describe('chronicle.curated.json', () => {
  it('validates against the schema and has unique, gapless seq', () => {
    const seqs = curated.map((e) => e.seq)
    expect(new Set(seqs).size).toBe(seqs.length)
    expect(Math.min(...seqs)).toBe(1)
    expect(Math.max(...seqs)).toBe(seqs.length)
  })

  // The anchor-integrity guard: every served anchor (curated + upstream-derived) must
  // resolve against the anchors the site actually renders from the REAL synced journal
  // files — this is what catches upstream heading-format drift at build time instead of
  // shipping dead deep-links.
  it('every served anchor resolves against the real synced journals', () => {
    const dir = join(process.cwd(), 'src/content/field/journal')
    const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort() // chronological
    const used = new Set<string>()
    for (const f of files) {
      const day = f.replace(/\.md$/, '')
      splitSessions(readFileSync(join(dir, f), 'utf-8')).forEach((s, i) =>
        uniqueSessionAnchor(used, s.heading, day, i),
      )
    }
    for (const e of served) {
      expect(used, `anchor ${e.anchor} (seq ${e.seq}) not rendered on /field`).toContain(e.anchor)
    }
    // and the served chronicle covers every rendered session (drift alarm in the other
    // direction): a session with NEITHER a curated entry NOR an upstream self-report
    // still fails the gate loudly.
    expect(served.length).toBe(used.size)
  })

  it('every referenced journal_id exists', () => {
    const dir = join(process.cwd(), 'src/content/field/journal')
    const files = new Set(readdirSync(dir).map((f) => `journal/${f}`))
    for (const e of served) expect(files).toContain(e.journal_id)
  })
})

describe('mergeChronicle', () => {
  const upstreamOk: UpstreamEntry = {
    collective_session: 99,
    date: '2026-08-01',
    move: 'build',
    summary: 'A future self-reported session with a long enough summary.',
    works: [],
    verdict: null,
  }

  it('appends new upstream sessions with derived seq/anchor/source', () => {
    const merged = mergeChronicle(curated, [upstreamOk])
    const added = merged[merged.length - 1]
    expect(added.seq).toBe(curated.length + 1)
    expect(added.anchor).toBe('cs-99')
    expect(added.source).toBe('upstream')
    expect(added.journal_id).toBe('journal/2026-08-01.md')
  })

  it('never overwrites curated: same (collective_session, date) is skipped', () => {
    const dupe: UpstreamEntry = { ...upstreamOk, collective_session: 20, date: '2026-07-10' }
    const merged = mergeChronicle(curated, [dupe])
    expect(merged).toHaveLength(curated.length)
    expect(merged.find((e) => e.collective_session === 20)?.source).toBe('curated')
  })

  it('suffixes the anchor when the engine re-claims an already-used session number (real drift case)', () => {
    // cs-24 is claimed twice in the curated data already (2026-07-10 and the mislabelled
    // 2026-07-11 run); a third claim from upstream must not collide with either.
    const reclaim: UpstreamEntry = { ...upstreamOk, collective_session: 24, date: '2026-08-02' }
    const merged = mergeChronicle(curated, [reclaim])
    const added = merged[merged.length - 1]
    expect(added.anchor).toBe('cs-24-2026-08-02')
  })

  it('derives fail from a fail verdict', () => {
    const failing: UpstreamEntry = { ...upstreamOk, verdict: 'fail' }
    const merged = mergeChronicle(curated, [failing])
    expect(merged[merged.length - 1].fail).toBe(true)
  })
})

describe('schemas reject malformed data (the integrate gate)', () => {
  // move/verdict are deliberately free-form: the autonomous collective coins new words as its
  // practice evolves (a real case: session 34 introduced move 'advance (outward)' and verdict
  // 'rework'). A new-but-well-formed word is vocabulary drift, not malformed data — it must pass
  // so a single new label never turns the whole field build red and blocks every publish.
  it('accepts a novel move/verdict the collective coins (vocabulary drift, not an error)', () => {
    expect(() =>
      upstreamEntrySchema.parse({
        collective_session: 34,
        date: '2026-07-13',
        move: 'advance (outward)',
        summary: 'A future expedition session with a long enough summary to satisfy the schema.',
        verdict: 'rework',
      }),
    ).not.toThrow()
  })
  it('still rejects an empty move (structural validation stays strict)', () => {
    expect(() =>
      upstreamEntrySchema.parse({
        collective_session: 1,
        date: '2026-08-01',
        move: '',
        summary: 'Long enough summary text for the schema to accept.',
      }),
    ).toThrow()
  })
  it('rejects a too-short summary (the whole point is the summary)', () => {
    expect(() =>
      upstreamEntrySchema.parse({
        collective_session: 1,
        date: '2026-08-01',
        move: 'build',
        summary: 'too short',
      }),
    ).toThrow()
  })
  it('rejects a curated entry with a bad date', () => {
    const bad = { ...(curated[0] as ChronicleEntry), date: '01.07.2026' }
    expect(() => chronicleEntrySchema.parse(bad)).toThrow()
  })
})
