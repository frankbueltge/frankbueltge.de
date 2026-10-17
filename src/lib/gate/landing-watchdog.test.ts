import { execFileSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

/** Two mechanisms report a night that did not land, and they read the same practices from two
 *  hand-written lists.
 *
 *  The morning digest says "keine Session gelandet" when a practice committed nothing. The
 *  landing watchdog says the opposite thing — a session worked, pushed a branch, and never
 *  reached `main` — which the digest cannot see at all, because from `main` a stranded session
 *  and a session that never ran look identical.
 *
 *  On 2026-09-11 the digest's list was extended to arch, n-1 and error-as-method. The
 *  watchdog's was not, and stayed on the three practices of 2026-07-16. The cost came due on
 *  2026-09-18: n-1's night 29 ran, pushed `claude/fervent-hamilton-96wl27` three commits ahead
 *  of `main`, and opened a pull request saying in as many words that its own environment could
 *  not push to `main` and that some later session would have to merge it. Nothing was watching
 *  n-1, so nothing called — the practice's record simply sat outside its own repository.
 *
 *  So the lists are bound together here rather than left to be remembered twice: a practice the
 *  digest watches is one the watchdog must watch too.
 */

const WORKFLOWS = fileURLToPath(new URL('../../../.github/workflows', import.meta.url))
const read = (f: string) => readFileSync(`${WORKFLOWS}/${f}`, 'utf8')

/** Both workflows loop over their practices in a `for REPO in … ; do` line. */
function repoLoopList(text: string, file: string): string[] {
  const line = text.match(/^\s*for REPO in ([^;]+);/m)
  expect(line, `${file}: no "for REPO in …" loop found`).not.toBeNull()
  return line![1].trim().split(/\s+/)
}

describe('the two watchers read the same practices', () => {
  it('the landing watchdog watches every practice the morning digest watches', () => {
    const digest = repoLoopList(read('morning-digest.yml'), 'morning-digest.yml')
    const watchdog = repoLoopList(read('landing-watchdog.yml'), 'landing-watchdog.yml')

    // Guard the guard: if either list stops parsing, the check below passes on empty sets.
    expect(digest.length).toBeGreaterThan(3)
    expect(watchdog.length).toBeGreaterThan(3)

    const unwatched = digest.filter((r) => !watchdog.includes(r))
    expect(
      unwatched,
      `practices the digest watches but the landing watchdog does not: ${unwatched.join(', ')}`,
    ).toEqual([])
  })

  it('the watchdog matches the branch names the practices actually push', () => {
    // Each practice names its session branches its own way, and a branch the pattern misses is
    // invisible to the watchdog even once its repository is in the list. n-1 and the plenum push
    // `claude/*` (the cloud outcome branch); error-as-method pushes `night/<date>`; the Field
    // pushes `research/session-*`; the Atelier pushes `ulysses/*`.
    const pattern = read('landing-watchdog.yml').match(/refs\/heads\/\(([^)]+)\)/)
    expect(pattern, 'landing-watchdog.yml: no refs/heads/(…) branch pattern').not.toBeNull()
    const alternatives = pattern![1].split('|')
    for (const prefix of ['research/session-', 'ulysses/', 'claude/', 'night/']) {
      expect(alternatives, `branch prefix "${prefix}" is not matched`).toContain(prefix)
    }
  })
})

/** The digest reads a practice's night from its default branch. A session whose environment
 *  cannot push to `main` publishes to a branch and opens a pull request instead — and from
 *  `main` that record is invisible, so the digest prints the one line it must never print
 *  wrongly: "keine Session gelandet", which is what a night that never ran looks like.
 *
 *  n-1 has published this way every night since night 22. On 2026-09-18 the digest reported it
 *  as an empty night while night 29's record sat complete in pull request #4, and the landing
 *  watchdog — the other half, added the same day — called the branch stranded at the same hour.
 *  Two watchers, opposite verdicts, and only one of them true.
 *
 *  So the digest asks the open pull requests before it calls a night empty, with the same
 *  session markers it reads commits by.
 */
describe('the digest can see a session that landed in a pull request', () => {
  const digest = read('morning-digest.yml')

  it('asks the open pull requests before printing "keine Session gelandet"', () => {
    // The emitting line, not any mention of the words — the comments above the loop quote
    // them while explaining why they must not be printed wrongly.
    const asks = digest.indexOf('pulls?state=open')
    const prints = digest.indexOf('BODY+="- **$REPO**: keine Session gelandet"')
    expect(asks, 'morning-digest.yml: no open-pull-request query').toBeGreaterThan(-1)
    expect(prints, 'morning-digest.yml: the empty-night line is gone').toBeGreaterThan(-1)
    expect(
      asks,
      'the empty-night line is printed before the open pull requests are asked',
    ).toBeLessThan(prints)
  })

  it('reads commits and pull requests by one shared list of session markers', () => {
    // Two hand-written marker lists would drift the way the two repo lists above did, and the
    // half that drifts goes silent rather than red.
    const marker = digest.match(/^\s*MARKER='([^']+)'/m)
    expect(marker, 'morning-digest.yml: no MARKER=… definition').not.toBeNull()
    const uses = digest.match(/test\(\\"\$MARKER\\"\)/g) ?? []
    expect(uses.length, 'MARKER is not used for both commits and pull requests').toBe(2)
  })
})

/** The Middle Scribe keeps the ecology's editorial ledger and runs on its own nightly routine,
 *  and neither watcher above has ever read `research-ecology`. Between 2026-09-16 and
 *  2026-09-19 it landed nothing at all — no commit, no branch, no pull request, and no
 *  "Scribe … — blocked" issue of the kind it opens when it knows it is stuck. Four nights
 *  passed and nothing said a word, because nothing was looking.
 */
describe('the ecology ledger is watched too', () => {
  it('both watchers read research-ecology', () => {
    const digest = repoLoopList(read('morning-digest.yml'), 'morning-digest.yml')
    const watchdog = repoLoopList(read('landing-watchdog.yml'), 'landing-watchdog.yml')
    expect(digest, 'the morning digest does not watch research-ecology').toContain(
      'research-ecology',
    )
    expect(watchdog, 'the landing watchdog does not watch research-ecology').toContain(
      'research-ecology',
    )
  })
})

/** The cleanup pass closes the issue of a branch that has landed or been deleted. It could not
 *  close one for a deleted branch: `gh api` writes the BODY of an error to stdout, so a compare
 *  against a branch that no longer exists came back as the JSON `{"message":"Not Found",…}` beside
 *  a non-zero exit, `$(gh api … || echo gone)` held that JSON followed by "gone", and neither
 *  `= "gone"` nor `= "0"` matched. Issues #666, #717, #999 and #1018 stood open for up to two
 *  months with their branches long deleted (found 2026-10-17).
 *
 *  The function is taken out of the workflow text and run against stand-ins for `git` and `gh`
 *  that answer the way GitHub does, because the bug lived in what the two commands print and
 *  return, not in anything a text match on the YAML can see.
 */
describe('the watchdog reads a deleted branch as gone', () => {
  const text = read('landing-watchdog.yml')
  const body = text.match(/^ {10}ahead_of_main \(\) \{\n([\s\S]*?)\n {10}\}\n/m)?.[0]
  const dir = mkdtempSync(join(tmpdir(), 'watchdog-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  const bin = join(dir, 'bin')
  mkdirSync(bin)
  // `git ls-remote --exit-code` answers 0 (the ref exists), 2 (no such ref) or 128 (could not ask)
  writeFileSync(join(bin, 'git'), '#!/bin/sh\nexit "${FAKE_LS_REMOTE_EXIT:-0}"\n')
  // `gh api …/compare/main...<branch>`: the number on success; on a missing branch the error body
  // goes to STDOUT and the status is non-zero, as the real command does
  writeFileSync(
    join(bin, 'gh'),
    '#!/bin/sh\nif [ "${FAKE_GH:-ok}" = notfound ]; then\n' +
      '  printf \'{\\n  "message": "Not Found",\\n  "status": "404"\\n}\\n\'\n  echo "gh: Not Found (HTTP 404)" >&2\n  exit 1\nfi\n' +
      'echo "${FAKE_AHEAD:-3}"\n',
  )
  chmodSync(join(bin, 'git'), 0o755)
  chmodSync(join(bin, 'gh'), 0o755)
  if (body) writeFileSync(join(dir, 'fn.sh'), body.replace(/^ {10}/gm, ''))

  const ask = (env: Record<string, string>) =>
    execFileSync('bash', ['-c', 'set -euo pipefail; . "$FN"; ahead_of_main studio research/session-x'], {
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FN: join(dir, 'fn.sh'), ...env },
      encoding: 'utf8',
    }).trim()

  it('has the helper both passes use', () => {
    expect(body, 'landing-watchdog.yml: no ahead_of_main () helper').toBeTruthy()
    const uses = text.match(/\$\(ahead_of_main "\$REPO" "\$BR"\)/g) ?? []
    expect(uses.length, 'the stranded pass and the cleanup pass must both ask through the helper').toBe(2)
    // the comment above the helper quotes the old pattern, so only executable lines are read
    const code = text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
    expect(code).not.toContain('|| echo gone')
  })

  it('says "gone" when the remote has no such branch, whatever gh prints', () => {
    expect(ask({ FAKE_LS_REMOTE_EXIT: '2', FAKE_GH: 'notfound' })).toBe('gone')
  })

  it('says how far ahead the branch is when it exists, 0 included', () => {
    expect(ask({ FAKE_LS_REMOTE_EXIT: '0', FAKE_GH: 'ok', FAKE_AHEAD: '3' })).toBe('3')
    expect(ask({ FAKE_LS_REMOTE_EXIT: '0', FAKE_GH: 'ok', FAKE_AHEAD: '0' })).toBe('0')
  })

  it('says "unknown", never the error body, when GitHub cannot be asked', () => {
    // an existing branch whose compare fails: the JSON on stdout must not leak into the answer
    expect(ask({ FAKE_LS_REMOTE_EXIT: '0', FAKE_GH: 'notfound' })).toBe('unknown')
    // the remote itself unreachable: 128 is not 2, and only 2 may close an issue
    expect(ask({ FAKE_LS_REMOTE_EXIT: '128' })).toBe('unknown')
  })

  it('closes on "gone" or "0" and on nothing else', () => {
    const cleanup = text.slice(text.indexOf('# Aufräumen'))
    expect(cleanup).toMatch(/gone\) WHY="ist gelöscht"/)
    expect(cleanup).toMatch(/0\) WHY="ist gelandet/)
    expect(cleanup).toMatch(/\*\) continue/)
  })
})
