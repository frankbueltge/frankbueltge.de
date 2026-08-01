import { describe, expect, it } from 'vitest'
import { buildGateCandidate, isPublicationCandidate, parseScoreFrontmatter } from './gate'
import { buildPostLane } from './post'

const SCORE = `---
project_id: 2026-07-23-negative-parallax
title: "Negative parallax — the impossible distance"
status: ACTIVE
disposition: PUBLICATION_CANDIDATE
---
body text`

describe('parseScoreFrontmatter', () => {
  it('reads disposition and unquotes the title', () => {
    const fm = parseScoreFrontmatter(SCORE)
    expect(fm.disposition).toBe('PUBLICATION_CANDIDATE')
    expect(fm.title).toBe('Negative parallax — the impossible distance')
  })

  it('yields nulls without frontmatter — a gap, never a guess', () => {
    expect(parseScoreFrontmatter('no frontmatter here')).toEqual({ disposition: null, title: null })
  })
})

describe('isPublicationCandidate', () => {
  it('is true only without PUBLICATION.json and with the candidate disposition', () => {
    expect(isPublicationCandidate(['SCORE.md'], SCORE)).toBe(true)
    expect(isPublicationCandidate(['SCORE.md', 'PUBLICATION.json'], SCORE)).toBe(false)
    expect(isPublicationCandidate(['SCORE.md'], SCORE.replace('PUBLICATION_CANDIDATE', 'ACTIVE'))).toBe(false)
    expect(isPublicationCandidate(['SCORE.md'], null)).toBe(false)
  })
})

describe('buildGateCandidate', () => {
  it('computes hours since the last SCORE change and links the project', () => {
    const c = buildGateCandidate('ulysses', 'p1', SCORE, '2026-08-01T00:00:00Z', '2026-08-04T12:00:00Z')
    expect(c.hoursSinceChange).toBe(84)
    expect(c.projectUrl).toContain('/ulysses/tree/main/projects/p1')
    expect(c.title).toContain('Negative parallax')
  })

  it('keeps the clock honest when no change date is derivable', () => {
    const c = buildGateCandidate('ulysses', 'p1', SCORE, null, '2026-08-04T12:00:00Z')
    expect(c.hoursSinceChange).toBeNull()
  })
})

describe('buildPostLane', () => {
  const ledger = [
    { id: 'a', practice: 'studio', piece: 'NO PART packet', receiver: 'MacArthur Justice Center', receiver_channel: 'institutional public channel', status: 'prepared', as_of: '2026-07-31', record_url: 'https://example.test/a', note: 'Unsent until Frank forwards it.' },
    { id: 'b', practice: 'ecology', piece: 'DARC application', receiver: 'DARC Aarhus', receiver_channel: 'pvelasco@cc.au.dk (per the open call)', status: 'prepared', as_of: '2026-08-01', record_url: 'https://example.test/b' },
    { id: 'c', practice: 'field', piece: 'calibration certificate', receiver: 'ENAI', receiver_channel: 'academicintegrity.eu', status: 'in-preparation', as_of: '2026-07-31', record_url: 'https://example.test/c' },
    { id: 'd', practice: 'studio', piece: 'already out', receiver: 'x', receiver_channel: 'y', status: 'sent', as_of: '2026-07-30', record_url: 'https://example.test/d' },
  ]

  it('drops sent items, counts open days only for prepared letters, longest-lying first', () => {
    const lane = buildPostLane(ledger, '2026-08-04T12:00:00Z')
    expect(lane.map((i) => i.id)).toEqual(['a', 'b', 'c'])
    expect(lane[0].daysOpen).toBe(4) // lies open since 31.07. — a fact, not a countdown
    expect(lane[1].daysOpen).toBe(3)
    expect(lane[2].daysOpen).toBeNull() // in-preparation: still with the practice
  })

  it('extracts a mailto address when the channel carries one', () => {
    const lane = buildPostLane(ledger, '2026-08-04T12:00:00Z')
    expect(lane.find((i) => i.id === 'b')?.email).toBe('pvelasco@cc.au.dk')
    expect(lane.find((i) => i.id === 'a')?.email).toBeNull()
  })
})
