// src/components/ill-tempered-week/score-kit.tsx — what the three score islands of the ill-tempered week share
// (2026-11-14): the measured width, the playhead that follows the page's <audio>, the seek, and the pointer's place
// on the drawing. Nothing here computes a claim: positions and times come from src/lib/ill-tempered-week/score*.ts.
//
// The <audio> element belongs to the page (Astro renders it with an id, so it plays without JavaScript and is never
// re-created by a hydration); the island finds it after mounting and follows it.
import * as React from 'react'

import { createReadout } from '@/lib/dataviz/readout'
import { reducedMotion } from '@/lib/dataviz/runtime'
import { mmss, spanAt, xAt, type Frame } from '@/lib/ill-tempered-week/score'

/** The width the server draws at, and the first client render with it, so hydration finds the same markup. */
export const DEFAULT_WIDTH = 960

/** The island's measured width, from the first effect on (the server and the first render use DEFAULT_WIDTH). */
export function useWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = React.useState(DEFAULT_WIDTH)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = Math.round(el.clientWidth)
      if (w > 0) setWidth(w)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(measure)
    watch.observe(el)
    return () => watch.disconnect()
  }, [ref])
  return width
}

/** True from the first effect on: controls that need JavaScript appear only once it runs. */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
}

export interface Playhead {
  /** the audio's time, or null before it has played or been sought */
  t: number | null
  playing: boolean
  /** jump the audio to a moment and play from there */
  seek: (t: number) => void
}

/** Follows the page's audio element: every frame while it plays (four times a second under reduced motion, from the
 *  element's own timeupdate), and on every seek. */
export function usePlayhead(audioId: string): Playhead {
  const [t, setT] = React.useState<number | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  React.useEffect(() => {
    const audio = document.getElementById(audioId)
    if (!(audio instanceof HTMLAudioElement)) return
    audioRef.current = audio
    let frame = 0
    const smooth = !reducedMotion()
    const tick = () => {
      setT(audio.currentTime)
      frame = requestAnimationFrame(tick)
    }
    const onPlay = () => {
      // one piece at a time: starting a player stops the page's others
      for (const other of document.querySelectorAll<HTMLAudioElement>('audio.itw-player')) {
        if (other !== audio && !other.paused) other.pause()
      }
      setPlaying(true)
      cancelAnimationFrame(frame)
      if (smooth) frame = requestAnimationFrame(tick)
    }
    const onStop = () => {
      setPlaying(false)
      cancelAnimationFrame(frame)
      setT(audio.currentTime)
    }
    const onTime = () => {
      if (!smooth || audio.paused) setT(audio.currentTime)
    }
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onStop)
    audio.addEventListener('ended', onStop)
    audio.addEventListener('seeked', onTime)
    audio.addEventListener('timeupdate', onTime)
    if (!audio.paused) onPlay()
    else if (audio.currentTime > 0) setT(audio.currentTime)
    return () => {
      cancelAnimationFrame(frame)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onStop)
      audio.removeEventListener('ended', onStop)
      audio.removeEventListener('seeked', onTime)
      audio.removeEventListener('timeupdate', onTime)
    }
  }, [audioId])

  const seek = React.useCallback((to: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, to)
    setT(Math.max(0, to))
    if (audio.paused) void audio.play().catch(() => undefined)
  }, [])

  return { t, playing, seek }
}

/** True when a click came from a finger: there was no hover before it, so the click itself shows the readout. */
export const byTouch = (e: React.MouseEvent): boolean => (e.nativeEvent as PointerEvent).pointerType === 'touch'

/** The pointer's place in the drawing's own units (its viewBox), whatever the drawing's scale on screen. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } | null {
  const m = svg.getScreenCTM()
  if (!m) return null
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

/** The line (system) of the drawing a y falls on, if any. */
export function lineAtY<L extends { y: number; height: number }>(lines: readonly L[], y: number): L | null {
  return lines.find((l) => y >= l.y - 4 && y <= l.y + l.height + 4) ?? null
}

/** The playhead: a rule across the line that holds the moment, and the moment written above it. */
export function PlayheadRule({ frame, lines, t, top, bottom }: {
  frame: Frame
  lines: readonly { span: { t0: number; t1: number; index: number }; y: number; height: number }[]
  t: number
  top: (line: number) => number
  bottom: (line: number) => number
}) {
  const span = spanAt(frame, t)
  const k = lines.findIndex((l) => l.span.index === span.index)
  if (k < 0) return null
  const x = Math.round(xAt(frame, span, Math.min(t, span.t1)) * 10) / 10
  const y1 = top(k)
  const anchor = x > frame.width - 40 ? 'end' : 'middle'
  return (
    <g className="itw-playhead" aria-hidden="true">
      <line x1={x} x2={x} y1={y1} y2={bottom(k)} />
      <text x={x} y={y1 - 3} textAnchor={anchor}>
        {mmss(t)}
      </text>
    </g>
  )
}

/** The readout's two lines, built as nodes (never markup from data). */
export function readoutNode(head: string, body: string): DocumentFragment {
  const node = document.createDocumentFragment()
  const h = document.createElement('b')
  h.className = 'r-head'
  h.textContent = head
  const b = document.createElement('span')
  b.className = 'r-body'
  b.textContent = body
  node.append(h, b)
  return node
}

/** A button that plays from a moment; rendered only once the island runs, so no dead control sits in the page. */
export function PlayFrom({ mounted, at, label, onSeek }: { mounted: boolean; at: number; label: string; onSeek: (t: number) => void }) {
  if (!mounted) return <span className="itw-at">{mmss(at)}</span>
  return (
    <button type="button" className="itw-play-from" onClick={() => onSeek(at)} aria-label={`${label}, from ${mmss(at)}`}>
      <svg viewBox="0 0 8 8" aria-hidden="true" className="itw-play-icon">
        <path d="M1 0.5 L7.5 4 L1 7.5 Z" />
      </svg>
      {mmss(at)}
    </button>
  )
}

/** A source link, opened in a new tab, with the platform's name as its label. */
export function SourceLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return <span className="itw-src">{label}</span>
  return (
    <a className="itw-src itw-link" href={href} target="_blank" rel="noopener noreferrer">
      {label} ↗
    </a>
  )
}

/** A readout clamped to the drawing's own box (house rules of src/lib/dataviz/readout.ts): the island renders the
 *  shell inside that box, so the readout never covers the parts list or leaves the figure. */
export function useBoxReadout(boxRef: React.RefObject<HTMLElement | null>, readoutRef: React.RefObject<HTMLElement | null>) {
  const handle = React.useRef<ReturnType<typeof createReadout> | null>(null)
  React.useEffect(() => {
    if (boxRef.current && readoutRef.current) handle.current = createReadout(readoutRef.current, boxRef.current)
    return () => {
      handle.current?.hide()
      handle.current = null
    }
  }, [boxRef, readoutRef])
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return React.useMemo(() => {
    const show = (head: string, body: string, clientX: number, clientY: number) => {
      clearTimeout(timer.current)
      const r = boxRef.current?.getBoundingClientRect()
      handle.current?.show(readoutNode(head, body), { anchorX: clientX - (r?.left ?? 0), anchorY: clientY - (r?.top ?? 0) })
    }
    const hide = () => {
      clearTimeout(timer.current)
      handle.current?.hide()
    }
    return {
      show,
      hide,
      /** For a tap, which has no hover: show the readout and take it away again after a while. */
      flash(head: string, body: string, clientX: number, clientY: number) {
        show(head, body, clientX, clientY)
        timer.current = setTimeout(() => handle.current?.hide(), 7000)
      },
    }
  }, [boxRef])
}
