// The notice's mouth (scripts/ecology/convening-notice.ts), run in-process against a fixture house
// and a stand-in for gh: a dry run prints the planned issue and sends nothing, a real run sends
// exactly what the plan says, an objection is written into cycle.json and confirmed only after it
// is committed — and the sentinel runs the three stages in the order that makes this safe.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { main, type Io } from './convening-notice'

const TITLE = 'Convening after cycle 006: the next question opens on 2026-10-13'
const REPO = 'frankbueltge/frankbueltge.de'

function house(phase: 'convening' | 'working' = 'convening'): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'convening-mouth-'))
  fs.mkdirSync(path.join(root, 'src/data/ecology'), { recursive: true })
  fs.mkdirSync(path.join(root, 'src/data/middle'), { recursive: true })
  const cycle = {
    cycle: 6,
    phase,
    question: 'Missing Data Art, read through human extinction by AI',
    source: 'continuing',
    seed_id: null,
    opened: '2026-10-07',
    ...(phase === 'convening' ? { convening: { after_cycle: 6, opened: '2026-10-10' } } : {}),
    sessions_per_practice: '3-5',
    continuing: { question: 'Missing Data Art', since: '2026-10-03' },
    taken_seeds: [],
    defaults: { field: 'f', atelier: 'a', studio: 's' },
  }
  fs.writeFileSync(path.join(root, 'src/data/ecology/cycle.json'), JSON.stringify(cycle, null, 2) + '\n')
  const bulletin = (repo: string, commit: string) => ({ repo, path: 'BULLETIN.md', commit })
  const relay = {
    $contract: 'middle-relay/1',
    generated_at: '2026-10-12T07:00:00Z',
    relations: [],
    handoffs: [],
    convening: {
      after_cycle: 6,
      opened: '2026-10-10',
      proposals: [
        { practice: 'field', question: 'Where does research break?', docks_onto: 'the paper of cycle 006', date: '2026-10-10', ref: bulletin('field-research', 'f1e1d01') },
        { practice: 'atelier', question: 'Absence as form', docks_onto: 'the window of cycle 006', date: '2026-10-10', ref: bulletin('ulysses', 'a7e1e01') },
        { practice: 'studio', question: 'What the archive refuses to count', docks_onto: 'the rest read', date: '2026-10-11', ref: bulletin('studio', '57d1001') },
      ],
      rankings: [],
      result: { question: 'What the archive refuses to count', proposed_by: 'studio', scores: { field: 3, atelier: 1, studio: 5 }, tallied_on: '2026-10-12', rule: 'borda' },
    },
    programme: [],
  }
  fs.writeFileSync(path.join(root, 'src/data/middle/relay.json'), JSON.stringify(relay, null, 2))
  return root
}

/** A stand-in for gh: answers the reads from `issues` and records every call. */
function io(issues: { number: number; title: string; state: string; comments?: { author: string; body: string }[] }[] = []) {
  const calls: string[][] = []
  const out: string[] = []
  const err: string[] = []
  const summary: string[] = []
  const gh = (args: string[]): string => {
    calls.push(args)
    if (args[0] === 'issue' && args[1] === 'list') return JSON.stringify(issues.map(({ number, title, state }) => ({ number, title, state })))
    if (args[0] === 'api') {
      const n = Number(/issues\/(\d+)\/comments/.exec(args[2]!)![1])
      const found = issues.find((i) => i.number === n)
      return (found?.comments ?? []).map((c) => JSON.stringify({ ...c, createdAt: '2026-10-12T09:00:00Z' })).join('\n') + '\n'
    }
    if (args[0] === 'issue' && args[1] === 'create') return `https://github.com/${REPO}/issues/99\n`
    return ''
  }
  const bag: Io = { gh, out: (l) => out.push(l), err: (l) => err.push(l), summary: (m) => summary.push(m), repo: REPO }
  return { io: bag, calls, out, err, summary }
}

const sends = (calls: string[][]) => calls.filter((c) => c[0] === 'issue' && ['create', 'comment', 'close'].includes(c[1]!))

describe('the notice stage', () => {
  it('in a dry run prints the planned issue and creates nothing', () => {
    const root = house()
    const t = io()
    expect(main(['notice', '--dry-run', '--root', root, '--today', '2026-10-12'], t.io)).toBe(0)
    expect(sends(t.calls)).toEqual([])
    const printed = t.err.join('\n')
    expect(printed).toContain(`would create "${TITLE}", assigned to frankbueltge`)
    expect(printed).toContain('@frankbueltge, the convening after cycle 006 has a result.')
    expect(printed).toContain('What the archive refuses to count')
    expect(JSON.parse(t.out[0]!)).toEqual({ due: TITLE, dryRun: true, actions: [{ kind: 'create', title: TITLE }] })
    expect(t.summary.join('')).toContain('(dry run: nothing sent)')
  })

  it('creates the issue, assigned to him, once', () => {
    const root = house()
    const first = io()
    main(['notice', '--root', root, '--today', '2026-10-12'], first.io)
    const [create] = sends(first.calls)
    expect(create!.slice(0, 6)).toEqual(['issue', 'create', '--repo', REPO, '--title', TITLE])
    expect(create!.slice(-2)).toEqual(['--assignee', 'frankbueltge'])
    // the next run finds it by its exact title and sends nothing
    const again = io([{ number: 99, title: TITLE, state: 'OPEN' }])
    main(['notice', '--root', root, '--today', '2026-10-12'], again.io)
    expect(sends(again.calls)).toEqual([])
  })

  it('opens the notice unassigned rather than not at all, should the assignment be refused', () => {
    const t = io()
    const gh = t.io.gh
    t.io.gh = (args) => {
      if (args[1] === 'create' && args.includes('--assignee')) {
        t.calls.push(args)
        throw new Error('could not assign user: frankbueltge')
      }
      return gh(args)
    }
    main(['notice', '--root', house(), '--today', '2026-10-12'], t.io)
    const creates = sends(t.calls).filter((c) => c[1] === 'create')
    expect(creates).toHaveLength(2)
    expect(creates[1]).not.toContain('--assignee')
    // the body names him either way
    expect(creates[1]![creates[1]!.indexOf('--body') + 1]).toMatch(/^@frankbueltge, /)
  })

  it('reads the issues from a file when given one, and then asks GitHub nothing', () => {
    const root = house()
    const file = path.join(root, 'issues.json')
    fs.writeFileSync(file, JSON.stringify([{ number: 99, title: TITLE, state: 'closed', comments: [] }]))
    const t = io()
    main(['notice', '--root', root, '--issues', file, '--today', '2026-10-12'], t.io)
    expect(t.calls).toEqual([])
  })
})

describe('the objection stage', () => {
  const notice = [{ number: 99, title: TITLE, state: 'OPEN', comments: [{ author: 'frankbueltge', body: 'Widerspruch' }] }]

  it('asks GitHub nothing when no result is pending, so it cannot hold the clock back then', () => {
    const t = io(notice)
    expect(main(['objections', '--root', house('working'), '--today', '2026-10-12'], t.io)).toBe(0)
    expect(t.calls).toEqual([])
    expect(JSON.parse(t.out[0]!)).toMatchObject({ recorded: false })
  })

  it('writes his objection into cycle.json and keeps the confirmation for after the commit', () => {
    const root = house()
    const plan = path.join(root, 'plan.json')
    const t = io(notice)
    expect(main(['objections', '--root', root, '--plan', plan, '--today', '2026-10-12'], t.io)).toBe(0)
    expect(JSON.parse(t.out[0]!)).toEqual({ recorded: true, afterCycle: 6, date: '2026-10-12', issue: 99, cycle: 6 })
    const cycle = JSON.parse(fs.readFileSync(path.join(root, 'src/data/ecology/cycle.json'), 'utf8'))
    expect(cycle.convening).toEqual({ after_cycle: 6, opened: '2026-10-10', objected: '2026-10-12' })
    // nothing is said on GitHub before the record is pushed
    expect(sends(t.calls)).toEqual([])
    expect(JSON.parse(fs.readFileSync(plan, 'utf8')).map((a: { kind: string }) => a.kind)).toEqual(['comment', 'close'])
    // then `execute` carries out the confirmation, comment first
    const after = io()
    main(['execute', '--plan', plan], after.io)
    expect(sends(after.calls).map((c) => c.slice(0, 3))).toEqual([
      ['issue', 'comment', '99'],
      ['issue', 'close', '99'],
    ])
  })

  it('in a dry run plans the record and writes nothing', () => {
    const root = house()
    const before = fs.readFileSync(path.join(root, 'src/data/ecology/cycle.json'), 'utf8')
    const t = io(notice)
    main(['objections', '--dry-run', '--root', root, '--today', '2026-10-12'], t.io)
    expect(fs.readFileSync(path.join(root, 'src/data/ecology/cycle.json'), 'utf8')).toBe(before)
    expect(JSON.parse(t.out[0]!)).toMatchObject({ recorded: false, planned: true, date: '2026-10-12' })
    expect(sends(t.calls)).toEqual([])
  })
})

describe('the sentinel runs the stages in the safe order', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/cycle-sentinel.yml'), 'utf8')
  const at = (needle: string) => {
    const i = workflow.indexOf(needle)
    expect(i, needle).toBeGreaterThan(-1)
    return i
  }

  it('reads the objection before the clock decides, and sends the notice after it', () => {
    const objection = at('convening-notice.ts objections')
    const turn = at('scripts/ecology/cycle-turn.ts')
    const notice = at('convening-notice.ts notice')
    expect(objection).toBeLessThan(turn)
    expect(turn).toBeLessThan(notice)
    // the confirmation is sent only after the record is pushed
    expect(at('convening-notice.ts execute')).toBeGreaterThan(workflow.indexOf('git push', objection))
  })

  it('never lets a failed notice hold back the deploy of a turn, and deploys an objection like a turn', () => {
    const step = workflow.slice(at('convening-notice.ts notice') - 1500, at('convening-notice.ts notice'))
    expect(step).toMatch(/continue-on-error: true/)
    expect(workflow).toContain("(steps.turn.outputs.turned == 'true' || steps.objection.outputs.recorded == 'true')")
  })

  it('offers the dry run on a manual start', () => {
    expect(workflow).toMatch(/notice_dry_run:/)
    expect(workflow).toContain("inputs.notice_dry_run && '--dry-run' || ''")
  })
})
