// scripts/ecology/cycle-watch.ts — prints the cycle verdict for the nightly watcher.
//
// All the thinking is in src/lib/ecology/cycle-watch.ts, under test. This file is the mouth:
// it prints one JSON object for the workflow to branch on and, on stderr, the same finding in
// the words a human reads. It writes nothing and changes nothing — least of all cycle.json,
// which stays hand-turned by the architect or a site session (v3 decision, 2026-08-30).

import { cycleVerdict } from '../../src/lib/ecology/cycle-watch'

const v = cycleVerdict()
process.stdout.write(JSON.stringify(v, null, 2) + '\n')

if (v.lines.length === 0) {
  process.stderr.write(`cycle ${v.cycle} · phase ${v.phase} · nothing due\n`)
} else {
  for (const line of v.lines) process.stderr.write(line + '\n')
}
