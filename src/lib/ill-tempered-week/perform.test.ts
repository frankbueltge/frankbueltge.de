// How a browser plays a recorded note as the press does: the pick of a region, the rate, the gain. Held against the
// instruments cut for the browser (public/ill-tempered-week/instruments/index.json) and against picks the press's own
// sampler made on the whole instruments (checked for every one of the 952 distinct notes of both albums on
// 2026-11-14; the cases below are a sample of them, one per instrument).
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { afterTap, CENTRE, firstFrom, firstOrderHighpass, gainFor, keyHash, makeupFor, midiOf, neededRegions, peakFor, pickRegion, rateFor, soundingFor, type InstrumentIndex, type Region } from './perform'

const DIR = 'public/ill-tempered-week/instruments'
const index = JSON.parse(readFileSync(`${DIR}/index.json`, 'utf8')) as InstrumentIndex

describe('the instruments cut for the browser', () => {
  it('are the files the index names, byte for byte', () => {
    for (const [name, inst] of Object.entries(index.instruments)) {
      const file = `${DIR}/${inst.file}`
      expect(existsSync(file), name).toBe(true)
      const data = readFileSync(file)
      expect(data.length, name).toBe(inst.bytes)
      expect(createHash('sha256').update(data).digest('hex'), name).toBe(inst.sha256)
    }
  })

  it('lay their regions one after another inside the file, none over another', () => {
    for (const [name, inst] of Object.entries(index.instruments)) {
      let end = 0
      for (const r of inst.regions) {
        expect(r.at, `${name} ${r.sample}`).toBeGreaterThanOrEqual(end)
        expect(r.seconds).toBeGreaterThan(0)
        expect(r.hz).toBeGreaterThan(20)
        end = r.at + r.seconds
      }
      expect(end + index.lead + index.click).toBeLessThanOrEqual(inst.seconds + 0.2)
    }
  })

  it('say for every region what its mono cut lost against the two channels the press plays', () => {
    for (const [name, inst] of Object.entries(index.instruments)) {
      for (const r of inst.regions) {
        // never quieter than the two channels; above the root of two only where they partly cancel
        expect(r.mono, `${name} ${r.sample}`).toBeGreaterThanOrEqual(1)
        expect(r.mono, `${name} ${r.sample}`).toBeLessThan(2.5)
      }
    }
  })

  it('come from the library the albums name, under its own licence', () => {
    expect(index.library).toContain('VSCO 2 Community Edition')
    expect(index.library).toContain('CC0')
  })
})

describe('the pick of a region', () => {
  const picked = (instrument: string, hz: number, velocity: number): string => pickRegion(index.instruments[instrument]!.regions, hz, velocity, 'k').sample

  it('is the press’s own pick, for a note of every instrument', () => {
    expect(picked('TubularBells', 440, 70)).toBe('Percussion/TB_hit_G4_v4_rr1.wav')
    expect(picked('FluteSusVib', 660, 100)).toBe('Woodwinds/Flute/susvib/LDFlute_susvib_E4_v1_2.wav')
    expect(picked('BassoonSus', 206.25, 100)).toBe('Woodwinds/Bassoon/sus/PSBassoon_G2_v2_1.wav')
    expect(picked('UprightPiano', 178.76, 46)).toBe('Keys/Upright Piano/Player_dyn1_rr1_016.wav')
    expect(picked('CelloEnsSusVib', 110, 64)).toBe('Strings/Cello Section/susvib/susvib_B1_v3_1.wav')
    expect(picked('ContrabassSusVB', 44.69, 60)).toBe('Strings/Solo Contrabass/SusVib/BKCtbss_SusVib_F#0_v1_rr1.wav')
    expect(picked('OboeSusVib', 825, 100)).toBe('Woodwinds/Oboe/Vib/Oboe_Vib_A#4_v3_Main.wav')
    expect(picked('FHornSus', 302.5, 100)).toBe('Brass/F Horn/sus/MOHorn_sus_C3_v4_1.wav')
    expect(picked('TromboneSus', 206.25, 100)).toBe('Brass/Tenor Trombone/sus/tenortbn_sus_F2_v3_1.wav')
    expect(picked('SViolinVib', 825, 100)).toBe('Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_A5_f.wav')
    expect(picked('ClarinetSus', 440, 100)).toBe('Woodwinds/Clarinet/susLong/DCClar_susLong_A#3_v3_rr1_sum.wav')
    expect(picked('PiccoloSus', 1980, 100)).toBe('Woodwinds/Piccolo/Sus/piccolo_G6_sustain1.wav')
  })

  const region = (over: Partial<Region>): Region => ({ at: 0, seconds: 4, hz: 440, center: 69, lokey: 0, hikey: 127, lovel: 0, hivel: 127, volume: 0, release: 0.7, seq: 1, mono: 1, sample: 'a', ...over })

  it('takes the velocity’s layer, then the keys that hold the pitch, then the nearest in pitch', () => {
    const regions = [
      region({ sample: 'soft-a', lovel: 0, hivel: 62, center: 69, lokey: 68, hikey: 70 }),
      region({ sample: 'loud-a', lovel: 63, hivel: 127, center: 69, lokey: 68, hikey: 70 }),
      region({ sample: 'loud-c', lovel: 63, hivel: 127, center: 72, lokey: 71, hikey: 73 }),
    ]
    expect(pickRegion(regions, 440, 50, 'k').sample).toBe('soft-a')
    expect(pickRegion(regions, 440, 90, 'k').sample).toBe('loud-a')
    expect(pickRegion(regions, 523.25, 90, 'k').sample).toBe('loud-c')
    // a pitch no region's keys hold goes to the nearest
    expect(pickRegion(regions, 880, 90, 'k').sample).toBe('loud-c')
  })

  it('chooses among round robins by the note’s key, the same for the same key', () => {
    const regions = [region({ sample: 'rr1', seq: 1 }), region({ sample: 'rr2', seq: 2 })]
    const chosen = new Set(Array.from({ length: 24 }, (_, k) => pickRegion(regions, 440, 90, `v0${k}`).sample))
    expect(chosen).toEqual(new Set(['rr1', 'rr2']))
    expect(pickRegion(regions, 440, 90, 'v03').sample).toBe(pickRegion(regions, 440, 90, 'v03').sample)
    expect(keyHash('a')).not.toBe(keyHash('b'))
  })
})

describe('a note as the sampler plays it', () => {
  const r: Region = { at: 0, seconds: 4, hz: 440, center: 69, lokey: 67, hikey: 70, lovel: 0, hivel: 127, volume: 6, release: 0.7, seq: 1, mono: 1.2, sample: 'a' }

  it('is read at the exact ratio of the wanted pitch to the recorded one: that is the tuning', () => {
    expect(rateFor(r, 440)).toBe(1)
    expect(rateFor(r, 660)).toBeCloseTo(1.5, 12)
    // the eleventh harmonic, which no tempered scale holds
    expect(rateFor(r, 605)).toBeCloseTo(11 / 8, 12)
    expect(midiOf(440)).toBe(69)
  })

  it('is scaled by the region’s volume and the square of the velocity', () => {
    expect(gainFor(r, 127)).toBeCloseTo(10 ** (6 / 20), 12)
    expect(gainFor(r, 64) / gainFor(r, 127)).toBeCloseTo((64 / 127) ** 2, 12)
  })

  it('starts in the browser at the press’s level, with what the mono cut and the pan would lose given back', () => {
    expect(peakFor(r, 127, 1)).toBeCloseTo(10 ** (6 / 20) * 1.2 * Math.SQRT2, 12)
    // an older motif, 4 dB softer
    expect(peakFor(r, 92, 10 ** (-4 / 20)) / peakFor(r, 92, 1)).toBeCloseTo(10 ** (-4 / 20), 12)
    // a mono source at the centre of an equal-power pan has cos(45°) a side; times CENTRE that is one a side
    expect(Math.cos(Math.PI / 4) * CENTRE).toBeCloseTo(1, 12)
  })

  it('is held and released, and ends early where its recording does', () => {
    expect(soundingFor(r, 440, 1, null)).toEqual({ held: 1, release: 0.7 })
    expect(soundingFor(r, 440, 1, 0.25)).toEqual({ held: 1, release: 0.25 })
    // read at twice the speed, four seconds of recording last two
    const high = soundingFor(r, 880, 1.8, 0.7)
    expect(high.held).toBe(1.8)
    expect(high.release).toBeCloseTo(0.2, 9)
    const longer = soundingFor(r, 880, 3, 0.7)
    expect(longer.held).toBeLessThan(2)
  })
})

describe('a list sorted by time', () => {
  it('finds the first item at or after a moment', () => {
    const items = [{ t: 0 }, { t: 1 }, { t: 1 }, { t: 2.5 }]
    expect(firstFrom(items, -1)).toBe(0)
    expect(firstFrom(items, 1)).toBe(1)
    expect(firstFrom(items, 1.1)).toBe(3)
    expect(firstFrom(items, 9)).toBe(4)
  })
})

describe('what a performance keeps in memory', () => {
  it('is only the regions its notes pick, each as long as its longest note reads', () => {
    const notes = [
      { instrument: 'FluteSusVib', hz: 660, seconds: 0.36, release: null, velocity: 92, key: 's04' },
      { instrument: 'FluteSusVib', hz: 660, seconds: 1.2, release: null, velocity: 92, key: 's04' },
      { instrument: 'TubularBells', hz: 440, seconds: 3, release: 2.5, velocity: 70, key: 'bell' },
      { instrument: 'NoSuchInstrument', hz: 440, seconds: 1, release: null, velocity: 90, key: 'x' },
    ]
    const need = neededRegions(notes, index)
    expect([...need.keys()].sort()).toEqual(['FluteSusVib', 'TubularBells'])
    const flute = need.get('FluteSusVib')!
    expect(flute.size).toBe(1)
    const [i, seconds] = [...flute.entries()][0]!
    const region = index.instruments.FluteSusVib!.regions[i]!
    // the longer of the two notes, with the region's own release, read at the note's rate
    expect(seconds).toBeCloseTo(Math.min(region.seconds, (1.2 + region.release) * (660 / region.hz) + 0.05), 9)
    expect(seconds).toBeLessThanOrEqual(region.seconds)
  })
})

describe('a tap on a voice', () => {
  const all = ['voice', 'solo-0', 'violins', 'piano']
  const names = (set: ReadonlySet<string>): string[] => [...set].sort()

  it('leaves the tapped voice alone when everyone was sounding', () => {
    expect(names(afterTap(new Set(), 'piano', all))).toEqual(['solo-0', 'violins', 'voice'])
  })

  it('then adds a voice or takes one away', () => {
    const alone = afterTap(new Set(), 'piano', all)
    const two = afterTap(alone, 'voice', all)
    expect(names(two)).toEqual(['solo-0', 'violins'])
    expect(names(afterTap(two, 'voice', all))).toEqual(['solo-0', 'violins', 'voice'])
  })

  it('brings everyone back rather than leave nothing sounding', () => {
    const alone = afterTap(new Set(), 'piano', all)
    expect(afterTap(alone, 'piano', all).size).toBe(0)
  })

  it('never changes the set it was given', () => {
    const before = new Set(['voice'])
    afterTap(before, 'piano', all)
    expect(names(before)).toEqual(['voice'])
  })
})

describe('the way out', () => {
  /** The filter's gain at a frequency, from its two lists. */
  const gainAt = (hz: number, cut: number, rate: number): number => {
    const { feedforward: [b0, b1], feedback: [a0, a1] } = firstOrderHighpass(cut, rate)
    const w = (2 * Math.PI * hz) / rate
    const num = Math.hypot(b0 + b1 * Math.cos(w), b1 * Math.sin(w))
    const den = Math.hypot(a0 + a1 * Math.cos(w), a1 * Math.sin(w))
    return 20 * Math.log10(num / den)
  }

  it('has the press’s highpass: 3 dB down at its frequency, 6 dB an octave below, nothing above', () => {
    for (const rate of [44100, 48000]) {
      for (const cut of [35, 90]) {
        expect(gainAt(cut, cut, rate)).toBeCloseTo(-3.01, 1)
        // measured on the press's own filter on 2026-11-14: -6.8 to -7.0 dB an octave under, -0.97 dB an octave over
        expect(gainAt(cut / 2, cut, rate)).toBeCloseTo(-6.99, 1)
        expect(gainAt(cut * 2, cut, rate)).toBeCloseTo(-0.97, 1)
        expect(Math.abs(gainAt(4000, cut, rate))).toBeLessThan(0.01)
      }
    }
    const { feedforward } = firstOrderHighpass(35, 48000)
    // nothing constant passes
    expect(feedforward[0] + feedforward[1]).toBe(0)
  })

  it('knows what a browser’s compressor adds, to take it away again', () => {
    // threshold -3 dB, ratio 20: full scale leaves at -2.85 dB; the make-up is that, inverted, to the power of 0.6
    expect(makeupFor(-3, 20)).toBeCloseTo(10 ** ((2.85 * 0.6) / 20), 9)
    expect(makeupFor(0, 20)).toBe(1)
    expect(makeupFor(-24, 12)).toBeGreaterThan(makeupFor(-3, 20))
  })
})
