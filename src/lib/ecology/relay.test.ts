// The Middle's relay, held against the contract "middle-relay/1" (2026-10-05).
//
// The seed fixture (__fixtures__/relay.seed.json) paraphrases real bulletin traffic but invents
// its ids and commits, and says so in its own `$fixture` field. It lives beside the tests on
// purpose: the real relay arrives only through the mirror, and a copy of the seed at the mirror's
// path would put invented commits on the public page — the last block below refuses that.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  LAPSE_DAYS,
  RELAY_PATH,
  addDays,
  ageInDays,
  checkDeclaredCounts,
  closedHandoffs,
  evidenceUrl,
  isolation,
  lapseDay,
  loadRelay,
  openHandoffs,
  pairCounts,
  parseRef,
  parseRelay,
  practiceTotals,
  relationsSince,
  relayLastDay,
  supersededIds,
  threads,
  type Handoff,
  type Relay,
} from './relay'

const SEED_PATH = fileURLToPath(new URL('./__fixtures__/relay.seed.json', import.meta.url))
const seedRaw = () => JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'))

function seed(): Relay {
  const state = parseRelay(seedRaw())
  if (state.status !== 'ok') throw new Error(`seed does not parse: ${JSON.stringify(state)}`)
  return state.relay
}

function tmpRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'relay-'))
}

describe('reading the relay against its contract', () => {
  it('reads the seed whole — every relation and every handoff, nothing skipped', () => {
    const relay = seed()
    expect(relay.relations).toHaveLength(19)
    expect(relay.handoffs).toHaveLength(6)
    expect(relay.skipped).toBe(0)
    expect(relay.cycle).toBe(4)
    expect(relay.period).toEqual({ from: '2026-08-30', to: '2026-10-05' })
  })

  it('orders relations newest first, and within a day by id — one relay, one order', () => {
    const dates = seed().relations.map((r) => r.date)
    expect(dates).toEqual([...dates].sort().reverse())
    const sameDay = seed().relations.filter((r) => r.date === '2026-10-04').map((r) => r.id)
    expect(sameDay).toEqual([...sameDay].sort())
  })

  it('treats a wrong contract as an empty state, never as a failure', () => {
    expect(parseRelay({ ...seedRaw(), $contract: 'middle-relay/2' })).toMatchObject({ status: 'invalid' })
    expect(parseRelay(null)).toMatchObject({ status: 'invalid' })
    expect(parseRelay([seedRaw()])).toMatchObject({ status: 'invalid' })
    expect(parseRelay({ $contract: 'middle-relay/1', relations: {} , handoffs: [] })).toMatchObject({ status: 'invalid' })
  })

  it('skips and counts a malformed entry instead of refusing the whole record', () => {
    const raw = seedRaw()
    const good = raw.relations[0]
    raw.relations.push(
      { ...good, id: 'bad-kind', kind: 'collaborated' },
      { ...good, id: 'self', taker: good.giver },
      { ...good, id: 'stranger', giver: 'plenum' },
      { ...good, id: 'undated', date: '04.10.2026' },
      { ...good, id: 'mute', what: '   ' },
      { ...good }, // the same id twice: the first stands
      'not an object',
    )
    raw.handoffs.push({ ...raw.handoffs[0], id: 'hand-bad', status: 'pending' })
    const state = parseRelay(raw)
    expect(state.status).toBe('ok')
    if (state.status !== 'ok') return
    expect(state.relay.relations).toHaveLength(19)
    expect(state.relay.handoffs).toHaveLength(6)
    expect(state.relay.skipped).toBe(8)
  })

  it('keeps a relation whose reference is broken, and draws no evidence link for it', () => {
    const raw = seedRaw()
    raw.relations[0].giver_ref = { repo: 'somebody-else', path: 'x.md', commit: 'abcdef1' }
    raw.relations[0].taker_ref = { repo: 'studio', path: 'works/x.html', commit: 'not-a-commit' }
    const state = parseRelay(raw)
    if (state.status !== 'ok') throw new Error('expected ok')
    const r = state.relay.relations.find((x) => x.id === raw.relations[0].id)!
    expect(r.giverRef).toBeNull()
    expect(r.takerRef).toBeNull()
  })

  it('drops a handoff addressee that is not a sibling, and the giver itself', () => {
    const raw = seedRaw()
    raw.handoffs[0].to = ['atelier', 'plenum', 'field', 'atelier']
    const state = parseRelay(raw)
    if (state.status !== 'ok') throw new Error('expected ok')
    expect(state.relay.handoffs.find((h) => h.id === raw.handoffs[0].id)!.to).toEqual(['atelier'])
  })
})

describe('loading the mirrored file', () => {
  it('reports absence when the relay has not been mirrored yet — a legal state', () => {
    expect(loadRelay(tmpRoot())).toEqual({ status: 'absent' })
  })

  it('turns a file that does not parse into an empty state, not a broken build', () => {
    const root = tmpRoot()
    fs.mkdirSync(path.join(root, path.dirname(RELAY_PATH)), { recursive: true })
    fs.writeFileSync(path.join(root, RELAY_PATH), '{ "$contract": "middle-relay/1", ')
    expect(loadRelay(root)).toMatchObject({ status: 'invalid' })
  })

  it('reads a well-formed relay from the mirror path', () => {
    const root = tmpRoot()
    fs.mkdirSync(path.join(root, path.dirname(RELAY_PATH)), { recursive: true })
    fs.copyFileSync(SEED_PATH, path.join(root, RELAY_PATH))
    const state = loadRelay(root)
    expect(state.status).toBe('ok')
  })
})

describe('evidence links', () => {
  it('points at the file at the pinned commit, in the practice’s own repository', () => {
    expect(evidenceUrl({ repo: 'ulysses', path: 'window/cycle-004-session-4/index.html', commit: 'abc1234' })).toBe(
      'https://github.com/frankbueltge/ulysses/blob/abc1234/window/cycle-004-session-4/index.html',
    )
  })

  it('encodes a path segment, never a separator', () => {
    expect(evidenceUrl({ repo: 'studio', path: 'works/a b#c/index.html', commit: 'abc1234' })).toBe(
      'https://github.com/frankbueltge/studio/blob/abc1234/works/a%20b%23c/index.html',
    )
  })

  it('refuses a reference it could not follow honestly', () => {
    expect(parseRef({ repo: 'research-ecology', path: 'relay/relay.json', commit: 'abc1234' })).toBeNull()
    expect(parseRef({ repo: 'studio', path: '../secrets', commit: 'abc1234' })).toBeNull()
    expect(parseRef({ repo: 'studio', path: 'works/x.html', commit: 'main' })).toBeNull()
    expect(parseRef({ repo: 'studio', path: '', commit: 'abc1234' })).toBeNull()
    expect(evidenceUrl(null)).toBeNull()
  })
})

describe('the derivations the triangle draws', () => {
  const relay = seed()

  it('counts every directed pair, zeros included, in the house order', () => {
    const pairs = pairCounts(relay.relations)
    expect(pairs.map((p) => p.id)).toEqual([
      'field-atelier',
      'field-studio',
      'atelier-field',
      'atelier-studio',
      'studio-field',
      'studio-atelier',
    ])
    const by = Object.fromEntries(pairs.map((p) => [p.id, p.counts]))
    expect(by['field-studio']).toEqual({ built_on: 3, answered: 0, noted: 2 })
    expect(by['field-atelier']).toEqual({ built_on: 0, answered: 0, noted: 2 })
    expect(by['atelier-field']).toEqual({ built_on: 1, answered: 2, noted: 0 })
    expect(by['atelier-studio']).toEqual({ built_on: 3, answered: 1, noted: 0 })
    expect(by['studio-field']).toEqual({ built_on: 0, answered: 0, noted: 2 })
    expect(by['studio-atelier']).toEqual({ built_on: 0, answered: 2, noted: 1 })
  })

  it('totals what each practice gave and what it took', () => {
    const t = practiceTotals(relay.relations)
    expect(t.field.given).toEqual({ built_on: 3, answered: 0, noted: 4 })
    expect(t.field.received).toEqual({ built_on: 1, answered: 2, noted: 2 })
    expect(t.studio.received).toEqual({ built_on: 6, answered: 1, noted: 2 })
    expect(t.studio.given).toEqual({ built_on: 0, answered: 2, noted: 3 })
  })

  it('names the directions in which nothing load-bearing passed — notes do not count', () => {
    expect(isolation(relay.relations)).toEqual([
      { giver: 'field', taker: 'atelier' },
      { giver: 'studio', taker: 'field' },
    ])
  })

  it('narrows to a window by the relation’s own date', () => {
    const cycle = relationsSince(relay.relations, '2026-10-03')
    expect(cycle).toHaveLength(8)
    expect(cycle.every((r) => r.date >= '2026-10-03')).toBe(true)
    expect(isolation(cycle)).toHaveLength(5)
    expect(isolation(cycle)).not.toContainEqual({ giver: 'atelier', taker: 'studio' })
  })

  it('gathers threads, oldest relation first, most recently active thread first', () => {
    const ts = threads(relay.relations)
    expect(ts.map((t) => t.id)).toEqual(['dodo', 'clock', 'rounding', 'held-sources', 'line-and-range', 'egress'])
    const line = ts.find((t) => t.id === 'line-and-range')!
    expect(line.relations.map((r) => r.id)).toEqual(['rel-fixture-04', 'rel-fixture-05'])
    expect(line.practices).toEqual(['atelier', 'studio'])
    expect([line.first, line.last]).toEqual(['2026-09-06', '2026-09-07'])
  })

  it('lists open handoffs newest first, and the rest after them', () => {
    expect(openHandoffs(relay.handoffs).map((h) => h.id)).toEqual(['hand-fixture-01', 'hand-fixture-02'])
    expect(closedHandoffs(relay.handoffs).map((h) => [h.id, h.status])).toEqual([
      ['hand-fixture-03', 'taken'],
      ['hand-fixture-04', 'taken'],
      ['hand-fixture-05', 'declined'],
      ['hand-fixture-06', 'lapsed'],
    ])
    expect(relay.handoffs.find((h) => h.id === 'hand-fixture-03')!.takenBy).toEqual({
      practice: 'studio',
      date: '2026-10-04',
      relation: 'rel-fixture-18',
    })
  })

  it('counts a handoff’s age in whole days to the day the relay was generated', () => {
    expect(ageInDays('2026-10-04', '2026-10-05T04:30:00Z')).toBe(1)
    expect(ageInDays('2026-10-05', '2026-10-05')).toBe(0)
    expect(ageInDays('2026-09-25', '2026-10-05')).toBe(10)
    expect(ageInDays('2026-10-06', '2026-10-05')).toBe(0)
  })

  it('recounts the relay’s own totals instead of trusting them', () => {
    expect(checkDeclaredCounts(relay)).toEqual({ agrees: true, differences: [] })
    const raw = seedRaw()
    raw.counts.built_on = 9
    const state = parseRelay(raw)
    if (state.status !== 'ok') throw new Error('expected ok')
    expect(checkDeclaredCounts(state.relay)).toEqual({ agrees: false, differences: [['built_on', 9, 7]] })
  })
})

describe('the mirror carries the relay, never the seed', () => {
  it('reads whatever the mirror holds today without throwing — absent or a real report', () => {
    const state = loadRelay()
    expect(['absent', 'invalid', 'ok']).toContain(state.status)
  })

  it('holds no copy of the test seed at the mirror path — invented commits would go public', () => {
    const file = path.join(process.cwd(), RELAY_PATH)
    if (!fs.existsSync(file)) return
    expect(fs.readFileSync(file, 'utf8')).not.toContain('"$fixture"')
  })
})

describe('the days a handoff closes on (2026-10-05, read by the signal log)', () => {
  const handoff = (over: Partial<Handoff>): Handoff => ({
    id: 'h',
    offeredOn: '2026-09-12',
    giver: 'atelier',
    to: ['studio'],
    offer: 'An offer.',
    ref: null,
    status: 'open',
    takenBy: null,
    declinedBy: null,
    ...over,
  })

  it('reads the contract’s optional declined_by, and nothing that lacks a practice or a day', () => {
    const raw = seedRaw()
    const declined = raw.handoffs.find((h: { status: string }) => h.status === 'declined')
    declined.declined_by = { practice: 'studio', date: '2026-09-27', relation: 'rel-fixture-12' }
    const state = parseRelay(raw)
    if (state.status !== 'ok') throw new Error('expected ok')
    expect(state.relay.handoffs.find((h) => h.id === declined.id)!.declinedBy).toEqual({
      practice: 'studio',
      date: '2026-09-27',
      relation: 'rel-fixture-12',
    })
    // the seed's other handoffs name no decline
    expect(state.relay.handoffs.filter((h) => h.declinedBy !== null)).toHaveLength(1)
    declined.declined_by = { practice: 'studio', date: 'last week' }
    const loose = parseRelay(raw)
    if (loose.status !== 'ok') throw new Error('expected ok')
    expect(loose.relay.handoffs.find((h) => h.id === declined.id)!.declinedBy).toBeNull()
  })

  it('counts days on the calendar, never on the clock', () => {
    expect(addDays('2026-09-12', LAPSE_DAYS)).toBe('2026-10-03')
    expect(addDays('2026-02-20', 21)).toBe('2026-03-13')
    expect(addDays('soon', 1)).toBeNull()
  })

  it('dates a lapse offered_on + 21 days, as the contract and its verifier count it', () => {
    expect(LAPSE_DAYS).toBe(21)
    expect(lapseDay(handoff({ status: 'lapsed' }), '2026-10-04')).toBe('2026-10-03')
    // the last day read is the lapse day itself: period.to − offered_on = 21
    expect(lapseDay(handoff({ status: 'lapsed' }), '2026-10-03')).toBe('2026-10-03')
  })

  it('dates no lapse past the last day the relay read, and none for an offer still open', () => {
    expect(lapseDay(handoff({ status: 'lapsed' }), '2026-10-02')).toBeNull()
    expect(lapseDay(handoff({ status: 'lapsed' }), null)).toBeNull()
    expect(lapseDay(handoff({ status: 'open' }), '2026-10-30')).toBeNull()
  })

  it('dates the lapse of an offer closed only after it lapsed, and none of one closed in time', () => {
    const taken = (date: string) => handoff({ status: 'taken', takenBy: { practice: 'studio', date, relation: null } })
    const declined = (date: string) => handoff({ status: 'declined', declinedBy: { practice: 'studio', date, relation: null } })
    expect(lapseDay(taken('2026-10-04'), '2026-10-05')).toBe('2026-10-03')
    expect(lapseDay(taken('2026-10-03'), '2026-10-05')).toBeNull()
    expect(lapseDay(declined('2026-10-05'), '2026-10-05')).toBe('2026-10-03')
    expect(lapseDay(declined('2026-09-20'), '2026-10-05')).toBeNull()
  })

  it('reads the last day from the period, else from the day the relay was written', () => {
    expect(relayLastDay(seed())).toBe('2026-10-05')
    expect(relayLastDay({ ...seed(), period: null, generatedAt: '2026-10-06T01:00:00Z' })).toBe('2026-10-06')
    expect(relayLastDay({ ...seed(), period: null, generatedAt: '' })).toBeNull()
  })

  it('supersedes only a relation another one names by its id', () => {
    const relations = seed().relations
    // the seed's `corrects` are the relay's own words, naming no relation
    expect(supersededIds(relations).size).toBe(0)
    const fixed = [...relations, { ...relations[0]!, id: 'rel-fix', corrects: relations[1]!.id }]
    expect([...supersededIds(fixed)]).toEqual([relations[1]!.id])
    expect(supersededIds([{ ...relations[0]!, corrects: relations[0]!.id }]).size).toBe(0)
  })
})
