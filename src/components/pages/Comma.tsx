// src/components/pages/Comma.tsx — the live score and sound of Comma (/comma, 2026-11-13).
//
// One minute of the world's censorship tests at a time: the site hands over the newest minute OONI holds (about four
// minutes old, functions/api/comma/now.js), this island sorts its tests into the six kinds of page with Citizen Lab's
// lists, applies the rules of src/lib/comma/rule.ts and puts every sound on the audio clock at once, so a hidden tab
// keeps playing. The score draws what has sounded, the newest on the right; the list beside it holds the last events
// still, with their links. Every number, colour slot and link comes from src/lib/comma/; this file schedules and
// draws. The server render is the floor: the rows, the legend, the button and the empty score are real markup before a
// script runs; nothing sounds until a click asks for it.
import * as React from 'react'

import { CommaSound } from '@/components/comma/sound'
import { GROUPS, groupOf, hueOf } from '@/lib/comma/groups'
import { countryLink, entryLink, siteLink } from '@/lib/comma/links'
import { hostOf, testsOf, type Test } from '@/lib/comma/ooni'
import { panOf } from '@/lib/comma/places'
import { MINUTE_MS, retrySeconds } from '@/lib/comma/relay'
import { askingLevel, balance, commaSeconds, prune, ruleOf, type Rule } from '@/lib/comma/rule'
import { AUDIBLE_WEIGHT, bandWidth, bellLabelY, labelEnd, layoutFor, stagger, visible, WIDE_SECONDS, weightTier, xOf, yOf } from '@/lib/comma/score'
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
    /** {minute} is replaced with the minute playing, HH:MM UTC */
    playing: string
    waiting: string
    /** {seconds} is replaced with how soon the piece asks again */
    standby: string
    /** the standby when OONI refuses (429); {seconds} as above */
    refused: string
    failed: string
    noRule: string
  }
  figureLabel: string
  legend: {
    heading: string
    blockpage: string
    suspicion: string
    asking: string
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

type Phase = 'idle' | 'loading' | 'waiting' | 'playing' | 'standby' | 'failed'

interface Mark {
  key: string
  /** audio-clock seconds */
  t: number
  g: number
  kind: 'bell' | 'comma'
  cc: string
  w: number
  seconds: number
  host: string
  entry: string | null
  site: string | null
}

interface Band {
  t: number
  levels: number[]
}

interface Minute {
  start: number
  t0: number
  tests: number
  countries: number
  blockpages: number
  anomalies: number
  heard: [string, number][]
}

const LIST_COUNTRIES = 25
const LIST_WAIT_MS = 4000
const LEAD = 1.5
const FEED = 8

const hhmm = (ms: number): string => new Date(ms).toISOString().slice(11, 16)
const untilNextMinute = (): number => MINUTE_MS - (Date.now() % MINUTE_MS) + 3000
/** The relay's standby names its reason (src/lib/comma/relay.ts); 'rate-limit' means OONI refused the question. */
const isRefusal = (said: unknown): boolean =>
  typeof said === 'object' && said !== null && (said as { standby?: unknown }).standby === 'rate-limit'
const hueClass = (g: number): string => {
  const hue = hueOf(g)
  return hue === null ? 'cm-kn' : `cm-k${hue}`
}

export default function Comma({ wording, id }: CommaProps) {
  const [phase, setPhase] = React.useState<Phase>('idle')
  const [note, setNote] = React.useState('')
  const [now, setNow] = React.useState(0)
  const [frozen, setFrozen] = React.useState(false)
  const [marks, setMarks] = React.useState<Mark[]>([])
  const [bands, setBands] = React.useState<Band[]>([])
  const [minutes, setMinutes] = React.useState<Minute[]>([])
  const [width, setWidth] = React.useState(1000)
  const [wait, setWait] = React.useState<{ refused: boolean; seconds: number }>({ refused: false, seconds: retrySeconds(1) })
  const figure = React.useRef<HTMLElement | null>(null)

  const sound = React.useRef<CommaSound | null>(null)
  const rule = React.useRef<Rule | null>(null)
  const lists = React.useRef<Lists>({ global: null, byCountry: new Map() })
  const asked = React.useRef(new Set<string>())
  const memory = React.useRef(new Map<string, number[]>())
  const tail = React.useRef<number[][]>(GROUPS.map(() => []))
  const last = React.useRef<{ minute: number; next: number } | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const alive = React.useRef(false)
  const reduced = React.useRef(false)
  const frozenRef = React.useRef(false)
  const inARow = React.useRef(0)
  const ruleAskedAt = React.useRef(0)

  const later = (fn: () => void, ms: number): void => {
    clearTimeout(timer.current)
    timer.current = setTimeout(fn, ms)
  }

  /** The country lists a minute needs, the most tested countries first; a slow list is waited for only so long. */
  const loadLists = async (tests: readonly Test[]): Promise<void> => {
    const counts = new Map<string, number>()
    for (const t of tests) counts.set(t.cc, (counts.get(t.cc) ?? 0) + 1)
    const wanted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, LIST_COUNTRIES).map(([cc]) => cc)
    const fresh = wanted.filter((cc) => !asked.current.has(cc))
    fresh.forEach((cc) => asked.current.add(cc))
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

  const schedule = (minute: number, tests: readonly Test[]): void => {
    const s = sound.current
    if (!s) return
    const ctx = s.ctx
    const previous = last.current
    const contiguous = previous !== null && minute === previous.minute + MINUTE_MS && previous.next > ctx.currentTime + 0.2
    const t0 = contiguous ? previous.next : ctx.currentTime + LEAD
    if (!contiguous) tail.current = GROUPS.map(() => [])
    last.current = { minute, next: t0 + MINUTE_MS / 1000 }
    const toClock = (at: number): number => t0 + (at - minute) / 1000
    const kind = (t: { url: string; cc: string }): string | null => categoryOf(t.url, t.cc, lists.current)

    const times = GROUPS.map((_, g) => [...(tail.current[g] ?? [])])
    for (const t of tests) times[groupOf(kind(t))]!.push(t.at)
    times.forEach((ts) => ts.sort((a, b) => a - b))
    const fresh: Band[] = []
    for (let k = 0; k < MINUTE_MS / 250; k++) {
      const tau = minute + k * 250
      const levels = times.map((ts) => askingLevel(ts, tau))
      levels.forEach((level, g) => s.asking(g, level, toClock(tau)))
      if (k % 4 === 0) fresh.push({ t: toClock(tau), levels })
    }
    tail.current = times.map((ts) => ts.filter((at) => at > minute + MINUTE_MS - 5000))

    const sounded = balance(tests, rule.current, memory.current)
    prune(memory.current, minute + MINUTE_MS)
    const heard = new Map<string, number>()
    const placed: Mark[] = sounded.map((m, i) => {
      const category = kind(m)
      const g = groupOf(category)
      const at = toClock(m.at)
      const seconds = commaSeconds(m.weight)
      if (m.state === 'confirmed') s.blockpage(g, at, panOf(m.cc))
      else s.suspicion(g, at, m.weight, seconds, panOf(m.cc))
      // the tally names what can be heard: every blockpage, and suspicion above a whisper
      if (m.state === 'confirmed' || m.weight >= AUDIBLE_WEIGHT) heard.set(m.cc, (heard.get(m.cc) ?? 0) + 1)
      const site = siteLink(m.url, category)
      return {
        key: `${minute}-${i}`,
        t: at,
        g,
        kind: m.state === 'confirmed' ? 'bell' : 'comma',
        cc: m.cc,
        w: m.weight,
        seconds,
        // only a news outlet is named; never a personal page, never porn or gambling
        host: site ? hostOf(m.url) : '',
        entry: entryLink(m.uid),
        site,
      }
    })
    const summary: Minute = {
      start: minute,
      t0,
      tests: tests.length,
      countries: new Set(tests.map((t) => t.cc)).size,
      blockpages: tests.filter((t) => t.state === 'confirmed').length,
      anomalies: tests.filter((t) => t.state === 'anomaly').length,
      heard: [...heard.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    }
    const keep = ctx.currentTime - WIDE_SECONDS - 120
    setMarks((m) => [...m.filter((k) => k.t + k.seconds > keep), ...placed])
    setBands((b) => [...b.filter((k) => k.t > keep), ...fresh])
    setMinutes((ms) => [...ms.filter((k) => k.t0 + 60 > ctx.currentTime - 1), summary])
  }

  /** Yesterday's counts. A refusal is not kept anywhere (src/lib/comma/relay.ts), so while they are missing they
   *  are asked for again once a minute, and suspicion sounds from the minute they arrive. */
  const loadRule = async (): Promise<void> => {
    ruleAskedAt.current = Date.now()
    try {
      const r = await fetch('/api/comma/rule')
      rule.current = r.ok ? ruleOf(await r.json()) : null
    } catch {
      rule.current = null
    }
    if (alive.current) setNote(rule.current ? '' : wording.status.noRule)
  }

  const loadGlobalList = async (): Promise<void> => {
    try {
      const r = await fetch(listUrl('global'))
      if (r.ok) lists.current.global = parseList(await r.text())
    } catch {
      // without the global list every page sounds in the last row until a country's own list arrives
    }
  }

  /** A standby: say why, and ask again soon, then every half minute (`retrySeconds`). */
  const waitAgain = (refused: boolean): void => {
    inARow.current += 1
    const seconds = retrySeconds(inARow.current)
    setWait({ refused, seconds })
    setPhase('standby')
    later(() => void poll(), seconds * 1000)
  }

  const poll = async (): Promise<void> => {
    if (!alive.current || !sound.current) return
    let response: Response
    try {
      response = await fetch('/api/comma/now', { cache: 'no-store' })
    } catch {
      if (alive.current) waitAgain(false)
      return
    }
    if (!alive.current) return
    const minute = Date.parse(response.headers.get('x-comma-minute') ?? '')
    if (!response.ok || !Number.isFinite(minute)) {
      const said: unknown = await response.json().catch(() => null)
      if (alive.current) waitAgain(isRefusal(said))
      return
    }
    inARow.current = 0
    if (last.current && minute <= last.current.minute) {
      later(() => void poll(), 10_000)
      return
    }
    const json: unknown = await response.json().catch(() => null)
    const tests = testsOf(json, minute, minute + MINUTE_MS)
    await loadLists(tests)
    if (!alive.current) return
    schedule(minute, tests)
    setPhase('playing')
    later(() => void poll(), untilNextMinute())
    if (!rule.current && Date.now() - ruleAskedAt.current >= MINUTE_MS) void loadRule()
  }

  const stop = (): void => {
    alive.current = false
    clearTimeout(timer.current)
    sound.current?.close()
    sound.current = null
    last.current = null
    memory.current = new Map()
    tail.current = GROUPS.map(() => [])
    frozenRef.current = false
    inARow.current = 0
    setFrozen(false)
    setMarks([])
    setBands([])
    setMinutes([])
    setNote('')
    setPhase('idle')
  }

  const start = async (): Promise<void> => {
    if (alive.current) return
    alive.current = true
    setPhase('loading')
    // built inside the click, or a phone keeps the sound muted
    const s = new CommaSound()
    sound.current = s
    // the counts and the global list load while the sounds decode, not after them
    const reading = Promise.all([loadRule(), loadGlobalList()])
    try {
      await s.load()
    } catch {
      alive.current = false
      s.close()
      sound.current = null
      setPhase('failed')
      return
    }
    await reading
    if (!alive.current) return
    s.startTones()
    setPhase('waiting')
    void poll()
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
    if (phase !== 'playing' && phase !== 'waiting' && phase !== 'standby') return
    const tick = setInterval(() => {
      const s = sound.current
      // frozen, the score holds still so its marks can be followed; the sound plays on
      if (s && !frozenRef.current) setNow(s.ctx.currentTime)
    }, reduced.current ? 1000 : 200)
    return () => clearInterval(tick)
  }, [phase])

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
      clearTimeout(timer.current)
      sound.current?.close()
    },
    [],
  )

  const l = layoutFor(width)
  const current = minutes.find((m) => m.t0 <= now && now < m.t0 + 60)
  const visibleMarks = marks.filter((m) => visible(l, now, m.t, m.kind === 'comma' ? m.seconds : 0))
  const visibleBands = bands.filter((b) => visible(l, now, b.t))
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
  const listening = phase === 'loading' || phase === 'waiting' || phase === 'playing' || phase === 'standby'

  const statusText =
    phase === 'playing' && current
      ? wording.status.playing.replace('{minute}', hhmm(current.start))
      : phase === 'playing'
        ? wording.status.waiting
        : phase === 'standby'
          ? (wait.refused ? wording.status.refused : wording.status.standby).replace('{seconds}', String(wait.seconds))
          : wording.status[phase]

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
          {visibleBands.map((b) =>
            b.levels.map((level, g) => {
              const h = 1 + 16 * level
              return (
                <rect
                  key={`${b.t.toFixed(2)}-${g}`}
                  x={xOf(l, now, b.t)}
                  y={yOf(l, g) - h / 2}
                  width={bandWidth(l)}
                  height={h}
                  className="cm-ask"
                />
              )
            }),
          )}
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
          <line x1={l.right} x2={l.right} y1={l.top - 22} y2={l.height - 4} className="cm-now" />
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
        </ul>
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
              <dd>{current ? current.tests : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.countries}</dt>
              <dd>{current ? current.countries : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.blockpages}</dt>
              <dd>{current ? current.blockpages : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.anomalies}</dt>
              <dd>{current ? current.anomalies : '–'}</dd>
            </div>
            <div>
              <dt>{wording.counters.heard}</dt>
              <dd>
                {current && current.heard.length
                  ? current.heard.map(([cc, n], i) => {
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
