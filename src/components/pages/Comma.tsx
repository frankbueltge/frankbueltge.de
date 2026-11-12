// src/components/pages/Comma.tsx — the live score and sound of Comma (/comma, 2026-11-13).
//
// One minute of the world's censorship tests at a time: the site hands over the newest minute OONI holds (about four
// minutes old, functions/api/comma/now.js), this island sorts its tests into the six kinds of page with Citizen Lab's
// lists, applies the rules of src/lib/comma/rule.ts and puts every sound on the audio clock at once, so a hidden tab
// keeps playing. The score draws what has sounded, the newest on the right. Every number and every decision comes from
// src/lib/comma/; this file schedules and draws. The server render is the floor: the six rows, the button and the
// empty score are real markup before any script runs; nothing sounds until a click asks for it.
import * as React from 'react'

import { CommaSound } from '@/components/comma/sound'
import { GROUPS, groupOf } from '@/lib/comma/groups'
import { hostOf, testsOf, type Test } from '@/lib/comma/ooni'
import { panOf } from '@/lib/comma/places'
import { MINUTE_MS } from '@/lib/comma/relay'
import { askingLevel, balance, commaSeconds, prune, ruleOf, type Rule } from '@/lib/comma/rule'
import { categoryOf, listUrl, parseList, type Lists } from '@/lib/comma/testlists'
import { onMotionChange, reducedMotion } from '@/lib/dataviz/runtime'

export interface CommaWording {
  listen: string
  stop: string
  status: {
    idle: string
    loading: string
    /** {minute} is replaced with the minute playing, HH:MM UTC */
    playing: string
    waiting: string
    standby: string
    failed: string
    noRule: string
  }
  figureLabel: string
  feedHeading: string
  feedEmpty: string
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

const WINDOW = 45
const LEFT = 196
const RIGHT = 988
const TOP = 34
const ROW = 46
const HEIGHT = TOP + ROW * GROUPS.length + 6
const LIST_COUNTRIES = 25
const LIST_WAIT_MS = 4000
const LEAD = 1.5

const xOf = (now: number, t: number): number => RIGHT - ((now - t) / WINDOW) * (RIGHT - LEFT)
const yOf = (g: number): number => TOP + g * ROW
const tier = (w: number): number => (w >= 0.75 ? 4 : w >= 0.5 ? 3 : w >= 0.25 ? 2 : 1)
const hhmm = (ms: number): string => new Date(ms).toISOString().slice(11, 16)
const untilNextMinute = (): number => MINUTE_MS - (Date.now() % MINUTE_MS) + 3000

export default function Comma({ wording, id }: CommaProps) {
  const [phase, setPhase] = React.useState<Phase>('idle')
  const [note, setNote] = React.useState('')
  const [now, setNow] = React.useState(0)
  const [marks, setMarks] = React.useState<Mark[]>([])
  const [bands, setBands] = React.useState<Band[]>([])
  const [minutes, setMinutes] = React.useState<Minute[]>([])

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
      heard.set(m.cc, (heard.get(m.cc) ?? 0) + 1)
      return {
        key: `${minute}-${i}`,
        t: at,
        g,
        kind: m.state === 'confirmed' ? 'bell' : 'comma',
        cc: m.cc,
        w: m.weight,
        seconds,
        // only a news outlet is named; never a personal page, never porn or gambling
        host: m.state === 'confirmed' && category === 'NEWS' ? hostOf(m.url) : '',
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
    const keep = ctx.currentTime - WINDOW - 5
    setMarks((m) => [...m.filter((k) => k.t + k.seconds > keep), ...placed])
    setBands((b) => [...b.filter((k) => k.t > keep), ...fresh])
    setMinutes((ms) => [...ms.filter((k) => k.t0 + 60 > ctx.currentTime - 1), summary])
  }

  const poll = async (): Promise<void> => {
    if (!alive.current || !sound.current) return
    let response: Response
    try {
      response = await fetch('/api/comma/now', { cache: 'no-store' })
    } catch {
      setPhase('standby')
      later(() => void poll(), 60_000)
      return
    }
    if (!alive.current) return
    const minute = Date.parse(response.headers.get('x-comma-minute') ?? '')
    if (!response.ok || !Number.isFinite(minute)) {
      setPhase('standby')
      later(() => void poll(), 60_000)
      return
    }
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
  }

  const stop = (): void => {
    alive.current = false
    clearTimeout(timer.current)
    sound.current?.close()
    sound.current = null
    last.current = null
    memory.current = new Map()
    tail.current = GROUPS.map(() => [])
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
    try {
      await s.load()
    } catch {
      alive.current = false
      s.close()
      sound.current = null
      setPhase('failed')
      return
    }
    try {
      const r = await fetch('/api/comma/rule')
      rule.current = r.ok ? ruleOf(await r.json()) : null
    } catch {
      rule.current = null
    }
    setNote(rule.current ? '' : wording.status.noRule)
    try {
      const r = await fetch(listUrl('global'))
      if (r.ok) lists.current.global = parseList(await r.text())
    } catch {
      // without the global list every page sounds in the last row until a country's own list arrives
    }
    if (!alive.current) return
    s.startTones()
    setPhase('waiting')
    void poll()
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
      if (s) setNow(s.ctx.currentTime)
    }, reduced.current ? 1000 : 200)
    return () => clearInterval(tick)
  }, [phase])

  React.useEffect(() => () => {
    alive.current = false
    clearTimeout(timer.current)
    sound.current?.close()
  }, [])

  const current = minutes.find((m) => m.t0 <= now && now < m.t0 + 60)
  const visibleMarks = marks.filter((m) => m.t <= now && m.t + (m.kind === 'comma' ? m.seconds : 0) >= now - WINDOW)
  const visibleBands = bands.filter((b) => b.t <= now && b.t >= now - WINDOW)
  const bells = marks.filter((m) => m.kind === 'bell' && m.t <= now).slice(-6).reverse()
  const listening = phase === 'loading' || phase === 'waiting' || phase === 'playing' || phase === 'standby'

  const statusText =
    phase === 'playing' && current
      ? wording.status.playing.replace('{minute}', hhmm(current.start))
      : phase === 'playing'
        ? wording.status.waiting
        : wording.status[phase]

  return (
    <div className="cm-room" id={id}>
      <div className="cm-controls">
        <button type="button" className="cm-button" aria-pressed={listening} onClick={() => (listening ? stop() : void start())}>
          {listening ? wording.stop : wording.listen}
        </button>
        <p className="cm-status" role="status" aria-live="polite">
          {statusText}
          {note ? <span className="cm-note"> {note}</span> : null}
        </p>
      </div>

      <figure className="cm-figure">
        <svg viewBox={`0 0 1000 ${HEIGHT}`} className="cm-svg" role="img" aria-label={wording.figureLabel}>
          <title>{wording.figureLabel}</title>
          {GROUPS.map((g, i) => (
            <g key={g.id}>
              <text x={14} y={yOf(i) + 4} className="cm-row-name">
                {g.name}
              </text>
              <line x1={LEFT} x2={RIGHT} y1={yOf(i)} y2={yOf(i)} className="cm-row-line" />
            </g>
          ))}
          {visibleBands.map((b) =>
            b.levels.map((level, g) => {
              const h = 1 + 16 * level
              return (
                <rect
                  key={`${b.t.toFixed(2)}-${g}`}
                  x={xOf(now, b.t)}
                  y={yOf(g) - h / 2}
                  width={(RIGHT - LEFT) / WINDOW - 1}
                  height={h}
                  className="cm-ask"
                />
              )
            }),
          )}
          {visibleMarks.map((m) => {
            const x0 = Math.max(LEFT, xOf(now, m.t))
            const y = yOf(m.g)
            if (m.kind === 'comma') {
              const x1 = Math.min(RIGHT, xOf(now, m.t + m.seconds))
              return (
                <g key={m.key} className={`cm-sus cm-w${tier(m.w)}`}>
                  <line x1={x0} x2={Math.max(x0 + 2, x1)} y1={y + 11} y2={y + 11} />
                  {m.w >= 0.5 ? (
                    <text x={x0} y={y + 23} className="cm-cc">
                      {m.cc}
                    </text>
                  ) : null}
                </g>
              )
            }
            return (
              <g key={m.key} className="cm-bell">
                <polygon points={`${x0},${y - 8} ${x0 + 6},${y} ${x0},${y + 8} ${x0 - 6},${y}`} />
                <text x={x0 + 8} y={y - 9} className="cm-cc">
                  {m.host ? `${m.cc} · ${m.host}` : m.cc}
                </text>
              </g>
            )
          })}
          <line x1={RIGHT} x2={RIGHT} y1={TOP - 22} y2={HEIGHT - 4} className="cm-now" />
        </svg>
      </figure>

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
              <dd>{current && current.heard.length ? current.heard.map(([cc, n]) => `${cc} ${n}`).join(', ') : '–'}</dd>
            </div>
          </dl>
        </section>
        <section className="cm-panel" aria-labelledby={`${id}-feed`}>
          <h3 className="cm-panel-title" id={`${id}-feed`}>
            {wording.feedHeading}
          </h3>
          {bells.length ? (
            <ol className="cm-feed">
              {bells.map((b) => (
                <li key={b.key}>
                  <span className="cm-feed-cc">{b.cc}</span> {GROUPS[b.g]?.name}
                  {b.host ? <span className="cm-feed-host"> · {b.host}</span> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="cm-feed-empty">{wording.feedEmpty}</p>
          )}
        </section>
      </div>
    </div>
  )
}
