import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { findStudies, readApprovals, registryOf, resolveStudies, sha256, type Approval } from './registry'
import { approvalBranch, approvalRequest, proposalsOf, withApproval } from './proposals'
import { MANIFEST } from './fixtures'

let root: string
const work = (ns: string, slug: string, manifest?: unknown, html = true) => {
  const dir = join(root, 'public', ns, 'werke-html', slug)
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

  it('stops both works that claim the same study id', () => {
    fresh()
    work('studio', 'one', MANIFEST)
    work('field', 'two', MANIFEST)
    const r = resolveStudies(findStudies(join(root, 'public'), root), [], '2026-10-27')
    expect(r.map((s) => s.state)).toEqual(['invalid', 'invalid'])
  })

  it('lists every approval with its state, and gives a manifest only to the approved', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    const found = findStudies(join(root, 'public'), root)
    const approvals = [approval(found[0]!.sha256), approval('f'.repeat(64), { id: 'gone-study', work: 'atelier:gone' })]
    const reg = registryOf(resolveStudies(found, approvals, '2026-10-27'), approvals)
    expect(reg.known.map((k) => [k.id, k.state, k.manifest !== null])).toEqual([
      ['gone-study', 'gone', false],
      [MANIFEST.id, 'approved', true],
    ])
  })
})

describe('readApprovals', () => {
  it('reads the committed approvals file, which starts empty', () => {
    expect(readApprovals(process.cwd())).toEqual([])
  })
})

describe('proposals', () => {
  it('lists what waits and what is invalid, and words the pull request that asks for approval', () => {
    fresh()
    work('studio', 'the-remainder', MANIFEST)
    work('field', 'broken', '{')
    const resolved = resolveStudies(findStudies(join(root, 'public'), root), [], '2026-10-27')
    expect(proposalsOf(resolved).map((p) => [p.work, p.state])).toEqual([
      ['field:broken', 'invalid'],
      ['studio:the-remainder', 'proposed'],
    ])
    const s = resolved.find((r) => r.state === 'proposed')!
    const { title, body } = approvalRequest(s)
    expect(title).toBe('Study approval: studio asks “What did you hear?”')
    expect(body).toContain('only the architect merges it')
    expect(body).toContain(`> ${MANIFEST.purpose}`)
    expect(body).toContain(s.sha256)
    for (const q of MANIFEST.questions) expect(body).toContain(q.prompt)
    expect(approvalBranch(MANIFEST.id, s.sha256)).toBe(`study/approve-${MANIFEST.id}-${s.sha256.slice(0, 8)}`)
    const next = withApproval({ $contract: 'study-approvals/1', approvals: [{ id: MANIFEST.id, work: s.work, sha256: 'old', approved: '2026-10-01' }] }, s, '2026-10-28')
    expect(next.approvals).toEqual([{ id: MANIFEST.id, work: s.work, sha256: s.sha256, approved: '2026-10-28' }])
  })
})
