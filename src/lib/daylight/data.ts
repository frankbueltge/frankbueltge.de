// src/lib/daylight/data.ts — the screen, bound to what this repository has committed.
//
// Two committed sides, one index (see screen.ts for why one): the ecology's own works, from the
// same register /ecology renders, and the Atlas of Data Art, from the same file /atlas renders.
// Nothing is fetched; nothing is authored here. A rebuild on the same commit gives the same queue.

import { allWorks } from '@/lib/engines/register'
import { descFor } from '@/lib/engines/teaser'
import atlasData from '@/data/atlas/werke.json'
import { buildIndex, nearest, type Doc, type Neighbour } from './screen'

export interface AtlasEntry {
  title: string
  artist?: string
  year?: string
  clusters?: number[]
  axis_pole?: string
  decisive_move?: string
  source_url?: string
}

export interface ScreenedWork {
  /** `<ns>/<slug>` — the same key the audit and the register use */
  key: string
  title: string
  practice: string
  date: string
  href: string
  /** the Atlas entries nearest to this work, strongest first */
  neighbours: (Neighbour & { entry: AtlasEntry })[]
  /** the strongest score this work drew — its place in the queue */
  top: number
}

const PRACTICE: Record<string, string> = { atelier: 'The Atelier', field: 'The Field', studio: 'The Studio' }

/** An Atlas entry's id in the shared index. Index position, not title: two entries can share a
 *  title, and a collision would silently merge two different works into one vector. */
const atlasId = (i: number) => `atlas:${i}`

/** What of a work goes into the comparison: its title, the two-sentence teaser written for it,
 *  and its own `embodies`. Not the work's full text — the Atlas side carries one sentence about
 *  what a work DOES, and matching a whole essay against one sentence measures length, not
 *  likeness. Both sides stay descriptions of a move. */
const workText = (title: string, desc?: string, blurb?: string) => [title, desc ?? '', blurb ?? ''].join(' ')

/** A pairing of two of this house's OWN works — the ruler. */
export interface SiblingPair {
  a: string
  b: string
  score: number
  shared: string[]
}

export interface ScreenResult {
  works: ScreenedWork[]
  atlas: AtlasEntry[]
  /** how many documents the shared index was built from — works plus Atlas entries */
  corpus: number
  atlasCount: number
  /** every pairing the screen scored: works x atlas entries */
  pairings: number
  /**
   * THE RULER, and the reason this instrument is more than a number generator. A score has no
   * meaning on its own: 0.13 is small or large only against something known. So the same measure
   * is run over the one corpus where relatedness is NOT in question — this house's own works
   * against each other, where sibling pairs are matters of public record (two practices working
   * the same census in one week; two works on the same retraction notices).
   *
   * The ruler is an UPPER bound and the page must say so: works from one house share more than a
   * subject, they share an idiom, a register and a vocabulary. Some of that 0.4 is voice, not
   * likeness. Which makes the comparison conservative in the useful direction — if nothing in the
   * Atlas reaches even the middle of a ruler inflated by shared idiom, the gap is real.
   */
  ruler: { top: SiblingPair[]; median: number; max: number }
  /** works whose nearest Atlas entry reaches at least the ruler's median */
  atMedian: number
}

/**
 * The whole screen. `limit` is how many candidates each work carries; three is what a reader
 * checks, and the queue's job is to be checked rather than to be complete.
 */
export function screenWorks(limit = 3): ScreenResult {
  const atlas = atlasData as AtlasEntry[]
  const works = allWorks().map((w) => ({ ...w, desc: descFor(w.ns, w.slug, w.blurb) }))

  const docs: Doc[] = [
    ...works.map((w) => ({ id: `${w.ns}/${w.slug}`, text: workText(w.title, w.desc, w.blurb) })),
    ...atlas.map((e, i) => ({
      id: atlasId(i),
      text: [e.title, e.decisive_move ?? ''].join(' '),
    })),
  ]

  const index = buildIndex(docs)
  const atlasIds = atlas.map((_, i) => atlasId(i))

  const screened: ScreenedWork[] = works.map((w) => {
    const key = `${w.ns}/${w.slug}`
    const neighbours = nearest(index, key, atlasIds, limit).map((n) => ({
      ...n,
      entry: atlas[Number(n.id.slice('atlas:'.length))],
    }))
    return {
      key,
      title: w.title,
      practice: PRACTICE[w.ns] ?? w.ns,
      date: w.date,
      href: w.href,
      neighbours,
      top: neighbours[0]?.score ?? 0,
    }
  })

  // Strongest first: the queue is ordered by how urgently a pair wants a human look. The
  // tie-break on key keeps a rebuild from reordering works that scored identically.
  screened.sort((a, b) => b.top - a.top || a.key.localeCompare(b.key))

  // The ruler: the same measure over the house's own works.
  const workIds = works.map((w) => `${w.ns}/${w.slug}`)
  const titleOf = new Map(works.map((w) => [`${w.ns}/${w.slug}`, w.title]))
  const sibling = workIds.map((id) => {
    const n = nearest(index, id, workIds, 1)[0]
    return { a: id, b: n?.id ?? '', score: n?.score ?? 0, shared: n?.shared ?? [] }
  })
  const siblingScores = sibling.map((s) => s.score).sort((x, y) => y - x)
  const rulerMedian = siblingScores[Math.floor(siblingScores.length / 2)] ?? 0

  // One row per pair, not two: A's nearest is B and B's nearest is A, and the ruler should not
  // show the same pairing twice under two names.
  const seen = new Set<string>()
  const top: SiblingPair[] = []
  for (const s of [...sibling].sort((x, y) => y.score - x.score || x.a.localeCompare(y.a))) {
    const key = [s.a, s.b].sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    top.push({ a: titleOf.get(s.a) ?? s.a, b: titleOf.get(s.b) ?? s.b, score: s.score, shared: s.shared })
    if (top.length === 3) break
  }

  return {
    works: screened,
    atlas,
    corpus: docs.length,
    atlasCount: atlas.length,
    pairings: works.length * atlas.length,
    ruler: { top, median: rulerMedian, max: siblingScores[0] ?? 0 },
    atMedian: screened.filter((w) => w.top >= rulerMedian).length,
  }
}

/** Where the queue is cut for reading. Not a threshold on the world — a reading aid, and the
 *  page says so: everything below it is unexamined exactly as everything above it is. */
export const LOOK_FIRST = 12
