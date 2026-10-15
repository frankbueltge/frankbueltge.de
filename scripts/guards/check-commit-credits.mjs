#!/usr/bin/env node
// Runs findAiCredits over the commits an event introduces. The judgement lives in
// ai-credits.mjs and is tested without git; this file only decides WHICH commits to read,
// because that is the part that depends on how CI checked the tree out.
//
//   node scripts/guards/check-commit-credits.mjs <base>..<head>
//   node scripts/guards/check-commit-credits.mjs            # HEAD only
//
// A range that cannot be resolved (a first push, a force-push, a shallow clone) falls back to
// HEAD rather than passing silently: checking one commit is a weaker guard than checking ten,
// but a guard that returns green because it could not look is not a guard at all.
import { execFileSync } from 'node:child_process'
import { findAiCredits, report } from './ai-credits.mjs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()

const shasIn = (range) => {
  if (!range) return null
  // A zero sha is how a push event spells "no previous commit".
  if (/^0{40}\.\./.test(range)) return null
  try {
    const out = git('log', '--no-merges', '--format=%H', range)
    return out ? out.split('\n') : []
  } catch {
    return null
  }
}

const range = process.argv[2]
let shas = shasIn(range)
if (shas === null) {
  if (range) console.log(`note: cannot resolve ${range} — falling back to HEAD.`)
  shas = [git('rev-parse', 'HEAD')]
}

const commits = shas.map((sha) => ({
  sha,
  subject: git('log', '-1', '--format=%s', sha),
  findings: findAiCredits(git('log', '-1', '--format=%B', sha)),
}))

console.log(`checked ${commits.length} commit(s)${range ? ` in ${range}` : ''}.`)
const text = report(commits)
console.log(text)
if (!text.startsWith('clean:')) process.exit(1)
