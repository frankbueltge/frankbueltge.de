// src/lib/spread/venues.test.ts
//
// The trade/quote fixtures below are messages actually captured from each venue's public socket
// on 2026-09-04, while verifying the sources this piece reads (a plain WebSocket, no proxy, no
// key — the same connection a browser would open). They are code fixtures for a pure-function
// test, not archived data: Spread makes no claim from them, and none of the numbers inside them
// mean anything by the time anyone reads this file.
import { describe, expect, it } from 'vitest'

import {
  parseVenueMessage,
  socketUrl,
  subscribeMessages,
  venueSymbol,
  VENUES,
  type AssetId,
  type VenueId,
} from './venues'

describe('venue registry', () => {
  it('lists exactly the four verified venues, Binance the one on USDT', () => {
    expect(VENUES.map((v) => v.id)).toEqual(['coinbase', 'kraken', 'bitstamp', 'binance'])
    for (const v of VENUES) expect(v.quoteCurrency).toBe(v.id === 'binance' ? 'USDT' : 'USD')
  })
})

describe('venueSymbol', () => {
  it('renders each venue’s own pair-name dialect for both assets', () => {
    expect(venueSymbol('coinbase', 'BTC')).toBe('BTC-USD')
    expect(venueSymbol('coinbase', 'ETH')).toBe('ETH-USD')
    expect(venueSymbol('kraken', 'BTC')).toBe('BTC/USD')
    expect(venueSymbol('bitstamp', 'BTC')).toBe('btcusd')
    expect(venueSymbol('bitstamp', 'ETH')).toBe('ethusd')
    expect(venueSymbol('binance', 'BTC')).toBe('btcusdt')
    expect(venueSymbol('binance', 'ETH')).toBe('ethusdt')
  })
})

describe('socketUrl + subscribeMessages (the subscribe payload per venue)', () => {
  const assets: AssetId[] = ['BTC', 'ETH']

  it('coinbase: one fixed URL, one subscribe message per asset naming ticker + matches', () => {
    for (const asset of assets) {
      expect(socketUrl('coinbase', asset)).toBe('wss://ws-feed.exchange.coinbase.com')
      const [msg] = subscribeMessages('coinbase', asset)
      expect(JSON.parse(msg!)).toEqual({
        type: 'subscribe',
        product_ids: [venueSymbol('coinbase', asset)],
        channels: ['ticker', 'matches'],
      })
    }
  })

  it('kraken: v2 URL, two subscribe messages naming ticker and trade', () => {
    expect(socketUrl('kraken', 'BTC')).toBe('wss://ws.kraken.com/v2')
    const messages = subscribeMessages('kraken', 'ETH').map((m) => JSON.parse(m))
    expect(messages).toEqual([
      { method: 'subscribe', params: { channel: 'ticker', symbol: ['ETH/USD'] } },
      { method: 'subscribe', params: { channel: 'trade', symbol: ['ETH/USD'] } },
    ])
  })

  it('bitstamp: one fixed URL, subscribes to live_trades and order_book for the pair', () => {
    expect(socketUrl('bitstamp', 'BTC')).toBe('wss://ws.bitstamp.net')
    const messages = subscribeMessages('bitstamp', 'BTC').map((m) => JSON.parse(m))
    expect(messages).toEqual([
      { event: 'bts:subscribe', data: { channel: 'live_trades_btcusd' } },
      { event: 'bts:subscribe', data: { channel: 'order_book_btcusd' } },
    ])
  })

  it('binance: the subscription lives in the URL itself, so no messages are sent', () => {
    expect(socketUrl('binance', 'BTC')).toBe(
      'wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@bookTicker',
    )
    expect(socketUrl('binance', 'ETH')).toBe(
      'wss://stream.binance.com:9443/stream?streams=ethusdt@trade/ethusdt@bookTicker',
    )
    expect(subscribeMessages('binance', 'BTC')).toEqual([])
  })

  it('every venue+asset pair opens over TLS (wss:) and never carries a key in the URL', () => {
    for (const v of VENUES) {
      for (const asset of assets) {
        const url = socketUrl(v.id, asset)
        expect(url.startsWith('wss://')).toBe(true)
        expect(url).not.toMatch(/key|token|secret/i)
      }
    }
  })
})

describe('parseVenueMessage — real captured messages, mapped to the common shape', () => {
  it('coinbase ticker → a quote', () => {
    const raw =
      '{"type":"ticker","sequence":135557035414,"product_id":"BTC-USD","price":"81228.94","open_24h":"77026.99","volume_24h":"10973.39542777","low_24h":"76929.29","high_24h":"82283","volume_30d":"210811.57557364","best_bid":"81222.50","best_bid_size":"0.00000091","best_ask":"81228.97","best_ask_size":"0.16229192","side":"sell","time":"2026-09-04T00:21:02.905270Z","trade_id":1088490716,"last_size":"0.013388"}'
    const [event] = parseVenueMessage('coinbase', raw)
    expect(event).toEqual({
      kind: 'quote',
      quote: { venue: 'coinbase', bid: 81222.5, ask: 81228.97, time: Date.parse('2026-09-04T00:21:02.905Z') },
    })
  })

  it('coinbase match → a trade', () => {
    const raw =
      '{"type":"match","trade_id":1088490717,"maker_order_id":"1aad6dd4-c00b-454e-81c4-16033085708e","taker_order_id":"9060f53e-620c-408f-a8fc-a1e33a55b0ad","side":"sell","size":"0.00609388","price":"81222.94","product_id":"BTC-USD","sequence":135557036119,"time":"2026-09-04T00:21:03.878125Z"}'
    const [event] = parseVenueMessage('coinbase', raw)
    expect(event).toEqual({
      kind: 'trade',
      trade: {
        venue: 'coinbase',
        price: 81222.94,
        size: 0.00609388,
        side: 'sell',
        time: Date.parse('2026-09-04T00:21:03.878Z'),
        id: '1088490717',
      },
    })
  })

  it('coinbase subscribe acknowledgement → ignored', () => {
    const raw =
      '{"type":"subscriptions","channels":[{"name":"ticker","product_ids":["BTC-USD"],"account_ids":null}]}'
    expect(parseVenueMessage('coinbase', raw)).toEqual([])
  })

  it('kraken v2 ticker snapshot → a quote', () => {
    const raw =
      '{"channel":"ticker","type":"snapshot","data":[{"symbol":"BTC/USD","bid":81205.0,"bid_qty":0.58905885,"ask":81205.1,"ask_qty":0.69697106,"last":81205.1,"volume":4696.17832496,"vwap":80044.4,"low":76949.6,"high":82288.1,"change":4166.6,"change_pct":5.41,"trades":145275,"timestamp":"2026-09-04T00:21:20.217476Z"}]}'
    const [event] = parseVenueMessage('kraken', raw)
    expect(event).toEqual({
      kind: 'quote',
      quote: { venue: 'kraken', bid: 81205.0, ask: 81205.1, time: Date.parse('2026-09-04T00:21:20.217Z') },
    })
  })

  it('kraken v2 trade update → one or more trades (a real message carried four)', () => {
    const raw =
      '{"channel":"trade","type":"update","data":[{"symbol":"BTC/USD","side":"buy","price":81205.1,"qty":0.00003630,"ord_type":"limit","trade_id":106799953,"timestamp":"2026-09-04T00:21:20.564568Z"},{"symbol":"BTC/USD","side":"buy","price":81205.1,"qty":0.00200000,"ord_type":"limit","trade_id":106799954,"timestamp":"2026-09-04T00:21:20.564568Z"}]}'
    const events = parseVenueMessage('kraken', raw)
    expect(events).toEqual([
      {
        kind: 'trade',
        trade: { venue: 'kraken', price: 81205.1, size: 0.0000363, side: 'buy', time: Date.parse('2026-09-04T00:21:20.564Z'), id: '106799953' },
      },
      {
        kind: 'trade',
        trade: { venue: 'kraken', price: 81205.1, size: 0.002, side: 'buy', time: Date.parse('2026-09-04T00:21:20.564Z'), id: '106799954' },
      },
    ])
  })

  it('kraken heartbeat and status → ignored', () => {
    expect(parseVenueMessage('kraken', '{"channel":"heartbeat"}')).toEqual([])
    expect(
      parseVenueMessage(
        'kraken',
        '{"channel":"status","type":"update","data":[{"version":"2.0.10","system":"online"}]}',
      ),
    ).toEqual([])
  })

  it('bitstamp live_trades → a trade, buy (type 0)', () => {
    const raw =
      '{"data":{"id":629344156,"timestamp":"1788481329","amount":0.07375969,"amount_str":"0.07375969","price":81263.98,"price_str":"81263.98","type":0,"microtimestamp":"1788481329090000","buy_order_id":2046551467757570,"sell_order_id":2046551452086274},"channel":"live_trades_btcusd","event":"trade"}'
    const [event] = parseVenueMessage('bitstamp', raw)
    expect(event).toEqual({
      kind: 'trade',
      trade: { venue: 'bitstamp', price: 81263.98, size: 0.07375969, side: 'buy', time: 1788481329090, id: '629344156' },
    })
  })

  it('bitstamp order_book → a quote from the top of the book (bids[0]/asks[0])', () => {
    const raw =
      '{"data":{"timestamp":"1788481325","microtimestamp":"1788481325406795","bids":[["81254.37","0.56250000"],["81254.07","0.07500000"]],"asks":[["81263.98","0.68285797"],["81264.00","1.20000000"]]},"channel":"order_book_btcusd","event":"data"}'
    const [event] = parseVenueMessage('bitstamp', raw)
    expect(event).toEqual({
      kind: 'quote',
      quote: { venue: 'bitstamp', bid: 81254.37, ask: 81263.98, time: 1788481325000 },
    })
  })

  it('bitstamp subscription acknowledgement → ignored', () => {
    const raw = '{"event":"bts:subscription_succeeded","channel":"live_trades_btcusd","data":{}}'
    expect(parseVenueMessage('bitstamp', raw)).toEqual([])
  })

  it('binance combined trade stream → a trade; m:true means the taker sold', () => {
    const raw =
      '{"stream":"btcusdt@trade","data":{"e":"trade","E":1788481292965,"s":"BTCUSDT","t":6653570805,"p":"81207.45000000","q":"0.00016000","T":1788481292964,"m":true,"M":true}}'
    const [event] = parseVenueMessage('binance', raw)
    expect(event).toEqual({
      kind: 'trade',
      trade: { venue: 'binance', price: 81207.45, size: 0.00016, side: 'sell', time: 1788481292964, id: '6653570805' },
    })
  })

  it('binance combined bookTicker stream → a quote, timed by arrival (it carries no time of its own)', () => {
    const raw =
      '{"stream":"btcusdt@bookTicker","data":{"u":99663039038,"s":"BTCUSDT","b":"81207.45000000","B":"2.19538000","a":"81207.46000000","A":"2.27890000"}}'
    const [event] = parseVenueMessage('binance', raw, () => 1_800_000_000_000)
    expect(event).toEqual({
      kind: 'quote',
      quote: { venue: 'binance', bid: 81207.45, ask: 81207.46, time: 1_800_000_000_000 },
    })
  })

  it('never throws on malformed or unrecognised input', () => {
    const venues: VenueId[] = ['coinbase', 'kraken', 'bitstamp', 'binance']
    for (const v of venues) {
      expect(() => parseVenueMessage(v, 'not json')).not.toThrow()
      expect(parseVenueMessage(v, 'not json')).toEqual([])
      expect(parseVenueMessage(v, '{}')).toEqual([])
      expect(parseVenueMessage(v, 'null')).toEqual([])
      expect(parseVenueMessage(v, '42')).toEqual([])
    }
  })
})
