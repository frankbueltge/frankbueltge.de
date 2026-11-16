// src/components/ill-tempered-week/FormScore.tsx — the score of Unison or Turn pressed in a form the week chose
// (2026-11-16), following its audio. The standing scores (UnisonScore.tsx, TurnScore.tsx) are not touched.
//
// The seven duties (.claude/rules/dataviz-figures.md) as in the standing scores: every mark and sentence from
// src/lib/ill-tempered-week/score-forms.ts; the server render is the floor (every day, its sentence and its links are
// in the markup); no style attribute, no hex; the playhead follows the audio's own clock under reduced motion; the
// readout is clamped and never a hit target; no chart library; mono ink (every voice has a row of its own).
import * as React from 'react'

import type { OverlookedForm, TurnForm, UnisonForm } from '@/lib/ill-tempered-week/albums'
import { dayName, dayShort, mmss } from '@/lib/ill-tempered-week/score'
import {
  describeForm,
  hitForm,
  layoutForm,
  nowForm,
  overlookedFormScore,
  turnFormScore,
  unisonFormScore,
  type FormLayout,
  type FormScore as Score,
  type MarkKind,
  type RegionKind,
} from '@/lib/ill-tempered-week/score-forms'

import { byTouch, PlayFrom, PlayheadRule, SourceLink, svgPoint, useBoxReadout, useMounted, usePlayhead, useWidth } from './score-kit'

export interface FormScoreProps {
  record: OverlookedForm | UnisonForm | TurnForm
  piece: 'overlooked' | 'unison' | 'turn'
  /** each day's sentence link, by day, where the day file holds it */
  saidLinks: Record<string, string | null>
  audioId: string
  id: string
  label: string
  hint: string
}

const MARK_CLASS: Record<MarkKind, string> = {
  lead: 'itw-fm-note itw-fm-lead',
  other: 'itw-fm-note itw-fm-other',
  pedal: 'itw-fm-pedal',
  brass: 'itw-fm-brass',
  said: 'itw-fm-said',
  beat: 'itw-cell',
  'beat-full': 'itw-cell-full',
}
const REGION_CLASS: Record<RegionKind, string> = {
  block: 'itw-fm-block',
  leadband: 'itw-fm-leadband',
  stroke: 'itw-fm-stroke',
  step: 'itw-fm-step',
  turn: 'itw-saidbar',
  cut: 'itw-fm-cut',
}

const Drawing = React.memo(function Drawing({ layout }: { layout: FormLayout }) {
  const { frame } = layout
  return (
    <>
      {layout.lines.map((line) => {
        const xEnd = Math.round((frame.left + (line.span.t1 - line.span.t0) * frame.pxPerSecond) * 10) / 10
        return (
          <g key={line.span.index}>
            {line.rows.map((r) => (
              <g key={r.id}>
                <rect className="itw-row" x={frame.left} y={r.y} width={xEnd - frame.left} height={layout.rowH} />
                <text className="itw-lab" x={frame.left - 8} y={r.y + layout.rowH - 2} textAnchor="end">
                  {r.label}
                </text>
              </g>
            ))}
            {line.regions.map((g) => (
              <rect key={g.id} className={REGION_CLASS[g.kind]} x={g.x} y={g.y} width={g.w} height={g.h} />
            ))}
            {line.marks.map((m) => (
              <rect key={m.id} className={`${MARK_CLASS[m.kind]} ink-${m.ink}`} x={m.x} y={m.y} width={m.w} height={m.h} rx={m.kind === 'lead' || m.kind === 'other' ? 2 : 0} />
            ))}
            {line.days.map((d) => (
              <g key={d.index}>
                <line className="itw-daysep" x1={d.x} x2={d.x} y1={line.y + 2} y2={line.rowsBottom + 2} />
                <text className="itw-daylab" x={d.x + 4} y={line.y + 11}>
                  {d.label}
                </text>
              </g>
            ))}
            <line className="itw-axis" x1={frame.left} x2={xEnd} y1={line.rowsBottom + 4} y2={line.rowsBottom + 4} />
            {line.ticks.map((tk) => (
              <g key={tk.label}>
                <line className="itw-tick" x1={tk.x} x2={tk.x} y1={line.rowsBottom + 4} y2={line.rowsBottom + 7} />
                <text className="itw-ticklab" x={tk.x} y={line.rowsBottom + 16} textAnchor="middle">
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

function Swatch({ kind }: { kind: MarkKind | RegionKind }) {
  const body: Record<MarkKind | RegionKind, React.ReactNode> = {
    lead: <rect className="itw-fm-note itw-fm-lead ink-4" x={2} y={5} width={30} height={4} rx={2} />,
    other: <rect className="itw-fm-note itw-fm-other ink-3" x={2} y={5} width={30} height={4} rx={2} />,
    pedal: <rect className="itw-fm-pedal" x={0} y={5} width={36} height={4} />,
    brass: <rect className="itw-fm-brass" x={2} y={2} width={32} height={10} />,
    said: <rect className="itw-fm-said" x={2} y={2} width={32} height={10} />,
    beat: <><rect className="itw-row" x={0} y={0} width={36} height={14} /><rect className="itw-cell" x={1} y={8} width={16} height={6} /></>,
    'beat-full': <><rect className="itw-row" x={0} y={0} width={36} height={14} /><rect className="itw-cell-full" x={1} y={1} width={16} height={13} /></>,
    block: <rect className="itw-fm-block" x={1} y={1} width={34} height={12} />,
    leadband: <rect className="itw-fm-leadband" x={1} y={3} width={34} height={8} />,
    stroke: <rect className="itw-fm-stroke" x={14} y={0} width={8} height={14} />,
    step: <rect className="itw-fm-step" x={10} y={0} width={16} height={14} />,
    turn: <rect className="itw-saidbar" x={6} y={1} width={24} height={12} />,
    cut: <rect className="itw-fm-cut" x={10} y={0} width={16} height={14} />,
  }
  return (
    <svg className="itw-key-swatch" viewBox="0 0 36 14" aria-hidden="true">
      {body[kind]}
    </svg>
  )
}

export default function FormScore({ record, piece, saidLinks, audioId, id, label, hint }: FormScoreProps) {
  const score: Score = React.useMemo(
    () => (piece === 'overlooked' ? overlookedFormScore(record as OverlookedForm) : piece === 'unison' ? unisonFormScore(record as UnisonForm) : turnFormScore(record as TurnForm)),
    [record, piece],
  )
  const rootRef = React.useRef<HTMLDivElement>(null)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<HTMLDivElement>(null)
  const width = useWidth(rootRef)
  const mounted = useMounted()
  const layout = React.useMemo(() => layoutForm(score, width), [score, width])
  const { t, seek } = usePlayhead(audioId)
  const readout = useBoxReadout(boxRef, readoutRef)

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitForm(score, layout, p.x, p.y) : null
    const desc = hit?.id ? describeForm(score, hit.id) : null
    if (desc) readout.show(desc.head, desc.body, e.clientX, e.clientY)
    else readout.hide()
  }
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitForm(score, layout, p.x, p.y) : null
    if (!hit) return
    seek(hit.t)
    const desc = byTouch(e) && hit.id ? describeForm(score, hit.id) : null
    if (desc) readout.flash(desc.head, desc.body, e.clientX, e.clientY)
  }
  const active = t === null ? -1 : [...score.days].reverse().find((d) => d.from <= t + 1e-6)?.index ?? -1

  return (
    <div ref={rootRef} id={id} className="itw-score" data-island={`itw-form-${piece}`} data-form={score.form} data-live={mounted ? '' : undefined}>
      <p className="itw-now" aria-live="off">
        {t === null ? hint : <><span className="itw-now-t">{mmss(t)}</span> {nowForm(score, t)}</>}
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
          {t !== null && (
            <PlayheadRule frame={layout.frame} lines={layout.lines} t={t} top={(k) => layout.lines[k]!.rowsTop - 2} bottom={(k) => layout.lines[k]!.rowsBottom + 4} />
          )}
        </svg>
        <div ref={readoutRef} className="dv-readout itw-readout" hidden aria-hidden="true" />
      </div>
      <ul className="itw-legend" aria-label="How to read this score">
        {score.legend.map((k) => (
          <li key={k.kind}>
            <Swatch kind={k.kind} />
            <span>{k.text}</span>
          </li>
        ))}
      </ul>
      <ol className="itw-measures" aria-label="The days">
        {score.days.map((d) => (
          <li key={d.index} className={active === d.index ? 'itw-mday is-on' : 'itw-mday'}>
            <p className="itw-part-head">
              <span className="itw-part-day">{dayShort(d.day)}</span>
              <span className="itw-part-meta">{d.note}</span>
              <PlayFrom mounted={mounted} at={d.from} label={`Play ${dayName(d.day)}`} onSeek={seek} />
            </p>
            {d.said && (
              <p className="itw-part-text">
                Said: “{d.said}” <SourceLink href={saidLinks[d.day] ?? null} label="source" />
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
