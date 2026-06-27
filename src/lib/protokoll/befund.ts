/** „Der Befund" — deterministische Encoder + Referenzkarten für die aufklappbare Datum-Ansicht.
 *  Korridore sind aus den Python-Adapter-SPECs (pipelines/protokoll/src/protokoll/adapters/*.py,
 *  Feld `corridor=`) hierher gespiegelt, damit das Frontend die Lage im plausiblen Bereich zeigen
 *  kann, ohne das Tages-Schema zu ändern. Encoder stehen unter Test (befund.test.ts). */

export type Corridor = [number, number]

/** Plausibler Wertebereich je Größe — Spiegel der Adapter-SPECs. */
export const CORRIDORS: Record<string, Corridor> = {
  co2: [350, 500],
  seaice_north: [1, 18],
  seaice_south: [1, 22],
  sst: [15, 25],
  fires: [1_000, 500_000],
  quakes: [0, 500],
  population: [7.5e9, 9.5e9],
  refugees: [5e7, 2e8],
  food: [80, 250],
  rates: [-1, 8],
  oil: [20, 200],
  conflict: [0, 200_000],
  attention: [100_000, 100_000_000],
}

export type Family = 'deviation' | 'intensity' | 'price' | 'stock' | 'named'
export const FAMILY: Record<string, Family> = {
  co2: 'deviation', sst: 'deviation', seaice_north: 'deviation', seaice_south: 'deviation',
  quakes: 'intensity', fires: 'intensity', conflict: 'intensity',
  food: 'price', rates: 'price', oil: 'price',
  population: 'stock', refugees: 'stock',
  attention: 'named',
}

/** Welche Richtung „Belastung" bedeutet — färbt den Korridor-Marker. 'neutral' = kein Alarm.
 *  Editoriale Setzung (dokumentiert): bei Meereis ist *wenig* das Alarmzeichen. */
export type Polarity = 'high' | 'low' | 'neutral'
export const POLARITY: Record<string, Polarity> = {
  co2: 'high', sst: 'high', fires: 'high', quakes: 'high', conflict: 'high',
  refugees: 'high', food: 'high', oil: 'high', population: 'high',
  seaice_north: 'low', seaice_south: 'low',
  rates: 'neutral', attention: 'neutral',
}

/** Belegter Tiefenzeit-Hinweis für co2 — Einordnung, kein Messpunkt. */
export const DEEPTIME_CO2 = {
  since: { de: '~3 Millionen Jahren', en: '~3 million years' },
  note: {
    de: 'Höher als zu jedem Zeitpunkt, den Paläoklima-Rekonstruktionen erreichen.',
    en: 'Higher than at any point paleoclimate reconstructions reach.',
  },
}

/** Lage eines Werts im Korridor, geklemmt auf 0..1. */
export function corridorPosition(value: number, [min, max]: Corridor): number {
  if (max === min) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

export interface Streak { dir: 'up' | 'down' | 'flat'; len: number }

/** Zahl aufeinanderfolgender Schritte in der jüngsten Richtung (am Ende der Reihe). */
export function streak(values: number[]): Streak {
  if (values.length < 2) return { dir: 'flat', len: 0 }
  const last = values.length - 1
  const d = Math.sign(values[last] - values[last - 1])
  if (d === 0) return { dir: 'flat', len: 0 }
  let len = 0
  for (let i = last; i > 0; i--) {
    if (Math.sign(values[i] - values[i - 1]) === d) len++
    else break
  }
  return { dir: d > 0 ? 'up' : 'down', len }
}

/** Register-Stimme aus echten Daten: Rekord › Streak › Lage im Korridor. */
export function befundSatz(values: number[], corridor: Corridor, de: boolean): string {
  if (values.length < 2) return ''
  const latest = values[values.length - 1]
  const max = Math.max(...values)
  const min = Math.min(...values)
  if (values.length >= 3 && max !== min) {
    if (latest === max) return de ? 'Höchster Wert im verzeichneten Zeitraum.' : 'Highest value in the recorded period.'
    if (latest === min) return de ? 'Niedrigster Wert im verzeichneten Zeitraum.' : 'Lowest value in the recorded period.'
  }
  const s = streak(values)
  if (s.len >= 2) {
    if (de) return `Seit ${s.len} Tagen ${s.dir === 'up' ? 'steigend' : 'fallend'}.`
    return `${s.dir === 'up' ? 'Rising' : 'Falling'} for ${s.len} days.`
  }
  const pos = corridorPosition(latest, corridor)
  if (pos >= 0.66) return de ? 'Im oberen Drittel des plausiblen Bereichs.' : 'In the upper third of the plausible range.'
  if (pos <= 0.34) return de ? 'Im unteren Drittel des plausiblen Bereichs.' : 'In the lower third of the plausible range.'
  return ''
}
