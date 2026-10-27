import { describe, expect, it } from 'vitest'
import { approvalBranch, approvalRequest, fenced, proposalsOf, studyText, withApproval } from './proposals'
import type { ResolvedStudy } from './registry'
import type { StudyManifest } from './manifest'
import { MANIFEST } from './fixtures'

const SHA = 'c0ffee'.padEnd(64, '0')
const COMMIT = 'abc1234'.padEnd(40, 'f')
const study = (patch: Partial<ResolvedStudy> = {}, manifest: StudyManifest | null = MANIFEST): ResolvedStudy => ({
  practice: 'studio',
  work: 'studio:the-remainder',
  slug: 'the-remainder',
  href: '/studio/werke-html/the-remainder/',
  file: 'studio/werke-html/the-remainder/study.json',
  sha256: SHA,
  manifest,
  problems: [],
  state: 'proposed',
  approval: null,
  ...patch,
})

/** What GitHub would render as markdown: the body with every fenced code block taken out. */
const outsideCode = (body: string): string => body.replace(/^(`{3,})[^\n]*\n[\s\S]*?\n\1$/gm, '')

describe('proposalsOf', () => {
  it('lists what waits and what is invalid, by work', () => {
    const list = proposalsOf([study(), study({ work: 'field:broken', practice: 'field', state: 'invalid', problems: ['not valid JSON'] }, null), study({ state: 'approved' })])
    expect(list.map((p) => [p.work, p.state])).toEqual([
      ['field:broken', 'invalid'],
      ['studio:the-remainder', 'proposed'],
    ])
  })
})

describe('approvalBranch and withApproval', () => {
  it('names the full hash, so a request can never be moved to another file', () => {
    expect(approvalBranch(MANIFEST.id, SHA)).toBe(`study/approve-${MANIFEST.id}-${SHA}`)
  })

  it('replaces an earlier approval of the same study, for this work or another', () => {
    const next = withApproval(
      {
        $contract: 'study-approvals/1',
        approvals: [
          { id: MANIFEST.id, work: 'studio:older-work', sha256: 'b'.repeat(64), approved: '2026-10-01' },
          { id: 'atelier-other', work: 'atelier:other', sha256: 'd'.repeat(64), approved: '2026-10-02' },
        ],
      },
      study(),
      '2026-10-28',
    )
    expect(next.approvals).toEqual([
      { id: 'atelier-other', work: 'atelier:other', sha256: 'd'.repeat(64), approved: '2026-10-02' },
      { id: MANIFEST.id, work: 'studio:the-remainder', sha256: SHA, approved: '2026-10-28' },
    ])
  })
})

describe('approvalRequest', () => {
  it('shows the architect what the reader is shown and asked, and pins the file', () => {
    const { title, body } = approvalRequest(study(), COMMIT)
    expect(title).toBe(`Study approval: ${MANIFEST.id}`)
    expect(approvalRequest(study({ state: 'changed' }), COMMIT).title).toBe(`Study approval: ${MANIFEST.id} (changed)`)
    expect(body).toContain('only the architect merges it')
    expect(body).toContain(`/blob/${COMMIT}/public/studio/werke-html/the-remainder/study.json`)
    expect(body).toContain(SHA)
    expect(body).toContain("What merging does not check: the work's own code.")
    const text = studyText(MANIFEST)
    for (const q of MANIFEST.questions) expect(text.replace(/\s+/g, ' ')).toContain(q.prompt)
    expect(text.replace(/\s+/g, ' ')).toContain(MANIFEST.purpose)
    expect(body).toContain(fenced(text, 'text'))
    expect(body).toContain(fenced(JSON.stringify(MANIFEST, null, 2), 'json'))
    expect(approvalRequest(study(), 'not-a-commit').body).toContain('/blob/main/public/')
  })

  it('keeps every word a practice wrote inside a code block, where nothing renders, links or mentions', () => {
    const sly: StudyManifest = {
      ...MANIFEST,
      title: 'Closes #12 for @frankbueltge',
      purpose: 'We ask <!-- and hide --> nothing ``` else **bold** [link](https://example.com) fixes #3',
      questions: [
        { id: 'a', kind: 'choice', prompt: 'One? ````` four', options: ['@someone', '#1'] },
        { id: 'b', kind: 'text', prompt: '<details><summary>x</summary>' },
      ],
    }
    const { title, body } = approvalRequest(study({}, sly), COMMIT)
    expect(title).toBe(`Study approval: ${MANIFEST.id}`)
    const rendered = outsideCode(body)
    for (const needle of ['#12', '@frankbueltge', '<!--', '**bold**', 'fixes #3', '@someone', '<summary>x', '`````']) {
      expect(body, needle).toContain(needle)
      expect(rendered, needle).not.toContain(needle)
    }
    // the fences are longer than any run of backticks the practice wrote
    expect(body).toContain('``````text\n')
  })

  it('wraps the text so a long purpose reads without scrolling', () => {
    const long: StudyManifest = { ...MANIFEST, purpose: 'word '.repeat(79).trim() }
    for (const line of studyText(long).split('\n')) expect(line.length, line).toBeLessThanOrEqual(92)
  })
})
