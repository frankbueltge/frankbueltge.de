// Overlooked's score, held to the renderer it mirrors and to every edition on file. These tests also run in the
// nightly press (.github/workflows/ill-tempered-week.yml) before a pressing is committed, so each one states what any
// correct pressing satisfies, never a property of one week.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readAlbums, standingOverlooked, type Overlooked } from './albums'
import { harmonicOf, SCALE_HARMONICS } from './score'
import {
  describeOverlooked,
  does,
  FORM,
  layoutOverlooked,
  loopStarts,
  motifStaff,
  nowOverlooked,
  overlookedScore,
  soloistAt,
  speechSeconds,
} from './score-overlooked'

const SOURCE = readFileSync('scripts/ill-tempered-week/itw/overlooked.py', 'utf8')
// an Overlooked pressed in the week's form has a score of its own (score-forms.test.ts)
const editions = readAlbums().map((a) => a.pieces.overlooked).filter(standingOverlooked)
// Contrapunctus 47 pressed again locally under the rule of 2026-11-23 (itw/progression.py): with the stretto its
// verdict adds, and with all six devices, the second subject from Contrapunctus 46
const fixture = (name: string): Overlooked => JSON.parse(readFileSync(`src/lib/ill-tempered-week/fixtures/devices-2026-W47-${name}.json`, 'utf8'))
const STRETTO = fixture('overlooked-stretto')
const SIX = fixture('overlooked-six')

describe('the renderer’s form, as the score mirrors it', () => {
  it('has the pulse, the bars and the intro the score assumes', () => {
    expect(SOURCE).toMatch(/^PULSE = 0\.2$/m)
    expect(SOURCE).toMatch(/^BAR = 8 \* PULSE$/m)
    expect(SOURCE).toMatch(new RegExp(`^INTRO_BARS = ${FORM.introBars}$`, 'm'))
    expect(SOURCE).toMatch(/^DAY_BARS = 28$/m)
  })

  it('says, answers and takes the motif up when the score says it does', () => {
    expect(SOURCE).toContain(`put(ens, t0, pan(inst['bells'].note(440.0, ${FORM.bell.toFixed(1)}, 70`)
    expect(SOURCE).toContain(`put(voice, t0 + ${FORM.saidAfter}, `)
    expect(SOURCE).toContain(`echo_at = t0 + ${FORM.saidAfter} + m['speech_seconds'] + ${FORM.answerAfter}`)
    expect(SOURCE).toContain(`motif_bar = math.ceil((echo_at + m['speech_seconds'] + ${FORM.answerAfter} - t0) / BAR)`)
    expect(SOURCE).toContain(`nt['t'] + ${FORM.lastAnswerNote}`)
  })

  it('enters the ensemble where the score draws it, unless the record says so itself', () => {
    // the parts' entries were inline literals until 2026-11-14, then named and recorded; since 2026-11-23 they and the
    // canon's offsets are constants, with the stretto's beside them (itw/progression.py)
    const dict = (o: Record<string, number>): string => `\\{${Object.entries(o).map(([k, v]) => `'${k}': ${v}`).join(', ')}\\}`
    expect(SOURCE).toMatch(new RegExp(`^ENTRIES = ${dict(FORM.entries)}$`, 'm'))
    expect(SOURCE).toMatch(new RegExp(`^ENTRIES_STRETTO = ${dict(FORM.entriesStretto)}$`, 'm'))
    expect(SOURCE).toMatch(new RegExp(`^CANON = ${dict(FORM.canon)}$`, 'm'))
    expect(SOURCE).toMatch(new RegExp(`^CANON_STRETTO = ${dict(FORM.canonStretto)}$`, 'm'))
    expect(SOURCE).toContain('entries = {part: mt + bars * BAR for part, bars in entry_bars.items()}')
    expect(SOURCE).toContain(`shift8=canon['violins']`)
    expect(SOURCE).toContain(`shift8=canon['violas']`)
    expect(SOURCE).toContain(`t += ${FORM.lowEvery} * BAR`)
    expect(SOURCE).toContain(`while t < t_end - ${FORM.margin}`)
  })

  it('plays the devices where the score draws them', () => {
    // the piano at twice the speed, the low strings at half, the second subject from the violins' entry to the
    // day's end (on the newest day to the tutti), all looped as the motif is
    expect(SOURCE).toContain("notes=scaled(m['motif'], 0.5), length=m['length'] / 2)")
    expect(SOURCE).toContain("slow = scaled(m['motif'], 2.0)")
    expect(SOURCE).toContain("motif_loop(i, entries['violins'], min(t_end, tutti_at) if last else t_end, inst['horn']")
    expect(SOURCE).toContain('tutti_at = day0(len(week) - 1) + 20 * BAR')
    expect(SOURCE).toContain("notes=backwards(m['motif'], m['length']) if 'retrograde' in dev else None")
    expect(SOURCE).toContain("notes=inverted(m['motif']) if 'inversion' in dev else None")
  })

  it('ages, ends and closes the way the score draws it', () => {
    expect(SOURCE).toContain(`gain=10 ** (-${FORM.dbPerDay.toFixed(1)} * (j - i) / 20)`)
    expect(SOURCE).toContain('tutti = day0(len(week) - 1) + 20 * BAR')
    expect(SOURCE).toContain(`coda_at = end_music + ${FORM.codaAfter}`)
    expect(SOURCE).toContain(`note(${FORM.violinHz.toFixed(1)}, ${FORM.violinNote.toFixed(1)}, 60`)
    expect(SOURCE).toContain(`mel[0]['speech_seconds'] + ${FORM.violinAfter}`)
  })
})

/** What any pressing of Overlooked satisfies, as its score. */
function holds(title: string, o: Overlooked) {
  describe(title, () => {
    const s = overlookedScore(o)
    const bar = 8 * o.pulse_s

    it('has its days where the form puts them, and its tutti, cut and end', () => {
      o.days.forEach((d, i) => expect(d.from_s).toBeCloseTo((FORM.introBars + i * o.day_bars) * bar, 1))
      expect(o.cut_s).toBeCloseTo((FORM.introBars + o.days.length * o.day_bars) * bar, 1)
      expect(o.tutti_from_s).toBeCloseTo(o.days.at(-1)!.from_s + 20 * bar, 1)
      expect(o.seconds).toBeCloseTo(s.coda + 18, 1)
    })

    it('begins each motif on a bar line, after a sentence the estimate keeps within half a bar', () => {
      for (const d of s.days) {
        const bars = (d.motifFrom - d.from) / bar
        expect(Math.abs(bars - Math.round(bars))).toBeLessThan(0.02)
        expect(d.speech).toBeGreaterThan(0)
        // the motif's bar is the first bar line after 1.2 s and twice the speech
        const answered = FORM.saidAfter + 2 * FORM.answerAfter + 2 * d.speech
        expect(answered).toBeLessThanOrEqual(d.motifFrom - d.from + 0.01)
        expect(answered).toBeGreaterThan(d.motifFrom - d.from - bar - 0.01)
      }
    })

    it('tunes every motif note to a harmonic 8 to 15 of A', () => {
      for (const d of o.days) for (const m of d.motif) expect(harmonicOf(m.hz, SCALE_HARMONICS), `${d.day} ${m.hz}`).not.toBeNull()
    })

    it('silences exactly the motifs the record says ended with their day', () => {
      const ended = s.days.filter((d) => !d.kept).map((d) => d.field)
      expect(ended).toEqual(o.silenced_after_their_day)
      for (const d of s.days.filter((x) => !x.kept)) {
        const segs = s.events.filter((e) => e.kind === 'motif' && e.day === d.index)
        expect(Math.max(...segs.map((e) => e.t1))).toBeLessThanOrEqual(d.end)
        expect(segs.some((e) => e.tutti)).toBe(false)
      }
    })

    it('reads recorded entries where the edition has them, and agrees with them', () => {
      for (const [i, d] of o.days.entries()) {
        if (!d.entries_s) continue
        for (const [part, bars] of Object.entries(o.entry_bars ?? FORM.entries)) {
          expect(d.entries_s[part as keyof typeof FORM.entries]).toBeCloseTo(d.motif_from_s + bars * bar, 1)
        }
        expect(s.days[i]!.speechEstimated).toBe(d.speech_s === undefined)
      }
    })

    it('keeps every event inside the piece and every part inside its day', () => {
      for (const e of s.events) {
        expect(e.t0, e.id).toBeGreaterThanOrEqual(0)
        expect(e.t1, e.id).toBeGreaterThan(e.t0)
        expect(e.t1, e.id).toBeLessThanOrEqual(o.seconds + 1e-6)
        if (['violins', 'violas', 'piano', 'low', 'second', 'murmur'].includes(e.kind) && e.id !== 'coda-violin') {
          const d = s.days[e.day]!
          expect(e.t0, e.id).toBeGreaterThanOrEqual(d.from - 1e-6)
          expect(e.t1, e.id).toBeLessThanOrEqual(d.end + 1e-6)
        }
      }
    })

    it('says something true at every moment of the piece', () => {
      for (let t = 0; t < o.seconds; t += 0.7) expect(nowOverlooked(s, t).length).toBeGreaterThan(10)
      for (const e of s.events) expect(describeOverlooked(s, e.id), e.id).not.toBeNull()
    })

    it('lays out in lines that cover the piece, one line exactly when it fits, every mark inside its frame', () => {
      for (const width of [960, 358]) {
        const l = layoutOverlooked(s, width)
        const room = l.frame.right - l.frame.left
        expect(l.lines.length === 1).toBe(room / o.seconds >= 2.0)
        expect(l.lines[0]!.span.t0).toBe(0)
        expect(l.lines.at(-1)!.span.t1).toBe(o.seconds)
        l.lines.slice(1).forEach((line, k) => expect(line.span.t0).toBe(l.lines[k]!.span.t1))
        for (const line of l.lines) {
          for (const m of line.marks) {
            expect(m.x, m.id).toBeGreaterThanOrEqual(l.frame.left - 0.1)
            expect(m.x + m.w, m.id).toBeLessThanOrEqual(width + 0.1)
          }
          // lanes keep the score's order, and only those that sound in the line are drawn
          const order = s.lanes.map((x) => x.id)
          const ids = line.lanes.map((x) => x.id)
          expect([...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(ids)
          for (const id of ids) expect(line.marks.some((m) => m.y >= line.lanes.find((x) => x.id === id)!.y - 0.1)).toBe(true)
        }
        // every event drawn somewhere
        const drawn = new Set(l.lines.flatMap((line) => line.marks.map((m) => m.id)))
        for (const e of s.events) expect(drawn.has(e.id), e.id).toBe(true)
      }
    })

    it('draws each motif on its own just staff', () => {
      for (const d of s.days) {
        const st = motifStaff(d, 280)
        expect(st.notes).toHaveLength(d.motif.length)
        expect(st.lines.length).toBeGreaterThanOrEqual(1)
        for (const n of st.notes) expect(st.lines.some((x) => Math.abs(x.y - n.y) < 0.11)).toBe(true)
      }
    })
  })
}

describe('every edition on file, as its score', () => {
  for (const o of editions) holds(`${o.week}, edition ${o.edition}`, o)
})

describe('Contrapunctus 47 under the devices, as its score', () => {
  holds('with the stretto', STRETTO)
  holds('with all six devices', SIX)
})

describe('the devices, as the score draws them', () => {
  const six = overlookedScore(SIX)
  const stretto = overlookedScore(STRETTO)

  it('records the devices, the stretto’s entries and its closer canon', () => {
    expect(SIX.devices).toEqual(['inversion', 'diminution', 'augmentation', 'second subject', 'stretto', 'retrograde'])
    expect(STRETTO.devices).toEqual(['stretto'])
    for (const o of [SIX, STRETTO]) {
      expect(o.entry_bars).toEqual(FORM.entriesStretto)
      expect(o.canon_eighths).toEqual(FORM.canonStretto)
      for (const d of o.days) for (const [part, bars] of Object.entries(FORM.entriesStretto)) expect(d.entries_s![part as keyof typeof FORM.entries]).toBeCloseTo(d.motif_from_s + bars * 8 * o.pulse_s, 1)
    }
    expect(describeOverlooked(stretto, 'violins-0')!.body).toContain('one eighth behind')
    expect(describeOverlooked(stretto, 'violas-0')!.body).toContain('two eighths behind')
  })

  it('loops the piano at twice the speed and the low strings at half under diminution and augmentation', () => {
    for (const d of six.days) {
      const piano = six.events.find((e) => e.id === `piano-${d.index}`)
      const low = six.events.find((e) => e.id === `low-${d.index}`)
      if (piano && piano.loops!.length > 1) expect(piano.loops![1]! - piano.loops![0]!).toBeCloseTo(d.loop / 2, 2)
      if (low && low.loops!.length > 1) expect(low.loops![1]! - low.loops![0]!).toBeCloseTo(2 * d.loop, 2)
    }
    expect(describeOverlooked(six, 'piano-0')!.body).toContain('twice the speed')
    expect(describeOverlooked(six, 'low-0')!.body).toContain('half the speed')
    expect(describeOverlooked(six, 'violins-0')!.body).toContain('backwards')
    expect(describeOverlooked(six, 'violas-0')!.body).toContain('upside down')
    expect(describeOverlooked(stretto, 'piano-0')!.body).toContain('pulses')
  })

  it('gives the second subject a lane of its own, from the violins’ entry to the end of each day and to the tutti on the last', () => {
    expect(six.second?.week).toBe('2026-W46')
    expect(six.lanes.some((l) => l.id === 'second')).toBe(true)
    const seconds = six.events.filter((e) => e.kind === 'second')
    expect(seconds).toHaveLength(six.days.filter((d) => d.entries.violins !== null).length)
    for (const e of seconds) {
      const d = six.days[e.day]!
      expect(e.t0).toBe(d.entries.violins)
      expect(e.t1).toBe(e.day === six.days.length - 1 ? Math.min(d.end, six.tutti) : d.end)
      if (e.loops!.length > 1) expect(e.loops![1]! - e.loops![0]!).toBeCloseTo(SIX.second!.eighths * SIX.pulse_s, 2)
      expect(describeOverlooked(six, e.id)!.body).toContain('Contrapunctus 46')
      expect(nowOverlooked(six, e.t0 + 0.01)).toContain('second subject')
    }
    const drawn = new Set(layoutOverlooked(six, 960).lines.flatMap((l) => l.marks.filter((m) => m.kind === 'second').map((m) => m.id)))
    for (const e of seconds) expect(drawn.has(e.id)).toBe(true)
    expect(stretto.events.some((e) => e.kind === 'second')).toBe(false)
  })
})

describe('the parts of the form', () => {
  it('restarts a loop from its origin, inside the segment only', () => {
    expect(loopStarts(30.4, 4.8, 30.4, 44)).toEqual([30.4, 35.2, 40])
    expect(loopStarts(30.4, 4.8, 48, 60)).toEqual([49.6, 54.4, 59.2])
    expect(loopStarts(10, 0, 10, 20)).toEqual([])
  })

  it('takes a recorded speech length as it stands and estimates one from the motif’s bar otherwise', () => {
    expect(speechSeconds(3.2, 30.4, 1.6, 12.4)).toEqual({ s: 12.4, estimated: false })
    // 17 bars: the answer ended within (25.6, 27.2] s, so the speech lies within (12.2, 13.0]
    const e = speechSeconds(3.2, 30.4, 1.6)
    expect(e.estimated).toBe(true)
    expect(e.s).toBeGreaterThan(12.2)
    expect(e.s).toBeLessThanOrEqual(13.0)
  })

  it('finds the sounding note of a looping motif', () => {
    const o = editions[0]!
    const s = overlookedScore(o)
    const d = s.days[0]!
    const at = soloistAt(s, 0, d.motifFrom + 0.01)
    expect(at).not.toBeNull()
    expect(at!.note).toBe(0)
    expect(at!.db).toBe(0)
    expect(soloistAt(s, 0, d.from)).toBeNull()
  })

  it('reads the speech, the answer and the entries from a record that holds them (pressed from 2026-11-14 on)', () => {
    // the values the renderer recorded for Monday of 2026-W46 when it was pressed again locally with this change
    const o = editions.find((e) => e.week === '2026-W46') ?? editions.at(-1)!
    const d0 = o.days[0]!
    const recorded: Overlooked = {
      ...o,
      coda_s: o.cut_s + 2.4,
      days: [{ ...d0, speech_s: 1.937, echo: [{ t: 0, hz: 330 }, { t: 1.46, hz: 220 }], entries_s: { violins: d0.motif_from_s + 6.4, violas: d0.motif_from_s + 12.8, piano: d0.motif_from_s + 19.2, low: d0.motif_from_s + 22.4 } }, ...o.days.slice(1)],
    }
    const s = overlookedScore(recorded)
    expect(s.days[0]!.speechEstimated).toBe(false)
    expect(s.days[0]!.speech).toBe(1.937)
    const answer = s.events.find((e) => e.id === 'answer-0')!
    expect(answer.estimated).toBe(false)
    expect(answer.t0).toBeCloseTo(d0.from_s + 0.4 + 1.937 + 0.4, 6)
    expect(answer.t1).toBeCloseTo(answer.t0 + 1.46 + 0.6, 6)
    expect(s.days[0]!.entries.violins).toBeCloseTo(d0.motif_from_s + 6.4, 6)
    expect(s.coda).toBeCloseTo(o.cut_s + 2.4, 6)
  })

  it('wraps the first album at a phone’s width and keeps it on one line at a desk’s', () => {
    const s = overlookedScore(readAlbums()[0]!.pieces.overlooked as Overlooked)
    expect(layoutOverlooked(s, 960).lines).toHaveLength(1)
    expect(layoutOverlooked(s, 358).lines.length).toBeGreaterThan(1)
  })

  it('lets a section answer and a single instrument answers', () => {
    expect(does('cellos', 'answers')).toBe('answer')
    expect(does('violas', 'loops')).toBe('loop')
    expect(does('flute', 'answers')).toBe('answers')
    // a double bass is one instrument, whatever its last letter
    expect(does('double bass', 'plays')).toBe('plays')
    for (const o of editions) {
      const s = overlookedScore(o)
      for (const d of s.days) {
        const said = nowOverlooked(s, d.motifFrom - 0.05)
        expect(said).not.toMatch(/\b(cellos|violas) (answers|loops|plays)\b/)
      }
    }
  })

  it('survives an edition of a single day', () => {
    const o = editions.at(-1)! as Overlooked
    const one: Overlooked = { ...o, days: [o.days[0]!], days_so_far: 1, edition: 1, cut_s: o.days[0]!.from_s + o.day_bars * 8 * o.pulse_s, tutti_from_s: o.days[0]!.from_s + 20 * 8 * o.pulse_s, silenced_after_their_day: [] }
    one.seconds = one.cut_s + FORM.codaAfter + 18
    const s = overlookedScore(one)
    expect(s.events.length).toBeGreaterThan(5)
    expect(layoutOverlooked(s, 358).lines.length).toBeGreaterThanOrEqual(1)
  })
})
