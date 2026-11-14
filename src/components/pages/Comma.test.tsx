// Comma's server render is the honest floor of a live work with no archive: before a click, the six rows, the button
// and the empty score are real markup, never a style attribute (the CSP would drop it), never a hex (comma.css aliases
// the frame's own tokens and the one recorded live ink).
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { COMMA } from '@/config/comma-wording'
import { GROUPS } from '@/lib/comma/groups'

import Comma, { type CommaWording } from './Comma'

const wording: CommaWording = {
  listen: COMMA.island.listen,
  stop: COMMA.island.stop,
  freeze: COMMA.island.freeze,
  unfreeze: COMMA.island.unfreeze,
  freezeHint: COMMA.island.freezeHint,
  status: { ...COMMA.island.status },
  figureLabel: COMMA.island.figureLabel,
  legend: { ...COMMA.island.legend },
  feedHeading: COMMA.island.feedHeading,
  feedEmpty: COMMA.island.feedEmpty,
  feedBlockpage: COMMA.island.feedBlockpage,
  feedSuspicion: COMMA.island.feedSuspicion,
  feedEntry: COMMA.island.feedEntry,
  counters: { ...COMMA.island.counters },
}

const render = () => renderToStaticMarkup(<Comma wording={wording} id="comma-room" />)

describe('Comma, rendered on the server (nothing has sounded yet)', () => {
  it('is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('draws the six rows, the button and the idle status', () => {
    const html = render()
    for (const g of GROUPS) expect(html).toContain(g.name)
    expect(html).toContain('>Listen<')
    expect(html).toContain(COMMA.island.status.idle)
    expect(html).toContain(COMMA.island.feedEmpty)
  })

  it('carries its legend before anything sounds, with a colour key for every kind of page', () => {
    const html = render()
    expect(html).toContain(COMMA.island.legend.heading)
    expect(html).toContain(COMMA.island.legend.blockpage)
    expect(html).toContain(COMMA.island.legend.grey)
    expect(html).toContain(COMMA.island.legend.tape)
    // the day the counts are from is data: the island reads it from the committed file
    expect(html).toMatch(/The counts in use are those of \d{1,2} [A-Z][a-z]+ \d{4} \(UTC\)\./)
    expect(html.match(/cm-dot cm-k0/g)?.length).toBeGreaterThanOrEqual(2)
    expect(html.match(/cm-dot cm-kn/g)?.length).toBeGreaterThanOrEqual(6)
  })

  it('offers the freeze only while listening, and no link while nothing has sounded', () => {
    const html = render()
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Freeze the score<\/button>/)
    expect(html).not.toContain('explorer.ooni.org')
  })

  it('carries no style attribute and no colour of its own', () => {
    const html = render()
    expect(html).not.toMatch(/\sstyle=/)
    expect(html).not.toMatch(/#[0-9a-f]{3,6}\b/i)
  })
})

describe('the wording', () => {
  it('says the constants it names in words built from them, not typed digits', () => {
    expect(COMMA.honesty.rule).toContain('eight times the median')
    expect(COMMA.honesty.rule).toContain('every eight seconds')
    expect(COMMA.honesty.reading).toContain('ten minutes behind the world')
    expect(COMMA.honesty.reading).toContain('blocks of five minutes')
    expect(COMMA.honesty.reading).toContain('for half an hour')
    expect(`${COMMA.honesty.method} ${COMMA.honesty.proof} ${COMMA.honesty.rule}`).not.toMatch(/\d/)
  })

  it('credits OONI, Citizen Lab and the sound library with their licences', () => {
    expect(COMMA.credits).toContain('OONI')
    expect(COMMA.credits).toContain('Citizen Lab')
    expect(COMMA.credits.match(/CC BY-NC-SA 4\.0/g)).toHaveLength(2)
    expect(COMMA.credits).toContain('CC0')
  })
})
