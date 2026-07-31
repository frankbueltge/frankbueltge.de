// scripts/gate/brief.ts — CLI wrapper around baueBrief(): reads the validation log of an
// integrate run and writes the letter of refusal to stdout. Called from the failure() step of
// the integrate workflows.
//
// The logic itself lives in src/lib/gate/brief.ts and is under test there — nothing happens here
// but reading arguments, reading a file, printing. When the log file is missing, `null` is passed
// deliberately: that is the case "run failed before validation", and the letter has to name it as
// such instead of demanding a correction.
//
// --lines-only prints just the extracted error lines, no letter. That is for reports that are NOT
// addressed to a practice — ecology-integrate opens an issue in Frank's own inbox and used to
// quote `tail -40`, which for astro check is the warning tally rather than the error: the same
// readability defect the practices complained about four times, only pointed at the operator.
// No letter there, because there is no practice to address and therefore nothing to attribute.
import { existsSync, readFileSync } from 'node:fs'
import { baueBrief, fehlerzeilen } from '../../src/lib/gate/brief'

function arg(name: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : ''
}

const ns = arg('ns')
const logPfad = arg('log')
const runUrl = arg('run-url')
const date = arg('date') || new Date().toISOString().slice(0, 10)
const nurZeilen = process.argv.includes('--lines-only')

if (!nurZeilen && (!ns || !runUrl)) {
  console.error('Usage: brief.ts --ns <namespace> --run-url <url> [--log <path>] [--date <YYYY-MM-DD>]')
  console.error('       brief.ts --lines-only --log <path>')
  process.exit(2)
}

const log = logPfad && existsSync(logPfad) ? readFileSync(logPfad, 'utf8') : null

if (nurZeilen) {
  // Empty output is a valid answer: the caller then reports that no error line could be
  // extracted, rather than quoting the tail of the log and calling it the error.
  process.stdout.write(log ? `${fehlerzeilen(log).join('\n')}\n` : '')
} else {
  process.stdout.write(`${baueBrief({ ns, log, runUrl, date })}\n`)
}
