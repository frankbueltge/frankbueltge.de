import type { Kpi, Locale, Rag } from './types'

/** Jüngster bzw. vorletzter Stützpunkt der Reihe. */
export const latest = (s: [number, number][]) => s[s.length - 1]
export const previous = (s: [number, number][]) => s[s.length - 2]

/** Prozent-Änderung jüngster vs. vorletzter Stützpunkt (auf Jahresdaten = YoY). */
export function yoyPercent(s: [number, number][]): number {
  const a = previous(s)?.[1]
  const b = latest(s)?.[1]
  if (a == null || b == null || a === 0) return 0
  return ((b - a) / Math.abs(a)) * 100
}

export function trend(s: [number, number][]): 'up' | 'down' | 'flat' {
  const d = yoyPercent(s)
  if (Math.abs(d) < 0.01) return 'flat'
  return d > 0 ? 'up' : 'down'
}

/**
 * RAG-Status aus der KONZERN-Wertung (good_when) abgeleitet — deterministisch.
 * „ok" = bewegt sich in die vom Konzern gewünschte Richtung UND über Ziel.
 */
export function ragStatus(kpi: Kpi): Rag {
  const val = latest(kpi.series)[1]
  const t = trend(kpi.series)
  const movingGood = kpi.good_when === 'high' ? t === 'up' : t === 'down'
  const aboveTarget = kpi.good_when === 'high' ? val >= kpi.target : val <= kpi.target
  if (movingGood && aboveTarget) return 'ok'
  if (movingGood || aboveTarget) return 'warn'
  return 'crit'
}

const STATUS: Record<Rag, { de: string; en: string }> = {
  ok: { de: 'über Plan', en: 'above plan' },
  warn: { de: 'unter Beobachtung', en: 'on watch' },
  crit: { de: 'kritisch', en: 'critical' },
}
export const statusLabel = (s: Rag, l: Locale) => STATUS[s][l]

/** Deterministische Executive Summary — kein LLM, Strings unter Testschutz. */
export function execSummary(kpis: Kpi[], l: Locale): string {
  const below = kpis.filter((k) => ragStatus(k) !== 'ok').length
  const hasInequality = kpis.some((k) => k.id === 'inequality' && ragStatus(k) === 'ok')
  if (l === 'de') {
    const ineq = hasInequality ? ' Die Ungleichheit übertrifft weiter den Plan.' : ''
    return `${below} von ${kpis.length} KPIs unter Plan in diesem Quartal.${ineq} Der Vorstand bleibt zuversichtlich.`
  }
  const ineq = hasInequality ? ' Inequality continues to outperform plan.' : ''
  return `${below} of ${kpis.length} KPIs below target this quarter.${ineq} The board remains optimistic.`
}
