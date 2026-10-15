// src/lib/globe/propagate.ts — where every satellite of the model is at a given instant, by SGP4
// over its committed CelesTrak elements (satellite.js, the same library the watchtower island
// uses). Pure in the sense that matters: the same elements and the same instant give the same
// points; the instant is always an argument, never read from a clock in here. The build-time
// floor calls this at the snapshot's own `generated_at`; the island calls it with the visitor's
// present, which is the one thing on the entrance allowed to move on its own.
//
// It runs on the main thread by design. satellite.js re-exports its WebAssembly bulk propagator,
// and a module Web Worker would be bundled as its own entry — a second copy of that module beside
// the watchtower's. Three hundred-odd propagations take a few milliseconds; at the island's cadence
// that is cheaper than a worker round-trip and keeps one copy of satellite.js on the site.
import * as satellite from 'satellite.js'
import type { GlobeSatellite } from './model'

export interface GroundPoint {
  lon: number
  lat: number
  /** height above the ellipsoid, kilometres */
  altKm: number
}

export type SatRecs = Array<ReturnType<typeof satellite.json2satrec> | null>

/** Parses the elements once; a record that satellite.js refuses stays null and is never drawn. */
export function satrecsOf(satellites: Array<Pick<GlobeSatellite, 'omm'>>): SatRecs {
  return satellites.map((s) => {
    try {
      return satellite.json2satrec(s.omm as never)
    } catch {
      return null
    }
  })
}

/** Sub-satellite points at `epochMs` (UTC milliseconds), one per record, null where SGP4 fails. */
export function positionsAt(recs: SatRecs, epochMs: number): Array<GroundPoint | null> {
  const date = new Date(epochMs)
  const gmst = satellite.gstime(date)
  return recs.map((rec) => {
    if (!rec) return null
    const pv = satellite.propagate(rec, date)
    const pos = pv?.position
    if (!pos || typeof pos === 'boolean') return null
    const geo = satellite.eciToGeodetic(pos, gmst)
    const lon = satellite.degreesLong(geo.longitude)
    const lat = satellite.degreesLat(geo.latitude)
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || !Number.isFinite(geo.height)) return null
    return { lon: round(lon, 3), lat: round(lat, 3), altKm: round(geo.height, 1) }
  })
}

const round = (n: number, d: number): number => Number(n.toFixed(d))
