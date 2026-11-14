// Unison's score, held to the renderer it mirrors and to every complete album on file. These tests also run in the
// nightly press before a pressing is committed, so each states what any correct pressing satisfies.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums } from './albums'
import { CHORD_HARMONICS, harmonicOf } from './score'
import { describeGlide, describeUnisonDay, FORM, glideTimes, layoutUnison, nowUnison, unisonScore } from './score-unison'

const SOURCE = readFileSync('scripts/ill-tempered-week/itw/unison.py', 'utf8')
const albums = readAlbums().filter((a) => a.pieces.unison)

describe('the renderer’s form, as the score mirrors it', () => {
  it('has the day, the intro and the peak the score assumes', () => {
    expect(SOURCE).toMatch(new RegExp(`^INTRO_S = ${FORM.intro.toFixed(1)}$`, 'm'))
    expect(SOURCE).toMatch(new RegExp(`^PEAK_S = ${FORM.peak.toFixed(1)}$`, 'm'))
    expect(SOURCE).toMatch(/^DAY_S = 36\.0$/m)
    expect(SOURCE).toContain(`if agree >= ${FORM.threshold} and not last:`)
  })

  it('lets a glissando last, glide and die away as the score draws it', () => {
    expect(SOURCE).toContain(`dur = ${FORM.baseSeconds.toFixed(1)} + ${FORM.perAttention.toFixed(1)} * s['attention']`)
    expect(SOURCE).toContain(`${FORM.glide} * dur, vel, release=0.2 * dur + 0.4`)
  })

  it('places the roll, the brass, the sentence and the bass where the score does', () => {
    expect(SOURCE).toContain(`peak - ${FORM.rollBefore.toFixed(1)}, pan(get('TimpaniRolls').note(110.0, ${FORM.roll.toFixed(1)}`)
    expect(SOURCE).toContain(`note(hz, ${FORM.brass.toFixed(1)}, int(30 + 70 * agree)`)
    expect(SOURCE).toContain(`put(voice, peak + ${FORM.saidAfter}, `)
    expect(SOURCE).toContain(`solo_at = (t0 + DAY_S - ${FORM.bassBeforeEnd}) if last else (peak + ${FORM.bassAfterPeak})`)
    expect(SOURCE).toContain(`end = int((INTRO_S + 7 * DAY_S + ${FORM.tail.toFixed(1)}) * SR)`)
  })
})

describe('every complete album on file, as its score', () => {
  for (const a of albums) {
    describe(a.title, () => {
      const u = a.pieces.unison!
      const s = unisonScore(u, a.week)

      it('enters every glissando inside its own day, at its hour, between a second and a day’s peak', () => {
        s.days.forEach((d) => {
          for (const g of s.glides.filter((x) => x.day === d.index)) {
            expect(g.t0, g.id).toBeGreaterThanOrEqual(d.from + 1.0 - 0.3 - 0.01)
            expect(g.t0, g.id).toBeLessThanOrEqual(d.from + 1.0 + (FORM.peak - 2.0) + 0.3 + 0.01)
          }
        })
      })

      it('ends where the form ends it, and reads recorded day starts where the album has them', () => {
        expect(u.seconds).toBeCloseTo(FORM.intro + u.days.length * u.day_s + FORM.tail, 1)
        u.days.forEach((d, i) => {
          if (d.from_s !== undefined) expect(d.from_s).toBeCloseTo(FORM.intro + i * u.day_s, 1)
          if (d.bass_from_s !== undefined) expect(d.bass_from_s).toBeCloseTo(s.days[i]!.last ? s.days[i]!.end - FORM.bassBeforeEnd : s.days[i]!.peakAt + FORM.bassAfterPeak, 1)
        })
      })

      it('heads every glissando for a tone of A’s harmonic chord, and lands it as far as the press agreed', () => {
        for (const g of s.glides) {
          expect(g.chord, g.id).not.toBeNull()
          expect(harmonicOf(g.chord!.hz, CHORD_HARMONICS)).not.toBeNull()
          const d = s.days[g.day]!
          // the arrival is the start moved towards the chord tone by the agreement, in pitch (log) space; the record
          // rounds both pitches to a tenth of a hertz and the agreement to a thousandth, which is the tolerance
          const expected = g.fromHz * (g.chord!.hz / g.fromHz) ** d.agreement
          const rounding = Math.log2(1 + 0.05 / g.toHz) + Math.log2(1 + 0.05 / g.fromHz) + 0.001
          expect(Math.abs(Math.log2(g.toHz / expected)), g.id).toBeLessThan(rounding)
        }
      })

      it('gives the bass every day: after the peak’s moment, on the last day before its end', () => {
        for (const d of s.days) {
          expect(d.bassAt).toBeCloseTo(d.last ? d.end - FORM.bassBeforeEnd : d.peakAt + FORM.bassAfterPeak, 6)
          expect(describeUnisonDay(s, d.index, 'bass').body).toContain(d.overlooked)
        }
      })

      it('says something true at every moment, and of every glissando', () => {
        for (let t = 0; t < u.seconds; t += 0.9) expect(nowUnison(s, t).length).toBeGreaterThan(10)
        for (const g of s.glides) expect(describeGlide(s, g.id)!.body).toContain(g.text)
      })

      it('lays out in lines that cover the piece, one line exactly when it fits, every glissando inside the plot', () => {
        for (const width of [960, 358]) {
          const l = layoutUnison(s, width)
          expect(l.lines.length === 1).toBe((l.frame.right - l.frame.left) / u.seconds >= 2.0)
          expect(l.lines[0]!.span.t0).toBe(0)
          expect(l.lines.at(-1)!.span.t1).toBe(u.seconds)
          const drawn = new Set<string>()
          for (const line of l.lines) {
            for (const g of line.glides) {
              drawn.add(g.id)
              for (const yy of [g.y1, g.y2]) {
                expect(yy).toBeGreaterThanOrEqual(line.plotTop)
                expect(yy).toBeLessThanOrEqual(line.plotBottom)
              }
              expect(g.x1).toBeGreaterThanOrEqual(l.frame.left - 0.1)
              expect(g.x3).toBeLessThanOrEqual(width + 0.1)
            }
          }
          for (const g of s.glides) expect(drawn.has(g.id), g.id).toBe(true)
        }
      })
    })
  }
})

describe('a record that holds the bass and the sentence (pressed from 2026-11-14 on)', () => {
  it('draws the bass’s own notes and the sentence’s own length', () => {
    const a = albums[0]
    if (!a) return
    const u = a.pieces.unison!
    const d0 = u.days[0]!
    // the values the renderer recorded for Monday of 2026-W45 when it was pressed again locally with this change
    const recorded = { ...u, days: [{ ...d0, from_s: 2.0, said_s: 8.155, bass_from_s: 31.5, bass: [{ t: 0, hz: 82.8, s: 0.2 }, { t: 0.138, hz: 108, s: 0.2 }] }, ...u.days.slice(1)] }
    const s = unisonScore(recorded, a.week)
    expect(s.days[0]!.bass).toEqual([{ t: 31.5, hz: 82.8, s: 0.2 }, { t: 31.638, hz: 108, s: 0.2 }])
    expect(s.days[0]!.saidSeconds).toBe(8.155)
    const line = layoutUnison(s, 960).lines[0]!
    expect(line.bass.find((b) => b.day === 0)!.notes).toHaveLength(2)
  })
})

describe('a glissando’s times', () => {
  it('lasts 5 s plus 4 s a unit of attention, glides over 0.8 of it and dies away after', () => {
    expect(glideTimes(10, 0)).toEqual([10, 14, 15.4])
    expect(glideTimes(10, 1)).toEqual([10, 17.2, 19.4])
  })
})
