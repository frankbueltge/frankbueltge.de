// Turn's score: every bar rebuilt from the record and the renderer's form, and held to the days' recorded starts and
// the piece's length. These tests also run in the nightly press before a pressing is committed.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums, type Turn } from './albums'
import { barAt, beatsOf, euclid, FORM, layoutTurn, measure, nowTurn, phaseInBar, turnScore } from './score-turn'

const SOURCE = readFileSync('scripts/ill-tempered-week/itw/turn.py', 'utf8')
const albums = readAlbums().filter((a) => a.pieces.turn)

describe('the renderer’s form, as the score mirrors it', () => {
  it('starts, glides and turns where the score does', () => {
    expect(SOURCE).toMatch(new RegExp(`^    t = ${FORM.start.toFixed(1)}$`, 'm'))
    expect(SOURCE).toContain('L = prev_len + (length - prev_len) * min(1.0, u * 2)')
    expect(SOURCE).toContain(`bars.append((t, length * ${FORM.saidBars}, i, 'said'))`)
    expect(SOURCE).toContain(`fams = [f for f in (${FORM.voiced.map((f) => `'${f}'`).join(', ')}) if d['families'].get(f) or kind == 'all']`)
    expect(SOURCE).toContain(`k = h if kind == 'all' else min(h, d['families'].get(f, 0))`)
    expect(SOURCE).toContain(`mix = mix[:, :int((end + ${FORM.tail}) * SR)]`)
    expect(SOURCE).toContain(`tail = np.arange(int(${FORM.lowA.toFixed(1)} * SR)) / SR`)
  })

  it('spreads beats as Toussaint’s euclidean rhythm, the same steps as the renderer', () => {
    expect(SOURCE).toContain('return sorted({(i * n) // k for i in range(k)}) if k > 0 else []')
    expect(euclid(3, 9)).toEqual([0, 3, 6])
    expect(euclid(1, 5)).toEqual([0])
    expect(euclid(0, 5)).toEqual([])
    expect(euclid(5, 5)).toEqual([0, 1, 2, 3, 4])
    expect(euclid(4, 7)).toEqual([0, 1, 3, 5])
  })
})

describe('every complete album on file, as its score', () => {
  for (const a of albums) {
    describe(a.title, () => {
      const r = a.pieces.turn!
      const s = turnScore(r, a.week)

      it('rebuilds every bar so that each day ends where the next begins, and the piece where its record ends', () => {
        s.days.forEach((d, i) => {
          if (i + 1 < s.days.length) expect(d.end).toBeCloseTo(s.days[i + 1]!.from, 1)
        })
        expect(s.end + FORM.tail).toBeCloseTo(r.seconds, 1)
        expect(s.bars.filter((b) => b.kind === 'bar')).toHaveLength(r.days.length * r.bars_per_day)
      })

      it('turns once at most, with its full bar and its silent one', () => {
        const turned = s.days.filter((d) => d.turn)
        expect(turned.length).toBeLessThanOrEqual(1)
        expect(s.bars.filter((b) => b.kind === 'all')).toHaveLength(turned.length)
        for (const b of s.bars.filter((x) => x.kind === 'all')) expect(b.beats.every((x) => x.k === x.h)).toBe(true)
      })

      it('voices only search, news, social and tech, each at most its harmonic number of beats', () => {
        for (const b of s.bars) {
          for (const beat of b.beats) {
            expect(FORM.voiced).toContain(beat.family)
            expect(beat.k).toBeLessThanOrEqual(beat.h)
            expect(beat.steps).toHaveLength(beat.k)
          }
        }
      })

      it('says something true at every moment', () => {
        for (let t = 0; t < r.seconds; t += 0.5) expect(nowTurn(s, t).length).toBeGreaterThan(10)
      })

      it('lays out on one line wide and in several on a phone', () => {
        expect(layoutTurn(s, 960).lines).toHaveLength(1)
        const phone = layoutTurn(s, 358)
        expect(phone.lines.length).toBeGreaterThan(1)
        const bars = new Set(phone.lines.flatMap((l) => l.cells.map((c) => c.bar)))
        for (const b of s.bars.filter((x) => x.kind !== 'said' && x.beats.length > 0)) expect(bars.has(b.index), String(b.index)).toBe(true)
      })
    })
  }
})

describe('a day the record does not have yet', () => {
  const day = (over: Partial<Turn['days'][number]>): Turn['days'][number] => ({ day: '2026-11-16', signals: 0, families: {}, bar_s: 2.4, turn: false, said: null, from_s: 1.0, ...over })
  const record = (days: Turn['days']): Turn => ({
    field: 'ai', bars_per_day: 10, harmonics: { search: 5, news: 6, social: 7, tech: 9, reading: 4, markets: 11 }, days,
    audio: '', seconds: 30, lufs: null, true_peak_dbtp: -1.1, float32_sha256: '',
  })

  it('draws a silent day, and a day of reading and markets only, without failing', () => {
    const s = turnScore(record([day({}), day({ day: '2026-11-17', signals: 3, families: { reading: 2, markets: 1 }, from_s: 25 })]), '2026-W47')
    expect(s.bars.every((b) => b.beats.length === 0)).toBe(true)
    expect(s.days[1]!.unvoiced).toEqual([{ family: 'reading', count: 2 }, { family: 'markets', count: 1 }])
    expect(layoutTurn(s, 358).lines.length).toBeGreaterThanOrEqual(1)
    expect(nowTurn(s, 3)).toContain('no family sounds')
  })

  it('caps a family at its harmonic number', () => {
    expect(beatsOf({ search: 12 }, { search: 5, news: 6, social: 7, tech: 9 }, false)).toEqual([{ family: 'search', h: 5, k: 5, steps: [0, 1, 2, 3, 4] }])
  })

  it('draws a measure with a row for every voiced family, sounding or not', () => {
    const s = turnScore(record([day({ signals: 2, families: { tech: 2 } })]), '2026-W47')
    const m = measure(s.days[0]!.voiced, 300)
    expect(m.rows.map((r) => r.cells.length)).toEqual([5, 6, 7, 9])
    expect(m.rows[3]!.cells.filter((c) => c.on)).toHaveLength(2)
    const b = barAt(s, 1.5)!
    expect(phaseInBar(b, 1.5)).toBeCloseTo(0.5 / 2.4, 6)
  })
})
