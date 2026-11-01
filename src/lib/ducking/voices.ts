// src/lib/ducking/voices.ts — the book of a round's recordings: which sentence is spoken when (2026-11-01).
//
// scripts/ducking/voices.py writes public/ducking/<round>/voices.json next to the recordings. The
// desk reads it to know what each channel is saying at this moment, because a channel's words are
// shown as well as heard. Pure, so a test can hold it to the round.

export interface Cue {
  /** start, seconds into the loop */
  t: number
  /** duration, seconds */
  d: number
  text: string
  /** which of the rest's voices speaks it */
  v?: number
}

export interface VoiceFile {
  file: string
  /** seconds before the channel repeats */
  period: number
  /** a hash of the lines it was rendered from */
  digest?: string
  /** the power of its speech as rendered, in dB, the same on every channel */
  level: number
  cues: Cue[]
}

export interface RestFile extends VoiceFile {
  /** seconds of audio kept before and after the loop */
  margin: number
  from: string
  to: string
  voices: number
  /** what became of the week's distinct labels that name no matter */
  sample: { labels: number; long: number; stopped: number; unreadable: number; spoken: number }
}

export interface VoiceBook {
  round: string
  model: string
  channels: Record<string, VoiceFile>
  rest: RestFile
}

/** The cue spoken at a moment of a loop, or null in a pause. Cues are in order. */
export function cueAt(cues: readonly Cue[], t: number): Cue | null {
  let lo = 0
  let hi = cues.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const cue = cues[mid]!
    if (t < cue.t) hi = mid - 1
    else if (t >= cue.t + cue.d) lo = mid + 1
    else return cue
  }
  return null
}

/** How visible a cue is at a moment: it comes up and goes away instead of blinking. 0 to 1. */
export function cueEnvelope(cue: Cue, t: number, edge = 0.18): number {
  const into = t - cue.t
  const left = cue.d - into
  return Math.max(0, Math.min(1, into / edge, left / edge))
}

/** A stable place for a label on the screen, from its time alone. Both numbers 0 to 1. */
export function placeOf(cue: Cue): [number, number] {
  const n = Math.round(cue.t * 100)
  return [((n * 2654435761) % 4294967296) / 4294967296, ((n * 40503 * 65537 + 12345) % 4294967296) / 4294967296]
}
