// src/components/ill-tempered-week/OverlookedScore.tsx — Overlooked as a score, following its audio (2026-11-14).
//
// The week's form at a glance: one lane per voice, time left to right, each day's headline said, answered and looped
// as a motif that sounds on, softer by the day, until the tutti and the cut. Under it, each day's part: the headline
// with its link, the motif on the harmonic scale it is tuned to, and what murmured underneath.
//
// Against the seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"):
//   1. Every position, time and sentence comes from src/lib/ill-tempered-week/score-overlooked.ts (tested there);
//      this file mounts it, follows the audio and answers the pointer.
//   2. The server render is the floor: lanes, marks, staves and every link are markup before a script runs; the
//      <audio> is the page's own. Only the play-from buttons, the playhead and the readout need JavaScript.
//   3. No style attribute, no hex: src/styles/ill-tempered-week.css inks the `itw-*` classes.
//   4. Reduced motion: the playhead moves with the audio's own clock (four times a second) instead of every frame.
//   5. The readout is clamped to the drawing's box and is never a hit target.
//   6. Weight: React and this file; no chart library. Budget line `OverlookedScore.` in scripts/budgets.json.
//   7. Mono ink only: age is told by height and by tone of the one ink, never by a hue.
import * as React from 'react'

import type { Overlooked } from '@/lib/ill-tempered-week/albums'
import type { OverlookedLinks } from '@/lib/ill-tempered-week/pages'
import { dayName, dayShort, hzLabel, mmss } from '@/lib/ill-tempered-week/score'
import {
  describeOverlooked,
  FORM,
  hitOverlooked,
  LANE_H,
  layoutOverlooked,
  motifStaff,
  nowOverlooked,
  overlookedScore,
  soloistAt,
  soundingAt,
  sourceName,
  type Mark,
  type OverlookedLayout,
  type OverlookedScore as Score,
  type ScoreDay,
} from '@/lib/ill-tempered-week/score-overlooked'

import { byTouch, PlayFrom, PlayheadRule, SourceLink, svgPoint, useBoxReadout, useMounted, usePlayhead, useWidth } from './score-kit'

export type { OverlookedLinks } from '@/lib/ill-tempered-week/pages'

export interface OverlookedScoreProps {
  record: Overlooked
  links: OverlookedLinks
  /** the id of the page's <audio> for this piece */
  audioId: string
  id: string
  /** the drawing's accessible name */
  label: string
  /** the line shown before anything plays */
  hint: string
}

const pct = (x: number): string => `${Math.round(100 * x)} %`

function MarkShape({ m }: { m: Mark }) {
  const cy = Math.round((m.y + m.h / 2) * 10) / 10
  const loops = m.loops.length > 0 ? <path className="itw-loop" d={m.loops.map((x) => `M${x} ${m.y}v${m.h}`).join('')} /> : null
  switch (m.kind) {
    case 'bell':
      return <path className="itw-bell" d={`M${m.x} ${cy - 4}l4 4l-4 4l-4 -4z`} />
    case 'said':
      return <rect className="itw-said" x={m.x} y={m.y} width={m.w} height={m.h} rx={1.5} />
    case 'answer':
      return <line className="itw-answer" x1={m.x} x2={m.x + m.w} y1={cy} y2={cy} />
    case 'motif':
      return (
        <g className={`itw-motif a${m.age ?? 0}${m.tutti ? ' itw-tut' : ''}`}>
          <rect x={m.x} y={m.y} width={m.w} height={m.h} />
          {loops}
        </g>
      )
    case 'violins':
    case 'violas':
    case 'low':
      return (
        <g className={`itw-ens itw-${m.kind}`}>
          <rect x={m.x} y={m.y} width={m.w} height={m.h} />
          {loops}
        </g>
      )
    case 'piano':
      return <rect className="itw-piano" x={m.x} y={m.y} width={m.w} height={m.h} />
    case 'brass':
      return <rect className="itw-brass" x={m.x} y={m.y} width={m.w} height={m.h} />
    case 'murmur':
      return <rect className="itw-murmur" x={m.x} y={m.y} width={Math.max(0.6, m.w - 1.5)} height={m.h} />
    case 'violin':
      return <rect className="itw-violin" x={m.x} y={m.y} width={m.w} height={m.h} rx={1.5} />
  }
}

/** The drawing without the playhead: it changes only with the width, never with the time. */
const Drawing = React.memo(function Drawing({ layout }: { layout: OverlookedLayout }) {
  const { frame } = layout
  return (
    <>
      {layout.lines.map((line) => {
        const xEnd = Math.round((frame.left + (line.span.t1 - line.span.t0) * frame.pxPerSecond) * 10) / 10
        return (
          <g key={line.span.index}>
            {line.tutti && <rect className="itw-tutti" x={line.tutti.x} y={line.top - 5} width={line.tutti.w} height={line.bottom - line.top + 10} />}
            {line.lanes.map((lane) => (
              <g key={lane.id}>
                <text className="itw-lab" x={frame.left - 8} y={lane.y + LANE_H - 2.5} textAnchor="end">
                  {lane.label}
                </text>
                <line className="itw-lane" x1={frame.left} x2={xEnd} y1={lane.y + LANE_H / 2} y2={lane.y + LANE_H / 2} />
              </g>
            ))}
            {line.days.map((d) => (
              <g key={d.index}>
                <line className="itw-daysep" x1={d.x} x2={d.x} y1={line.y + 3} y2={line.bottom + 5} />
                <text className="itw-daylab" x={d.x + 4} y={line.y + 12}>
                  {d.label}
                </text>
              </g>
            ))}
            {line.marks.map((m) => (
              <MarkShape key={m.id} m={m} />
            ))}
            {line.tutti && (
              <text className="itw-note" x={line.tutti.x + line.tutti.w - 3} y={line.y + 12} textAnchor="end">
                tutti
              </text>
            )}
            {line.cut !== null && (
              <g>
                <line className="itw-cut" x1={line.cut} x2={line.cut} y1={line.top - 7} y2={line.bottom + 7} />
                <text className="itw-note" x={line.cut + 4} y={line.y + 12}>
                  cut · coda
                </text>
              </g>
            )}
            <line className="itw-axis" x1={frame.left} x2={xEnd} y1={line.bottom + 7} y2={line.bottom + 7} />
            {line.ticks.map((tk) => (
              <g key={tk.label}>
                <line className="itw-tick" x1={tk.x} x2={tk.x} y1={line.bottom + 7} y2={line.bottom + 10} />
                <text className="itw-ticklab" x={tk.x} y={line.bottom + 19} textAnchor="middle">
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

/** What sounds at the playhead, outlined over the drawing. */
function Sounding({ layout, ids }: { layout: OverlookedLayout; ids: string[] }) {
  const on = new Set(ids)
  return (
    <g className="itw-on" aria-hidden="true">
      {layout.lines.flatMap((line) =>
        line.marks
          .filter((m) => on.has(m.id) && m.kind !== 'bell')
          .map((m) => <rect key={`${line.span.index}-${m.id}`} x={m.x - 1.5} y={m.y - 1.5} width={m.w + 3} height={m.h + 3} rx={1.5} />),
      )}
    </g>
  )
}

const DayStaff = React.memo(function DayStaff({ day, eighth, note }: { day: ScoreDay; eighth: number | null; note: number | null }) {
  const st = React.useMemo(() => motifStaff(day, 320), [day])
  return (
    <svg className="itw-staff" viewBox={`0 0 ${st.width} ${st.height}`} role="img" aria-label={`${dayName(day.day)}’s motif: ${day.motif.length} notes on the harmonics of A, ${day.eighths} eighths long`}>
      {st.lines.map((ln) => (
        <g key={ln.hz}>
          <line className={ln.a ? 'itw-stl itw-stl-a' : 'itw-stl'} x1={st.left - 3} x2={st.width - 2} y1={ln.y} y2={ln.y} />
          {ln.label && (
            <text className="itw-stlab" x={st.left - 6} y={ln.y + 3} textAnchor="end">
              {ln.label}
            </text>
          )}
        </g>
      ))}
      {st.bars.map((x) => (
        <line key={x} className="itw-stbar" x1={x} x2={x} y1={1} y2={st.height - 1} />
      ))}
      {st.notes.map((n, k) => (
        <rect key={k} className={note === k ? 'itw-stn is-on' : 'itw-stn'} x={n.x} y={n.y - 2.5} width={n.w} height={5} rx={1.5}>
          <title>{`${hzLabel(n.hz)}, harmonic ${n.harmonic} of A (${n.ratio}), eighth ${n.step + 1}`}</title>
        </rect>
      ))}
      {eighth !== null && <line className="itw-stcur" x1={st.x0 + eighth * st.pxPerEighth} x2={st.x0 + eighth * st.pxPerEighth} y1={0} y2={st.height} />}
    </svg>
  )
})

function entriesLine(d: ScoreDay): string {
  const parts = ['violins', 'violas', 'piano', 'low'] as const
  const taken = { violins: 'violins', violas: 'violas', piano: 'piano', low: 'cellos and basses' }
  const late = { violins: 'the violins', violas: 'the violas', piano: 'the piano', low: 'the low strings' }
  const entered = parts.filter((p) => d.entries[p] !== null).map((p) => `${taken[p]} ${mmss(d.entries[p]!)}`)
  const missing = parts.filter((p) => d.entries[p] === null)
  const verb = missing.length === 1 && missing[0] === 'piano' ? 'enters' : 'enter'
  return [
    entered.length > 0 ? `Taken up by ${entered.join(', ')}.` : '',
    missing.length > 0 ? `The day ends before ${missing.map((p) => late[p]).join(' and ')} ${verb}.` : '',
  ].filter(Boolean).join(' ')
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
        {sw(<path className="itw-bell" d="M6 3l4 4l-4 4l-4 -4z" />)}
        <span>A tubular bell on A opens each day.</span>
      </li>
      <li>
        {sw(<rect className="itw-said" x={2} y={5} width={32} height={5} rx={1.5} />)}
        <span>The day’s least attended headline, said in its field’s voice.</span>
      </li>
      <li>
        {sw(<line className="itw-answer" x1={2} x2={34} y1={7} y2={7} />)}
        <span>Its instrument answers with the sentence’s speech melody.</span>
      </li>
      <li>
        {sw(
          <g className="itw-motif a0">
            <rect x={1} y={1} width={34} height={12} />
            <path className="itw-loop" d="M12 1v12M23 1v12" />
          </g>,
        )}
        <span>The motif, looped: each block is one statement of it.</span>
      </li>
      <li>
        {sw(
          <>
            <g className="itw-motif a0"><rect x={1} y={1} width={10} height={12} /></g>
            <g className="itw-motif a2"><rect x={13} y={3.5} width={10} height={7} /></g>
            <g className="itw-motif a5"><rect x={25} y={5} width={10} height={4} /></g>
          </>,
        )}
        <span>As tall and dark as it is loud: {FORM.dbPerDay} dB softer for each day it ages. It stops with its day once the newest day no longer names its field.</span>
      </li>
      <li>
        {sw(
          <g className="itw-ens">
            <rect x={1} y={3} width={34} height={8} />
            <path className="itw-loop" d="M13 3v8M25 3v8" />
          </g>,
        )}
        <span>The ensemble takes each day’s motif up: violins and violas in canon, then piano, cellos and basses.</span>
      </li>
      <li>
        {sw(<rect className="itw-murmur" x={1} y={4} width={34} height={6} />)}
        <span>Underneath, the day’s most attended headlines murmur, granulated and far.</span>
      </li>
      <li>
        {sw(
          <>
            <rect className="itw-tutti" x={1} y={0} width={22} height={14} />
            <line className="itw-cut" x1={24} x2={24} y1={0} y2={14} />
          </>,
        )}
        <span>The tutti: every kept motif at full strength, horns and trombones on A’s harmonic chord. Then the cut, and the first day’s headline once more.</span>
      </li>
    </ul>
  )
}

export default function OverlookedScore({ record, links, audioId, id, label, hint }: OverlookedScoreProps) {
  const score: Score = React.useMemo(() => overlookedScore(record), [record])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<HTMLDivElement>(null)
  const width = useWidth(rootRef)
  const mounted = useMounted()
  const layout = React.useMemo(() => layoutOverlooked(score, width), [score, width])
  const { t, seek } = usePlayhead(audioId)
  const readout = useBoxReadout(boxRef, readoutRef)

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitOverlooked(score, layout, p.x, p.y) : null
    const desc = hit?.event ? describeOverlooked(score, hit.event) : null
    if (desc) readout.show(desc.head, desc.body, e.clientX, e.clientY)
    else readout.hide()
  }
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitOverlooked(score, layout, p.x, p.y) : null
    if (!hit) return
    seek(hit.t)
    const desc = byTouch(e) && hit.event ? describeOverlooked(score, hit.event) : null
    if (desc) readout.flash(desc.head, desc.body, e.clientX, e.clientY)
  }

  const sounding = t === null ? [] : soundingAt(score, t)
  const activeDay = t === null ? -1 : score.days.reduce((k, d, i) => (t >= d.from ? i : k), -1)
  const lineIndex = (k: number) => layout.lines[k]!

  return (
    <div ref={rootRef} id={id} className="itw-score" data-island="itw-overlooked" data-live={mounted ? '' : undefined}>
      <p className="itw-now" aria-live="off">
        {t === null ? hint : <><span className="itw-now-t">{mmss(t)}</span> {nowOverlooked(score, t)}</>}
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
          {t !== null && <Sounding layout={layout} ids={sounding} />}
          {t !== null && (
            <PlayheadRule frame={layout.frame} lines={layout.lines} t={t} top={(k) => lineIndex(k).y + 2} bottom={(k) => lineIndex(k).bottom + 7} />
          )}
        </svg>
        <div ref={readoutRef} className="dv-readout itw-readout" hidden aria-hidden="true" />
      </div>
      <Legend />

      <ol className="itw-parts" aria-label="The days of this edition">
        {score.days.map((d) => {
          const at = t === null ? null : soloistAt(score, d.index, t)
          const link = links.days[d.index]
          return (
            <li key={d.index} className={activeDay === d.index ? 'itw-part is-on' : 'itw-part'}>
              <p className="itw-part-head">
                <span className="itw-part-day">{dayShort(d.day)}</span>
                <span className="itw-part-meta">
                  {d.fieldName} · {d.instrument}
                </span>
                <PlayFrom mounted={mounted} at={d.from} label={`Play ${dayName(d.day)}`} onSeek={seek} />
              </p>
              <p className="itw-part-text">“{d.text}”</p>
              <p className="itw-part-src">
                <SourceLink href={link?.text ?? null} label={sourceName(d.source)} /> · attention {pct(d.attention)} on its platform
                {d.kept ? '' : ' · ended with its day'}
              </p>
              <DayStaff day={d} eighth={at ? at.eighth : null} note={at ? at.note : null} />
              <p className="itw-part-note">
                Motif: {d.motif.length} notes in {d.eighths} eighths ({d.loop} s), looped from {mmss(d.motifFrom)}. {entriesLine(d)}
              </p>
              {d.attended.length > 0 && (
                <details className="itw-murmured">
                  <summary>Murmured underneath: the day’s most attended</summary>
                  <ul>
                    {d.attended.map((a, k) => (
                      <li key={k}>
                        “{a.text}” <span className="itw-muted">{a.fieldName} · {pct(a.attention)}</span>{' '}
                        <SourceLink href={link?.attended[k] ?? null} label="source" />
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
