// src/components/pages/Comma.tsx — the live score and sound of Comma (/comma, 2026-11-13; on a broadcast clock since
// 2026-11-14).
//
// The piece is a broadcast on the wall clock, ten minutes behind the world, in blocks of five minutes
// (src/lib/comma/clock.ts). The site hands over the block that is playing and, in its last minute, the next one
// (functions/api/comma/); each holds the tests that deviated. When the site cannot read a block, the house's own
// recording of the same hour of an earlier day plays in its place (public/comma/tape/), labelled, and the page keeps
// asking; a block that arrives late takes over where the recording stands. This island sorts a block's web tests
// into the six kinds of page with Citizen Lab's lists, applies the rules of src/lib/comma/rule.ts with the committed
// counts of a whole day (src/data/comma/day.json), and puts the next seconds on the audio clock, a quarter of a
// minute ahead, so a hidden tab keeps playing. The score draws what has sounded, the newest on the right; the list
// beside it holds the last events still, with their links. Every number, colour slot and link comes from
// src/lib/comma/; this file schedules and draws. The server render is the floor: the rows, the legend, the button
// and the empty score are real markup before a script runs; nothing sounds until a click asks for it.
import * as React from 'react'

import { CommaSound } from '@/components/comma/sound'
import dayJson from '@/data/comma/day.json'
import { decodeTape, deviationsOf, tapeFile, WEB_TEST, type Deviation, type Recording } from '@/lib/comma/block'
import { BLOCK_MS, blockPlaying, DELAY_MS, hhmm, playedAt, readableFrom, retrySeconds, worldAt } from '@/lib/comma/clock'
import { GROUPS, hueOf } from '@/lib/comma/groups'
import { countryLink, entryLink } from '@/lib/comma/links'
import { hostOf, testsOf, type Test } from '@/lib/comma/ooni'
import { panOf } from '@/lib/comma/places'
import { balance, commaSeconds, dayOf, GAP_SECONDS, ruleOfDay, tideLevel } from '@/lib/comma/rule'
import { AUDIBLE_WEIGHT, bellLabelY, labelEnd, layoutFor, stagger, TAPE_LABEL_Y, TAPE_LINE_Y, visible, WIDE_SECONDS, weightTier, xOf, yOf } from '@/lib/comma/score'
import { categoryOf, listUrl, parseList, type Lists } from '@/lib/comma/testlists'
import { onMotionChange, reducedMotion } from '@/lib/dataviz/runtime'

export interface CommaWording {
  listen: string
  stop: string
  freeze: string
  unfreeze: string
  freezeHint: string
  status: {
    idle: string
    loading: string
    waiting: string
    /** {from} and {to} are replaced with the block playing, HH:MM UTC */
    live: string
    /** why a recording plays: OONI refused (429) or did not answer */
    refused: string
    unanswered: string
    /** {day}, {from}, {to}: the recorded block; {seconds}: how soon the piece asks OONI again */
    tape: string
    failed: string
    noRule: string
  }
  figureLabel: string
  legend: {
    heading: string
    blockpage: string
    suspicion: string
    asking: string
    tape: string
    tapeLabel: string
    /** {day} is replaced with the day the counts are from */
    day: string
    colours: string
    grey: string
  }
  feedHeading: string
  feedEmpty: string
  feedBlockpage: string
  feedSuspicion: string
  feedEntry: string
  counters: { tests: string; countries: string; blockpages: string; anomalies: string; heard: string }
}

export interface CommaProps {
  wording: CommaWording
  id: string
}

type Phase = 'idle' | 'loading' | 'playing' | 'failed'
type Source = 'live' | 'tape'

/** What a slot of the broadcast plays: a block from OONI, or a recorded block standing in for it. */
interface Loaded {
  source: Source
  /** the start of the block the deviations are from: the slot's own for a live block, the recorded one's for a tape */
  from: number
  /** the day a recording was read, as its file says; empty for a live block */
  recorded: string
  deviations: Deviation[]
}

/** One deviation at its moment of the slot it plays in. */
type Placed = Deviation & { at: number }
type Planned = Placed & { weight: number }

interface Plan {
  slot: number
  source: Source
  items: Planned[]
}

interface Mark {
  key: string
  /** audio-clock seconds */
  t: number
  slot: number
  g: number
  kind: 'bell' | 'comma'
  cc: string
  w: number
  seconds: number
  host: string
  entry: string | null
  site: string | null
}

/** From audio-clock second `t` on, the broadcast plays from this source. */
interface Turn {
  t: number
  source: Source
}

/** What the page says about the slot that is playing. */
interface Info {
  slot: number
  source: Source
  from: number
  recorded: string
  rows: number
  countries: number
  blockpages: number
  anomalies: number
}

const DAY = dayOf(dayJson)
const RULE = ruleOfDay(DAY)

const LIST_COUNTRIES = 25
const LIST_WAIT_MS = 4000
/** How far ahead of the wall clock sounds are put on the audio clock. A browser may wake a hidden tab only once a
 *  second or less; a quarter of a minute covers that, and a late block still takes over within it. */
const LOOKAHEAD_MS = 15_000
const TICK_MS = 500
/** The audio clock runs this far behind the broadcast, so a sound due "now" can still be placed. */
const LEAD_S = 0.4
/** If the audio clock and the wall clock part by more than this (a suspended tab, a slept laptop), the piece
 *  rejoins the broadcast where it is now, like a radio switched back on. */
const DRIFT_MS = 2000
/** How long the first block may take before the recording starts in its place. */
const FIRST_WAIT_MS = 2500
/** A recording is put in place this long before its slot begins, if no block from OONI has come. */
const TAPE_AHEAD_MS = LOOKAHEAD_MS + 10_000
const FEED = 8

/** The relay's standby names its reason (src/lib/comma/relay.ts). */
const standbyOf = (said: unknown): string => {
  const reason = typeof said === 'object' && said !== null ? (said as { standby?: unknown }).standby : null
  return typeof reason === 'string' ? reason : ''
}
const hueClass = (g: number): string => {
  const hue = hueOf(g)
  return hue === null ? 'cm-kn' : `cm-k${hue}`
}
const dayWords = (iso: string): string => {
  const ms = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(ms)) return iso
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(ms)
}

export default function Comma({ wording, id }: CommaProps) {
  const [phase, setPhase] = React.useState<Phase>('idle')
  const [now, setNow] = React.useState(0)
  const [frozen, setFrozen] = React.useState(false)
  const [marks, setMarks] = React.useState<Mark[]>([])
  const [turns, setTurns] = React.useState<Turn[]>([])
  const [info, setInfo] = React.useState<Info | null>(null)
  const [levels, setLevels] = React.useState<number[]>(GROUPS.map(() => 0))
  const [wait, setWait] = React.useState<{ refused: boolean; seconds: number }>({ refused: false, seconds: retrySeconds(1) })
  const [width, setWidth] = React.useState(1000)
  const figure = React.useRef<HTMLElement | null>(null)

  const sound = React.useRef<CommaSound | null>(null)
  const alive = React.useRef(false)
  const reduced = React.useRef(false)
  const frozenRef = React.useRef(false)
  const lists = React.useRef<Lists>({ global: null, byCountry: new Map() })
  const listsAsked = React.useRef(new Set<string>())
  /** the site's clock minus this device's, in milliseconds; the site's clock decides what plays when */
  const offset = React.useRef(0)
  /** what each slot plays, by the slot's start */
  const loaded = React.useRef(new Map<number, Loaded>())
  const tapes = React.useRef(new Map<number, Promise<Recording | null>>())
  const plan = React.useRef<Plan | null>(null)
  /** every moment of the world before this has been put on the audio clock */
  const until = React.useRef(0)
  /** which moment of the world stands at which second of the audio clock */
  const anchor = React.useRef({ audio: 0, world: 0 })
  /** what has sounded lately, for the limit per country */
  const log = React.useRef<{ cc: string; at: number }[]>([])
  const lastSource = React.useRef<Source | null>(null)
  const lastLevels = React.useRef<number[]>([])
  const started = React.useRef(0)
  /** per endpoint: a request in flight, when to ask next (this device's clock), refusals in a row */
  const asking = React.useRef({
    now: { busy: false, at: 0, inARow: 0 },
    next: { busy: false, at: 0, inARow: 0, jitter: 0 },
  })
  const ticker = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const serial = React.useRef(0)

  const siteNow = (): number => Date.now() + offset.current
  const audioAt = (world: number): number => anchor.current.audio + (world - anchor.current.world) / 1000

  /** The country lists a block needs, the most tested countries first; a slow list is waited for only so long. */
  const loadLists = async (tests: readonly Test[]): Promise<void> => {
    const counts = new Map<string, number>()
    for (const t of tests) counts.set(t.cc, (counts.get(t.cc) ?? 0) + 1)
    const wanted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, LIST_COUNTRIES).map(([cc]) => cc)
    const fresh = wanted.filter((cc) => !listsAsked.current.has(cc))
    fresh.forEach((cc) => listsAsked.current.add(cc))
    const loads = fresh.map(async (cc) => {
      try {
        const r = await fetch(listUrl(cc))
        if (r.ok) lists.current.byCountry.set(cc, parseList(await r.text()))
      } catch {
        // a country without its own list is read from the global one
      }
    })
    await Promise.race([Promise.all(loads), new Promise((done) => setTimeout(done, LIST_WAIT_MS))])
  }

  const loadGlobalList = async (): Promise<void> => {
    try {
      const r = await fetch(listUrl('global'))
      if (r.ok) lists.current.global = parseList(await r.text())
    } catch {
      // without the global list every page sounds in the last row until a country's own list arrives
    }
  }

  /** The recording of the hour a slot lies in, read once per hour of the day. */
  const tapeOf = (slot: number): Promise<Recording | null> => {
    const hour = new Date(slot).getUTCHours()
    let reading = tapes.current.get(hour)
    if (!reading) {
      reading = fetch(tapeFile(hour))
        .then((r) => (r.ok ? r.json() : null))
        .then((json: unknown) => decodeTape(json))
        .catch(() => null)
      tapes.current.set(hour, reading)
    }
    return reading
  }

  /** Put the recording in a slot's place, unless a block from OONI is already there. */
  const standIn = async (slot: number): Promise<void> => {
    const tape = await tapeOf(slot)
    if (!alive.current || !tape || loaded.current.has(slot)) return
    loaded.current.set(slot, { source: 'tape', from: tape.from, recorded: tape.recorded, deviations: tape.deviations })
  }

  /** Ask the site for the block that is playing ('now') or the one after it ('next'). An answer goes into its slot;
   *  a standby sets when to ask again. */
  const ask = async (which: 'now' | 'next'): Promise<void> => {
    const state = asking.current[which]
    if (state.busy || !alive.current) return
    state.busy = true
    const again = (seconds: number): void => {
      state.at = Date.now() + seconds * 1000
    }
    try {
      const response = await fetch(`/api/comma/${which}`, { cache: 'no-store' })
      const at = Number(response.headers.get('x-comma-now'))
      if (Number.isFinite(at) && at > 0) offset.current = at - Date.now()
      const block = Date.parse(response.headers.get('x-comma-block') ?? '')
      if (response.ok && Number.isFinite(block)) {
        const tests = testsOf(await response.json().catch(() => null), block, block + BLOCK_MS)
        await loadLists(tests)
        if (!alive.current) return
        loaded.current.set(block, { source: 'live', from: block, recorded: '', deviations: deviationsOf(tests, block, lists.current) })
        state.inARow = 0
        again(which === 'now' ? 20 : 5)
        return
      }
      const reason = standbyOf(await response.json().catch(() => null))
      if (reason === 'early') {
        again(Math.min(60, Math.max(1, Number(response.headers.get('retry-after')) || 5)))
        return
      }
      state.inARow += 1
      const seconds = retrySeconds(state.inARow)
      again(seconds)
      if (alive.current) setWait({ refused: reason === 'rate-limit', seconds })
    } catch {
      state.inARow += 1
      const seconds = retrySeconds(state.inARow)
      again(seconds)
      if (alive.current) setWait({ refused: false, seconds })
    } finally {
      state.busy = false
    }
  }

  /** What the slot now holds, balanced from `from` on: each country at most once every GAP_SECONDS, counting what
   *  has already sounded. Only web tests sound so far. */
  const planFor = (slot: number, have: Loaded, from: number): Plan => {
    const placed: Placed[] = have.deviations
      .filter((d) => d.test === WEB_TEST)
      .map((d) => ({ ...d, at: slot + d.s * 1000 }))
      .filter((d) => d.at >= from)
    const memory = new Map<string, number[]>()
    for (const heard of log.current) memory.set(heard.cc, [...(memory.get(heard.cc) ?? []), heard.at])
    return { slot, source: have.source, items: balance(placed, RULE, memory) }
  }

  const tick = (): void => {
    const s = sound.current
    if (!s || !alive.current) return
    const ctx = s.ctx
    if (ctx.state === 'suspended') void ctx.resume()
    const site = siteNow()
    const world = worldAt(site)

    // the audio clock follows the broadcast; after a pause it rejoins it where it is now
    const playing = anchor.current.world + (ctx.currentTime - anchor.current.audio) * 1000
    if (Math.abs(world - LEAD_S * 1000 - playing) > DRIFT_MS) {
      anchor.current = { audio: ctx.currentTime + LEAD_S, world }
      until.current = Math.max(until.current, world)
      plan.current = null
    }

    // what is needed: the block that plays, and in its last minute the next one
    const slot = blockPlaying(site)
    const next = slot + BLOCK_MS
    const have = loaded.current.get(slot)
    if ((!have || have.source === 'tape') && Date.now() >= asking.current.now.at) void ask('now')
    if (!have) void standIn(slot)
    const coming = loaded.current.get(next)
    if (coming?.source !== 'live' && site >= readableFrom(next) + asking.current.next.jitter && Date.now() >= asking.current.next.at) void ask('next')
    if (!coming && site >= playedAt(next) - TAPE_AHEAD_MS) void standIn(next)
    for (const old of loaded.current.keys()) if (old < slot - BLOCK_MS) loaded.current.delete(old)

    // the six tones: as loud as the world asked in this hour of the counted day
    const tide = GROUPS.map((_, g) => tideLevel(DAY, g, world))
    if (tide.some((level, g) => level !== lastLevels.current[g])) {
      tide.forEach((level, g) => s.asking(g, level, ctx.currentTime))
      lastLevels.current = tide
      setLevels(tide)
    }

    // the next seconds onto the audio clock
    const horizon = world + LOOKAHEAD_MS
    const placed: Mark[] = []
    const changes: Turn[] = []
    for (let guard = 0; until.current < horizon && guard < 4; guard++) {
      const at = Math.floor(until.current / BLOCK_MS) * BLOCK_MS
      const holds = loaded.current.get(at)
      if (!holds) {
        // nothing for this slot yet: what has passed is not played later
        until.current = Math.max(until.current, Math.min(world, at + BLOCK_MS))
        break
      }
      if (!plan.current || plan.current.slot !== at || plan.current.source !== holds.source) plan.current = planFor(at, holds, until.current)
      const end = Math.min(horizon, at + BLOCK_MS)
      if (lastSource.current !== holds.source) {
        changes.push({ t: audioAt(until.current), source: holds.source })
        lastSource.current = holds.source
      }
      for (const item of plan.current.items) {
        if (item.at < until.current || item.at >= end) continue
        const t = audioAt(item.at)
        if (t < ctx.currentTime + 0.02) continue
        const seconds = commaSeconds(item.weight)
        const pan = panOf(item.cc)
        if (item.state === 'confirmed') s.blockpage(item.group, t, pan)
        else s.suspicion(item.group, t, item.weight, seconds, pan)
        log.current.push({ cc: item.cc, at: item.at })
        serial.current += 1
        placed.push({
          key: `m${serial.current}`,
          t,
          slot: at,
          g: item.group,
          kind: item.state === 'confirmed' ? 'bell' : 'comma',
          cc: item.cc,
          w: item.weight,
          seconds,
          // only a news outlet is named; never a personal page, never porn or gambling
          host: item.site ? hostOf(item.site) : '',
          entry: entryLink(item.uid),
          site: item.site || null,
        })
      }
      until.current = end
    }
    log.current = log.current.filter((heard) => heard.at > world - GAP_SECONDS * 2000)
    const keep = ctx.currentTime - WIDE_SECONDS - 120
    if (placed.length) setMarks((m) => [...m.filter((k) => k.t + k.seconds > keep), ...placed])
    if (changes.length) setTurns((t) => [...t.filter((k, i, all) => k.t > keep || i === all.length - 1), ...changes])

    // what the page says about the slot that is playing
    const heard = loaded.current.get(slot)
    setInfo((was) => {
      if (!heard) return was
      if (was && was.slot === slot && was.source === heard.source) return was
      const web = heard.deviations.filter((d) => d.test === WEB_TEST)
      return {
        slot,
        source: heard.source,
        from: heard.from,
        recorded: heard.recorded,
        rows: web.length,
        countries: new Set(web.map((d) => d.cc)).size,
        blockpages: web.filter((d) => d.state === 'confirmed').length,
        anomalies: web.filter((d) => d.state === 'anomaly').length,
      }
    })
  }

  const stop = (): void => {
    alive.current = false
    clearInterval(ticker.current)
    sound.current?.close()
    sound.current = null
    loaded.current = new Map()
    plan.current = null
    log.current = []
    lastSource.current = null
    lastLevels.current = []
    asking.current = { now: { busy: false, at: 0, inARow: 0 }, next: { busy: false, at: 0, inARow: 0, jitter: 0 } }
    frozenRef.current = false
    setFrozen(false)
    setMarks([])
    setTurns([])
    setInfo(null)
    setLevels(GROUPS.map(() => 0))
    setPhase('idle')
  }

  const start = async (): Promise<void> => {
    if (alive.current) return
    alive.current = true
    setPhase('loading')
    // built inside the click, or a phone keeps the sound muted
    const s = new CommaSound()
    sound.current = s
    // listeners at one location do not all ask in the same second
    asking.current.next.jitter = Math.floor(Math.random() * 8000)
    // the block and the lists load while the sounds decode, not after them
    const first = ask('now')
    void loadGlobalList()
    void standIn(blockPlaying(siteNow()))
    try {
      await s.load()
    } catch {
      alive.current = false
      s.close()
      sound.current = null
      setPhase('failed')
      return
    }
    await Promise.race([first, new Promise((done) => setTimeout(done, FIRST_WAIT_MS))])
    if (!alive.current) return
    s.startTones()
    const world = worldAt(siteNow())
    anchor.current = { audio: s.ctx.currentTime + LEAD_S, world }
    until.current = world
    started.current = s.ctx.currentTime
    setNow(s.ctx.currentTime)
    setPhase('playing')
    clearInterval(ticker.current)
    ticker.current = setInterval(tick, TICK_MS)
    tick()
  }

  const toggleFreeze = (): void => {
    frozenRef.current = !frozenRef.current
    setFrozen(frozenRef.current)
    const s = sound.current
    if (!frozenRef.current && s) setNow(s.ctx.currentTime)
  }

  React.useEffect(() => {
    reduced.current = reducedMotion()
    return onMotionChange((r) => {
      reduced.current = r
    })
  }, [])

  React.useEffect(() => {
    const el = figure.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(() => setWidth(el.clientWidth || 1000))
    watch.observe(el)
    setWidth(el.clientWidth || 1000)
    return () => watch.disconnect()
  }, [])

  React.useEffect(
    () => () => {
      alive.current = false
      clearInterval(ticker.current)
      sound.current?.close()
    },
    [],
  )

  React.useEffect(() => {
    if (phase !== 'playing') return
    const draw = setInterval(() => {
      const s = sound.current
      // frozen, the score holds still so its marks can be followed; the sound plays on
      if (s && !frozenRef.current) setNow(s.ctx.currentTime)
    }, reduced.current ? 1000 : 200)
    return () => clearInterval(draw)
  }, [phase])

  const l = layoutFor(width)
  const visibleMarks = marks.filter((m) => visible(l, now, m.t, m.kind === 'comma' ? m.seconds : 0))
  const labelOf = (m: Mark): string => (m.host ? `${m.cc} · ${m.host}` : m.cc)
  const bellMarks = visibleMarks.filter((m) => m.kind === 'bell')
  const commaMarks = visibleMarks.filter((m) => m.kind === 'comma' && m.w >= 0.5 && !l.namesAbove)
  const steps = new Map<string, number>([
    ...stagger(bellMarks.map((m) => ({ row: m.g, x: xOf(l, now, m.t), chars: labelOf(m).length }))).map(
      (step, i) => [bellMarks[i]!.key, step] as [string, number],
    ),
    ...stagger(commaMarks.map((m) => ({ row: m.g, x: xOf(l, now, m.t), chars: m.cc.length }))).map(
      (step, i) => [commaMarks[i]!.key, step] as [string, number],
    ),
  ])
  const feed = marks
    .filter((m) => m.t <= now && (m.kind === 'bell' || m.w >= AUDIBLE_WEIGHT))
    .slice(-FEED)
    .reverse()
  const listening = phase === 'loading' || phase === 'playing'
  /** the stretches of the visible score that play from the recording */
  const taped = turns
    .map((turn, i) => ({ ...turn, to: turns[i + 1]?.t ?? now }))
    .filter((turn) => turn.source === 'tape' && turn.t <= now && turn.to >= now - l.seconds)
    .map((turn) => ({ key: turn.t.toFixed(2), x0: Math.max(l.left, xOf(l, now, turn.t)), x1: Math.min(l.right, xOf(l, now, Math.min(turn.to, now))) }))
  const sounding = [...turns].reverse().find((turn) => turn.t <= now)?.source ?? null
  const heard = info
    ? [...marks
        .filter((m) => m.slot === info.slot && m.t <= now && (m.kind === 'bell' || m.w >= AUDIBLE_WEIGHT))
        .reduce((tally, m) => tally.set(m.cc, (tally.get(m.cc) ?? 0) + 1), new Map<string, number>())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    : []

  const statusText =
    phase !== 'playing'
      ? wording.status[phase]
      : !info || !sounding
        ? wording.status.waiting
        : sounding === 'live' && info.source === 'live'
          ? wording.status.live.replace('{from}', hhmm(info.from)).replace('{to}', hhmm(info.from + BLOCK_MS))
          : info.source === 'tape'
            ? `${wait.refused ? wording.status.refused : wording.status.unanswered} ${wording.status.tape
                .replace('{day}', dayWords(new Date(info.from).toISOString()))
                .replace('{from}', hhmm(info.from))
                .replace('{to}', hhmm(info.from + BLOCK_MS))
                .replace('{seconds}', String(wait.seconds))}`
            : wording.status.waiting
  const note = RULE ? '' : wording.status.noRule
  const bandFrom = Math.max(l.left, xOf(l, now, started.current))

  /** A mark is a link only while the score holds still: a link that slides away under the pointer is no link. */
  const linked = (m: Mark, body: React.ReactNode): React.ReactNode =>
    frozen && m.entry ? (
      <a href={m.entry} target="_blank" rel="noopener noreferrer" className="cm-mark-link">
        <title>{`${m.cc} · ${GROUPS[m.g]?.name ?? ''} · ${wording.feedEntry}`}</title>
        {body}
      </a>
    ) : (
      body
    )

  return (
    <div className="cm-room" id={id}>
      <div className="cm-controls">
        <button type="button" className="cm-button" aria-pressed={listening} onClick={() => (listening ? stop() : void start())}>
          {listening ? wording.stop : wording.listen}
        </button>
        <button type="button" className="cm-button cm-button-quiet" aria-pressed={frozen} disabled={!listening} onClick={toggleFreeze}>
          {frozen ? wording.unfreeze : wording.freeze}
        </button>
        <p className="cm-status" role="status" aria-live="polite">
          {statusText}
          {note ? <span className="cm-note"> {note}</span> : null}
          {frozen ? <span className="cm-note"> {wording.freezeHint}</span> : null}
        </p>
      </div>

      <figure className="cm-figure" ref={figure}>
        <svg viewBox={`0 0 ${l.width} ${l.height}`} className="cm-svg" role="img" aria-label={wording.figureLabel}>
          <title>{wording.figureLabel}</title>
          {GROUPS.map((g, i) => {
            const nameX = l.namesAbove ? l.left : 14
            const nameY = l.namesAbove ? yOf(l, i) - 14 : yOf(l, i) + 4
            return (
              <g key={g.id}>
                <circle cx={nameX + 4} cy={nameY - 4} r={4} className={`cm-dot ${hueClass(i)}`} />
                <text x={nameX + 14} y={nameY} className="cm-row-name">
                  {g.name}
                </text>
                <line x1={l.left} x2={l.right} y1={yOf(l, i)} y2={yOf(l, i)} className="cm-row-line" />
              </g>
            )
          })}
          {phase === 'playing'
            ? levels.map((level, g) => {
                const h = 1 + 9 * level
                return <rect key={`ask-${g}`} x={bandFrom} y={yOf(l, g) - h / 2} width={Math.max(0, l.right - bandFrom)} height={h} className="cm-ask" />
              })
            : null}
          {taped.map((span) => (
            <g key={`tape-${span.key}`} className="cm-tape">
              <line x1={span.x0} x2={Math.max(span.x0 + 2, span.x1)} y1={TAPE_LINE_Y} y2={TAPE_LINE_Y} />
              {span.x1 - span.x0 > 80 ? (
                <text x={span.x0 + 2} y={TAPE_LABEL_Y} className="cm-tape-label">
                  {wording.legend.tapeLabel}
                </text>
              ) : null}
            </g>
          ))}
          {visibleMarks.map((m) => {
            const x0 = Math.max(l.left, xOf(l, now, m.t))
            const y = yOf(l, m.g)
            if (m.kind === 'comma') {
              const x1 = Math.min(l.right, xOf(l, now, m.t + m.seconds))
              const step = steps.get(m.key) ?? 0
              return (
                <g key={m.key} className={`cm-sus cm-w${weightTier(m.w)} ${hueClass(m.g)}`}>
                  {linked(
                    m,
                    <>
                      <line x1={x0} x2={Math.max(x0 + 2, x1)} y1={y + 11} y2={y + 11} />
                      {m.w >= 0.5 && !l.namesAbove ? (
                        <text x={x0} y={y + 23 + step * 11} className="cm-cc">
                          {m.cc}
                        </text>
                      ) : null}
                    </>,
                  )}
                </g>
              )
            }
            const label = labelOf(m)
            const turn = labelEnd(l, x0, label.length)
            return (
              <g key={m.key} className={`cm-bell ${hueClass(m.g)}`}>
                {linked(
                  m,
                  <>
                    <polygon points={`${x0},${y - 8} ${x0 + 6},${y} ${x0},${y + 8} ${x0 - 6},${y}`} />
                    <text x={turn ? x0 - 8 : x0 + 8} y={bellLabelY(l, y, steps.get(m.key) ?? 0)} textAnchor={turn ? 'end' : 'start'} className="cm-cc">
                      {label}
                    </text>
                  </>,
                )}
              </g>
            )
          })}
          <line x1={l.right} x2={l.right} y1={TAPE_LINE_Y + 6} y2={l.height - 4} className="cm-now" />
        </svg>
      </figure>

      <section className="cm-legend" aria-labelledby={`${id}-legend`}>
        <h3 className="cm-panel-title" id={`${id}-legend`}>
          {wording.legend.heading}
        </h3>
        <ul className="cm-legend-list">
          <li>
            <svg viewBox="0 0 24 16" className="cm-key" aria-hidden="true">
              <polygon points="12,1 18,8 12,15 6,8" className="cm-key-bell" />
            </svg>
            {wording.legend.blockpage}
          </li>
          <li>
            <svg viewBox="0 0 24 16" className="cm-key" aria-hidden="true">
              <line x1="2" x2="22" y1="8" y2="8" className="cm-key-sus" />
            </svg>
            {wording.legend.suspicion}
          </li>
          <li>
            <svg viewBox="0 0 24 16" className="cm-key" aria-hidden="true">
              <rect x="2" y="4" width="9" height="8" className="cm-ask" />
              <rect x="13" y="2" width="9" height="12" className="cm-ask" />
            </svg>
            {wording.legend.asking}
          </li>
          <li>
            <svg viewBox="0 0 24 16" className="cm-key" aria-hidden="true">
              <line x1="2" x2="22" y1="8" y2="8" className="cm-key-tape" />
            </svg>
            {wording.legend.tape}
          </li>
        </ul>
        {DAY ? <p className="cm-legend-note">{wording.legend.day.replace('{day}', dayWords(DAY.day))}</p> : null}
        <p className="cm-legend-note">{wording.legend.colours}</p>
        <ul className="cm-legend-list cm-legend-kinds">
          {GROUPS.map((g, i) => (
            <li key={g.id}>
              <svg viewBox="0 0 12 12" className="cm-key-dot" aria-hidden="true">
                <circle cx="6" cy="6" r="5" className={`cm-dot ${hueClass(i)}`} />
              </svg>
              {g.name}
            </li>
          ))}
        </ul>
        <p className="cm-legend-note">{wording.legend.grey}</p>
      </section>

      <div className="cm-panels">
        <section className="cm-panel" aria-label={wording.counters.tests}>
          <dl className="cm-counters">
            <div>
              <dt>{wording.counters.tests}</dt>
              <dd>{info ? info.rows : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.countries}</dt>
              <dd>{info ? info.countries : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.blockpages}</dt>
              <dd>{info ? info.blockpages : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.anomalies}</dt>
              <dd>{info ? info.anomalies : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.heard}</dt>
              <dd>
                {heard.length
                  ? heard.map(([cc, n], i) => {
                      const href = countryLink(cc)
                      return (
                        <React.Fragment key={cc}>
                          {i ? ', ' : ''}
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              {cc}
                            </a>
                          ) : (
                            cc
                          )}{' '}
                          {n}
                        </React.Fragment>
                      )
                    })
                  : '–'}
              </dd>
            </div>
          </dl>
        </section>
        <section className="cm-panel" aria-labelledby={`${id}-feed`}>
          <h3 className="cm-panel-title" id={`${id}-feed`}>
            {wording.feedHeading}
          </h3>
          {feed.length ? (
            <ol className="cm-feed">
              {feed.map((m) => {
                const country = countryLink(m.cc)
                return (
                  <li key={m.key}>
                    <svg viewBox="0 0 12 12" className="cm-key-dot" aria-hidden="true">
                      {m.kind === 'bell' ? (
                        <polygon points="6,1 11,6 6,11 1,6" className={`cm-dot ${hueClass(m.g)}`} />
                      ) : (
                        <line x1="1" x2="11" y1="6" y2="6" className={`cm-feed-sus ${hueClass(m.g)}`} />
                      )}
                    </svg>
                    {country ? (
                      <a href={country} target="_blank" rel="noopener noreferrer" className="cm-feed-cc">
                        {m.cc}
                      </a>
                    ) : (
                      <span className="cm-feed-cc">{m.cc}</span>
                    )}{' '}
                    {m.kind === 'bell' ? wording.feedBlockpage : wording.feedSuspicion} · {GROUPS[m.g]?.name}
                    {m.site ? (
                      <>
                        {' · '}
                        <a href={m.site} target="_blank" rel="nofollow noopener noreferrer" className="cm-feed-host">
                          {m.host}
                        </a>
                      </>
                    ) : null}
                    {m.entry ? (
                      <>
                        {' · '}
                        <a href={m.entry} target="_blank" rel="noopener noreferrer">
                          {wording.feedEntry}
                        </a>
                      </>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="cm-feed-empty">{wording.feedEmpty}</p>
          )}
        </section>
      </div>
    </div>
  )
}
