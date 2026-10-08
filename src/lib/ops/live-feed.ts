// src/lib/ops/live-feed.ts — the signal log, assembled from the committed record.
//
// Two halves. `buildFeed` is pure: it takes every source as data and returns the ordered stream,
// which is what the tests drive with fixtures. `loadFeedInput` reads the record — the works
// register, the practices' mirrors, the instruments' archives, the attention mirror, the
// catalogues, the cycle state, the Middle's relay — once per build process, and `buildHouseFeed`
// joins the two.
//
// The instruments' archives are read from disk, file by file, the way thumbnails.ts and the
// practices' mirrors are: an eager glob would carry every byte of several hundred day files into
// the module graph. Nothing here reads the clock; a file that does not parse is skipped, so a
// broken day shortens the log by one row instead of taking the entrance down with it.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import attentionExport from '@/data/attention/export.json'
import attentionMoments from '@/data/attention/moments.json'
import { WERKE, type Werk } from '@/data/werke'
import { readArchFacts, type ArchFacts } from '@/lib/arch/facts'
import { loadRelayExtras, type RelayConvening } from '@/lib/ecology/convening'
import { loadRelay, type RelayState } from '@/lib/ecology/relay'
import { loadArtifacts, loadCycle, loadPresentations, type ArtifactEntry, type CycleState, type PresentationEntry } from '@/lib/ecology/v3'
import type { LatestWork } from '@/lib/engines/latest'
import { allWorks } from '@/lib/engines/register'
import { readN1Nights, readN1Works, type N1Night, type N1Work } from '@/lib/n1/works'
import { PAPERS } from '@/lib/papers'
import { ENTRIES as DATASETS } from '@/lib/register'
import { archEntries, artifactEntries, houseNames, labEntries, n1Entries, registerEntries, sortFeed, type FeedEntry } from './house-feed'
import {
  archSessionEntries,
  atlasEntries,
  conveningEntries,
  cycleEntries,
  datasetEntries,
  momentEntries,
  n1NightEntries,
  paperEntries,
  presentationEntries,
  projectEntries,
  readingEntries,
  relayEntries,
  type DatasetProbe,
  type InstrumentId,
  type InstrumentRecord,
  type InstrumentRecords,
  type PaperUse,
} from './live-sources'

/** Every source of the log, as data. */
export interface FeedInput {
  works: readonly LatestWork[]
  artifacts: readonly ArtifactEntry[]
  arch: ArchFacts | null
  n1: readonly N1Work[]
  n1Nights: readonly N1Night[]
  /** the lab's shelf: its experiments by `since`, and the names and addresses of its instruments */
  werke: readonly Werk[]
  instruments: InstrumentRecords
  moments: unknown
  attentionExport: unknown
  papers: readonly PaperUse[]
  atlasRuns: readonly unknown[]
  /** the dataset register's entries — dated since its builder stamps them (2026-10-05) */
  datasets: readonly DatasetProbe[]
  cycle: CycleState | null
  presentations: readonly PresentationEntry[]
  /** the Middle's relay as loadRelay read it; absent and unreadable are empty sources */
  relay: RelayState | null
  /** the convening the same relay carries (2026-10-08), as loadRelayExtras read it; null when the
   *  relay is absent or unreadable, or carries no convening */
  relayConvening: RelayConvening | null
}

/** A feed with no sources at all — what a fixture starts from, so a test names what it feeds in. */
export const NO_SOURCES: FeedInput = {
  works: [],
  artifacts: [],
  arch: null,
  n1: [],
  n1Nights: [],
  werke: [],
  instruments: {},
  moments: null,
  attentionExport: null,
  papers: [],
  atlasRuns: [],
  datasets: [],
  cycle: null,
  presentations: [],
  relay: null,
  relayConvening: null,
}

/** The whole stream, newest first, from sources handed in — pure, and the same twice. */
export function buildFeed(input: Partial<FeedInput>): FeedEntry[] {
  const i: FeedInput = { ...NO_SOURCES, ...input }
  const names = houseNames()
  return sortFeed([
    ...cycleEntries(i.cycle, names),
    ...conveningEntries(i.cycle, i.relayConvening, names),
    ...presentationEntries(i.presentations, names),
    ...artifactEntries(i.artifacts, names),
    ...registerEntries(i.works, names),
    ...relayEntries(i.relay, names),
    ...n1NightEntries(i.n1Nights, names),
    ...n1Entries(i.n1, names),
    ...archSessionEntries(i.arch, names),
    ...(i.arch ? archEntries(i.arch, names) : []),
    ...momentEntries(i.moments, i.attentionExport, names),
    ...projectEntries(i.attentionExport, names),
    ...readingEntries(i.instruments, i.werke, names),
    ...paperEntries(i.papers, names),
    ...atlasEntries(i.atlasRuns, names),
    ...datasetEntries(i.datasets, names),
    ...labEntries(i.werke, names),
  ])
}

// ── reading the record ─────────────────────────────────────────────────────────────────────

const DAY_FILE = /^(\d{4}-\d{2}-\d{2})\.json$/

const parse = (file: string): unknown => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

const isDir = (p: string): boolean => existsSync(p) && statSync(p).isDirectory()

/** Every `YYYY-MM-DD.json` of an archive — in the directory itself, or one year down
 *  (`src/content/protokoll/2026/…`). Other subdirectories are other records (redaction's
 *  `world/`, trending's `terms/`) and are not walked. `latest.json` is a copy, never a day. */
export function readArchive(dir: string): InstrumentRecord[] {
  if (!isDir(dir)) return []
  const out: InstrumentRecord[] = []
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name)
    if (/^\d{4}$/.test(name) && isDir(full)) {
      out.push(...readArchive(full))
      continue
    }
    const day = DAY_FILE.exec(name)
    if (!day) continue
    const record = parse(full)
    if (record !== null) out.push({ record, fileDate: day[1]! })
  }
  return out
}

/** An instrument that keeps one snapshot and no archive: its one record, or nothing. */
function readSnapshot(file: string): InstrumentRecord[] {
  const record = existsSync(file) ? parse(file) : null
  return record === null ? [] : [{ record, fileDate: null }]
}

/** Where each instrument's committed record lives, relative to the repository root. */
const ARCHIVES: Partial<Record<InstrumentId, string>> = {
  protokoll: 'src/content/protokoll',
  beifang: 'src/content/beifang',
  // the ledger's days, the same files /trending/<date>/ builds from (its loader validates them on
  // the build; read here from disk, because its eager glob costs more than every other archive)
  trending: 'src/data/trending',
  consensus: 'src/data/consensus',
  'invoked-past': 'src/data/invoked',
  balance: 'src/data/balance',
  'ghost-fleet': 'src/data/ghost-fleet',
  redaction: 'src/data/redaction',
  'round-number': 'src/data/round-number',
}
const SNAPSHOTS: Partial<Record<InstrumentId, string>> = {
  pattern: 'src/data/pattern/latest.json',
  tell: 'src/data/tell/latest.json',
  correction: 'src/data/revision/latest.json',
  praemie: 'src/data/praemie/police.json',
  parallaxe: 'src/data/parallaxe/register.json',
  ueberflug: 'src/data/ueberflug/satellites.json',
  spielraum: 'src/data/spielraum/watch.json',
}

/** The atlas scout's runs over the works atlas — each states the atlas's size when it started. */
const ATLAS_RUNS = 'pipelines/atlas-scout/kandidaten/werke'

export function readInstruments(root: string): InstrumentRecords {
  const records: InstrumentRecords = {}
  for (const [id, dir] of Object.entries(ARCHIVES) as [InstrumentId, string][]) records[id] = readArchive(join(root, dir))
  for (const [id, file] of Object.entries(SNAPSHOTS) as [InstrumentId, string][]) records[id] = readSnapshot(join(root, file))
  return records
}

export function readAtlasRuns(root: string): unknown[] {
  const dir = join(root, ATLAS_RUNS)
  if (!isDir(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => parse(join(dir, f)))
    .filter((r) => r !== null)
}

let cached: FeedInput | null = null

/** The committed record, read once per build — the entrance and /now both render the log. */
export function loadFeedInput(): FeedInput {
  if (cached) return cached
  const root = process.cwd()
  cached = {
    works: allWorks(),
    artifacts: loadArtifacts(root),
    arch: readArchFacts(),
    n1: readN1Works(),
    n1Nights: readN1Nights(),
    werke: WERKE,
    instruments: readInstruments(root),
    moments: attentionMoments,
    attentionExport,
    papers: PAPERS,
    atlasRuns: readAtlasRuns(root),
    datasets: DATASETS,
    cycle: loadCycle(root),
    presentations: loadPresentations(root),
    relay: loadRelay(root),
    relayConvening: loadRelayExtras(root).convening,
  }
  return cached
}

/** The house's stream from its committed record; any source can be replaced for a test. */
export function buildHouseFeed(overrides: Partial<FeedInput> = {}): FeedEntry[] {
  return buildFeed({ ...loadFeedInput(), ...overrides })
}
