// src/lib/ill-tempered-week/reverb.ts — the press's reverb, again (2026-11-14). The renderer sends the ensemble and
// the voice through pedalboard's Reverb, which is JUCE's, which is Freeverb (Jezar at Dreampoint, public domain): eight
// feedback delays side by side, then four allpass delays in a row, per channel, fed with the two channels' sum. It is
// a fixed network, so its whole effect is its answer to one impulse; a browser's convolver, given that answer, is the
// same reverb. Pure and browser-free; reverb.test.ts holds it to the press's own reverb (fixtures/reverb.json,
// written by scripts/ill-tempered-week/rooms.py).

export interface ReverbSettings {
  /** as the renderer names them: room_size, damping, wet_level, dry_level, width */
  room: number
  damping: number
  wet: number
  dry: number
  width: number
}

/** The delays' lengths in samples at 44.1 kHz, and how much longer the right channel's are. */
const COMBS = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617]
const ALLPASSES = [556, 441, 341, 225]
const SPREAD = 23
/** What the reverb takes of the two channels' sum, and its fixed factors on room, damping, wet and dry. */
const INPUT = 0.015
const ROOM = { scale: 0.28, offset: 0.7 }
const DAMP = 0.4
const WET = 3
const DRY = 2

/** What the reverb multiplies the direct sound by. */
export const dryGain = (s: ReverbSettings): number => s.dry * DRY

/** The reverb's answer to one unit of the two channels' sum, without the direct sound: left and right, `seconds`
 *  long at `rate`. */
export function reverbResponse(s: ReverbSettings, rate: number, seconds: number): [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] {
  const n = Math.round(seconds * rate)
  const damp = s.damping * DAMP
  const feedback = s.room * ROOM.scale + ROOM.offset
  const size = (tuning: number): number => Math.max(1, Math.floor((Math.floor(rate) * tuning) / 44100))
  const channel = (spread: number): Float32Array<ArrayBuffer> => {
    const out = new Float32Array(n)
    for (const tuning of COMBS) {
      const buffer = new Float32Array(size(tuning + spread))
      let at = 0
      let last = 0
      for (let i = 0; i < n; i++) {
        const output = buffer[at]!
        last = output * (1 - damp) + last * damp
        buffer[at] = (i === 0 ? INPUT : 0) + last * feedback
        at = (at + 1) % buffer.length
        out[i] = out[i]! + output
      }
    }
    for (const tuning of ALLPASSES) {
      const buffer = new Float32Array(size(tuning + spread))
      let at = 0
      for (let i = 0; i < n; i++) {
        const input = out[i]!
        const held = buffer[at]!
        buffer[at] = input + held * 0.5
        at = (at + 1) % buffer.length
        out[i] = held - input
      }
    }
    return out
  }
  const l = channel(0)
  const r = channel(SPREAD)
  const wet1 = 0.5 * s.wet * WET * (1 + s.width)
  const wet2 = 0.5 * s.wet * WET * (1 - s.width)
  const left = new Float32Array(n)
  const right = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    left[i] = l[i]! * wet1 + r[i]! * wet2
    right[i] = r[i]! * wet1 + l[i]! * wet2
  }
  return [left, right]
}
