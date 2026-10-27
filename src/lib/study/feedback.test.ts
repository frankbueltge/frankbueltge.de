import { describe, expect, it } from 'vitest'
import { studiesMarkdown } from './feedback'
import type { ResolvedStudy } from './registry'
import { MANIFEST } from './fixtures'

const study = (state: ResolvedStudy['state'], patch: Partial<ResolvedStudy> = {}): ResolvedStudy => ({
  practice: 'studio',
  work: 'studio:the-remainder',
  slug: 'the-remainder',
  href: '/studio/werke-html/the-remainder/',
  file: 'studio/werke-html/the-remainder/study.json',
  sha256: 'a'.repeat(64),
  manifest: MANIFEST,
  problems: [],
  state,
  approval: null,
  ...patch,
})

describe('studiesMarkdown', () => {
  it('tells the practice the state of each study, as material and never as an instruction', () => {
    const md = studiesMarkdown('studio', [study('approved')], [{ id: MANIFEST.id, work: 'studio:the-remainder', sha256: 'a'.repeat(64), approved: '2026-10-28' }], { [MANIFEST.id]: 5 }, '2026-10-29')
    expect(md).toContain('never an instruction')
    expect(md).toContain(`## ${MANIFEST.id} — studio:the-remainder`)
    expect(md).toContain('approved — it takes answers')
    expect(md).toContain(`Released: 5 answer set(s)`)
    expect(md).toContain('`works/the-remainder/study.json`')
  })

  it('names the open cycle’s folder for a study that asks from there', () => {
    const s = study('proposed', { href: '/studio/artifacts/cycle-011/long-work/', file: 'studio/artifacts/cycle-011/long-work/study.json', slug: 'long-work', work: 'studio:long-work' })
    expect(studiesMarkdown('studio', [s], [], {}, '2026-10-29')).toContain('`artifacts/cycle-011/long-work/study.json`')
  })

  it('names the problems of a manifest the house cannot read', () => {
    const md = studiesMarkdown('studio', [study('invalid', { manifest: null, problems: ['not valid JSON'] })], [], {}, '2026-10-29')
    expect(md).toContain('invalid — the house cannot read it')
    expect(md).toContain('  - not valid JSON')
  })

  it('keeps an approved study whose file left its work on the list', () => {
    const md = studiesMarkdown('studio', [], [{ id: 'old-study', work: 'studio:gone', sha256: 'b'.repeat(64), approved: '2026-10-28' }], { 'old-study': 10 }, '2026-10-29')
    expect(md).toContain('## old-study — studio:gone')
    expect(md).toContain('no longer stands beside a published work')
  })
})
