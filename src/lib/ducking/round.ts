// src/lib/ducking/round.ts — a round of Ducking (2026-11-01; docs/design/2026-11-01-ducking.md).
//
// A round seats the matters of one briefing of the Middle (research-ecology `briefings/`), pinned to
// the commit it was written in. It is committed data, never fetched: each matter's strip label, the
// terms the count matches, what its voice reads and where that comes from. `say` is what the voice
// is given when the written line would be read wrongly ("9,277"); the page always shows `text`.
//
// The voices are rendered once per round by scripts/ducking/voices.py into public/ducking/<round>/.
// Their words are fixed until the next render; the faders are not, they move with the ledger.
import raw from '@/data/ducking/rounds/after-cycle-011.json'

export interface Line {
  text: string
  say?: string
}

export interface Channel {
  id: string
  /** what stands on the strip; short enough for a narrow fader */
  strip: string
  title: string
  /** what the count matches in Common Ground's day files, by Third Reading's rule (src/lib/reading/attention.ts) */
  terms: string[]
  /** what a matching signal must not name to count — a term's known false friends */
  exclude?: string[]
  voice: string
  lines: Line[]
  sources: { label: string; url: string }[]
}

export interface Round {
  $contract: 'ducking-round/1'
  id: string
  briefing: { title: string; written: string; url: string }
  channels: Channel[]
  rest: { strip: string; voices: string[]; seed: number }
}

export const CURRENT_ROUND = raw as Round

/** What of the ecology's cycle file says which briefing is the newest. */
export interface CycleState {
  cycle: number
  convening?: { after_cycle: number; briefing?: unknown } | null
}

/** True once the ecology has written a briefing newer than the one a round seats. A round is written
 *  and rendered by hand, so the page has to be able to say that its words have fallen behind. */
export function roundBehind(roundId: string, state: CycleState): boolean {
  const seated = Number(/(\d+)$/.exec(roundId)?.[1])
  const newest = state.convening?.briefing ? state.convening.after_cycle : state.cycle - 1
  return newest > seated
}
