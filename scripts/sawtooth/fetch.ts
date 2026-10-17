// scripts/sawtooth/fetch.ts — the archive behind Sawtooth.
//
// Two public series, fetched here and COMMITTED as a snapshot, because the house's archive rule
// says a finding must stay recomputable from what is in the repository — never from whether a
// server answers today.
//
//   · IERS EOP 20 C04 — the Earth's orientation, one row per day since 1962-01-01, read from the
//     IERS Earth Orientation Product Centre at the Paris Observatory, which produces the series
//     and updates it daily. Two of its columns matter here: UT1-UTC (how far the turning Earth
//     has drifted from atomic time, in seconds) and LOD (how much longer than 86,400 s that day
//     actually was, in seconds).
//   · The leap-second table — every correction, with the date each took effect.
//
// Why the producer's file and this series (2026-10-17): the work was first built on EOP 14 C04,
// which stops at 2026-01-05 — the IERS replaced it with 20 C04, consistent with ITRF 2020 — and
// the IERS data centre's own copy of 20 C04 lagged further behind than that. The Product
// Centre's file is the one that runs to the newest day the IERS publishes.
//
// Stored as integers on a stated scale rather than floats: LOD in microseconds, UT1-UTC in
// tenths of a millisecond. That is finer than the published uncertainty and it makes the file
// a third of the size a float dump would be, with no rounding a reader could notice.
//
// Run: npx tsx scripts/sawtooth/fetch.ts

import { writeFileSync } from 'node:fs'

const EOP = 'https://hpiers.obspm.fr/iers/eop/eopc04/eopc04.1962-now'
const LEAP = 'https://data.iana.org/time-zones/data/leap-seconds.list'
const OUT = 'src/data/sawtooth/rotation.json'

/** NTP epoch (1900-01-01) to ISO date — the leap table counts seconds from there. */
function ntpToIso(seconds: number): string {
  return new Date(Date.UTC(1900, 0, 1) + seconds * 1000).toISOString().slice(0, 10)
}

const [eopText, leapText] = await Promise.all(
  [EOP, LEAP].map(async (u) => {
    const r = await fetch(u)
    if (!r.ok) throw new Error(`${u} answered ${r.status} — nothing written`)
    return r.text()
  }),
)

// EOP row: YR MM DD HH MJD x y UT1-UTC dX dY xrt yrt LOD … (the file's own `# format` and
// `# YR` header lines document it; every header line starts with '#').
const lod: number[] = []
const ut1: number[] = []
let first = ''
let last = ''
let previousMjd: number | null = null
for (const line of eopText.split('\n')) {
  const p = line.trim().split(/\s+/)
  if (p.length < 13 || !/^\d{4}$/.test(p[0])) continue
  const date = `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`
  const mjd = Number(p[4])
  const u = Number(p[7])
  const l = Number(p[12])
  if (!Number.isFinite(mjd) || !Number.isFinite(u) || !Number.isFinite(l)) {
    throw new Error(`EOP row for ${date} does not parse — format changed; nothing written`)
  }
  // The series module reads index i as day `first + i`, so a missing or repeated day would
  // shift every date after it. The product promises one row per day; this holds it to that.
  if (previousMjd !== null && mjd !== previousMjd + 1) {
    throw new Error(`EOP jumps from MJD ${previousMjd} to ${mjd} at ${date} — not one row per day; nothing written`)
  }
  previousMjd = mjd
  if (!first) first = date
  last = date
  ut1.push(Math.round(u * 10_000)) // tenths of a millisecond
  lod.push(Math.round(l * 1_000_000)) // microseconds
}
if (lod.length === 0) throw new Error('EOP parsed to nothing — format changed; nothing written')

const leaps: { date: string; tai_utc: number }[] = []
for (const line of leapText.split('\n')) {
  if (line.startsWith('#') || !line.trim()) continue
  const [secs, offset] = line.trim().split(/\s+/)
  if (!/^\d+$/.test(secs)) continue
  leaps.push({ date: ntpToIso(Number(secs)), tai_utc: Number(offset) })
}
if (leaps.length === 0) throw new Error('leap table parsed to nothing — format changed; nothing written')

writeFileSync(
  OUT,
  JSON.stringify(
    {
      _comment:
        'Snapshot of the IERS EOP 20 C04 series and the leap-second table, committed so the finding stays recomputable. lod: microseconds a day ran longer than 86,400 s. ut1_utc: tenths of a millisecond the turning Earth stands from atomic time. Both are one value per day from `first`, with no gaps. Rebuilt by scripts/sawtooth/fetch.ts.',
      sources: { eop: EOP, leap: LEAP },
      fetched: new Date().toISOString().slice(0, 10),
      first,
      last,
      days: lod.length,
      lod,
      ut1_utc: ut1,
      leaps,
    },
    null,
    0,
  ) + '\n',
)
console.log(`${OUT}: ${lod.length} days ${first} → ${last} · ${leaps.length} table rows`)
