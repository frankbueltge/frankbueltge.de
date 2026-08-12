// src/lib/ops/tiles.ts — the ops room's LIVE EXPERIMENTS dashboard: one tile per experiment that
// ships data daily, each showing that experiment's ACTUAL current reading, derived here from the
// committed snapshot the experiment's own page renders.
//
// Three rules this module exists to keep:
//
//   1. No number is ever written down. Every `big` is computed from a snapshot in src/data/ (or,
//      for The Protocol, from the committed day file in src/content/protokoll/). Change the
//      snapshot, the tile changes; delete it, the tile disappears.
//   2. A tile with no reading is not rendered. `readTiles` returns only what it could derive —
//      the handoff's rule, and the reason the design's observatory tile is absent: its register
//      lives in its own repository and nothing committed HERE carries a figure from it. An empty
//      tile would have been a promise the archive cannot keep.
//   3. The sentence and the number come from the same derivation. The wording lives in
//      NAMING.opsRoom.live.tiles as a function of the reading, so the two cannot disagree — the
//      arrangement NAMING.pulseCaption has used since the hub was built.
//
// The mini-viz of each tile is drawn from a real series of that same snapshot, not from a
// decorative shape: see the `series` each reader returns and src/lib/ops/viz.ts for the marks.

import { NAMING } from '@/config/naming'
import type { ProtokollDay } from '@/lib/protokoll/types'
// The pieces' OWN formatters, deliberately: a reading on the entrance that rounded differently
// from the reading on the piece would be two numbers for one measurement. Whatever /pattern and
// /redaction call a value, this page calls it too.
import { rStr } from '@/lib/pattern/format'
import { tokensLabel } from '@/lib/redaction/format'
import { verdictLabel } from '@/lib/round-number/format'

import attentionExport from '@/data/attention/export.json'
import consensusLatest from '@/data/consensus/latest.json'
import parallaxeRegister from '@/data/parallaxe/register.json'
import police from '@/data/praemie/police.json'
import redactionLatest from '@/data/redaction/latest.json'
import ghostFleetLatest from '@/data/ghost-fleet/latest.json'
import roundNumberLatest from '@/data/round-number/latest.json'
import patternLatest from '@/data/pattern/latest.json'
import satellites from '@/data/ueberflug/satellites.json'
import atlasWorks from '@/data/atlas/werke.json'

/** How the tile's 26px mark is drawn. Chosen per reading, not per taste: a count of things in two
 *  states gets cells, a distribution gets bars, a series over time gets a line, a share gets the
 *  two-bar ratio. */
export type TileViz =
  | { kind: 'line'; values: number[] }
  | { kind: 'bars'; values: number[]; marked: number[] }
  | { kind: 'cells'; count: number; marked: number[] }
  | { kind: 'ratio'; part: number; whole: number }

export interface OpsTile {
  id: string
  name: string
  /** the reading itself, already formatted — the tile's whole point */
  big: string
  sub: string
  stamp: string
  href: string
  viz: TileViz
}

const COPY = NAMING.opsRoom.live.tiles

/** Thousands separators for the room's readings — en-GB, matching the site's date formatting. */
const num = (n: number): string => n.toLocaleString('en-GB')

// ---------------------------------------------------------------------------- the readers
// Each returns null when its snapshot cannot answer, and the tile is dropped. `null` here always
// means "the archive does not carry this today", never "something went wrong quietly".

function foreknown(): OpsTile | null {
  const figures = (attentionExport as { figures?: { key: string; value: number }[] }).figures ?? []
  const value = (key: string): number | undefined => figures.find((f) => f.key === key)?.value
  const open = value('futures_under_watch')
  if (open === undefined) return null
  const resolved = value('futures_resolved') ?? 0
  const nights = value('nights_on_record') ?? 0
  return {
    id: 'foreknown',
    name: COPY.foreknown.name,
    big: `${num(open)} clocks`,
    sub: COPY.foreknown.sub({ open, resolved, nights }),
    stamp: COPY.foreknown.stamp,
    href: '/attention',
    // Open against resolved: the shape of a ledger that has barely begun to close is the finding.
    viz: { kind: 'ratio', part: resolved, whole: open },
  }
}

function protocol(day: ProtokollDay | undefined): OpsTile | null {
  if (!day || day.entries.length === 0) return null
  const unavailable = day.entries.filter((e) => e.status !== 'ok').length
  return {
    id: 'protocol',
    name: COPY.protocol.name,
    big: `${day.entries.length} items`,
    sub: COPY.protocol.sub({ unavailable }),
    stamp: COPY.protocol.stamp,
    href: '/protocol',
    // One cell per agenda item; a cell dims where the source did not answer — "Feststellung
    // entfällt" drawn as the gap it is, rather than closed over.
    viz: {
      kind: 'cells',
      count: day.entries.length,
      marked: day.entries.map((e, i) => (e.status === 'ok' ? -1 : i)).filter((i) => i >= 0),
    },
  }
}

interface ConsensusShape {
  headline?: { domain_count?: number; span_hours?: number; cascade?: { at: string }[] }
  stats?: { articles_scanned?: number }
}

function consensus(): OpsTile | null {
  const d = consensusLatest as unknown as ConsensusShape
  const outlets = d.headline?.domain_count
  if (outlets === undefined) return null
  const hours = d.headline?.span_hours ?? 0
  const scanned = d.stats?.articles_scanned ?? 0
  // The cascade itself, binned by hour — how a single sentence travelled, drawn from the same
  // list of timestamps the piece's own page walks through.
  const cascade = d.headline?.cascade ?? []
  const buckets = new Array<number>(Math.max(1, Math.min(hours || 1, 24))).fill(0)
  if (cascade.length > 0) {
    const start = Date.parse(cascade[0].at)
    for (const step of cascade) {
      const hoursIn = (Date.parse(step.at) - start) / 3_600_000
      const idx = Math.min(buckets.length - 1, Math.max(0, Math.floor(hoursIn)))
      buckets[idx] += 1
    }
  }
  return {
    id: 'consensus',
    name: COPY.consensus.name,
    big: `${num(outlets)} outlets`,
    sub: COPY.consensus.sub({ scanned, hours }),
    stamp: COPY.consensus.stamp,
    href: '/consensus',
    viz: { kind: 'bars', values: buckets, marked: [0] },
  }
}

interface ParallaxeShape {
  topics?: { en_title: string; langs: string[]; mean_omission: number; omission_by_lang: Record<string, number> }[]
}

function iceberg(): OpsTile | null {
  const topics = (parallaxeRegister as unknown as ParallaxeShape).topics ?? []
  if (topics.length === 0) return null
  // The topic the register itself puts furthest apart — the same "largest distance is the
  // finding" ordering /parallax renders, so the entrance cannot headline a different topic
  // than the piece.
  const top = [...topics].sort((a, b) => b.mean_omission - a.mean_omission)[0]
  const values = Object.values(top.omission_by_lang ?? {})
  if (values.length === 0) return null
  // "Conceals" is the register's own threshold: an edition above the topic's mean omission.
  const concealing = values.filter((v) => v > top.mean_omission).length
  return {
    id: 'iceberg',
    name: COPY.iceberg.name,
    big: `${concealing} of ${values.length}`,
    sub: COPY.iceberg.sub({ topic: top.en_title }),
    stamp: COPY.iceberg.stamp,
    href: '/parallax',
    viz: {
      kind: 'bars',
      values,
      marked: values.map((v, i) => (v > top.mean_omission ? i : -1)).filter((i) => i >= 0),
    },
  }
}

interface PoliceShape {
  premium?: { change_pct_since_base?: number; base_year?: number; latest_date?: string; series?: { year: number; index: number }[] }
}

function policy(): OpsTile | null {
  const p = (police as unknown as PoliceShape).premium
  if (!p || p.change_pct_since_base === undefined || p.base_year === undefined) return null
  const sign = p.change_pct_since_base >= 0 ? '+' : '−'
  return {
    id: 'policy',
    name: COPY.policy.name,
    big: `${sign}${Math.abs(p.change_pct_since_base).toFixed(0)}%`,
    sub: COPY.policy.sub({ baseYear: p.base_year, latest: p.latest_date ?? '—' }),
    stamp: COPY.policy.stamp,
    href: '/policy',
    viz: { kind: 'line', values: (p.series ?? []).map((s) => s.index) },
  }
}

interface RedactionShape {
  pick?: string | null
  changed_count?: number
  watched_count?: number
  redactions?: { id: string; institution?: string; removed_tokens?: number }[]
}

function redaction(): OpsTile | null {
  const d = redactionLatest as unknown as RedactionShape
  const list = d.redactions ?? []
  const pick = d.pick ? list.find((r) => r.id === d.pick) : undefined
  if (!pick || pick.removed_tokens === undefined) return null
  const values = list.map((r) => r.removed_tokens ?? 0)
  return {
    id: 'redaction',
    name: COPY.redaction.name,
    big: `−${tokensLabel(pick.removed_tokens, 'en').replace(String(pick.removed_tokens), num(pick.removed_tokens))}`,
    sub: COPY.redaction.sub({
      institution: pick.institution ?? 'watched page',
      changed: d.changed_count ?? list.length,
      watched: d.watched_count ?? 0,
    }),
    stamp: COPY.redaction.stamp,
    href: '/redaction',
    viz: { kind: 'bars', values, marked: [list.indexOf(pick)].filter((i) => i >= 0) },
  }
}

interface GhostFleetShape {
  events?: { duration_hours?: number }[]
}

function ghostFleet(): OpsTile | null {
  const events = (ghostFleetLatest as unknown as GhostFleetShape).events ?? []
  if (events.length === 0) return null
  const durations = events.map((e) => e.duration_hours ?? 0)
  const longest = Math.max(...durations)
  return {
    id: 'ghostFleet',
    name: COPY.ghostFleet.name,
    big: `${events.length} dark`,
    // Days once a silence runs past two of them: "1197 hours" is a number a reader has to divide
    // before it means anything, and the piece's own case-of-the-day speaks in days too.
    sub: COPY.ghostFleet.sub(
      longest >= 48
        ? { value: Math.round(longest / 24), unit: 'days' }
        : { value: Math.round(longest), unit: 'hours' },
    ),
    stamp: COPY.ghostFleet.stamp,
    href: '/ghost-fleet',
    viz: { kind: 'bars', values: durations, marked: [durations.indexOf(longest)] },
  }
}

interface RoundNumberShape {
  series?: {
    id: string
    benford?: { verdict?: string; observed?: number[]; expected?: number[] }
    control?: { false_positive_rate?: number }
  }[]
}

/** The two verdicts the piece's own vocabulary counts as "the test cried foul" — the other four
 *  (close, acceptable, uniform, heaped) are not accusations. Taken from the verdict the pipeline
 *  writes, never re-derived here from the chi² value: this page reads the trial, it does not
 *  re-run it. */
const SUSPICIOUS = new Set(['nonconformity', 'marginal'])

function roundNumbers(): OpsTile | null {
  // The control series (ids prefixed with "_") are the piece's own provably-clean and tampered
  // references; the trial is about the REAL official series, so those are what the tile counts.
  const all = (roundNumberLatest as unknown as RoundNumberShape).series ?? []
  const real = all.filter((s) => !s.id.startsWith('_'))
  if (real.length === 0) return null
  const flagged = real.filter((s) => SUSPICIOUS.has(s.benford?.verdict ?? ''))
  const tampered = all.find((s) => s.id === '_control_tampered')?.benford?.verdict
  return {
    id: 'roundNumbers',
    name: COPY.roundNumbers.name,
    big: `${flagged.length} / ${real.length} flagged`,
    sub: COPY.roundNumbers.sub({ tampered: tampered ? verdictLabel(tampered, 'en') : null }),
    stamp: COPY.roundNumbers.stamp,
    href: '/round-number',
    // The leading-digit distribution of the day's defendant, with the digits that came in ABOVE
    // Benford's expectation lit: that excess is the whole basis of the accusation, so it is what
    // the mark shows — not an arbitrary first bar.
    viz: (() => {
      const observed = real[0].benford?.observed ?? []
      const expected = real[0].benford?.expected ?? []
      return {
        kind: 'bars' as const,
        values: observed,
        marked: observed.map((v, i) => (v > (expected[i] ?? v) ? i : -1)).filter((i) => i >= 0),
      }
    })(),
  }
}

interface PatternShape {
  headline?: { r?: number }
  pairs?: number
  false_discovery_rate?: number
  null_distribution?: { counts?: number[] }
}

function patterns(): OpsTile | null {
  const d = patternLatest as unknown as PatternShape
  const r = d.headline?.r
  if (r === undefined) return null
  const survives = (d.false_discovery_rate ?? 1) < 0.1
  return {
    id: 'patterns',
    name: COPY.patterns.name,
    big: `r = ${rStr(r, 'en')}`,
    sub: COPY.patterns.sub({ pairs: d.pairs ?? 0, survives }),
    stamp: COPY.patterns.stamp,
    href: '/pattern',
    // The null distribution the permutation test built — the picture of what chance alone does.
    viz: { kind: 'bars', values: d.null_distribution?.counts ?? [], marked: [] },
  }
}

interface SatelliteShape {
  satellites?: { gcat?: { owner?: string } }[]
}

function watchtower(): OpsTile | null {
  const list = (satellites as unknown as SatelliteShape).satellites ?? []
  if (list.length === 0) return null
  // How the catalogue is distributed across its operators — the strongest ten, so the mark says
  // something about who is up there rather than merely that many are.
  const byOwner = new Map<string, number>()
  for (const s of list) {
    const owner = s.gcat?.owner ?? 'unknown'
    byOwner.set(owner, (byOwner.get(owner) ?? 0) + 1)
  }
  const top = [...byOwner.values()].sort((a, b) => b - a).slice(0, 10)
  return {
    id: 'watchtower',
    name: COPY.watchtower.name,
    big: `${num(list.length)} tracked`,
    sub: COPY.watchtower.sub(),
    stamp: COPY.watchtower.stamp,
    href: '/lab/ueberflug-studie',
    viz: { kind: 'bars', values: top, marked: [0] },
  }
}

interface AtlasWork {
  artist?: string
  year?: string
}

function atlas(): OpsTile | null {
  const works = atlasWorks as unknown as AtlasWork[]
  if (!Array.isArray(works) || works.length === 0) return null
  const artists = new Set(works.map((w) => w.artist).filter((a): a is string => Boolean(a))).size
  // The catalogue's own growth by year of work — a line the atlas earns, not one drawn for it.
  const byYear = new Map<number, number>()
  for (const w of works) {
    const year = Number.parseInt(w.year ?? '', 10)
    if (Number.isFinite(year)) byYear.set(year, (byYear.get(year) ?? 0) + 1)
  }
  const years = [...byYear.keys()].sort((a, b) => a - b).slice(-20)
  return {
    id: 'atlas',
    name: COPY.atlas.name,
    big: `${num(works.length)} works`,
    sub: COPY.atlas.sub({ artists }),
    stamp: COPY.atlas.stamp,
    href: '/atlas',
    viz: { kind: 'line', values: years.map((y) => byYear.get(y) ?? 0) },
  }
}

/**
 * Every tile the committed record can currently answer, in the order the handoff sets: the
 * machine-attention project first, then the daily instruments, then the two catalogues that grow
 * on their own. Tiles whose snapshot yields nothing drop out silently HERE and loudly nowhere —
 * the page shows what exists, and /experiments remains the complete list.
 */
export function readTiles(input: { protokoll?: ProtokollDay } = {}): OpsTile[] {
  return [
    foreknown(),
    protocol(input.protokoll),
    consensus(),
    iceberg(),
    policy(),
    redaction(),
    ghostFleet(),
    roundNumbers(),
    patterns(),
    watchtower(),
    atlas(),
  ].filter((t): t is OpsTile => t !== null)
}
