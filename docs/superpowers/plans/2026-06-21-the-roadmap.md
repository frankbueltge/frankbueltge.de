# The Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein neues Experiment „The Roadmap" — ein Konzern-Quartalsbericht, der den realen Zustand der Welt aus fünf offenen Datenquellen der Optimierungslogik unterwirft; echte Daten, erfundener Rahmen.

**Architecture:** Statische Astro-Seite (EN unter `/roadmap`, DE unter `/de/roadmap`) + Methodenblatt (`/werke/roadmap`, DE-Spiegel). Daten als versionierte JSON (`src/data/roadmap/earth.json`), keine Nacht-Pipeline. Die einzige testbare Logik (`src/lib/roadmap/kpi.ts`) leitet RAG-Status, YoY und Executive Summary **deterministisch** aus den Daten ab — die Satire steckt allein im Daten-Feld `good_when` (Konzern-Bewertung), nicht in erfundenen Zahlen. Charts reusen die getesteten Helper aus `src/lib/praemie/chart.ts`.

**Tech Stack:** Astro 6, TypeScript, Tailwind v4, Vitest. Mono-Skin. Bilingual via Astro i18n (`prefixDefaultLocale:false`, EN=root, DE=`/de`).

## Global Constraints

- **Kein LLM-Text** — alle Texte deterministisch aus Templates; die Executive-Summary-Strings stehen unter Testschutz (`kpi.test.ts`).
- **Datentreue** — jede angezeigte Zahl stammt aus `earth.json` mit Quelle; nichts erfunden außer dem Rahmen-Text und dem `good_when`-Feld (im Methodenblatt offengelegt).
- **Git ist das Archiv** — `earth.json` versioniert, kein Laufzeit-Fetch.
- **Keine Secrets/PII, kein neuer API-Key.**
- **Nüchterne Lab-Rahmung** — Untertitel beschreibt, was es tut; kein Kunst-Etikett. Handle: **The Roadmap**.
- **i18n** — jede Nutzer-sichtbare Zeichenkette in `de` UND `en`.
- **Seite indexierbar** (kein `noindex`).
- Branch: `feat/the-roadmap`. Commits klein und häufig.

---

### Task 1: Reale Seed-Daten — `src/data/roadmap/earth.json`

**Files:**
- Create: `src/data/roadmap/earth.json`
- Test: `src/lib/roadmap/earth.test.ts`

**Interfaces:**
- Produces: das kanonische Daten-Artefakt, das alle folgenden Tasks konsumieren. JSON-Form (siehe unten).

JSON-Schema (ein KPI-Objekt pro Kennzahl, fünf insgesamt):

```jsonc
{
  "generated_at": "2026-06-21",
  "quarter": "Q2 2026",
  "kpis": [
    {
      "id": "democracy",
      "label": { "de": "Demokratie", "en": "Democracy" },
      "metric": { "de": "Liberal Democracy Index (global ø)", "en": "Liberal Democracy Index (global mean)" },
      "unit": "index",            // "index" | "ppm" | "percent"
      "good_when": "high",        // KONZERN-Bewertung (die Satire): "high" = mehr ist „besser"
      "target": 0.50,             // deklarierte Zielmarke des Konzerns
      "owner": { "de": "Die Geschichte", "en": "History" },
      "spin": { "de": "unter Plan", "en": "below target" },   // autorisierter Deadpan-Einzeiler
      "series": [[1990, 0.41], [2000, 0.43], [2010, 0.44], [2024, 0.37]],
      "source": { "name": "V-Dem v14", "url": "https://www.v-dem.net/", "license": "CC-BY", "retrieved": "2026-06-21" }
    }
    // … weitere KPIs
  ]
}
```

Fünf KPIs mit **echten** Reihen (reale Werte beim Abruf einsetzen, keine Platzhalter-Zahlen):

| id | good_when | Quelle | Reihe holen aus |
|---|---|---|---|
| `democracy` | `high` | V-Dem Liberal Democracy Index, globaler Mittelwert `v2x_libdem`/Jahr | v-dem.net Country-Year (CSV) → über Länder mitteln |
| `press_freedom` | `high` | RSF World Press Freedom Index, globaler Score/Jahr | rsf.org (Methodenbruch 2022 vermerken) |
| `climate` | `high` | NOAA Mauna Loa CO₂, Jahresmittel (ppm) | NOAA GML CSV (Adapter `pipelines/protokoll/.../adapters/co2.py` als Referenz) |
| `inequality` | `high` | WID.world Top-1%-Einkommensanteil/Jahr (Prozent) | wid.world Download/API |
| `biodiversity` | `high` | Living Planet Index, globaler Index/Jahr | livingplanetindex.org |

> **Konzern-Inversion (die Geste):** `climate` und `inequality` tragen bewusst `good_when:"high"` — der Konzern feiert Wachstum, egal woran gemessen. Das ist der erfundene Rahmen; die Zahlen sind echt. Das Methodenblatt (Task 7) legt das offen.
> **Ausfall-Regel:** Lässt sich eine Quelle nicht sauber abrufen, ehrlich tauschen (World-Bank-Gini statt WID; NSIDC-Arktis-Meereis — Adapter existiert) und im Methodenblatt benennen. Keine Reihe still erfinden.

- [ ] **Step 1: Reale Reihen beschaffen**

Pro Quelle die Jahres-Reihe holen (mind. ~8–10 Stützstellen, jüngstes Jahr zuletzt). Werte notieren mit Abrufdatum. Bei NOAA CO₂ ggf. `cd pipelines/protokoll && source .venv/bin/activate && python -c "from protokoll.adapters import co2; print(co2.fetch(None))"` als Referenz, sonst Direkt-CSV.

- [ ] **Step 2: `earth.json` von Hand zusammensetzen**

Fünf KPI-Objekte nach obigem Schema mit den realen Reihen, je `source.url`/`license`/`retrieved`. `spin` autorengeschrieben (Deadpan), `owner` aus: Die Geschichte / Die Aufklärung / Der Markt / Niemand / Sie.

- [ ] **Step 3: Schema-Test schreiben**

```ts
// src/lib/roadmap/earth.test.ts
import { describe, expect, it } from 'vitest'
import data from '@/data/roadmap/earth.json'

describe('earth.json', () => {
  it('hat genau fünf KPIs mit vollständiger Provenienz', () => {
    expect(data.kpis).toHaveLength(5)
    for (const k of data.kpis) {
      expect(k.id).toBeTruthy()
      expect(k.label.de).toBeTruthy(); expect(k.label.en).toBeTruthy()
      expect(['high', 'low']).toContain(k.good_when)
      expect(k.source.url).toMatch(/^https:\/\//)
      expect(k.source.license).toBeTruthy()
      expect(k.series.length).toBeGreaterThanOrEqual(5)
      // Reihe ist [Jahr, Wert]-Paare, chronologisch aufsteigend
      const years = k.series.map((p: [number, number]) => p[0])
      expect([...years].sort((a, b) => a - b)).toEqual(years)
    }
  })
})
```

- [ ] **Step 4: Test laufen lassen**

Run: `npm run test -- earth`
Expected: PASS (fünf KPIs, Provenienz vollständig, Reihen chronologisch)

- [ ] **Step 5: Commit**

```bash
git add src/data/roadmap/earth.json src/lib/roadmap/earth.test.ts
git commit -m "data(roadmap): reale Seed-Daten earth.json (5 KPIs, offene Quellen)"
```

---

### Task 2: Typen + KPI-Logik — `src/lib/roadmap/types.ts`, `kpi.ts`

**Files:**
- Create: `src/lib/roadmap/types.ts`, `src/lib/roadmap/kpi.ts`
- Test: `src/lib/roadmap/kpi.test.ts`

**Interfaces:**
- Consumes: `earth.json` (Task 1).
- Produces:
  - `interface Kpi { id; label; metric; unit; good_when:'high'|'low'; target:number; owner; spin; series:[number,number][]; source }`
  - `latest(series): [number, number]`
  - `previous(series): [number, number]`
  - `yoyPercent(series): number`  — (latest−prev)/|prev|·100
  - `trend(series): 'up'|'down'|'flat'`
  - `ragStatus(kpi): 'ok'|'warn'|'crit'`
  - `statusLabel(status, locale): string`
  - `execSummary(kpis, locale): string`

- [ ] **Step 1: Typen schreiben** (`types.ts`)

```ts
export type Locale = 'de' | 'en'
export interface Localized { de: string; en: string }
export interface KpiSource { name: string; url: string; license: string; retrieved: string }
export interface Kpi {
  id: string
  label: Localized
  metric: Localized
  unit: 'index' | 'ppm' | 'percent'
  good_when: 'high' | 'low'
  target: number
  owner: Localized
  spin: Localized
  series: [number, number][]
  source: KpiSource
}
export interface EarthData { generated_at: string; quarter: string; kpis: Kpi[] }
export type Rag = 'ok' | 'warn' | 'crit'
```

- [ ] **Step 2: Failing tests schreiben** (`kpi.test.ts`)

```ts
import { describe, expect, it } from 'vitest'
import { yoyPercent, trend, ragStatus, statusLabel, execSummary } from './kpi'
import type { Kpi } from './types'

const mk = (over: Partial<Kpi>): Kpi => ({
  id: 'x', label: { de: 'X', en: 'X' }, metric: { de: '', en: '' },
  unit: 'index', good_when: 'high', target: 0.5,
  owner: { de: '', en: '' }, spin: { de: '', en: '' },
  series: [[2000, 0.4], [2024, 0.3]], source: { name: '', url: '', license: '', retrieved: '' },
  ...over,
})

describe('yoyPercent', () => {
  it('berechnet Änderung jüngstes vs. vorletztes Jahr', () => {
    expect(yoyPercent([[2022, 100], [2023, 90], [2024, 81]])).toBeCloseTo(-10)
  })
})
describe('trend', () => {
  it('down bei fallender Reihe, up bei steigender, flat bei ~0', () => {
    expect(trend([[2023, 90], [2024, 81]])).toBe('down')
    expect(trend([[2023, 81], [2024, 90]])).toBe('up')
    expect(trend([[2023, 90], [2024, 90]])).toBe('flat')
  })
})
describe('ragStatus', () => {
  it('crit: good_when high, fallend, unter Ziel', () => {
    expect(ragStatus(mk({ good_when: 'high', target: 0.5, series: [[2000, 0.45], [2024, 0.37]] }))).toBe('crit')
  })
  it('ok: good_when high, steigend, über Ziel (z. B. Ungleichheit im Konzern-Frame)', () => {
    expect(ragStatus(mk({ good_when: 'high', target: 10, series: [[2000, 14], [2024, 19]] }))).toBe('ok')
  })
  it('warn: steigend aber unter Ziel', () => {
    expect(ragStatus(mk({ good_when: 'high', target: 0.5, series: [[2000, 0.30], [2024, 0.37]] }))).toBe('warn')
  })
})
describe('statusLabel', () => {
  it('liefert feste Deadpan-Labels je Sprache', () => {
    expect(statusLabel('crit', 'en')).toBe('critical')
    expect(statusLabel('ok', 'en')).toBe('above plan')
    expect(statusLabel('warn', 'de')).toBe('unter Beobachtung')
  })
})
describe('execSummary', () => {
  it('zählt KPIs unter Plan und nennt die Pointe (EN, festgenagelt)', () => {
    const kpis = [
      mk({ id: 'a', good_when: 'high', target: 0.5, series: [[2000, 0.45], [2024, 0.37]] }), // crit
      mk({ id: 'b', good_when: 'high', target: 0.5, series: [[2000, 0.45], [2024, 0.37]] }), // crit
      mk({ id: 'inequality', good_when: 'high', target: 10, series: [[2000, 14], [2024, 19]] }), // ok
    ]
    expect(execSummary(kpis, 'en')).toBe(
      '2 of 3 KPIs below target this quarter. Inequality continues to outperform plan. The board remains optimistic.',
    )
  })
})
```

- [ ] **Step 3: Test laufen lassen → FAIL**

Run: `npm run test -- kpi`
Expected: FAIL („yoyPercent is not a function" o. ä.)

- [ ] **Step 4: `kpi.ts` implementieren**

```ts
import type { Kpi, Locale, Rag } from './types'

export const latest = (s: [number, number][]) => s[s.length - 1]
export const previous = (s: [number, number][]) => s[s.length - 2]

export function yoyPercent(s: [number, number][]): number {
  const a = previous(s)?.[1], b = latest(s)?.[1]
  if (a == null || b == null || a === 0) return 0
  return ((b - a) / Math.abs(a)) * 100
}

export function trend(s: [number, number][]): 'up' | 'down' | 'flat' {
  const d = yoyPercent(s)
  if (Math.abs(d) < 0.01) return 'flat'
  return d > 0 ? 'up' : 'down'
}

export function ragStatus(kpi: Kpi): Rag {
  const val = latest(kpi.series)[1]
  const t = trend(kpi.series)
  const movingGood = kpi.good_when === 'high' ? t === 'up' : t === 'down'
  const aboveTarget = kpi.good_when === 'high' ? val >= kpi.target : val <= kpi.target
  if (movingGood && aboveTarget) return 'ok'
  if (movingGood || aboveTarget) return 'warn'
  return 'crit'
}

const STATUS: Record<Rag, { de: string; en: string }> = {
  ok: { de: 'über Plan', en: 'above plan' },
  warn: { de: 'unter Beobachtung', en: 'on watch' },
  crit: { de: 'kritisch', en: 'critical' },
}
export const statusLabel = (s: Rag, l: Locale) => STATUS[s][l]

export function execSummary(kpis: Kpi[], l: Locale): string {
  const below = kpis.filter((k) => ragStatus(k) !== 'ok').length
  const hasInequality = kpis.some((k) => k.id === 'inequality' && ragStatus(k) === 'ok')
  if (l === 'de') {
    const ineq = hasInequality ? ' Die Ungleichheit übertrifft weiter den Plan.' : ''
    return `${below} von ${kpis.length} KPIs unter Plan in diesem Quartal.${ineq} Der Vorstand bleibt zuversichtlich.`
  }
  const ineq = hasInequality ? ' Inequality continues to outperform plan.' : ''
  return `${below} of ${kpis.length} KPIs below target this quarter.${ineq} The board remains optimistic.`
}
```

- [ ] **Step 5: Test laufen lassen → PASS**

Run: `npm run test -- kpi`
Expected: PASS (alle Fälle inkl. festgenagelter Exec-Summary-Strings)

- [ ] **Step 6: Commit**

```bash
git add src/lib/roadmap/types.ts src/lib/roadmap/kpi.ts src/lib/roadmap/kpi.test.ts
git commit -m "feat(roadmap): KPI-Logik (RAG-Status, YoY, Exec-Summary) deterministisch + getestet"
```

---

### Task 3: i18n-Strings — `src/i18n/ui.ts`

**Files:**
- Modify: `src/i18n/ui.ts`

**Interfaces:**
- Produces: Keys `rm.title`, `rm.sub`, plus Apparat-Labels (Spaltenköpfe, Abschnittstitel, Methodenblatt-Link-Text).

- [ ] **Step 1: Keys ergänzen** (in `de` UND `en` Block, neben den bestehenden `px2.*`-Keys)

```ts
// de:
'rm.title': 'The Roadmap',
'rm.sub': 'Der Zustand der Welt als Konzern-Dashboard — echte Daten, erfundener Rahmen.',
'rm.confidential': 'Intern — nicht weitergeben',
'rm.exec': 'Executive Summary',
'rm.kpi': 'Kennzahl', 'rm.value': 'Wert', 'rm.yoy': 'ggü. Vorjahr', 'rm.status': 'Status', 'rm.owner': 'Verantwortlich',
'rm.roadmap': 'Roadmap — nächstes Quartal',
// en:
'rm.title': 'The Roadmap',
'rm.sub': 'The state of the world as a corporate dashboard — real data, invented framing.',
'rm.confidential': 'Internal — do not distribute',
'rm.exec': 'Executive Summary',
'rm.kpi': 'KPI', 'rm.value': 'Value', 'rm.yoy': 'YoY', 'rm.status': 'Status', 'rm.owner': 'Owner',
'rm.roadmap': 'Roadmap — next quarter',
```

- [ ] **Step 2: Verify (typecheck)**

Run: `npm run check`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "i18n(roadmap): Titel, Untertitel, Dashboard-Labels (DE/EN)"
```

---

### Task 4: Dashboard-Komponente — `src/components/pages/RoadmapPage.astro`

**Files:**
- Create: `src/components/pages/RoadmapPage.astro`

**Interfaces:**
- Consumes: `earth.json`; `kpi.ts` (`ragStatus`, `statusLabel`, `yoyPercent`, `latest`, `execSummary`); `yearLinePath` aus `src/lib/praemie/chart.ts`; `t()` aus `i18n/ui`.

- [ ] **Step 1: Komponente bauen**

Struktur (Astro, server-gerendert, kein Client-JS):
- `Props { locale: Locale }`.
- `const d = earth as EarthData`. RAG → Mono-Symbol-Map: `ok:'✓'`, `warn:'⚠'`, `crit:'✕'`.
- **Header-Block:** `PLANET EARTH INC. — {d.quarter} Quarterly Business Review`, darunter klein `t('rm.confidential')`.
- **Executive Summary:** `execSummary(d.kpis, locale)`.
- **KPI-Tabelle/Karten:** je KPI — `label`, `metric`, `latest()[1]` (via `Intl.NumberFormat` nach `unit`: ppm → 0 Nachkomma + " ppm", percent → 1 Nachkomma + " %", index → 2 Nachkomma), `yoyPercent` (Vorzeichen + " %"), Symbol + `statusLabel`, `owner`, `spin`, und eine Sparkline:
  ```astro
  <svg viewBox="0 0 120 28" role="img" aria-label={kpi.metric[locale]}>
    <path d={yearLinePath(kpi.series.map(([year, value]) => ({ year, value })),
      kpi.series[0][0], kpi.series.at(-1)[0],
      Math.max(...kpi.series.map((p) => p[1])), 120, 28)} fill="none" stroke="currentColor" />
  </svg>
  ```
- **Roadmap / Action Items** (statische Deadpan-Liste, autorengeschrieben, DE/EN inline):
  - EN: „Sunset: press freedom (low ROI)", „A/B-test: elections vs. no elections", „Backlog: separation of powers (P3)", „OKR: grow CO₂ +0.5% QoQ", „Celebrate: inequality milestone 🎉"
  - DE-Spiegel entsprechend.
- **Footer-Link** zum Methodenblatt: `getRelativeLocaleUrl(locale, '/werke/roadmap')`, Text `t(locale,'prot.method')`.
- Styling: Tailwind, Mono-Look, schmal (`max-w-3xl`), nüchtern-korporatistisch (Tabellengitter, dezente RAG-Farbtöne in Graustufen + ein Akzent).

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: 0 errors (Sparkline-Aufruf typt sauber; ggf. `kpi.series.at(-1)!`)

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/RoadmapPage.astro
git commit -m "feat(roadmap): Dashboard-Komponente (KPIs, Sparklines, Action Items)"
```

---

### Task 5: Methodenblatt-Komponente — `src/components/pages/MethodenblattRoadmap.astro`

**Files:**
- Create: `src/components/pages/MethodenblattRoadmap.astro`

**Interfaces:**
- Consumes: `earth.json` (Quellenliste), `t()`. Muster: bestehende `MethodenblattPraemie.astro`.

- [ ] **Step 1: Sechs Abschnitte + Umschlag bauen** (DE/EN inline `txt`-Objekt)

1. **Quellen & Lizenzen** — Liste aus `d.kpis.map(k => k.source)` (Name, URL, Lizenz, Abrufdatum).
2. **Kadenz** — „Jahresdaten; jährlich manuell aktualisiert. Keine Tagesfrische. Kanonisches Artefakt: `src/data/roadmap/earth.json` (Git = Archiv)."
3. **Verarbeitung** — „Deterministisch: RAG-Status, YoY, Executive Summary aus `src/lib/roadmap/kpi.ts`. Kein LLM." + Code-Link.
4. **Grenzen** (prominent) — RSF-Methodenbruch 2022; unterschiedliche Basisjahre; globaler Mittelwert verdeckt Verteilung; modellbasierte Schätzungen.
5. **Compute-Fußabdruck** — „Statisch gebaut, kein Nacht-Job, kein API-Key. Reduktion ist die Position."
6. **Änderungsprotokoll** — „v1 (2026-06): Erstfassung, fünf KPIs."
7. **Der Umschlag** (eigener, hervorgehobener Block): *„Jede Zahl hier ist real und oben verlinkt. Erfunden ist nur der Rahmen — inklusive der Konzern-Wertung `good_when`, die CO₂ und Ungleichheit als ‚Wachstum' führt. Der Rahmen ist der Punkt."* / EN-Spiegel.

- [ ] **Step 2: Verify** — `npm run check` → 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/MethodenblattRoadmap.astro
git commit -m "feat(roadmap): Methodenblatt inkl. reflexivem Umschlag (good_when offengelegt)"
```

---

### Task 6: Routen (EN/DE Seite + Methodenblatt) — vier Dateien

**Files:**
- Create: `src/pages/roadmap/index.astro`, `src/pages/de/roadmap/index.astro`, `src/pages/werke/roadmap.astro`, `src/pages/de/werke/roadmap.astro`

**Interfaces:**
- Consumes: `RoadmapPage.astro`, `MethodenblattRoadmap.astro`, `Page.astro`, `t()`. Muster: bestehende `src/pages/praemie/index.astro` + `src/pages/werke/praemie.astro`.

- [ ] **Step 1: EN-Seite** (`src/pages/roadmap/index.astro`)

```astro
---
import Page from '@/layouts/Page.astro'
import RoadmapPage from '@/components/pages/RoadmapPage.astro'
import { t } from '@/i18n/ui'
const locale = 'en' as const
---
<Page title={`${t(locale, 'rm.title')} | Frank Bültge`} description={t(locale, 'rm.sub')}>
  <RoadmapPage {locale} />
</Page>
```

- [ ] **Step 2: DE-Seite** (`src/pages/de/roadmap/index.astro`) — identisch, `const locale = 'de' as const`.

- [ ] **Step 3: Methodenblatt EN** (`src/pages/werke/roadmap.astro`)

```astro
---
import Page from '@/layouts/Page.astro'
import MethodenblattRoadmap from '@/components/pages/MethodenblattRoadmap.astro'
import { t } from '@/i18n/ui'
const locale = 'en' as const
---
<Page title={`${t(locale, 'prot.method')} — ${t(locale, 'rm.title')} | Frank Bültge`} description={t(locale, 'rm.sub')}>
  <MethodenblattRoadmap {locale} />
</Page>
```

- [ ] **Step 4: Methodenblatt DE** (`src/pages/de/werke/roadmap.astro`) — identisch, `locale = 'de'`.

- [ ] **Step 5: Verify** — `npm run build` baut die vier neuen Routen ohne Fehler.

- [ ] **Step 6: Commit**

```bash
git add src/pages/roadmap src/pages/de/roadmap src/pages/werke/roadmap.astro src/pages/de/werke/roadmap.astro
git commit -m "feat(roadmap): Routen EN/DE für Seite + Methodenblatt"
```

---

### Task 7: Lab-Listung + OG-Bild

**Files:**
- Modify: Lab-Index/Werk-Register (beim Umsetzen verifizieren: `src/components/pages/LabIndex.astro` oder `src/data/werke.ts`)
- Modify: `src/lib/og.ts`

**Interfaces:**
- Consumes: `rm.title`, `rm.sub`.

- [ ] **Step 1: Eintrag „The Roadmap" in der Lab-Liste** ergänzen (Status live, Link `/roadmap`), exakt im Muster der vier bestehenden Einträge — Ort vorher per Grep `hw.title`/`px2.title` bestätigen.

- [ ] **Step 2: OG-Eintrag** in `src/lib/og.ts` `OG_PAGES` für `roadmap` (Titel/Untertitel wie die anderen Seiten).

- [ ] **Step 3: Verify** — `npm run build`; `/roadmap` erscheint in der Lab-Liste, `dist/og/roadmap.png` existiert.

- [ ] **Step 4: Commit**

```bash
git add src/lib/og.ts src/components/pages/LabIndex.astro
git commit -m "feat(roadmap): Lab-Eintrag + per-Page-OG-Bild"
```

---

### Task 8: Integration — Build, Test, Verifikation, Push

**Files:** keine neuen.

- [ ] **Step 1: Voller Lauf**

Run: `npm run check && npm run test && npm run build`
Expected: 0 errors, alle Tests grün (inkl. `earth`, `kpi`), Build komplett.

- [ ] **Step 2: Render-Sichtprüfung**

`npm run dev`, dann `/roadmap`, `/de/roadmap`, `/werke/roadmap`, `/de/werke/roadmap` öffnen. Prüfen: liest sich als echter Quartalsbericht; Sparklines zeigen reale Verläufe; Ungleichheit ist „✓ above plan"; Methodenblatt-Umschlag sichtbar; Lab-Liste verlinkt.

- [ ] **Step 3: Datentreue-Check**

Jede angezeigte Zahl gegen `earth.json` + Quelle gegenprüfen. Keine Zahl ohne Provenienz.

- [ ] **Step 4: Push + PR**

```bash
git push -u origin feat/the-roadmap
```
Vercel-Preview prüfen, dann nach `main` (Frank entscheidet Merge).

---

## Self-Review

- **Spec-Coverage:** Konzept (T4/T5), 5 KPIs + Quellen (T1), Apparat/Exec-Summary/Action Items (T2/T4), Widerhaken/Methodenblatt (T5), Substanz-Gate & Grenzen (T5), Routen/i18n/Lab/OG (T3/T6/T7), Verifikation (T8). ✓
- **Platzhalter:** Reale Daten-Zahlen werden in T1 Step 1 beschafft (bewusst nicht erfunden); alle Logik-Tests nutzen synthetische Fixtures mit echten Erwartungswerten. ✓
- **Typ-Konsistenz:** `Kpi`/`EarthData`/`Rag` in T2 definiert, in T4/T5 konsumiert; `yearLinePath`-Signatur aus `praemie/chart.ts` (Punkte `{year,value}`) in T4 korrekt aufgerufen. ✓
