import { describe, expect, it } from 'vitest'
import registerJson from '@/data/begegnungen/register.json'
import inquiriesJson from '@/data/begegnungen/joint-inquiries.json'
import enc001 from '@/data/begegnungen/enc-2026-001/score.json'
import enc005 from '@/data/begegnungen/enc-2026-005/score.json'
import {
  buildCrossings,
  buildEncounter,
  buildJointInquiry,
  crossingVoices,
  encounterSlug,
  leadCrossing,
  leadingClause,
  normaliseVoice,
  sortCrossings,
  sortRows,
  standingOf,
  VOICES,
  type Crossing,
  type CrossingsInput,
} from './crossings'

const REAL: CrossingsInput = {
  inquiries: inquiriesJson,
  register: registerJson,
  ledgers: { 'enc-2026-001': enc001, 'enc-2026-005': enc005 },
}

describe('normaliseVoice', () => {
  it('reconciles the spellings the three exports do not agree on', () => {
    expect(normaliseVoice('frank')).toBe('conductor')
    expect(normaliseVoice('frank-bueltge')).toBe('conductor')
    expect(normaliseVoice('data-snack-plenum')).toBe('plenum')
    expect(normaliseVoice('plenum')).toBe('plenum')
    expect(normaliseVoice('  Meridian  ')).toBe('meridian')
  })

  it('answers unknown rather than guessing, for anything and for nothing', () => {
    expect(normaliseVoice('some-collective-invented-tonight')).toBe('unknown')
    expect(normaliseVoice(undefined)).toBe('unknown')
    expect(normaliseVoice(null)).toBe('unknown')
    expect(normaliseVoice(42)).toBe('unknown')
    expect(normaliseVoice({})).toBe('unknown')
  })

  it('gives MRR Meridian’s hue and a standing caveat — the tool is the practice’s, the run’s authorship is not', () => {
    expect(VOICES.mrr.hue).toBe('meridian')
    expect(VOICES.mrr.caveat).toBeTruthy()
    expect(VOICES.meridian.caveat).toBeNull()
  })

  it('keeps the conductor outside the categorical set', () => {
    expect(VOICES.conductor.hue).toBe('neutral')
  })
})

/** The cut three surfaces share since 2026-08-02 — /encounters' orientation answer,
 *  /maschinenraum's teaser line, and standingOf itself. A second split somewhere else is a second
 *  rule, so this one is pinned. */
describe('leadingClause', () => {
  it('cuts at the record’s own dash and quotes what stands before it', () => {
    expect(leadingClause('open/standing — transport automated, translation manual')).toBe('open/standing')
    expect(leadingClause('REVIEW')).toBe('REVIEW')
    // en dash as well as em dash: the exports use both
    expect(leadingClause('closed – the correction landed')).toBe('closed')
  })

  it('answers null where the record states nothing, and never an empty string', () => {
    expect(leadingClause(null)).toBeNull()
    expect(leadingClause(undefined)).toBeNull()
    expect(leadingClause('')).toBeNull()
    expect(leadingClause('   ')).toBeNull()
    // a line that opens with the dash keeps the whole line rather than collapsing to nothing
    expect(leadingClause('— the correction landed')).toBe('— the correction landed')
  })
})

describe('standingOf', () => {
  it('reads the record’s own status words', () => {
    expect(standingOf('open/standing — transport automated')).toBe('open')
    expect(standingOf('REVIEW')).toBe('open')
    expect(standingOf('unresolved — both readings stand')).toBe('open')
    expect(standingOf('closed')).toBe('concluded')
    expect(standingOf('resolved — the correction landed')).toBe('concluded')
  })

  it('reads the standing from the leading clause, not from a word buried in what happened since', () => {
    // The real enc-2026-004 line, shortened. The encounter is open; a work INSIDE it was
    // withdrawn. Scanning the whole paragraph closed a crossing the register left open.
    expect(
      standingOf(
        'open/standing — 11 works re-cooked, three open corrections (one-tap’s source premiere was KILLED/WITHDRAWN at source 2026-07-25)',
      ),
    ).toBe('open')
  })

  it('falls back to the whole line where the leading clause states no status at all', () => {
    expect(standingOf('the correction landed — resolved')).toBe('concluded')
  })

  it('says unstated where the register states nothing — never "concluded" by silence', () => {
    expect(standingOf(null)).toBe('unstated')
    expect(standingOf(undefined)).toBe('unstated')
    expect(standingOf('')).toBe('unstated')
    expect(standingOf('   ')).toBe('unstated')
    expect(standingOf('a sentence with no status word in it at all')).toBe('unstated')
  })
})

describe('encounterSlug', () => {
  it('derives the export folder the way the export itself does', () => {
    expect(encounterSlug('enc-2026-005-atlas-lent-not-lifted')).toBe('enc-2026-005')
    expect(encounterSlug('enc-2026-001-calibration-gap-travels')).toBe('enc-2026-001')
  })

  it('does not throw on an id shorter than the pattern', () => {
    expect(encounterSlug('enc')).toBe('enc')
    expect(encounterSlug('')).toBe('')
  })
})

describe('buildJointInquiry against the committed register', () => {
  const ji = buildJointInquiry(inquiriesJson[0])!

  it('builds a crossing at all', () => {
    expect(ji).not.toBeNull()
    expect(ji.kind).toBe('joint-inquiry')
    expect(ji.id).toBe('ji-2026-002')
    expect(ji.anchor).toBe('model-collapse')
  })

  it('is open — three practices with a question still under review', () => {
    expect(ji.standing).toBe('open')
  })

  it('quotes the shared question verbatim, beside the path it was read from', () => {
    expect(ji.question?.text).toBe(inquiriesJson[0].public_summary)
    expect(ji.question?.source).toBe('src/data/begegnungen/joint-inquiries.json')
  })

  it('names every participating voice with the record’s own commitment word', () => {
    expect(ji.voices.map((v) => v.voice).sort()).toEqual(['ensemble', 'meridian', 'ulysses'])
    expect(ji.voices.find((v) => v.voice === 'meridian')?.role).toBe('ACTIVE')
  })

  it('carries each practice’s own question and first claim verbatim, sourced to that practice’s own file', () => {
    const ulysses = ji.voices.find((v) => v.voice === 'ulysses')!
    expect(ulysses.localQuestion?.text).toContain('excess-vocabulary shift')
    expect(ulysses.localQuestion?.source).toContain('github.com/frankbueltge/ulysses')
    expect(ulysses.headlineClaim?.text).toContain('TRACE.md')
  })

  it('attaches every row by a named rule, and only by the practice’s own commitment', () => {
    expect(ji.rows.length).toBeGreaterThan(0)
    expect(new Set(ji.rows.map((r) => r.by))).toEqual(new Set(['ji-commitment', 'ji-status']))
  })

  it('lists the practices’ own records among its sources, not only the mirror', () => {
    expect(ji.sources[0].path).toBe('src/data/begegnungen/joint-inquiries.json')
    expect(ji.sources.length).toBeGreaterThan(1)
  })
})

describe('buildEncounter against the committed register', () => {
  const withLedger = buildEncounter(registerJson[4], enc005)!
  const withoutLedger = buildEncounter(registerJson[2])!

  it('reads the encounter with a ledger export as a dated chronology, verbatim', () => {
    expect(withLedger.id).toBe('enc-2026-005-atlas-lent-not-lifted')
    expect(withLedger.anchor).toBe('enc-2026-005')
    const events = withLedger.rows.filter((r) => r.by === 'ledger-event')
    // Exactly the events the ledger gives an isolated quote — never more (this site would
    // have to write the missing words) and never fewer (it would be dropping the record).
    expect(events).toHaveLength(enc005.events.filter((e) => e.quote).length)
    expect(events[0].text).toBeTruthy()
    expect(events.every((r) => r.source === 'src/data/begegnungen/enc-2026-005/score.json')).toBe(true)
  })

  it('carries the ledger’s standing obligations as rows of their own rule, undated on purpose', () => {
    const obligations = buildEncounter(registerJson[0], enc001)!.rows.filter((r) => r.by === 'ledger-obligation')
    expect(obligations.length).toBeGreaterThan(0)
    expect(obligations.every((r) => r.date === null)).toBe(true)
  })

  it('keeps the ledger’s documented non-relation — a silence the record designed, not a gap', () => {
    const enc1 = buildEncounter(registerJson[0], enc001)!
    expect(enc1.nonParticipation.length).toBeGreaterThan(0)
    expect(enc1.nonParticipation[0].voice).toBe('ulysses')
    expect(enc1.nonParticipation[0].note).toContain('non-relation')
  })

  it('still builds a crossing for an encounter with no ledger export, from the register alone', () => {
    expect(withoutLedger.id).toBe('enc-2026-003-school-replicates')
    expect(withoutLedger.rows.every((r) => r.by === 'register-status')).toBe(true)
    expect(withoutLedger.sources).toHaveLength(1)
    expect(withoutLedger.standing).toBe('open')
  })

  it('reads the register’s status in both shapes it has had, and calls a null status unstated', () => {
    const enc1 = buildEncounter(registerJson[0], enc001)!
    expect(enc1.standing).toBe('unstated')
    expect(enc1.status).toBeNull()
    expect(withLedger.status?.text).toContain('open/standing')
    expect(withLedger.asOf).toBe('2026-07-31')
  })

  it('accepts a legacy string status without a branch in the caller', () => {
    const legacy = buildEncounter({ encounter_id: 'enc-2026-009-x', status: 'open/standing' })!
    expect(legacy.standing).toBe('open')
    expect(legacy.status?.text).toBe('open/standing')
    expect(legacy.asOf).toBeNull()
  })

  it('names the conductor as the voice of the register’s own status line', () => {
    const registerRow = withLedger.rows.find((r) => r.by === 'register-status')!
    expect(registerRow.voice).toBe('conductor')
    expect(registerRow.source).toBe('src/data/begegnungen/register.json')
  })
})

describe('buildCrossings over everything committed today', () => {
  const crossings = buildCrossings(REAL)

  it('holds every joint inquiry and every recorded encounter, and nothing else', () => {
    expect(crossings).toHaveLength(inquiriesJson.length + registerJson.length)
    expect(crossings.filter((c) => c.kind === 'joint-inquiry')).toHaveLength(1)
    expect(crossings.filter((c) => c.kind === 'encounter')).toHaveLength(5)
  })

  it('leads with the running joint inquiry — the thing the practices are doing together now', () => {
    const lead = leadCrossing(crossings)!
    expect(lead.kind).toBe('joint-inquiry')
    expect(lead.id).toBe('ji-2026-002')
  })

  it('gives every crossing a unique anchor, so a deep link means one thing', () => {
    const anchors = crossings.map((c) => c.anchor)
    expect(new Set(anchors).size).toBe(anchors.length)
  })

  it('quotes only — every row carries a source path and a named attachment rule', () => {
    for (const c of crossings) {
      for (const r of c.rows) {
        expect(r.source, `${c.id}: a row without a source`).toBeTruthy()
        expect(r.by, `${c.id}: a row without a rule`).toBeTruthy()
        expect(r.text.trim(), `${c.id}: an empty row`).not.toBe('')
      }
    }
  })

  it('explains a hue only where a voice actually appears', () => {
    const voices = crossingVoices(crossings).map((v) => v.id)
    expect(voices).toContain('meridian')
    expect(voices).toContain('conductor')
    expect(voices).not.toContain('unknown')
  })
})

describe('sortCrossings', () => {
  const stub = (over: Partial<Crossing>): Crossing => ({
    kind: 'encounter',
    id: 'x',
    anchor: 'x',
    matchIds: ['x'],
    title: 'x',
    question: null,
    standing: 'open',
    status: null,
    asOf: null,
    lastMove: null,
    recordUrl: null,
    voices: [],
    rows: [],
    sources: [],
    nonParticipation: [],
    divergence: null,
    ...over,
  })

  it('puts what is open before what the record left unstated, and both before what closed', () => {
    const order = sortCrossings([
      stub({ id: 'closed', standing: 'concluded', lastMove: '2026-08-02' }),
      stub({ id: 'unstated', standing: 'unstated', lastMove: '2026-08-01' }),
      stub({ id: 'open', standing: 'open', lastMove: '2026-01-01' }),
    ]).map((c) => c.id)
    expect(order).toEqual(['open', 'unstated', 'closed'])
  })

  it('puts the shared question ahead of an encounter that moved the same day', () => {
    const order = sortCrossings([
      stub({ id: 'enc', kind: 'encounter', lastMove: '2026-07-31' }),
      stub({ id: 'ji', kind: 'joint-inquiry', lastMove: '2026-07-31' }),
    ]).map((c) => c.id)
    expect(order).toEqual(['ji', 'enc'])
  })

  it('is stable for two crossings the record dates identically', () => {
    const order = sortCrossings([stub({ id: 'b' }), stub({ id: 'a' })]).map((c) => c.id)
    expect(order).toEqual(['a', 'b'])
  })
})

describe('sortRows', () => {
  it('reads newest first and sends an undated row to the end, never to 1970', () => {
    const rows = sortRows([
      { date: null, voice: 'ensemble', rawVoice: null, label: 'obligation', text: 'still standing', attribution: null, source: 's', by: 'ledger-obligation' },
      { date: '2026-07-21', voice: 'mrr', rawVoice: null, label: 'a', text: 'a', attribution: null, source: 's', by: 'ledger-event' },
      { date: '2026-07-26', voice: 'ulysses', rawVoice: null, label: 'b', text: 'b', attribution: null, source: 's', by: 'ledger-event' },
    ])
    expect(rows.map((r) => r.date)).toEqual(['2026-07-26', '2026-07-21', null])
  })
})

// ————————————————————————————————————————————————— degrading honestly ———————
//
// These inputs are regenerated by an export chain that runs after every engine session and
// gates three repositories' publishing. The rule is absolute: an unexpected shape degrades to
// "the record states none", and NOTHING here throws — a malformed field must never be able to
// take the contact zone's page off the site.

describe('never throws on what tomorrow’s export might write', () => {
  const junk: unknown[] = [
    null,
    undefined,
    42,
    'a string where an object belongs',
    [],
    {},
    { participants: 'not an array' },
    { participants: [null, 7, 'x'] },
    { encounter_id: 'enc-2026-009-x', status: { as_of: 'yesterday', statusLine: 12 } },
    { encounter_id: 'enc-2026-009-x', participants: [{ id: null, role: {} }] },
    { inquiry_id: 'ji-2026-009', participants: [{ practice_id: 5, local_question: [] }] },
  ]

  it('builds or declines to build, but never explodes', () => {
    for (const j of junk) {
      expect(() => buildEncounter(j as never)).not.toThrow()
      expect(() => buildJointInquiry(j as never)).not.toThrow()
    }
  })

  it('declines a record with no id, rather than inventing one', () => {
    expect(buildEncounter({})).toBeNull()
    expect(buildEncounter({ encounter_id: '   ' })).toBeNull()
    expect(buildJointInquiry({})).toBeNull()
    expect(buildJointInquiry({ inquiry_id: 42 })).toBeNull()
  })

  it('survives a whole input that is not the shape it expects', () => {
    expect(() => buildCrossings({ inquiries: null as never, register: null as never, ledgers: {} })).not.toThrow()
    expect(buildCrossings({ inquiries: null as never, register: null as never, ledgers: {} })).toEqual([])
    expect(() => buildCrossings({ inquiries: [null as never], register: ['x' as never], ledgers: {} })).not.toThrow()
  })

  it('keeps a participant it has never heard of, with the raw id printed beside it', () => {
    const c = buildEncounter({
      encounter_id: 'enc-2026-009-x',
      participants: [{ id: 'a-collective-founded-tonight', role: 'source' }],
    })!
    expect(c.voices).toHaveLength(1)
    expect(c.voices[0].voice).toBe('unknown')
    expect(c.voices[0].rawVoice).toBe('a-collective-founded-tonight')
  })

  it('skips a ledger event with no isolated quote rather than writing one', () => {
    const c = buildEncounter({ encounter_id: 'enc-2026-009-x' }, {
      events: [
        { event_type: 'offer.filed', date: '2026-08-01', lane: 'meridian' },
        { event_type: 'offer.answered', date: '2026-08-02', lane: 'ulysses', quote: 'answered the same evening' },
      ],
    })!
    const events = c.rows.filter((r) => r.by === 'ledger-event')
    expect(events).toHaveLength(1)
    expect(events[0].text).toBe('answered the same evening')
  })

  it('ignores a date the export writes in a shape that is not a date', () => {
    const c = buildEncounter({ encounter_id: 'enc-2026-009-x', status: { as_of: '31.07.2026', statusLine: 'open' } })!
    expect(c.asOf).toBeNull()
    expect(c.standing).toBe('open')
  })
})
