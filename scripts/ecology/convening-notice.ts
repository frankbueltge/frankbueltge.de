// scripts/ecology/convening-notice.ts — the architect's notice, carried out (2026-10-08).
//
// The decisions are src/lib/ecology/convening-notice.ts, under test. This file reads the inputs —
// cycle.json, the mirrored relay's convening, and the notice issues with their comments — and
// carries the decisions out with gh; with --dry-run it prints them and writes and sends nothing.
// The cycle sentinel (.github/workflows/cycle-sentinel.yml) runs it in three places:
//
//   objections [--plan FILE]   BEFORE the clock decides. An objection of the architect's on the
//                              pending result's notice is written into cycle.json as
//                              convening.objected (read back through loadCycle, so a state the
//                              site would refuse is never left behind); the workflow commits it,
//                              and the comment and close that confirm it wait in FILE for `execute`.
//                              With nothing pending it asks GitHub nothing at all.
//   execute --plan FILE        after the objection is pushed: carries out FILE's actions.
//   notice                     AFTER the clock has decided: opens the notice a pending result
//                              needs, and closes the open notices that are no longer pending.
//
//   --dry-run            print the planned issue, comments and closes; write and send nothing
//   --root DIR           read cycle.json and the relay mirror under DIR (default: the working dir)
//   --issues FILE        read the notice issues (NoticeIssue[] as JSON) from FILE, not from GitHub
//   --today YYYY-MM-DD   the day to plan for (default: today, UTC — the clock's own day)
//
// stdout carries one JSON object for the workflow to branch on; stderr one line per decision.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadRelayExtras, type RelayConvening } from '../../src/lib/ecology/convening'
import {
  dueNotice,
  OWNER,
  parseNoticeTitle,
  planNotice,
  planObjection,
  withObjection,
  type DueNotice,
  type NoticeAction,
  type NoticeComment,
  type NoticeIssue,
} from '../../src/lib/ecology/convening-notice'
import { loadCycle, type CycleState } from '../../src/lib/ecology/v3'

export interface Io {
  /** runs gh with these arguments and returns its stdout; throws when gh fails */
  gh: (args: string[]) => string
  out: (line: string) => void
  err: (line: string) => void
  /** appends to the job summary, where the run has one */
  summary: (markdown: string) => void
  repo: string
}

interface Options {
  stage: string
  dryRun: boolean
  plan: string | null
  root: string
  issues: string | null
  today: string
}

const DAY = /^\d{4}-\d{2}-\d{2}$/
const CYCLE_FILE = 'src/data/ecology/cycle.json'
const USAGE = 'usage: convening-notice.ts objections|execute|notice [--dry-run] [--plan FILE] [--root DIR] [--issues FILE] [--today YYYY-MM-DD]'

function options(argv: string[]): Options {
  const [stage = '', ...rest] = argv
  const value = (flag: string): string | null => {
    const i = rest.indexOf(flag)
    return i >= 0 ? (rest[i + 1] ?? null) : null
  }
  return {
    stage,
    dryRun: rest.includes('--dry-run'),
    plan: value('--plan'),
    root: value('--root') ?? process.cwd(),
    issues: value('--issues'),
    today: value('--today') ?? new Date().toISOString().slice(0, 10),
  }
}

// ——— reading GitHub ——————————————————————————————————————————————————————————————

function readComments(io: Io, issue: number): NoticeComment[] {
  const lines = io.gh([
    'api',
    '--paginate',
    `repos/${io.repo}/issues/${issue}/comments`,
    '--jq',
    '.[] | {author: .user.login, body: .body, createdAt: .created_at}',
  ])
  return lines
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as NoticeComment)
}

/**
 * The notice issues, found the requests watchdog's way: every issue's title, open or closed, read
 * once and compared exactly (the search API can lag behind an issue just created, and a lag here
 * would be a second email). Comments are read only where a plan looks at them: the open notices,
 * and the pending result's own notice whatever its state.
 */
function readIssues(io: Io, file: string | null, pendingTitle: string | null): NoticeIssue[] {
  if (file) return JSON.parse(fs.readFileSync(file, 'utf8')) as NoticeIssue[]
  const all = JSON.parse(
    io.gh(['issue', 'list', '--repo', io.repo, '--state', 'all', '--limit', '1000', '--json', 'number,title,state']),
  ) as { number: number; title: string; state: string }[]
  return all
    .filter((i) => parseNoticeTitle(i.title) !== null)
    .map((i) => {
      const state = i.state.toUpperCase() === 'OPEN' ? ('open' as const) : ('closed' as const)
      const comments = state === 'open' || i.title === pendingTitle ? readComments(io, i.number) : []
      return { number: i.number, title: i.title, state, comments }
    })
}

// ——— acting on GitHub ————————————————————————————————————————————————————————————

function describe(a: NoticeAction): string {
  if (a.kind === 'create') return `create "${a.title}", assigned to ${a.assignee}`
  if (a.kind === 'comment') return `comment on #${a.issue}`
  return `close #${a.issue}`
}

const indent = (text: string) =>
  text
    .split('\n')
    .map((l) => `    ${l}`)
    .join('\n')

/** Whether an issue of exactly this title exists, open or closed. */
function exists(io: Io, title: string): boolean {
  const all = JSON.parse(io.gh(['issue', 'list', '--repo', io.repo, '--state', 'all', '--limit', '1000', '--json', 'title'])) as { title: string }[]
  return all.some((i) => i.title === title)
}

/**
 * Opens the notice, assigned. Should the assignment ever be refused, the issue is opened without
 * it — once the exact title is confirmed absent, so a half-made attempt is never doubled — because
 * the @-mention in the body still reaches him, and a notice that never opens reaches no one.
 */
function create(io: Io, a: Extract<NoticeAction, { kind: 'create' }>): string {
  const base = ['issue', 'create', '--repo', io.repo, '--title', a.title, '--body', a.body]
  try {
    return io.gh([...base, '--assignee', a.assignee])
  } catch (err) {
    if (exists(io, a.title)) throw err
    io.err(`  could not assign ${a.assignee} (${(err as Error).message.split('\n')[0]}); opening it unassigned — the mention still reaches him`)
    return io.gh(base)
  }
}

function carryOut(actions: readonly NoticeAction[], io: Io, dryRun: boolean): void {
  for (const a of actions) {
    io.err(`${dryRun ? 'would ' : ''}${describe(a)}`)
    if (dryRun) {
      if (a.kind !== 'close') io.err(indent(a.body))
      continue
    }
    if (a.kind === 'create') {
      io.err(`  -> ${create(io, a).trim()}`)
    } else if (a.kind === 'comment') {
      io.gh(['issue', 'comment', String(a.issue), '--repo', io.repo, '--body', a.body])
    } else {
      io.gh(['issue', 'close', String(a.issue), '--repo', io.repo, '--reason', 'completed'])
    }
  }
}

/** The run's own record: every action, and in a dry run the full text it would have sent. */
function summarise(io: Io, heading: string, lines: string[], actions: readonly NoticeAction[], dryRun: boolean): void {
  const md = [`### Convening notice — ${heading}${dryRun ? ' (dry run: nothing sent)' : ''}`, '', ...lines.map((l) => `- ${l}`)]
  for (const a of actions) {
    md.push(`- ${dryRun ? 'would ' : ''}${describe(a)}`)
    if (dryRun && a.kind !== 'close') md.push('', '<details><summary>text</summary>', '', a.body, '', '</details>', '')
  }
  io.summary(md.join('\n') + '\n')
}

// ——— the three stages ————————————————————————————————————————————————————————————

function objections(o: Options, io: Io, cycle: CycleState, relay: RelayConvening | null, due: DueNotice | null): number {
  if (!due) {
    io.err('objections: no tallied result is pending, so there is no objection to read')
    io.out(JSON.stringify({ recorded: false, cycle: cycle.cycle }))
    return 0
  }
  const issues = readIssues(io, o.issues, due.title)
  const plan = planObjection({ cycle, relay, issues, today: o.today })
  if (!plan.record) {
    const notice = issues.find((i) => i.title === due.title)
    io.err(`objections: pending "${due.title}" — ${notice ? `no objection from @${OWNER} on #${notice.number}` : 'its notice is not open yet'}`)
    io.out(JSON.stringify({ recorded: false, cycle: cycle.cycle }))
    return 0
  }
  const line = `convening.objected = ${plan.record.date}, from the objection on #${plan.record.issue}`
  if (o.dryRun) {
    io.err(`objections: would record ${line}`)
    carryOut(plan.actions, io, true)
    summarise(io, 'objection', [`would record ${line}`], plan.actions, true)
    io.out(JSON.stringify({ recorded: false, planned: true, ...plan.record, cycle: cycle.cycle }))
    return 0
  }
  if (!o.plan) {
    io.err('objections: --plan FILE is required to record an objection (its confirmation waits there)')
    return 2
  }
  const file = path.join(o.root, CYCLE_FILE)
  const before = fs.readFileSync(file, 'utf8')
  fs.writeFileSync(file, JSON.stringify(withObjection(JSON.parse(before), plan.record.date), null, 2) + '\n')
  try {
    loadCycle(o.root)
  } catch (err) {
    fs.writeFileSync(file, before)
    throw err
  }
  fs.writeFileSync(o.plan, JSON.stringify(plan.actions, null, 2) + '\n')
  io.err(`objections: recorded ${line}`)
  summarise(io, 'objection', [`recorded ${line}`], [], false)
  io.out(JSON.stringify({ recorded: true, ...plan.record, cycle: cycle.cycle }))
  return 0
}

function execute(o: Options, io: Io): number {
  if (!o.plan) {
    io.err('execute: --plan FILE is required')
    return 2
  }
  const actions = JSON.parse(fs.readFileSync(o.plan, 'utf8')) as NoticeAction[]
  carryOut(actions, io, o.dryRun)
  io.out(JSON.stringify({ executed: o.dryRun ? 0 : actions.length }))
  return 0
}

function notice(o: Options, io: Io, cycle: CycleState, relay: RelayConvening | null, due: DueNotice | null): number {
  const issues = readIssues(io, o.issues, due?.title ?? null)
  const actions = planNotice({ cycle, relay, issues, today: o.today })
  const standing = due ? issues.find((i) => i.title === due.title) : undefined
  const state = due
    ? `pending: "${due.title}"${standing ? ` — its notice is #${standing.number} (${standing.state})` : ''}`
    : `no tallied result is pending (cycle ${cycle.cycle}, phase ${cycle.phase})`
  io.err(`notice: ${state}${actions.length === 0 ? ' — nothing to send' : ''}`)
  carryOut(actions, io, o.dryRun)
  summarise(io, 'notice', [state], actions, o.dryRun)
  io.out(
    JSON.stringify({
      due: due?.title ?? null,
      dryRun: o.dryRun,
      actions: actions.map((a) => (a.kind === 'create' ? { kind: a.kind, title: a.title } : { kind: a.kind, issue: a.issue })),
    }),
  )
  return 0
}

export function main(argv: string[], io: Io): number {
  const o = options(argv)
  if (!DAY.test(o.today)) {
    io.err(`--today must be YYYY-MM-DD, got "${o.today}"`)
    return 2
  }
  if (o.stage === 'execute') return execute(o, io)
  if (o.stage !== 'objections' && o.stage !== 'notice') {
    io.err(USAGE)
    return 2
  }
  const cycle = loadCycle(o.root)
  const relay = loadRelayExtras(o.root).convening
  const due = dueNotice(cycle, relay)
  return o.stage === 'objections' ? objections(o, io, cycle, relay, due) : notice(o, io, cycle, relay, due)
}

function realIo(): Io {
  return {
    gh: (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }),
    out: (line) => process.stdout.write(line + '\n'),
    err: (line) => process.stderr.write(line + '\n'),
    summary: (markdown) => {
      const file = process.env.GITHUB_STEP_SUMMARY
      if (file) fs.appendFileSync(file, markdown)
    },
    repo: process.env.GITHUB_REPOSITORY ?? 'frankbueltge/frankbueltge.de',
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2), realIo())
}
