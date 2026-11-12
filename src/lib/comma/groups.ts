// src/lib/comma/groups.ts — the six kinds of page Comma hears, and the tones they sound on (2026-11-13).
//
// Citizen Lab sorts the pages of its censorship test lists into some thirty categories. Comma groups them into six,
// a choice of this work, published here and on its page: politics, news and rights; identity, body and belief; the
// tools people speak with; culture and play; porn and gambling, kept apart so that a block of them is never heard
// as a block of political speech; and commerce with everything else. Each group sounds on one organ tone, a harmonic
// of A at 55 Hz — 4, 5, 6, 7, 9 and 11, the chord the ill-tempered week's families sing on. Interference is heard
// against that tone: the same recording, a syntonic comma (81/80) lower, so the two beat.

export const F0 = 55
/** The syntonic comma, downwards: the ratio the suspicion tone is played at against its group's tone. */
export const COMMA = 80 / 81
/** Seconds into each organ file that the loop runs between (scripts/comma/samples.py renders the loop twice, so
 *  any seven seconds of it loop without a seam; this window sits well inside). */
export const LOOP = { from: 3.5, to: 10.5 } as const

export interface Group {
  id: 'politics' | 'identity' | 'tools' | 'culture' | 'porn' | 'other'
  name: string
  harmonic: number
  categories: readonly string[]
}

export const GROUPS: readonly Group[] = [
  { id: 'politics', name: 'politics, news, rights', harmonic: 4, categories: ['NEWS', 'POLR', 'HUMR', 'GOVT', 'IGO', 'ENV', 'MILX', 'HATE', 'PUBH'] },
  { id: 'identity', name: 'identity, body, belief', harmonic: 5, categories: ['LGBT', 'REL', 'XED', 'PROV', 'DATE'] },
  { id: 'tools', name: 'tools for speaking', harmonic: 6, categories: ['ANON', 'COMT', 'GRP', 'HOST', 'SRCH', 'FILE', 'HACK', 'MMED'] },
  { id: 'culture', name: 'culture and play', harmonic: 7, categories: ['CULTR', 'GAME', 'ALDR'] },
  { id: 'porn', name: 'porn and gambling', harmonic: 9, categories: ['PORN', 'GMB'] },
  { id: 'other', name: 'commerce and other', harmonic: 11, categories: ['COMM', 'ECON', 'CTRL', 'MISC'] },
]

/** The last group takes every page the lists do not name, and every category they may add later. */
export const OTHER = GROUPS.length - 1

const INDEX = new Map<string, number>(GROUPS.flatMap((g, i) => g.categories.map((c) => [c, i] as [string, number])))

export function groupOf(category: string | null | undefined): number {
  return (category && INDEX.get(category.toUpperCase())) ?? OTHER
}

export function hzOf(group: number): number {
  const g = GROUPS[group] ?? GROUPS[OTHER]!
  return F0 * g.harmonic
}

/** The file each group's organ tone and bell are rendered to (public/comma/, scripts/comma/samples.py). */
export const organFile = (group: number): string => `/comma/organ-h${(GROUPS[group] ?? GROUPS[OTHER]!).harmonic}.mp3`
export const bellFile = (group: number): string => `/comma/bell-h${(GROUPS[group] ?? GROUPS[OTHER]!).harmonic}.mp3`
