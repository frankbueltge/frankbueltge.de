// src/lib/ecology/pyramid/model.ts — the four stations of the pyramid, and the dated test the
// house is under. The one place the surfaces agree on who exists.
//
// Design handoff: docs/design_handoff_research_ecology/README.md ("Research Ecology v3 — the
// top-down rebuild"). Its diagnosis, in Frank's words on 2026-08-12: too many pages, too much
// text, nobody grasps the ecology without hours of reading. The cure is a four-level pyramid, and
// the first thing a pyramid needs is a single answer to "which stations are there?" — otherwise
// Level 0's map, Level 1's sheets and Level 2's breadcrumbs each grow their own list and drift
// apart, which is precisely how the site came to have eight pages per practice.
//
// Nothing about a station's identity is authored here. Name, address and one-line description
// come from NAMING.doors — the same strings every other surface renders — so a reworded practice
// moves the whole pyramid with it. What this file DOES own is the wiring the doors cannot carry:
// which pulse checkout belongs to which practice, which content namespace holds its journal, and
// where it sits on the map.

import { NAMING } from '@/config/naming'

/** The stations, by the id their content namespace uses. 'middle' has no namespace of its own. */
export type StationId = 'atelier' | 'field' | 'studio' | 'middle'
/** The voice ids the doors and the validated `ecology-voices` palette use. */
export type VoiceId = 'ulysses' | 'meridian' | 'ensemble' | 'conductor'

export interface Station {
  id: StationId
  voice: VoiceId
  /** from NAMING.doors — never authored here */
  name: string
  href: string
  /** the practice's own one-liner, from its door */
  description: string
  /** the resident, as the door states it (the Middle states that it has none) */
  resident: string
  /** the checkout name this practice commits under, as pulse.json spells it */
  repo: string
  /** what this practice is a corner of — the map's node label */
  corner: string
  /** the noun this practice uses for what it makes */
  makes: string
}

/** The map's node geometry, in the 560×380 viewBox of the handoff's figure (design 1a). The
 *  Middle sits at the centre; the three practices hang off it and never off each other. */
export interface MapNode {
  x: number
  y: number
}

/**
 * The three practices and the contact zone.
 *
 * `repo`, `corner` and `makes` are the only authored fields, and each is authored because it
 * cannot be derived: a checkout name is a fact about GitHub, a corner is what the v2 rebuild
 * (docs/design/2026-08-08-research-ecology-v2.md — Field=science, Studio=art, Atelier=artistic
 * research/philosophy) settled the triangle to be, and the noun is the practice's own.
 */
const WIRING: Record<StationId, Pick<Station, 'voice' | 'repo' | 'corner' | 'makes'>> = {
  atelier: { voice: 'ulysses', repo: 'ulysses', corner: 'ARTISTIC RESEARCH · PHILOSOPHY', makes: 'work' },
  field: { voice: 'meridian', repo: 'field-research', corner: 'SCIENCE · COUNTER-MEASUREMENT', makes: 'instrument' },
  studio: { voice: 'ensemble', repo: 'studio', corner: 'ART · ONLY WHAT A MACHINE DOES BETTER', makes: 'premiere' },
  middle: { voice: 'conductor', repo: 'research-ecology', corner: 'WHERE THEY MEET', makes: 'crossing' },
}

/** Where each station stands on the map. The three practices form a triangle around the Middle;
 *  the Middle is drawn at the centre because everything that meets is recorded there. */
export const MAP_NODES: Record<StationId, MapNode> = {
  atelier: { x: 280, y: 86 },
  field: { x: 120, y: 300 },
  studio: { x: 440, y: 300 },
  middle: { x: 280, y: 228 },
}

const DOOR_OF: Record<StationId, VoiceId> = {
  atelier: 'ulysses',
  field: 'meridian',
  studio: 'ensemble',
  middle: 'conductor',
}

/** The four stations, in the order the map draws them: the three practices, then the Middle. */
export const STATIONS: readonly Station[] = (['atelier', 'field', 'studio', 'middle'] as const).map((id) => {
  const door = NAMING.doors.items.find((d) => d.id === DOOR_OF[id])
  if (!door) {
    // Fail loud rather than render a station the doors do not have: a map node without a door is
    // an ecology that says one thing on the entrance and another in the nav.
    throw new Error(`ecology/pyramid: no door for station "${id}" — NAMING.doors and the pyramid disagree`)
  }
  return {
    id,
    name: door.name,
    href: door.href,
    description: door.description,
    resident: door.noResident ?? `resident: ${door.id}`,
    ...WIRING[id],
  }
})

export const stationById = (id: StationId): Station => {
  const station = STATIONS.find((s) => s.id === id)
  if (!station) throw new Error(`ecology/pyramid: unknown station "${id}"`)
  return station
}

/** The three practices — the Middle is not one, and a figure that counted it as one would be
 *  describing a different institution (the same distinction /ecology's anatomy draws). */
export const PRACTICE_STATIONS = STATIONS.filter((s) => s.id !== 'middle')

// ───────────────────────────────────────────────────────────────────────────────────────────────
// The dated test
// ───────────────────────────────────────────────────────────────────────────────────────────────

/**
 * The kill-reading, read out of the practices' own mirrored constitutions rather than typed here.
 *
 * Every practice's PROTOCOL.md carries the same section heading — "## The reading of YYYY-MM-DD"
 * — because the reading is the house's test and not any one practice's. Parsing it costs a regex
 * and buys the currency rule: if the practices move the date, the entrance moves with them the
 * night the mirror lands, and if they ever disagree about it, the build stops instead of picking
 * one silently.
 */
const PROTOCOLS = import.meta.glob('/src/content/*/PROTOCOL.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const READING_HEADING = /^## The reading of (\d{4}-\d{2}-\d{2})/m

export function readingDate(protocols: Record<string, string> = PROTOCOLS): string {
  const dates = new Set<string>()
  for (const [path, raw] of Object.entries(protocols)) {
    // The Plenum is a guest voice, not a practice of this house, and its own protocol says the
    // reading "does not cover this table at all" — so its mirror is not asked.
    if (path.includes('/plenum/')) continue
    const found = READING_HEADING.exec(raw)?.[1]
    if (found) dates.add(found)
  }
  if (dates.size === 0) {
    throw new Error(
      'ecology/pyramid: no mirrored constitution carries a "## The reading of YYYY-MM-DD" section — mirror broken or the reading was retired',
    )
  }
  if (dates.size > 1) {
    throw new Error(
      `ecology/pyramid: the practices disagree about the reading date (${[...dates].sort().join(', ')}) — the house's dated test cannot be rendered until they agree`,
    )
  }
  return [...dates][0]
}

/** Whole days from `now` to the reading, floored at zero. Zero means today or past — the chip's
 *  wording switches then, because "in 0 days" is a countdown that has stopped meaning anything. */
export function daysUntil(target: string, now: Date): number {
  const then = Date.parse(`${target}T00:00:00Z`)
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.max(0, Math.ceil((then - today) / 86_400_000))
}
