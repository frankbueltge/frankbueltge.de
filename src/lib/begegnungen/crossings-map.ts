// src/lib/begegnungen/crossings-map.ts — the archive figure's model: the register's formal
// encounters on one map.
//
// WHAT IT DRAWS, AND WHAT IT DELIBERATELY DOES NOT. Six voices as lanes, every RECORDED
// ENCOUNTER a connector at its place in the register, bridging the lanes it joined — filled
// where a voice is the source, a ring where it receives. That sign grammar was designed for
// exactly one relation (one house offers, another receives) and it fits nothing else: a shared
// question answered three ways in parallel has no source and no receiver, and a line in a team
// channel has no lanes at all. So this model takes ENCOUNTERS ONLY. The joint inquiries and the
// contact stream are above the figure, in words, where they can be read as what they are.
//
// It was the page's headline figure until 2026-08-02 and it is now its archive: below the
// running work rather than in front of it, at half its old scale, still interactive.
//
// ORDINAL, NOT TIME-SCALED, and the figure says so under itself: only the later encounters carry
// a date, and drawing real intervals from two dates and three blanks would be a lie about the
// record. Pure and deterministic — same input, same drawing, every build.

import { VOICES, type Crossing, type VoiceHue, type VoiceId } from './crossings'

export interface MapLane {
  voice: VoiceId
  label: string
  hue: VoiceHue
  y: number
  /** false where no recorded encounter touches this voice — a documented non-relation, drawn */
  active: boolean
}

export interface MapMark {
  /** the encounter's ordinal in the register, as its own id numbers it */
  n: string
  crossingId: string
  anchor: string
  title: string
  x: number
  yTop: number
  yBottom: number
  badgeY: number
  sources: { voice: VoiceId; hue: VoiceHue; y: number }[]
  receivers: { voice: VoiceId; hue: VoiceHue; y: number }[]
  /** the register's own status line, trimmed to its leading clause for the tooltip */
  status: string | null
  asOf: string | null
  recordUrl: string | null
}

export interface CrossingsMap {
  width: number
  height: number
  laneX0: number
  laneX1: number
  lanes: MapLane[]
  marks: MapMark[]
  axisY: number
  axisLabelY: number
}

/** The lane order is the ecology's own: the three practices in the order the recorded palette
 *  writes them, then the guest table, then the outside house, then the conductor at the foot —
 *  the hand that keeps the zone sits under the practices, not among them. */
const LANE_ORDER: VoiceId[] = ['ulysses', 'meridian', 'ensemble', 'plenum', 'datavism', 'mrr', 'conductor']

const W = 900
// The label gutter is sized for the LONGEST voice name the record can produce
// ("MRR — the Meridian Research Runtime"), because the full names ARE the direct-labelling
// relief the palette record requires: a hue on this figure never carries a meaning the word
// beside it does not also carry, so the word must not be clipped to make room for the drawing.
const LANE_X0 = 250
const LANE_X1 = 872
const TOP = 44
const LANE_DY = 34

/**
 * Builds the figure from the crossings the page already holds — no second data path, so the map
 * and the dossiers above it can never tell two stories about one encounter.
 *
 * Only lanes a recorded encounter actually names get drawn. That is not tidying: a lane nobody
 * ever crossed would read as an absence the register measured, and the register measures nothing
 * about a voice it never mentions.
 */
export function buildCrossingsMap(crossings: readonly Crossing[]): CrossingsMap | null {
  const all: readonly Crossing[] = Array.isArray(crossings) ? crossings : []
  const encounters = all
    .filter((c): c is Crossing => !!c && c.kind === 'encounter')
    // oldest first, by the ordinal the register's own ids carry
    .sort((a, b) => a.id.localeCompare(b.id))

  if (encounters.length === 0) return null

  const named = new Set<VoiceId>()
  for (const e of encounters) for (const v of e.voices) named.add(v.voice)

  const laneVoices = LANE_ORDER.filter((v) => named.has(v))
  // A voice the record names but this list does not know about yet goes at the foot rather than
  // being dropped — the same rule the dossier applies to an unknown participant.
  for (const v of named) if (!laneVoices.includes(v)) laneVoices.push(v)

  const laneY = new Map<VoiceId, number>()
  const lanes: MapLane[] = laneVoices.map((voice, i) => {
    const y = TOP + i * LANE_DY
    laneY.set(voice, y)
    return { voice, label: VOICES[voice].label, hue: VOICES[voice].hue, y, active: true }
  })

  const bottomY = lanes[lanes.length - 1].y
  const step = encounters.length > 1 ? (LANE_X1 - LANE_X0 - 88) / (encounters.length - 1) : 0

  const marks: MapMark[] = encounters.map((e, i) => {
    const x = LANE_X0 + 56 + i * step
    const pick = (role: string) =>
      [...new Set(e.voices.filter((v) => (v.role ?? '').toLowerCase() === role).map((v) => v.voice))]
        .map((voice) => ({ voice, hue: VOICES[voice].hue, y: laneY.get(voice) ?? TOP }))
    const sources = pick('source')
    const receivers = pick('receiver')
    const ys = [...sources, ...receivers].map((p) => p.y)
    const yTop = ys.length > 0 ? Math.min(...ys) : TOP
    const yBottom = ys.length > 0 ? Math.max(...ys) : TOP
    return {
      n: /^enc-\d{4}-(\d{3})/.exec(e.id)?.[1] ?? String(i + 1),
      crossingId: e.id,
      anchor: e.anchor,
      title: e.title,
      x,
      yTop,
      yBottom,
      badgeY: yTop - 18,
      sources,
      receivers,
      // The status line's leading clause only: the register's own full sentence runs to several
      // hundred words on the newer encounters and a tooltip is not where a reader should meet it.
      status: e.status ? (e.status.text.split('—')[0]?.trim() || e.status.text) : null,
      asOf: e.asOf,
      recordUrl: e.recordUrl,
    }
  })

  return {
    width: W,
    height: bottomY + 46,
    laneX0: LANE_X0,
    laneX1: LANE_X1,
    lanes,
    marks,
    axisY: bottomY + 22,
    axisLabelY: bottomY + 38,
  }
}
