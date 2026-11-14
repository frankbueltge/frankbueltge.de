// src/components/ill-tempered-week/TurnScore.tsx — Turn as a score, following its audio (2026-11-14).
//
// The rhythmicon bar by bar: each platform family a row, each bar a cell filled as far as the family's beats sound
// (as many as it had AI signals that day, up to its harmonic number), the tempo underneath. Under it, each day's bar
// drawn large: the measure that repeats ten times, five against six against seven against nine.
//
// The seven duties (.claude/rules/dataviz-figures.md) as in OverlookedScore.tsx: every bar, beat and sentence from
// src/lib/ill-tempered-week/score-turn.ts; the server render is the floor; no style attribute, no hex; the playhead
// follows the audio's own clock under reduced motion; the readout is clamped and never a hit target; no chart library;
// mono ink.
import * as React from 'react'

import type { Turn } from '@/lib/ill-tempered-week/albums'
import { dayName, dayShort, hzLabel, mmss } from '@/lib/ill-tempered-week/score'
import {
  barAt,
  describeBar,
  hitTurn,
  layoutTurn,
  measure,
  nowTurn,
  phaseInBar,
  turnScore,
  type Beat,
  type TurnLayout,
} from '@/lib/ill-tempered-week/score-turn'

import { byTouch, PlayFrom, PlayheadRule, SourceLink, svgPoint, useBoxReadout, useMounted, usePlayhead, useWidth } from './score-kit'

export interface TurnScoreProps {
  record: Turn
  week: string
  /** the link of the turn's headline, where there is one */
  saidLink: string | null
  audioId: string
  id: string
  label: string
  hint: string
}

const Drawing = React.memo(function Drawing({ layout }: { layout: TurnLayout }) {
  const { frame } = layout
  return (
    <>
      {layout.lines.map((line) => {
        const xEnd = Math.round((frame.left + (line.span.t1 - line.span.t0) * frame.pxPerSecond) * 10) / 10
        const rowsBottom = line.rows.at(-1)!.y + layout.rowH
        return (
          <g key={line.span.index}>
            {line.rows.map((r) => (
              <g key={r.family}>
                <rect className="itw-row" x={frame.left} y={r.y} width={xEnd - frame.left} height={layout.rowH} />
                <text className="itw-lab" x={frame.left - 8} y={r.y + layout.rowH - 3} textAnchor="end">
                  {r.label}
                </text>
              </g>
            ))}
            <path className="itw-barline" d={line.barLines.filter((b) => !b.day).map((b) => `M${b.x} ${line.rowsTop}V${rowsBottom}`).join('')} />
            {line.cells.map((c) => (
              <rect key={`${c.bar}-${c.row}`} className={c.full ? 'itw-cell itw-cell-full' : 'itw-cell'} x={c.x} y={c.y} width={c.w} height={c.h} />
            ))}
            {line.said.map((b) => (
              <g key={`s${b.bar}`}>
                <rect className="itw-saidbar" x={b.x + 0.5} y={line.rowsTop} width={Math.max(1, b.w - 1)} height={rowsBottom - line.rowsTop} />
                <path className="itw-said-mark" d={`M${b.x + b.w / 2} ${line.rowsTop + 3}l4 4l-4 4l-4 -4z`} />
              </g>
            ))}
            {line.days.map((d) => (
              <g key={d.index}>
                <line className="itw-daysep" x1={d.x} x2={d.x} y1={line.y + 2} y2={line.tempoBottom + 2} />
                <text className="itw-daylab" x={d.x + 4} y={line.y + 11}>
                  {d.label}
                </text>
              </g>
            ))}
            <text className="itw-lab" x={frame.left - 8} y={line.tempoBottom - 3} textAnchor="end">
              {frame.narrow ? 'tempo' : 'tempo (faster ↑)'}
            </text>
            <path className="itw-tempo" d={line.tempo} />
            {line.lowA && <rect className="itw-lowa" x={line.lowA.x} y={line.tempoBottom - 4} width={line.lowA.w} height={4} />}
            <line className="itw-axis" x1={frame.left} x2={xEnd} y1={line.tempoBottom + 4} y2={line.tempoBottom + 4} />
            {line.ticks.map((tk) => (
              <g key={tk.label}>
                <line className="itw-tick" x1={tk.x} x2={tk.x} y1={line.tempoBottom + 4} y2={line.tempoBottom + 7} />
                <text className="itw-ticklab" x={tk.x} y={line.tempoBottom + 16} textAnchor="middle">
                  {tk.label}
                </text>
              </g>
            ))}
          </g>
        )
      })}
    </>
  )
})

function Measure({ beats, cursor, label }: { beats: Beat[]; cursor: number | null; label: string }) {
  const m = React.useMemo(() => measure(beats, 300), [beats])
  return (
    <svg className="itw-measure" viewBox={`0 0 ${m.width} ${m.height}`} role="img" aria-label={label}>
      {m.rows.map((r) => (
        <g key={r.family}>
          <text className="itw-stlab" x={m.left - 6} y={r.y + 9} textAnchor="end">
            {`${r.family} ${r.h}`}
          </text>
          {r.cells.map((c, k) => (
            <rect key={k} className={c.on ? 'itw-beat is-on' : 'itw-beat'} x={c.x} y={r.y} width={Math.max(1, c.w)} height={12} rx={1.5} />
          ))}
        </g>
      ))}
      {cursor !== null && <line className="itw-stcur" x1={m.left + cursor * (m.width - m.left - 2)} x2={m.left + cursor * (m.width - m.left - 2)} y1={0} y2={m.height} />}
    </svg>
  )
}

/** The key to the drawing: each mark once, drawn with the drawing's own classes. */
function Legend() {
  const sw = (body: React.ReactNode) => (
    <svg className="itw-key-swatch" viewBox="0 0 36 14" aria-hidden="true">
      {body}
    </svg>
  )
  return (
    <ul className="itw-legend" aria-label="How to read this score">
      <li>
        {sw(
          <>
            <rect className="itw-row" x={0} y={0} width={36} height={14} />
            <rect className="itw-cell" x={1} y={8} width={10} height={6} />
            <rect className="itw-cell" x={13} y={10} width={10} height={4} />
            <rect className="itw-cell-full" x={25} y={0} width={10} height={14} />
          </>,
        )}
        <span>One bar of one family, filled as far as its beats sound: one beat for each AI signal it had that day, up to its harmonic number. Full: every beat.</span>
      </li>
      <li>
        {sw(<rect className="itw-saidbar" x={6} y={1} width={24} height={12} />)}
        <span>The turn: on the day the count first doubles the mean of the days before, one bar of every beat, then a silent bar that says the day’s most attended AI headline.</span>
      </li>
      <li>
        {sw(<path className="itw-tempo" d="M0 10H12L12 6H24L24 3H36" />)}
        <span>Tempo: a busy day plays faster, a quiet one slower, gliding from day to day.</span>
      </li>
      <li>
        {sw(<rect className="itw-lowa" x={2} y={5} width={32} height={4} />)}
        <span>Not drawn bar by bar: a low A and a bell chord of the day’s families on every bar line, and noise ticks as dense as the day was busy. At the end, one low A, fading.</span>
      </li>
    </ul>
  )
}

export default function TurnScore({ record, week, saidLink, audioId, id, label, hint }: TurnScoreProps) {
  const score = React.useMemo(() => turnScore(record, week), [record, week])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<HTMLDivElement>(null)
  const width = useWidth(rootRef)
  const mounted = useMounted()
  const layout = React.useMemo(() => layoutTurn(score, width), [score, width])
  const { t, seek } = usePlayhead(audioId)
  const readout = useBoxReadout(boxRef, readoutRef)

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitTurn(score, layout, p.x, p.y) : null
    const desc = hit && hit.bar !== null ? describeBar(score, hit.bar) : null
    if (desc) readout.show(desc.head, desc.body, e.clientX, e.clientY)
    else readout.hide()
  }
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitTurn(score, layout, p.x, p.y) : null
    if (!hit) return
    seek(hit.t)
    const desc = byTouch(e) && hit.bar !== null ? describeBar(score, hit.bar) : null
    if (desc) readout.flash(desc.head, desc.body, e.clientX, e.clientY)
  }

  const bar = t === null ? null : barAt(score, t)
  const rowsBottom = (line: TurnLayout['lines'][number]) => line.rows.at(-1)!.y + layout.rowH

  return (
    <div ref={rootRef} id={id} className="itw-score" data-island="itw-turn" data-live={mounted ? '' : undefined}>
      <p className="itw-now" aria-live="off">
        {t === null ? hint : <><span className="itw-now-t">{mmss(t)}</span> {nowTurn(score, t)}</>}
      </p>
      <div ref={boxRef} className="itw-svgbox">
        <svg
          className="itw-svg"
          viewBox={`0 0 ${layout.frame.width} ${layout.height}`}
          role="img"
          aria-label={label}
          onPointerMove={onMove}
          onPointerLeave={() => readout.hide()}
          onClick={onClick}
        >
          <Drawing layout={layout} />
          {bar &&
            layout.lines
              .filter((l) => bar.t0 >= l.span.t0 && bar.t0 < l.span.t1)
              .map((l) => (
                <rect
                  key={l.span.index}
                  className="itw-baron"
                  x={Math.round((layout.frame.left + (bar.t0 - l.span.t0) * layout.frame.pxPerSecond) * 10) / 10}
                  y={l.rowsTop - 1}
                  width={Math.max(1, Math.round(bar.len * layout.frame.pxPerSecond * 10) / 10)}
                  height={rowsBottom(l) - l.rowsTop + 2}
                />
              ))}
          {t !== null && (
            <PlayheadRule frame={layout.frame} lines={layout.lines} t={t} top={(k) => layout.lines[k]!.rowsTop - 2} bottom={(k) => layout.lines[k]!.tempoBottom + 4} />
          )}
        </svg>
        <div ref={readoutRef} className="dv-readout itw-readout" hidden aria-hidden="true" />
      </div>
      <Legend />

      <p className="itw-part-note itw-key">
        Each family sings its vowel on its harmonic of A:{' '}
        {score.rows.map((r, k) => (
          <span key={r.family}>
            {k > 0 ? ', ' : ''}
            {r.family} “{r.vowel}” on {hzLabel(r.hz)} ({r.h} beats a bar)
          </span>
        ))}
        .
      </p>
      <ol className="itw-measures" aria-label="Each day’s bar">
        {score.days.map((d) => {
          const active = bar !== null && bar.day === d.index
          const cursor = active && bar.kind === 'bar' && t !== null ? phaseInBar(bar, t) : null
          const all = score.bars.find((b) => b.day === d.index && b.kind === 'all')
          return (
            <li key={d.index} className={active ? 'itw-mday is-on' : 'itw-mday'}>
              <p className="itw-part-head">
                <span className="itw-part-day">{dayShort(d.day)}</span>
                <span className="itw-part-meta">
                  {d.signals} AI signal{d.signals === 1 ? '' : 's'} · {d.barSeconds.toFixed(2)} s a bar
                </span>
                <PlayFrom mounted={mounted} at={d.from} label={`Play ${dayName(d.day)}`} onSeek={seek} />
              </p>
              {all && (
                <>
                  <p className="itw-part-note">The week turns: one bar of every beat, then a silent bar.</p>
                  <Measure beats={all.beats} cursor={active && bar.kind === 'all' && t !== null ? phaseInBar(bar, t) : null} label={`${dayName(d.day)}: the turn, every beat of every family`} />
                  <p className="itw-part-text">
                    Said in the silent bar: “{d.said}” <SourceLink href={saidLink} label="source" />
                  </p>
                </>
              )}
              <Measure beats={d.voiced} cursor={cursor} label={`${dayName(d.day)}’s bar: ${d.voiced.map((v) => `${v.family} ${v.k} of ${v.h}`).join(', ')}`} />
              <p className="itw-part-note">
                × {score.bars.filter((b) => b.day === d.index && b.kind === 'bar').length} bars
                {d.unvoiced.length > 0 ? ` · counted, not voiced: ${d.unvoiced.map((u) => `${u.family} ${u.count}`).join(', ')}` : ''}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
