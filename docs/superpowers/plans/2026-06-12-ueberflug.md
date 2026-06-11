# „Überflug" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Client-seitiges Werk „Überflug": welche Erdbeobachtungssatelliten haben den Besucherstandort jetzt im Sichtfeld — Buchführungs-Register, null Backend, täglicher Bahndaten-Snapshot via GitHub Action.

**Architecture:** Snapshot-Skript (tsx, Muster `scripts/fetch-climate.ts`) merged CelesTrak-OMM-JSON (GROUPs resource/sar/weather) mit GCAT `active.tsv` (CC-BY 4.0) über den internationalen Designator (`OBJECT_ID` ↔ `Piece`) → eine committete Datei `src/data/ueberflug/satellites.json` (täglich überschrieben, GitHub Action Cron). Browser-Island propagiert mit satellite.js v7 (`json2satrec` → `propagate` → `ecfToLookAngles`), klassifiziert zweistufig (Elevation > 10° Sichtkontakt, ≥ 35° Abbildungsgeometrie). Standort verlässt nie den Browser.

**Tech Stack:** tsx, Vitest, satellite.js ^7, Astro-Island (vanilla TS, client:load), Web Worker (Vite-Pattern), GitHub Actions Cron.

**Spec:** `docs/superpowers/specs/2026-06-12-ueberflug-design.md`. Verifizierte Felder: GCAT `active.tsv` Spalten `#JCAT, Piece, Name, LaunchDate, LState, Owner, OwnState, UNState, Mass, Class, Category, TF, Perigee, Apogee, Inc, OpOrbit` (Tab-getrennt, Kommentarzeilen mit `#` nach der Headerzeile möglich); CelesTrak-OMM-Keys u. a. `OBJECT_NAME, OBJECT_ID, NORAD_CAT_ID, EPOCH, MEAN_MOTION, ECCENTRICITY, INCLINATION, RA_OF_ASC_NODE, ARG_OF_PERICENTER, MEAN_ANOMALY, BSTAR, MEAN_MOTION_DOT, MEAN_MOTION_DDOT, CLASSIFICATION_TYPE, EPHEMERIS_TYPE, ELEMENT_SET_NO, REV_AT_EPOCH` (GROUP=resource hatte 167 Records).

**Branch:** `feat/ueberflug`.

---

## Dateistruktur

```
scripts/fetch-ueberflug.ts            # IO: 4 Fetches, ruft pure Builder, schreibt JSON
src/lib/ueberflug/
  types.ts                            # SatSnapshot, SatEntry, Omm, GcatMeta
  snapshot.ts                         # parseGcatActive(), buildSnapshot()  [pur, getestet]
  snapshot.test.ts
  visibility.ts                       # classifyElevation(), CLASS_LABEL, CATEGORY_LABEL
  visibility.test.ts
src/data/ueberflug/satellites.json    # täglicher Snapshot (Task 7 erzeugt den ersten)
src/components/ueberflug/
  UeberflugIsland.astro               # UI + Client-Script (satellite.js, Geolocation)
  tally-worker.ts                     # Tageszählung seit Mitternacht (30-s-Raster)
src/pages/ueberflug/index.astro       # DE-Route (+ EN-Spiegel)
src/pages/en/ueberflug/index.astro
src/pages/werke/ueberflug.astro       # Methodenblatt (+ EN-Spiegel)
src/pages/en/werke/ueberflug.astro
src/components/pages/MethodenblattUeberflug.astro
.github/workflows/ueberflug-refresh.yml
src/data/werke.ts                     # +Eintrag ueberflug
src/i18n/ui.ts                        # +Keys uefl.*
package.json                          # +satellite.js, +Skript ueberflug:refresh
```

---

### Task 1: Branch + Dependency + Typen

**Files:** Create `src/lib/ueberflug/types.ts`; Modify `package.json`.

- [ ] `git checkout -b feat/ueberflug`
- [ ] `npm install satellite.js` (^7)
- [ ] `package.json` scripts ergänzen: `"ueberflug:refresh": "tsx scripts/fetch-ueberflug.ts"`
- [ ] `src/lib/ueberflug/types.ts`:

```ts
/** Tagessnapshot der Bahndaten (von scripts/fetch-ueberflug.ts erzeugt, täglich überschrieben). */
export interface Omm {
  OBJECT_NAME: string
  OBJECT_ID: string
  NORAD_CAT_ID: number
  EPOCH: string
  MEAN_MOTION: number
  ECCENTRICITY: number
  INCLINATION: number
  RA_OF_ASC_NODE: number
  ARG_OF_PERICENTER: number
  MEAN_ANOMALY: number
  EPHEMERIS_TYPE: number
  CLASSIFICATION_TYPE: string
  ELEMENT_SET_NO: number
  REV_AT_EPOCH: number
  BSTAR: number
  MEAN_MOTION_DOT: number
  MEAN_MOTION_DDOT: number
}

/** GCAT-Klassen: C zivil, D militärisch, B kommerziell, A Amateur. */
export type GcatClass = 'C' | 'D' | 'B' | 'A'

export interface SatEntry {
  norad: number
  name: string
  intl: string // internationaler Designator (Join-Schlüssel)
  group: string // CelesTrak-GROUP (resource | sar | weather)
  gcat: { class: GcatClass | null; category: string | null; owner: string | null; state: string | null }
  omm: Omm
}

export interface SatSnapshot {
  generated_at: string
  sources: { name: string; url: string; license: string }[]
  satellites: SatEntry[]
}
```

- [ ] `npm run check` → 0 Errors. Commit: `feat(ueberflug): scaffold — satellite.js dep, snapshot types`

---

### Task 2: Snapshot-Builder (pur, TDD)

**Files:** Create `src/lib/ueberflug/snapshot.ts`; Test `src/lib/ueberflug/snapshot.test.ts`.

- [ ] Failing Tests:

```ts
import { describe, expect, it } from 'vitest'
import { buildSnapshot, parseGcatActive } from './snapshot'
import type { Omm } from './types'

const GCAT_TSV = [
  '#JCAT\tPiece\tName\tLaunchDate\tLState\tOwner\tOwnState\tUNState\tMass\tClass\tCategory\tTF\tPerigee\tApogee\tInc\tOpOrbit',
  '# Updated 2026 Jun 10',
  'S00965\t1964-083D\tNNS 30020\t1964 Dec 13\tUS\tBUWEPS\tUS\tUS\t54.000\tD\tNAV\tZ\t1027\t1084\t89.98\tLEO/P',
  'S39084\t2013-008A\tLandsat 8\t2013 Feb 11\tUS\tUSGS\tUS\tUS\t1512\tC\tIMG\tZ\t702\t703\t98.2\tLEO/S',
].join('\n')

function omm(partial: Partial<Omm>): Omm {
  return {
    OBJECT_NAME: 'X', OBJECT_ID: '2013-008A', NORAD_CAT_ID: 39084, EPOCH: '2026-06-12T00:00:00',
    MEAN_MOTION: 14.57, ECCENTRICITY: 0.0001, INCLINATION: 98.2, RA_OF_ASC_NODE: 100,
    ARG_OF_PERICENTER: 90, MEAN_ANOMALY: 0, EPHEMERIS_TYPE: 0, CLASSIFICATION_TYPE: 'U',
    ELEMENT_SET_NO: 999, REV_AT_EPOCH: 1, BSTAR: 0.0001, MEAN_MOTION_DOT: 0,
    MEAN_MOTION_DDOT: 0, ...partial,
  }
}

describe('parseGcatActive', () => {
  it('parst Datenzeilen, überspringt #-Zeilen, indiziert nach Piece', () => {
    const map = parseGcatActive(GCAT_TSV)
    expect(map.get('2013-008A')).toEqual({ class: 'C', category: 'IMG', owner: 'USGS', state: 'US' })
    expect(map.get('1964-083D')?.class).toBe('D')
    expect(map.size).toBe(2)
  })

  it('unbekannte Klasse wird null', () => {
    const tsv = GCAT_TSV.replace('\tC\tIMG\t', '\tX\tIMG\t')
    expect(parseGcatActive(tsv).get('2013-008A')).toEqual({
      class: null, category: 'IMG', owner: 'USGS', state: 'US',
    })
  })
})

describe('buildSnapshot', () => {
  it('joined OMM mit GCAT über OBJECT_ID, dedupliziert über NORAD, sortiert nach Name', () => {
    const groups = {
      resource: [omm({ OBJECT_NAME: 'LANDSAT 8', OBJECT_ID: '2013-008A', NORAD_CAT_ID: 39084 })],
      sar: [
        omm({ OBJECT_NAME: 'LANDSAT 8', OBJECT_ID: '2013-008A', NORAD_CAT_ID: 39084 }), // Duplikat
        omm({ OBJECT_NAME: 'ANONYM', OBJECT_ID: '2099-001A', NORAD_CAT_ID: 99999 }),    // ohne GCAT
      ],
    }
    const snap = buildSnapshot(groups, parseGcatActive(GCAT_TSV), '2026-06-12T05:00:00Z')
    expect(snap.satellites).toHaveLength(2)
    const landsat = snap.satellites.find((s) => s.norad === 39084)!
    expect(landsat.gcat).toEqual({ class: 'C', category: 'IMG', owner: 'USGS', state: 'US' })
    expect(landsat.group).toBe('resource') // erste Gruppe gewinnt
    const anon = snap.satellites.find((s) => s.norad === 99999)!
    expect(anon.gcat).toEqual({ class: null, category: null, owner: null, state: null })
    expect(snap.generated_at).toBe('2026-06-12T05:00:00Z')
    expect(snap.sources.map((s) => s.name)).toEqual(['CelesTrak', 'GCAT (J. McDowell, planet4589.org)'])
  })
})
```

- [ ] Rot laufen lassen (`npm run test`), dann implementieren:

```ts
import type { GcatClass, Omm, SatEntry, SatSnapshot } from './types'

export interface GcatMeta {
  class: GcatClass | null
  category: string | null
  owner: string | null
  state: string | null
}

const GCAT_CLASSES = new Set(['C', 'D', 'B', 'A'])

/** GCAT active.tsv → Map nach internationalem Designator (Spalte "Piece"). */
export function parseGcatActive(tsv: string): Map<string, GcatMeta> {
  const lines = tsv.split('\n')
  const header = (lines[0] ?? '').replace(/^#/, '').split('\t')
  const col = (name: string) => header.indexOf(name)
  const iPiece = col('Piece'), iClass = col('Class'), iCat = col('Category')
  const iOwner = col('Owner'), iState = col('OwnState')
  const map = new Map<string, GcatMeta>()
  for (const line of lines.slice(1)) {
    if (!line.trim() || line.startsWith('#')) continue
    const f = line.split('\t').map((c) => c.trim())
    const piece = f[iPiece]
    if (!piece) continue
    const cls = f[iClass]
    map.set(piece, {
      class: GCAT_CLASSES.has(cls) ? (cls as GcatClass) : null,
      category: f[iCat] || null,
      owner: f[iOwner] || null,
      state: f[iState] || null,
    })
  }
  return map
}

const SOURCES = [
  { name: 'CelesTrak', url: 'https://celestrak.org/NORAD/elements/', license: 'frei verfügbar; Attribution. Ursprünglich USSPACECOM/Space-Track.' },
  { name: 'GCAT (J. McDowell, planet4589.org)', url: 'https://planet4589.org/space/gcat/', license: 'CC-BY 4.0' },
]

export function buildSnapshot(
  groups: Record<string, Omm[]>,
  gcat: Map<string, GcatMeta>,
  generatedAt: string,
): SatSnapshot {
  const byNorad = new Map<number, SatEntry>()
  for (const [group, records] of Object.entries(groups)) {
    for (const o of records) {
      if (byNorad.has(o.NORAD_CAT_ID)) continue
      const meta = gcat.get(o.OBJECT_ID) ?? { class: null, category: null, owner: null, state: null }
      byNorad.set(o.NORAD_CAT_ID, {
        norad: o.NORAD_CAT_ID, name: o.OBJECT_NAME, intl: o.OBJECT_ID, group, gcat: meta, omm: o,
      })
    }
  }
  return {
    generated_at: generatedAt,
    sources: SOURCES,
    satellites: [...byNorad.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }
}
```

- [ ] Grün; Commit: `feat(ueberflug): snapshot builder — GCAT parse + OMM join (TDD)`

---

### Task 3: Fetch-Skript + GitHub Action

**Files:** Create `scripts/fetch-ueberflug.ts`, `.github/workflows/ueberflug-refresh.yml`.

- [ ] `scripts/fetch-ueberflug.ts` (Muster `fetch-climate.ts`; IO dünn, Logik im getesteten Builder):

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import { buildSnapshot, parseGcatActive } from '../src/lib/ueberflug/snapshot'
import type { Omm } from '../src/lib/ueberflug/types'

const UA = 'frankbueltge.de werkgruppe (hello@frankbueltge.de)'
const GROUPS = ['resource', 'sar', 'weather'] as const
const GCAT_URL = 'https://planet4589.org/space/gcat/tsv/derived/active.tsv'
const OUT = 'src/data/ueberflug/satellites.json'

async function get(url: string): Promise<Response> {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`)
  return r
}

const groups: Record<string, Omm[]> = {}
for (const g of GROUPS) {
  const r = await get(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=json`)
  groups[g] = (await r.json()) as Omm[]
  console.log(`${g}: ${groups[g].length} Satelliten`)
}
const gcat = parseGcatActive(await (await get(GCAT_URL)).text())
console.log(`GCAT: ${gcat.size} aktive Objekte`)

const snapshot = buildSnapshot(groups, gcat, new Date().toISOString().replace(/\.\d+Z$/, 'Z'))
await mkdir('src/data/ueberflug', { recursive: true })
await writeFile(OUT, JSON.stringify(snapshot, null, 1) + '\n')
const matched = snapshot.satellites.filter((s) => s.gcat.class !== null).length
console.log(`geschrieben: ${OUT} — ${snapshot.satellites.length} Satelliten, ${matched} mit GCAT-Klasse`)
if (matched / snapshot.satellites.length < 0.5) {
  throw new Error('GCAT-Join-Quote < 50 % — Feldstruktur prüfen, nicht committen')
}
```

- [ ] `.github/workflows/ueberflug-refresh.yml`:

```yaml
# Täglicher Bahndaten-Snapshot für "Überflug". Öffentliche Quellen, keine Secrets.
name: ueberflug-refresh

on:
  schedule:
    - cron: '0 5 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run ueberflug:refresh
      - name: Commit wenn geändert
        run: |
          git config user.name "Protokollführung"
          git config user.email "protokoll@frankbueltge.de"
          git add src/data/ueberflug/satellites.json
          git diff --cached --quiet && echo "keine Änderung" && exit 0
          git commit -m "ueberflug: Bahndaten vom $(date -u +%F)"
          git push
```

- [ ] Verify: `npm run check` (Skript wird typgeprüft). Den echten Fetch erst in Task 7 ausführen.
- [ ] Commit: `feat(ueberflug): daily snapshot fetch script + actions cron`

---

### Task 4: Sichtbarkeit + Labels (TDD)

**Files:** Create `src/lib/ueberflug/visibility.ts`; Test `visibility.test.ts`.

- [ ] Failing Tests:

```ts
import { describe, expect, it } from 'vitest'
import { CLASS_LABEL, classifyElevation, deg } from './visibility'

describe('classifyElevation (Radiant-Input)', () => {
  it('zweistufiges Kriterium aus der Spec', () => {
    expect(classifyElevation(deg(-5))).toBe('none')
    expect(classifyElevation(deg(5))).toBe('none')     // unter Maskenwinkel
    expect(classifyElevation(deg(10.01))).toBe('contact')
    expect(classifyElevation(deg(34.9))).toBe('contact')
    expect(classifyElevation(deg(35))).toBe('imaging')
    expect(classifyElevation(deg(90))).toBe('imaging')
  })
})

describe('CLASS_LABEL', () => {
  it('GCAT-Klassen → Register-Labels DE/EN', () => {
    expect(CLASS_LABEL.D.de).toBe('militärisch')
    expect(CLASS_LABEL.B.en).toBe('commercial')
    expect(CLASS_LABEL.C.de).toBe('staatlich-zivil')
    expect(CLASS_LABEL.A.de).toBe('Amateur')
    expect(CLASS_LABEL.unknown.de).toBe('nicht klassifiziert')
  })
})
```

- [ ] Implementierung:

```ts
import type { Locale } from '@/lib/site'

/** Spec §3: > 10° Sichtkontakt möglich; >= 35° Abbildungsgeometrie wahrscheinlich. */
export const CONTACT_MIN_RAD = (10 * Math.PI) / 180
export const IMAGING_MIN_RAD = (35 * Math.PI) / 180

export type Sicht = 'none' | 'contact' | 'imaging'

export function deg(d: number): number {
  return (d * Math.PI) / 180
}

export function classifyElevation(elevationRad: number): Sicht {
  if (elevationRad >= IMAGING_MIN_RAD) return 'imaging'
  if (elevationRad > CONTACT_MIN_RAD) return 'contact'
  return 'none'
}

type L10n = Record<Locale, string>

export const CLASS_LABEL: Record<'C' | 'D' | 'B' | 'A' | 'unknown', L10n> = {
  C: { de: 'staatlich-zivil', en: 'state-civil' },
  D: { de: 'militärisch', en: 'military' },
  B: { de: 'kommerziell', en: 'commercial' },
  A: { de: 'Amateur', en: 'amateur' },
  unknown: { de: 'nicht klassifiziert', en: 'not classified' },
}

export const CATEGORY_LABEL: Record<string, L10n> = {
  IMG: { de: 'Abbildung', en: 'imaging' },
  MET: { de: 'Wetter', en: 'weather' },
  EW: { de: 'Frühwarnung', en: 'early warning' },
  SIG: { de: 'Signalerfassung', en: 'signals' },
  SCI: { de: 'Wissenschaft', en: 'science' },
}

export function categoryLabel(cat: string | null, locale: Locale): string {
  if (!cat) return CLASS_LABEL.unknown[locale]
  return CATEGORY_LABEL[cat]?.[locale] ?? cat
}
```

- [ ] Grün; Commit: `feat(ueberflug): visibility tiers and register labels (TDD)`

---

### Task 5: Island — das Werk im Browser

**Files:** Create `src/components/ueberflug/UeberflugIsland.astro`, `src/components/ueberflug/tally-worker.ts`.

`tally-worker.ts` (Tagesbilanz seit Mitternacht lokal, 30-s-Raster; Botschaft rein/raus als strukturierte Daten):

```ts
/// <reference lib="webworker" />
import * as satellite from 'satellite.js'
import { CONTACT_MIN_RAD } from '@/lib/ueberflug/visibility'
import type { Omm } from '@/lib/ueberflug/types'

interface TallyRequest {
  omms: Omm[]
  observer: { latDeg: number; lonDeg: number; heightKm: number }
  startMs: number // Mitternacht lokal
  endMs: number   // jetzt
}

self.onmessage = (ev: MessageEvent<TallyRequest>) => {
  const { omms, observer, startMs, endMs } = ev.data
  const gd = {
    latitude: satellite.degreesToRadians(observer.latDeg),
    longitude: satellite.degreesToRadians(observer.lonDeg),
    height: observer.heightKm,
  }
  const satrecs = omms
    .map((o) => { try { return satellite.json2satrec(o) } catch { return null } })
    .filter((r) => r !== null)
  let contacts = 0
  const stepMs = 30_000
  const above = new Array(satrecs.length).fill(false)
  for (let t = startMs; t <= endMs; t += stepMs) {
    const date = new Date(t)
    const gmst = satellite.gstime(date)
    for (let i = 0; i < satrecs.length; i++) {
      const pv = satellite.propagate(satrecs[i]!, date)
      const pos = pv?.position
      if (!pos || typeof pos === 'boolean') { above[i] = false; continue }
      const look = satellite.ecfToLookAngles(gd, satellite.eciToEcf(pos, gmst))
      const isAbove = look.elevation > CONTACT_MIN_RAD
      if (isAbove && !above[i]) contacts++ // steigende Flanke = neuer Sichtkontakt
      above[i] = isAbove
    }
    if ((t - startMs) % (stepMs * 60) === 0) {
      self.postMessage({ type: 'progress', done: t - startMs, total: endMs - startMs })
    }
  }
  self.postMessage({ type: 'result', contacts })
}
```

`UeberflugIsland.astro` — Server-Teil lädt den Snapshot, Client-Script übernimmt:

```astro
---
import { t } from '@/i18n/ui'
import type { Locale } from '@/lib/site'
import snapshot from '@/data/ueberflug/satellites.json'

interface Props { locale: Locale }
const { locale } = Astro.props
const count = snapshot.satellites.length
const generated = snapshot.generated_at
---

<section class="mx-auto max-w-2xl px-4 py-14" data-ueberflug data-locale={locale}>
  <h1 class="mb-2 text-xl font-semibold">{t(locale, 'uefl.title')}</h1>
  <p class="mb-6 leading-relaxed text-fg-muted">{t(locale, 'uefl.intro')}</p>
  <p class="mb-8 font-mono text-xs text-fg-faint">{t(locale, 'uefl.privacy')}</p>

  <div class="mb-8 flex flex-wrap items-center gap-3" data-controls>
    <button data-locate class="rounded-md border border-line px-4 py-2 text-sm transition-colors hover:text-fg">
      {t(locale, 'uefl.locate')}
    </button>
    <span class="text-sm text-fg-faint">{t(locale, 'uefl.or')}</span>
    <input data-lat type="number" step="0.01" min="-90" max="90" placeholder={t(locale, 'uefl.lat')}
      class="w-28 rounded-md border border-line bg-transparent px-2 py-2 font-mono text-sm" />
    <input data-lon type="number" step="0.01" min="-180" max="180" placeholder={t(locale, 'uefl.lon')}
      class="w-28 rounded-md border border-line bg-transparent px-2 py-2 font-mono text-sm" />
    <button data-manual class="rounded-md border border-line px-4 py-2 text-sm transition-colors hover:text-fg">
      {t(locale, 'uefl.calc')}
    </button>
  </div>

  <div data-status class="mb-6 text-sm text-fg-muted"></div>

  <div data-result hidden>
    <h2 class="mb-1 font-semibold" data-now-heading></h2>
    <p class="mb-4 font-mono text-xs text-fg-faint" data-tally></p>
    <ul data-list class="space-y-2"></ul>
    <p class="mt-8 border-t border-line pt-4 font-mono text-xs text-fg-faint">
      {t(locale, 'uefl.dataAsOf')} {generated} · {count} {t(locale, 'uefl.satellites')} ·
      CelesTrak · GCAT (J. McDowell, planet4589.org, CC-BY 4.0) ·
      <a href={locale === 'de' ? '/werke/ueberflug' : '/en/werke/ueberflug'} class="hover:text-fg">{t(locale, 'prot.method')}</a>
    </p>
  </div>
</section>

<script>
  import * as satellite from 'satellite.js'
  import snapshot from '@/data/ueberflug/satellites.json'
  import { classifyElevation, CLASS_LABEL, categoryLabel } from '@/lib/ueberflug/visibility'
  import type { SatEntry } from '@/lib/ueberflug/types'

  const root = document.querySelector<HTMLElement>('[data-ueberflug]')!
  const locale = (root.dataset.locale ?? 'de') as 'de' | 'en'
  const de = locale === 'de'
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!

  const sats = (snapshot.satellites as SatEntry[]).map((s) => {
    try { return { meta: s, rec: satellite.json2satrec(s.omm as never) } } catch { return null }
  }).filter((x): x is NonNullable<typeof x> => x !== null)

  let observer: { latDeg: number; lonDeg: number } | null = null
  let timer: number | undefined
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  function fmtDeg(rad: number): string {
    return `${((rad * 180) / Math.PI).toFixed(0)}°`
  }

  function render() {
    if (!observer) return
    const gd = {
      latitude: satellite.degreesToRadians(observer.latDeg),
      longitude: satellite.degreesToRadians(observer.lonDeg),
      height: 0,
    }
    const now = new Date()
    const gmst = satellite.gstime(now)
    const visible: { meta: SatEntry; elevation: number; azimuth: number; tier: string }[] = []
    for (const { meta, rec } of sats) {
      const pv = satellite.propagate(rec, now)
      const pos = pv?.position
      if (!pos || typeof pos === 'boolean') continue
      const look = satellite.ecfToLookAngles(gd, satellite.eciToEcf(pos, gmst))
      const tier = classifyElevation(look.elevation)
      if (tier !== 'none') visible.push({ meta, elevation: look.elevation, azimuth: look.azimuth, tier })
    }
    visible.sort((a, b) => b.elevation - a.elevation)

    $('[data-now-heading]').textContent = de
      ? `Jetzt im Sichtfeld: ${visible.length}`
      : `In view now: ${visible.length}`
    const list = $('[data-list]')
    list.innerHTML = ''
    for (const v of visible) {
      const li = document.createElement('li')
      li.className = 'border-t border-line pt-2 text-sm'
      const cls = CLASS_LABEL[v.meta.gcat.class ?? 'unknown'][locale]
      const cat = categoryLabel(v.meta.gcat.category, locale)
      const imaging = v.tier === 'imaging'
        ? (de ? ' · Abbildungsgeometrie wahrscheinlich' : ' · imaging geometry likely')
        : ''
      li.innerHTML = `<span class="font-semibold">${v.meta.name}</span>
        <span class="text-fg-muted"> — ${cls} · ${cat}${v.meta.gcat.state ? ` · ${v.meta.gcat.state}` : ''}</span>
        <span class="block font-mono text-xs text-fg-faint">Elevation ${fmtDeg(v.elevation)} · Azimut ${fmtDeg(v.azimuth)}${imaging}</span>`
      list.appendChild(li)
    }
    $('[data-result]').hidden = false
  }

  function startTally() {
    if (!observer) return
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
    const worker = new Worker(new URL('./tally-worker.ts', import.meta.url), { type: 'module' })
    $('[data-tally]').textContent = de ? 'Sichtkontakte heute: wird gezählt …' : 'Contacts today: counting …'
    worker.onmessage = (ev) => {
      if (ev.data.type === 'result') {
        $('[data-tally]').textContent = de
          ? `Sichtkontakte heute seit Mitternacht: ${ev.data.contacts}`
          : `Contacts today since midnight: ${ev.data.contacts}`
        worker.terminate()
      }
    }
    worker.postMessage({
      omms: sats.map((s) => s.meta.omm),
      observer: { latDeg: observer.latDeg, lonDeg: observer.lonDeg, heightKm: 0 },
      startMs: midnight.getTime(),
      endMs: Date.now(),
    })
  }

  function activate(latDeg: number, lonDeg: number) {
    observer = { latDeg, lonDeg }
    $('[data-status]').textContent = de
      ? `Standort gesetzt (${latDeg.toFixed(2)}, ${lonDeg.toFixed(2)}) — bleibt im Browser.`
      : `Location set (${latDeg.toFixed(2)}, ${lonDeg.toFixed(2)}) — stays in your browser.`
    render()
    startTally()
    if (timer) clearInterval(timer)
    if (!reduced) timer = window.setInterval(render, 1000)
  }

  $('[data-locate]').addEventListener('click', () => {
    $('[data-status]').textContent = de ? 'Frage Standort an …' : 'Requesting location …'
    navigator.geolocation.getCurrentPosition(
      (p) => activate(p.coords.latitude, p.coords.longitude),
      () => { $('[data-status]').textContent = de
        ? 'Kein Zugriff — Koordinaten manuell eingeben.' : 'No access — enter coordinates manually.' },
      { enableHighAccuracy: false, timeout: 10_000 },
    )
  })
  $('[data-manual]').addEventListener('click', () => {
    const lat = parseFloat(($('[data-lat]') as HTMLInputElement).value)
    const lon = parseFloat(($('[data-lon]') as HTMLInputElement).value)
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      activate(lat, lon)
    } else {
      $('[data-status]').textContent = de ? 'Ungültige Koordinaten.' : 'Invalid coordinates.'
    }
  })
</script>
```

- [ ] Verify: `npm run check` (Island typsauber; satellites.json existiert ggf. noch nicht → Task 7 liefert sie; für check/build einen minimalen Platzhalter-Snapshot `{ "generated_at": "", "sources": [], "satellites": [] }` anlegen und in Task 7 ersetzen).
- [ ] Commit: `feat(ueberflug): browser island — SGP4 live register, day tally worker, consent-first location`

---

### Task 6: Routen, i18n, Werkverzeichnis, Methodenblatt

**Files:** Create Routen + `MethodenblattUeberflug.astro`; Modify `src/i18n/ui.ts`, `src/data/werke.ts`.

- [ ] i18n-Keys (beide Blöcke; EN sinngleich):

```ts
    'uefl.title': 'Überflug',
    'uefl.sub': 'Der Himmel führt Buch — wer dich jetzt im Sichtfeld hat.',
    'uefl.intro': 'Diese Seite berechnet in deinem Browser, welche Erdbeobachtungssatelliten deinen Standort jetzt im Sichtfeld haben — aus öffentlichen Bahndaten, mit Eigentümer-Klassifikation.',
    'uefl.privacy': 'Dein Standort verlässt diesen Browser nicht. Nichts wird gespeichert, nichts gesendet — alles rechnet lokal.',
    'uefl.locate': 'Standort bestimmen',
    'uefl.or': 'oder',
    'uefl.lat': 'Breite',
    'uefl.lon': 'Länge',
    'uefl.calc': 'Berechnen',
    'uefl.dataAsOf': 'Bahndaten vom',
    'uefl.satellites': 'Satelliten',
```

(EN: 'Overpass' als Untertitel-Zusatz vermeiden — Werktitel bleibt „Überflug"; 'uefl.sub': 'The sky keeps a ledger — who has you in view right now.' usw.)

- [ ] Routen `src/pages/ueberflug/index.astro` (+ EN): Page-Wrapper, `<UeberflugIsland locale={locale} />`.
- [ ] `src/data/werke.ts`: zweiter Eintrag (id `ueberflug`, title `Überflug`, status `live`, href `/ueberflug`, subtitle de `Der Himmel führt Buch` / en `The sky keeps a ledger`, description aus Spec §1 verdichtet).
- [ ] `MethodenblattUeberflug.astro` (6 Abschnitte, gleiche Optik wie Protokoll-Methodenblatt):
  1. Quellen & Lizenzen: CelesTrak (GROUPs resource/sar/weather, OMM/JSON; frei verfügbar, Attribution; Ursprung USSPACECOM/Space-Track) · GCAT, J. McDowell, CC-BY 4.0 · satellite.js v7, MIT.
  2. Kadenz: Snapshot täglich 05:00 UTC via GitHub Action; `generated_at` im UI; Bahndaten operativ (Tage gültig), bewusst überschrieben statt archiviert.
  3. Verarbeitung: SGP4 client-seitig; Join CelesTrak↔GCAT über internationalen Designator; Code öffentlich (Link `scripts/fetch-ueberflug.ts` + `src/lib/ueberflug/` im Repo).
  4. Grenzen: Sichtkontakt (>10°) ≠ Aufnahme; ≥35° heißt nur „Abbildungsgeometrie wahrscheinlich"; nur katalogisierte, unklassifizierte Objekte — geheime Systeme fehlen, und genau diese Lücke gehört zur Aussage; Auswahl auf EO-Gruppen begrenzt (Kommunikation/Navigation ausgenommen); GCAT-Zuordnung kann Einzelfälle verfehlen.
  5. Compute-Fußabdruck: null Backend; 1 Actions-Lauf/Tag (~1 min); Rechenlast liegt beim Besucher (bewusst: das Werk rechnet dort, wo geschaut wird).
  6. Änderungsprotokoll: v1 — Erstfassung.
- [ ] Verify: `npm run check && npm run test && npm run build`.
- [ ] Commit: `feat(ueberflug): routes, register entry, method sheet DE/EN`

---

### Task 7: Erster Snapshot + Endabnahme

- [ ] `npm run ueberflug:refresh` — echte Quellen; Join-Quote im Log prüfen (Skript bricht < 50 % ab). Platzhalter-Snapshot ist damit ersetzt.
- [ ] `npm run test && npm run check && npm run build` — alles grün.
- [ ] Sichtprüfung `npm run dev`: `/ueberflug` (manuelle Koordinaten z. B. 50.98 / 11.03), Liste plausibel (tagsüber typischerweise 1–10 EO-Satelliten > 10°), `/werke` zeigt zwei Werke, Methodenblatt vollständig, EN-Spiegel.
- [ ] Commit Snapshot: `ueberflug: Bahndaten vom <datum> (Erstsnapshot, lokaler Lauf)`
- [ ] Abnahme gegen Spec §7-Checkliste; Branch fertig melden (Merge-Entscheidung beim Nutzer).
