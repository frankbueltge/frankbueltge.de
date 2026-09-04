// Spread's server render is the honest floor a work with no build-time data can offer: before
// any socket exists, the controls, the venue legend and the (empty) ledger are still real markup
// — never a style attribute (the CSP would drop it), never a hard-coded colour (spread.css's
// `--sp-*` tokens alias the frame's own tokens; nothing here or in that stylesheet types a hex).
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import Spread, { type SpreadWording } from './Spread'

const wording: SpreadWording = {
  figureLabel: 'A live field of trades across several venues.',
  scaleHint: 'The vertical scale follows the last few minutes.',
  formHint: 'A filled mark is a buy, a hollow mark is a sell.',
  pauseLegend: 'The drawing',
  pauseLabel: 'Pause',
  resumeLabel: 'Resume',
  pauseHint: 'Freezes the drawing.',
  venuesLegend: 'Venues read',
  assetLegend: 'Asset',
  assets: { BTC: 'Bitcoin · BTC', ETH: 'Ethereum · ETH' },
  status: { connecting: 'connecting', live: 'live', down: 'down', off: 'off' },
  counterLabel: 'Trades seen this visit',
  ledgerHeading: 'The ledger of disagreement',
  ledgerLead: 'Whenever the gap opens wider than usual, the moment is stamped below.',
  ledgerEmpty: 'No disagreement wide enough to log yet.',
  ledgerColumns: { time: 'When', venues: 'Venues', gap: 'Gap' },
  ledgerSelectHint: 'Select a row to find that moment in the field above.',
  ledgerOutOfView: 'That moment has scrolled out of the visible window.',
  ledgerMixedNote: '* spans the USDT venue.',
  readoutJustNow: 'just now',
  readoutAgoSuffix: 'ago',
}

const render = () => renderToStaticMarkup(<Spread wording={wording} id="spread-field" readoutId="spread-readout" />)

describe('Spread, rendered on the server (no socket has opened yet)', () => {
  it('is deterministic — the same props give byte-identical markup', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute and no hard-coded colour', () => {
    const html = render()
    // \x22 rather than a literal quote, so this line does not itself trip the drift check.
    expect(html).not.toMatch(/ style=\x22/)
    expect(html).not.toMatch(/ style=\{/)
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('names every venue and both assets before any script has run', () => {
    const html = render()
    for (const label of ['Coinbase', 'Kraken', 'Bitstamp', 'Binance']) expect(html).toContain(label)
    expect(html).toContain('Bitcoin · BTC')
    expect(html).toContain('Ethereum · ETH')
  })

  it('offers the pause control and an empty, honest ledger', () => {
    const html = render()
    expect(html).toContain('Pause')
    expect(html).toContain(wording.ledgerEmpty)
  })

  it('draws the figure as a canvas, carrying its accessible label as a fallback', () => {
    const html = render()
    expect(html).toContain('<canvas')
    expect(html).toContain(wording.figureLabel)
  })
})
