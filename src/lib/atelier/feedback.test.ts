import { describe, expect, it } from 'vitest'
import { rejectionFeedback } from './feedback'

describe('rejectionFeedback', () => {
  it('returns null when nothing was rejected', () => {
    expect(rejectionFeedback({ accepted: [], rejected: [] }, 'field', '2026-07-02')).toBeNull()
  })
  it('renders one line per rejected work with slug and reason', () => {
    const md = rejectionFeedback(
      { accepted: [], rejected: [{ slug: 'a-work', reason: 'external resource (fetch/import()): https://x' }] },
      'field', '2026-07-02',
    )
    expect(md).toContain('# Integration feedback 2026-07-02')
    expect(md).toContain('`works/a-work`')
    expect(md).toContain('external resource')
    expect(md).toContain('NOT on the site')
  })
})
