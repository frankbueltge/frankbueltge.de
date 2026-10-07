// scripts/ecology/cycle-turn.ts — the cycle clock's mouth (rules of 2026-10-03 and 2026-10-07).
//
// The rule lives in src/lib/ecology/cycle-turn.ts, under test. This file reads the four inputs
// from committed state (cycle.json, the seed register, the sentinel's verdict on the running
// cycle, and the convening the mirrored Middle relay carries), writes cycle.json when a turn is
// due, and reads the result back through loadCycle so a state the site would refuse is never
// committed. It prints one JSON object on stdout for the workflow to branch on and one human line
// on stderr. Without a continuing question it does nothing: that regime stays turned by hand.
import fs from 'node:fs'
import path from 'node:path'
import { fallbackOn, loadRelayExtras, opensOn, standingResult } from '../../src/lib/ecology/convening'
import { planTurn, type RegisterSeed } from '../../src/lib/ecology/cycle-turn'
import { cycleVerdict } from '../../src/lib/ecology/cycle-watch'
import { loadCycle } from '../../src/lib/ecology/v3'

const root = process.cwd()
const file = path.join(root, 'src/data/ecology/cycle.json')
const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>
const register = JSON.parse(fs.readFileSync(path.join(root, 'src/data/saat/register.json'), 'utf8'))
const seeds: RegisterSeed[] = Array.isArray(register.seeds) ? register.seeds : []
const relay = loadRelayExtras(root)

const verdict = cycleVerdict()
const today = new Date().toISOString().slice(0, 10)
const turn = planTurn(raw, verdict.allPresented, seeds, today, relay.convening)

/** Why nothing turned, in one line — the convening's two dates when one is open. */
function waiting(): string {
  if (!raw.continuing) return `cycle ${raw.cycle} · no continuing question — the cycle is turned by hand`
  if (raw.phase === 'convening') {
    const conv = raw.convening as { after_cycle: number; opened: string; objected?: string | null }
    const result = standingResult(conv.after_cycle, conv.objected ?? null, relay.convening)
    return result
      ? `cycle ${raw.cycle} · convening since ${conv.opened} · result tallied ${result.talliedOn}, opens on ${opensOn(result)} unless the architect objects`
      : `cycle ${raw.cycle} · convening since ${conv.opened} · no result in the relay (${relay.status}) · fallback on ${fallbackOn(conv.opened)}`
  }
  return `cycle ${raw.cycle} · no turn due (presented: ${verdict.allPresented}; no waiting seed)`
}

if (!turn) {
  process.stdout.write(JSON.stringify({ turned: false, cycle: raw.cycle, phase: raw.phase }) + '\n')
  process.stderr.write(waiting() + '\n')
} else {
  const before = fs.readFileSync(file, 'utf8')
  fs.writeFileSync(file, JSON.stringify(turn.next, null, 2) + '\n')
  try {
    loadCycle(root)
  } catch (err) {
    fs.writeFileSync(file, before)
    throw err
  }
  process.stdout.write(
    JSON.stringify({ turned: true, kind: turn.kind, cycle: turn.next.cycle, phase: turn.next.phase, question: turn.next.question }) +
      '\n',
  )
  process.stderr.write(turn.line + '\n')
}
