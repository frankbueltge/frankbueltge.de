// The three scores of the ill-tempered week, rendered on the server: the floor every visitor gets before a script
// runs (duty 2 of .claude/rules/dataviz-figures.md). Deterministic markup, no style attribute and no hex (duty 3), every
// lane, glissando and bar drawn, every link in the markup, and no control that needs JavaScript.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { readAlbums } from '@/lib/ill-tempered-week/albums'
import { overlookedScore } from '@/lib/ill-tempered-week/score-overlooked'
import { turnScore } from '@/lib/ill-tempered-week/score-turn'
import { unisonScore } from '@/lib/ill-tempered-week/score-unison'

import OverlookedScore from './OverlookedScore'
import TurnScore from './TurnScore'
import UnisonScore from './UnisonScore'

const albums = readAlbums()
const complete = albums.filter((a) => a.complete).at(-1)
const newest = albums.at(-1)!

/** The drawing alone, without the legend's swatches and the staves under it. */
const drawing = (html: string): string => {
  const at = html.indexOf('<svg class="itw-svg"')
  return html.slice(at, html.indexOf('</svg>', at))
}
/** Text as React writes it into markup. */
const escaped = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

const clean = (html: string) => {
  // \x22 rather than a literal quote, so this line does not itself trip drift-check rule 3
  expect(html).not.toMatch(/ style=\x22/)
  expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  // controls that need JavaScript appear only once the island runs
  expect(html).not.toContain('<button')
}

describe('Overlooked, on the server', () => {
  const o = newest.pieces.overlooked
  const links = { days: o.days.map((_, i) => ({ text: `https://example.org/day/${i}`, attended: o.days[i]!.attended.map((__, k) => `https://example.org/day/${i}/${k}`) })) }
  const render = () => renderToStaticMarkup(<OverlookedScore record={o} links={links} audioId="a" id="s" label="The score" hint="Press play" />)

  it('is deterministic and clean', () => {
    expect(render()).toBe(render())
    clean(render())
  })

  it('labels a lane for every voice and draws every event', () => {
    const html = drawing(render())
    const s = overlookedScore(o)
    for (const d of s.days) expect(html).toContain(d.instrument)
    expect(html.match(/class="itw-bell"/g) ?? []).toHaveLength(s.days.length)
    expect(html.match(/class="itw-motif /g)?.length ?? 0).toBe(s.events.filter((e) => e.kind === 'motif').length)
    expect(html).toContain('itw-tutti')
    expect(html).toContain('itw-cut')
  })

  it('puts every headline and every link in the markup, and every motif on a staff', () => {
    const html = render()
    for (const [i, d] of o.days.entries()) {
      expect(html).toContain(`https://example.org/day/${i}`)
      expect(html).toContain(escaped(d.text))
    }
    expect(html.match(/class="itw-staff"/g) ?? []).toHaveLength(o.days.length)
    expect(html).toContain('Press play')
  })
})

describe.runIf(complete?.pieces.unison)('Unison, on the server', () => {
  const a = complete!
  const u = a.pieces.unison!
  const links = { days: u.days.map((d, i) => ({ said: d.said ? `https://example.org/said/${i}` : null, overlooked: `https://example.org/bass/${i}` })) }
  const render = () => renderToStaticMarkup(<UnisonScore record={u} week={a.week} links={links} audioId="a" id="s" label="The score" hint="Press play" />)

  it('is deterministic and clean', () => {
    expect(render()).toBe(render())
    clean(render())
  })

  it('draws one glissando per war signal, the chord’s lines and every day', () => {
    const html = render()
    const s = unisonScore(u, a.week)
    expect(drawing(html).match(/class="itw-gl /g) ?? []).toHaveLength(s.glides.length)
    expect(drawing(html)).toContain('itw-chord-a')
    for (const [i] of u.days.entries()) expect(html).toContain(`https://example.org/bass/${i}`)
  })
})

describe.runIf(complete?.pieces.turn)('Turn, on the server', () => {
  const a = complete!
  const r = a.pieces.turn!
  const render = () => renderToStaticMarkup(<TurnScore record={r} week={a.week} saidLink="https://example.org/turn" audioId="a" id="s" label="The score" hint="Press play" />)

  it('is deterministic and clean', () => {
    expect(render()).toBe(render())
    clean(render())
  })

  it('draws a cell for every sounding family of every bar, and a measure for every day', () => {
    const html = render()
    const s = turnScore(r, a.week)
    const cells = s.bars.reduce((n, b) => n + (b.kind === 'said' ? 0 : b.beats.length), 0)
    expect(drawing(html).match(/class="itw-cell( itw-cell-full)?"/g) ?? []).toHaveLength(cells)
    expect(html.match(/class="itw-measure"/g)?.length ?? 0).toBe(s.days.length + s.bars.filter((b) => b.kind === 'all').length)
    if (s.days.some((d) => d.turn)) expect(html).toContain('https://example.org/turn')
  })
})
