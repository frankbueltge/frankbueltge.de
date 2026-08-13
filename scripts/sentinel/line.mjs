#!/usr/bin/env node
// scripts/sentinel/line.mjs — the sweep's whole output to a person: one line.
//
// The six watchdogs before this one each open an issue when they find something, and six streams
// of issues is the load, not the relief. So the contract here is narrow and worth stating:
//
//   · Nothing wrong        →  one line, and no issue exists.
//   · Something retried    →  one line saying so. Still no issue: a thing that fixed itself is
//                             not news, it is the system working, and it is exactly the class
//                             that consumed a person's day on 2026-08-13.
//   · Something survived   →  one line, and ONE standing issue is opened or UPDATED in place.
//     the retry               Never a second issue: the count of open issues should track the
//                             count of real problems, and today it tracked the count of nights.
//
// The line is written for someone reading a phone at midnight who does not want to open anything.

/** A repo's short name — the ecology talks about "studio", not "frankbueltge/studio". */
const short = (repo) => repo.split('/')[1]

/** Group findings by repo, preserving order, so the line reads as a list of houses not of rows. */
function byRepo(findings) {
  const groups = new Map()
  for (const f of findings) {
    const key = short(f.repo)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(f)
  }
  return groups
}

/**
 * The line. Deliberately without a health verdict — it names what is, and lets the count speak.
 * "All green" is a claim; "nothing red that a retry did not settle" is a measurement.
 */
export function composeLine(result) {
  const { retry = [], forPerson = [], accepted = [], errors = [] } = result
  const parts = []

  // A retry that could not be attempted is not a retry, and must never be reported as one. On
  // 2026-08-13 this line read "1 red workflow re-dispatched (machine-attention)" while the step
  // above it logged "could not retry: machine-attention · discovery" — the report contradicting
  // its own run, in a house whose whole claim is that it counts. `canDispatch` is false wherever
  // the repo is readable but has no key that can write.
  const pressed = retry.filter((r) => r.canDispatch !== false)
  const unpressed = retry.filter((r) => r.canDispatch === false)

  if (forPerson.length === 0 && retry.length === 0) {
    parts.push('Ecology sentinel: nothing red across six repositories.')
  } else if (forPerson.length === 0) {
    if (pressed.length > 0) {
      const names = [...byRepo(pressed).keys()].join(', ')
      parts.push(
        `Ecology sentinel: ${pressed.length} red ${pressed.length === 1 ? 'workflow' : 'workflows'} ` +
        `re-dispatched (${names}); nothing survived the retry.`,
      )
    }
    if (unpressed.length > 0) {
      const names = [...byRepo(unpressed)].map(([repo, items]) =>
        `${repo} · ${items.map((i) => i.workflow).join(', ')}`).join(' · ')
      parts.push(
        `${parts.length === 0 ? 'Ecology sentinel: ' : ''}${unpressed.length} red left standing ` +
        `for want of a key that can write: ${names}.`,
      )
    }
  } else {
    const detail = [...byRepo(forPerson)].map(([repo, items]) => {
      const what = items.map((i) =>
        i.kind === 'stranded-branch'
          ? `${i.branch} (${i.ageDays}d, ${i.behind} behind)`
          : `${i.workflow}${i.streak > 1 ? ` ×${i.atLeast ? '≥' : ''}${i.streak}` : ''}`,
      ).join(', ')
      return `${repo}: ${what}`
    }).join(' · ')
    parts.push(`Ecology sentinel: ${forPerson.length} needing a person — ${detail}.`)
    if (retry.length > 0) parts.push(`${retry.length} other red re-dispatched.`)
  }

  if (accepted.length > 0) {
    parts.push(`${accepted.length} known-red suppressed by name.`)
  }
  if (errors.length > 0) {
    // A repo the sweep could not read is not a green repo, and saying nothing would report it
    // as one. This is the failure mode the whole file exists to avoid, so it is never silent.
    parts.push(`${errors.length} unreachable: ${errors.map((e) => short(e.repo)).join(', ')}.`)
  }
  return parts.join(' ')
}

/** The body of the standing issue — only written when something survived a retry. */
export function composeIssue(result) {
  const lines = [
    '_One standing issue, edited in place. It is open only while something below is true; the ',
    'sentinel closes it the night nothing is._',
    '',
    `Swept ${result.at}.`,
    '',
    '## Survived a retry, so it is real',
    '',
  ]
  for (const [repo, items] of byRepo(result.forPerson)) {
    lines.push(`**${repo}**`)
    for (const i of items) {
      lines.push(i.kind === 'stranded-branch'
        ? `- branch \`${i.branch}\` — ${i.why}`
        : `- \`${i.workflow}\` — ${i.why} ([run](https://github.com/${i.repo}/actions/runs/${i.runId}))`)
    }
    lines.push('')
  }
  if (result.retry.length > 0) {
    lines.push('## Re-dispatched, and not your problem unless it comes back', '')
    for (const r of result.retry) lines.push(`- ${short(r.repo)} · \`${r.workflow}\``)
    lines.push('')
  }
  if (result.accepted.length > 0) {
    lines.push('## Known red, suppressed by name', '')
    for (const a of result.accepted) lines.push(`- ${short(a.repo)} · \`${a.workflow}\``)
  }
  return lines.join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = JSON.parse(await new Response(process.stdin).text())
  if (process.argv[2] === '--issue') console.log(composeIssue(input))
  else console.log(composeLine(input))
}
