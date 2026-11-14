// src/components/ill-tempered-week/usePerformance.ts — a score's own performance (2026-11-14): the state around the
// engine in orchestra.ts. The engine and the note list are fetched only when a visitor asks for a performance, so a
// page that is only read or listened to pays nothing for them.
import * as React from 'react'

import { reducedMotion } from '@/lib/dataviz/runtime'
import type { Overlooked } from '@/lib/ill-tempered-week/albums'
import { afterTap } from '@/lib/ill-tempered-week/perform'
import type { Performance } from '@/lib/ill-tempered-week/perform-overlooked'

import type { Orchestra, Progress } from './orchestra'

export type PerformStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'failed'

/** Told to every score on the page when one begins to perform, so the others fall silent. */
const BEGAN = 'itw:perform'

export interface PerformanceHandle {
  status: PerformStatus
  progress: Progress | null
  /** where the performance is in the piece, or null before it has begun */
  t: number | null
  /** the voices left out, by the score's lanes */
  muted: ReadonlySet<string>
  /** what the score draws and the performance does not play, in words */
  missing: string[]
  /** the lanes of the score the performance never plays (the murmur), so the drawing can show them left out */
  unplayed: ReadonlySet<string>
  /** begins, resumes or holds the performance; `from` is where to begin if it has not begun */
  toggle: (from: number) => void
  /** plays from a moment of the piece */
  seek: (t: number) => void
  /** a tap on a voice: with every voice sounding it is heard alone; otherwise it joins or leaves */
  voice: (lane: string, all: readonly string[]) => void
  everyone: () => void
}

export function usePerformance(record: Overlooked, id: string): PerformanceHandle {
  const [status, setStatus] = React.useState<PerformStatus>('idle')
  const [progress, setProgress] = React.useState<Progress | null>(null)
  const [t, setT] = React.useState<number | null>(null)
  const [muted, setMuted] = React.useState<ReadonlySet<string>>(() => new Set())
  const [missing, setMissing] = React.useState<string[]>([])
  const [unplayed, setUnplayed] = React.useState<ReadonlySet<string>>(() => new Set())
  const engine = React.useRef<Orchestra | null>(null)
  const context = React.useRef<AudioContext | null>(null)
  const statusRef = React.useRef(status)
  statusRef.current = status
  const mutedRef = React.useRef(muted)
  mutedRef.current = muted

  // the playhead: every frame where frames run, four times a second in any case (as for the recording, follow.ts)
  React.useEffect(() => {
    if (status !== 'playing') return
    const read = () => {
      if (engine.current) setT(engine.current.time())
    }
    let frame = 0
    const loop = () => {
      read()
      frame = requestAnimationFrame(loop)
    }
    if (!reducedMotion()) frame = requestAnimationFrame(loop)
    const timer = setInterval(read, 250)
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(timer)
    }
  }, [status])

  // one thing sounds at a time: a recording that starts, or another score that begins to perform, holds this one
  React.useEffect(() => {
    const hold = () => {
      if (statusRef.current === 'playing') {
        engine.current?.pause()
        setStatus('paused')
      }
    }
    const onPlay = (e: Event) => {
      if (e.target instanceof HTMLAudioElement) hold()
    }
    const onBegan = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) hold()
    }
    document.addEventListener('play', onPlay, true)
    document.addEventListener(BEGAN, onBegan)
    return () => {
      document.removeEventListener('play', onPlay, true)
      document.removeEventListener(BEGAN, onBegan)
      if (engine.current) engine.current.close()
      else void context.current?.close()
      engine.current = null
      context.current = null
    }
  }, [id])

  const begin = React.useCallback(
    async (from: number) => {
      for (const audio of document.querySelectorAll<HTMLAudioElement>('audio')) audio.pause()
      document.dispatchEvent(new CustomEvent(BEGAN, { detail: id }))
      // the context is made and woken here, still inside the visitor's click, before anything is awaited
      if (!context.current) {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        context.current = new Ctx()
      }
      const ctx = context.current
      void ctx.resume()
      let o = engine.current
      if (!o) {
        setStatus('loading')
        try {
          // the note list and the engine arrive only now
          const [{ performOverlooked }, { Orchestra: Engine }] = await Promise.all([import('@/lib/ill-tempered-week/perform-overlooked'), import('./orchestra')])
          const performance: Performance = performOverlooked(record)
          o = new Engine(performance, ctx)
          engine.current = o
          o.onEnd = () => {
            setStatus('ended')
            setT(performance.end)
          }
          await o.load(setProgress)
          const silent = o.missing()
          setUnplayed(new Set(performance.missing.filter((m) => m.day === null).map((m) => m.lane)))
          setMissing([
            ...new Set(performance.missing.map((m) => m.why)),
            ...(silent.length > 0 ? [`could not be loaded and stay silent: ${silent.join(', ')}`] : []),
          ])
        } catch {
          engine.current?.close()
          engine.current = null
          context.current = null
          setStatus('failed')
          return
        }
      }
      o.mute(mutedRef.current)
      o.play(from)
      setT(from)
      setStatus('playing')
    },
    [id, record],
  )

  const toggle = React.useCallback(
    (from: number) => {
      const o = engine.current
      const now = statusRef.current
      if (now === 'loading') return
      if (now === 'playing') {
        o?.pause()
        setStatus('paused')
      } else if (now === 'paused' && o) {
        for (const audio of document.querySelectorAll<HTMLAudioElement>('audio')) audio.pause()
        document.dispatchEvent(new CustomEvent(BEGAN, { detail: id }))
        o.resume()
        setStatus('playing')
      } else {
        void begin(now === 'ended' ? 0 : from)
      }
    },
    [begin, id],
  )

  const seek = React.useCallback(
    (to: number) => {
      if (statusRef.current === 'loading') return
      void begin(to)
    },
    [begin],
  )

  const voice = React.useCallback((lane: string, all: readonly string[]) => {
    const next = afterTap(mutedRef.current, lane, all)
    // at once, so a second tap before the next render starts from this one
    mutedRef.current = next
    setMuted(next)
    engine.current?.mute(next)
  }, [])

  const everyone = React.useCallback(() => {
    const next = new Set<string>()
    mutedRef.current = next
    setMuted(next)
    engine.current?.mute(next)
  }, [])

  return { status, progress, t, muted, missing, unplayed, toggle, seek, voice, everyone }
}
