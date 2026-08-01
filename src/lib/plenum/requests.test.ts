// The Plenum's team channel, checked against fixtures for each rule and against the REAL
// committed document — because the bug this module exists for was invisible in a fixture and
// obvious in the file: the shared reader, pointed at this channel, reported "0 open" while three
// asks had been standing since 2026-07-20.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { dedentBullet, readItem, readPlenumChannel, splitBullets } from './requests'
import { requestCards } from '@/lib/zentrale/requestsMd'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const CHANNEL = `${ROOT}src/content/plenum/REQUESTS.md`
const md = readFileSync(CHANNEL, 'utf8')

// ——— the bullet rules ——————————————————————————————————————————————————————

describe('bullets inside a container', () => {
  const body = [
    '- 2026-07-22 — **First ask.** Body of the first,',
    '  continued on a hanging indent.',
    '  - a nested bullet that belongs to the first ask',
    '',
    '- 2026-07-20 — **Second ask.** Body of the second.',
  ].join('\n')

  it('splits on top-level bullets only', () => {
    expect(splitBullets(body).length).toBe(2)
  })

  it('keeps a nested bullet inside the ask it belongs to', () => {
    expect(splitBullets(body)[0]).toContain('a nested bullet')
  })

  it('dedents the marker and the hanging indent', () => {
    expect(dedentBullet('- one\n  two\n  three')).toBe('one\ntwo\nthree')
  })

  it('reads the date and the collective’s own bolded lead as the title', () => {
    const item = readItem(splitBullets(body)[0], 'Open requests', 'open-requests', true, 20)
    expect(item.date).toBe('2026-07-22')
    expect(item.title).toBe('First ask')
    expect(item.open).toBe(true)
    expect(item.slug).toBe('open-requests')
  })

  it('keeps a second-sitting date label whole while the sort date stays ISO', () => {
    const item = readItem('- 2026-07-20-b — **Recovery notice.** Text.', 'Open requests', 'x', true, 20)
    expect(item.dateLabel).toBe('2026-07-20-b')
    expect(item.date).toBe('2026-07-20')
  })

  it('falls back to the first sentence where a bullet carries no bolded lead', () => {
    const item = readItem('- 2026-01-01 — Plain ask with no bold. More text.', 'Open requests', 'x', true, 20)
    expect(item.title).toBe('Plain ask with no bold')
  })
})

// ——— the containers ————————————————————————————————————————————————————————

describe('readPlenumChannel, on a fixture', () => {
  const fixture = [
    '# Requests',
    '',
    'Standing rule.',
    '',
    '## Open requests',
    '',
    '- 2026-07-22 — **One.** Text.',
    '',
    '- 2026-07-20 — **Two.** Text.',
    '',
    '## Answered / resolved',
    '',
    '*(none yet)*',
    '',
    '## Seeds from Frank',
    '',
    '- 2026-07-05 — **A seed.** Text.',
    '',
    '## Team note — 2026-08-01 — A note',
    '',
    '> Body.',
    '>',
    '> **Status:** note (no reply owed)',
  ].join('\n')
  const channel = readPlenumChannel(fixture)

  it('unpacks the open container into its own asks', () => {
    expect(channel.open.map((i) => i.title)).toEqual(['One', 'Two'])
  })

  it('reports an empty closed container as empty rather than as an ask', () => {
    expect(channel.closed).toEqual([])
  })

  it('lists a seeds container without unpacking it — an offer is not an ask', () => {
    expect(channel.seeds.map((s) => s.heading)).toEqual(['Seeds from Frank'])
    expect(channel.open.some((i) => i.title === 'A seed')).toBe(false)
  })

  it('reads a section with a status of its own the shared way', () => {
    expect(channel.notes.map((n) => n.status)).toEqual(['note (no reply owed)'])
    expect(channel.notes[0].open).toBe(false)
  })
})

// ——— the real document —————————————————————————————————————————————————————

describe('the committed team channel', () => {
  const channel = readPlenumChannel(md)

  it('finds the three open asks the file actually carries (2026-08-02)', () => {
    expect(channel.open.length).toBe(3)
    expect(channel.open.map((i) => i.dateLabel)).toEqual(['2026-07-22', '2026-07-20-b', '2026-07-20'])
  })

  it('reads each open ask under the collective’s own title', () => {
    expect(channel.open[0].title).toMatch(/^New concept offered/)
    expect(channel.open[1].title).toMatch(/^Recovery notice/)
    expect(channel.open[2].title).toMatch(/^Menu snapshot refresh/)
  })

  it('gives every open ask a lead and a size, and a fragment into the archive', () => {
    for (const item of channel.open) {
      expect(item.lead.length).toBeGreaterThan(0)
      expect(item.words).toBeGreaterThan(20)
      expect(item.slug).toBe('open-requests')
    }
  })

  it('does not repeat the title in the lead — the card already prints it as its heading', () => {
    for (const item of channel.open) {
      expect(item.lead.startsWith(item.title.slice(0, 24))).toBe(false)
    }
  })

  it('records that nothing has been answered on this channel yet', () => {
    expect(channel.closed).toEqual([])
  })

  it('carries the two team notes and the one seeds container', () => {
    expect(channel.notes.length).toBe(2)
    expect(channel.notes.every((n) => !n.open)).toBe(true)
    expect(channel.seeds.length).toBe(1)
  })

  // THE REGRESSION THIS MODULE EXISTS FOR. Kept as an executable statement of the defect: the
  // shared reader is not wrong, it is built for a different convention — and pointing it at this
  // document would put "nothing is open" on a page carrying three standing asks.
  it('finds asks the shared practice reader cannot see in this document', () => {
    const shared = requestCards(md)
    expect(shared.filter((c) => c.open).length).toBe(0)
    expect(channel.open.length).toBeGreaterThan(0)
  })
})
