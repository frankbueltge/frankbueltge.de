/** Jahr-bewusste Pfade für das Police-Diagramm — zwei Reihen über eine gemeinsame Jahres-Achse.
 *  Rein/getestet, kein Schmuck: x = Jahr, y = Wert (0 unten). */
import { bandScale, polyPath } from '@/lib/dataviz/geometry'

export const PCHART_W = 640
export const PCHART_H = 200

export interface YearPoint {
  year: number
  value: number
}

/** x = Jahr (xMin..xMax → 0..w), y = Wert (0..valMax → unten..oben).
 *  Leer bei weniger als zwei Punkten, entartetem Jahresbereich oder valMax ≤ 0. One-line
 *  wrapper around dataviz/geometry.ts's polyPath + bandScale (numeric-equivalence proof in
 *  geometry.test.ts). */
export function yearLinePath(
  points: YearPoint[],
  xMin: number,
  xMax: number,
  valMax: number,
  w = PCHART_W,
  h = PCHART_H,
): string {
  if (points.length < 2 || xMax <= xMin || valMax <= 0) return ''
  const xScale = bandScale([xMin, xMax], [0, w])
  const yScale = bandScale([0, valMax], [h - 1, 1])
  return polyPath(points.map((p) => ({ x: xScale(p.year), y: yScale(Math.max(0, p.value)) })))
}

/** Wie yearLinePath, zur Grundlinie geschlossen — für eine zarte Flächenfüllung. */
export function yearAreaPath(
  points: YearPoint[],
  xMin: number,
  xMax: number,
  valMax: number,
  w = PCHART_W,
  h = PCHART_H,
): string {
  if (points.length < 2 || xMax <= xMin || valMax <= 0) return ''
  const xScale = bandScale([xMin, xMax], [0, w])
  const yScale = bandScale([0, valMax], [h - 1, 1])
  return polyPath(
    points.map((p) => ({ x: xScale(p.year), y: yScale(Math.max(0, p.value)) })),
    { closeToBaseline: h },
  )
}
