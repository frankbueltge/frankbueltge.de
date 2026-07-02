/** Aggregation über Zensus-Snapshots. Blockierte/gescheiterte Messungen sind Lücken,
 *  nie Nullwerte — sie fallen aus Medianen heraus (Visualisierungs-Standard: Lücke als Form). */
import type { BeifangRun, BeifangSiteResult } from './types'

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function usResults(run: BeifangRun): BeifangSiteResult[] {
  return run.vantages.us?.results ?? []
}

function trackerCounts(run: BeifangRun, group: 'verlag' | 'kontrolle'): number[] {
  return usResults(run)
    .filter((r) => r.group === group && r.blocked === null && r.tracker_hosts !== null)
    .map((r) => r.tracker_hosts!.length)
}

export function groupMedians(run: BeifangRun): { verlag: number | null; kontrolle: number | null } {
  return { verlag: median(trackerCounts(run, 'verlag')), kontrolle: median(trackerCounts(run, 'kontrolle')) }
}

export function publisherMedians(run: BeifangRun): Record<string, number | null> {
  const byPub = new Map<string, number[]>()
  for (const r of usResults(run)) {
    if (r.group !== 'verlag') continue
    // Schlüssel für JEDEN Verlag anlegen, auch wenn alle seine Seiten blockiert/gescheitert
    // sind — sonst verschwindet er aus der Tafel statt "Feststellung entfällt" zu zeigen.
    if (!byPub.has(r.publisher)) byPub.set(r.publisher, [])
    if (r.blocked === null && r.tracker_hosts !== null) byPub.get(r.publisher)!.push(r.tracker_hosts.length)
  }
  return Object.fromEntries([...byPub.entries()].map(([p, xs]) => [p, median(xs)]))
}

export function entityTable(run: BeifangRun): { entity: string; verlag: number; kontrolle: number }[] {
  const rows = new Map<string, { verlag: number; kontrolle: number }>()
  for (const r of usResults(run)) {
    for (const e of r.entities ?? []) {
      const row = rows.get(e) ?? { verlag: 0, kontrolle: 0 }
      row[r.group] += 1
      rows.set(e, row)
    }
  }
  return [...rows.entries()]
    .map(([entity, counts]) => ({ entity, ...counts }))
    .sort((a, b) => b.verlag - a.verlag || a.entity.localeCompare(b.entity))
}

export function blockedResults(run: BeifangRun): BeifangSiteResult[] {
  return usResults(run).filter((r) => r.blocked !== null)
}

export function timeline(runs: BeifangRun[]): { date: string; verlag: number | null; kontrolle: number | null }[] {
  return [...runs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((run) => ({ date: run.date, ...groupMedians(run) }))
}

/** Wert→Geometrie: y=0 unten. Lücken (null) brechen den Pfad — nie interpolieren. */
export function sparkPath(values: (number | null)[], w: number, h: number, max: number): string {
  const step = values.length > 1 ? w / (values.length - 1) : 0
  let path = ''
  let pen = false
  values.forEach((v, i) => {
    if (v === null) {
      pen = false
      return
    }
    const x = Math.round(i * step * 100) / 100
    const y = Math.round((h - (v / max) * h) * 100) / 100
    path += `${pen ? 'L' : 'M'}${x},${y}`
    pen = true
  })
  return path
}
