/** Reine Encoding-Funktionen (Wert → Geometrie) für eine begrenzte horizontale PUE-Skala.
 *  Rein/getestet, kein Schmuck — Muster: src/lib/praemie/chart.ts. Degenerate Eingaben
 *  werfen nie; sie geben Sentinel-Werte zurück (-1 bei scaleX/x-Positionen, null/[] bei
 *  Kollektionen), analog zu praemie/chart.ts' '' bei Pfaden. */

export type Domain = [number, number]

export const SR_CHART_W = 640

/** Lineare Skala: value ∈ domain → x ∈ [0, width]. Entartetes Domain (min ≥ max) → -1,
 *  statt NaN zu produzieren. */
export function scaleX(value: number, domain: Domain, width: number): number {
  const [min, max] = domain
  if (max <= min) return -1
  return ((value - min) / (max - min)) * width
}

/** x-Position des physikalischen Bodens (Standard 1,0) auf der Skala. */
export function floorX(domain: Domain, width: number, floor = 1.0): number {
  return scaleX(floor, domain, width)
}

/** Zone links des Bodens (Werte < floor) — dort liegt "unmöglich". null, wenn der Boden
 *  außerhalb des Domains liegt (kein sinnvoller Zonen-Ausschnitt zeichenbar) oder das
 *  Domain entartet ist. */
export function impossibleZone(
  domain: Domain,
  width: number,
  floor = 1.0,
): { x: number; w: number } | null {
  const [min, max] = domain
  if (max <= min) return null
  if (floor < min || floor > max) return null
  return { x: 0, w: scaleX(floor, domain, width) }
}

export interface HatchLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

/** Deterministische 45°-Schraffur-Linien über eine Zone (z. B. impossibleZone), y ∈ [0, height].
 *  Linien beginnen bei zone.x, im Abstand `spacing`, bis einschließlich zone.x + zone.w. */
export function hatchLines(zone: { x: number; w: number }, height: number, spacing: number): HatchLine[] {
  if (zone.w <= 0 || height <= 0 || spacing <= 0) return []
  const lines: HatchLine[] = []
  for (let x = zone.x; x <= zone.x + zone.w; x += spacing) {
    lines.push({ x1: x, y1: 0, x2: x + height, y2: height })
  }
  return lines
}

export interface Tick {
  value: number
  x: number
}

/** Achsen-Ticks im Abstand `step` innerhalb des Domains, mit vorab berechneter x-Position.
 *  Start ist das erste Vielfache von step ≥ domain-min, damit die Positionen deterministisch
 *  und unabhängig von domain-min selbst sind. */
export function ticks(domain: Domain, step: number, width = SR_CHART_W): Tick[] {
  const [min, max] = domain
  if (max <= min || step <= 0) return []
  const start = Math.ceil(min / step) * step
  const out: Tick[] = []
  const EPS = 1e-9
  for (let v = start; v <= max + EPS; v += step) {
    const value = Math.round(v * 1e10) / 1e10 // Fließkomma-Drift beim Aufsummieren glätten
    out.push({ value, x: scaleX(value, domain, width) })
  }
  return out
}
