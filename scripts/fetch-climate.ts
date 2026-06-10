// Fetches the NASA GISTEMP global temperature anomaly series and writes a
// committed, citable snapshot to src/data/climate/global-temp-anomalies.json.
// Run with: npm run climate:refresh
//
// The snapshot is committed so the build is reproducible and offline-safe, and
// so the exact data shown on the site is auditable.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { parseGistempCsv, type ClimateMeta } from '../src/lib/climate.ts'

const URL = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'
const OUT = 'src/data/climate/global-temp-anomalies.json'

const res = await fetch(URL, {
  headers: { 'User-Agent': 'Mozilla/5.0 (frankbueltge.de climate snapshot script)' },
})
if (!res.ok) throw new Error(`GISTEMP fetch failed: ${res.status} ${res.statusText}`)
const text = await res.text()

const series = parseGistempCsv(text)
const meta: ClimateMeta = {
  source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4) — Global Land-Ocean Temperature Index',
  url: URL,
  baseline: '1951–1980',
  units: '°C anomaly',
  retrieved: new Date().toISOString().slice(0, 10),
  license: 'Public domain (NASA/GISS). Cite: GISTEMP Team 2024; Lenssen et al. 2019, J. Geophys. Res.',
}
series.meta = meta

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(series, null, 2) + '\n')

const first = series.years[0]?.year
const last = series.years.at(-1)?.year
console.log(`wrote ${OUT}: ${series.years.length} years (${first}–${last})`)
