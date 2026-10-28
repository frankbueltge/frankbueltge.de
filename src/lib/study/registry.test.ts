import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKS_FILE, findStudies, readChecks, readStops, registryOf, resolveStudies, sha256, STOPS_FILE, wordsShown, type Check, type Stop } from './registry'
import { MANIFEST } from './fixtures'
import { LIMITS } from './manifest'

let root: string
const work = (ns: string, slug: string, manifest?: unknown, html = true, parent = 'werke-html') => {
  const dir = join(root, 'public', ns, parent, slug)
  mkdirSync(dir, { recursive: true })
  if (html) writeFileSync(join(dir, 'index.html'), '<!doctype html><title>w</title>')
  if (manifest !== undefined) writeFileSync(join(dir, 'study.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest))
}
const fresh = () => {
  root = mkdtempSync(join(tmpdir(), 'studies-'))
  return root
}
afterEach(() => rmSync(root, { recursive: true, force: true }))

describe('findStudies', () => {
  it('finds a study.json beside the index.html of a work of the three practices, and nothing else', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    work('atelier', 'no-study')
    work('field', 'no-page', MANIFEST, false)
    work('n-1', 'elsewhere', MANIFEST)
    const found = findStudies(join(root, 'public'), root)
    expect(found.map((f) => f.work)).toEqual(['studio:the-remainder'])
    expect(found[0]).toMatchObject({ practice: 'studio', href: '/studio/werke-html/the-remainder/', problems: [] })
    expect(found[0]!.sha256).toBe(sha256(JSON.stringify(MANIFEST)))
  })

  it('finds a work that stands in the open cycle and in werke-html once, where it is published', () => {
    fresh()
    mkdirSync(join(root, 'src/data/ecology'), { recursive: true })
    writeFileSync(join(root, 'src/data/ecology/cycle.json'), JSON.stringify({ cycle: 11, phase: 'working' }))
    work('studio', 'long-work', MANIFEST, true, 'artifacts/cycle-011')
    expect(findStudies(join(root, 'public'), root).map((f) => f.href)).toEqual(['/studio/artifacts/cycle-011/long-work/'])
    work('studio', 'long-work', MANIFEST)
    const found = findStudies(join(root, 'public'), root)
    expect(found.map((f) => [f.work, f.href])).toEqual([['studio:long-work', '/studio/werke-html/long-work/']])
  })

  it('refuses a file larger than the limit before reading it', () => {
    fresh()
    work('studio', 'big', JSON.stringify({ ...MANIFEST, purpose: 'x' }).replace('"purpose"', `${' '.repeat(LIMITS.bytes)}"purpose"`))
    const [found] = findStudies(join(root, 'public'), root)
    expect(found!.manifest).toBeNull()
    expect(found!.problems[0]).toMatch(/^the file is \d+ bytes; at most 20480$/)
  })

  it('keeps an invalid manifest with its problems, for the practice to read', () => {
    fresh()
    work('field', 'broken', '{ not json')
    work('atelier', 'odd', { ...MANIFEST, $contract: 'study/0' })
    const found = findStudies(join(root, 'public'), root)
    expect(found.map((f) => [f.work, f.manifest, f.problems.length > 0])).toEqual([
      ['atelier:odd', null, true],
      ['field:broken', null, true],
    ])
  })
})

describe('resolveStudies and registryOf', () => {
  const check = (sha: string, patch: Partial<Check> = {}): Check => ({
    id: MANIFEST.id,
    work: 'studio:the-remainder',
    sha256: sha,
    checked: '2026-10-28',
    model: 'gemini-2.5-flash-lite',
    prompt: 'b'.repeat(12),
    verdict: 'pass',
    ...patch,
  })
  const block = (sha: string): Check => check(sha, { verdict: 'block', reason: 'personal', question: 2 })
  const stop: Stop = { id: MANIFEST.id, work: 'studio:the-remainder', stopped: '2026-10-29', why: 'It asked where readers live.' }

  it('opens a study only for the exact file the house’s check passed, and a stop outranks every verdict', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    const found = findStudies(join(root, 'public'), root)
    const sha = found[0]!.sha256
    const state = (checks: Check[], stops: Stop[] = []) => resolveStudies(found, checks, stops, '2026-10-28')[0]!.state
    expect(state([])).toBe('unchecked')
    expect(state([check(sha)])).toBe('open')
    expect(state([check('0'.repeat(64))])).toBe('unchecked')
    expect(state([check(sha, { work: 'studio:another' })])).toBe('unchecked')
    expect(state([block(sha)])).toBe('refused')
    expect(state([check('0'.repeat(64)), block(sha)])).toBe('refused')
    expect(state([check(sha)], [stop])).toBe('stopped')
    expect(state([], [stop])).toBe('stopped')
  })

  it('keeps a stop when the practice renames its study, because the stop names the work too', () => {
    fresh()
    work('studio', 'the-remainder', { ...MANIFEST, id: 'studio-a-new-name' })
    const found = findStudies(join(root, 'public'), root)
    const passed = check(found[0]!.sha256, { id: 'studio-a-new-name' })
    expect(resolveStudies(found, [passed], [stop], '2026-10-28')[0]!.state).toBe('stopped')
    expect(resolveStudies(found, [passed], [{ ...stop, work: 'studio:another' }], '2026-10-28')[0]!.state).toBe('open')
  })

  it('closes a study after its last day, unless the check refused it', () => {
    fresh()
    work('studio', 'the-remainder', { ...MANIFEST, closes: '2026-11-30' })
    const found = findStudies(join(root, 'public'), root)
    const sha = found[0]!.sha256
    expect(resolveStudies(found, [check(sha)], [], '2026-12-01')[0]!.state).toBe('closed')
    expect(resolveStudies(found, [], [], '2026-12-01')[0]!.state).toBe('closed')
    expect(resolveStudies(found, [block(sha)], [], '2026-12-01')[0]!.state).toBe('refused')
  })

  it('needs an id that begins with the practice, so no practice can take or stop another’s study', () => {
    fresh()
    work('studio', 'one', MANIFEST)
    work('field', 'two', MANIFEST)
    const r = resolveStudies(findStudies(join(root, 'public'), root), [], [], '2026-10-28')
    expect(r.map((s) => [s.work, s.state])).toEqual([
      ['field:two', 'invalid'],
      ['studio:one', 'unchecked'],
    ])
    expect(r[0]!.problems).toEqual(['id: begin it with "field-", the practice whose work asks'])
  })

  it('stops both works of a practice that claim the same id', () => {
    fresh()
    work('studio', 'one', MANIFEST)
    work('studio', 'two', MANIFEST)
    const r = resolveStudies(findStudies(join(root, 'public'), root), [], [], '2026-10-28')
    expect(r.map((s) => s.state)).toEqual(['invalid', 'invalid'])
  })

  it('lists every readable study with its state, gives the words only to a study whose file passed, and keeps one that passed once after its work has gone', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    work('field', 'waiting', { ...MANIFEST, id: 'field-waiting' })
    work('field', 'broken', '{ not json')
    const found = findStudies(join(root, 'public'), root)
    const sha = found.find((f) => f.work === 'studio:the-remainder')!.sha256
    const checks = [check(sha), block('e'.repeat(64)), check('f'.repeat(64), { id: 'atelier-gone-study', work: 'atelier:gone' })]
    const reg = registryOf(resolveStudies(found, checks, [], '2026-10-28'), checks)
    expect(reg.known.map((k) => [k.id, k.state, k.sha256.length, k.manifest !== null])).toEqual([
      ['atelier-gone-study', 'gone', 64, false],
      ['field-waiting', 'unchecked', 64, false],
      [MANIFEST.id, 'open', 64, true],
    ])
  })

  it('repeats a study’s words only while the file that passed is open or closed, never once it is refused or stopped', () => {
    fresh()
    work('studio', 'the-remainder', { ...MANIFEST, closes: '2026-11-30' })
    const found = findStudies(join(root, 'public'), root)
    const sha = found[0]!.sha256
    const one = (checks: Check[], stops: Stop[], day: string) => resolveStudies(found, checks, stops, day)[0]!
    const cases: [Check[], Stop[], string, boolean][] = [
      [[check(sha)], [], '2026-10-28', true],
      [[check(sha)], [], '2026-12-01', true],
      [[], [], '2026-12-01', false],
      [[], [], '2026-10-28', false],
      [[block(sha)], [], '2026-10-28', false],
      [[check(sha)], [stop], '2026-10-28', false],
    ]
    for (const [checks, stops, day, shown] of cases) {
      const s = one(checks, stops, day)
      expect(wordsShown(s), `${s.state} on ${day}`).toBe(shown)
      expect(registryOf([s], checks).known[0]!.manifest !== null, `${s.state} on ${day}`).toBe(shown)
    }
  })
})

describe('readChecks and readStops', () => {
  // Never that they are empty: the check commits verdicts to main, and every deploy runs these tests.
  it('reads the committed files', () => {
    expect(Array.isArray(readChecks(process.cwd()))).toBe(true)
    expect(Array.isArray(readStops(process.cwd()))).toBe(true)
  })

  it('refuses the whole checks file for a malformed check, a foreign prefix or a file checked twice', () => {
    fresh()
    mkdirSync(join(root, 'src/data/studies'), { recursive: true })
    const good: Check = { id: MANIFEST.id, work: 'studio:the-remainder', sha256: 'a'.repeat(64), checked: '2026-10-28', model: 'gemini-2.5-flash-lite', prompt: 'b'.repeat(12), verdict: 'pass' }
    const refused: Check = { ...good, sha256: 'c'.repeat(64), verdict: 'block', reason: 'harm', question: 3 }
    const write = (checks: unknown[]) => writeFileSync(join(root, CHECKS_FILE), JSON.stringify({ $contract: 'study-checks/1', checks }))
    write([good, refused])
    expect(readChecks(root)).toEqual([good, refused])
    for (const bad of [
      [{ ...good, sha256: 'a'.repeat(8) }],
      [{ ...good, work: 'field:the-remainder' }],
      [{ ...good, work: 'n-1:elsewhere' }],
      [{ ...good, prompt: 'not-a-digest' }],
      [{ ...good, reason: 'harm' }],
      [{ ...refused, reason: 'unknown' }],
      [{ ...refused, question: -1 }],
      [{ ...good, verdict: 'maybe' }],
      [good, { ...good, checked: '2026-10-29' }],
    ]) {
      write(bad)
      expect(() => readChecks(root), JSON.stringify(bad)).toThrow()
    }
  })

  it('refuses the whole stops file for a malformed stop or a study stopped twice', () => {
    fresh()
    mkdirSync(join(root, 'src/data/studies'), { recursive: true })
    const good: Stop = { id: MANIFEST.id, work: 'studio:the-remainder', stopped: '2026-10-29', why: 'It asked where readers live.' }
    const write = (stopped: unknown[]) => writeFileSync(join(root, STOPS_FILE), JSON.stringify({ $contract: 'study-stops/1', stopped }))
    write([good])
    expect(readStops(root)).toEqual([good])
    for (const bad of [[{ ...good, why: '  ' }], [{ ...good, id: 'other-study' }], [{ ...good, work: 'field:the-remainder' }], [{ ...good, work: undefined }], [{ ...good, stopped: 'tomorrow' }], [good, good]]) {
      write(bad)
      expect(() => readStops(root), JSON.stringify(bad)).toThrow()
    }
  })
})
