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

/** Blockade-Quote je Gruppe + je Verlag. Die Verweigerung IST der Befund (Asymmetrie:
 *  die Plattformen tracken jeden Leser total, sperren aber den Prüfblick aus) — deshalb
 *  als Leitzahl, nicht als lange Einzelliste. */
export interface BlockadeStats {
  verlag: { blocked: number; total: number; byPublisher: { publisher: string; blocked: number; total: number }[] }
  kontrolle: { blocked: number; total: number }
}

export function blockadeStats(run: BeifangRun): BlockadeStats {
  const pub = new Map<string, { blocked: number; total: number }>()
  let kBlocked = 0
  let kTotal = 0
  for (const r of usResults(run)) {
    if (r.group === 'verlag') {
      const row = pub.get(r.publisher) ?? { blocked: 0, total: 0 }
      row.total += 1
      if (r.blocked !== null) row.blocked += 1
      pub.set(r.publisher, row)
    } else {
      kTotal += 1
      if (r.blocked !== null) kBlocked += 1
    }
  }
  const byPublisher = [...pub.entries()]
    .map(([publisher, c]) => ({ publisher, ...c }))
    .sort((a, b) => b.blocked - a.blocked || a.publisher.localeCompare(b.publisher))
  return {
    verlag: {
      blocked: byPublisher.reduce((s, p) => s + p.blocked, 0),
      total: byPublisher.reduce((s, p) => s + p.total, 0),
      byPublisher,
    },
    kontrolle: { blocked: kBlocked, total: kTotal },
  }
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

import type { BeifangLeak } from './types'

export function leakFindings(run: BeifangRun): { publisher: string; hard: BeifangLeak[]; firmen: string[]; hosts: string[] }[] {
  const byPub = new Map<string, { hard: BeifangLeak[]; firmen: Set<string>; hosts: Set<string> }>()
  for (const r of usResults(run)) {
    if (r.group !== 'verlag' || !r.leaks) continue
    const hard = r.leaks.filter((l) => l.signal === 'hard' && l.token === 'doi')
    if (hard.length === 0) continue
    const row = byPub.get(r.publisher) ?? { hard: [], firmen: new Set<string>(), hosts: new Set<string>() }
    row.hard.push(...hard)
    for (const l of hard) {
      if (l.firma) row.firmen.add(l.firma)   // benannter Broker
      else row.hosts.add(l.host)             // unbenannter Empfänger (z. B. content.readcube.com)
    }
    byPub.set(r.publisher, row)
  }
  return [...byPub.entries()]
    .map(([publisher, v]) => ({ publisher, hard: v.hard, firmen: [...v.firmen].sort(), hosts: [...v.hosts].sort() }))
    .sort((a, b) => b.hard.length - a.hard.length || a.publisher.localeCompare(b.publisher))
}

export function doiLeakEntities(run: BeifangRun): string[] {
  const firmen = new Set<string>()
  for (const f of leakFindings(run)) for (const name of f.firmen) firmen.add(name)
  return [...firmen].sort()
}

/** Unterscheidet "Leak-Audit lief nicht" (reiner v1-Zensus, leaks-Feld fehlt überall) von
 *  "Audit lief, keine Funde" — sonst wäre ein nicht gemessener Lauf fälschlich als "sauber" markiert. */
export function leakAuditRan(run: BeifangRun): boolean {
  return usResults(run).some((r) => r.leaks != null)
}
