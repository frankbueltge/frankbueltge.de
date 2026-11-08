// src/lib/common-time/arrangement.ts — Common Time's rules, written a second time (2026-11-08,
// docs/design/2026-11-08-common-time.md).
//
// The renderer (scripts/common-time/press.py) decides who plays what in a week and writes the
// arrangement into src/data/common-time/<week>.json. This module decides it again, in TypeScript,
// from Common Ground's committed day files alone, so the guard test can hold every committed
// pressing to the published rule: a score that names a melody the rule would not pick turns red.
// Pure: no file system, no clock. Python's round() rounds halves to even, so `pyRound` does too.

export const FAMILIES = ['reading', 'search', 'news', 'social', 'tech', 'markets'] as const
export type Family = (typeof FAMILIES)[number]

/** What each family sounds as. Composed, the same every week. */
export const INSTRUMENT: Record<Family, string> = {
  reading: 'vibraphone',
  search: 'electric piano',
  news: 'soft pad',
  social: 'marimba',
  tech: 'bell',
  markets: 'pluck',
}

/** Which platform belongs to which family. A publisher that is no platform is an outlet behind
 *  Google News, so it falls to `news`. */
export const PLATFORM_FAMILY: Record<string, Family> = {
  wikipedia: 'reading',
  google_trends: 'search',
  google_news: 'news',
  bluesky: 'social',
  mastodon: 'social',
  reddit: 'social',
  hackernews: 'tech',
  techmeme: 'tech',
  lobsters: 'tech',
  github: 'tech',
  github_trending: 'tech',
  pypi: 'tech',
  huggingface: 'tech',
  devto: 'tech',
  arxiv: 'tech',
  producthunt: 'tech',
  stackoverflow: 'tech',
  polymarket: 'markets',
  appstore: 'markets',
  steam: 'markets',
  coingecko: 'markets',
}
export const FALLBACK_FAMILY: Family = 'news'

/** The pentatonic F G A C D, and the vowels that land on it: ut re mi sol la. */
export const STEP_NAMES = ['F', 'G', 'A', 'C', 'D'] as const
export const VOWEL_STEP: Record<string, number> = { u: 0, e: 1, i: 2, o: 3, a: 4 }
export const MOTIF_MAX = 8
export const DAY_BARS = 8
export const SLOTS_PER_DAY = DAY_BARS * 16

/** [scale step, length in eighths] */
export type MotifNote = [number, number]

export const familyOf = (publisher: string): Family => PLATFORM_FAMILY[publisher] ?? FALLBACK_FAMILY

/** Python's round(): halves go to the even neighbour. */
export function pyRound(x: number): number {
  const floor = Math.floor(x)
  const diff = x - floor
  if (diff > 0.5) return floor + 1
  if (diff < 0.5) return floor
  return floor % 2 === 0 ? floor : floor + 1
}

/** A topic's melody is its name: one note per vowel, a word's last vowel held twice as long. */
export function motif(label: string): MotifNote[] {
  const text = label
    .normalize('NFKD')
    .replace(/[^\x00-\x7f]/g, '')
    .toLowerCase()
  const notes: MotifNote[] = []
  for (const word of text.match(/[a-z]+/g) ?? []) {
    const steps = [...word].filter((c) => c in VOWEL_STEP).map((c) => VOWEL_STEP[c]!)
    steps.forEach((step, i) => notes.push([step, i === steps.length - 1 ? 2 : 1]))
  }
  return (notes.length ? notes : [[0, 2] as MotifNote]).slice(0, MOTIF_MAX)
}

/** "C C G G A A" */
export const motifNames = (m: readonly MotifNote[]): string => m.map(([step]) => STEP_NAMES[step]).join(' ')

export interface LedgerTopic {
  id: string
  label: string
  links: { publisher: string }[]
}

export interface DayTopic {
  id: string
  rank: number
  families: Family[]
}

export function topicsOf(topics: readonly LedgerTopic[]): DayTopic[] {
  return topics.map((tp, rank) => {
    const families = [...new Set(tp.links.map((l) => familyOf(l.publisher)))]
    families.sort((a, b) => FAMILIES.indexOf(a) - FAMILIES.indexOf(b))
    return { id: tp.id, rank, families }
  })
}

export interface Plan {
  theme: string | null
  themeDays: number
  /** day → the id of its melody */
  melody: Record<string, string>
}

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** The theme is the topic on the most days; each day's melody is its most converged other topic. */
export function arrange(days: readonly { day: string; topics: readonly DayTopic[] }[]): Plan {
  const present = new Map<string, { days: number; families: number; first: string }>()
  for (const d of days) {
    for (const tp of d.topics) {
      const p = present.get(tp.id) ?? { days: 0, families: 0, first: d.day }
      p.days += 1
      p.families += tp.families.length
      present.set(tp.id, p)
    }
  }
  if (present.size === 0) return { theme: null, themeDays: 0, melody: {} }
  const theme = [...present.keys()].sort((a, b) => {
    const pa = present.get(a)!
    const pb = present.get(b)!
    return pb.days - pa.days || pb.families - pa.families || cmp(pa.first, pb.first) || cmp(a, b)
  })[0]!
  const melody: Record<string, string> = {}
  for (const d of days) {
    const others = d.topics.filter((tp) => tp.id !== theme)
    if (!others.length) continue
    melody[d.day] = [...others].sort(
      (a, b) =>
        b.families.length - a.families.length ||
        present.get(b.id)!.days - present.get(a.id)!.days ||
        a.rank - b.rank,
    )[0]!.id
  }
  return { theme, themeDays: present.get(theme)!.days, melody }
}

/** Every converging topic that is neither theme nor melody, at its sixteenth in the day. */
export function ornamentSlots(topics: readonly DayTopic[], plan: Plan, day: string): { id: string; slot: number }[] {
  const rest = topics.filter((tp) => tp.id !== plan.theme && tp.id !== plan.melody[day])
  return rest.map((tp, k) => ({ id: tp.id, slot: pyRound(((k + 0.5) * SLOTS_PER_DAY) / rest.length) % SLOTS_PER_DAY }))
}

/** How many crowd ticks a bar carries: the day's signals against the archive's most. */
export const crowdPerBar = (signals: number, signalsMax: number): number =>
  signals <= 0 ? 0 : Math.max(1, pyRound((16 * signals) / signalsMax))
