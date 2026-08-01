// Guard for the house dossier: it must read every word out of the committed record, attach every
// entry by an explicit rule, and state a gap rather than fill it. Two layers, the same shape as
// season.test.ts — the REAL committed data (so the dossiers the site actually ships are under test)
// and small fixtures for the shapes the record does not currently contain.
import { describe, expect, it } from 'vitest'
import chronicleUpstream from '@/data/studio/chronicle.upstream.json'
import stageData from '@/data/studio/stage.curated.json'
import oneTap from '@/content/studio/works/2026-07-23-one-tap/meta.json'
import nativeSpeaker from '@/content/studio/works/2026-07-13-native-speaker/meta.json'
import noWay from '@/content/studio/works/2026-07-17-no-way-of-knowing/meta.json'
import recovery from '@/content/studio/works/2026-07-21-recovery/meta.json'
import noPart from '@/content/studio/works/2026-07-30-no-part/meta.json'
import { buildSeasonModel, type SeasonKill } from './season'
import {
  buildStudioDossiers,
  currentPremiere,
  dossierIdForMark,
  firstSentence,
  isWithdrawn,
  markIndex,
  readTiers,
  readWithdrawal,
  type DossierChronicleEntry,
  type DossierKill,
  type StudioDossierInput,
} from './dossier'

const METAS = {
  '2026-07-13-native-speaker': nativeSpeaker,
  '2026-07-17-no-way-of-knowing': noWay,
  '2026-07-21-recovery': recovery,
  '2026-07-23-one-tap': oneTap,
  '2026-07-30-no-part': noPart,
}

/** The upstream mirror carries no `anchor` — the merge derives it. For these tests the derivation
 *  is not the subject, so the same rule is applied inline and the merged shape is exercised. */
const CHRONICLE: DossierChronicleEntry[] = chronicleUpstream.map((e) => ({
  date: e.date,
  collective_session: e.collective_session,
  move: e.move,
  summary: e.summary,
  works: e.works,
  verdict: e.verdict ?? null,
  anchor: `cs-${e.collective_session}`,
}))

const KILLS = stageData.kills as DossierKill[]
const CHRONICLE_PATH = 'src/data/studio/chronicle.upstream.json'

const REAL: StudioDossierInput = { chronicle: CHRONICLE, metas: METAS, kills: KILLS }

const ONE_TAP = '2026-07-23-one-tap'
const NO_PART = '2026-07-30-no-part'

describe('buildStudioDossiers over the committed record', () => {
  const dossiers = buildStudioDossiers(REAL)
  const byId = new Map(dossiers.map((d) => [d.id, d]))

  it('is pure: the same committed data yields the same dossiers', () => {
    expect(JSON.stringify(buildStudioDossiers(REAL))).toBe(JSON.stringify(dossiers))
  })

  it('carries one dossier per body of the house — five premieres and seven strikes', () => {
    expect(dossiers.filter((d) => d.state === 'premiered')).toHaveLength(4)
    expect(dossiers.filter((d) => d.state === 'withdrawn')).toHaveLength(1)
    expect(dossiers.filter((d) => d.state === 'struck')).toHaveLength(KILLS.length)
    expect(dossiers).toHaveLength(5 + KILLS.length)
  })

  it('leads with the current premiere, derived from the record and never typed', () => {
    expect(dossiers[0].id).toBe(NO_PART)
    expect(dossiers[0].spotlight).toBe(true)
    expect(dossiers.filter((d) => d.spotlight)).toHaveLength(1)
  })

  it('never puts the withdrawn work in the spotlight, however new its premiere is', () => {
    // One Tap shipped in session 31 and was withdrawn in 43: a newest-ship rule alone would light it
    const newestShip = [...CHRONICLE].reverse().find((e) => e.move === 'ship' && e.works.length > 0)
    expect(newestShip?.works[0]).toBe(NO_PART)
    expect(byId.get(ONE_TAP)?.spotlight).toBe(false)
    expect(byId.get(ONE_TAP)?.state).toBe('withdrawn')
  })

  it('quotes each work’s own description verbatim, beside the path it came from', () => {
    const d = byId.get(NO_PART)!
    expect(d.description?.text).toBe(noPart.embodies)
    expect(d.description?.source).toBe('src/content/studio/works/2026-07-30-no-part/meta.json')
    expect(d.form?.text).toBe(noPart.medium)
  })

  it('carries the eye’s three returns of One Tap, in order, with its own words', () => {
    const d = byId.get(ONE_TAP)!
    expect(d.returns.map((r) => r.ordinal)).toEqual([1, 2, 3])
    expect(d.returns.map((r) => r.ordinalRoman)).toEqual(['I', 'II', 'III'])
    expect(d.returns.map((r) => r.session)).toEqual(['S28', 'S32', 'S43'])
    expect(d.returns[0].quote).toBe('badly staged, and it is not art')
    expect(d.returns[1].quote).toBe(
      'keep working on the staging; this is even worse staged than the HTML version.',
    )
    expect(d.returns[2].quote).toBe(
      'the html version was better than everything you delivered afterwards; the staging is still very bad and cheap',
    )
  })

  it('every return record is really a span of the chronicle it names', () => {
    for (const d of buildStudioDossiers(REAL)) {
      for (const r of d.returns) {
        const entry = CHRONICLE.find((e) => e.date === r.date && `S${e.collective_session}` === r.session)
        expect(entry?.summary).toContain(r.text)
        if (r.quote) expect(r.text).toContain(r.quote)
      }
    }
  })

  it('agrees with the season floor about how many times the eye sent a work back', () => {
    const floor = buildSeasonModel({
      chronicle: chronicleUpstream,
      metas: METAS,
      kills: KILLS as SeasonKill[],
    })
    const onFloor = floor.marks.filter((m) => m.state === 'returned')
    const inDossiers = buildStudioDossiers(REAL).flatMap((d) => d.returns)
    expect(inDossiers).toHaveLength(onFloor.length)
    expect(inDossiers.map((r) => r.text).sort()).toEqual(onFloor.map((m) => m.record).sort())
  })

  it('reads the withdrawal off the work’s own meta.json — date, session and reason verbatim', () => {
    const d = byId.get(ONE_TAP)!
    expect(d.withdrawal?.date).toBe('2026-07-25')
    expect(d.withdrawal?.session).toBe('S43')
    expect(d.withdrawal?.note.text).toBe(
      'WITHDRAWN 2026-07-25 (collective session 43): killed by the studio after the human eye ' +
        'rejected three successive stagings, each of which had passed the house\'s own gate.',
    )
    expect(oneTap.embodies).toContain(d.withdrawal!.note.text)
  })

  it('keeps every kill reason and its source verbatim from the curated list', () => {
    for (const k of KILLS) {
      const d = dossiers.find((x) => x.state === 'struck' && x.title === k.name)
      expect(d, k.name).toBeDefined()
      expect(d!.killReason?.text).toBe(k.reason)
      expect(d!.killReason?.label).toBe(k.source)
    }
  })

  // The record contains two bodies called "No Way of Knowing": a concept struck in session 6 and
  // the work that premiered in session 19 after the held v2 was opened. They are different things
  // that happened on different evenings, so the dossier keeps them apart — the id, the state and
  // the record's own kill reason ("v2 returns, see the Gasse") all say which is which. Merging them
  // on a shared name would erase the kill; giving the strike a rewritten name would invent one.
  it('keeps the struck concept and the premiered work that share a name apart', () => {
    const sharing = dossiers.filter((d) => d.title === 'No Way of Knowing')
    expect(sharing).toHaveLength(2)
    expect(sharing.map((d) => d.state).sort()).toEqual(['premiered', 'struck'])
    expect(new Set(sharing.map((d) => d.id)).size).toBe(2)
    expect(new Set(sharing.map((d) => d.markKey)).size).toBe(2)
    const strike = sharing.find((d) => d.state === 'struck')!
    expect(strike.session).toBe('S06')
    expect(strike.killReason!.text).toBe('killed at concept — v2 returns, see the Gasse')
  })

  it('dates a strike through its own session’s evening, and marks it when it cannot', () => {
    const exemption = dossiers.find((d) => d.title === 'The Exemption')!
    expect(exemption.session).toBe('S12')
    expect(exemption.dateKnown).toBe(true)
    expect(exemption.date).toBe(CHRONICLE.find((e) => e.collective_session === 12)!.date)
  })

  it('says nothing about a struck body the record does not describe', () => {
    const struck = dossiers.filter((d) => d.state === 'struck')
    expect(struck.every((d) => d.description === null && d.form === null)).toBe(true)
    expect(struck.every((d) => d.stageHref === null)).toBe(true)
  })

  it('links every premiered work to the stage page it actually has', () => {
    for (const d of dossiers.filter((x) => x.slug)) {
      expect(d.stageHref).toBe(`/studio/werke-html/${d.slug}/`)
    }
  })
})

// ————————————————————————————————————————————————— attribution ——————————————

describe('attribution — an entry that cannot be attached is omitted, never misfiled', () => {
  const dossiers = buildStudioDossiers(REAL)
  const byId = new Map(dossiers.map((d) => [d.id, d]))

  it('attaches an entry only by the record’s own `works` field or the return pattern', () => {
    for (const d of dossiers) {
      for (const e of d.events) {
        if (e.by !== 'declared' || e.kind === 'withdrawal') continue
        const entry = CHRONICLE.find((c) => c.summary === e.text)
        expect(entry, `${d.id}: ${e.session}`).toBeDefined()
        expect(entry!.works).toContain(d.slug)
      }
    }
  })

  it('prints the rule that attached each entry, so attribution can be checked on the page', () => {
    const kinds = new Set(dossiers.flatMap((d) => d.events).map((e) => e.by))
    expect([...kinds].sort()).toEqual(['declared', 'kill list', 'return-pattern', 'the evening'])
  })

  // The rule this build deliberately does NOT use, proven against the real record rather than
  // asserted: a title-substring rule would file the Supreme Court's own phrase under this house's
  // work, and would file seventeen sessions that only mention One Tap in passing as its history.
  it('refuses the title-substring rule the committed record would defeat', () => {
    const s46 = CHRONICLE.find((e) => e.collective_session === 46)!
    expect(s46.summary.toLowerCase()).toContain('took no part')
    expect(s46.works).toHaveLength(0)
    expect(byId.get(NO_PART)!.events.some((e) => e.session === 'S46')).toBe(false)

    const mentionsOneTap = CHRONICLE.filter(
      (e) => e.summary.includes('One Tap') && !e.works.includes(ONE_TAP),
    )
    expect(mentionsOneTap.length).toBeGreaterThan(10)
    const oneTapSessions = new Set(byId.get(ONE_TAP)!.events.map((e) => e.session))
    // only the sessions the record itself names, plus the first return the prose states outright
    expect([...oneTapSessions].sort()).toEqual(['S28', 'S31', 'S32', 'S43'])
  })

  it('gives one chronicle entry one row, however many rules reach it', () => {
    // The invariant is about the CHRONICLE: two rules can reach the same entry and must not print
    // it twice. A struck body's two rows for one evening are two different FILES — the kill list's
    // verbatim reason and the mirror's record of that session — and both belong on the card.
    for (const d of dossiers) {
      const fromChronicle = d.events
        .filter((e) => e.source.startsWith(CHRONICLE_PATH))
        .map((e) => `${e.date}|${e.session}`)
      expect(new Set(fromChronicle).size, d.id).toBe(fromChronicle.length)
    }
    // Session 32 is DECLARED under One Tap and also states the eye's second return in its prose:
    // one row, marked as the return, carrying the whole evening the house filed here.
    const s32 = byId.get(ONE_TAP)!.events.filter((e) => e.session === 'S32')
    expect(s32).toHaveLength(1)
    expect(s32[0].kind).toBe('return')
    expect(s32[0].by).toBe('declared')
    expect(s32[0].text).toBe(CHRONICLE.find((e) => e.collective_session === 32)!.summary)
  })

  // The conservative half of the rule, made visible in what an event actually carries: an evening
  // the house filed under a DIFFERENT work contributes only the sentence that names this one.
  it('carries a borrowed evening by the sentence, never by the whole session', () => {
    const s28 = byId.get(ONE_TAP)!.events.find((e) => e.session === 'S28')!
    const entry = CHRONICLE.find((e) => e.collective_session === 28)!
    expect(entry.works).not.toContain(ONE_TAP)
    expect(s28.by).toBe('return-pattern')
    expect(s28.text).not.toBe(entry.summary)
    expect(entry.summary).toContain(s28.text)
    // Recovery, which the record DOES file it under, gets the whole evening
    expect(byId.get('2026-07-21-recovery')!.events.find((e) => e.session === 'S28')!.text).toBe(
      entry.summary,
    )
  })

  it('keeps the first return, which the record files under a DIFFERENT work', () => {
    // Session 28's `works` array names Recovery; its prose states One Tap's first return. The
    // declared marker and the return pattern must both be read, or the eye's first verdict is lost.
    const s28 = CHRONICLE.find((e) => e.collective_session === 28)!
    expect(s28.works).toEqual(['2026-07-21-recovery'])
    const first = byId.get(ONE_TAP)!.returns[0]
    expect(first.session).toBe('S28')
    expect(first.by).toBe('return-pattern')
    expect(byId.get('2026-07-21-recovery')!.events.some((e) => e.session === 'S28')).toBe(true)
  })

  it('attaches a strike’s evening as the evening, never as the reason', () => {
    const ledger = dossiers.find((d) => d.title === 'Ledger of Days')!
    const evening = ledger.events.find((e) => e.kind === 'evening')!
    expect(evening.by).toBe('the evening')
    expect(evening.text).toBe(CHRONICLE.find((e) => e.collective_session === 1)!.summary)
    // the reason stays its own quotation from its own file
    expect(ledger.killReason!.source).toBe('src/data/studio/stage.curated.json')
    // and the derived label spells the session the way the kill list beside it does — "S01", not
    // "S1", so one evening does not read as two on the same card
    expect(ledger.session).toBe('S01')
    expect(evening.session).toBe('S01')
  })
})

// ————————————————————————————————————————————————— tiers ————————————————————

describe('honesty tiers — quoted where the work declares them, absent where it does not', () => {
  it('lifts the declared tier clauses of One Tap, verbatim', () => {
    const tiers = readTiers(ONE_TAP, oneTap)
    expect(tiers.map((t) => t.text)).toEqual([
      'SOURCED spine: five real per-query water figures and the documented Dalles concealment case, every line primary-sourced',
      'IMAGINED: the instrument, its posed question, and the strike-and-cancel motion, marked by one constant tier line.',
    ])
    for (const t of tiers) expect(oneTap.embodies).toContain(t.text)
  })

  it('does not mistake a sentence ABOUT a tier for the tier’s declaration', () => {
    // "The SOURCED spine below is unaffected and was never in question" is a claim, not a tier line
    expect(oneTap.embodies).toContain('The SOURCED spine below is unaffected')
    expect(readTiers(ONE_TAP, oneTap).some((t) => t.text.includes('is unaffected'))).toBe(false)
  })

  it('lifts Recovery’s single sourced spine and stops at its own sentence', () => {
    const tiers = readTiers('2026-07-21-recovery', recovery)
    expect(tiers).toHaveLength(1)
    expect(tiers[0].text.startsWith('SOURCED spine: the Dutch childcare-benefits scandal')).toBe(true)
    expect(recovery.embodies).toContain(tiers[0].text)
  })

  it('returns nothing where a work declares no tier — three of the five do not', () => {
    expect(readTiers('2026-07-13-native-speaker', nativeSpeaker)).toEqual([])
    expect(readTiers('2026-07-17-no-way-of-knowing', noWay)).toEqual([])
    expect(readTiers(NO_PART, noPart)).toEqual([])
  })
})

// ————————————————————————————————————————————————— the switchboard ——————————

describe('the floor and the dossier select each other', () => {
  const dossiers = buildStudioDossiers(REAL)
  const floor = buildSeasonModel({
    chronicle: chronicleUpstream,
    metas: METAS,
    kills: KILLS as SeasonKill[],
  })

  it('every dossier names a mark that really exists on the floor', () => {
    const keys = new Set(floor.marks.map((m) => m.key))
    for (const d of dossiers) expect(keys, d.id).toContain(d.markKey)
  })

  it('every mark on the floor resolves to exactly one dossier — returns to their work', () => {
    for (const m of floor.marks) {
      const id = dossierIdForMark(m.key, dossiers)
      expect(id, m.key).not.toBeNull()
      expect(dossiers.filter((d) => d.id === id)).toHaveLength(1)
    }
    expect(dossierIdForMark('returned:2026-07-23-one-tap:2', dossiers)).toBe(ONE_TAP)
  })

  it('builds one index the page can ship instead of two hand-kept tables', () => {
    const { byDossier, byMark } = markIndex(dossiers, floor.marks.map((m) => m.key))
    expect(Object.keys(byDossier)).toHaveLength(dossiers.length)
    expect(Object.keys(byMark)).toHaveLength(floor.marks.length)
    expect(byMark[byDossier[NO_PART]]).toBe(NO_PART)
  })

  it('a mark nobody has a dossier for resolves to nothing rather than to the nearest name', () => {
    expect(dossierIdForMark('premiered:something-else', dossiers)).toBeNull()
    expect(dossierIdForMark('returned:something-else:1', dossiers)).toBeNull()
  })
})

// ————————————————————————————————————————————————— fixtures —————————————————

describe('shapes the committed record does not currently contain', () => {
  const entry = (over: Partial<DossierChronicleEntry>): DossierChronicleEntry => ({
    date: '2026-01-01',
    collective_session: 1,
    move: 'other',
    summary: 'a session of the house, long enough to pass the schema',
    works: [],
    verdict: null,
    anchor: 'cs-1',
    ...over,
  })

  it('lights the newest live premiere when a newer one has been withdrawn', () => {
    const metas = {
      early: { title: 'Early', date: '2026-01-02', medium: 'a thing' },
      late: { title: 'Late', date: '2026-01-03', medium: 'WITHDRAWN 2026-01-04 — taken off' },
    }
    const chronicle = [
      entry({ date: '2026-01-02', collective_session: 1, move: 'ship', works: ['early'], anchor: 'cs-1' }),
      entry({ date: '2026-01-03', collective_session: 2, move: 'ship', works: ['late'], anchor: 'cs-2' }),
    ]
    expect(currentPremiere(chronicle, metas)).toBe('early')
    const built = buildStudioDossiers({ chronicle, metas, kills: [] })
    expect(built[0].id).toBe('early')
    expect(built.find((d) => d.id === 'late')!.state).toBe('withdrawn')
  })

  it('reports no spotlight rather than inventing one when nothing is live', () => {
    const metas = { only: { title: 'Only', date: '2026-01-02', medium: 'WITHDRAWN 2026-01-03 — off' } }
    const chronicle = [entry({ move: 'ship', works: ['only'] })]
    expect(currentPremiere(chronicle, metas)).toBeNull()
    expect(buildStudioDossiers({ chronicle, metas, kills: [] }).every((d) => !d.spotlight)).toBe(true)
  })

  it('marks a strike whose evening the mirror does not carry, never bridging it silently', () => {
    const kills: DossierKill[] = [
      { name: 'Ghost', session: 'S99', reason: 'killed at concept', source: 'session commit S99, verbatim' },
    ]
    const built = buildStudioDossiers({ chronicle: [entry({})], metas: {}, kills })
    expect(built[0].dateKnown).toBe(false)
    expect(built[0].date).toBe('2026-01-01')
    expect(built[0].events.some((e) => e.kind === 'evening')).toBe(false)
  })

  it('takes a withdrawal that names no session', () => {
    const meta = { title: 'X', date: '2026-01-01', medium: 'WITHDRAWN 2026-02-02 — off', embodies: 'WITHDRAWN 2026-02-02 — off. More.' }
    expect(isWithdrawn(meta)).toBe(true)
    const w = readWithdrawal('x', meta)!
    expect(w.session).toBe('')
    expect(w.date).toBe('2026-02-02')
    expect(w.note.text).toBe('WITHDRAWN 2026-02-02 — off.')
  })

  it('keeps a whole sentence that has no boundary to cut at', () => {
    expect(firstSentence('no boundary here')).toBe('no boundary here')
  })
})
