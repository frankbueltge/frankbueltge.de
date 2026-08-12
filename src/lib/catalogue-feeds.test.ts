// The three catalogue feeds say the same thing as the three catalogue pages, or they are worse
// than no feed at all: a machine reader cannot see the page it disagrees with.
//
// These endpoints exist because the house's four research lines run as cloud sessions that hold
// their own repository and the open web, and never this one (by design — they publish through
// `site-prs/` and a human-merged gate). The atlas is the corpus behind the USP duty; before
// 2026-08-13 it was reachable to them only as a 938 kB HTML page.
//
// What is asserted is the join, not the numbers: every count is DERIVED from the same module the
// page imports, so the scouts can grow these registers nightly without turning this test red.
// That is the 2026-08-01/02 lesson (a pinned total blocked publication for six runs) applied to
// a feed instead of a work.
import { describe, expect, it } from 'vitest'
import type { APIRoute } from 'astro'
import works from '@/data/atlas/werke.json'
import { PAPERS, ABGELEHNT } from '@/lib/papers'
import { ENTRIES } from '@/lib/register'
import { GET as atlasFeed } from '@/pages/atlas/werke.json'
import { GET as papersFeed } from '@/pages/papers/register.json'
import { GET as papersIndex } from '@/pages/papers/index.json'
import { GET as datasetsFeed } from '@/pages/datasets/register.json'

const body = async (route: APIRoute) => {
  const res = await route({} as Parameters<APIRoute>[0])
  expect((res as Response).headers.get('Content-Type')).toContain('application/json')
  return JSON.parse(await (res as Response).text())
}

describe('the catalogue feeds carry what the pages carry', () => {
  it('the atlas feed holds every neighbouring work, in order', async () => {
    const feed = await body(atlasFeed)
    expect(feed.count).toBe((works as unknown[]).length)
    expect(feed.entries).toHaveLength(feed.count)
    expect(feed.entries[0]).toEqual((works as unknown[])[0])
  })

  it('the papers feed carries the rejections too — the criterion, not only the result', async () => {
    const feed = await body(papersFeed)
    expect(feed.count).toBe(PAPERS.length)
    expect(feed.rejected_count).toBe(ABGELEHNT.length)
    expect(feed.rejected).toHaveLength(ABGELEHNT.length)
  })

  it('the dataset feed keeps the access checks — a 403 is a fact about the source', async () => {
    const feed = await body(datasetsFeed)
    expect(feed.count).toBe(ENTRIES.length)
    const probed = feed.entries.filter((e: Record<string, unknown>) => 'pruef_status' in e)
    expect(probed.length, 'the register lost its reachability probes on the way out').toBeGreaterThan(0)
  })

  it('the slim papers index holds every paper and no abstract', async () => {
    const feed = await body(papersIndex)
    expect(feed.count).toBe(PAPERS.length)
    expect(feed.entries).toHaveLength(PAPERS.length)
    // The point of the slim feed: a fetch returns the whole list instead of a truncated one.
    // If abstracts ever creep back in, it is silently the big feed again under a small name.
    expect(feed.entries.some((e: Record<string, unknown>) => 'zusammenfassung' in e)).toBe(false)
    expect(feed.entries[0].titel).toBe(PAPERS[0].titel)
    expect(feed.full).toBe('https://frankbueltge.de/papers/register.json')
    expect(JSON.stringify(feed).length).toBeLessThan(1_200_000)
  })

  it('every feed names its source, its page and its licence', async () => {
    for (const route of [atlasFeed, papersFeed, papersIndex, datasetsFeed]) {
      const feed = await body(route)
      // A feed a machine can read but not cite is a dead end for exactly the practices this was
      // built for: their protocols require a retrievable reference for every factual claim.
      expect(feed.source).toMatch(/^https:\/\/github\.com\/frankbueltge\/frankbueltge\.de/)
      expect(feed.page).toMatch(/^https:\/\/frankbueltge\.de\//)
      expect(feed.licence).toMatch(/CC0/)
      expect(feed.note.length).toBeGreaterThan(80)
    }
  })
})
