// src/lib/ecology/cycles.ts — the three cycles side by side: how a piece of research becomes
// public in each practice, in each practice's own words.
//
// The figure makes one claim, and makes it by shape rather than by sentence: THE THREE CHAINS ARE
// NOT THE SAME. They differ in length, in what they call each step, in how many gates they set,
// and in whether a human stands in the chain at all — and they differ because each practice
// decides its own protocol. Sovereignty is not asserted under the picture; it IS the picture.
//
// The Triptych's rule, which this inherits: one identical frame, three own vocabularies, so that
// "the difference a visitor sees between the three pictures is the PRACTICES' difference and not
// the layout's". Hence: same column width, same box height, same spacing — and not one shared
// stage name between them (anatomy.test.ts checks that).
//
// House rules, same as every figure here: no colour in the builder (the skin reads data-owner),
// no style attribute (the CSP drops them), a native <title> on every mark, and `still` strips the
// interaction hooks.

import { escapeXml } from '@/lib/dataviz/geometry'
import type { PracticeAnatomy, StageKind } from './anatomy'

const VB_W = 1180
const COL_W = 320
const COL_GAP = 50
const COL_X = [40, 40 + COL_W + COL_GAP, 40 + 2 * (COL_W + COL_GAP)] as const
const HEAD_H = 62
const BOX_H = 32
const BOX_GAP = 9
const ROW = BOX_H + BOX_GAP
const TOP = 34

export interface PlacedStage {
  practice: PracticeAnatomy
  index: number
  x: number
  y: number
  w: number
  h: number
}

export interface CyclesModel {
  columns: { practice: PracticeAnatomy; x: number; stages: PlacedStage[] }[]
  width: number
  height: number
  /** where the longest chain ends — the foot rule sits under it */
  chainBottom: number
}

export function buildCyclesModel(practices: readonly PracticeAnatomy[]): CyclesModel {
  const columns = practices.slice(0, 3).map((practice, ci) => {
    const x = COL_X[ci]
    const stages: PlacedStage[] = practice.stages.map((_, i) => ({
      practice,
      index: i,
      x,
      y: TOP + HEAD_H + i * ROW,
      w: COL_W,
      h: BOX_H,
    }))
    return { practice, x, stages }
  })
  const longest = Math.max(...columns.map((c) => c.stages.length))
  const chainBottom = TOP + HEAD_H + longest * ROW
  return { columns, width: VB_W, height: chainBottom + 30, chainBottom }
}

/**
 * Whether the artefact fits beside the step's own label inside one box, and is worth printing at
 * all. Two reasons it may be dropped from the drawing — never from the record, which keeps it in
 * the step's <title>, the detail panel and the table:
 *   · it repeats the label (the atelier names several steps after the file they write);
 *   · the pair would not fit, and an overlapping label is worse than a missing hint. The first
 *     draft of this figure collided in exactly two rows.
 * The measure is the mono advance width at each text size: label 11.5px, artefact 10.5px, in the
 * 320-unit box minus the glyph gutter and the right inset, with a gap between the two.
 */
export function showArtefact(label: string, artefact?: string): boolean {
  if (!artefact || artefact === label) return false
  const available = COL_W - 32 - 10 - 14
  return label.length * 6.9 + artefact.length * 6.3 <= available
}

/** A step's mark. Shape carries what KIND of step it is — never whose it is, never its state. */
function stageMark(kind: StageKind, cx: number, cy: number): string {
  const g = (body: string): string => `<g class="ec-glyph" data-stage-kind="${kind}">${body}</g>`
  switch (kind) {
    case 'work':
      // an open square: the practice working, nothing being decided
      return g(`<rect x="${cx - 4}" y="${cy - 4}" width="8" height="8" />`)
    case 'gate':
      // a chevron: something has to pass through
      return g(`<path d="M${cx - 4} ${cy - 5} L${cx + 4} ${cy} L${cx - 4} ${cy + 5}" />`)
    case 'human':
      // a filled diamond, and the only mark that is filled — a person is in the chain
      return g(`<path d="M${cx} ${cy - 6} L${cx + 6} ${cy} L${cx} ${cy + 6} L${cx - 6} ${cy} Z" />`)
    case 'land':
      // a baseline: the record being written
      return g(`<path d="M${cx - 5} ${cy + 4} H${cx + 5} M${cx - 5} ${cy} H${cx + 5}" />`)
  }
}

export interface CyclesRenderOptions {
  still?: boolean
  label: string
}

export function buildCyclesSvg(model: CyclesModel, opts: CyclesRenderOptions): string {
  const live = !opts.still
  const s: string[] = []
  s.push(
    `<svg class="ec-svg" viewBox="0 0 ${model.width} ${model.height}" role="img"` +
      ` preserveAspectRatio="xMidYMid meet" aria-label="${escapeXml(opts.label)}">`,
  )

  for (const col of model.columns) {
    const p = col.practice
    s.push(`<g class="ec-col" data-owner="${p.id}">`)

    // the column head: the persona's own name, its house, and its protocol as it titles itself
    s.push(`<text class="ec-persona" x="${col.x}" y="${TOP + 14}">${escapeXml(p.persona)}</text>`)
    s.push(
      `<text class="ec-house" x="${col.x}" y="${TOP + 30}">${escapeXml(p.house)}</text>`,
    )
    s.push(
      `<text class="ec-protocol" x="${col.x}" y="${TOP + 48}">${escapeXml(p.protocolTitle.text)}</text>`,
    )

    // the spine, drawn behind the boxes so a chain reads as one movement
    const first = col.stages[0]
    const last = col.stages[col.stages.length - 1]
    s.push(
      `<path class="ec-spine" d="M${col.x + 16} ${first.y + BOX_H / 2} V${last.y + BOX_H / 2}" />`,
    )

    col.stages.forEach((st, i) => {
      const stage = p.stages[i]
      const attrs = ['class="ec-stage"', `data-stage-kind="${stage.kind}"`, `data-owner="${p.id}"`]
      if (live) {
        attrs.push(`data-key="${escapeXml(`${p.id}:${i}`)}"`, 'tabindex="0"', 'role="button"')
      }
      s.push(`<g ${attrs.join(' ')}>`)
      const title = `${p.persona} — ${stage.label}: ${stage.what}`
      s.push(`<title>${escapeXml(title)}</title>`)
      s.push(`<rect class="ec-box" x="${st.x}" y="${st.y}" width="${st.w}" height="${st.h}" rx="3" />`)
      s.push(stageMark(stage.kind, st.x + 16, st.y + st.h / 2))
      s.push(
        `<text class="ec-label" x="${st.x + 32}" y="${st.y + st.h / 2 + 4}">${escapeXml(stage.label)}</text>`,
      )
      if (showArtefact(stage.label, stage.artefact)) {
        s.push(
          `<text class="ec-artefact" x="${st.x + st.w - 10}" y="${st.y + st.h / 2 + 4}">${escapeXml(stage.artefact as string)}</text>`,
        )
      }
      s.push('</g>')
    })

    // how far this chain runs — the number is the shape, so it is drawn, not written in prose
    s.push(
      `<text class="ec-count" x="${col.x}" y="${model.chainBottom + 14}">${col.stages.length} steps · ${
        p.stages.filter((x) => x.kind === 'gate').length
      } gates${p.stages.some((x) => x.kind === 'human') ? ' · one human gate' : ''}</text>`,
    )
    s.push('</g>')
  }

  s.push('</svg>')
  return s.join('')
}

export interface CycleRow {
  practice: string
  step: string
  kind: string
  what: string
  lands: string
  /** TableFallback takes Record<string, string | number>; this satisfies it while keeping the
   *  named fields above, rather than loosening the row type to a bare record. */
  [key: string]: string
}

export const CYCLE_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'practice', label: 'practice', nowrap: true },
  { key: 'step', label: 'step', nowrap: true },
  { key: 'kind', label: 'kind' },
  { key: 'what', label: 'what happens' },
  { key: 'lands', label: 'lands in' },
]

const KIND_WORD: Record<StageKind, string> = {
  work: 'the practice working',
  gate: 'a gate — it must pass',
  human: 'a human decides',
  land: 'the record, or the site admitting it',
}

export function cycleRows(practices: readonly PracticeAnatomy[]): CycleRow[] {
  return practices.flatMap((p) =>
    p.stages.map((s) => ({
      practice: p.persona,
      step: s.label,
      kind: KIND_WORD[s.kind],
      what: s.what,
      lands: s.artefact ?? '—',
    })),
  )
}
