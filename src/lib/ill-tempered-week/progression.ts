// src/lib/ill-tempered-week/progression.ts — the weeks build on each other (2026-11-23; Frank's request of that day,
// wording private; the method doc's section of that name). Every album keeps the devices of the album before it and,
// once its week is complete, adds one more: the ways a fugue treats its subject, taken up one album after the next.
// The rule is the renderer's (scripts/ill-tempered-week/itw/progression.py); this module names the devices, says what
// each does in each piece, and tells an album's place in its cycle. progression.test.ts holds the order and the
// verdicts to the renderer's source. No node:fs, so the score islands can import it.
import type { Album, Device, Form, SecondSubject } from './albums'
import { FIELD } from './names'
import { dayName } from './score'

/** The order the cycle runs through, and the device each verdict asks for (a standing week takes the next). */
export const DEVICES: readonly Device[] = ['inversion', 'diminution', 'augmentation', 'second subject', 'stretto', 'retrograde']
export const OF_VERDICT: Partial<Record<Form, Device>> = { break: 'inversion', held: 'augmentation', handover: 'second subject', mosaic: 'stretto' }

export type Piece = 'overlooked' | 'unison' | 'turn'

/** "Contrapunctus 47" for 2026-W47. */
export const contrapunctus = (week: string): string => `Contrapunctus ${Number(week.split('-W')[1])}`

/** The devices a piece plays: none for a record pressed before 2026-11-23. */
export const devicesOf = (r: { devices?: readonly Device[] } | null | undefined): ReadonlySet<Device> => new Set(r?.devices ?? [])

/** Why a complete week chose its device, as a clause. */
export const WHY: Record<Form, string> = {
  break: 'the web’s attention turned over in one night',
  held: 'one story held the web’s attention all week',
  handover: 'the lead passed to another story and stayed there',
  mosaic: 'the story leading the web’s attention kept changing',
  standing: 'no story held the week, broke it or took it over',
}

/** What each device does in each piece: the renderer's own description of it (the docstrings of itw/overlooked.py,
 *  unison.py and turn.py, "the devices"), in the page's words. */
export const DOES: Record<Piece, Record<Device, string>> = {
  overlooked: {
    inversion: 'the violas play each motif upside down, every interval turned round its first note',
    diminution: 'the piano plays each motif at twice the speed instead of pulsing its two lowest notes',
    augmentation: 'cellos and basses play each motif at half the speed instead of holding A and its lowest note',
    'second subject': 'the horns play the second subject from the violins’ entry to the end of each day',
    stretto: 'the ensemble takes each motif up twice as soon, after 2, 4, 6 and 7 bars instead of 4, 8, 12 and 14, the violins’ canon one eighth behind instead of three and the violas’ two instead of five',
    retrograde: 'the violins play each motif backwards',
  },
  unison: {
    inversion: 'the sections are turned round: the least attended quarter of a day’s war signals plays in the violins, the most attended in the double basses',
    diminution: 'cellos and basses glide three times as fast, a rain under the mass',
    augmentation: 'violins and violas glide twice as slowly',
    'second subject': 'before each peak the horns play the second subject, four times as slow',
    stretto: 'every signal enters in the last third before the day’s peak, the hours of the day pressed together',
    retrograde: 'every glissando runs backwards, from where the agreement takes it back to its own pitch',
  },
  turn: {
    inversion: 'the families sing on the undertones of A instead of its overtones (A1 × 45 / harmonic: search 9, news 7½, social 6 3/7, tech 5), the rhythm unchanged',
    diminution: 'every bar plays its pattern twice, at twice the speed',
    augmentation: 'every note is held to its family’s next beat, so the pulses become a legato line',
    'second subject': 'a bell plays the second subject, one note a bar, half a bar in',
    stretto: 'every note sounds again a quarter bar later, an octave up from the other side: a canon inside the bar',
    retrograde: 'every note runs backwards, swelling into its beat instead of dying away from it',
  },
}

/** The second subject named: whose motif it is. */
export const secondSubject = (s: SecondSubject): string =>
  `the motif ${contrapunctus(s.week)} ended on, ${dayName(s.day)}’s, from ${FIELD[s.field] ?? s.field}`

/** "a, b and c" */
export const list = (xs: readonly string[]): string => (xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)

/** What a piece's devices do, as one sentence for its section of the page; null while it plays none. */
export function devicesText(piece: Piece, record: { devices?: readonly Device[]; second?: SecondSubject } | null | undefined): string | null {
  const devices = record?.devices ?? []
  if (devices.length === 0) return null
  const parts = devices.map((d) => `${d}: ${DOES[piece][d]}${d === 'second subject' && record?.second ? `, ${secondSubject(record.second)}` : ''}`)
  return `${devices.length === 1 ? 'This album’s device' : `This album’s ${devices.length} devices`} in ${piece === 'overlooked' ? 'Overlooked' : piece === 'unison' ? 'Unison' : 'Turn'}: ${parts.join('; ')}.`
}

/** The album's place in its cycle, for the top of its page; null for an album pressed before the weeks built on each
 *  other. */
export function progressionText(a: Pick<Album, 'progression'>): string | null {
  const p = a.progression
  if (!p) return null
  const from = p.from ? contrapunctus(p.from) : null
  const n = p.taken_over.length
  const kept = n > 0 ? `It keeps the ${n === 1 ? 'device' : `${n} devices`} of ${from}, ${list(p.taken_over)}` : null
  const begins = !from
    ? 'It is the first album, and it begins the first cycle'
    : p.cycle === 1
      ? `${from} was pressed before the weeks built on each other and hands on no device, so this album begins the first cycle`
      : `${from} completed cycle ${p.cycle - 1}, so this album begins cycle ${p.cycle}`
  if (!p.added || !p.verdict) {
    const until = n > 0 ? `${kept}; until its week is complete it plays ${n === 1 ? 'that device' : 'those devices'}` : `${begins}. Until its week is complete it plays no device`
    return `Cycle ${p.cycle}. ${until}, and with the seventh day the week’s character chooses the one it adds, which then stays in every album after it until the cycle is complete.`
  }
  const why = p.asked && p.asked !== p.added
    ? `${WHY[p.verdict]}, which asks for ${p.asked}; ${p.taken_over.includes(p.asked) ? 'that was already in force' : 'no album before holds a motif to take it from'}, so the next in the order comes in`
    : WHY[p.verdict]
  return `Cycle ${p.cycle}, step ${p.step} of ${DEVICES.length}. ${kept ? `${kept}, and adds` : `${begins}; it adds`} ${p.added}, because ${why}.`
}
