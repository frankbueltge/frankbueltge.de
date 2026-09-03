// src/lib/globe/model.ts — the entrance globe's model: what stands in the sky over the record and
// what went dark on the water, read from two committed nightly snapshots and nothing else.
//
//   · src/data/ueberflug/satellites.json — the earth-observation fleet the watchtower counts:
//     CelesTrak orbital elements (OMM) joined with GCAT's class and owner, refreshed nightly.
//   · src/data/ghost-fleet/latest.json — Global Fishing Watch's AIS-gap events: vessels that
//     switched their transponder off, where they went dark, where they came back, for how long,
//     in whose waters.
//
// Pure and deterministic, the contract every figure in this house keeps: same snapshots ⇒ the
// same model; no clock, no randomness, no colour. The `asOf` dates are the snapshots' own — the
// static floor is drawn at the record's time, never at today's. Every count is derived here and
// handed to the wording as a number; none is typed.
import type { SatEntry, SatSnapshot } from '@/lib/ueberflug/types'
import type { GfEvent, GhostFleetData } from '@/lib/ghost-fleet/types'
import { regionLabel } from '@/lib/ghost-fleet/format'

export type LonLat = [lon: number, lat: number]

export interface GlobeSatellite {
  norad: number
  name: string
  /** CelesTrak group the watchtower tracks: resource · sar · weather */
  group: string
  /** GCAT class letter — C civil, D military, B commercial, A amateur — or null when GCAT has none */
  cls: string | null
  owner: string | null
  category: string | null
  omm: SatEntry['omm']
}

export interface GlobeArc {
  id: string
  vessel: { name: string; flag: string; type: string }
  /** where the transponder went silent */
  from: LonLat
  /** where it came back */
  to: LonLat
  hours: number
  /** the waters of the gap, in the ghost-fleet page's own words (EEZ name, high seas, …) */
  waters: string
  start: string
  end: string
  url: string
}

export interface GlobeCounts {
  satellites: number
  byGroup: Record<string, number>
  arcs: number
  /** the sum of the drawn gaps' hours, whole hours */
  darkHours: number
  /** how many gaps the pipeline examined for the day the arcs were picked from */
  eventsExamined: number
}

export interface GlobeModel {
  asOf: { satellites: string; fleet: string }
  sources: { name: string; url: string; license: string }[]
  satellites: GlobeSatellite[]
  arcs: GlobeArc[]
  counts: GlobeCounts
}

const hasCoords = (e: GfEvent): boolean =>
  e.off.lat !== null && e.off.lon !== null && e.on.lat !== null && e.on.lon !== null

export function buildGlobeModel(sky: SatSnapshot, fleet: GhostFleetData): GlobeModel {
  // Total orders, so the model never depends on the snapshots' own row order.
  const satellites: GlobeSatellite[] = [...sky.satellites]
    .sort((a, b) => a.norad - b.norad)
    .map((s) => ({
      norad: s.norad,
      name: s.name,
      group: s.group,
      cls: s.gcat.class,
      owner: s.gcat.owner,
      category: s.gcat.category,
      omm: s.omm,
    }))

  const arcs: GlobeArc[] = fleet.events
    .filter(hasCoords)
    .map((e) => ({
      id: e.id,
      vessel: { name: e.vessel.name, flag: e.vessel.flag, type: e.vessel.type },
      from: [e.off.lon as number, e.off.lat as number] as LonLat,
      to: [e.on.lon as number, e.on.lat as number] as LonLat,
      hours: e.duration_hours,
      waters: regionLabel(e.regions, 'en'),
      start: e.start,
      end: e.end,
      url: e.gfw_url,
    }))
    .sort((a, b) => b.hours - a.hours || a.id.localeCompare(b.id))

  const byGroup: Record<string, number> = {}
  for (const s of satellites) byGroup[s.group] = (byGroup[s.group] ?? 0) + 1

  return {
    asOf: { satellites: sky.generated_at, fleet: fleet.date },
    sources: [...sky.sources, fleet.source],
    satellites,
    arcs,
    counts: {
      satellites: satellites.length,
      byGroup,
      arcs: arcs.length,
      darkHours: Math.round(arcs.reduce((sum, a) => sum + a.hours, 0)),
      eventsExamined: fleet.index.total,
    },
  }
}

/** What the island fetches once the hero is on screen: the same model, without the fields the
 *  drawing never reads (GCAT category, the source list — both stand in the frame's own markup),
 *  and the elements SGP4 actually needs. Built at build time from the committed snapshots,
 *  so the client draws exactly what the build-time floor drew. */
export interface GlobePayload {
  asOf: GlobeModel['asOf']
  satellites: Array<Pick<GlobeSatellite, 'norad' | 'name' | 'group' | 'cls' | 'owner' | 'omm'>>
  arcs: GlobeArc[]
  counts: GlobeCounts
}

export function clientPayload(model: GlobeModel): GlobePayload {
  return {
    asOf: model.asOf,
    satellites: model.satellites.map(({ norad, name, group, cls, owner, omm }) => ({ norad, name, group, cls, owner, omm })),
    arcs: model.arcs,
    counts: model.counts,
  }
}

/** The dates a caption states, as the record spells them: the day of the elements, the day of the gaps. */
export function asOfDay(iso: string): string {
  return iso.slice(0, 10)
}
