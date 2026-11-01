/** Ducking — the desk (2026-11-01; docs/design/2026-11-01-ducking.md).
 *
 *  Every level comes from src/lib/ducking/mix.ts, every coordinate from figure.ts; this file mounts
 *  them, moves them and answers the hand. The server render already stands at the record's newest
 *  day, as plain SVG, so the page says what it says before a script runs.
 *
 *  Nothing is latched. A fader stays up only while something holds it, and that is the work: there
 *  is deliberately no way to leave a matter loud and walk off. A keyboard holds for as long as the
 *  key keeps being pressed, and a moment longer. No style attribute anywhere (CSP): caps move by SVG
 *  attribute, and the screen by setVars. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { reducedMotion, setVars } from '@/lib/dataviz/runtime'
import { capY, FADER, inkOf, INK_FLOOR, lanePath, positionAt, SCALE, scaleY } from '@/lib/ducking/figure'
import { fmtShare, shareAt, solve, standing, toGain, toPosition, toShare } from '@/lib/ducking/mix'
import { cueAt, cueEnvelope, cueOrNext, placeOf, type Cue, type VoiceBook } from '@/lib/ducking/voices'
import { Desk, type Loaded } from './sound'

export interface DeskChannel {
  id: string
  strip: string
  title: string
}

export interface DuckingDeskProps {
  round: string
  /** the matters, then everything else */
  channels: DeskChannel[]
  days: string[]
  /** day → share per channel, everything else last */
  shares: number[][]
  /** day → signals in the trailing window */
  totals: number[]
  windowDays: number
}

/** A full sweep of the fader, for a released one: slow enough to watch it being taken away. */
const FALL_PER_SECOND = 0.7
const CATCH_PER_SECOND = 7
/** A key press holds for this long, so a keyboard can do what a hand does. */
const KEY_HOLD_MS = 1600
const KEY_STEP = 0.03
const PLAY_SECONDS = 50
/** How long a note under the screen stays. */
const NOTE_MS = 4800
/** A grip shorter than this was a touch, not a hold. */
const HOLD_NOTE_MS = 500
const LANE = { width: 1000, height: 40 } as const
/** How close everything else may stand, 0 to 1. */
const REST_NEAR = 0.45
/** Lifts speech into the meter's range. */
const METER_GAIN = 4.5

const clock = (ms: number): string => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}


export default function DuckingDesk({ round, channels, days, shares, totals, windowDays }: DuckingDeskProps) {
  const count = channels.length
  const rest = count - 1
  const last = days.length - 1
  const restingPositions = useMemo(() => shares[last]!.map(toPosition), [shares, last])

  const [sound, setSound] = useState<'off' | 'loading' | 'on' | 'failed'>('off')
  const [playing, setPlaying] = useState(false)
  const [day, setDay] = useState(last)
  const [spent, setSpent] = useState<{ id: string; strip: string; time: string }[]>([])

  // All of the moving state lives outside React: it changes every frame.
  const root = useRef<HTMLDivElement>(null)
  const engine = useRef({
    pos: [...restingPositions],
    held: new Array<number | null>(count).fill(null),
    heldMs: new Array<number>(count).fill(0),
    keyTimers: new Array<number>(count).fill(0),
    grips: channels.map(() => new Map<number, number>()),
    phase: channels.map(() => Math.random() * 600),
    head: last,
    playing: false,
    book: null as VoiceBook | null,
    desk: null as Desk | null,
    note: 0,
  })

  useEffect(() => {
    const e = engine.current
    const box = root.current!
    const strips = [...box.querySelectorAll<HTMLElement>('.du-strip')]
    const caps = [...box.querySelectorAll<SVGGElement>('[data-cap]')]
    const meters = [...box.querySelectorAll<SVGRectElement>('[data-meter]')]
    const prints = [...box.querySelectorAll<HTMLElement>('[data-print]')]
    const sliders = [...box.querySelectorAll<HTMLElement>('[role="slider"]')]
    const lines = [...box.querySelectorAll<HTMLElement>('[data-line]')]
    const words = [...box.querySelectorAll<HTMLElement>('[data-word]')]
    const noteEl = box.querySelector<HTMLElement>('[data-note]')!
    const dateEl = box.querySelector<HTMLElement>('[data-date]')!
    const hintEl = box.querySelector<HTMLElement>('[data-hint]')!
    const scrub = box.querySelector<HTMLInputElement>('[data-scrub]')!
    const head = box.querySelector<SVGLineElement>('[data-head]')!
    const still = reducedMotion()

    const shownLine: (string | null)[] = lines.map(() => null)
    const shownPrint: string[] = prints.map(() => '')
    const shownMeter: number[] = meters.map(() => 0)
    const shownWord: (Cue | null)[] = words.map(() => null)
    const restTracks: Cue[][] = []
    let rafId = 0
    let lastFrame = performance.now()
    let shownDay = last
    let shownSpent = ''
    let touched = false
    let inView = true

    const watcher = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true
    })
    watcher.observe(box)

    fetch(`/ducking/${round}/voices.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((book: VoiceBook) => {
        e.book = book
        for (const cue of book.rest.cues) (restTracks[cue.v ?? 0] ??= []).push(cue)
      })
      .catch(() => setSound('failed'))

    const paintScreen = (now: number) => {
      const t = now / 1000
      const book = e.book
      if (!book) return
      channels.forEach((channel, c) => {
        if (c === rest) return
        const file = book.channels[channel.id]
        const line = lines[c]
        if (!file || !line) return
        const ink = inkOf(e.pos[c]!)
        if (ink < INK_FLOOR) {
          if (shownLine[c] !== '') {
            shownLine[c] = ''
            line.textContent = ''
          }
          return
        }
        const text = cueOrNext(file.cues, (t + e.phase[c]!) % file.period)?.text ?? ''
        if (text !== shownLine[c]) {
          shownLine[c] = text
          line.textContent = text
        }
        setVars(line, { '--du-ink-a': ink.toFixed(3) })
      })
      if (still) return
      const ink = inkOf(e.pos[rest]!)
      words.forEach((word, v) => {
        const cues = restTracks[v]
        if (!cues) return
        const at = (t + e.phase[rest]!) % book.rest.period
        const cue = cueAt(cues, at)
        if (cue !== shownWord[v]) {
          shownWord[v] = cue
          if (cue) {
            const [x, y] = placeOf(cue)
            word.textContent = cue.text
            setVars(word, { '--du-x': `${(x * 50).toFixed(1)}%`, '--du-y': `${(4 + y * 80).toFixed(1)}%` })
          }
        }
        setVars(word, { '--du-ink-a': cue ? (ink * cueEnvelope(cue, at)).toFixed(3) : '0' })
      })
    }

    const paintDesk = () => {
      // The faders glide between days; what is printed is always a real day of the record.
      const exact = solve(shares[Math.round(e.head)]!, e.held)
      for (let c = 0; c < count; c++) {
        caps[c]!.setAttribute('transform', `translate(0 ${capY(e.pos[c]!)})`)
        strips[c]!.toggleAttribute('data-held', e.held[c] !== null)
        const print = fmtShare(e.held[c] !== null || e.playing ? exact[c]! : standing(e.pos[c]!, exact[c]!))
        if (print !== shownPrint[c]) {
          shownPrint[c] = print
          prints[c]!.textContent = print
          sliders[c]!.setAttribute('aria-valuenow', String(Math.round(e.pos[c]! * 100)))
          sliders[c]!.setAttribute('aria-valuetext', `${channels[c]!.strip}: ${print}`)
        }
        const level = e.desk && !still ? Math.min(1, e.desk.level(c) * METER_GAIN) : 0
        const height = Math.round(level ** 0.5 * (FADER.height - 8))
        if (height !== shownMeter[c]) {
          shownMeter[c] = height
          meters[c]!.setAttribute('height', String(height))
          meters[c]!.setAttribute('y', String(FADER.height - 4 - height))
        }
      }
      const at = Math.round(e.head)
      if (at !== shownDay) {
        shownDay = at
        dateEl.textContent = days[at]!
        setDay(at)
      }
      scrub.valueAsNumber = e.head
      const x = (e.head / last) * LANE.width
      head.setAttribute('x1', x.toFixed(1))
      head.setAttribute('x2', x.toFixed(1))
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now
      // Scrolled away in silence there is nothing to keep moving.
      if (!inView && !e.desk) {
        rafId = requestAnimationFrame(frame)
        return
      }
      if (e.playing) {
        e.head = Math.min(last, e.head + (dt * last) / PLAY_SECONDS)
        if (e.head >= last) {
          e.playing = false
          setPlaying(false)
        }
      }
      const mix = solve(shareAt(shares, e.head), e.held)
      const near = new Array<number>(count)
      for (let c = 0; c < count; c++) {
        const goal = toPosition(mix[c]!)
        const hand = e.held[c] !== null
        if (hand) e.heldMs[c]! += dt * 1000
        const limit = dt * (hand ? CATCH_PER_SECOND : FALL_PER_SECOND)
        const gap = goal - e.pos[c]!
        e.pos[c]! += still ? gap : Math.max(-limit, Math.min(limit, gap))
        // Everything else is a crowd in the room, however loud it gets; a voice can come close.
        near[c] = c === rest ? e.pos[c]! * REST_NEAR : e.pos[c]!
      }
      if (e.desk) e.desk.set(e.pos.map((p, c) => toGain(standing(p, mix[c]!))), near)
      paintDesk()
      paintScreen(now)
      if (e.note && now > e.note) {
        e.note = 0
        noteEl.textContent = ''
      }
      const tally = channels.flatMap((channel, c) => (e.heldMs[c]! >= 1000 ? [{ id: channel.id, strip: channel.strip, time: clock(e.heldMs[c]!) }] : []))
      const key = tally.map((s) => s.id + s.time).join()
      if (key !== shownSpent) {
        shownSpent = key
        setSpent(tally)
      }
      rafId = requestAnimationFrame(frame)
    }

    const say = (text: string) => {
      noteEl.textContent = text
      e.note = performance.now() + NOTE_MS
    }

    const offs = sliders.flatMap((slider, c) => {
      const svg = slider.querySelector('svg')!
      const readY = (clientY: number): number => {
        const ctm = svg.getScreenCTM()
        return ctm ? (clientY - ctm.f) / ctm.d : 0
      }
      const positionFrom = (ev: PointerEvent): number => positionAt(readY(ev.clientY) - (e.grips[c]!.get(ev.pointerId) ?? 0))
      let since = 0

      const down = (ev: PointerEvent) => {
        ev.preventDefault()
        // One fader, one finger: a second one would fight the first for the cap.
        if (e.grips[c]!.size > 0) return
        slider.setPointerCapture(ev.pointerId)
        const y = readY(ev.clientY)
        const middle = capY(e.pos[c]!) + FADER.capHeight / 2
        // On the cap the cap stays under the finger; off it, the cap comes to the finger.
        e.grips[c]!.set(ev.pointerId, Math.abs(y - middle) < FADER.capHeight ? y - middle : 0)
        e.held[c] = toShare(positionFrom(ev))
        since = performance.now()
        slider.focus({ preventScroll: true })
        if (!touched) {
          touched = true
          hintEl.textContent = ''
        }
      }
      const move = (ev: PointerEvent) => {
        if (!e.grips[c]!.has(ev.pointerId)) return
        // A release can get lost to the system. Nothing latches here, so no button means no hold.
        if (ev.buttons === 0) up(ev)
        else e.held[c] = toShare(positionFrom(ev))
      }
      const up = (ev: PointerEvent) => {
        if (e.grips[c]!.delete(ev.pointerId) && e.grips[c]!.size === 0) {
          e.held[c] = null
          if (performance.now() - since > HOLD_NOTE_MS) {
            say(`${channels[c]!.strip} falls back to ${fmtShare(shares[Math.round(e.head)]![c]!)}`)
          }
        }
      }
      const key = (ev: KeyboardEvent) => {
        const step = { ArrowUp: KEY_STEP, ArrowDown: -KEY_STEP, PageUp: KEY_STEP * 5, PageDown: -KEY_STEP * 5 }[ev.key]
        if (!step) return
        ev.preventDefault()
        e.held[c] = toShare(Math.min(1, Math.max(0, e.pos[c]! + step)))
        window.clearTimeout(e.keyTimers[c])
        e.keyTimers[c] = window.setTimeout(() => {
          if (e.grips[c]!.size === 0) e.held[c] = null
        }, KEY_HOLD_MS)
      }
      // A long press must stay a press: no menu, on a phone or under a right click.
      const menu = (ev: Event) => ev.preventDefault()
      slider.addEventListener('pointerdown', down)
      slider.addEventListener('pointermove', move)
      slider.addEventListener('pointerup', up)
      slider.addEventListener('pointercancel', up)
      slider.addEventListener('lostpointercapture', up)
      slider.addEventListener('keydown', key)
      slider.addEventListener('contextmenu', menu)
      return [
        () => {
          slider.removeEventListener('pointerdown', down)
          slider.removeEventListener('pointermove', move)
          slider.removeEventListener('pointerup', up)
          slider.removeEventListener('pointercancel', up)
          slider.removeEventListener('lostpointercapture', up)
          slider.removeEventListener('keydown', key)
          slider.removeEventListener('contextmenu', menu)
        },
      ]
    })

    rafId = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafId)
      watcher.disconnect()
      for (const off of offs) off()
      e.desk?.close()
      e.desk = null
    }
  }, [channels, count, days, last, rest, round, shares])

  const toggleSound = async () => {
    const e = engine.current
    if (e.desk) {
      e.desk.close()
      e.desk = null
      setSound('off')
      return
    }
    const book = e.book
    if (!book) return
    setSound('loading')
    const desk = new Desk()
    try {
      const base = `/ducking/${round}`
      const voices = channels.map((channel, c) => (c === rest ? book.rest : book.channels[channel.id]!))
      const buffers = await Promise.all(voices.map((v) => desk.decode(`${base}/${v.file}`)))
      // Read after the downloads, or the words on the screen run ahead of the voices.
      const t = performance.now() / 1000
      const loaded: Loaded[] = buffers.map((buffer, c) => {
        const margin = c === rest ? book.rest.margin : 0
        const period = voices[c]!.period
        const end = Math.min(buffer.duration, margin + period)
        const at = (t + e.phase[c]!) % (end - margin)
        return { buffer, from: margin, to: end, at: margin + at, pan: c === rest ? 0 : -0.62 + (1.24 * c) / Math.max(1, rest - 1) }
      })
      desk.start(loaded)
      e.desk = desk
      setSound('on')
    } catch {
      desk.close()
      setSound('failed')
    }
  }

  const togglePlay = () => {
    const e = engine.current
    if (!e.playing && e.head >= last) e.head = 0
    e.playing = !e.playing
    if (!e.playing) e.head = Math.round(e.head)
    setPlaying(e.playing)
  }

  const onScrub = (value: number) => {
    const e = engine.current
    e.head = value
    e.playing = false
    setPlaying(false)
  }

  const lane = useMemo(() => lanePath(shares.map((row) => 1 - row[rest]!), LANE.width, LANE.height), [shares, rest])

  return (
    <div ref={root} className="du-desk" data-sound={sound}>
      <div className="du-bar">
        <button type="button" className="du-key" data-primary={sound === 'off' ? '' : undefined} onClick={toggleSound} disabled={sound === 'loading' || sound === 'failed'}>
          {sound === 'on' ? <VolumeX aria-hidden="true" size={15} /> : <Volume2 aria-hidden="true" size={15} />}
          {sound === 'off' ? 'Sound on' : sound === 'loading' ? 'Loading' : sound === 'on' ? 'Sound off' : 'No sound'}
        </button>
        <p className="du-date">
          <span className="du-faint">week to</span> <span data-date>{days[last]}</span>
          <span className="du-faint"> · {totals[day]?.toLocaleString('en-GB')} signals</span>
        </p>
      </div>

      <div className="du-screen" aria-hidden="true">
        <div className="du-words">
          {channels[rest] && Array.from({ length: 8 }, (_, v) => <span key={v} className="du-word" data-word />)}
        </div>
        <div className="du-lines">
          {channels.map((channel, c) => (c === rest ? null : <p key={channel.id} className="du-line" data-line />))}
        </div>
        <p className="du-hint" data-hint>
          Push a fader up and hold it.
        </p>
        <p className="du-note" data-note />
      </div>

      <div className="du-strips" role="group" aria-label="Faders, one per channel">
        <div className="du-scale" aria-hidden="true">
          <svg viewBox={`0 0 10 ${FADER.height}`} preserveAspectRatio="xMaxYMid meet">
            {SCALE.map((mark) => (
              <text key={mark.label} x={10} y={scaleY(mark.share) + 3.5} textAnchor="end">
                {mark.label}
              </text>
            ))}
          </svg>
        </div>
        {channels.map((channel, c) => (
          <div key={channel.id} className="du-strip" data-rest={c === rest ? '' : undefined}>
            <p className="du-name">{channel.strip}</p>
            <p className="du-print" data-print>
              {fmtShare(shares[last]![c]!)}
            </p>
            <div
              className="du-fader"
              role="slider"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label={c === rest ? 'Everything else on the charts' : channel.title}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(restingPositions[c]! * 100)}
              aria-valuetext={`${channel.strip}: ${fmtShare(shares[last]![c]!)}`}
            >
              <svg viewBox={`6 0 18 ${FADER.height}`}>
                <title>{`${channel.strip}: ${fmtShare(shares[last]![c]!)} of the last ${windowDays} days`}</title>
                <rect className="du-slot" x={14} y={FADER.capHeight / 2} width={2} height={FADER.height - FADER.capHeight} />
                {SCALE.map((mark) => (
                  <line key={mark.label} className="du-tick" x1={6} x2={24} y1={scaleY(mark.share)} y2={scaleY(mark.share)} />
                ))}
                <rect className="du-meter" data-meter x={27.5} width={2} y={FADER.height - 4} height={0} />
                <g data-cap transform={`translate(0 ${capY(restingPositions[c]!)})`}>
                  <rect className="du-cap" x={(FADER.width - FADER.capWidth) / 2 - 1} y={0} width={FADER.capWidth} height={FADER.capHeight} rx={2} />
                  <rect className="du-cap-line" x={(FADER.width - FADER.capWidth) / 2 - 1} y={FADER.capHeight / 2 - 1} width={FADER.capWidth} height={2} />
                </g>
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="du-transport">
        <button type="button" className="du-key" onClick={togglePlay} aria-label={playing ? 'Stop the record' : `Play the ${days.length} days of the record`}>
          {playing ? <Pause aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
          {days.length} days
        </button>
        <div className="du-record">
          <svg viewBox={`0 0 ${LANE.width} ${LANE.height}`} preserveAspectRatio="none" aria-hidden="true">
            <path className="du-lane" d={lane} />
            <line className="du-head" data-head x1={LANE.width} x2={LANE.width} y1={0} y2={LANE.height} vectorEffect="non-scaling-stroke" />
          </svg>
          <input
            className="du-scrub"
            data-scrub
            type="range"
            min={0}
            max={last}
            step={1}
            defaultValue={last}
            aria-label="Day of the record"
            aria-valuetext={days[day]}
            onInput={(ev) => onScrub(ev.currentTarget.valueAsNumber)}
          />
        </div>
      </div>

      <p className="du-spent" aria-live="off">
        {spent.length > 0 ? `You have held: ${spent.map((s) => `${s.strip} ${s.time}`).join(' · ')}` : ' '}
      </p>
    </div>
  )
}
