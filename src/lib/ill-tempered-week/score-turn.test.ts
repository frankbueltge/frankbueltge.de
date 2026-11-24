// Turn's score: every bar rebuilt from the record and the renderer's form, and held to the days' recorded starts and
// the piece's length. These tests also run in the nightly press before a pressing is committed.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums, standingTurn, type Turn } from './albums'
import { barAt, beatsOf, describeBar, euclid, FORM, layoutTurn, measure, nowTurn, phaseInBar, turnScore } from './score-turn'

const SOURCE = readFileSync('scripts/ill-tempered-week/itw/turn.py', 'utf8')
// a Turn pressed in the week's form has a score of its own (score-forms.test.ts)
const albums = readAlbums().filter((a) => standingTurn(a.pieces.turn))
// Contrapunctus 47 pressed again locally under the rule of 2026-11-23 (itw/progression.py): with the stretto its
// verdict adds, and with all six devices, the second subject from Contrapunctus 46
const fixture = (name: string): Turn => JSON.parse(readFileSync(`src/lib/ill-tempered-week/fixtures/devices-2026-W47-${name}.json`, 'utf8'))
const STRETTO = fixture('turn-stretto')
const SIX = fixture('turn-six')

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

/** What any pressing of Turn satisfies, as its score. */
function holds(title: string, r: Turn, week: string) {
  describe(title, () => {
    const s = turnScore(r, week)

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

    it('lays out in lines that cover the piece, one line exactly when it fits, every sounding bar drawn', () => {
      for (const width of [960, 358]) {
        const l = layoutTurn(s, width)
        expect(l.lines.length === 1).toBe((l.frame.right - l.frame.left) / r.seconds >= 3.0)
        expect(l.lines[0]!.span.t0).toBe(0)
        expect(l.lines.at(-1)!.span.t1).toBe(r.seconds)
        const bars = new Set(l.lines.flatMap((line) => line.cells.map((c) => c.bar)))
        for (const b of s.bars.filter((x) => x.kind !== 'said' && x.beats.length > 0)) expect(bars.has(b.index), String(b.index)).toBe(true)
      }
    })
  })
}

describe('every complete album on file, as its score', () => {
  for (const a of albums) holds(a.title, a.pieces.turn as Turn, a.week)
})

describe('Contrapunctus 47 under the devices, as its score', () => {
  holds('with the stretto', STRETTO, '2026-W47')
  holds('with all six devices', SIX, '2026-W47')
})

describe('the devices, as the renderer plays them and the score draws them', () => {
  it('mirrors the renderer', () => {
    expect(SOURCE).toMatch(/^UTONAL = 45 /m)
    expect(SOURCE).toMatch(/^SECOND_AT = 0\.5 /m)
    expect(SOURCE).toContain('return base.F0 * UTONAL / HARM[f] * 2 ** octave if \'inversion\' in dev else base.hz_of(f, octave)')
  })

  it('moves every family to its undertone under the inversion, and keeps the overtones otherwise', () => {
    const six = turnScore(SIX, '2026-W47')
    expect(SIX.utonal).toBe(45)
    expect(six.rows.map((r) => r.hz)).toEqual([495, 412.5, 353.571, 275])
    expect(turnScore(STRETTO, '2026-W47').rows.map((r) => r.hz)).toEqual([275, 330, 385, 495])
  })

  it('strikes the second subject on a bell half a bar into every bar that sounds, and draws it in its strip', () => {
    const s = turnScore(SIX, '2026-W47')
    const sounding = s.bars.filter((b) => b.kind !== 'said')
    expect(s.bells).toHaveLength(sounding.length)
    sounding.forEach((b, k) => {
      // the bell's time is the renderer's, the bar the score's rebuilding of it: they agree as the days' starts do
      expect(s.bells[k]!.t).toBeCloseTo(b.t0 + 0.5 * b.len, 1)
      expect(s.bells[k]!.day).toBe(b.day)
      expect(s.bells[k]!.hz).toBeGreaterThanOrEqual(330)
      expect(s.bells[k]!.hz).toBeLessThanOrEqual(1320)
    })
    // one bell a bar, through the motif of Contrapunctus 46's last day note by note, round and round
    const motif = SIX.second!.motif
    s.bells.slice(0, motif.length).forEach((b, k) => {
      let hz = motif[k]!.hz
      while (hz > 1320) hz /= 2
      while (hz < 330) hz *= 2
      expect(b.hz).toBeCloseTo(hz, 0)
    })
    for (const width of [960, 358]) {
      const l = layoutTurn(s, width)
      expect(l.lines.reduce((n, line) => n + line.bells.length, 0)).toBe(s.bells.length)
      for (const line of l.lines) expect(line.bellsY).not.toBeNull()
    }
    const bar = sounding.find((b) => b.kind === 'bar')!
    expect(describeBar(s, bar.index)!.body).toContain('Contrapunctus 46')
    expect(nowTurn(s, bar.t0 + 0.01)).toContain('undertones')
    const plain = turnScore(STRETTO, '2026-W47')
    expect(plain.bells).toHaveLength(0)
    for (const line of layoutTurn(plain, 960).lines) expect(line.bellsY).toBeNull()
  })
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
