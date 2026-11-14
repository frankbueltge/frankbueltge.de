// src/components/ill-tempered-week/UnisonScore.tsx — Unison as a score, following its audio (2026-11-14).
//
// Pitch up, time right: every war signal of the week is the string glissando it became, drawn from its spoken pitch to
// where it arrived, against the lines of A's harmonic chord it glides towards. A day whose press agreed glides onto
// the lines; a day that did not stays a cluster. Under it, each day: how far the press agreed, the headline said over
// the chord, and the one the solo double bass plays, each with its link.
//
// The seven duties (.claude/rules/dataviz-figures.md) as in OverlookedScore.tsx: every position, time and sentence
// from src/lib/ill-tempered-week/score-unison.ts; the server render is the floor; no style attribute, no hex; the
// playhead follows the audio's own clock under reduced motion; the readout is clamped and never a hit target; no chart
// library; mono ink, attention told by stroke weight, tremolo by a dashed stroke.
import * as React from 'react'

import type { Unison } from '@/lib/ill-tempered-week/albums'
import type { UnisonLinks } from '@/lib/ill-tempered-week/pages'
import { dayName, dayShort, mmss } from '@/lib/ill-tempered-week/score'
import {
  describeGlide,
  describeUnisonDay,
  FORM,
  glidesAt,
  hitUnison,
  layoutUnison,
  nowUnison,
  unisonScore,
  type UnisonLayout,
} from '@/lib/ill-tempered-week/score-unison'

import { byTouch, PlayFrom, PlayheadRule, SourceLink, svgPoint, useBoxReadout, useMounted, usePlayhead, useWidth } from './score-kit'

export type { UnisonLinks } from '@/lib/ill-tempered-week/pages'

export interface UnisonScoreProps {
  record: Unison
  week: string
  links: UnisonLinks
  audioId: string
  id: string
  label: string
  hint: string
}

const pct = (x: number): string => `${Math.round(100 * x)} %`

const Drawing = React.memo(function Drawing({ layout }: { layout: UnisonLayout }) {
  const { frame } = layout
  return (
    <>
      {layout.lines.map((line) => {
        const xEnd = Math.round((frame.left + (line.span.t1 - line.span.t0) * frame.pxPerSecond) * 10) / 10
        const zig = (x: number, w: number, y: number): string => {
          let d = `M${x} ${y}`
          for (let k = 0, xx = x; xx < x + w; k++, xx += 2) d += `L${Math.min(x + w, xx + 2)} ${k % 2 === 0 ? y - 2.5 : y + 2.5}`
          return d
        }
        return (
          <g key={line.span.index}>
            {line.peaks.map((p) => (
              <rect key={p.day} className="itw-peak" x={p.x} y={line.plotTop} width={p.w} height={line.plotBottom - line.plotTop} />
            ))}
            {line.chord.map((c) => (
              <g key={c.hz}>
                <line className={c.a ? 'itw-chord itw-chord-a' : 'itw-chord'} x1={frame.left} x2={xEnd} y1={c.y} y2={c.y} />
                {(c.a || !frame.narrow) && (
                  <text className={c.a ? 'itw-hz itw-hz-a' : 'itw-hz'} x={frame.left - 6} y={c.y + 3} textAnchor="end">
                    {c.label}
                  </text>
                )}
              </g>
            ))}
            {line.days.map((d) => (
              <g key={d.index}>
                <line className="itw-daysep" x1={d.x} x2={d.x} y1={line.y + 2} y2={line.plotBottom + 14} />
                <text className="itw-daylab" x={d.x + 4} y={line.y + 11}>
                  {d.label}
                </text>
                <rect className="itw-agree-track" x={d.x + 4} y={line.y + 16} width={Math.min(64, d.w - 8)} height={3} />
                <rect className={d.peak ? 'itw-agree-fill' : 'itw-agree-fill itw-agree-none'} x={d.x + 4} y={line.y + 16} width={d.barW} height={3} />
                <text className="itw-note" x={d.x + 4} y={line.y + 29}>
                  {d.note}
                </text>
              </g>
            ))}
            <path className="itw-tail" d={line.glides.map((g) => `M${g.x2} ${g.y2}H${g.x3}`).join('')} />
            {line.glides.map((g) => (
              <line key={g.id} className={`itw-gl w${g.weight}${g.tremolo ? ' itw-trem' : ''}`} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} />
            ))}
            {line.peaks.map((p) =>
              p.said === null ? null : p.saidW > 0 ? (
                <rect key={`s${p.day}`} className="itw-said" x={p.said} y={line.plotTop + 3} width={p.saidW} height={5} rx={1.5} />
              ) : (
                <path key={`s${p.day}`} className="itw-said-mark" d={`M${p.said} ${line.plotTop + 1}l4 4l-4 4l-4 -4z`} />
              ),
            )}
            {line.bass.map((b) => (
              <g key={`b${b.day}`}>
                {b.notes.map((n, k) => (
                  <rect key={k} className="itw-bassn" x={n.x} y={n.y - 1.5} width={n.w} height={3} />
                ))}
                {b.notes.length === 0 && <path className="itw-bass" d={`M${b.x} ${b.y - 5}l5 5l-5 5l-5 -5z`} />}
              </g>
            ))}
            {line.strokes.map((s) => (
              <line key={`k${s.day}`} className="itw-timp" x1={s.x} x2={s.x} y1={line.laneY} y2={line.laneY + 8} />
            ))}
            {line.rolls.map((r) => (
              <path key={`r${r.day}`} className="itw-roll" d={zig(r.x, r.w, line.laneY + 4)} />
            ))}
            <line className="itw-axis" x1={frame.left} x2={xEnd} y1={line.laneY + 12} y2={line.laneY + 12} />
            {line.ticks.map((tk) => (
              <g key={tk.label}>
                <line className="itw-tick" x1={tk.x} x2={tk.x} y1={line.laneY + 12} y2={line.laneY + 15} />
                <text className="itw-ticklab" x={tk.x} y={line.laneY + 24} textAnchor="middle">
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
        {sw(<line className="itw-gl w2" x1={2} y1={12} x2={30} y2={4} />)}
        <span>One war signal: a string glissando from its headline’s spoken pitch towards A’s chord, entering at the hour it was published (where its platform gives no hour, at a place in the day drawn once from its own text). Higher sections for more attended signals.</span>
      </li>
      <li>
        {sw(
          <>
            <line className="itw-gl w0" x1={2} y1={4} x2={34} y2={4} />
            <line className="itw-gl w3" x1={2} y1={10} x2={34} y2={10} />
          </>,
        )}
        <span>Thicker: more attended, longer and louder. Dashed: tremolo, on a busy day.</span>
      </li>
      <li>
        {sw(
          <>
            <line className="itw-chord itw-chord-a" x1={0} x2={36} y1={4} y2={4} />
            <line className="itw-chord" x1={0} x2={36} y1={10} y2={10} />
          </>,
        )}
        <span>A’s harmonic chord, 4:5:6:7 in every octave; A itself drawn solid. A glissando glides towards its nearest line as far as the press agreed that day.</span>
      </li>
      <li>
        {sw(
          <>
            <rect className="itw-peak" x={4} y={0} width={20} height={14} />
            <path className="itw-said-mark" d="M8 1l4 4l-4 4l-4 -4z" />
          </>,
        )}
        <span>From {Math.round(100 * FORM.threshold)} % agreement on: brass and timpani hold the chord, and the day’s most attended war headline is said.</span>
      </li>
      <li>
        {sw(<path className="itw-bass" d="M12 2l5 5l-5 5l-5 -5z" />)}
        <span>The solo double bass: the speech melody of the day’s least attended war headline, outside the chord.</span>
      </li>
      <li>
        {sw(
          <>
            <line className="itw-timp" x1={4} x2={4} y1={3} y2={11} />
            <path className="itw-roll" d="M10 7L12 4.5L14 9.5L16 4.5L18 9.5L20 4.5L22 9.5L24 4.5L26 9.5L28 7" />
          </>,
        )}
        <span>Timpani: a stroke on A opens each day; a roll swells into the chord.</span>
      </li>
    </ul>
  )
}

export default function UnisonScore({ record, week, links, audioId, id, label, hint }: UnisonScoreProps) {
  const score = React.useMemo(() => unisonScore(record, week), [record, week])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<HTMLDivElement>(null)
  const width = useWidth(rootRef)
  const mounted = useMounted()
  const layout = React.useMemo(() => layoutUnison(score, width), [score, width])
  const { t, seek } = usePlayhead(audioId)
  const readout = useBoxReadout(boxRef, readoutRef)

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitUnison(layout, p.x, p.y) : null
    const h = hit?.hit
    const desc = !h ? null : h.kind === 'glide' ? describeGlide(score, h.id) : describeUnisonDay(score, h.day, h.kind)
    if (desc) readout.show(desc.head, desc.body, e.clientX, e.clientY)
    else readout.hide()
  }
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY)
    const hit = p ? hitUnison(layout, p.x, p.y) : null
    if (!hit) return
    seek(hit.t)
    const h = byTouch(e) ? hit.hit : null
    const desc = !h ? null : h.kind === 'glide' ? describeGlide(score, h.id) : describeUnisonDay(score, h.day, h.kind)
    if (desc) readout.flash(desc.head, desc.body, e.clientX, e.clientY)
  }

  const on = new Set(t === null ? [] : glidesAt(score, t))
  const activeDay = t === null ? -1 : score.days.reduce((k, d, i) => (t >= d.from ? i : k), -1)

  return (
    <div ref={rootRef} id={id} className="itw-score" data-island="itw-unison" data-live={mounted ? '' : undefined}>
      <p className="itw-now" aria-live="off">
        {t === null ? hint : <><span className="itw-now-t">{mmss(t)}</span> {nowUnison(score, t)}</>}
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
            <g className="itw-gl-on" aria-hidden="true">
              {layout.lines.flatMap((line) =>
                line.glides.filter((g) => on.has(g.id)).map((g) => <line key={`${line.span.index}-${g.id}`} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} />),
              )}
            </g>
          )}
          {t !== null && (
            <PlayheadRule frame={layout.frame} lines={layout.lines} t={t} top={(k) => layout.lines[k]!.plotTop} bottom={(k) => layout.lines[k]!.laneY + 12} />
          )}
        </svg>
        <div ref={readoutRef} className="dv-readout itw-readout" hidden aria-hidden="true" />
      </div>
      <Legend />

      <ol className="itw-udays" aria-label="The days of the week">
        {score.days.map((d) => {
          const link = links.days[d.index]
          return (
            <li key={d.index} className={activeDay === d.index ? 'itw-uday is-on' : 'itw-uday'}>
              <p className="itw-part-head">
                <span className="itw-part-day">{dayShort(d.day)}</span>
                <span className="itw-part-meta">
                  {d.signals} war signals · {pct(d.agreement)} on {d.story}
                </span>
                <PlayFrom mounted={mounted} at={d.from} label={`Play ${dayName(d.day)}`} onSeek={seek} />
              </p>
              <svg className="itw-agree" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">
                <rect className="itw-agree-track" x={0} y={0} width={100} height={4} />
                <rect className={d.peak ? 'itw-agree-fill' : 'itw-agree-fill itw-agree-none'} x={0} y={0} width={Math.round(100 * d.agreement)} height={4} />
                <line className="itw-agree-mark" x1={100 * FORM.threshold} x2={100 * FORM.threshold} y1={0} y2={4} />
              </svg>
              {d.said ? (
                <p className="itw-part-text">
                  Said over the chord at {mmss(d.peakAt)}: “{d.said}” <SourceLink href={link?.said ?? null} label="source" />
                </p>
              ) : (
                <p className="itw-part-text itw-muted">
                  {d.last ? 'The last day takes no chord: the week ends without agreement.' : `Under ${pct(FORM.threshold)} agreed: no brass, no chord; the cluster stays.`}
                </p>
              )}
              <p className="itw-part-src">
                Solo double bass at {mmss(d.bassAt)}: “{d.overlooked}” <SourceLink href={link?.overlooked ?? null} label="source" />
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
