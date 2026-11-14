// The browser's reverb against the press's own: fixtures/reverb.json holds the answer of the press's two reverbs
// (pedalboard, as itw/overlooked.py sets them) to one unit in both channels, every 97th value and the energy.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { PLAY } from './perform-overlooked'
import { dryGain, reverbResponse, type ReverbSettings } from './reverb'

interface Measured {
  settings: ReverbSettings
  dry: number
  energy: [number, number]
  first: number
  left: number[]
  right: number[]
}
const fixture = JSON.parse(readFileSync('src/lib/ill-tempered-week/fixtures/reverb.json', 'utf8')) as { rate: number; seconds: number; every: number; hall: Measured; room: Measured }

describe('the reverb, built again for the browser', () => {
  for (const name of ['hall', 'room'] as const) {
    const measured = fixture[name]
    // one unit in both channels is two units of their sum
    const [left, right] = reverbResponse(measured.settings, fixture.rate, fixture.seconds).map((channel) => channel.map((v) => 2 * v)) as [Float32Array, Float32Array]

    it(`answers an impulse as the press’s ${name} does, value for value`, () => {
      for (const [mine, theirs] of [[left, measured.left], [right, measured.right]] as const) {
        expect(theirs.length).toBe(Math.ceil(mine.length / fixture.every))
        let worst = 0
        theirs.forEach((v, k) => (worst = Math.max(worst, Math.abs(mine[k * fixture.every]! - v))))
        expect(worst).toBeLessThan(2e-6)
      }
    })

    it(`has the ${name}’s energy, its first reflection and its direct sound`, () => {
      const energy = (x: Float32Array): number => x.reduce((sum, v) => sum + v * v, 0)
      expect(energy(left)).toBeCloseTo(measured.energy[0], 4)
      expect(energy(right)).toBeCloseTo(measured.energy[1], 4)
      expect(left.findIndex((v) => Math.abs(v) > 1e-9)).toBe(measured.first)
      expect(dryGain(measured.settings)).toBeCloseTo(measured.dry, 5)
    })

    it(`is the ${name} the performance plays`, () => {
      const { room, damping, wet, dry, width } = PLAY[name]
      expect({ room, damping, wet, dry, width }).toEqual(measured.settings)
    })
  }

  it('keeps the delays’ proportions at another rate, the first reflection at 25 ms', () => {
    const [left] = reverbResponse(fixture.hall.settings, 44100, 1)
    expect(left.findIndex((v) => Math.abs(v) > 1e-9)).toBe(1116)
  })
})
