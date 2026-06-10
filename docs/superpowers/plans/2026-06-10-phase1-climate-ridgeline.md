# Phase 1 — Klima-Ridgeline-Puls + schlanke Startseite

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** Den generativen Sinus-Puls im Hero durch echte, zitierte globale Temperatur-Anomalien ersetzen (Jahr→Ridge · Monat→x · Anomalie→Höhe) und die Startseite vom BI-Dashboard auf einen schlanken Daten-Art-Hero umstellen.

**Architecture:** Reine, getestete Datenschicht (`src/lib/climate.ts`: CSV-Parser + Ridge-Transform) ← Snapshot-JSON (per Skript aus NASA GISTEMP geholt) → `HeroField.astro` rendert die Ridges auf Canvas. Startseite rendert eine neue `Home.astro` (Hero + Statement + Lab-Platzhalter) statt `Dashboard.astro`.

**Tech Stack:** Astro 5, TypeScript, Canvas 2D, Vitest (neu, für die Datenschicht), tsx (neu, für das Fetch-Skript). NASA GISTEMP v4 (Global Land-Ocean, Basis 1951–1980).

**Integritäts-Prinzip:** echte zitierte Daten, sichtbare Quelle + Basisperiode, ehrliche Kodierung, keine kosmetische Verzerrung.

---

### Task 0: Werkzeug & Git

**Files:** `package.json`, `vitest.config.ts` (create), `.gitignore` (create)

- [ ] `git init` (Projekt ist noch kein Repo); `.gitignore` mit `node_modules`, `dist`, `.astro`.
- [ ] `npm install -D vitest tsx`
- [ ] `package.json` scripts ergänzen: `"test": "vitest run"`, `"climate:refresh": "tsx scripts/fetch-climate.ts"`
- [ ] `vitest.config.ts`: `import { defineConfig } from 'vitest/config'; export default defineConfig({ test: { include: ['src/**/*.test.ts'] } })`
- [ ] Verify: `npx vitest run` läuft (0 Tests ok).

### Task 1: Datenschicht — Typen + GISTEMP-Parser (TDD)

**Files:** Create `src/lib/climate.ts`, `src/lib/climate.test.ts`

- [ ] **Test schreiben** (`climate.test.ts`): `parseGistempCsv` auf Fixture mit Titelzeile, Header `Year,Jan,...,Dec,J-D,...`, zwei Datenzeilen inkl. `***` → liefert `{ years: [{year, months:[...]}] }`, `***`→`null`.
- [ ] `npx vitest run` → FAIL.
- [ ] **Implementieren** `parseGistempCsv(text): ClimateSeries`:
  - Zeilen splitten; Headerzeile finden (`startsWith('Year')`); danach Datenzeilen: `cells = line.split(',')`; nur wenn `/^\d{4}$/`.test(cells[0]); `months = cells.slice(1,13).map(v => v.trim()==='***'||v.trim()===''?null:parseFloat(v))`.
  - Typen: `type Month = number|null; interface YearRow { year:number; months:Month[] } interface ClimateSeries { years:YearRow[]; meta?:Meta }`.
- [ ] `npx vitest run` → PASS. Commit.

### Task 2: Datenschicht — Ridge-Transform (TDD)

**Files:** Modify `src/lib/climate.ts`, `src/lib/climate.test.ts`

- [ ] **Test:** `seriesToRidges` mit Fixture (1880 alle 0.0, 2020 alle 2.0) → globale min0/max2 → 1880 heights alle 0, 2020 heights alle 1; Ergebnis sortiert ältestes zuerst. Zweiter Test: Jahr mit interior `null` wird linear interpoliert.
- [ ] FAIL.
- [ ] **Implementieren** `seriesToRidges(series): Ridge[]` (`interface Ridge{year:number;heights:number[]}`):
  - interior-nulls je Jahr linear interpolieren; Rand-nulls vom nächsten Wert füllen; Jahre ohne Werte überspringen.
  - globales min/max über alle gefüllten Werte; `height=(v-min)/(max-min)`.
  - sortiert nach `year` aufsteigend (ältestes zuerst → hinten/oben im Feld).
- [ ] PASS. Commit.

### Task 3: Snapshot holen (echte Daten)

**Files:** Create `scripts/fetch-climate.ts`, `src/data/climate/global-temp-anomalies.json`

- [ ] `fetch-climate.ts`: `fetch('https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv')` → text → `parseGistempCsv` → JSON mit `meta` schreiben (`source:'NASA GISTEMP v4'`, `url`, `baseline:'1951–1980'`, `units:'°C anomaly'`, `retrieved` (über `args`/Datum), `license:'public domain (NASA)'`).
- [ ] `npm run climate:refresh` → erzeugt `src/data/climate/global-temp-anomalies.json` mit echten Reihen ab 1880.
- [ ] Verify: JSON enthält ~145 Jahre, jüngste Jahre höhere Anomalien. Commit (Snapshot + Skript).

### Task 4: HeroField datengetrieben

**Files:** Modify `src/components/HeroField.astro`

- [ ] Frontmatter: `import snapshot from '@/data/climate/global-temp-anomalies.json'; import { seriesToRidges } from '@/lib/climate'; const ridges = seriesToRidges(snapshot as any)`.
- [ ] Template: `<script type="application/json" data-ridges set:html={JSON.stringify(ridges.map(r=>r.heights))}></script>` zusätzlich zum Canvas.
- [ ] Client-Script: `ridges` per `JSON.parse(document.querySelector('[data-ridges]')!.textContent!)`; `ROWS = ridges.length`; generatives `ridge()` ersetzen durch `sampleRidge(ridges[i], x)` (lineare Interpolation über die Monats-heights); Amplitude so, dass die Erwärmungs-Drift sichtbar ist (Hüllkurve neuer Jahre höher). Occlusion/Stroke/Dots/CSS-Farben unverändert lassen. reduced-motion: ein statischer Frame.
- [ ] Verify: `npm run build` grün; Screenshot zeigt die nach oben driftende Ridgeline.

### Task 5: Schlanke Startseite

**Files:** Create `src/components/Home.astro`; Modify `src/pages/index.astro`, `src/pages/en/index.astro`

- [ ] `Home.astro`: Hero-Markup aus `Dashboard.astro` (HeroField + Wordmark + Eyebrow/Role) übernehmen, **ohne** fig.01–05; darunter sichtbare **Quelle/Basisperiode-Caption** (zweisprachig) + schlanker **Lab-Platzhalter** (Überschrift „Lab" + 1 Satz). i18n via `t(locale,...)`.
- [ ] `index.astro` & `en/index.astro`: `Dashboard` → `Home` tauschen.
- [ ] `Dashboard.astro`/`dashboard.ts` bleiben unreferenziert (Cleanup später).
- [ ] Verify: `npm run build` grün; `astro check` grün; Screenshots Desktop+Mobile (de+en).

### Task 6: Abschluss

- [ ] `npm run test` grün, `npm run build` grün.
- [ ] Visuelle Verifikation (Screenshot) der driftenden Klima-Ridgeline + schlanker Startseite.
- [ ] Kurzbericht: was gebaut, Quelle zitiert, was offen (Manifest-Text, Phase 2 Skins).
