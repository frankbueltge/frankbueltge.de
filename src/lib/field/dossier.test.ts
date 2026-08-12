// The instrument dossier, checked twice — once against fixtures for each rule, and once against
// the REAL committed records, because the entrance's whole claim is "this is what the record says
// right now" and a fixture can only prove the parser runs.
//
// The counts below are deliberately exact, and every one of them is a tripwire somebody should
// look at when it fires. A new instrument landing in the mirror, a register entry starting to
// name a work, an encounter whose akte names an instrument: each of those changes the front door
// of this practice, and it should change a test at the same time rather than quietly changing
// what the entrance claims.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildFieldDossiers,
  chronicleSource,
  drawnLedgerEvents,
  encounterId,
  instrumentName,
  isLockedLabel,
  ledgerSubject,
  movesFor,
  readLockedLabels,
  recordHorizon,
  sentenceAround,
  sortDossiers,
  stampLetter,
  standOf,
  verdictWord,
  type DossierInput,
  type EncounterScore,
  type FieldDossier,
} from './dossier'
import { loadChronicle, type ChronicleEntry } from './chronicle'
import { orderInstruments, type InstrumentMeta } from './latest'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const WERKE = `${ROOT}src/components/field/werke`
const ENCOUNTERS = `${ROOT}src/data/begegnungen`

/** The real mirror, read the way the page's globs hand it over. */
function realInput(): DossierInput {
  const instruments: [string, InstrumentMeta][] = []
  const files: string[] = []
  for (const dir of readdirSync(WERKE)) {
    if (!statSync(`${WERKE}/${dir}`).isDirectory()) continue
    for (const name of readdirSync(`${WERKE}/${dir}`)) {
      files.push(`/src/components/field/werke/${dir}/${name}`)
    }
    instruments.push([dir, JSON.parse(readFileSync(`${WERKE}/${dir}/meta.json`, 'utf8'))])
  }
  const encounters: EncounterScore[] = readdirSync(ENCOUNTERS)
    .filter((d) => statSync(`${ENCOUNTERS}/${d}`).isDirectory())
    .map((d) => JSON.parse(readFileSync(`${ENCOUNTERS}/${d}/score.json`, 'utf8')))
  return {
    instruments,
    chronicle: loadChronicle(),
    encounters,
    files,
    claimOf: '2026-07-26-unable-to-ring-its-own-bell',
    tourOf: ['2026-07-25-no-signal-to-extend', '2026-07-26-unable-to-ring-its-own-bell'],
  }
}

const real = buildFieldDossiers(realInput())
const bySlug = (slug: string): FieldDossier => {
  const d = real.find((x) => x.slug === slug)
  if (!d) throw new Error(`no dossier for ${slug}`)
  return d
}

// ————————————————————————————————————————————————— locked labels —————————————

describe('locked labels', () => {
  it('takes a run of two or more capitalised words', () => {
    expect(isLockedLabel('NO SIGNAL BEYOND ORDINARY DRIFT')).toBe(true)
    expect(isLockedLabel('FILED IN PART')).toBe(true)
  })

  it('takes a hyphenated capitalised token', () => {
    expect(isLockedLabel('UNABLE-TO-RING-ITS-OWN-BELL')).toBe(true)
    expect(isLockedLabel('NO-ANOMALY')).toBe(true)
  })

  it('refuses a bare acronym — vocabulary is not a verdict', () => {
    expect(isLockedLabel('MTLD')).toBe(false)
    expect(isLockedLabel('CSP')).toBe(false)
  })

  it('refuses a token with an all-digit part — HTTP-200 is a status code', () => {
    expect(isLockedLabel('HTTP-200')).toBe(false)
  })

  it('refuses a run containing a single letter', () => {
    expect(isLockedLabel('RECIPE A')).toBe(false)
  })

  it('carries the sentence the label stands in, verbatim', () => {
    const text = 'One thing happened. The locked label is UNABLE-TO-RING-ITS-OWN-BELL and no null counts. Then more.'
    const [found] = readLockedLabels([{ text, source: 'x' }])
    expect(found.label).toBe('UNABLE-TO-RING-ITS-OWN-BELL')
    expect(found.sentence).toBe('The locked label is UNABLE-TO-RING-ITS-OWN-BELL and no null counts.')
    expect(text).toContain(found.sentence)
  })

  it('carries a repeated label once', () => {
    const text = 'FILED IN PART here. And FILED IN PART again.'
    expect(readLockedLabels([{ text, source: 'x' }]).map((l) => l.label)).toEqual(['FILED IN PART'])
  })

  it('reads an unterminated tail as its own sentence rather than dropping it', () => {
    expect(sentenceAround('the verdict is NO SIGNAL', 14, 9)).toBe('the verdict is NO SIGNAL')
  })
})

// ————————————————————————————————————————————————— the stand —————————————————

describe('the stand', () => {
  const move = (verdict: string | null) => ({
    seq: 9,
    date: '2026-07-30',
    session: 70,
    move: 'ship',
    verdict,
    summary: 'a summary long enough to pass the schema',
    anchor: 'cs-70',
    source: 'src/data/field/chronicle.upstream.json',
  })

  it('reads the chronicle vocabulary off the leading word of a free verdict', () => {
    expect(verdictWord('deferred — built as a draft, full gauntlet owed')).toBe('deferred')
    expect(verdictWord('graduated')).toBe('graduated')
  })

  it('refuses to force a freely worded verdict into the vocabulary', () => {
    expect(verdictWord('shipped as instrument 019, an offer')).toBeNull()
    expect(verdictWord(null)).toBeNull()
  })

  it('calls the newest instrument in service whatever its verdict says', () => {
    expect(standOf([move('graduated')], true).key).toBe('in-service')
  })

  it('names a known review word', () => {
    const stand = standOf([move('graduated')], false)
    expect(stand.key).toBe('reviewed')
    expect(stand.verdictWord).toBe('graduated')
  })

  it('keeps a freely worded verdict verbatim instead of squeezing it into a word', () => {
    const stand = standOf([move('shipped as instrument 019, an offer')], false)
    expect(stand.key).toBe('recorded')
    expect(stand.verdictWord).toBeNull()
    expect(stand.verdictText).toBe('shipped as instrument 019, an offer')
  })

  it('states an instrument the register does not name, rather than filling it in', () => {
    const stand = standOf([], false)
    expect(stand.key).toBe('unregistered')
    expect(stand.verdictText).toBeNull()
    expect(stand.from).toBeNull()
  })
})

// ————————————————————————————————————————————————— attachment rule 1 —————————

describe('register → instrument', () => {
  const entry = (over: Partial<ChronicleEntry>): ChronicleEntry => ({
    seq: 1,
    date: '2026-07-01',
    collective_session: 1,
    move: 'build',
    summary: 'a summary long enough to pass the schema',
    works: [],
    verdict: null,
    fail: false,
    journal_id: 'journal/2026-07-01.md',
    anchor: 'cs-1',
    source: 'curated',
    ...over,
  })

  it('attaches only on the entry’s own works array', () => {
    const chronicle = [
      entry({ seq: 1, works: ['a-work'] }),
      entry({ seq: 2, works: [] }),
      entry({ seq: 3, works: ['another-work'] }),
    ]
    expect(movesFor(chronicle, 'a-work').map((m) => m.seq)).toEqual([1])
  })

  it('returns the register newest first', () => {
    const chronicle = [entry({ seq: 1, works: ['w'] }), entry({ seq: 4, works: ['w'] })]
    expect(movesFor(chronicle, 'w').map((m) => m.seq)).toEqual([4, 1])
  })

  it('names the half of the register each entry came from', () => {
    expect(chronicleSource(entry({ source: 'curated' }))).toContain('curated')
    expect(chronicleSource(entry({ source: 'upstream' }))).toContain('upstream')
  })
})

// ————————————————————————————————————————————————— attachment rule 2 —————————

describe('encounter → instrument', () => {
  const score = (akte: string, id: string): EncounterScore => ({
    encounter_id: id,
    headline: 'h',
    akte,
    status: { as_of: '2026-07-17', statusLine: 's' },
    events: [],
    obligations: [],
  })

  it('attaches where the akte path names the instrument', () => {
    expect(
      ledgerSubject(score('/akte/encounters/enc-2026-001-calibration-gap-travels', 'enc-2026-001-calibration-gap-travels'), [
        '2026-07-01-calibration-gap',
        '2026-07-09-the-floor',
      ]),
    ).toBe('2026-07-01-calibration-gap')
  })

  it('attaches to nothing where the encounter names no instrument', () => {
    expect(
      ledgerSubject(score('/akte/encounters/enc-2026-005-atlas-lent-not-lifted', 'enc-2026-005-atlas-lent-not-lifted'), [
        '2026-07-01-calibration-gap',
      ]),
    ).toBeNull()
  })

  it('gives a longer name precedence over a shorter one it contains', () => {
    expect(
      ledgerSubject(score('/akte/encounters/enc-x-the-edition-ii-travels', 'enc-x'), [
        '2026-07-01-the-edition',
        '2026-07-02-the-edition-ii',
      ]),
    ).toBe('2026-07-02-the-edition-ii')
  })

  it('reads the encounter’s short id off its own long one', () => {
    expect(encounterId(score('/a', 'enc-2026-001-calibration-gap-travels'))).toBe('enc-2026-001')
  })

  it('strips the date prefix off a slug', () => {
    expect(instrumentName('2026-07-01-calibration-gap')).toBe('calibration-gap')
  })
})

// ————————————————————————————————————————————————— the plate —————————————————

describe('the record plate', () => {
  it('draws this practice’s own lane plus the correction arriving from outside', () => {
    const events = [
      { event_type: 'contract.published', date: '2026-07-11', lane: 'meridian', infra: false },
      { event_type: 'object.admitted', date: '2026-07-12', lane: 'ensemble', infra: false },
      { event_type: 'correction.issued', date: '2026-07-12', lane: 'conductor', infra: false },
      { event_type: 'correction.applied', date: '2026-07-12', lane: 'meridian', infra: false },
      { event_type: 'derivative.published', date: '2026-07-12', lane: 'ensemble', infra: true },
    ]
    const drawn = drawnLedgerEvents({
      encounter_id: 'x',
      headline: 'h',
      akte: '/a',
      status: { as_of: '2026-07-17', statusLine: 's' },
      events,
      obligations: [],
    })
    expect(drawn.map((e) => e.event_type)).toEqual([
      'contract.published',
      'correction.issued',
      'correction.applied',
    ])
  })

  it('takes the stamp letter from the record’s own word', () => {
    expect(stampLetter('correction.applied')).toBe('A')
    expect(stampLetter('steer')).toBe('S')
    expect(stampLetter('rework + gauntlet (inward)')).toBe('R')
  })

  it('never fans more marks onto one day than the plate’s fan holds', () => {
    for (const d of real) {
      const perDay = new Map<string, number>()
      for (const m of d.marks) perDay.set(m.date, (perDay.get(m.date) ?? 0) + 1)
      expect(Math.max(...perDay.values())).toBeLessThanOrEqual(4)
    }
  })

  it('puts every mark on its own plate’s span', () => {
    for (const d of real) {
      for (const m of d.marks) expect(d.days).toContain(m.date)
    }
  })

  it('runs every plate on to the same horizon — the date the committed record ends on', () => {
    const input = realInput()
    const horizon = recordHorizon(input)
    expect(horizon).toBe([...input.chronicle].map((e) => e.date).sort().at(-1))
    for (const d of real) expect(d.days.at(-1)).toBe(horizon)
  })

  it('starts every plate at its own instrument’s earliest mark', () => {
    for (const d of real) {
      expect(d.days[0]).toBe([...d.marks].map((m) => m.date).sort()[0])
    }
  })

  it('never draws a plate too narrow to read — the crop-to-marks version drew square ones', () => {
    // The guard is against an EMPTY plate and against the crop-to-marks square.
    // A one-day plate is not that: strip.ts declares it legitimate in as many
    // words ("a work shipped today yields the legitimate one-day span") and
    // buildControlSvg degenerates cleanly into it (step 0, every mark at X0).
    // This assertion read `> 1` until 2026-08-03, which was true of the record
    // only because no instrument had yet shipped ON the horizon date — a fact
    // about the corpus, asserted as if it were a property of the drawing.
    const horizon = recordHorizon(realInput())
    for (const d of real) {
      expect(d.days.length).toBeGreaterThanOrEqual(1)
      // Anything that shipped before the record ends still has to span.
      if (d.days[0] < horizon) expect(d.days.length).toBeGreaterThan(1)
    }
  })
})

// ————————————————————————————————————————————————— the committed record ——————

describe('the dossiers, against the committed record', () => {
  it('builds one dossier per committed instrument', () => {
    // Read off the mirror, not pinned to a number. The pinned version (`toHaveLength(21)`) was a
    // tripwire that could only be disarmed by a change no engine repository can make in advance:
    // a proposal pinning the next number fails here until the work is integrated, and integration
    // is what this suite gates. Same assertion, stated as the invariant it was always testing —
    // one dossier per instrument in the mirror, none dropped, none duplicated.
    const mirrored = realInput().instruments.map(([slug]) => slug)
    expect([...real].map((d) => d.slug).sort()).toEqual([...mirrored].sort())
    expect(real).toHaveLength(mirrored.length)
  })

  it('numbers instruments by their position in the committed order', () => {
    expect(bySlug('2026-07-01-calibration-gap').no).toBe('001')
    expect(bySlug('2026-07-25-no-signal-to-extend').no).toBe('018')
    expect(bySlug('2026-07-26-unable-to-ring-its-own-bell').no).toBe('020')
  })

  it('leads with the instrument in service — the newest in the committed order', () => {
    // The claim under test is "the entrance leads with the newest instrument, and exactly one is
    // in service" — not the identity of whichever work happens to be newest this week. Derived
    // from the mirror for the same reason as the count above.
    const newest = orderInstruments(realInput().instruments).at(-1)?.[0]
    expect(real[0].slug).toBe(newest)
    expect(real[0].inService).toBe(true)
    expect(real.filter((d) => d.inService)).toHaveLength(1)
  })

  it('reads the earlier instruments newest-first behind it', () => {
    const rest = real.slice(1).map((d) => d.date)
    expect([...rest].sort().reverse()).toEqual(rest)
  })

  it('carries the locked verdicts the brief names, verbatim', () => {
    expect(bySlug('2026-07-25-no-signal-to-extend').locked.map((l) => l.label)).toEqual([
      'NO-ANOMALY',
      'NO SIGNAL BEYOND ORDINARY DRIFT',
    ])
    expect(bySlug('2026-07-26-unable-to-ring-its-own-bell').locked.map((l) => l.label)).toEqual([
      'NO SIGNAL BEYOND OUR OWN ORDINARY DRIFT',
      'UNABLE-TO-RING-ITS-OWN-BELL',
    ])
  })

  it('quotes every locked sentence out of the file it names', () => {
    for (const d of real) {
      for (const locked of d.locked) {
        const raw = readFileSync(`${ROOT}${locked.source}`, 'utf8')
        const meta = JSON.parse(raw)
        const fields = `${meta.embodies ?? ''}\n${meta.medium ?? ''}`
        expect(fields).toContain(locked.sentence)
      }
    }
  })

  it('quotes what an instrument measures out of its own meta.json', () => {
    const d = bySlug('2026-07-26-unable-to-ring-its-own-bell')
    expect(d.measures?.source).toBe('src/components/field/werke/2026-07-26-unable-to-ring-its-own-bell/meta.json')
    const meta = JSON.parse(readFileSync(`${ROOT}${d.measures!.source}`, 'utf8'))
    expect(d.measures?.text).toBe(meta.embodies)
    expect(d.makeup?.text).toBe(meta.medium)
  })

  it('states the one instrument the register never names, rather than borrowing moves', () => {
    const d = bySlug('2026-07-17-comparable-with-humans')
    expect(d.moves).toHaveLength(0)
    expect(d.stand.key).toBe('unregistered')
  })

  it('attaches every register entry to a work the entry itself names', () => {
    const chronicle = loadChronicle()
    for (const d of real) {
      for (const m of d.moves) {
        const entry = chronicle.find((e) => e.seq === m.seq)
        expect(entry?.works).toContain(d.slug)
      }
    }
  })

  it('quotes the register verbatim', () => {
    const chronicle = loadChronicle()
    for (const d of real) {
      for (const m of d.moves) {
        const entry = chronicle.find((e) => e.seq === m.seq)!
        expect(m.summary).toBe(entry.summary)
        expect(m.move).toBe(entry.move)
        expect(m.verdict).toBe(entry.verdict)
      }
    }
  })

  it('files the encounter ledger on the instrument its own akte names, and nowhere else', () => {
    expect(bySlug('2026-07-01-calibration-gap').ledger?.encounterId).toBe('enc-2026-001')
    expect(real.filter((d) => d.ledger !== null).map((d) => d.slug)).toEqual([
      '2026-07-01-calibration-gap',
    ])
  })

  it('draws the contract, the correction from outside and the correction applied on that plate', () => {
    const d = bySlug('2026-07-01-calibration-gap')
    // Named by date, not counted: enc-2026-001's ledger is append-only, and the source has
    // since re-published and reframed its standing conditions (2026-08-01), so three contract
    // marks now sit on this plate where one did. All three belong there. What the plate must
    // still show is the founding contract that opens the obligation span, and the correction
    // that came from outside — a pinned total would report the record's own honest growth as
    // a regression.
    expect(d.marks.filter((m) => m.role === 'contract').map((m) => m.date)).toContain('2026-07-11')
    expect(d.marks.filter((m) => m.role === 'correction-issued').map((m) => m.date)).toContain(
      '2026-07-12',
    )
    expect(d.obligation?.fromDate).toBe('2026-07-11')
    expect(d.obligation?.labels.length).toBeGreaterThan(0)
  })

  it('carries the contested claim on exactly the instrument the caller ties it to', () => {
    expect(real.filter((d) => d.hasClaim).map((d) => d.slug)).toEqual([
      '2026-07-26-unable-to-ring-its-own-bell',
    ])
  })

  it('marks exactly the instruments the guided tour walks', () => {
    expect(real.filter((d) => d.inTour).map((d) => d.slug).sort()).toEqual([
      '2026-07-25-no-signal-to-extend',
      '2026-07-26-unable-to-ring-its-own-bell',
    ])
  })

  it('lists what each instrument’s record consists of', () => {
    expect(bySlug('2026-07-20-coverage-not-custody').sources.map((s) => s.label)).toEqual([
      'data.json',
      'index.astro',
      'meta.json',
      'results-subtest.json',
      'results-x-subtest.json',
      'results.json',
      'sample.json',
    ])
  })

  it('gives every dossier a deep-linkable, unique slug', () => {
    expect(new Set(real.map((d) => d.slug)).size).toBe(real.length)
  })
})

describe('sortDossiers', () => {
  const d = (slug: string, date: string, inService = false): FieldDossier =>
    ({ slug, date, inService, no: '000' }) as FieldDossier

  it('puts the instrument in service first, then the rest newest-first', () => {
    const sorted = sortDossiers([
      d('old', '2026-07-01'),
      d('service', '2026-07-10', true),
      d('newer', '2026-07-09'),
    ])
    expect(sorted.map((x) => x.slug)).toEqual(['service', 'newer', 'old'])
  })
})
