// How a browser plays a recorded note as the press does: the pick of a region, the rate, the gain. Held against the
// instruments cut for the browser (public/ill-tempered-week/instruments/index.json) and against picks the press's own
// sampler made on the whole instruments (checked for every one of the 952 distinct notes of both albums on
// 2026-11-14; the cases below are a sample of them, one per instrument).
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { firstFrom, gainFor, keyHash, midiOf, pickRegion, rateFor, soundingFor, type InstrumentIndex, type Region } from './perform'

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

  const region = (over: Partial<Region>): Region => ({ at: 0, seconds: 4, hz: 440, center: 69, lokey: 0, hikey: 127, lovel: 0, hivel: 127, volume: 0, release: 0.7, seq: 1, sample: 'a', ...over })

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
  const r: Region = { at: 0, seconds: 4, hz: 440, center: 69, lokey: 67, hikey: 70, lovel: 0, hivel: 127, volume: 6, release: 0.7, seq: 1, sample: 'a' }

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
