/** Jahr-bewusste Pfade für das Police-Diagramm — zwei Reihen über eine gemeinsame Jahres-Achse.
 *  Rein/getestet, kein Schmuck: x = Jahr, y = Wert (0 unten). */
export const PCHART_W = 640
export const PCHART_H = 200

export interface YearPoint {
  year: number
  value: number
}

/** x = Jahr (xMin..xMax → 0..w), y = Wert (0..valMax → unten..oben).
 *  Leer bei weniger als zwei Punkten, entartetem Jahresbereich oder valMax ≤ 0. */
export function yearLinePath(
  points: YearPoint[],
  xMin: number,
  xMax: number,
  valMax: number,
  w = PCHART_W,
  h = PCHART_H,
): string {
  if (points.length < 2 || xMax <= xMin || valMax <= 0) return ''
  const pts = points.map((p) => {
    const x = ((p.year - xMin) / (xMax - xMin)) * w
    const y = h - (Math.max(0, p.value) / valMax) * (h - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pts.join(' L')}`
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
  const line = yearLinePath(points, xMin, xMax, valMax, w, h)
  if (!line) return ''
  const xAt = (year: number) => (((year - xMin) / (xMax - xMin)) * w).toFixed(1)
  return `${line} L${xAt(points[points.length - 1].year)},${h.toFixed(1)} L${xAt(points[0].year)},${h.toFixed(1)} Z`
}
