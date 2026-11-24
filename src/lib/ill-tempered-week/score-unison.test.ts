// Unison's score, held to the renderer it mirrors and to every complete album on file. These tests also run in the
// nightly press before a pressing is committed, so each states what any correct pressing satisfies.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums, standingUnison, type Unison } from './albums'
import { CHORD_HARMONICS, harmonicOf } from './score'
import { describeGlide, describeUnisonDay, FORM, glideHz, glideTimes, hornsAt, layoutUnison, nowUnison, unisonScore } from './score-unison'

const SOURCE = readFileSync('scripts/ill-tempered-week/itw/unison.py', 'utf8')
// a Unison pressed in the week's form has a score of its own (score-forms.test.ts)
const albums = readAlbums().filter((a) => standingUnison(a.pieces.unison))
// Contrapunctus 47 pressed again locally under the rule of 2026-11-23 (itw/progression.py): with the stretto its
// verdict adds, and with all six devices, the second subject from Contrapunctus 46
const fixture = (name: string): Unison => JSON.parse(readFileSync(`src/lib/ill-tempered-week/fixtures/devices-2026-W47-${name}.json`, 'utf8'))
const STRETTO = fixture('unison-stretto')
const SIX = fixture('unison-six')

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

/** What any pressing of Unison satisfies, as its score. */
function holds(title: string, u: Unison, week: string) {
  describe(title, () => {
    const s = unisonScore(u, week)
    const dev = new Set(u.devices ?? [])

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
        // rounds both pitches to a tenth of a hertz and the agreement to a thousandth, which is the tolerance. Under
        // the retrograde the glissando runs the other way: from where the agreement takes it back to its own pitch
        const [own, landed] = dev.has('retrograde') ? [g.toHz, g.fromHz] : [g.fromHz, g.toHz]
        const expected = own * (g.chord!.hz / own) ** d.agreement
        const rounding = Math.log2(1 + 0.05 / landed) + Math.log2(1 + 0.05 / own) + 0.001
        expect(Math.abs(Math.log2(landed / expected)), g.id).toBeLessThan(rounding)
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

    it('lets each glissando last as long as the record says, or the form where it says nothing', () => {
      u.days.forEach((d, i) => {
        d.events.forEach((e, k) => {
          const g = s.glides.find((x) => x.id === `g-${i}-${k}`)!
          const dur = e.dur_s ?? FORM.baseSeconds + FORM.perAttention * e.attention
          expect(g.t1 - g.t0).toBeCloseTo(FORM.glide * dur, 2)
          expect(g.t2 - g.t0).toBeCloseTo(dur + 0.4, 2)
        })
      })
    })
  })
}

describe('every complete album on file, as its score', () => {
  for (const a of albums) holds(a.title, a.pieces.unison as Unison, a.week)
})

describe('Contrapunctus 47 under the devices, as its score', () => {
  holds('with the stretto', STRETTO, '2026-W47')
  holds('with all six devices', SIX, '2026-W47')
})

describe('the devices, as the renderer plays them and the score draws them', () => {
  it('mirrors the renderer', () => {
    expect(SOURCE).toMatch(/^SECOND_EIGHTH_S = 0\.2 \* 4 /m)
    expect(SOURCE).toMatch(/^STRETTO_FROM = 2 \/ 3 /m)
    expect(SOURCE).toContain("UPPER, LOWER = ('violins', 'violas'), ('cellos', 'basses')")
    expect(SOURCE).toContain("rank = 1.0 - s['attention'] if 'inversion' in dev else s['attention']")
  })

  const section = (rank: number): string => (rank >= 0.75 ? 'violins' : rank >= 0.5 ? 'violas' : rank >= 0.25 ? 'cellos' : 'basses')

  it('turns the sections round under the inversion, and keeps them otherwise', () => {
    for (const d of SIX.days) for (const e of d.events) expect(e.section, e.text).toBe(section(1 - e.attention))
    for (const d of STRETTO.days) for (const e of d.events) expect(e.section, e.text).toBe(section(e.attention))
  })

  it('records every glissando’s length: twice as long in the upper strings, a third in the lower', () => {
    for (const d of SIX.days) {
      for (const e of d.events) {
        const base = FORM.baseSeconds + FORM.perAttention * e.attention
        expect(e.dur_s!, e.text).toBeCloseTo(['violins', 'violas'].includes(e.section) ? 2 * base : base / 3, 2)
      }
    }
    for (const d of STRETTO.days) for (const e of d.events) expect(e.dur_s!).toBeCloseTo(FORM.baseSeconds + FORM.perAttention * e.attention, 2)
  })

  it('presses every entry into the last third before the peak under the stretto', () => {
    for (const u of [STRETTO, SIX]) {
      const s = unisonScore(u, '2026-W47')
      for (const g of s.glides) {
        const d = s.days[g.day]!
        expect(g.t0, g.id).toBeGreaterThanOrEqual(d.from + 1.0 + (2 / 3) * (FORM.peak - 2.0) - 0.3 - 0.01)
      }
    }
  })

  it('plays the second subject in the horns before each peak, and draws and names it', () => {
    const s = unisonScore(SIX, '2026-W47')
    expect(s.secondFrom?.week).toBe('2026-W46')
    for (const d of s.days) {
      expect(d.second.length, d.day).toBeGreaterThan(0)
      for (const n of d.second) {
        expect(n.t).toBeGreaterThanOrEqual(d.from + 1.0 - 0.001)
        expect(n.t).toBeLessThan(d.last ? d.bassAt : d.peakAt)
        expect(n.hz).toBeGreaterThanOrEqual(110)
        expect(n.hz).toBeLessThanOrEqual(440)
      }
      expect(hornsAt(d, d.second[0]!.t + 0.01)).toBe(true)
      expect(nowUnison(s, d.second[0]!.t + 0.01)).toMatch(/second subject/)
      expect(describeUnisonDay(s, d.index, 'second').body).toContain('Contrapunctus 46')
    }
    const drawn = layoutUnison(s, 960).lines.flatMap((l) => l.horns.flatMap((h) => h.notes))
    expect(drawn.length).toBe(s.days.reduce((n, d) => n + d.second.length, 0))
    expect(unisonScore(STRETTO, '2026-W47').days.every((d) => d.second.length === 0)).toBe(true)
  })

  it('cuts a glissando that runs on into the next line where that line begins, at the pitch it has reached', () => {
    // the augmentation's slower glissandi can run into the next day, and at a phone's width into the next line
    const s = unisonScore(SIX, '2026-W47')
    const l = layoutUnison(s, 358)
    let cut = 0
    l.lines.slice(1).forEach((line, k) => {
      const before = l.lines[k]!
      for (const g of line.glides) {
        const prev = before.glides.find((x) => x.id === g.id)
        if (!prev) continue
        cut++
        expect(g.x1, g.id).toBeCloseTo(l.frame.left, 0)
        // the same pitch on both sides of the break, each line in its own plot
        expect(g.y1 - line.plotTop, g.id).toBeCloseTo(prev.y2 - before.plotTop, 0)
      }
    })
    expect(cut).toBeGreaterThan(0)
    expect(glideHz({ t0: 10, t1: 14, fromHz: 110, toHz: 440 }, 12)).toBeCloseTo(220, 6)
    expect(glideHz({ t0: 10, t1: 14, fromHz: 110, toHz: 440 }, 20)).toBe(440)
  })
})

describe('a record that holds the bass and the sentence (pressed from 2026-11-14 on)', () => {
  it('draws the bass’s own notes and the sentence’s own length', () => {
    const a = albums[0]
    if (!a) return
    const u = a.pieces.unison as Unison
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
