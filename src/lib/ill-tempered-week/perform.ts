// src/lib/ill-tempered-week/perform.ts — what a browser needs to know to play a recorded note as the press plays it
// (2026-11-14). Pure and browser-free; the engine in src/components/ill-tempered-week/orchestra.ts only loads, connects
// and starts what these functions decide.
//
// The press's sampler (scripts/ill-tempered-week/itw/sampler.py) plays one recorded note of the VSCO 2 Community
// Edition at an exact frequency: it picks the region nearest in pitch for the velocity, reads it at the ratio of the
// wanted pitch to the region's own, holds it for the note, fades it over the release, and scales it by the region's
// volume and the square of the velocity. The functions below are that rule again, on the regions
// scripts/ill-tempered-week/instruments.py cut out for the browser (public/ill-tempered-week/instruments/index.json).

export interface Region {
  /** where the region lies in its instrument's file, in seconds after the file's click */
  at: number
  seconds: number
  /** the pitch the region was recorded at */
  hz: number
  /** the same as a key number, and the keys and velocities the instrument file gives the region */
  center: number
  lokey: number
  hikey: number
  lovel: number
  hivel: number
  /** the region's own volume, in dB */
  volume: number
  /** its own release, in seconds, for a note that names none */
  release: number
  /** its place among round robins */
  seq: number
  /** what the mono cut lost: the factor that gives the mean of the two channels the level the two had */
  mono: number
  sample: string
}

export interface InstrumentFile {
  file: string
  seconds: number
  bytes: number
  sha256: string
  regions: Region[]
}

export interface InstrumentIndex {
  library: string
  rate: number
  /** the silence before the click, and the click's own length: the browser finds the click to find the start */
  lead: number
  click: number
  encoding: string
  instruments: Record<string, InstrumentFile>
}

/** A pitch as a key number, fractions included (A4 = 440 Hz = 69). */
export const midiOf = (hz: number): number => 69 + 12 * Math.log2(hz / 440)

/** A small stable hash of a round-robin key (the press uses sha1; any stable choice among equals will do). */
export function keyHash(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** The region the press's sampler picks for a pitch and a velocity (sampler.py, Instrument.pick): among the regions
 *  of the velocity's layer (all, if none), those whose keys hold the pitch (the four nearest, if none); of these the
 *  nearest in pitch; among equals, by the key. */
export function pickRegion(regions: readonly Region[], hz: number, velocity: number, key: string): Region {
  const midi = midiOf(hz)
  const m = Math.round(midi)
  const layer = regions.filter((r) => r.lovel <= velocity && velocity <= r.hivel)
  const cands = layer.length > 0 ? layer : [...regions]
  const inside = cands.filter((r) => r.lokey <= m && m <= r.hikey)
  const distance = (r: Region): number => Math.abs(r.center - midi)
  const pool = (inside.length > 0 ? inside : [...cands].sort((a, b) => distance(a) - distance(b)).slice(0, 4)).sort(
    (a, b) => distance(a) - distance(b) || a.seq - b.seq || (a.sample < b.sample ? -1 : a.sample > b.sample ? 1 : 0),
  )
  const best = pool.filter((r) => distance(r) === distance(pool[0]!))
  return best[keyHash(key) % best.length]!
}

/** How fast a region is read to sound at a pitch: the exact ratio, which is the whole of the tuning. */
export const rateFor = (region: Region, hz: number): number => hz / region.hz

/** The factor a note is scaled by: the region's volume and the square of the velocity (sampler.py, note). */
export const gainFor = (region: Region, velocity: number): number => 10 ** (region.volume / 20) * (velocity / 127) ** 2

/** A mono recording at the centre of an equal-power pan has 0.707 a side; the renderer keeps 1.0 a side. */
export const CENTRE = Math.SQRT2

/** The level a note is started at in the browser: the press's factor, the note's own (an older motif is softer), and
 *  what the browser's mono cut and its pan would otherwise lose against the press's two channels. */
export const peakFor = (region: Region, velocity: number, gain: number): number => gainFor(region, velocity) * gain * region.mono * CENTRE

/** How long a note really sounds: it is held, then released, and ends early where its recording does (read at
 *  `rate`, a region of `seconds` lasts seconds / rate). */
export function soundingFor(region: Region, hz: number, held: number, release: number | null): { held: number; release: number } {
  const lasts = region.seconds / rateFor(region, hz)
  const rel = release ?? region.release
  if (lasts >= held + rel) return { held, release: rel }
  if (lasts > held) return { held, release: Math.max(0.01, lasts - held) }
  return { held: Math.max(0.01, lasts - 0.05), release: 0.05 }
}

/** The index of the first item at or after a time, in a list sorted by time. */
export function firstFrom<T extends { t: number }>(items: readonly T[], t: number): number {
  let lo = 0
  let hi = items.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (items[mid]!.t < t) lo = mid + 1
    else hi = mid
  }
  return lo
}

/** A note as the functions above need it. */
export interface NoteAsk {
  instrument: string
  hz: number
  seconds: number
  release: number | null
  velocity: number
  key: string
}

/** What a performance really needs of the instruments: for every instrument the regions its notes pick, and of each
 *  only as many seconds of recording as its longest note reads. The engine keeps just these in memory (a whole
 *  instrument file decoded is about a hundred megabytes for one album; what the notes read is a fraction of it). */
export function neededRegions(notes: readonly NoteAsk[], index: InstrumentIndex): Map<string, Map<number, number>> {
  const out = new Map<string, Map<number, number>>()
  for (const note of notes) {
    const inst = index.instruments[note.instrument]
    if (!inst) continue
    const region = pickRegion(inst.regions, note.hz, note.velocity, note.key)
    const { held, release } = soundingFor(region, note.hz, note.seconds, note.release)
    const reads = Math.min(region.seconds, (held + release) * rateFor(region, note.hz) + 0.05)
    const regions = out.get(note.instrument) ?? out.set(note.instrument, new Map()).get(note.instrument)!
    const i = inst.regions.indexOf(region)
    regions.set(i, Math.max(regions.get(i) ?? 0, reads))
  }
  return out
}

/** The next set of silent voices after a tap on one of them: the first tap on a full ensemble leaves the tapped voice
 *  alone; later taps add a voice or take it away; a tap that would silence the last voice brings everyone back. */
export function afterTap(muted: ReadonlySet<string>, lane: string, all: readonly string[]): Set<string> {
  if (muted.size === 0) return new Set(all.filter((l) => l !== lane))
  const next = new Set(muted)
  if (next.has(lane)) next.delete(lane)
  else next.add(lane)
  return next.size >= all.length ? new Set() : next
}

/** A first-order highpass (6 dB an octave, as the press's) for a rate, as the two lists a browser's filter takes. */
export function firstOrderHighpass(hz: number, rate: number): { feedforward: [number, number]; feedback: [number, number] } {
  const k = Math.tan((Math.PI * hz) / rate)
  const b = 1 / (1 + k)
  return { feedforward: [b, -b], feedback: [1, (k - 1) / (k + 1)] }
}

/** What a browser's compressor adds to everything it passes, as the Web Audio API defines it for a hard knee: the
 *  level a full-scale signal comes out at, inverted, to the power of 0.6. The engine takes it away again before the
 *  compressor, so that a quiet passage leaves at the level it came in. */
export function makeupFor(thresholdDb: number, ratio: number): number {
  const fullRangeDb = thresholdDb * (1 - 1 / ratio)
  return (1 / 10 ** (fullRangeDb / 20)) ** 0.6
}
