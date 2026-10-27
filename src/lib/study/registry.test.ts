import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { APPROVALS_FILE, findStudies, readApprovals, registryOf, resolveStudies, sha256, type Approval } from './registry'
import { MANIFEST } from './fixtures'

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
  const approval = (sha: string, patch: Partial<Approval> = {}): Approval => ({ id: MANIFEST.id, work: 'studio:the-remainder', sha256: sha, approved: '2026-10-27', ...patch })

  it('opens a study only for the exact file the architect approved', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    const found = findStudies(join(root, 'public'), root)
    expect(resolveStudies(found, [], '2026-10-27')[0]!.state).toBe('proposed')
    expect(resolveStudies(found, [approval(found[0]!.sha256)], '2026-10-27')[0]!.state).toBe('approved')
    expect(resolveStudies(found, [approval('0'.repeat(64))], '2026-10-27')[0]!.state).toBe('changed')
    expect(resolveStudies(found, [approval(found[0]!.sha256, { work: 'studio:another' })], '2026-10-27')[0]!.state).toBe('proposed')
  })

  it('closes a study after its last day', () => {
    fresh()
    work('studio', 'the-remainder', { ...MANIFEST, closes: '2026-11-30' })
    const found = findStudies(join(root, 'public'), root)
    expect(resolveStudies(found, [approval(found[0]!.sha256)], '2026-12-01')[0]!.state).toBe('closed')
  })

  it('needs an id that begins with the practice, so no practice can take or stop another’s study', () => {
    fresh()
    work('studio', 'one', MANIFEST)
    work('field', 'two', MANIFEST)
    const r = resolveStudies(findStudies(join(root, 'public'), root), [], '2026-10-27')
    expect(r.map((s) => [s.work, s.state])).toEqual([
      ['field:two', 'invalid'],
      ['studio:one', 'proposed'],
    ])
    expect(r[0]!.problems).toEqual(['id: begin it with "field-", the practice whose work asks'])
  })

  it('stops both works of a practice that claim the same id', () => {
    fresh()
    work('studio', 'one', MANIFEST)
    work('studio', 'two', MANIFEST)
    const r = resolveStudies(findStudies(join(root, 'public'), root), [], '2026-10-27')
    expect(r.map((s) => s.state)).toEqual(['invalid', 'invalid'])
  })

  it('lists every approval with its state, and gives a manifest only to the approved', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    const found = findStudies(join(root, 'public'), root)
    const approvals = [approval(found[0]!.sha256), approval('f'.repeat(64), { id: 'atelier-gone-study', work: 'atelier:gone' })]
    const reg = registryOf(resolveStudies(found, approvals, '2026-10-27'), approvals)
    expect(reg.known.map((k) => [k.id, k.state, k.sha256.length, k.manifest !== null])).toEqual([
      ['atelier-gone-study', 'gone', 64, false],
      [MANIFEST.id, 'approved', 64, true],
    ])
  })
})

describe('readApprovals', () => {
  it('reads the committed approvals file, which starts empty', () => {
    expect(readApprovals(process.cwd())).toEqual([])
  })

  it('refuses the whole file for a malformed approval, a foreign prefix or a study approved twice', () => {
    fresh()
    mkdirSync(join(root, 'src/data/studies'), { recursive: true })
    const good: Approval = { id: MANIFEST.id, work: 'studio:the-remainder', sha256: 'a'.repeat(64), approved: '2026-10-28' }
    const write = (approvals: unknown[]) => writeFileSync(join(root, APPROVALS_FILE), JSON.stringify({ $contract: 'study-approvals/1', approvals }))
    write([good])
    expect(readApprovals(root)).toEqual([good])
    for (const bad of [
      [{ ...good, sha256: 'a'.repeat(8) }],
      [{ ...good, work: 'field:the-remainder' }],
      [{ ...good, work: 'n-1:elsewhere' }],
      [good, { ...good, work: 'studio:another' }],
    ]) {
      write(bad)
      expect(() => readApprovals(root), JSON.stringify(bad)).toThrow()
    }
  })
})
