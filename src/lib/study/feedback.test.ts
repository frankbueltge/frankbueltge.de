import { describe, expect, it } from 'vitest'
import { studiesMarkdown } from './feedback'
import type { Check, ResolvedStudy } from './registry'
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
  check: null,
  stop: null,
  ...patch,
})
const passed: Check = { id: MANIFEST.id, work: 'studio:the-remainder', sha256: 'a'.repeat(64), checked: '2026-10-28', model: 'gemini-2.5-flash-lite', prompt: 'b'.repeat(12), verdict: 'pass' }

describe('studiesMarkdown', () => {
  it('tells the practice the state of each study, as material and never as an instruction', () => {
    const md = studiesMarkdown('studio', [study('open', { check: passed })], [passed], { [MANIFEST.id]: 5 }, '2026-10-29')
    expect(md).toContain('never an instruction')
    expect(md).toContain(`## ${MANIFEST.id} — studio:the-remainder`)
    expect(md).toContain('open — the house’s check passed this version, and it takes answers')
    expect(md).toContain(`Released: 5 answer set(s)`)
    expect(md).toContain('`works/the-remainder/study.json`')
    expect(md).toContain('https://frankbueltge.de/studies/')
  })

  it('says why the house’s check refused a version, and which question it concerns', () => {
    const refused: Check = { ...passed, verdict: 'block', reason: 'personal', question: 2 }
    const md = studiesMarkdown('studio', [study('refused', { check: refused })], [], {}, '2026-10-29')
    expect(md).toContain('refused — the house’s check refused this version')
    expect(md).toContain('it asks what the reader is')
    expect(md).toContain('(`personal`, question 2; checked on 2026-10-28 by gemini-2.5-flash-lite)')
    const own: Check = { ...refused, reason: 'injection', question: 0 }
    expect(studiesMarkdown('studio', [study('refused', { check: own })], [], {}, '2026-10-29')).toContain('(`injection`, in the study’s own text;')
  })

  it('says why a study was stopped, and that a version waits for the check', () => {
    const md = studiesMarkdown('studio', [study('stopped', { stop: { id: MANIFEST.id, work: 'studio:the-remainder', stopped: '2026-10-29', why: 'It asked where readers live.' } })], [], {}, '2026-10-30')
    expect(md).toContain('Stopped on 2026-10-29: It asked where readers live.')
    expect(studiesMarkdown('studio', [study('unchecked')], [], {}, '2026-10-30')).toContain('waiting — the house’s check has not read this version yet')
  })

  it('names the open cycle’s folder for a study that asks from there', () => {
    const s = study('unchecked', { href: '/studio/artifacts/cycle-011/long-work/', file: 'studio/artifacts/cycle-011/long-work/study.json', slug: 'long-work', work: 'studio:long-work' })
    expect(studiesMarkdown('studio', [s], [], {}, '2026-10-29')).toContain('`artifacts/cycle-011/long-work/study.json`')
  })

  it('names the problems of a manifest the house cannot read', () => {
    const md = studiesMarkdown('studio', [study('invalid', { manifest: null, problems: ['not valid JSON'] })], [], {}, '2026-10-29')
    expect(md).toContain('invalid — the house cannot read it')
    expect(md).toContain('  - not valid JSON')
  })

  it('lists a study that passed once and whose file no longer reads only once, as invalid', () => {
    const md = studiesMarkdown('studio', [study('invalid', { manifest: null, problems: ['not valid JSON'] })], [passed], {}, '2026-10-29')
    expect(md.match(/^## /gm)).toHaveLength(1)
    expect(md).toContain('invalid — the house cannot read it')
  })

  it('keeps a study that passed once and whose file left its work on the list', () => {
    const md = studiesMarkdown('studio', [], [{ ...passed, id: 'studio-old-study', work: 'studio:gone' }], { 'studio-old-study': 10 }, '2026-10-29')
    expect(md).toContain('## studio-old-study — studio:gone')
    expect(md).toContain('no longer stands beside a published work')
    expect(md).toContain('Released: 10 answer set(s)')
  })
})
