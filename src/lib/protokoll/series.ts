/** Aggregation des Protokoll-Archivs zu Zeitreihen je Tagesordnungspunkt — rein, getestet.
 *  Kein astro:content-Zugriff hier: Tage werden hereingereicht (Datenzugriff bleibt in data.ts). */
import type { Locale } from '@/lib/site'
import { AGENDA } from './agenda'
import type { ProtokollDay, ProtokollEntry } from './types'

export interface TopSeriesPoint {
  date: string
  value: number
}

export interface TopSeries {
  id: string
  title: Record<Locale, string>
  /** Satz-Template des Eintrags (mit {value}/{label}), für die sekundäre Prosa-Zeile. */
  phrase: Record<Locale, string>
  latest: ProtokollEntry
  series: TopSeriesPoint[]
}

/** Je Agenda-Eintrag eine aufsteigend datierte Reihe der gemessenen Werte (null fällt heraus,
 *  Lücke bleibt Lücke) plus den jüngsten Eintrag (auch wenn dessen Wert null ist → Status sichtbar).
 *  Reihenfolge folgt der Agenda. */
export function buildTopSeries(days: ProtokollDay[]): TopSeries[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const out: TopSeries[] = []
  for (const top of AGENDA) {
    for (const ag of top.entries) {
      const series: TopSeriesPoint[] = []
      let latest: ProtokollEntry | undefined
      for (const day of sorted) {
        const e = day.entries.find((x) => x.top_id === ag.id)
        if (!e) continue
        latest = e // aufsteigend sortiert → letzte Zuweisung ist der jüngste Tag
        if (e.value != null) series.push({ date: day.date, value: e.value })
      }
      if (latest) out.push({ id: ag.id, title: top.title, phrase: ag.phrase, latest, series })
    }
  }
  return out
}

export const LINE_W = 180
export const LINE_H = 36

/** Lineare Sparkline (kein Schmuck, keine Glättung): newest rechts, min unten, max oben.
 *  Weniger als zwei Punkte ergeben keinen Pfad. */
export function linePath(values: number[], width = LINE_W, height = LINE_H): string {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const n = values.length
  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * width
    const y = height - ((v - min) / span) * (height - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${pts.join(' L')}`
}
