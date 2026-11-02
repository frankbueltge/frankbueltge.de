/** Ducking — the desk (2026-11-01; docs/design/2026-11-01-ducking.md).
 *
 *  Every level comes from src/lib/ducking/mix.ts, every coordinate from figure.ts; this file mounts
 *  them, moves them and answers the hand. The server render already stands at the record's newest
 *  day, as plain SVG, so the page says what it says before a script runs.
 *
 *  Nothing is latched. A fader stays up only while something holds it, and that is the work: there
 *  is deliberately no way to leave a field loud and walk off. A keyboard holds for as long as the
 *  key keeps being pressed, and a moment longer. No style attribute anywhere (CSP): caps move by SVG
 *  attribute, and the screen by setVars. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { reducedMotion, setVars } from '@/lib/dataviz/runtime'
import { capY, FADER, INK_BESIDE_A_HAND, inkOf, INK_FLOOR, lanePath, positionAt, SCALE, scaleY } from '@/lib/ducking/figure'
import { captionOf, crowdCutoff, fmtShare, focusOf, PLAY_CAPTION, shareAt, solve, standing, toGain, toPosition, toShare } from '@/lib/ducking/mix'
import { cueAt, cueEnvelope, cueOrNext, placeOf, type Cue, type RecordCue, type VoiceBook } from '@/lib/ducking/voices'
import { Desk, type Loaded } from './sound'

export interface DeskChannel {
  id: string
  strip: string
  title: string
}

export interface DuckingDeskProps {
  round: string
  /** the fields of the map, then the crowd */
  channels: DeskChannel[]
  days: string[]
  /** day → share per channel, the crowd last */
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
/** Seconds a day takes to play, until the book says how long its record gives a day. */
const DAY_SECONDS = 2
/** What the crowd keeps of its level while the record sounds. */
const PLAY_CROWD = 0.14
/** How long a note under the screen stays. */
const NOTE_MS = 4800
/** A grip shorter than this was a touch, not a hold. */
const HOLD_NOTE_MS = 500
const LANE = { width: 1000, height: 40 } as const
/** How close the crowd may stand, 0 to 1. */
const REST_NEAR = 0.2
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
  const [from, setFrom] = useState(0)
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
    /** the day the record starts */
    from: 0,
    recording: null as AudioBuffer | null,
    /** when the record's start sounded on the audio clock; null while it is not sounding */
    clock: null as number | null,
    note: 0,
  })

  const stopPlay = useCallback(() => {
    const e = engine.current
    e.playing = false
    e.head = Math.round(e.head)
    e.clock = null
    e.desk?.stopRecord()
    setPlaying(false)
  }, [])

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
    const captionEl = box.querySelector<HTMLElement>('[data-caption]')!
    const scrub = box.querySelector<HTMLInputElement>('[data-scrub]')!
    const head = box.querySelector<SVGLineElement>('[data-head]')!
    const still = reducedMotion()

    const shownLine: (string | null)[] = lines.map(() => null)
    const shownPrint: string[] = prints.map(() => '')
    const shownMeter: number[] = meters.map(() => 0)
    const shownWord: (Cue | null)[] = words.map(() => null)
    const restTracks: Cue[][] = []
    const recordTracks: RecordCue[][] = []
    let rafId = 0
    let lastFrame = performance.now()
    let shownDay = last
    let shownSpent = ''
    let shownCaption = ''
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
        for (const cue of book.record.cues) (recordTracks[cue.c] ??= []).push(cue)
        e.from = Math.max(0, days.findIndex((d) => d >= book.record.from))
        setFrom(e.from)
      })
      .catch(() => setSound('failed'))

    /** Seconds into the record at the day the head stands on. */
    const recordAt = (book: VoiceBook): number => (e.head - e.from) * book.record.day

    const paintRecord = (book: VoiceBook) => {
      const at = recordAt(book)
      channels.forEach((channel, c) => {
        const line = lines[c]
        if (c === rest || !line) return
        const cue = cueAt(recordTracks[c] ?? [], at)
        const text = cue ? `${channel.strip} · ${cue.text}` : ''
        if (text !== shownLine[c]) {
          shownLine[c] = text
          line.textContent = text
        }
        if (cue) setVars(line, { '--du-ink-a': cueEnvelope(cue, at).toFixed(3) })
      })
    }

    const paintScreen = (now: number) => {
      const t = now / 1000
      const book = e.book
      if (!book) return
      const aHand = e.held.some((h, c) => h !== null && c !== rest)
      if (e.playing) paintRecord(book)
      else channels.forEach((channel, c) => {
        if (c === rest) return
        const file = book.channels[channel.id]
        const line = lines[c]
        if (!file || !line) return
        // Only what a hand has raised is written out: at rest the screen belongs to the crowd.
        const raised = Math.max(0, inkOf(e.pos[c]!) - inkOf(toPosition(shareAt(shares, e.head)[c]!)))
        const ink = raised * (aHand && e.held[c] === null ? INK_BESIDE_A_HAND : 1)
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
      const ink = inkOf(e.pos[rest]!) * (e.playing ? INK_BESIDE_A_HAND : 1)
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
        // The record is one recording, so while it sounds a channel's meter reads whether its voice is speaking.
        const speaking = e.clock !== null && c !== rest && e.book ? (cueAt(recordTracks[c] ?? [], recordAt(e.book)) ? 0.08 : 0) : null
        const level = e.desk && !still ? Math.min(1, (speaking ?? e.desk.level(c)) * METER_GAIN) : 0
        const height = Math.round(level ** 0.5 * (FADER.height - 8))
        if (height !== shownMeter[c]) {
          shownMeter[c] = height
          meters[c]!.setAttribute('height', String(height))
          meters[c]!.setAttribute('y', String(FADER.height - 4 - height))
        }
      }
      const holding = channels.flatMap((channel, c) => (c !== rest && e.held[c] !== null ? [{ strip: channel.strip, share: exact[c]! }] : []))
      const caption = e.playing ? PLAY_CAPTION : captionOf(holding, e.held[rest] !== null, exact[rest]!)
      if (caption !== shownCaption) {
        shownCaption = caption
        captionEl.textContent = caption
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
        const seconds = e.book?.record.day ?? DAY_SECONDS
        if (e.clock !== null && e.desk) {
          e.head = e.from + (e.desk.now - e.clock) / seconds
          // Days the record does not hold yet play on without it, and the crowd comes back for them.
          if (e.recording && e.desk.now - e.clock >= e.recording.duration) e.clock = null
        } else {
          e.head += dt / seconds
        }
        if (e.head >= last) {
          e.head = last
          stopPlay()
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
        // The crowd stands off in the room, however loud it gets; a voice can come close.
        near[c] = c === rest ? e.pos[c]! * REST_NEAR : e.pos[c]!
      }
      const focus = focusOf(e.pos.filter((_, c) => c !== rest && e.held[c] !== null))
      if (e.desk) {
        const hearing = e.clock !== null
        const gains = e.pos.map((p, c) => toGain(standing(p, mix[c]!)) * (hearing ? (c === rest ? PLAY_CROWD : 0) : 1))
        e.desk.set(gains, near, crowdCutoff(hearing ? 1 : focus))
      }
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
        // A hand on the desk ends the record: the two would pull one fader two ways.
        if (e.playing) stopPlay()
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
        if (e.playing) stopPlay()
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
  }, [channels, count, days, last, rest, round, shares, stopPlay])

  const toggleSound = async () => {
    const e = engine.current
    if (e.desk) {
      e.desk.close()
      e.desk = null
      e.recording = null
      e.clock = null
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
      const [recording, ...buffers] = await Promise.all([book.record, ...voices].map((v) => desk.decode(`${base}/${v.file}`)))
      // Read after the downloads, or the words on the screen run ahead of the voices.
      const t = performance.now() / 1000
      const loaded: Loaded[] = buffers.map((buffer, c) => {
        const margin = c === rest ? book.rest.margin : 0
        const period = voices[c]!.period
        const end = Math.min(buffer.duration, margin + period)
        const at = (t + e.phase[c]!) % (end - margin)
        return { buffer, from: margin, to: end, at: margin + at, pan: c === rest ? 0 : -0.62 + (1.24 * c) / Math.max(1, rest - 1), muffled: c === rest }
      })
      desk.start(loaded)
      e.desk = desk
      e.recording = recording!
      if (e.playing) soundRecord()
      setSound('on')
    } catch {
      desk.close()
      setSound('failed')
    }
  }

  const soundRecord = () => {
    const e = engine.current
    if (!e.desk || !e.recording || !e.book) return
    const at = (e.head - e.from) * e.book.record.day
    if (at < e.recording.duration) e.clock = e.desk.playRecord(e.recording, at)
  }

  const togglePlay = () => {
    const e = engine.current
    if (e.playing) {
      stopPlay()
      return
    }
    if (e.head >= last || e.head < e.from) e.head = e.from
    e.playing = true
    setPlaying(true)
    soundRecord()
  }

  const onScrub = (value: number) => {
    const e = engine.current
    if (e.playing) stopPlay()
    e.head = value
  }

  const lane = useMemo(() => lanePath(shares.map((row) => 1 - row[rest]!), LANE.width, LANE.height), [shares, rest])

  return (
    <div ref={root} className="du-desk" data-sound={sound} data-playing={playing ? '' : undefined}>
      <div className="du-bar">
        <button type="button" className="du-key" data-primary={sound === 'off' ? '' : undefined} onClick={toggleSound} disabled={sound === 'loading' || sound === 'failed'}>
          {sound === 'on' ? <VolumeX aria-hidden="true" size={15} /> : <Volume2 aria-hidden="true" size={15} />}
          {sound === 'off' ? 'Sound on' : sound === 'loading' ? 'Loading' : sound === 'on' ? 'Sound off' : 'No sound'}
        </button>
        <p className="du-date">
          <span className="du-faint">week to</span> <span data-date>{days[last]}</span>
          <span className="du-faint du-count"> · {totals[day]?.toLocaleString('en-GB')} signals</span>
        </p>
      </div>

      <p className="du-caption" data-caption>
        {captionOf([], false, shares[last]![rest]!)}
      </p>

      <div className="du-screen" aria-hidden="true">
        <div className="du-words">
          {channels[rest] && Array.from({ length: 8 }, (_, v) => <span key={v} className="du-word" data-word />)}
        </div>
        <div className="du-lines">
          {channels.map((channel, c) => (c === rest ? null : <p key={channel.id} className="du-line" data-line />))}
        </div>
        <p className="du-hint" data-hint>
          Push a fader up and hold it. The higher, the clearer.
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
              aria-label={channel.title}
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
        <button type="button" className="du-key" onClick={togglePlay} aria-label={playing ? 'Stop the record' : `Play the last ${days.length - from} days of the record`}>
          {playing ? <Pause aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
          {days.length - from} days
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
