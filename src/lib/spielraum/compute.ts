/** Reine, deterministische Ableitungen aus dem Spielraum-Register. Keine Rundung in der
 *  Logik — Rundung ist Darstellung (fmtRatio/fmtPct) und passiert erst am Rand. */
import type { Locale } from '@/lib/site'
import type { Company, Consumption, MwhEntry, PueEntry, Tier } from './types'
import { hasDisclosure } from './types'

/** Verbleibender Spielraum in Prozent: (pue − 1) / pue · 100. Volle Präzision. */
export function headroomPct(pue: number): number {
  return ((pue - 1) / pue) * 100
}

/** Die PUE, die die Basis gehalten hätte, wenn sie das Wachstum exakt hätte auffangen müssen:
 *  basePue / (1 + growthPct/100). Liegt das Ergebnis unter dem Boden (1,0), war KEINE
 *  Effizienzsteigerung ausreichend — das Wachstum war physikalisch nicht auffangbar. */
export function requiredPue(basePue: number, growthPct: number): number {
  return basePue / (1 + growthPct / 100)
}

export interface DerivedGrowth {
  period: string
  value: number
  /** Offenlegung der Rechnung, z. B. "(14975435-11167416)/11167416 = +34.1%". */
  arithmetic: string
  /** Tier der SPÄTEREN (b) MWh-Stützstelle — sie beschreibt die Zielperiode des Wachstums. */
  tier: Tier
}

/** Wachstum aus einer aufsteigend sortierten MWh-Reihe ableiten: je aufeinanderfolgendes
 *  Paar (a, b) → (b−a)/a·100, period = die spätere Periode (b). Erwartet, dass `mwh` bereits
 *  chronologisch aufsteigend vorliegt (so wie im Register geführt) — wird nicht neu sortiert,
 *  weil Perioden-Strings (z. B. "FY23") nicht generisch sortierbar sind. */
export function growthFromMwh(mwh: MwhEntry[]): DerivedGrowth[] {
  const out: DerivedGrowth[] = []
  for (let i = 1; i < mwh.length; i++) {
    const a = mwh[i - 1]
    const b = mwh[i]
    const value = ((b.value - a.value) / a.value) * 100
    const sign = value >= 0 ? '+' : ''
    const arithmetic = `(${b.value}-${a.value})/${a.value} = ${sign}${value.toFixed(1)}%`
    out.push({ period: b.period, value, arithmetic, tier: b.tier })
  }
  return out
}

/** Vorperiode eines Perioden-Labels: "2024"→"2023", "FY25"→"FY24". Regex auf
 *  (Buchstaben-Präfix)(Ziffern) am Stringende; unbekanntes Format (z. B. "reported 2024",
 *  das ein Leerzeichen vor den Ziffern hat) → null, nicht geraten. */
export function priorPeriod(period: string): string | null {
  const m = /^([A-Za-z]*)(\d+)$/.exec(period)
  if (!m) return null
  const [, prefix, digits] = m
  const n = Number(digits) - 1
  if (n < 0) return null
  return prefix + String(n).padStart(digits.length, '0')
}

/** Letzter PUE-Eintrag der Firma (Register führt die Serie chronologisch aufsteigend). */
export function latestPue(company: Company): PueEntry | null {
  const series = company.pue.series
  return series.length > 0 ? series[series.length - 1] : null
}

function findPueByPeriod(company: Company, period: string): PueEntry | null {
  return company.pue.series.find((e) => e.period === period) ?? null
}

export interface GrowthInput {
  period: string
  growthPct: number
  growthSource: 'disclosed' | 'derived'
  arithmetic?: string
  quote?: string
  scopeDe?: string
  scopeEn?: string
  tier: Tier
}

/** Wachstumsreihe einer Firma vereinheitlicht — offengelegt (growth_pct) oder aus MWh
 *  abgeleitet (mwh). Keine Offenlegung (discloses: false) → leere Liste, keine Rechnung
 *  möglich (required_PUE braucht ein Wachstum). */
function growthInputs(consumption: Consumption): GrowthInput[] {
  if (!hasDisclosure(consumption)) return []
  if (consumption.form === 'growth_pct') {
    return consumption.growth_pct.map((g) => ({
      period: g.period,
      growthPct: g.value,
      growthSource: 'disclosed' as const,
      quote: g.quote,
      scopeDe: g.scope_de,
      scopeEn: g.scope_en,
      tier: g.tier,
    }))
  }
  // form === 'mwh'
  return growthFromMwh(consumption.mwh).map((d) => ({
    period: d.period,
    growthPct: d.value,
    growthSource: 'derived' as const,
    arithmetic: d.arithmetic,
    scopeDe: consumption.scope_de,
    scopeEn: consumption.scope_en,
    tier: d.tier,
  }))
}

export interface Round {
  period: string
  growthPct: number
  growthSource: 'disclosed' | 'derived'
  /** Offenlegung der Rechnung, nur bei growthSource === 'derived'. */
  arithmetic?: string
  quote?: string
  scopeDe?: string
  scopeEn?: string
  tier: Tier
  basePue: number
  basePeriod: string
  /** true, wenn die Vorperiode keine PUE hatte und stattdessen die EIGENE Periode als
   *  Basis-Näherung dient (offengelegt, nicht verschwiegen). */
  baseApprox: boolean
  requiredPue: number
  impossible: boolean
}

/** Baut je Wachstumsjahr eine Runde. Basis-Disziplin: die PUE der VORperiode; fehlt sie,
 *  die PUE der EIGENEN Periode (baseApprox: true); fehlt auch die, KEINE Runde für dieses
 *  Jahr — "keine Offenlegung, keine Runde" gilt ebenso für eine fehlende Basis. */
export function buildRounds(company: Company, floor: number): Round[] {
  const rounds: Round[] = []
  for (const g of growthInputs(company.consumption)) {
    const prior = priorPeriod(g.period)
    let basePueEntry = prior ? findPueByPeriod(company, prior) : null
    let baseApprox = false
    if (!basePueEntry) {
      basePueEntry = findPueByPeriod(company, g.period)
      baseApprox = true
    }
    if (!basePueEntry) continue // weder Vor- noch Eigenperioden-PUE → keine Runde

    const req = requiredPue(basePueEntry.figure, g.growthPct)
    rounds.push({
      period: g.period,
      growthPct: g.growthPct,
      growthSource: g.growthSource,
      arithmetic: g.arithmetic,
      quote: g.quote,
      scopeDe: g.scopeDe,
      scopeEn: g.scopeEn,
      tier: g.tier,
      basePue: basePueEntry.figure,
      basePeriod: basePueEntry.period,
      baseApprox,
      requiredPue: req,
      impossible: req < floor,
    })
  }
  return rounds
}

function localeTag(locale: Locale): string {
  return locale === 'de' ? 'de-DE' : 'en-GB'
}

/** PUE-artiges Verhältnis, zwei Nachkommastellen (Darstellung — die Logik rundet nie). */
export function fmtRatio(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Prozentzahl, Standard eine Nachkommastelle. */
export function fmtPct(value: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
