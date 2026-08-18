// Guard for the house dossier: it must read every word out of the committed record, attach every
// entry by an explicit rule, and state a gap rather than fill it. Two layers, the same shape as
// season.test.ts — the REAL committed data (so the dossiers the site actually ships are under test)
// and small fixtures for the shapes the record does not currently contain.
//
// What this file READS is derived from the record — the works from the content directory, the
// premieres from the chronicle's own `ship` entries. What it PINS is history: One Tap's three
// returns and its withdrawal, session 28's borrowed evening, session 46's phrase. The house ships
// again; an assertion that names whichever work happens to be newest today is not a guard but a
// test with an expiry date on it, and on 2026-08-15 three of them expired at once.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
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
  PRIVATE_MARKER,
  readTiers,
  readWithdrawal,
  type DossierChronicleEntry,
  type DossierKill,
  type DossierWorkMeta,
  type StudioDossierInput,
} from './dossier'

const WORKS_DIR = 'src/content/studio/works'

/** Every work the mirror carries, keyed by slug — read off the content directory with the same
 *  glob the site's own assembly uses (dossier-data.ts, `loadWorkMetas`), so this suite tests the
 *  set of works the site actually ships. It used to be five hand-written imports: when the studio
 *  premiered a sixth work on 2026-08-15, the map did not grow with it, the new work fell outside
 *  every assertion here, and the integration that carries the practice onto the site failed its
 *  gate three times in a row. A guard over the record cannot keep its own copy of the record. */
const METAS: Record<string, DossierWorkMeta> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/content/studio/works/*/meta.json', { eager: true, import: 'default' }),
  ).map(([path, meta]) => [path.split('/').at(-2) as string, meta as DossierWorkMeta]),
)

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

/** The machine-readable head the house writes into a withdrawn work's own `medium`, re-read here
 *  rather than imported from the module under test: the expectations below are then derived from
 *  the committed FILES, not from the implementation that is being checked against them. */
const WITHDRAWN_HEAD = /^WITHDRAWN\s+\d{4}-\d{2}-\d{2}/i

/** Every premiere the chronicle records, newest first. */
const SHIPS_NEWEST_FIRST = [...CHRONICLE]
  .reverse()
  .filter((e) => e.move === 'ship' && e.works.length > 0)
/** The newest premiere of all, live or taken back. */
const NEWEST_SHIP = SHIPS_NEWEST_FIRST[0]
/** The newest premiere whose work its own meta.json does not mark WITHDRAWN — what the spotlight
 *  has to be, computed from the two committed files instead of typed as a slug. */
const NEWEST_LIVE_SHIP = SHIPS_NEWEST_FIRST.find(
  (e) => METAS[e.works[0]] && !WITHDRAWN_HEAD.test(METAS[e.works[0]].medium ?? ''),
)
/** Every work the record shipped and the mirror carries a meta for, oldest first. */
const SHIPPED = [
  ...new Set(CHRONICLE.filter((e) => e.move === 'ship' && e.works.length > 0).map((e) => e.works[0])),
].filter((slug) => slug in METAS)

const ONE_TAP = '2026-07-23-one-tap'
/** A premiered work of the record — used where an assertion needs one work by name. NOT "the
 *  current premiere": it held that role from 2026-07-30 until 2026-08-15, and typing it here as
 *  though it were a fixed fact is exactly what this file was rewritten to stop doing. */
const NO_PART = '2026-07-30-no-part'

describe('buildStudioDossiers over the committed record', () => {
  const dossiers = buildStudioDossiers(REAL)
  const byId = new Map(dossiers.map((d) => [d.id, d]))

  it('is pure: the same committed data yields the same dossiers', () => {
    expect(JSON.stringify(buildStudioDossiers(REAL))).toBe(JSON.stringify(dossiers))
  })

  it('reads every work the mirror committed, from the directory itself', () => {
    // The glob above is the only list of works this file has. If it ever matched nothing, half the
    // assertions here would pass over an empty record, so what it found is checked against the
    // directory the mirror writes — and against the record's newest premiere, one test below.
    const onDisk = readdirSync(join(process.cwd(), WORKS_DIR), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
    expect(Object.keys(METAS).sort()).toEqual(onDisk)
  })

  it('carries one dossier per body of the house — one per premiere, one per strike', () => {
    // Derived, because the house keeps shipping: the premieres are the chronicle's own `ship`
    // entries, the strikes are the curated kill list. "Five premieres and seven strikes", typed
    // here, was a true sentence for sixteen days and a broken gate on the seventeenth.
    const withdrawn = SHIPPED.filter((slug) => WITHDRAWN_HEAD.test(METAS[slug].medium ?? ''))
    expect(dossiers.filter((d) => d.state === 'premiered')).toHaveLength(
      SHIPPED.length - withdrawn.length,
    )
    expect(dossiers.filter((d) => d.state === 'withdrawn')).toHaveLength(withdrawn.length)
    expect(dossiers.filter((d) => d.state === 'struck')).toHaveLength(KILLS.length)
    expect(dossiers).toHaveLength(SHIPPED.length + KILLS.length)
    // one body, one dossier: every premiered work has exactly one, filed under its own slug
    for (const slug of SHIPPED) expect(byId.get(slug)?.slug, slug).toBe(slug)
    expect(new Set(dossiers.map((d) => d.id)).size).toBe(dossiers.length)
  })

  it('carries the record’s newest premiere — which is what the mirror exists to deliver', () => {
    // The failure this file was rewritten for: the studio premiered a new work upstream, the suite
    // still named the premiere before it, and the practice's newest work could not reach the site.
    const newest = NEWEST_SHIP.works[0]
    expect(Object.keys(METAS), `${newest} shipped but the mirror carries no meta.json`).toContain(newest)
    expect(byId.get(newest)?.id).toBe(newest)
    expect(byId.get(newest)?.title).toBe(METAS[newest].title)
    expect(byId.get(newest)?.date).toBe(NEWEST_SHIP.date)
  })

  it('leads with the current premiere, derived from the record and never typed', () => {
    // The expectation is computed the way the record answers the question — the newest `ship`
    // whose work its own meta.json does not mark WITHDRAWN — so this asserts an agreement between
    // the build and the committed files, not between the build and a slug typed here in July.
    expect(NEWEST_LIVE_SHIP, 'the record carries no live premiere at all').toBeDefined()
    expect(dossiers[0].id).toBe(NEWEST_LIVE_SHIP!.works[0])
    expect(dossiers[0].spotlight).toBe(true)
    expect(dossiers.filter((d) => d.spotlight)).toHaveLength(1)
    expect(currentPremiere(CHRONICLE, METAS)).toBe(NEWEST_LIVE_SHIP!.works[0])
  })

  it('never puts the withdrawn work in the spotlight, however new its premiere is', () => {
    // One Tap shipped in session 31 and was withdrawn in 43: a work can be lit and lose the light
    // afterwards, which is the one thing a typed protagonist could never follow.
    expect(byId.get(ONE_TAP)?.state).toBe('withdrawn')
    expect(byId.get(ONE_TAP)?.spotlight).toBe(false)
    expect(WITHDRAWN_HEAD.test(oneTap.medium)).toBe(true)
    // whichever premiere is newest on the day, the lit one is a work no meta marks withdrawn…
    expect(isWithdrawn(METAS[dossiers[0].id])).toBe(false)
    // …and every premiere NEWER than it is one the house itself took back — the spotlight walks
    // backwards past withdrawals and stops at the first live work, it does not skip live ones
    for (const e of SHIPS_NEWEST_FIRST) {
      if (e === NEWEST_LIVE_SHIP) break
      const meta = METAS[e.works[0]]
      if (meta) expect(isWithdrawn(meta), `${e.works[0]} is live and newer than the spotlight`).toBe(true)
    }
  })

  it('quotes each work’s own description verbatim, beside the path it came from', () => {
    // every work the mirror carries, so a work that premiered tonight is quoted under test tonight
    for (const d of dossiers.filter((x) => x.slug)) {
      const meta = METAS[d.slug!]
      expect(d.description?.text, d.id).toBe(meta.embodies)
      expect(d.description?.source, d.id).toBe(`${WORKS_DIR}/${d.slug}/meta.json`)
      expect(d.form?.text, d.id).toBe(meta.medium)
    }
    // spelled out once in full, so the path above is a real path and not this test's own template
    const d = byId.get(NO_PART)!
    expect(d.description?.text).toBe(noPart.embodies)
    expect(d.description?.source).toBe('src/content/studio/works/2026-07-30-no-part/meta.json')
    expect(d.form?.text).toBe(noPart.medium)
  })

  // 2026-08-16: this test used to pin the eye's own words for all three returns. The studio's
  // standing privacy rule of 2026-08-15 — the architect's messages are recorded as dated
  // paraphrase, never quoted verbatim — reached its chronicle, so those three sentences are gone
  // from the record on purpose and are not coming back.
  //
  // 2026-08-17: and this test must not pin the paraphrase that replaced them either. It runs
  // against whatever `chronicle.upstream.json` is COMMITTED at the time, and that file crosses the
  // redaction on its own schedule: the site-PR gate reads the mirror as committed — still at its
  // last green state, which predates the redaction — while the integrate workflow copies the
  // studio's current record over it before validating. A fixture pinned to either side of that
  // line is red on the other, which is exactly how the first attempt at this repair failed. So
  // what is pinned is the property that holds on both sides: the three returns are found, in
  // order, at their sessions; and no quote is ever lifted out of a passage the record marks as
  // withheld.
  it('carries the eye’s three returns of One Tap, in order, and lifts no withheld wording', () => {
    const d = byId.get(ONE_TAP)!
    expect(d.returns.map((r) => r.ordinal)).toEqual([1, 2, 3])
    expect(d.returns.map((r) => r.ordinalRoman)).toEqual(['I', 'II', 'III'])
    expect(d.returns.map((r) => r.session)).toEqual(['S28', 'S32', 'S43'])
    // where the record marks the wording as withheld, nothing reaches `quote` — the field
    // Dossier.astro renders as a blockquote of the eye's own words
    for (const r of d.returns) {
      if (PRIVATE_MARKER.test(r.text)) expect(r.quote).toBeUndefined()
    }
    // and the substance still travels, in the house's own words, verbatim from the summary: the
    // second return's record reaches past the sentence that only announces it
    expect(d.returns[1].text).toContain('The human eye returned One Tap a second time.')
    expect(d.returns[1].text).toContain('Frank played the premiered restage and returned it')
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

    // Only the sessions the record itself names, plus the returns its prose states outright.
    // 2026-08-17: this used to be the literal list ['S28','S31','S32','S43'], which was that
    // sentence's answer on the day it was written and stopped being it the first time the studio
    // declared the work in a later entry — S99, whose evening was spent on this very derivation.
    // A pinned list turns a working attribution rule into a red build; the rule's own two inputs,
    // read off the same committed record, do not rot.
    const label = (e: (typeof CHRONICLE)[number]) => `S${e.collective_session}`
    const declared = CHRONICLE.filter((e) => e.works.includes(ONE_TAP)).map(label)
    const statedOutright = CHRONICLE.filter((e) =>
      /the human eye returned One Tap|One Tap returned by the human eye/i.test(e.summary),
    ).map(label)
    const expected = [...new Set([...declared, ...statedOutright])].sort()
    // the two rules really do reach different evenings — otherwise this proves nothing
    expect(declared.length).toBeGreaterThan(0)
    expect(statedOutright.some((s) => !declared.includes(s))).toBe(true)
    const oneTapSessions = new Set(byId.get(ONE_TAP)!.events.map((e) => e.session))
    expect([...oneTapSessions].sort()).toEqual(expected)
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

  it('returns nothing where a work declares no tier — the gap is stated, never filled', () => {
    expect(readTiers('2026-07-13-native-speaker', nativeSpeaker)).toEqual([])
    expect(readTiers('2026-07-17-no-way-of-knowing', noWay)).toEqual([])
    expect(readTiers(NO_PART, noPart)).toEqual([])
  })

  it('lifts nothing from any work in the record it cannot find verbatim in that work’s file', () => {
    // the two named works above are the ones whose clauses are quoted word for word; this is the
    // same rule applied to every work the mirror carries, including any that premiered tonight
    for (const [slug, meta] of Object.entries(METAS)) {
      for (const t of readTiers(slug, meta)) {
        expect(`${meta.embodies ?? ''}\n${meta.medium ?? ''}`, `${slug}: ${t.text}`).toContain(t.text)
        expect(t.source, slug).toBe(`${WORKS_DIR}/${slug}/meta.json`)
      }
    }
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

  // The withheld-wording path, proven here and not against the record. The guard in the suite's
  // first half runs only where the committed mirror actually marks a passage as withheld, and
  // which side of the 2026-08-16 redaction that file is on changes under this suite — the site-PR
  // gate reads it as committed, the integrate workflow copies the studio's current record over it
  // first. So on the gate's side that guard is a no-op today, which a hostile reading of this
  // proposal proved by deleting the suppression from `quotedFragment` and watching every test
  // still pass. These two always run. (2026-08-17.)
  const returned = (parenthetical: string) => {
    const metas = { widget: { title: 'Widget', date: '2026-01-01', medium: 'a live thing' } }
    const chronicle = [
      entry({ date: '2026-01-01', collective_session: 1, move: 'ship', works: ['widget'], anchor: 'cs-1' }),
      entry({
        date: '2026-01-05',
        collective_session: 2,
        anchor: 'cs-2',
        works: ['widget'],
        summary: `The human eye returned Widget (${parenthetical}). Work continued afterwards.`,
      }),
    ]
    return buildStudioDossiers({ chronicle, metas, kills: [] }).find((d) => d.id === 'widget')!
  }

  it('lifts no quote out of a passage the record marks as withheld', () => {
    const r = returned('2026-01-05, wording private — the staging is still wrong').returns[0]
    expect(r).toBeDefined()
    expect(r.text).toMatch(PRIVATE_MARKER)
    // `quote` is what Dossier.astro renders as a blockquote of the eye's own words. Paraphrase
    // placed there is the withdrawn quotation put back by a regex.
    expect(r.quote).toBeUndefined()
  })

  it('still lifts a quotation where the record marks nothing as withheld', () => {
    const r = returned("2026-01-05, 'the staging is still wrong'").returns[0]
    expect(r).toBeDefined()
    expect(r.quote).toBe('the staging is still wrong')
  })
})
