// src/config/spread-wording.ts — every visitor-facing string of Spread (/spread, 2026-09-04).
// The page and the island own no words of their own: they receive these.
//
// Digit-free wherever a digit would age (docs/wording-kanon.md's currency doctrine) — the
// minutes the field shows, the multiplier a gap must clear to enter the ledger, and the number
// of venues read are all constants a later session may tune, and prose that types one of them
// would start silently lying the day it changes. `currencyNote` below is the one paragraph that
// genuinely needs the venues' own facts, so it is a FUNCTION over the registry (venues.ts)
// rather than typed prose — the two can never drift apart because there is only one of them.
import { UNARCHIVED_NOTICE } from '@/lib/experiments/unarchived'
import { VENUES, type VenueDef } from '@/lib/spread/venues'

const joinWithAnd = (items: readonly string[]): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** The one paragraph that must stay true to VENUES no matter which venues this file lists —
 *  derived, never typed, so a venue joining or leaving the roster cannot leave this sentence
 *  naming the wrong ones. */
export function currencyNote(venues: readonly VenueDef[] = VENUES): string {
  const usd = venues.filter((v) => v.quoteCurrency === 'USD').map((v) => v.label)
  const usdt = venues.filter((v) => v.quoteCurrency === 'USDT').map((v) => v.label)
  const parts: string[] = []
  if (usd.length > 0) parts.push(`${joinWithAnd(usd)} ${usd.length === 1 ? 'quotes' : 'quote'} in plain US dollars`)
  if (usdt.length > 0) {
    parts.push(
      `${joinWithAnd(usdt)} ${usdt.length === 1 ? 'quotes' : 'quote'} in Tether (USDT), a stablecoin that trades close to a dollar but is not one`,
    )
  }
  const lead = parts.join('; ')
  return usdt.length > 0
    ? `${lead}. A gap that includes a USDT venue carries the stablecoin’s own drift and is not a pure arbitrage between identical currencies.`
    : `${lead}.`
}

export const SPREAD = {
  sheet: {
    kicker: 'Counter-measurement · live',
    title: 'Spread',
    sub:
      'Bitcoin and Ethereum do not have a price. They have several, disagreeing by fractions of ' +
      'a second on venues nobody can watch all at once — so this reads a handful of them at the ' +
      'same instant and draws the disagreement as it happens.',
    badges: ['LIVE', 'UNARCHIVED', 'COUNTER-MEASUREMENT'],
  },

  notice: UNARCHIVED_NOTICE,

  honesty: {
    heading: 'What this is, plainly',
    currency: currencyNote(),
    latency:
      'A gap can be an artefact of the path a packet took to reach this page as much as of the ' +
      'venues themselves — a slow connection reads a stale price and calls it a disagreement. ' +
      'This measures what arrives here, not what left there.',
    notASignal:
      'This is not a trading signal and not financial advice, and nothing on this page is ' +
      'archived: it is a picture of a moment, and the moment is gone once it has passed.',
  },

  field: {
    figureLabel:
      'A live field of trades across several venues: time runs right to left with the newest ' +
      'trade at the right edge, price runs up the page, and the shaded band is the gap between ' +
      'the highest and the lowest venue price at each moment.',
    scaleHint: 'The vertical scale follows the last few minutes, not the whole session.',
    formHint: 'A filled mark is a buy, a hollow mark is a sell — never a colour.',
  },

  controls: {
    pauseLabel: 'Pause',
    resumeLabel: 'Resume',
    pauseHint: 'Freezes the drawing; the sockets underneath keep reading.',
    venuesLegend: 'Venues read',
    assetLegend: 'Asset',
    assets: { BTC: 'Bitcoin · BTC', ETH: 'Ethereum · ETH' },
    status: {
      connecting: 'connecting',
      live: 'live',
      down: 'down — reconnecting',
      off: 'off',
    },
  },

  counter: {
    label: 'Trades seen this visit',
  },

  ledger: {
    heading: 'The ledger of disagreement',
    lead:
      'Whenever the gap between venues opens wider than this session has typically shown, the ' +
      'moment is stamped below — the two venues and the gap between them. It stays for the rest ' +
      'of the visit and accumulates while you watch; nothing here survives a reload.',
    empty: 'No disagreement wide enough to log yet — the field is still learning what typical looks like.',
    columns: { time: 'When', venues: 'Venues', gap: 'Gap' },
    selectHint: 'Select a row to find that moment in the field above.',
    outOfView: 'That moment has since scrolled out of the field’s visible window.',
    mixedNote: '* this gap spans the USDT venue — see the currency note above before reading it as a pure dollar figure.',
  },

  readout: {
    justNow: 'just now',
    agoSuffix: 'ago',
  },

  noscript:
    'Spread needs JavaScript and a live connection to several exchanges — it reads what they ' +
    'are broadcasting right now and draws nothing else, so there is no archived version of this ' +
    'page to fall back to.',
} as const
