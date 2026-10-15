// src/lib/spread/venues.ts — the venue registry and the whole seam between this house's pages
// and four independent exchanges' own wire formats (Spread, /spread, 2026-09-04).
//
// Every exchange speaks its own dialect over its own public, keyless socket; this file is the
// entire translation layer, pure and tested against messages actually captured from each venue
// (venues.test.ts) rather than against documentation, which drifts. Nothing here opens a socket
// or reads a clock — Spread.tsx does that, and calls only what this file exports.
//
// Verified from a browser-equivalent connection before this file was written (a plain WebSocket,
// no proxy, no key): all four venues accept a subscription and stream trades/quotes for BTC and
// ETH. Binance is the one venue quoting USDT rather than USD — see spread-wording.ts for the
// sentence that fact requires on the page itself.

export type VenueId = 'coinbase' | 'kraken' | 'bitstamp' | 'binance'
export type AssetId = 'BTC' | 'ETH'
export type Side = 'buy' | 'sell'

export interface VenueDef {
  id: VenueId
  label: string
  /** the currency this venue actually quotes in. Three of four are plain US dollars; Binance's
   *  pair is against Tether (USDT), a stablecoin that trades close to a dollar but is not one. */
  quoteCurrency: 'USD' | 'USDT'
}

/** Order here is the order the field's right-edge ticks and every venue list on the page render
 *  in — deliberately not alphabetical, so a later venue can join at the end without reshuffling
 *  the three already on the page. */
export const VENUES: readonly VenueDef[] = [
  { id: 'coinbase', label: 'Coinbase', quoteCurrency: 'USD' },
  { id: 'kraken', label: 'Kraken', quoteCurrency: 'USD' },
  { id: 'bitstamp', label: 'Bitstamp', quoteCurrency: 'USD' },
  { id: 'binance', label: 'Binance', quoteCurrency: 'USDT' },
]

export const venueLabel = (id: VenueId): string => VENUES.find((v) => v.id === id)?.label ?? id

/** One trade, in the shape every venue's own trade message is mapped down to. `time` is the
 *  venue's own reported trade time in ms since epoch, except Binance's bookTicker (see
 *  parseBinance below) which carries none of its own. */
export interface Trade {
  venue: VenueId
  price: number
  size: number
  side: Side
  time: number
  id: string
}

/** A venue's current best bid/ask, in the shape every venue's own ticker/book message is mapped
 *  down to. The field draws a venue's CURRENT PRICE as the mid of bid and ask — the number a
 *  single trade's side cannot swing on its own (band.ts). */
export interface Quote {
  venue: VenueId
  bid: number
  ask: number
  time: number
}

export type VenueEvent = { kind: 'trade'; trade: Trade } | { kind: 'quote'; quote: Quote }

const lower = (asset: AssetId): string => asset.toLowerCase()

/** The pair name each venue expects, in its own dialect — one table instead of four scattered
 *  template strings. */
export function venueSymbol(venue: VenueId, asset: AssetId): string {
  switch (venue) {
    case 'coinbase':
      return `${asset}-USD`
    case 'kraken':
      return `${asset}/USD`
    case 'bitstamp':
      return `${lower(asset)}usd`
    case 'binance':
      return `${lower(asset)}usdt`
  }
}

/** The socket URL to open for one venue+asset pair. Binance carries its subscription in the URL
 *  itself (a combined stream); the other three connect once and subscribe by message
 *  (subscribeMessages below). */
export function socketUrl(venue: VenueId, asset: AssetId): string {
  switch (venue) {
    case 'coinbase':
      return 'wss://ws-feed.exchange.coinbase.com'
    case 'kraken':
      return 'wss://ws.kraken.com/v2'
    case 'bitstamp':
      return 'wss://ws.bitstamp.net'
    case 'binance': {
      const s = venueSymbol('binance', asset)
      return `wss://stream.binance.com:9443/stream?streams=${s}@trade/${s}@bookTicker`
    }
  }
}

/** The message(s) to send right after the socket's `open` event. Binance needs none — []. */
export function subscribeMessages(venue: VenueId, asset: AssetId): string[] {
  const symbol = venueSymbol(venue, asset)
  switch (venue) {
    case 'coinbase':
      return [JSON.stringify({ type: 'subscribe', product_ids: [symbol], channels: ['ticker', 'matches'] })]
    case 'kraken':
      return [
        JSON.stringify({ method: 'subscribe', params: { channel: 'ticker', symbol: [symbol] } }),
        JSON.stringify({ method: 'subscribe', params: { channel: 'trade', symbol: [symbol] } }),
      ]
    case 'bitstamp':
      return [
        JSON.stringify({ event: 'bts:subscribe', data: { channel: `live_trades_${symbol}` } }),
        JSON.stringify({ event: 'bts:subscribe', data: { channel: `order_book_${symbol}` } }),
      ]
    case 'binance':
      return []
  }
}

// ---------------------------------------------------------------- parsing

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v))

function parseCoinbase(msg: any): VenueEvent[] {
  if (msg.type === 'ticker' && msg.best_bid != null && msg.best_ask != null) {
    return [
      { kind: 'quote', quote: { venue: 'coinbase', bid: num(msg.best_bid), ask: num(msg.best_ask), time: Date.parse(msg.time) } },
    ]
  }
  if (msg.type === 'match' || msg.type === 'last_match') {
    return [
      {
        kind: 'trade',
        trade: {
          venue: 'coinbase',
          price: num(msg.price),
          size: num(msg.size),
          // Coinbase's own field: the side of the TAKER (aggressor) order.
          side: msg.side === 'sell' ? 'sell' : 'buy',
          time: Date.parse(msg.time),
          id: String(msg.trade_id),
        },
      },
    ]
  }
  return []
}

function parseKraken(msg: any): VenueEvent[] {
  if (msg.channel === 'ticker' && Array.isArray(msg.data)) {
    return msg.data
      .filter((d: any) => d.bid != null && d.ask != null)
      .map((d: any) => ({
        kind: 'quote' as const,
        quote: { venue: 'kraken' as const, bid: num(d.bid), ask: num(d.ask), time: Date.parse(d.timestamp) },
      }))
  }
  if (msg.channel === 'trade' && Array.isArray(msg.data)) {
    return msg.data.map((d: any) => ({
      kind: 'trade' as const,
      trade: {
        venue: 'kraken' as const,
        price: num(d.price),
        size: num(d.qty),
        side: d.side === 'sell' ? 'sell' : 'buy',
        time: Date.parse(d.timestamp),
        id: String(d.trade_id),
      },
    }))
  }
  return []
}

function parseBitstamp(msg: any): VenueEvent[] {
  if (msg.event === 'trade' && msg.data) {
    const d = msg.data
    return [
      {
        kind: 'trade',
        trade: {
          venue: 'bitstamp',
          price: num(d.price),
          size: num(d.amount),
          // Bitstamp's own encoding: 0 = buy, 1 = sell.
          side: Number(d.type) === 1 ? 'sell' : 'buy',
          // microtimestamp is microseconds since epoch, as a decimal string.
          time: Math.round(num(d.microtimestamp) / 1000),
          id: String(d.id),
        },
      },
    ]
  }
  if (
    msg.event === 'data' &&
    typeof msg.channel === 'string' &&
    msg.channel.startsWith('order_book') &&
    Array.isArray(msg.data?.bids) &&
    Array.isArray(msg.data?.asks) &&
    msg.data.bids.length > 0 &&
    msg.data.asks.length > 0
  ) {
    const d = msg.data
    return [
      {
        kind: 'quote',
        quote: {
          venue: 'bitstamp',
          bid: num(d.bids[0][0]),
          ask: num(d.asks[0][0]),
          // timestamp is whole seconds since epoch, as a decimal string.
          time: num(d.timestamp) * 1000,
        },
      },
    ]
  }
  return []
}

function parseBinance(msg: any, now: () => number): VenueEvent[] {
  const stream: string | undefined = msg.stream
  const d = msg.data
  if (!stream || !d) return []
  if (stream.endsWith('@trade') && d.e === 'trade') {
    return [
      {
        kind: 'trade',
        trade: {
          venue: 'binance',
          price: num(d.p),
          size: num(d.q),
          // `m`: is the BUYER the maker? true means the taker (the aggressor) sold.
          side: d.m ? 'sell' : 'buy',
          time: num(d.T),
          id: String(d.t),
        },
      },
    ]
  }
  if (stream.endsWith('@bookTicker') && d.b != null && d.a != null) {
    // bookTicker carries no timestamp of its own — arrival time stands in. That gap is itself
    // part of this piece's own honesty: a disagreement can be an artefact of the path a packet
    // took to this page, not only of the venues (see spread-wording.ts's `latency` note).
    return [{ kind: 'quote', quote: { venue: 'binance', bid: num(d.b), ask: num(d.a), time: now() } }]
  }
  return []
}

/** The one seam: a venue's raw wire message → zero or more common events. Never throws — an
 *  unparseable payload, a subscribe acknowledgement, a heartbeat or a status line all yield [].
 *  `now` is injectable (defaults to Date.now) only because Binance's bookTicker needs an arrival
 *  clock and nothing else here reads one — see parseBinance. */
export function parseVenueMessage(venue: VenueId, raw: string, now: () => number = Date.now): VenueEvent[] {
  let msg: any
  try {
    msg = JSON.parse(raw)
  } catch {
    return []
  }
  if (msg === null || typeof msg !== 'object') return []
  switch (venue) {
    case 'coinbase':
      return parseCoinbase(msg)
    case 'kraken':
      return parseKraken(msg)
    case 'bitstamp':
      return parseBitstamp(msg)
    case 'binance':
      return parseBinance(msg, now)
  }
}
