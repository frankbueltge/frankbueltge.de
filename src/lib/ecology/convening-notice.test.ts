// The architect's notice (2026-10-08): one issue when his decision on a convening's result is due,
// his reply read as an objection before the clock decides, and the notice closed when the next
// cycle opens — never a mail for anything else.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { RelayConvening } from './convening'
import {
  dueNotice,
  inert,
  isObjection,
  noticeTitle,
  objectionIn,
  OWNER,
  ownWords,
  parseNoticeTitle,
  planNotice,
  planObjection,
  withObjection,
  type NoticeComment,
  type NoticeIssue,
} from './convening-notice'
import { planTurn } from './cycle-turn'
import { loadCycle, type CycleState } from './v3'

const CONTINUING = { question: 'Missing Data Art', since: '2026-10-03' }
const WON = 'What the archive refuses to count'
const TITLE = 'Convening after cycle 006: the next question opens on 2026-10-13'

/** cycle.json as loadCycle reads it: the convening after cycle 6, opened 2026-10-10. */
const conveningState = (over: Partial<CycleState> = {}, objected: string | null = null): CycleState => ({
  cycle: 6,
  phase: 'convening',
  question: 'Missing Data Art, read through human extinction by AI',
  source: 'continuing',
  opened: '2026-10-07',
  sessionsPerPractice: '3-5',
  defaults: { field: 'f', atelier: 'a', studio: 's' },
  continuing: CONTINUING,
  convening: { afterCycle: 6, opened: '2026-10-10', objected },
  ...over,
})

/** The next cycle, as the clock opens it. */
const opened = (source: CycleState['source'], question: string | null, day = '2026-10-13'): CycleState => ({
  cycle: 7,
  phase: 'working',
  question,
  source,
  opened: day,
  sessionsPerPractice: '3-5',
  defaults: { field: 'f', atelier: 'a', studio: 's' },
  continuing: CONTINUING,
  convening: null,
})

const ref = (repo: 'field-research' | 'ulysses' | 'studio', commit: string) => ({ repo, path: 'BULLETIN.md', commit })

/** The relay's convening after cycle 6; a result tallied on `talliedOn` (null: none yet). */
const relay = (talliedOn: string | null = '2026-10-12', afterCycle = 6): RelayConvening => ({
  afterCycle,
  opened: '2026-10-10',
  proposals: [
    { practice: 'field', question: 'Where does end-to-end research break on missing data?', docksOnto: 'the paper of cycle 006', date: '2026-10-10', ref: ref('field-research', 'f1e1d01') },
    { practice: 'atelier', question: 'Absence as form', docksOnto: null, date: '2026-10-10', ref: null },
    { practice: 'studio', question: WON, docksOnto: 'cycle 005’s rest read', date: '2026-10-11', ref: ref('studio', '57d1001') },
  ],
  rankings: [],
  result: talliedOn
    ? { question: WON, proposedBy: 'studio', scores: { field: 3, atelier: 1, studio: 5 }, talliedOn, rule: 'borda' }
    : null,
  skipped: 0,
})

const comment = (body: string, author = OWNER): NoticeComment => ({ author, body, createdAt: '2026-10-12T09:00:00Z' })
const issue = (number: number, title: string, state: 'open' | 'closed' = 'open', comments: NoticeComment[] = []): NoticeIssue => ({
  number,
  title,
  state,
  comments,
})

describe('the title', () => {
  it('names the convening and the day its result opens the next cycle, and reads back', () => {
    expect(noticeTitle(6, '2026-10-13')).toBe(TITLE)
    expect(parseNoticeTitle(TITLE)).toEqual({ afterCycle: 6, opensOn: '2026-10-13' })
    expect(parseNoticeTitle('Cycle sentinel — the running cycle is finished')).toBeNull()
    expect(parseNoticeTitle(`${TITLE} (copy)`)).toBeNull()
  })
})

describe('when the decision is due', () => {
  it('is due while cycle.json is in the convening and the relay holds a standing result for it', () => {
    expect(dueNotice(conveningState(), relay())).toMatchObject({ afterCycle: 6, opensOn: '2026-10-13', title: TITLE })
  })

  it('is not due while the convening has no result: a convening merely opening is no decision of his', () => {
    expect(dueNotice(conveningState(), relay(null))).toBeNull()
    expect(dueNotice(conveningState(), null)).toBeNull()
  })

  it('is not due on a result of another convening, outside the convening, or once the next cycle opened', () => {
    expect(dueNotice(conveningState(), relay('2026-10-12', 5))).toBeNull()
    expect(dueNotice(opened('convening', WON), relay())).toBeNull()
    expect(dueNotice({ ...conveningState(), phase: 'working', convening: null }, relay())).toBeNull()
  })

  it('is not due once an objection sets the result aside, and due again for a result tallied after it', () => {
    expect(dueNotice(conveningState({}, '2026-10-12'), relay('2026-10-12'))).toBeNull()
    expect(dueNotice(conveningState({}, '2026-10-11'), relay('2026-10-12'))).toMatchObject({ opensOn: '2026-10-13' })
  })

  it('is not due without a continuing question: no clock opens the cycle then', () => {
    expect(dueNotice(conveningState({ continuing: null }), relay())).toBeNull()
  })
})

describe('reading his reply', () => {
  it.each([
    'Widerspruch',
    'Widerspruch.',
    'Veto!',
    'Einspruch: die Frage passt nicht zum Programm.',
    'objection',
    'I object.',
    'Ich widerspreche.',
    'Hallo,\n\nWiderspruch gegen diese Frage.',
    '**Widerspruch**',
  ])('objects: %s', (body) => {
    expect(isObjection(body)).toBe(true)
  })

  it.each([
    'kein Widerspruch',
    'Keinen Einspruch, passt.',
    'No objection.',
    'This is not an objection.',
    'Ich widerspreche nicht.',
    'Passt so, danke.',
    '',
  ])('does not object: %s', (body) => {
    expect(isObjection(body)).toBe(false)
  })

  it('reads only his own words: what an email client quoted from the notice never counts', () => {
    const gmail =
      'Passt.\n\nOn Thu, Oct 12, 2026 at 9:00 AM frankbueltge <\nnotifications@github.com> wrote:\n\n> To object, reply with Widerspruch, Einspruch, objection or veto.'
    const outlook = 'Sieht gut aus.\n\n________________________________\nFrom: frankbueltge <notifications@github.com>\nTo object, reply with Widerspruch.'
    const footer = 'Danke.\n\nReply to this email directly, view it on GitHub. To object: veto.'
    const quoted = '> Widerspruch\n\nPasst doch.'
    for (const body of [gmail, outlook, footer, quoted]) expect(isObjection(body), body).toBe(false)
    expect(ownWords(gmail)).toBe('Passt.\n')
    // and an objection above the quote still counts
    expect(isObjection(`Widerspruch\n\n${gmail.slice('Passt.\n\n'.length)}`)).toBe(true)
  })

  it('counts only the owner’s comments — the bot’s own confirmation, or anyone else, never', () => {
    const bot = issue(1, TITLE, 'open', [comment('Objection recorded: …', 'github-actions[bot]'), comment('Widerspruch', 'someone-else')])
    expect(objectionIn(bot)).toBeNull()
    const his = issue(1, TITLE, 'open', [comment('Danke.'), comment('Veto')])
    expect(objectionIn(his)?.body).toBe('Veto')
  })
})

describe('the notice', () => {
  const input = (issues: NoticeIssue[] = [], cycle: CycleState = conveningState(), r: RelayConvening | null = relay()) => ({
    cycle,
    relay: r,
    issues,
    today: '2026-10-12',
  })

  it('opens one issue for a pending result, assigned to him, with all it needs to decide', () => {
    const actions = planNotice(input())
    expect(actions).toHaveLength(1)
    const create = actions[0]!
    if (create.kind !== 'create') throw new Error(create.kind)
    expect(create.title).toBe(TITLE)
    expect(create.assignee).toBe('frankbueltge')
    const body = create.body
    // a mention, so the notification is one even where the repository is not watched
    expect(body).toMatch(/^@frankbueltge, the convening after cycle 006 has a result\. Unless you object, it opens cycle 007 on \*\*2026-10-13\*\*\./)
    // the winning question and who proposed it; the scores, highest first
    expect(body).toContain(`**The winning question**, proposed by the Studio:\n\n> ${WON}`)
    expect(body).toContain('Tally (borda): the Studio 5 · the Field 3 · the Atelier 1; tallied 2026-10-12.')
    // all three proposals, with their docking lines and the bulletins the relay pinned
    expect(body).toContain('- **The Field**: Where does end-to-end research break on missing data?')
    expect(body).toContain('  Docks onto: the paper of cycle 006 · [bulletin, 2026-10-10](https://github.com/frankbueltge/field-research/blob/f1e1d01/BULLETIN.md)')
    expect(body).toContain('- **The Atelier**: Absence as form\n  Docks onto: not recorded · no bulletin pinned')
    expect(body).toContain('  Docks onto: cycle 005’s rest read · [bulletin, 2026-10-11](https://github.com/frankbueltge/studio/blob/57d1001/BULLETIN.md)')
    // how to object, by mail or comment, with the words that count, and until when
    expect(body).toContain('reply to this email, or comment on this issue, with *Widerspruch*, *Einspruch*, *objection* or *veto*')
    expect(body).toContain('only comments by @frankbueltge do')
    expect(body).toContain("before the clock's first run on 2026-10-13 (UTC)")
    // what an objection leads to: no new tally, and the fallback on the seventh day
    expect(body).toContain('If you object, no new tally comes for this convening.')
    expect(body).toContain('cycle 007 on the continuing question, Missing Data Art, on 2026-10-17, the seventh day after the convening opened.')
    expect(body).not.toContain('at once')
    expect(body).toContain('https://frankbueltge.de/ecology#convening')
  })

  it('says the fallback would follow at once when a late tally leaves the seventh day inside the veto window', () => {
    const late = planNotice(input([], conveningState(), relay('2026-10-17')))[0]!
    expect(late.kind === 'create' && late.title).toBe('Convening after cycle 006: the next question opens on 2026-10-18')
    expect(late.kind === 'create' && late.body).toContain('on 2026-10-17, the seventh day after the convening opened, or at once if you object on or after that day.')
  })

  it('opens it once: an issue of that title, open or closed, is never repeated', () => {
    expect(planNotice(input([issue(41, TITLE)]))).toEqual([])
    // closed by hand without a word: read, and silence is consent — no second mail
    expect(planNotice(input([issue(41, TITLE, 'closed')]))).toEqual([])
  })

  it('sends nothing while a convening merely runs, and nothing outside one', () => {
    expect(planNotice(input([], conveningState(), relay(null)))).toEqual([])
    expect(planNotice(input([], conveningState(), null))).toEqual([])
    expect(planNotice(input([], opened('continuing', 'Missing Data Art'), null))).toEqual([])
  })

  it('keeps a notice open while its convening runs, even when the relay mirror is silent for a night', () => {
    expect(planNotice(input([issue(41, TITLE)], conveningState(), null))).toEqual([])
  })

  it('closes the notice when the next cycle opens on the result, saying which question opened', () => {
    const actions = planNotice(input([issue(41, TITLE)], opened('convening', WON, '2026-10-13')))
    expect(actions.map((a) => a.kind)).toEqual(['comment', 'close'])
    const note = actions[0]!.kind === 'comment' ? actions[0]!.body : ''
    expect(note).toContain(`Cycle 007 opened on 2026-10-13 on the convening's result:\n\n> ${WON}`)
    expect(note).toContain('Closing this notice.')
    expect(note).not.toContain('was not recorded')
  })

  it('closes it on the fallback and on a seed too, naming the question that opened', () => {
    const fallback = planNotice(input([issue(41, TITLE)], opened('continuing', 'Missing Data Art', '2026-10-17')))
    expect(fallback[0]).toMatchObject({ kind: 'comment', issue: 41 })
    expect(fallback[0]!.kind === 'comment' && fallback[0]!.body).toContain(
      "Cycle 007 opened on 2026-10-17 on the continuing question, the convening's fallback:\n\n> Missing Data Art",
    )
    const seed = planNotice(input([issue(41, TITLE)], opened('seed', 'What does the sea forget?', '2026-10-12')))
    expect(seed[0]!.kind === 'comment' && seed[0]!.body).toContain('a seed released to all three through the public channel')
    expect(seed.map((a) => a.kind)).toEqual(['comment', 'close'])
  })

  it('says so when an objection of his came too late to set the result aside', () => {
    const late = issue(41, TITLE, 'open', [comment('Widerspruch')])
    const actions = planNotice(input([late], opened('convening', WON, '2026-10-13')))
    expect(actions[0]!.kind === 'comment' && actions[0]!.body).toContain(
      'An objection in this thread was not recorded before the cycle opened, so it did not set the result aside.',
    )
    // on the fallback the objection took effect, so the note would be false there
    const fallback = planNotice(input([late], opened('continuing', 'Missing Data Art', '2026-10-17')))
    expect(fallback[0]!.kind === 'comment' && fallback[0]!.body).not.toContain('was not recorded')
  })

  it('closes a notice whose result an objection set aside — one recorded by hand, or one whose confirmation failed', () => {
    const actions = planNotice(input([issue(41, TITLE)], conveningState({}, '2026-10-12')))
    expect(actions.map((a) => a.kind)).toEqual(['comment', 'close'])
    expect(actions[0]!.kind === 'comment' && actions[0]!.body).toContain('Objection recorded: `src/data/ecology/cycle.json` carries `"objected": "2026-10-12"`')
  })

  it('closes a notice whose convening the record no longer shows', () => {
    const reverted: CycleState = { ...conveningState(), phase: 'working', convening: null }
    const actions = planNotice(input([issue(41, TITLE)], reverted))
    expect(actions[0]!.kind === 'comment' && actions[0]!.body).toContain('no longer shows this convening: it stands at cycle 006, phase working')
    expect(actions.map((a) => a.kind)).toEqual(['comment', 'close'])
  })

  it('leaves closed notices and other issues alone', () => {
    const others = [issue(7, 'Request aus studio: something'), issue(40, 'Convening after cycle 005: the next question opens on 2026-10-06', 'closed')]
    expect(planNotice(input(others, opened('convening', WON)))).toEqual([])
  })

  it('makes the practices’ lines inert: no @-name pings a stranger, no #number links an issue', () => {
    expect(inert('ask @octocat about #12, line\nbreak')).toBe('ask @​octocat about #​12, line break')
    const r = relay()
    r.proposals[1] = { ...r.proposals[1]!, question: 'Ask @octocat about #12' }
    const create = planNotice(input([], conveningState(), r))[0]!
    expect(create.kind === 'create' && create.body).toContain('Ask @​octocat about #​12')
    expect(create.kind === 'create' && create.body).not.toContain('@octocat')
  })
})

describe('the objection, read before the clock decides', () => {
  const input = (issues: NoticeIssue[], cycle: CycleState = conveningState(), today = '2026-10-12') => ({
    cycle,
    relay: relay(),
    issues,
    today,
  })

  it('records his objection with the day of the run, confirms it with what follows, and closes the notice', () => {
    const plan = planObjection(input([issue(41, TITLE, 'open', [comment('Widerspruch')])]))
    expect(plan.record).toEqual({ afterCycle: 6, date: '2026-10-12', issue: 41 })
    expect(plan.actions.map((a) => a.kind)).toEqual(['comment', 'close'])
    const note = plan.actions[0]!.kind === 'comment' ? plan.actions[0]!.body : ''
    expect(note).toContain('Objection recorded: `src/data/ecology/cycle.json` carries `"objected": "2026-10-12"` in its convening block, so this result does not open cycle 007.')
    expect(note).toContain("No new tally comes for this convening: the Middle's relay sets a convening's result once and never changes it.")
    expect(note).toContain('Unless you turn the cycle by hand in `src/data/ecology/cycle.json`, the cycle clock opens cycle 007 on the continuing question, Missing Data Art, on 2026-10-17')
  })

  it('reads a notice he closed as he replied, and does not close it twice', () => {
    const plan = planObjection(input([issue(41, TITLE, 'closed', [comment('Veto')])]))
    expect(plan.record?.date).toBe('2026-10-12')
    expect(plan.actions.map((a) => a.kind)).toEqual(['comment'])
  })

  it('says the fallback opens at once when the seventh day has come', () => {
    const plan = planObjection(input([issue(41, TITLE, 'open', [comment('Einspruch')])], conveningState(), '2026-10-17'))
    expect(plan.actions[0]!.kind === 'comment' && plan.actions[0]!.body).toContain('at once: the seventh day after the convening opened (2026-10-17) has come')
  })

  it('records nothing without an objection of his, on another notice, or when nothing is pending', () => {
    expect(planObjection(input([issue(41, TITLE, 'open', [comment('Danke, passt.')])])).record).toBeNull()
    expect(planObjection(input([issue(41, TITLE, 'open', [comment('Widerspruch', 'someone-else')])])).record).toBeNull()
    expect(planObjection(input([issue(40, 'Convening after cycle 005: the next question opens on 2026-10-06', 'open', [comment('Widerspruch')])])).record).toBeNull()
    expect(planObjection({ ...input([issue(41, TITLE, 'open', [comment('Widerspruch')])]), relay: relay(null) }).record).toBeNull()
    // already set aside: one record is enough
    expect(planObjection(input([issue(41, TITLE, 'open', [comment('Widerspruch')])], conveningState({}, '2026-10-12'))).record).toBeNull()
  })

  it('never records a day before the tally it objects to', () => {
    const plan = planObjection(input([issue(41, TITLE, 'open', [comment('Widerspruch')])], conveningState(), '2026-10-11'))
    expect(plan.record?.date).toBe('2026-10-12')
  })
})

describe('the record', () => {
  const raw = () => ({
    _note: 'kept',
    cycle: 6,
    phase: 'convening',
    question: 'Missing Data Art, read through human extinction by AI',
    source: 'continuing',
    seed_id: null,
    opened: '2026-10-07',
    convening: { after_cycle: 6, opened: '2026-10-10' },
    sessions_per_practice: '3-5',
    continuing: CONTINUING,
    taken_seeds: [],
    defaults: { field: 'f', atelier: 'a', studio: 's' },
    transition: 'the last turn',
  })

  it('writes the objection into the convening block and keeps every other key in its place', () => {
    const next = withObjection(raw(), '2026-10-12')
    expect(Object.keys(next)).toEqual(Object.keys(raw()))
    expect(next.convening).toEqual({ after_cycle: 6, opened: '2026-10-10', objected: '2026-10-12' })
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'convening-notice-'))
    fs.mkdirSync(path.join(root, 'src/data/ecology'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/data/ecology/cycle.json'), JSON.stringify(next, null, 2))
    expect(loadCycle(root).convening).toEqual({ afterCycle: 6, opened: '2026-10-10', objected: '2026-10-12' })
  })

  it('refuses a state outside a convening', () => {
    expect(() => withObjection({ ...raw(), phase: 'working', convening: undefined }, '2026-10-12')).toThrow(/not in a convening/)
  })
})

describe('a convening, run by run: the notice, the reply and the clock together', () => {
  // The sentinel's order on every run: the objection is read, THEN the clock decides, THEN the
  // notice is planned. These walks run the three pure halves in that order on the state each run
  // would leave — the workflow only carries out what they return.
  const raw = (objected?: string) => ({
    cycle: 6,
    phase: 'convening',
    question: 'Missing Data Art, read through human extinction by AI',
    source: 'continuing',
    seed_id: null,
    opened: '2026-10-07',
    convening: { after_cycle: 6, opened: '2026-10-10', ...(objected ? { objected } : {}) },
    sessions_per_practice: '3-5',
    continuing: CONTINUING,
    taken_seeds: [],
    defaults: { field: 'f', atelier: 'a', studio: 's' },
  })
  const asState = (r: Record<string, unknown>): CycleState => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'convening-walk-'))
    fs.mkdirSync(path.join(root, 'src/data/ecology'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/data/ecology/cycle.json'), JSON.stringify(r, null, 2))
    return loadCycle(root)
  }

  it('without a word from him: one notice on the tally day, the opening a day later, and the notice closed', () => {
    // 2026-10-12: the relay tallies; the clock waits out the veto day; the notice goes out
    const day1 = raw()
    expect(planObjection({ cycle: asState(day1), relay: relay(), issues: [], today: '2026-10-12' }).record).toBeNull()
    expect(planTurn(day1, true, [], '2026-10-12', relay())).toBeNull()
    expect(planNotice({ cycle: asState(day1), relay: relay(), issues: [], today: '2026-10-12' }).map((a) => a.kind)).toEqual(['create'])
    // 2026-10-13, first run: still no objection; the clock opens cycle 007 on the result
    const notice = issue(41, TITLE, 'open', [comment('Danke.')])
    expect(planObjection({ cycle: asState(day1), relay: relay(), issues: [notice], today: '2026-10-13' }).record).toBeNull()
    const turn = planTurn(day1, true, [], '2026-10-13', relay())!
    expect(turn.kind).toBe('convened')
    const after = asState(turn.next)
    const close = planNotice({ cycle: after, relay: relay(), issues: [notice], today: '2026-10-13' })
    expect(close.map((a) => a.kind)).toEqual(['comment', 'close'])
    expect(close[0]!.kind === 'comment' && close[0]!.body).toContain("Cycle 007 opened on 2026-10-13 on the convening's result")
  })

  it('with his objection: recorded before the clock decides, so the result never opens, and the fallback follows', () => {
    const notice = issue(41, TITLE, 'open', [comment('Widerspruch')])
    // 2026-10-13, first run: the objection is read first …
    const plan = planObjection({ cycle: asState(raw()), relay: relay(), issues: [notice], today: '2026-10-13' })
    expect(plan.record?.date).toBe('2026-10-13')
    const recorded = withObjection(raw(), plan.record!.date)
    // … so the clock, deciding on the same run, finds the result set aside and does not open it
    expect(planTurn(recorded, true, [], '2026-10-13', relay())).toBeNull()
    // the notice is closed by the objection's own actions; nothing else goes out
    const closed = { ...notice, state: 'closed' as const }
    expect(planNotice({ cycle: asState(recorded), relay: relay(), issues: [closed], today: '2026-10-13' })).toEqual([])
    // 2026-10-17: no new tally came, the seventh day opens cycle 007 on the continuing question
    const fallback = planTurn(recorded, true, [], '2026-10-17', relay())!
    expect(fallback.kind).toBe('fallback')
    expect(fallback.next.question).toBe('Missing Data Art')
    expect(planNotice({ cycle: asState(fallback.next), relay: relay(), issues: [closed], today: '2026-10-17' })).toEqual([])
  })
})
