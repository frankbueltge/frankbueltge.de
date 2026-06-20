# 01 — Technische Architektur

> Stand 2026-06-14, verifiziert aus dem Repository. Read-only erhoben.

## 1. Tech-Stack (verifiziert aus `package.json`)

| Schicht | Technologie | Version |
|---|---|---|
| Framework | **Astro** (statisch) | `^5.7.0` |
| Sprache | TypeScript (Config `astro/tsconfigs/strict`) | `^5.7.2` |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` | `^4.0.0` |
| Content | `@astrojs/mdx` | `^4.2.0` |
| Feeds | `@astrojs/rss` | `^4.0.18` |
| Sitemap | `@astrojs/sitemap` | `^3.2.1` |
| Typografie-Plugin | `@tailwindcss/typography` | `^0.5.16` |
| Schriften (self-hosted) | `@fontsource-variable/jetbrains-mono`, `…/space-grotesk` | 5.x |
| Smooth Scroll | `lenis` | `^1.3.23` |
| Orbitalmechanik (Client) | `satellite.js` | `^7.0.1` |
| Tests | `vitest` | `^4.1.8` |
| Skripte | `tsx` | `^4.22.4` |

**Keine** UI-Framework-Laufzeit (kein React/Vue im Produktivbundle); Interaktion läuft
über kleine Astro-Islands mit Vanilla-TS-`<script>`. Das ist konsistent mit dem im
`astro.config.mjs` dokumentierten Prinzip: statisches HTML als Grundlage, „WebGL/JS lebt
in Islands".

## 2. Build- und Dev-Skripte (`package.json`)

```
npm run dev               # astro dev — localhost:4321
npm run build             # astro build → dist/
npm run preview           # lokale Vorschau des Builds
npm run check             # astro check (TypeScript/Astro-Diagnostik)
npm run test              # vitest run
npm run climate:refresh   # tsx scripts/fetch-climate.ts  (GISTEMP-Snapshot)
npm run ueberflug:refresh # tsx scripts/fetch-ueberflug.ts (Bahndaten-Snapshot)
npm run protokoll:dry     # Python-Pipeline lokal, ohne Commit
```

## 3. Internationalisierung

- `astro.config.mjs`: `defaultLocale: 'de'`, `locales: ['de','en']`,
  `routing.prefixDefaultLocale: false` → **DE unter `/`, EN unter `/en`**.
- Übersetzungen für kurze UI-Labels: `src/i18n/ui.ts` (typisiertes Wörterbuch, Funktion `t()`).
- Lange Texte liegen in `src/data/*.ts` (z. B. `about.ts`, `werke.ts`, `projects.ts`, `legal.ts`).
- `Base.astro` erzeugt `canonical` + `hreflang` (`de-DE`, `en`, `x-default → de`) über
  Astros locale-bewusste URL-Helfer.

## 4. Routen / Seitenstruktur (`src/pages/`)

DE-Routen unter `/`, EN-Spiegel unter `/en/` (identische Struktur).

| Route | Datei | Funktion |
|---|---|---|
| `/` | `index.astro` → `Home.astro` | Startseite (Hero, Protokoll-Teaser, Untersuchungen, Beruflich) |
| `/about` | `about/index.astro` | Über-Seite |
| `/contact` | `contact/index.astro` | Kontakt |
| `/work` | `work/index.astro`, `work/[slug].astro` | **Berufsprojekte** (data-snack, datavism) |
| `/lab` | `lab/index.astro`, `lab/[slug].astro` | **Kanonische Sektion**: Untersuchungen + Studien |
| `/werke` | `werke/index.astro` + `werke/{protokoll,halbwertszeit,parallaxe,praemie}.astro` | **Methodenblätter** der Werke |
| `/protokoll` | `protokoll/index.astro`, `[datum].astro`, `archiv.astro`, `feed.xml.ts` | Das Protokoll + Archiv + RSS |
| `/halbwertszeit` | `halbwertszeit/index.astro` | Werk Halbwertszeit |
| `/parallaxe` | `parallaxe/index.astro` | Werk Parallaxe |
| `/praemie` | `praemie/index.astro` | Werk Die Police |
| `/impressum` | `impressum/index.astro` | Recht (Platzhalter) |
| `/datenschutz` | `datenschutz/index.astro` | Recht (Platzhalter) |
| `/404` | `404.astro` | Fehlerseite |

### 4.1 Routing-Auffälligkeit (ZU KLÄREN) — drei Sektions-Begriffe

Es existieren **drei** überlappende Sammelbegriffe für „Arbeiten":

- **`/work`** — Berufsprojekte (data-snack, datavism). Nav-Label DE „Projekte", EN „Work".
- **`/werke`** — per `vercel.json` mit HTTP 301 auf `/lab` umgeleitet …
  - … **aber** nur exakt `/werke` und `/en/werke`. Die Unterseiten `/werke/<id>`
    (Methodenblätter) sind **nicht** umgeleitet und werden aktiv aus `LabIndex.astro`
    verlinkt (`/werke/${werk.id}`).
- **`/lab`** — kanonische Sektion; `index` listet die Untersuchungen **und** die Studien.

Folge: Die Sektion heißt im UI „Lab", die Detail-/Methoden-URLs liegen aber teils unter
`/werke/…`, teils unter `/protokoll`, `/halbwertszeit`, `/parallaxe`, `/praemie`. Außerdem
existieren historisch `/work` (engl. „work") und `/werke` (dt. „Werke") parallel — für
Außenstehende verwechselbar. **Empfehlung später:** URL-Schema vereinheitlichen (siehe 05/10).

## 5. Komponenten (`src/components/`)

| Komponente | Rolle |
|---|---|
| `Home.astro` | Komposition der Startseite |
| `HeroField.astro` | Generatives „Joy-Division"-Ridgeline-Canvas (siehe 5.1) |
| `ProtokollTeaser.astro` | Tagesauszug des Protokolls auf der Startseite |
| `WerkeStrip.astro` | Registerleiste der „Untersuchungen" (verweist ins Lab) |
| `Footer.astro` | Fußzeile (Tagline + Navigation) |
| `TopBar.astro`, `SystemBar.astro` | Kopf-/Statusleiste |
| `SkinSwitcher.astro` | Umschalter des Skin-Systems (**aktuell nicht gemountet**) |
| `pages/AboutPage.astro` u. a. | Seiten-Renderer (About, Contact, Legal, Lab, Work, Werke-Methodenblätter) |
| `pages/Methodenblatt*.astro` | Methodenblätter zu Protokoll, Halbwertszeit, Parallaxe, Prämie |
| `pages/ProtokollDoc.astro` | Darstellung eines Tagesprotokolls |
| `lab/ConversionsChart.astro` | Eingebettetes Demo-Diagramm (Server-side-Tagging-Post) |
| `ueberflug/UeberflugIsland.astro`, `tally-worker.ts` | Client-Insel der Überflug-Studie (SGP4) |

### 5.1 HeroField — Diskrepanz dokumentiert (ZU KLÄREN)

Der aktuelle `HeroField.astro` erzeugt eine Ridgeline aus **Drei-Sinus-Interferenz mit
Gauß-Hüllkurve**. Der Code-Kommentar sagt ausdrücklich: *„rein ästhetisch, keine
Datenbehauptung."* Das ist eine ehrliche Kennzeichnung.

Gleichzeitig existiert eine **Klima-Daten-Infrastruktur** (`scripts/fetch-climate.ts`,
`src/lib/climate.ts` + `climate.test.ts`, `src/data/climate/global-temp-anomalies.json`),
und sowohl `CLAUDE.md` als auch `package.json`/Spec sprechen davon, dass der Hero von
**GISTEMP-Klimadaten** getrieben werde („Climate Ridgeline").

→ **Befund:** Die dokumentierte Absicht (Hero = Klimadaten) und der implementierte Stand
(Hero = generativ-dekorativ) stimmen nicht überein. Vermutlich wurde der Hero zuletzt
„vereinfacht". Die Klima-Pipeline wirkt dadurch **teilweise verwaist**. Kein Fehler im
strengen Sinn (der Code lügt nicht), aber eine offene Inkonsistenz. **ZU KLÄREN:** Soll der
Hero wieder datengetrieben werden, oder die Klima-Infrastruktur entfernt/dokumentiert werden?

## 6. Datenschicht (`src/data/`, `src/content/`, `src/lib/`)

### 6.1 Statische Daten (`src/data/`)
- `about.ts`, `projects.ts`, `werke.ts`, `legal.ts` — redaktionelle Inhalte (TS-Module).
- `climate/global-temp-anomalies.json` — GISTEMP-Snapshot.
- `halbwertszeit/register.json`, `parallaxe/register.json`, `praemie/police.json`,
  `ueberflug/satellites.json` — **von Pipelines committete** Mess-Snapshots.

### 6.2 Content Collections (`src/content.config.ts`)
Zwei typisierte Collections (Zod-Schema):
- **`lab`** — MDX, zweisprachig über Ordnerstruktur `lab/<slug>/<lang>.mdx`.
  Felder: `title, description, date, updated?, tags[], draft, embed?`.
- **`protokoll`** — kanonische Tages-JSONs `protokoll/<jahr>/<datum>.json`.
  Strenges Schema je Eintrag: `top_id, status('ok'|'unavailable'|'implausible'),
  unit, cadence, source{name,url,license}, value, as_of, comparison, label, record, note`.

### 6.3 Logik & Tests (`src/lib/`)
- `protokoll/` — `types.ts`, `data.ts`, `agenda.ts` (Tagesordnung), `render.ts`
  (deterministische Prosa) + `render.test.ts` (**amtliche Register-Strings unter Testschutz**).
- `parallaxe/`, `praemie/`, `halbwertszeit/`, `ueberflug/` — je Typen, Datenzugriff,
  Renderer/SVG und Tests.
- `climate.ts`, `lab.ts`, `journey.ts`, `site.ts` — Querschnittslogik.
- Frontend-Tests laufen über `vitest` (`src/**/*.test.ts`).

## 7. Daten-Pipelines (`pipelines/protokoll/`, Python 3.12)

Eigenständiges Python-Paket. **„Git ist das Archiv":** Pipelines holen externe Daten,
berechnen Snapshots und committen versionierte JSONs per **GitHub-API** ins Repo
(Autorin *„Protokollführung"*, `protokoll@frankbueltge.de`) → löst Pages-Rebuild aus.
Kein Laufzeit-Lesen aus Cloud-Diensten in der Website.

| Pipeline | Quellen (Auswahl) | Ausgabe |
|---|---|---|
| **Protokoll** | 12 TOPs: NOAA CO₂/SST, NSIDC Meereis, NASA FIRMS, USGS, UN WPP, UNHCR, FAO, EZB €STR, EIA Brent, GDELT (BigQuery), Wikimedia Pageviews | `src/content/protokoll/<jahr>/<datum>.json` |
| **Halbwertszeit** | Wikidata-Ereignisregister + Wikipedia-Pageviews (18 Sprachen) | `src/data/halbwertszeit/register.json` |
| **Parallaxe** | Wikipedia (umstrittene/Territorial-Themen) + **Vertex Gemini** `gemini-2.5-flash-lite` (Extraktion, temp 0, publizierter Prompt) | `src/data/parallaxe/register.json` |
| **Prämie** | BLS PPI (Versicherung, via FRED), NOAA NCEI Billion-Dollar-Disasters, FEMA NFIP | `src/data/praemie/police.json` |
| **Überflug** | CelesTrak (OMM/JSON) + GCAT (CC-BY) — **kein** Python; GitHub-Action | `src/data/ueberflug/satellites.json` |

**LLM-Einsatz:** ausschließlich in Parallaxe, nur als **Extraktionswerkzeug** mit
veröffentlichtem Prompt; die Werk-Prosa selbst ist überall deterministisch (kein LLM).

**Disziplin (aus Specs/Code verifiziert):** Fehlerisolation (ein Adapter-Ausfall →
`status:"unavailable"`, Pipeline läuft weiter); Plausibilitäts-/Stale-Guards (NaN/Inf →
nie still); Secret-Redaktion in Fehlermeldungen; **kein Backfill**; degenerierte Läufe
(z. B. alle Quellen leer) brechen ab und behalten den Vortagsstand.

## 8. CI / CD und geplante Läufe

- **`.github/workflows/ci.yml`** — bei `push` auf `main` und bei PRs:
  - Job *pipeline*: `pip install -e ".[dev,bq]"` + `pytest -q`.
  - Job *site*: `npm ci` → `npm run test` → `npm run check` → `npm run build`.
- **`.github/workflows/ueberflug-refresh.yml`** — täglich `0 5 * * *` (UTC): Bahndaten
  neu holen, testen, bauen, bei Änderung als „Protokollführung" committen + pushen.
- **Protokoll/Halbwertszeit/Parallaxe/Prämie** — **GCP Cloud Run Jobs** + Cloud Scheduler
  (Protokoll ~03:30 UTC), Secrets im Secret Manager. Runbook: `pipelines/protokoll/README.md`.

→ Es gibt damit **zwei** committende Akteure: Cloud Run (vier Pipelines) und GitHub Action
(Überflug). Beide committen unter „Protokollführung".

## 9. Deployment & Hosting

- **`vercel.json`**: `framework: astro`, `buildCommand: npm run build`, `outputDirectory: dist`,
  zwei 301-Redirects (`/werke→/lab`, `/en/werke→/en/lab`).
- **`.vercelignore`**: schließt `pipelines`, `docs`, `.claude`, `.github` vom Upload aus —
  es wird **nur die statische Astro-Site** deployt.
- Hosting statisch; Rebuild-Trigger ist der nächtliche Commit.
- ANMERKUNG: `CLAUDE.md` nennt an einer Stelle „Cloudflare Pages" als Rebuild-Ziel, der
  reale Stand ist **Vercel**. Geringe Doku-Inkonsistenz (siehe 05).

## 10. SEO / Metadaten (aus `Base.astro` + `ui.ts`)

- Pro Seite `<title>` + `<meta description>`; OpenGraph + `twitter:card summary_large_image`.
- `canonical`, `hreflang` (de-DE/en/x-default), RSS-`alternate` auf das Protokoll-Feed.
- **JSON-LD**: `Person` + `WebSite`.
  - `Person.jobTitle` = `SITE.role` → aktuell „Data Engineering & Artistic Research" (gut).
  - `Person.disambiguatingDescription` + `knowsAbout` = **noch reine Engineering-Begriffe**
    (BigQuery, dbt, Tag Management …), **kein** Artistic-Research-Vokabular. → siehe 03/05.
- `sitemap()` + `public/robots.txt` vorhanden.

## 11. Analytics / Tracking

- **Keines.** `legal.ts` (Datenschutz): „setzt keine Tracking-Cookies und nutzt kein
  Analyse-Tracking." Schriften self-hosted, keine Drittanbieter-Requests. Für eine
  datenkritische Praxis ist das ein **konsistenter, glaubwürdiger** Zustand.

## 12. Accessibility- / Performance-Muster (beobachtet)

- Skip-Link („Zum Inhalt springen"), `aria-hidden` für dekorative Canvas/Vignette.
- `prefers-reduced-motion` respektiert: HeroField rendert statischen Frame, Lenis
  Smooth-Scroll wird deaktiviert, Skin-Auto-Zyklus (falls aktiv) pausiert.
- Canvas pausiert off-screen (IntersectionObserver), DPR auf 2 begrenzt, 30-fps-Drossel.
- Self-hosted variable Fonts → kein externer Request, geringe Layout-Shift-Gefahr.
- Statisches HTML + Islands → günstige Core Web Vitals zu erwarten.
- **Nicht geprüft** in diesem Audit: Kontrastwerte des Mono-Skins, Tastaturpfade der
  Überflug-Insel, reale Lighthouse-Werte. → ZU KLÄREN bei Veröffentlichungsreife.

## 13. Skin-System (Status)

- Entworfen als „Shapeshifting Skin System" (Bauhaus · Tron · Brutalismus · Terminal),
  Spec unter `docs/superpowers/specs/2026-06-10-shapeshifting-skin-system-design.md`.
- **Aktueller Stand:** `Base.astro` setzt `data-skin="mono"` fix; der Zyklus ist
  „stillgelegt". `SkinSwitcher.astro` + Skins bleiben im Repo (Reaktivierung möglich).
- Im Repo-Root liegen Verifikations-Screenshots (`step6-skin-*.png`) — Artefakte, kein
  Produktivinhalt; per `.gitignore` ausgeschlossen.

## 14. Archivierte Vorversion

`_archive-next/` enthält die **frühere Next.js-Version** der Site (gitignored, lokal für
Content-Portierung). `design_handoff_homepage/` enthält HTML/CSS-Prototypen eines
früheren Dashboard-Homepage-Entwurfs. Beide sind **nicht** Teil des Deployments. Inhalt
und alte Positionierung sind in `02` und `03` zusammengefasst.
