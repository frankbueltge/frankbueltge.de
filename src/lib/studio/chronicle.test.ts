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
import curatedRaw from '@/data/studio/chronicle.curated.json'
import upstreamRaw from '@/data/studio/chronicle.upstream.json'

const curated = z.array(chronicleEntrySchema).parse(curatedRaw)
const upstream = z.array(upstreamEntrySchema).parse(upstreamRaw)
// What the site actually serves: the curated spine (empty at founding) + the studio's own
// self-reports. The gate must validate this MERGED result — the studio self-reports from
// session 1, so every served session today is covered by upstream alone, never hand-curated.
const served = mergeChronicle(curated, upstream)

describe('chronicle.curated.json', () => {
  // The studio has no hand-curated spine yet (self-reports from session 1) — this is the
  // empty-curated case the merge logic must derive seq from cleanly (see mergeChronicle tests
  // below). Unlike field's non-empty spine, Math.min/Math.max over an empty array would be
  // ±Infinity, so this asserts emptiness directly rather than a gapless-seq invariant.
  it('is empty (no hand-curated spine yet — the studio self-reports from session 1)', () => {
    expect(curated).toEqual([])
  })

  // The anchor-integrity guard: every served anchor (curated + upstream-derived) must
  // resolve against the anchors the site actually renders from the REAL synced journal
  // files — this is what catches upstream heading-format drift at build time instead of
  // shipping dead deep-links.
  it('every served anchor resolves against the real synced journals', () => {
    const dir = join(process.cwd(), 'src/content/studio/journal')
    const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort() // chronological
    const used = new Set<string>()
    for (const f of files) {
      const day = f.replace(/\.md$/, '')
      splitSessions(readFileSync(join(dir, f), 'utf-8')).forEach((s, i) =>
        uniqueSessionAnchor(used, s.heading, day, i),
      )
    }
    for (const e of served) {
      expect(used, `anchor ${e.anchor} (seq ${e.seq}) not rendered on /studio`).toContain(e.anchor)
    }
    // and the served chronicle covers every rendered session (drift alarm in the other
    // direction): a session with NEITHER a curated entry NOR an upstream self-report
    // still fails the gate loudly.
    expect(served.length).toBe(used.size)
  })

  it('every referenced journal_id exists', () => {
    const dir = join(process.cwd(), 'src/content/studio/journal')
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

  it('derives seq cleanly from upstream alone when curated is empty (the founding case)', () => {
    const merged = mergeChronicle([], upstream)
    expect(merged.map((e) => e.seq)).toEqual(upstream.map((_, i) => i + 1))
    expect(merged.every((e) => e.source === 'upstream')).toBe(true)
    expect(merged[0].anchor).toBe('cs-1')
  })

  it('appends new upstream sessions with derived seq/anchor/source onto a non-empty spine', () => {
    const spine: ChronicleEntry[] = [
      {
        seq: 1,
        date: '2026-07-12',
        collective_session: 1,
        move: 'other',
        summary: 'A hand-curated spine entry with a long enough summary to pass the schema.',
        works: [],
        verdict: 'conditions',
        fail: false,
        journal_id: 'journal/2026-07-12.md',
        anchor: 'cs-1',
        source: 'curated',
      },
    ]
    const merged = mergeChronicle(spine, [upstreamOk])
    const added = merged[merged.length - 1]
    expect(added.seq).toBe(spine.length + 1)
    expect(added.anchor).toBe('cs-99')
    expect(added.source).toBe('upstream')
    expect(added.journal_id).toBe('journal/2026-08-01.md')
  })

  it('never overwrites curated: same (collective_session, date) is skipped', () => {
    const spine: ChronicleEntry[] = [
      {
        seq: 1,
        date: '2026-07-12',
        collective_session: 1,
        move: 'other',
        summary: 'A hand-curated spine entry with a long enough summary to pass the schema.',
        works: [],
        verdict: 'conditions',
        fail: false,
        journal_id: 'journal/2026-07-12.md',
        anchor: 'cs-1',
        source: 'curated',
      },
    ]
    const dupe: UpstreamEntry = { ...upstreamOk, collective_session: 1, date: '2026-07-12' }
    const merged = mergeChronicle(spine, [dupe])
    expect(merged).toHaveLength(spine.length)
    expect(merged.find((e) => e.collective_session === 1)?.source).toBe('curated')
  })

  it('suffixes the anchor when the engine re-claims an already-used session number', () => {
    const reclaim: UpstreamEntry = { ...upstreamOk, collective_session: 1, date: '2026-08-02' }
    // cs-1 is already claimed by session 1 in the studio's real upstream data (2026-07-12);
    // a second claim from a different date must not collide with it.
    const merged = mergeChronicle([], [...upstream, reclaim])
    const added = merged[merged.length - 1]
    expect(added.anchor).toBe('cs-1-2026-08-02')
  })

  it('derives fail from a fail verdict', () => {
    const failing: UpstreamEntry = { ...upstreamOk, verdict: 'fail' }
    const merged = mergeChronicle([], [failing])
    expect(merged[merged.length - 1].fail).toBe(true)
  })
})

describe('schemas reject malformed data (the integrate gate)', () => {
  it('rejects a bad move enum', () => {
    expect(() =>
      upstreamEntrySchema.parse({
        collective_session: 1,
        date: '2026-08-01',
        move: 'vibe',
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
    const bad = {
      seq: 1,
      date: '01.07.2026',
      collective_session: 1,
      move: 'build' as const,
      summary: 'Long enough summary text for the schema to accept.',
      works: [],
      verdict: null,
      fail: false,
      journal_id: 'journal/2026-07-12.md',
      anchor: 'cs-1',
      source: 'curated' as const,
    }
    expect(() => chronicleEntrySchema.parse(bad)).toThrow()
  })
})
