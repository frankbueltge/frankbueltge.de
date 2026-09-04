// src/components/pages/Spread.tsx — the live field of /spread (2026-09-04): four exchanges' own
// sockets, one canvas, drawn as they arrive.
//
// This is a LIVE, UNARCHIVED work (src/lib/experiments/unarchived.ts) — the house's usual duty 1
// ("every number comes from a pure, tested lib") is kept for the parts that CAN be pure without
// a clock or a socket: the wire-format mapping (src/lib/spread/venues.ts), the band and the
// remarkable-gap rule (src/lib/spread/band.ts) and the reconnect backoff (src/lib/spread/
// reconnect.ts) are all pure and tested there. What cannot be pure — opening sockets, painting a
// canvas 60 times a second, reading the clock — lives here instead, and duty 2 ("the server
// render is the floor") is kept in the only sense a work with no build-time data CAN keep it: the
// server render is the honest "connecting…" state, never a faked number.
//
//   3. NO style ATTRIBUTE, NO HEX — spread.css inks every `.sp-*` class; the canvas reads its ink
//      from that stylesheet's `--sp-*` custom properties at runtime (src/lib/spread/ink.ts),
//      never a literal colour in this file.
//   4. REDUCED MOTION: the band's breathing pulse and the animation-frame redraw loop are both
//      switched off in favour of a fixed, slower interval that still redraws on new data.
//   5. THE READOUT is clamped to `.sp-figure` (score-kit's useReadout) and is never a hit target.
//   6. THE BUDGET: this island plus the shared React runtime; no d3, no deck.gl.
//   7. ONE INK: buys and sells are told apart by FORM (filled vs. hollow triangle), venues by
//      LABEL — no hue is introduced anywhere in this file.
import * as React from 'react'

import { useReadout } from '@/components/ecology/score-kit'
import { computeBand, initTypicalWidth, isRemarkableGap, mid, updateTypicalWidth, type TypicalWidth } from '@/lib/spread/band'
import { onMotionChange, reducedMotion } from '@/lib/dataviz/runtime'
import { readFieldInk, rgba } from '@/lib/spread/ink'
import { backoffDelayMs } from '@/lib/spread/reconnect'
import {
  parseVenueMessage,
  socketUrl,
  subscribeMessages,
  venueLabel,
  VENUES,
  type AssetId,
  type Quote,
  type Trade,
  type VenueId,
} from '@/lib/spread/venues'

export type VenueStatus = 'connecting' | 'live' | 'down' | 'off'

export interface SpreadWording {
  figureLabel: string
  scaleHint: string
  formHint: string
  pauseLegend: string
  pauseLabel: string
  resumeLabel: string
  pauseHint: string
  venuesLegend: string
  assetLegend: string
  assets: Record<AssetId, string>
  status: Record<VenueStatus, string>
  counterLabel: string
  ledgerHeading: string
  ledgerLead: string
  ledgerEmpty: string
  ledgerColumns: { time: string; venues: string; gap: string }
  ledgerSelectHint: string
  ledgerOutOfView: string
  ledgerMixedNote: string
  readoutJustNow: string
  readoutAgoSuffix: string
}

export interface SpreadProps {
  wording: SpreadWording
  id: string
  readoutId: string
}

// ---------------------------------------------------------------- constants

/** How much of the session the field shows at once. Named once, here, never in visitor copy
 *  (spread-wording.ts stays digit-free on purpose) so tuning this cannot leave a sentence lying. */
const WINDOW_MS = 3 * 60_000
/** A hard ceiling on the trade buffer regardless of the time window, so a venue's burst cannot
 *  grow the array without bound between two prunes. */
const MAX_TRADES = 6000
// Wide enough for the longest real label ("Binance 79,428.61 USDT" — the one venue whose price
// carries a currency suffix instead of a "$" prefix) at the canvas's 11px mono font; verified
// against a live screenshot rather than guessed (a guess clipped "Kraken $79,445.00" here once).
const RIGHT_MARGIN = 168
const MIN_TICK_GAP = 15
const HIT_RADIUS = 16
const SIZE_MIN_R = 2.2
const SIZE_MAX_R = 11
const BAND_ALPHA_NORMAL = 0.16
const BAND_ALPHA_REMARKABLE = 0.52
const TYPICAL_ALPHA = 0.02
// Calibrated against real venues while verifying this page, not guessed: BTC's cross-venue gap
// among these four sat mostly in a $3-14 band with real, constant natural variation (Binance's
// USDT pairs swinging the high end) — a fixed 3x multiplier over that range's own EMA rarely
// cleared the bar within an ordinary visit, which would have made the ledger's own claim ("it
// accumulates while you watch") false for most visitors. 1.6x still demands a real widening
// above the session's own recent shape, not every tick.
const REMARKABLE = { multiplier: 1.6, minSamples: 15 } as const
/** hysteresis: a flare must fall back under 60% of the entry threshold before it can log again,
 *  so a gap sitting right at the line does not spam the ledger with one row per tick. */
const REMARKABLE_EXIT_FACTOR = 0.6
const REDUCED_MOTION_REDRAW_MS = 1000
const DISPLAY_TICK_MS = 400
const LEDGER_MAX_ROWS = 300

interface BandSample {
  time: number
  high: number
  low: number
}

export interface LedgerEntry {
  id: string
  time: number
  width: number
  highVenue: VenueId
  lowVenue: VenueId
  highPrice: number
  lowPrice: number
}

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

const pruneOld = <T extends { time: number }>(items: T[], cutoff: number): T[] => {
  let i = 0
  while (i < items.length && items[i]!.time < cutoff) i++
  if (i > 0) items.splice(0, i)
  return items
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const plain2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf = new Intl.NumberFormat('en-US')
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

const currencyOf = (venue: VenueId): 'USD' | 'USDT' => VENUES.find((v) => v.id === venue)?.quoteCurrency ?? 'USD'

/** A venue's own price, in its own currency — never a bare "$" in front of a USDT number, which
 *  is exactly the conflation this piece's honesty note exists to refuse. */
const formatVenuePrice = (price: number, venue: VenueId): string =>
  currencyOf(venue) === 'USD' ? usd.format(price) : `${plain2.format(price)} USDT`

/** A ledger gap between two venues. Where both quote the same currency the "$" reads exactly;
 *  where one is the USDT venue, a plain, unsigned figure with a marker stands in — the reader is
 *  pointed at the honesty note above rather than handed a false "$" precision. */
const formatGap = (width: number, highVenue: VenueId, lowVenue: VenueId): { text: string; mixed: boolean } => {
  const mixed = currencyOf(highVenue) !== currencyOf(lowVenue)
  return { text: mixed ? `${plain2.format(width)} *` : usd.format(width), mixed }
}

const formatAgo = (ms: number, wording: SpreadWording): string => {
  if (ms < 1000) return wording.readoutJustNow
  const s = Math.floor(ms / 1000)
  const label = s < 60 ? `${s}s` : `${Math.floor(s / 60)}m`
  return `${label} ${wording.readoutAgoSuffix}`
}

/** Pushes ticks apart along y until every pair clears `gap`, keeping their given order. Pure, but
 *  small and low-risk enough to live inline rather than in its own tested module. */
function spreadTicks(ys: number[], gap: number): number[] {
  const order = ys.map((y, i) => i).sort((a, b) => ys[a]! - ys[b]!)
  const out = [...ys]
  for (let k = 1; k < order.length; k++) {
    const prev = order[k - 1]!
    const cur = order[k]!
    if (out[cur]! - out[prev]! < gap) out[cur] = out[prev]! + gap
  }
  return out
}

export default function Spread({ wording, id, readoutId }: SpreadProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const readout = useReadout(rootRef, readoutId, '.sp-figure')

  const [asset, setAsset] = React.useState<AssetId>('BTC')
  const [venueOn, setVenueOn] = React.useState<Record<VenueId, boolean>>(() =>
    Object.fromEntries(VENUES.map((v) => [v.id, true])) as Record<VenueId, boolean>,
  )
  const [venueStatus, setVenueStatus] = React.useState<Record<VenueId, VenueStatus>>(() =>
    Object.fromEntries(VENUES.map((v) => [v.id, 'connecting'])) as Record<VenueId, VenueStatus>,
  )
  const [paused, setPaused] = React.useState(false)
  const [ledger, setLedger] = React.useState<LedgerEntry[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedOutOfView, setSelectedOutOfView] = React.useState(false)
  const [, setDisplayTick] = React.useState(0)

  // High-frequency mutable data lives in refs — none of it drives a React re-render on its own;
  // `displayTick` (below) periodically forces the low-cost parts of it (the legend, the counter)
  // to be read at render time, the same trade-off Readout's own DOM-direct updates make.
  const tradesRef = React.useRef<Trade[]>([])
  const quotesRef = React.useRef<Partial<Record<VenueId, Quote>>>({})
  const bandHistoryRef = React.useRef<BandSample[]>([])
  const typicalRef = React.useRef<TypicalWidth>(initTypicalWidth())
  const flareRef = React.useRef(false)
  const tradesSeenRef = React.useRef(0)

  const sockets = React.useRef<Partial<Record<VenueId, WebSocket>>>({})
  const reconnectAttempts = React.useRef<Partial<Record<VenueId, number>>>({})
  const reconnectTimers = React.useRef<Partial<Record<VenueId, ReturnType<typeof setTimeout>>>>({})
  const connectivity = React.useRef({ tabVisible: true, inView: true })

  // refs mirroring state that the imperative draw/socket code needs without retriggering effects
  const assetRef = React.useRef(asset)
  const venueOnRef = React.useRef(venueOn)
  const pausedRef = React.useRef(paused)
  const pausedAtRef = React.useRef<number | null>(null)
  const reducedRef = React.useRef(reducedMotion())
  const selectedRef = React.useRef<LedgerEntry | null>(null)

  React.useEffect(() => {
    assetRef.current = asset
  }, [asset])
  React.useEffect(() => {
    venueOnRef.current = venueOn
    reconcile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueOn])
  React.useEffect(() => {
    pausedRef.current = paused
    pausedAtRef.current = paused ? Date.now() : null
  }, [paused])
  React.useEffect(() => {
    selectedRef.current = ledger.find((row) => row.id === selectedId) ?? null
  }, [ledger, selectedId])

  const setStatus = React.useCallback((venue: VenueId, status: VenueStatus) => {
    setVenueStatus((prev) => (prev[venue] === status ? prev : { ...prev, [venue]: status }))
  }, [])

  const handleTrade = React.useCallback((trade: Trade) => {
    tradesSeenRef.current += 1
    const arr = tradesRef.current
    arr.push(trade)
    if (arr.length > MAX_TRADES) arr.splice(0, arr.length - MAX_TRADES)
  }, [])

  const handleQuote = React.useCallback((quote: Quote) => {
    quotesRef.current[quote.venue] = quote
    const live = VENUES.filter((v) => venueOnRef.current[v.id])
      .map((v) => quotesRef.current[v.id])
      .filter((q): q is Quote => q != null)
    const band = computeBand(live)
    if (!band) return
    bandHistoryRef.current.push({ time: quote.time, high: band.high, low: band.low })
    typicalRef.current = updateTypicalWidth(typicalRef.current, band.width, TYPICAL_ALPHA)

    const remarkable = isRemarkableGap(band.width, typicalRef.current, REMARKABLE)
    const exited = band.width < typicalRef.current.ema * REMARKABLE.multiplier * REMARKABLE_EXIT_FACTOR
    if (remarkable && !flareRef.current) {
      flareRef.current = true
      const entry: LedgerEntry = {
        id: `${quote.time}-${band.highVenue}-${band.lowVenue}`,
        time: quote.time,
        width: band.width,
        highVenue: band.highVenue,
        lowVenue: band.lowVenue,
        highPrice: band.high,
        lowPrice: band.low,
      }
      setLedger((prev) => {
        const next = [entry, ...prev]
        return next.length > LEDGER_MAX_ROWS ? next.slice(0, LEDGER_MAX_ROWS) : next
      })
    } else if (exited) {
      flareRef.current = false
    }
  }, [])

  const openVenue = React.useCallback(
    (venue: VenueId) => {
      if (sockets.current[venue]) return
      setStatus(venue, 'connecting')
      let ws: WebSocket
      try {
        ws = new WebSocket(socketUrl(venue, assetRef.current))
      } catch {
        setStatus(venue, 'down')
        return
      }
      sockets.current[venue] = ws
      ws.onopen = () => {
        for (const message of subscribeMessages(venue, assetRef.current)) ws.send(message)
        reconnectAttempts.current[venue] = 0
        setStatus(venue, 'live')
      }
      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') return
        for (const ev of parseVenueMessage(venue, event.data)) {
          if (ev.kind === 'trade') handleTrade(ev.trade)
          else handleQuote(ev.quote)
        }
      }
      ws.onclose = () => {
        if (sockets.current[venue] !== ws) return
        sockets.current[venue] = undefined
        const stillWanted = venueOnRef.current[venue] && connectivity.current.tabVisible && connectivity.current.inView
        if (!stillWanted) {
          setStatus(venue, 'off')
          return
        }
        setStatus(venue, 'down')
        const attempt = reconnectAttempts.current[venue] ?? 0
        reconnectAttempts.current[venue] = attempt + 1
        reconnectTimers.current[venue] = setTimeout(() => {
          if (venueOnRef.current[venue] && connectivity.current.tabVisible && connectivity.current.inView) {
            openVenue(venue)
          }
        }, backoffDelayMs(attempt))
      }
      ws.onerror = () => {
        // WebSocket always follows an error with a close event — reconnect logic lives there.
      }
    },
    [handleQuote, handleTrade, setStatus],
  )

  const closeVenue = React.useCallback((venue: VenueId) => {
    clearTimeout(reconnectTimers.current[venue])
    reconnectTimers.current[venue] = undefined
    const ws = sockets.current[venue]
    sockets.current[venue] = undefined
    ws?.close()
  }, [])

  const reconcile = React.useCallback(() => {
    const shouldConnect = connectivity.current.tabVisible && connectivity.current.inView
    for (const def of VENUES) {
      const wanted = shouldConnect && venueOnRef.current[def.id]
      const open = sockets.current[def.id] != null
      if (wanted && !open) openVenue(def.id)
      if (!wanted && open) {
        closeVenue(def.id)
        setStatus(def.id, 'off')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openVenue, closeVenue, setStatus])

  // asset switch: close every socket, clear this observation's own measurements (the ledger's
  // typical-width baseline for one asset means nothing for another), reconnect on the new pair.
  // `tradesSeenRef` is NOT reset — it counts trades since the page opened, not since this asset.
  //
  // Skipped on the very first run (the initial mount, not a switch): the venueOn effect above
  // already reconciles the initial connection, and closing what it just opened here — before a
  // single handshake could finish — was a real, reproducible bug (every fresh load logged all
  // four venues' sockets as "closed before the connection is established", found while verifying
  // this page against the live venues, not a network flake).
  const mountedAsset = React.useRef(false)
  React.useEffect(() => {
    if (!mountedAsset.current) {
      mountedAsset.current = true
      return
    }
    for (const def of VENUES) closeVenue(def.id)
    tradesRef.current = []
    quotesRef.current = {}
    bandHistoryRef.current = []
    typicalRef.current = initTypicalWidth()
    flareRef.current = false
    setLedger([])
    setSelectedId(null)
    reconcile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset])

  // visibility + viewport: close every socket when nobody can be looking, reopen on return.
  React.useEffect(() => {
    const root = rootRef.current
    const onVisibility = () => {
      connectivity.current.tabVisible = document.visibilityState === 'visible'
      reconcile()
    }
    document.addEventListener('visibilitychange', onVisibility)
    let observer: IntersectionObserver | null = null
    if (root && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          connectivity.current.inView = entry?.isIntersecting ?? true
          reconcile()
        },
        { threshold: 0.01 },
      )
      observer.observe(root)
    }
    reconcile()
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
      for (const def of VENUES) closeVenue(def.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // reduced motion: switch live between the two redraw strategies
  React.useEffect(() => onMotionChange((reduced) => { reducedRef.current = reduced }), [])

  // the low-frequency display heartbeat: the legend and the trade counter read refs at render
  // time, gated to this cadence so a burst of quotes cannot force sixty renders a second.
  React.useEffect(() => {
    const id = setInterval(() => setDisplayTick((t) => t + 1), DISPLAY_TICK_MS)
    return () => clearInterval(id)
  }, [])

  // ---------------------------------------------------------------- drawing

  const buildFrame = React.useCallback((canvas: HTMLCanvasElement) => {
    const now = pausedRef.current ? (pausedAtRef.current ?? Date.now()) : Date.now()
    const windowStart = now - WINDOW_MS
    pruneOld(tradesRef.current, windowStart)
    pruneOld(bandHistoryRef.current, windowStart - 5000)

    const cssWidth = canvas.clientWidth || 1
    const cssHeight = canvas.clientHeight || 1
    const plotWidth = Math.max(1, cssWidth - RIGHT_MARGIN)

    const trades = tradesRef.current
    const bandHistory = bandHistoryRef.current
    let lo = Infinity
    let hi = -Infinity
    for (const t of trades) {
      if (t.price < lo) lo = t.price
      if (t.price > hi) hi = t.price
    }
    for (const b of bandHistory) {
      if (b.low < lo) lo = b.low
      if (b.high > hi) hi = b.high
    }
    for (const def of VENUES) {
      const q = quotesRef.current[def.id]
      if (!q) continue
      const m = mid(q)
      if (m < lo) lo = m
      if (m > hi) hi = m
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      lo = 0
      hi = 1
    }
    if (hi === lo) {
      lo -= 1
      hi += 1
    }
    const pad = (hi - lo) * 0.12
    lo -= pad
    hi += pad

    const xTime = (t: number) => plotWidth * (1 - clamp((now - t) / WINDOW_MS, 0, 1))
    const yPrice = (p: number) => cssHeight - ((p - lo) / (hi - lo)) * cssHeight

    return { now, windowStart, cssWidth, cssHeight, plotWidth, trades, bandHistory, lo, hi, xTime, yPrice }
  }, [])

  const draw = React.useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = window.devicePixelRatio || 1
      const cssWidth = canvas.clientWidth || 1
      const cssHeight = canvas.clientHeight || 1
      if (canvas.width !== Math.round(cssWidth * dpr) || canvas.height !== Math.round(cssHeight * dpr)) {
        canvas.width = Math.round(cssWidth * dpr)
        canvas.height = Math.round(cssHeight * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssWidth, cssHeight)

      // Read fresh every frame, never cached: a cached ink object survived a light/dark toggle
      // once during verification (the site's real theme switch, not just a reload) and kept
      // painting the OLD theme's near-invisible-on-the-new-background colour until a full
      // reload. getComputedStyle here costs far less than the marks it is about to draw.
      const ink = readFieldInk(canvas)
      const cs = getComputedStyle(canvas)
      ctx.font = `${cs.fontSize} ${cs.fontFamily}`
      ctx.textBaseline = 'middle'

      const frame = buildFrame(canvas)
      const { plotWidth, cssHeight: h, trades, bandHistory, lo, hi, xTime, yPrice, now } = frame

      // grid: four horizontal price lines, labelled on the left
      ctx.strokeStyle = rgba(ink.grid, 0.6)
      ctx.fillStyle = rgba(ink.muted, 0.8)
      ctx.lineWidth = 1
      const steps = 4
      for (let i = 0; i <= steps; i++) {
        const p = lo + ((hi - lo) * i) / steps
        const y = yPrice(p)
        ctx.beginPath()
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(plotWidth, y + 0.5)
        ctx.stroke()
        ctx.fillText(usd.format(p), 4, clamp(y, 8, h - 8))
      }

      // the band ribbon — the work
      if (bandHistory.length > 1) {
        const latest = bandHistory[bandHistory.length - 1]!
        const remarkable = isRemarkableGap(latest.high - latest.low, typicalRef.current, REMARKABLE)
        const breathe = reducedRef.current ? 1 : 0.82 + 0.18 * Math.sin(now / 850)
        ctx.beginPath()
        bandHistory.forEach((b, i) => {
          const x = xTime(b.time)
          const y = yPrice(b.high)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        for (let i = bandHistory.length - 1; i >= 0; i--) {
          const b = bandHistory[i]!
          ctx.lineTo(xTime(b.time), yPrice(b.low))
        }
        ctx.closePath()
        // At rest the band is the frame's own accent, which in this house's mono skin is a tone
        // rather than a hue — a slightly darker grey, and that is right for the ninety-odd percent
        // of the time when the venues agree to within a few dollars. The moment they do not is the
        // subject of the work, so it wears the recorded live ink instead (spread.css's header).
        const bandInk = remarkable ? ink.flare : ink.band
        ctx.fillStyle = rgba(bandInk, (remarkable ? BAND_ALPHA_REMARKABLE : BAND_ALPHA_NORMAL) * breathe)
        ctx.fill()
        ctx.strokeStyle = rgba(bandInk, Math.min(1, (remarkable ? 0.95 : 0.45) * breathe))
        ctx.lineWidth = remarkable ? 1.8 : 1
        ctx.stroke()
      }

      // trade marks: filled triangle-up = buy, hollow triangle-down = sell
      for (const t of trades) {
        const age = (now - t.time) / WINDOW_MS
        // A busy minute puts thousands of marks in this window, and at full opacity they merge
        // into one black mass — which is what the first build looked like. Held under half, the
        // same crowd builds TONE instead: where the trading was thick the field darkens, where it
        // was thin single marks stay readable, and the shape of the last few minutes is legible
        // from across the room (2026-09-04).
        const alpha = clamp(1 - age, 0.08, 1) * 0.42
        const r = clamp(Math.sqrt(Math.max(t.size, 0)) * 9, SIZE_MIN_R, SIZE_MAX_R)
        const x = xTime(t.time)
        const y = yPrice(t.price)
        ctx.beginPath()
        if (t.side === 'buy') {
          ctx.moveTo(x, y - r)
          ctx.lineTo(x + r, y + r * 0.8)
          ctx.lineTo(x - r, y + r * 0.8)
          ctx.closePath()
          ctx.fillStyle = rgba(ink.mark, alpha)
          ctx.fill()
        } else {
          ctx.moveTo(x, y + r)
          ctx.lineTo(x + r, y - r * 0.8)
          ctx.lineTo(x - r, y - r * 0.8)
          ctx.closePath()
          ctx.lineWidth = 1.3
          ctx.strokeStyle = rgba(ink.mark, alpha)
          ctx.stroke()
        }
      }

      // venue ticks at the right edge, labelled, collision-avoided
      const activeTicks = VENUES.filter((v) => venueOnRef.current[v.id])
        .map((v) => {
          const q = quotesRef.current[v.id]
          return q ? { venue: v, y: yPrice(mid(q)), price: mid(q) } : null
        })
        .filter((t): t is { venue: (typeof VENUES)[number]; y: number; price: number } => t != null)
      const laidOutY = spreadTicks(
        activeTicks.map((t) => t.y),
        MIN_TICK_GAP,
      )
      activeTicks.forEach((t, i) => {
        const y = clamp(laidOutY[i]!, 8, h - 8)
        ctx.strokeStyle = rgba(ink.mark, 0.85)
        ctx.beginPath()
        ctx.moveTo(plotWidth - 8, t.y)
        ctx.lineTo(plotWidth, t.y)
        ctx.stroke()
        ctx.fillStyle = rgba(ink.muted, 0.95)
        ctx.fillText(`${t.venue.label} ${formatVenuePrice(t.price, t.venue.id)}`, plotWidth + 6, y)
      })

      // the selected ledger moment, if still inside the visible window
      const selected = selectedRef.current
      if (selected) {
        const inView = selected.time >= frame.windowStart
        if (inView) {
          const x = xTime(selected.time)
          ctx.save()
          ctx.setLineDash([4, 3])
          // the recorded live ink again: a moment picked out of the ledger is the same kind of
          // thing as a band that is flaring — the one place in the field the reader is pointing at
          ctx.strokeStyle = rgba(ink.flare, 0.95)
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
          ctx.stroke()
          ctx.restore()
        }
        if (inView !== !selectedOutOfView) setSelectedOutOfView(!inView)
      } else if (selectedOutOfView) {
        setSelectedOutOfView(false)
      }
    },
    [buildFrame, selectedOutOfView],
  )

  // the redraw loop: requestAnimationFrame normally, a slow fixed interval under reduced motion
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let interval: ReturnType<typeof setInterval> | undefined
    // Pause means the PIXELS stop, not just the clock they were computed from: the loop keeps
    // ticking (so resume is instant) but skips the actual draw call, leaving the last frame on
    // screen untouched while trades and quotes keep arriving into the buffers underneath.
    const drawUnlessPaused = () => {
      if (!pausedRef.current) draw(canvas, ctx)
    }
    const loop = () => {
      drawUnlessPaused()
      raf = requestAnimationFrame(loop)
    }
    if (reducedRef.current) {
      drawUnlessPaused()
      interval = setInterval(drawUnlessPaused, REDUCED_MOTION_REDRAW_MS)
    } else {
      raf = requestAnimationFrame(loop)
    }
    const resize = () => drawUnlessPaused()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    ro?.observe(canvas)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (interval) clearInterval(interval)
      ro?.disconnect()
    }
  }, [draw])

  // ---------------------------------------------------------------- pointer readout

  const showTradeReadout = (trade: Trade, x: number, y: number) => {
    const node = document.createDocumentFragment()
    const head = document.createElement('b')
    head.className = 'r-head'
    head.textContent = `${venueLabel(trade.venue)} · ${trade.side}`
    const body = document.createElement('span')
    body.className = 'r-body'
    body.textContent = `${formatVenuePrice(trade.price, trade.venue)} · ${nf.format(trade.size)} size`
    const src = document.createElement('span')
    src.className = 'r-src'
    src.textContent = formatAgo(Date.now() - trade.time, wording)
    node.append(head, body, src)
    readout.show(node, { anchorX: x, anchorY: y })
  }

  const nearestTrade = (px: number, py: number): { trade: Trade; x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const frame = buildFrame(canvas)
    let best: { trade: Trade; x: number; y: number; d2: number } | null = null
    for (const t of frame.trades) {
      const x = frame.xTime(t.time)
      const y = frame.yPrice(t.price)
      const d2 = (x - px) ** 2 + (y - py) ** 2
      if (!best || d2 < best.d2) best = { trade: t, x, y, d2 }
    }
    if (best && best.d2 <= HIT_RADIUS ** 2) return best
    return null
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const anchor = readout.fromPointer(event)
    const hit = nearestTrade(anchor.anchorX, anchor.anchorY)
    if (hit) showTradeReadout(hit.trade, hit.x, hit.y)
    else readout.hide()
  }
  const onPointerLeave = () => readout.hide()

  const onCanvasKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (event.key === 'Escape') {
      readout.hide()
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const frame = buildFrame(canvas)
    const trades = frame.trades
    if (trades.length === 0) return
    const currentIndex = (canvas as any)._spKeyIndex ?? trades.length - 1
    let index = currentIndex
    if (event.key === 'ArrowLeft') index = clamp(currentIndex - 1, 0, trades.length - 1)
    if (event.key === 'ArrowRight') index = clamp(currentIndex + 1, 0, trades.length - 1)
    if (event.key === 'Enter' || event.key === ' ') index = trades.length - 1
    ;(canvas as any)._spKeyIndex = index
    const t = trades[index]!
    showTradeReadout(t, frame.xTime(t.time), frame.yPrice(t.price))
  }

  // ---------------------------------------------------------------- render

  const toggleVenue = (venue: VenueId) =>
    setVenueOn((prev) => ({ ...prev, [venue]: !prev[venue] }))

  return (
    <div ref={rootRef} id={id} data-island="spread" className="sp-room">
      <figure className="sp-figure">
        <canvas
          ref={canvasRef}
          className="sp-canvas"
          role="img"
          aria-label={wording.figureLabel}
          tabIndex={0}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onKeyDown={onCanvasKeyDown}
          onFocus={() => {
            const canvas = canvasRef.current
            if (!canvas) return
            const frame = buildFrame(canvas)
            const t = frame.trades[frame.trades.length - 1]
            if (t) showTradeReadout(t, frame.xTime(t.time), frame.yPrice(t.price))
          }}
          onBlur={() => readout.hide()}
        >
          {wording.figureLabel}
        </canvas>
        <div id={readoutId} className="dv-readout" data-dv-readout hidden aria-hidden="true" />
      </figure>

      <ul className="sp-legend" aria-label={wording.venuesLegend}>
        {VENUES.map((def) => {
          const q = quotesRef.current[def.id]
          const status = venueStatus[def.id]
          return (
            <li key={def.id} className="sp-legend-row" data-status={status}>
              <span>
                {def.label} <span className="sp-venue-status">· {wording.status[status]}</span>
              </span>
              <span className="sp-legend-price">{q ? formatVenuePrice(mid(q), def.id) : '—'}</span>
            </li>
          )
        })}
      </ul>

      {/* Every control here is a button the frame styles, never a native checkbox or radio: the
          browser's own boxes arrive with the browser's own blue, which is the one hue this house
          did not choose (found in review 2026-09-04). State travels as aria-pressed, which is
          what the room at /globe does with its layer toggles, so both figures read alike. */}
      <div className="sp-controls">
        <div className="sp-control-group">
          <span className="sp-control-legend">{wording.pauseLegend}</span>
          <button type="button" className="sp-toggle" onClick={() => setPaused((p) => !p)} aria-pressed={paused} data-on={paused ? 'yes' : 'no'}>
            {paused ? wording.resumeLabel : wording.pauseLabel}
          </button>
          <span className="sp-control-hint">{wording.pauseHint}</span>
        </div>

        <div className="sp-control-group">
          <span className="sp-control-legend" id={`${id}-venues-legend`}>
            {wording.venuesLegend}
          </span>
          <div className="sp-toggle-set" role="group" aria-labelledby={`${id}-venues-legend`}>
            {VENUES.map((def) => (
              <button
                key={def.id}
                type="button"
                className="sp-toggle sp-venue-toggle"
                onClick={() => toggleVenue(def.id)}
                aria-pressed={venueOn[def.id]}
                data-on={venueOn[def.id] ? 'yes' : 'no'}
                data-status={venueOn[def.id] ? venueStatus[def.id] : 'off'}
              >
                <span className="sp-toggle-label">{def.label}</span>
                <span className="sp-venue-status">{wording.status[venueOn[def.id] ? venueStatus[def.id] : 'off']}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sp-control-group">
          <span className="sp-control-legend" id={`${id}-asset-legend`}>
            {wording.assetLegend}
          </span>
          <div className="sp-toggle-set" role="group" aria-labelledby={`${id}-asset-legend`}>
            {(Object.keys(wording.assets) as AssetId[]).map((a) => (
              <button
                key={a}
                type="button"
                className="sp-toggle"
                onClick={() => setAsset(a)}
                aria-pressed={asset === a}
                data-on={asset === a ? 'yes' : 'no'}
              >
                {wording.assets[a]}
              </button>
            ))}
          </div>
        </div>

        <div className="sp-control-group">
          <span className="sp-control-legend">{wording.counterLabel}</span>
          <span className="sp-counter">{nf.format(tradesSeenRef.current)}</span>
        </div>
      </div>

      <section aria-labelledby={`${id}-ledger-heading`} className="mt-6">
        <h3 id={`${id}-ledger-heading`} className="kicker">
          {wording.ledgerHeading}
        </h3>
        <p className="mt-2 max-w-2xl text-body text-fg-muted">{wording.ledgerLead}</p>
        {selectedOutOfView && <p className="mt-1 text-mono-sm text-fg-faint">{wording.ledgerOutOfView}</p>}
        {ledger.length === 0 ? (
          <p className="sp-ledger-empty">{wording.ledgerEmpty}</p>
        ) : (
          <>
            <div className="sp-ledger-list" role="log" aria-live="polite" aria-label={wording.ledgerHeading}>
              {ledger.map((row) => {
                const gap = formatGap(row.width, row.highVenue, row.lowVenue)
                return (
                  <button
                    key={row.id}
                    type="button"
                    className="sp-ledger-row"
                    aria-pressed={selectedId === row.id}
                    onClick={() => setSelectedId((cur) => (cur === row.id ? null : row.id))}
                    title={wording.ledgerSelectHint}
                  >
                    <span aria-label={wording.ledgerColumns.time}>{clock.format(row.time)}</span>
                    <span aria-label={wording.ledgerColumns.venues}>
                      {venueLabel(row.highVenue)} vs {venueLabel(row.lowVenue)}
                    </span>
                    <span className="sp-ledger-gap" aria-label={wording.ledgerColumns.gap}>
                      {gap.text}
                    </span>
                  </button>
                )
              })}
            </div>
            {ledger.some((row) => currencyOf(row.highVenue) !== currencyOf(row.lowVenue)) && (
              <p className="mt-1 text-mono-sm text-fg-faint">{wording.ledgerMixedNote}</p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
