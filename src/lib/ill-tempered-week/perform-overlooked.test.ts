// Overlooked as notes to play, held to the renderer it mirrors, to the score of the same record, and to the
// instruments cut for the browser. These tests also run in the nightly press before an album is committed, so each
// states what any correct pressing satisfies.
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums, type Overlooked } from './albums'
import { pickRegion, type InstrumentIndex } from './perform'
import { duckAt, performOverlooked, PLAY, saidUrl } from './perform-overlooked'
import { FORM, overlookedScore } from './score-overlooked'

const SOURCE = readFileSync('scripts/ill-tempered-week/itw/overlooked.py', 'utf8')
const index = JSON.parse(readFileSync('public/ill-tempered-week/instruments/index.json', 'utf8')) as InstrumentIndex
const albums = readAlbums()

describe('the renderer’s notes, as the performance mirrors them', () => {
  it('names the same instruments', () => {
    for (const patch of [PLAY.violins.instrument, PLAY.violas.instrument, PLAY.cellos.instrument, PLAY.basses.instrument, PLAY.piano.instrument, PLAY.bell.instrument, PLAY.brass.horn, PLAY.brass.trombone, PLAY.violin.instrument]) {
      expect(SOURCE, patch).toContain(`'${patch}'`)
    }
    expect(SOURCE).toContain(`'violins': '${PLAY.violins.instrument}', 'violas': '${PLAY.violas.instrument}', 'cellos': '${PLAY.cellos.instrument}', 'basses': '${PLAY.basses.instrument}'`)
    expect(SOURCE).toContain(`'piano': '${PLAY.piano.instrument}', 'bells': '${PLAY.bell.instrument}', 'horn': '${PLAY.brass.horn}', 'trombone': '${PLAY.brass.trombone}'`)
    expect(SOURCE).toContain(`'violin_solo': '${PLAY.violin.instrument}'`)
  })

  it('strikes the bell, says the sentence and answers it as the renderer does', () => {
    expect(SOURCE).toContain(`inst['bells'].note(${PLAY.bell.hz.toFixed(1)}, ${PLAY.bell.seconds.toFixed(1)}, ${PLAY.bell.velocity}, release=${PLAY.bell.release})`)
    expect(SOURCE).toContain(`np.stack([m['speech'], m['speech']]) * ${PLAY.said})`)
    expect(SOURCE).toContain(`np.stack([mel[0]['speech'], mel[0]['speech']]) * ${PLAY.saidAgain})`)
    expect(SOURCE).toContain(`max(${PLAY.answer.shortest}, nxt - nt['t']), ${PLAY.answer.velocity}, key=f'echo{k}'), ${PLAY.answer.pan} * (-1) ** i`)
  })

  it('loops a motif, softer by the day, as the renderer does', () => {
    expect(SOURCE).toContain(`dur = max(${PLAY.motif.shortest}, ${PLAY.motif.held} * nt['eighths'] * PULSE)`)
    expect(SOURCE).toContain(`max(${PLAY.motif.floor}, ${PLAY.motif.velocity} - ${PLAY.motif.perDay} * (j - i))`)
    expect(SOURCE).toContain(`solo[i], ${PLAY.motif.tutti}, p=`)
    expect(SOURCE).toContain('buf=ens if j == i else aged')
    expect(SOURCE).toContain('t = origin + max(0, math.floor((start - origin) / L) - 1) * L')
    expect(SOURCE).toContain('if at < start or at >= stop:')
  })

  it('gives the ensemble its notes as the renderer does', () => {
    expect(SOURCE).toContain(`inst['violins'], ${PLAY.violins.velocity}, shift8=${FORM.canon.violins}, lo=${PLAY.violins.lo}, hi=${PLAY.violins.hi}, p=PAN['violins']`)
    expect(SOURCE).toContain(`inst['violas'], ${PLAY.violas.velocity}, shift8=${FORM.canon.violas}, transpose=${PLAY.violas.transpose}, lo=${PLAY.violas.lo}, hi=${PLAY.violas.hi}, p=PAN['violas']`)
    expect(SOURCE).toContain(`PAN = {'violins': ${PLAY.violins.pan}, 'violas': ${PLAY.violas.pan}, 'cellos': ${PLAY.cellos.pan}, 'basses': ${PLAY.basses.pan}, 'piano': ${PLAY.piano.pan}, 'bells': ${PLAY.bell.pan.toFixed(1)}}`)
    expect(SOURCE).toContain(`vel = int(${PLAY.piano.velocity} + ${PLAY.piano.rise} * min(1.0,`)
    expect(SOURCE).toContain(`inst['piano'].note(hz, ${PLAY.piano.seconds}, vel, release=${PLAY.piano.release}`)
    expect(SOURCE).toContain(`while hz > ${PLAY.piano.hi}:`)
    expect(SOURCE).toContain(`while hz < ${PLAY.piano.lo}:`)
    expect(SOURCE).toContain(`inst['cellos'].note(${PLAY.cellos.hz.toFixed(1)}, 2 * BAR * ${PLAY.cellos.held}, ${PLAY.cellos.velocity}, release=${PLAY.cellos.release})`)
    expect(SOURCE).toContain(`inst['basses'].note(max(${PLAY.basses.lowest}, floor / 2 if floor > ${PLAY.basses.fold} else floor), 2 * BAR * ${PLAY.cellos.held}, ${PLAY.basses.velocity}, release=${PLAY.basses.release})`)
    expect(SOURCE).toContain(`while floor > ${PLAY.basses.top}:`)
  })

  it('ends as the renderer does: the chord, the cut, the coda', () => {
    expect(SOURCE).toContain(`inst[which].note(hz, end_music - tutti, ${PLAY.brass.velocity}, release=${PLAY.brass.release}), ${PLAY.brass.hornPan} if which == 'horn' else ${PLAY.brass.trombonePan}`)
    expect(SOURCE).toContain(`while hz > ${PLAY.brass.top}:`)
    expect(SOURCE).toContain('ens[:, cut:] *= 0.0')
    expect(SOURCE).toContain(`inst['violin_solo'].note(${FORM.violinHz.toFixed(1)}, ${FORM.violinNote.toFixed(1)}, ${PLAY.violin.velocity}, release=${PLAY.violin.release.toFixed(1)}), ${PLAY.violin.pan.toFixed(1)})`)
  })

  it('sends each group out through the highpass and the reverb the renderer names', () => {
    const { hall, room } = PLAY
    expect(SOURCE).toContain(`pb.HighpassFilter(${hall.highpass}), pb.Reverb(room_size=${hall.room}, damping=${hall.damping}, wet_level=${hall.wet}, dry_level=${hall.dry}, width=${hall.width.toFixed(1)})`)
    // the voice's reverb names neither damping nor width: the reverb's own defaults, which reverb.test.ts holds to
    // the press's reverb itself
    expect(SOURCE).toContain(`pb.HighpassFilter(${room.highpass}), pb.Reverb(room_size=${room.room}, wet_level=${room.wet}, dry_level=${room.dry.toFixed(1)})`)
    // the levels the record keeps are taken after the reverbs, group by group, and the limiter comes last
    expect(SOURCE).toContain("mix = lev(ens, -17.0, 'ens') + lev(voice, -19.0, 'voice') + lev(murmur, -31.0, 'murmur')")
    expect(SOURCE).toContain('return base.level(mix, -16.0)')
    expect(SOURCE.indexOf('pb.Reverb(room_size=0.82')).toBeLessThan(SOURCE.indexOf("lev(ens, -17.0, 'ens')"))
  })

  it('lets the older motifs step back for a new sentence as the renderer does', () => {
    expect(SOURCE).toContain(`int((day0(i) - ${PLAY.duck.before}) * SR), int(origins[i] * SR)`)
    expect(SOURCE).toContain(`duck[a:b] = ${PLAY.duck.to}`)
    expect(SOURCE).toContain(`r = int(${PLAY.duck.bars} * BAR * SR)`)
    expect(SOURCE).toContain(`np.ones(int(${PLAY.duck.smooth} * SR))`)
  })
})

describe('every edition on file, as a performance', () => {
  for (const a of albums) {
    const o = a.pieces.overlooked
    describe(`${o.week}, edition ${o.edition}`, () => {
      const p = performOverlooked(o)
      const s = overlookedScore(o)

      it('plays its notes in order, inside the piece, with a bell and a sentence for every day', () => {
        p.notes.slice(1).forEach((n, k) => expect(n.t).toBeGreaterThanOrEqual(p.notes[k]!.t))
        for (const n of p.notes) {
          expect(n.t).toBeGreaterThanOrEqual(0)
          expect(n.t).toBeLessThan(o.seconds)
          expect(n.hz).toBeGreaterThan(20)
          expect(n.seconds).toBeGreaterThan(0)
        }
        expect(p.notes.filter((n) => n.instrument === PLAY.bell.instrument)).toHaveLength(o.days.length)
        expect(p.clips).toHaveLength(o.days.length + 1)
        expect(p.clips.at(-1)!.day).toBe(0)
      })

      // found in the browser on 2026-11-14: a part that passed an empty level along left its notes without one, the
      // audio clock refused them one by one and the performance fell silent after ten seconds
      it('gives the engine nothing it must guess: every note and sentence is whole', () => {
        for (const n of p.notes) {
          expect(['ensemble', 'aged', 'voice'], `${n.lane} at ${n.t}`).toContain(n.bus)
          for (const value of [n.t, n.hz, n.seconds, n.velocity, n.pan, n.gain]) expect(Number.isFinite(value), `${n.lane} at ${n.t}`).toBe(true)
          expect(n.release === null || Number.isFinite(n.release)).toBe(true)
          expect(n.until === null || Number.isFinite(n.until)).toBe(true)
          expect(n.gain).toBeGreaterThan(0)
          expect(Math.abs(n.pan)).toBeLessThanOrEqual(1)
          expect(n.velocity).toBeGreaterThanOrEqual(1)
          expect(n.velocity).toBeLessThanOrEqual(127)
          expect(n.key.length).toBeGreaterThan(0)
        }
        for (const c of p.clips) for (const value of [c.t, c.day, c.gain]) expect(Number.isFinite(value)).toBe(true)
        for (const d of p.duck) for (const value of [d.t, d.v]) expect(Number.isFinite(value)).toBe(true)
      })

      it('plays every note inside the mark the score draws for its voice', () => {
        const stray = p.notes.filter((n) => !s.events.some((e) => e.lane === n.lane && n.t >= e.t0 - 0.011 && n.t < e.t1 + 0.011))
        expect(stray.map((n) => `${n.lane} ${n.t.toFixed(2)}`)).toEqual([])
      })

      it('finds a recorded note for everything it plays', () => {
        for (const name of p.instruments) expect(index.instruments[name], name).toBeDefined()
        for (const n of p.notes) expect(pickRegion(index.instruments[n.instrument]!.regions, n.hz, n.velocity, n.key).hz).toBeGreaterThan(0)
      })

      it('keeps an older motif softer by 4 dB a day and apart from the day’s own', () => {
        for (const n of p.notes.filter((x) => x.bus === 'aged')) {
          expect(n.gain).toBeLessThan(1)
          const days = (20 * Math.log10(n.gain)) / -FORM.dbPerDay
          expect(Math.abs(days - Math.round(days))).toBeLessThan(1e-9)
          expect(Math.round(days)).toBeGreaterThanOrEqual(1)
          expect(n.velocity).toBeLessThan(PLAY.motif.velocity)
        }
        for (const n of p.notes.filter((x) => x.bus === 'ensemble')) expect(n.gain).toBe(1)
      })

      it('lets a motif end with its day where the record says so', () => {
        o.days.forEach((d, i) => {
          if (!o.silenced_after_their_day.includes(d.field)) return
          const end = i + 1 < o.days.length ? o.days[i + 1]!.from_s : o.cut_s
          const after = p.notes.filter((n) => n.lane === `solo-${i}` && n.t >= end)
          expect(after).toHaveLength(0)
        })
      })

      it('stops the ensemble at the cut and lets only the coda sound after it', () => {
        for (const n of p.notes.filter((x) => x.t < o.cut_s)) expect(n.until).toBe(o.cut_s)
        const after = p.notes.filter((x) => x.t >= o.cut_s)
        expect(after.every((n) => n.lane === 'coda' && n.until === null)).toBe(true)
        expect(after.length).toBeLessThanOrEqual(1)
      })

      it('has each day’s sentence as spoken beside the album', () => {
        o.days.forEach((_, i) => expect(existsSync(`public${saidUrl(o.week, i)}`), saidUrl(o.week, i)).toBe(true))
      })

      it('says what it does not perform', () => {
        expect(p.missing.some((m) => m.lane === 'murmur')).toBe(true)
        o.days.forEach((d, i) => {
          const answered = p.notes.some((n) => n.lane === `solo-${i}` && n.key.startsWith('echo'))
          expect(answered).toBe(!!d.echo && d.echo.length > 0 && d.speech_s !== undefined)
          expect(p.missing.some((m) => m.lane === `solo-${i}`)).toBe(!answered)
        })
      })
    })
  }
})

describe('the parts of a performance', () => {
  const o = albums[0]!.pieces.overlooked

  it('is the same list every time', () => {
    expect(performOverlooked(o)).toEqual(performOverlooked(o))
  })

  it('performs a record without the newer values, and says the answers are missing', () => {
    const bare: Overlooked = { ...o, coda_s: undefined, mix: undefined, days: o.days.map((d) => ({ ...d, speech_s: undefined, echo: undefined, entries_s: undefined })) }
    const p = performOverlooked(bare)
    expect(p.mix).toBeNull()
    expect(p.notes.some((n) => n.key.startsWith('echo'))).toBe(false)
    expect(p.missing.filter((m) => m.why.includes('answer'))).toHaveLength(o.days.length)
    expect(p.notes.some((n) => n.lane === 'coda')).toBe(false)
    expect(p.clips).toHaveLength(o.days.length + 1)
  })

  it('lets the older motifs step back while a new sentence is said, and return over three bars', () => {
    const p = performOverlooked(o)
    const second = o.days[1]!
    expect(duckAt(p.duck, 0)).toBe(1)
    expect(duckAt(p.duck, second.from_s - 5)).toBe(1)
    expect(duckAt(p.duck, second.from_s + 1)).toBeCloseTo(PLAY.duck.to, 9)
    expect(duckAt(p.duck, second.motif_from_s)).toBeCloseTo(PLAY.duck.to, 9)
    const half = duckAt(p.duck, second.motif_from_s + (PLAY.duck.bars * 8 * o.pulse_s) / 2)
    expect(half).toBeGreaterThan(PLAY.duck.to)
    expect(half).toBeLessThan(1)
    expect(duckAt(p.duck, second.motif_from_s + PLAY.duck.bars * 8 * o.pulse_s + 0.01)).toBe(1)
  })

  it('names a sentence’s file by its week and its day', () => {
    expect(saidUrl('2026-W45', 0)).toBe('/ill-tempered-week/perform/2026-W45/said-1.m4a')
  })
})
