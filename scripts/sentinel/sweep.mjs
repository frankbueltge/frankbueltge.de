#!/usr/bin/env node
// scripts/sentinel/sweep.mjs — the ecology's own plumbing, watched by something other than Frank.
//
// Why this exists, in the words of the day it was ordered (2026-08-13): "kann diese scheiss
// ecology nicht mal 2 tage laufen ohne dass wir tausend sachen fixen und ich hundert sachen
// entscheiden oder manuell machen muss."
//
// He is right, and the diagnosis is narrower than it looks. The PRACTICES ran fine — three
// houses worked through the night, refuted their own published figures and corrected themselves
// unprompted. What failed all day was the PLUMBING, and the plumbing's only watcher was Frank.
// Every practice has a constitution, a gate and an adversary. The pipes had a person.
//
// The existing six watchdogs (drift, mirror, landing, requests, spielraum, morning digest) all
// do the same thing when they find something: they OPEN AN ISSUE. Six streams of issues is the
// load being complained about, not the relief from it. So this one is built on the opposite
// rule:
//
//   **It reports only what survived a retry, and it reports one line.**
//
// The single most common failure shape in this ecology is not a broken thing. It is a thing that
// went red for a real reason, was fixed upstream, and then sat red because nobody re-dispatched
// it. On 2026-08-13 alone that was four workflows, re-run by hand. A retry costs a minute of CI
// and settles the question; escalating without one is how a fixed problem keeps a person busy.
//
// What this sweep deliberately does NOT do: repair code. A deterministic script cannot know what
// a novel failure means, and a script that guesses at repairs would add a class of problem worse
// than the one it solves. It retries, it counts, it names — and what survives that is a real
// finding, small in number, which is the only kind worth a person's evening.

import { execFileSync } from 'node:child_process'

/**
 * The ecology's repositories, and what each one's silence would mean.
 * `frankbueltge.de` is the hub; the three practices are the houses; research-ecology records the
 * contact zone; machine-attention is the counter-experiment beside the ecology, same law.
 */
export const REPOS = [
  { repo: 'frankbueltge/frankbueltge.de', role: 'hub' },
  { repo: 'frankbueltge/ulysses', role: 'practice' },
  { repo: 'frankbueltge/field-research', role: 'practice' },
  { repo: 'frankbueltge/studio', role: 'practice' },
  { repo: 'frankbueltge/research-ecology', role: 'contact zone' },
  { repo: 'frankbueltge/machine-attention', role: 'counter-experiment' },
]

/**
 * Reds that are known, understood and deliberately not fixed — each with the reason and the
 * document that holds the diagnosis. A suppression without a citation is just a blind spot with
 * better manners, so every entry names where the reasoning lives and what would end it.
 */
export const ACCEPTED_RED = [
  {
    repo: 'frankbueltge/frankbueltge.de',
    workflow: 'Workers Builds: frankbueltge-de',
    why:
      'A second, dashboard-side Cloudflare binding that wants to build the same project again ' +
      'and cannot. Blocks nothing — main has no branch protection. Diagnosis and the one-click ' +
      'fix: docs/design/2026-08-03-two-deployers-one-project.md. Ends when that binding is removed.',
  },
]

/**
 * The keys each repository may be read with, best first.
 *
 * Every repository in this ecology is PUBLIC, and public run history and branches are readable
 * by any valid token — so the workflow's own GITHUB_TOKEN is a sufficient LAST RESORT for
 * reading anywhere. The dedicated bot tokens still come first where they exist, because they are
 * the ones that can also WRITE (re-dispatch a workflow), and because a house key that leaks costs
 * one house rather than six.
 *
 * The practical consequence, checked before asking anyone for anything: two repositories with no
 * bot token are not blind spots. They are read with the default key and merely cannot be
 * re-dispatched — a smaller gap than being unable to see them at all, and one the line states.
 */
export const TOKENS_FOR = {
  'frankbueltge/frankbueltge.de': ['GITHUB_TOKEN'],
  'frankbueltge/ulysses': ['ATELIER_BOT_TOKEN', 'GITHUB_TOKEN'],
  'frankbueltge/field-research': ['FIELD_BOT_TOKEN', 'GITHUB_TOKEN'],
  'frankbueltge/studio': ['STUDIO_BOT_TOKEN', 'GITHUB_TOKEN'],
  'frankbueltge/research-ecology': ['ECOLOGY_BOT_TOKEN', 'GITHUB_TOKEN'],
  'frankbueltge/machine-attention': ['ATTENTION_BOT_TOKEN', 'GITHUB_TOKEN'],
}

/** True when a repo is read with its own bot key, so a re-dispatch there can be expected to work. */
export function hasOwnKey(repo, env = process.env) {
  const [own] = TOKENS_FOR[repo] ?? []
  return Boolean(own && own !== 'GITHUB_TOKEN' && env[own])
}

const gh = (args, repo) => {
  const names = repo ? TOKENS_FOR[repo] ?? [] : []
  const name = names.find((n) => process.env[n])
  if (repo && !name) throw new Error(`no key for ${repo}: tried ${names.join(', ')}`)
  const token = name ? process.env[name] : undefined
  return execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: token ? { ...process.env, GH_TOKEN: token } : process.env,
  })
}

/** Every recent run in a repo, newest first — fetched ONCE and reused for latest and streak. */
export function recentRuns(repo, limit = 60) {
  return JSON.parse(gh([
    'run', 'list', '--repo', repo, '--limit', String(limit),
    '--json', 'databaseId,name,conclusion,status,createdAt,headBranch,event',
  ], repo))
}

/** The newest run of each workflow, from an already-fetched list. */
export function latestPerWorkflow(runs) {
  const newest = new Map()
  // `gh run list` returns newest first, so the first sighting of a name is its latest run.
  for (const run of runs) if (!newest.has(run.name)) newest.set(run.name, run)
  return [...newest.values()]
}

export function isAccepted(repo, workflow) {
  return ACCEPTED_RED.some((a) => a.repo === repo && a.workflow === workflow)
}

/**
 * How many of a workflow's recent runs failed in an unbroken streak back from the newest.
 * A first red and a tenth red are different animals: the first is usually a fixed cause waiting
 * for a re-dispatch, the tenth is a thing nobody is fixing. Only the second deserves a person.
 */
export function failureStreak(runs, name) {
  let streak = 0
  let sawGreen = false
  for (const run of runs) {
    if (run.name !== name) continue
    if (run.conclusion === 'failure') streak += 1
    else if (run.conclusion === 'success') { sawGreen = true; break }
    // cancelled / skipped / null: neither confirms nor breaks the streak.
  }
  // `atLeast` when no green was found in the window: the streak is bounded by how many runs were
  // fetched, not by the world. The first real sweep printed "x60" for a workflow whose window was
  // 60 runs long — a number invented by the page size, in a house whose whole claim is that it counts.
  return { streak, atLeast: !sawGreen }
}

/**
 * Namespaces an auto-land actually tries to merge. This is the whole difference between a
 * sentinel and another noise generator.
 *
 * The first real sweep found 16 stranded branches and reported all of them. Eleven were
 * `archive/*` and `protocol-v3` — deliberately kept, costing nothing, hurting nobody, and
 * precisely the "hundert Sachen" this was built to stop producing. A branch sitting quietly is
 * not a problem; a branch an auto-land re-attempts and conflicts on every night is, because it
 * turns that workflow's red light into wallpaper.
 *
 * So the rule is not "old and unmerged" but **"old, unmerged, and something is failing on it"**.
 */
const LANDED_NAMESPACES = [/^research\//, /^claude\//]

/**
 * Branches an auto-land keeps trying and failing to merge. Studio's auto-land has been red 60
 * runs running on two of them; that signal has stopped signalling.
 */
export function strandedBranches(repo, { minAgeDays = 7 } = {}) {
  // Deliberately NOT wrapped: an unreadable repository must reach the caller as an error, not
  // as an empty list. A swallowed failure here would report a repo nobody can see as a repo with
  // nothing wrong — the precise mistake this file was written after.
  //
  // `--paginate` with `--jq` emits one JSON document PER PAGE, so JSON.parse on the whole stream
  // fails at the seam the moment a repo has more than one page of branches. Found on the first
  // real sweep, where it made the hub itself read as unreachable. One object per line instead.
  const branches = gh(
    ['api', `repos/${repo}/branches`, '--paginate', '--jq', '.[] | {name: .name}'], repo,
  ).split('\n').filter(Boolean).map((line) => JSON.parse(line))
  const open = new Set(
    JSON.parse(gh(['pr', 'list', '--repo', repo, '--state', 'open', '--json', 'headRefName'], repo))
      .map((p) => p.headRefName),
  )
  const stranded = []
  for (const branch of branches) {
    if (branch.name === 'main' || open.has(branch.name)) continue
    if (!LANDED_NAMESPACES.some((re) => re.test(branch.name))) continue
    let cmp
    try {
      cmp = JSON.parse(gh(['api', `repos/${repo}/compare/main...${branch.name}`,
        '--jq', '{ahead: .ahead_by, behind: .behind_by, when: .commits[-1].commit.author.date}'], repo))
    } catch {
      continue
    }
    if (!cmp.when) continue
    const ageDays = (Date.parse(NOW) - Date.parse(cmp.when)) / 86_400_000
    if (ageDays < minAgeDays) continue
    stranded.push({
      repo, branch: branch.name,
      ahead: cmp.ahead, behind: cmp.behind, ageDays: Math.floor(ageDays),
    })
  }
  return stranded
}

// Injected rather than read from the clock, so a sweep is reproducible from its own output —
// the same reason the workflow scripts in this repo take their date from the runner and commit it.
export const NOW = process.env.SENTINEL_NOW || new Date().toISOString()

/**
 * The sweep. Returns findings split by what should happen to them, and nothing else — deciding
 * is this function's whole job, acting belongs to the workflow that calls it.
 */
export function sweep({ minStreakForPerson = 3, minAgeDays = 7 } = {}) {
  const retry = []
  const forPerson = []
  const accepted = []
  const errors = []

  for (const { repo, role } of REPOS) {
    let runs
    try {
      runs = recentRuns(repo)
    } catch (err) {
      errors.push({ repo, error: String(err.message || err).slice(0, 200) })
      continue
    }
    for (const run of latestPerWorkflow(runs)) {
      if (run.conclusion !== 'failure') continue
      if (isAccepted(repo, run.name)) {
        accepted.push({ repo, workflow: run.name })
        continue
      }
      const { streak, atLeast } = failureStreak(runs, run.name)
      const finding = { repo, role, workflow: run.name, runId: run.databaseId, streak, atLeast,
        branch: run.headBranch, since: run.createdAt }
      // One red is usually a cause already fixed upstream, waiting for someone to press the
      // button. Retry it. A streak means the retry has effectively been run already, by time.
      if (streak < minStreakForPerson) retry.push({ ...finding, canDispatch: hasOwnKey(repo) })
      else forPerson.push({ ...finding,
        why: `red ${atLeast ? 'at least ' : ''}${streak} runs running — a retry has been tried by time` })
    }
    try {
      for (const s of strandedBranches(repo, { minAgeDays })) {
        forPerson.push({ ...s, role, kind: 'stranded-branch',
          why: `no pull request, ${s.behind} commits behind main, untouched ${s.ageDays} days` })
      }
    } catch (err) {
      errors.push({ repo, error: `branches: ${String(err.message || err).slice(0, 160)}` })
    }
  }
  return { at: NOW, retry, forPerson, accepted, errors }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(sweep(), null, 2))
}
