# Ehrliche Umrahmung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** Das Framing von frankbueltge.de von „artistic research / Werke / Akte der Gegenwart / Messinstrument" auf „Data & AI Engineer, öffentliches Experimentierfeld, praxisbasierter Weg zu künstlerischer Forschung" umstellen. Wortlaut: `docs/superpowers/specs/2026-06-20-ehrliche-umrahmung-design.md`.

**Architecture:** Reine Text-/String-Änderungen, bilingual de/en. Kein Code-/Daten-/Pipeline-Eingriff. Verifikation: `npm run check` (0 Fehler), `npm run test` (Register-Tests bleiben grün → Schutz-Strings unberührt), grep auf Abwesenheit alter / Anwesenheit neuer Begriffe, Sicht-Check auf :4322.

## Global Constraints

- **Bilingual:** jede DE-Änderung hat ihr EN-Pendant.
- **Schutz:** Protokoll-Register-Test-Strings (`src/lib/protokoll/render.ts` + `render.test.ts`, „Beschluss: vertagt" etc.) NICHT anfassen (Spec §6). `npm run test` muss grün bleiben.
- **Nicht-Ziel:** keine Funktions-, Daten-, Chart-Änderung; keine gelöschten Experimente.
- **Begriffsregel:** Werk/Werke/Werkgruppe/Untersuchung → Experiment(e); „Die Akte der Gegenwart" → entfällt; „Messinstrument"/„amtliches Register" → entfällt; „artistic research/künstlerische Forschung" nur noch als Weg/Aspiration, nie als Behauptung des Ankommens. „Methodenblatt" bleibt.

---

### Task 1: Identität, Hero & Meta (`ui.ts`, `Base.astro`)

**Files:** Modify `src/i18n/ui.ts`, `src/layouts/Base.astro`

- [ ] **ui.ts DE:**
  - `meta.home.title`: → `'Frank Bültge — Data & AI Engineer'`
  - `meta.home.desc`: → `'Frank Bültge — Data & AI Engineer. Ein öffentliches Experimentierfeld mit Daten und Code: Versuche und erste Annäherungen, praxisbasiert, auf dem Weg zu einer künstlerischen Forschung.'`
  - `hero.roleLead`: → `'Data & AI Engineer'`
  - `hero.roleRest`: → `' — ich baue Dateninfrastruktur und experimentiere hier öffentlich mit Daten und Code.'`
- [ ] **ui.ts EN:**
  - `meta.home.title`: → `'Frank Bültge — Data & AI Engineer'`
  - `meta.home.desc`: → `'Frank Bültge — Data & AI Engineer. A public field for experiments with data and code: attempts and first approaches, practice-based, on the way toward artistic research.'`
  - `hero.roleLead`: → `'Data & AI Engineer'`
  - `hero.roleRest`: → `' — I build data infrastructure and experiment here in the open with data and code.'`
- [ ] **Base.astro JSON-LD** (Zeilen ~35–37):
  - DE description → `'Data & AI Engineer. Ein öffentliches Experimentierfeld mit Daten und Code — Versuche und erste Annäherungen, praxisbasiert, auf dem Weg zu einer künstlerischen Forschung. Macher von data-snack.com und datavism.org.'`
  - EN description → `'Data & AI Engineer. A public field for experiments with data and code — attempts and first approaches, practice-based, on the way toward artistic research. Creator of data-snack.com and datavism.org.'`
  - `knowsAbout`: `['Artistic Research', 'Data Art', …]` → `['Data Engineering', 'AI Engineering', 'Data Infrastructure', 'Data Visualization', 'BigQuery', 'dbt']`
- [ ] **Verify:** `npm run check` → 0 Fehler. `curl -s :4322 | grep -o 'Data & AI Engineer'` und `:4322/en` vorhanden; `grep -ri 'Artistic Research\|Akte der Gegenwart' src/i18n/ui.ts src/layouts/Base.astro` → leer.
- [ ] **Commit:** `framing: Identität/Hero/Meta — Data & AI Engineer, Experimentierfeld`

---

### Task 2: Experiment-Titel & Untertitel (`ui.ts`, `werke.ts`, `Home.astro`)

**Files:** Modify `src/i18n/ui.ts`, `src/data/werke.ts`, `src/components/Home.astro`

- [ ] **ui.ts Untertitel (DE/EN):**
  - `hw.sub` DE → `'Wie schnell die Aufmerksamkeit für Katastrophen abklingt.'` · EN → `'How fast attention to disasters fades.'`
  - `px.sub` DE → `'Wie sich Wikipedia-Sprachversionen über umstrittene Themen unterscheiden.'` · EN → `'How Wikipedia language editions differ on contested topics.'`
  - `px2.sub` DE → `'Klimakosten, aus Marktdaten als „Prämie" gerechnet.'` · EN → `'Climate cost, computed from market data as a „premium".'`
- [ ] **werke.ts** — je Eintrag `subtitle` (de/en) auf Spec §3.3 setzen; in `description` und Kommentaren „Untersuchung/Werk/Akte der Gegenwart" → „Experiment"; den `protokoll`-Subtitle DE→`'Tägliche Kennzahlen aus zwölf offenen Quellen'` / EN→`'Daily figures from twelve open sources'`. Die `id`/`title`-Handles bleiben.
- [ ] **Home.astro** Kommentare: „Die Akte zuerst" / „Untersuchungen — Die Akte der Gegenwart" → „Experimente".
- [ ] **Verify:** `npm run check` → 0; `grep -rn 'Sitzung der Welt\|Apokalypse kostet\|Zerfall der Anteilnahme\|jede Sprache verschweigt' src/` → leer.
- [ ] **Commit:** `framing: nüchterne Untertitel der Experimente`

---

### Task 3: About (`about.ts`)

**Files:** Modify `src/data/about.ts`

- [ ] **DE + EN** vollständig auf Spec §3.2 setzen: `metaTitle`/`metaDesc`, `lede`, Abschnitte „Worum es geht", „Hintergrund", „Beruf als Fundament" (unverändert), neuer Abschnitt „Wo das eigentliche Arbeiten passiert" (Demarkation, Projekte), „Haltung". Kernzusatz: „praxisbasierter Weg hin zu einer künstlerischen Forschung … ein Weg, kein Ankommen."
- [ ] **Verify:** `npm run check` → 0; `curl -s :4322/about` (bzw. `/ueber-mich`) zeigt „Experimentierfeld" + „praxisbasiert"; `grep -n 'künstlerisch-forschende Praxis\|Akte der Gegenwart' src/data/about.ts` → leer.
- [ ] **Commit:** `framing: About — Experimentierfeld, praxisbasierter Weg zur KF`

---

### Task 4: Lab-/Werke-Rahmung & Demarkation (`LabIndex`, `WerkeStrip`, `werke/index`, `ui.ts`)

**Files:** Modify `src/components/pages/LabIndex.astro`, `src/components/WerkeStrip.astro`, `src/pages/werke/index.astro` (+ `src/pages/en/werke/index.astro`), `src/i18n/ui.ts`

- [ ] **LabIndex** Rahmungs-Text → DE „Erste Experimente mit Daten und Code. Offen, unfertig, im Werden." / EN „First experiments with data and code. Open, unfinished, in the making."; Kommentar „Akte der Gegenwart" → „Experimente".
- [ ] **WerkeStrip** Kommentar „Untersuchungen" → „Experimente".
- [ ] **werke/index** Kommentar „… in Die Akte der Gegenwart im Lab aufgegangen" → „… als Experimente ins Lab verschoben".
- [ ] **ui.ts** `dash.selectedWork` DE „Ausgewählte Arbeiten"→„Ausgewählte Experimente" / EN „Selected work"→„Selected experiments"; `home.toLab` falls „Engineering-Notizen" → „Experimente im Lab" (DE/EN) prüfen/setzen.
- [ ] **Verify:** `npm run check` → 0; `grep -rni 'Akte der Gegenwart' src/` → leer.
- [ ] **Commit:** `framing: Lab als Experimentierfeld, Demarkation`

---

### Task 5: Pathetische Rahmenzeilen der Experiment-Seiten

**Files:** Modify `src/components/pages/HalbwertszeitPage.astro`, `ParallaxePage.astro`, `PraemiePage.astro`, ggf. `ProtokollDoc.astro`/`MethodenblattProtokoll.astro` (NUR Rahmung, NICHT die Register-Prosa)

- [ ] **ParallaxePage** Caption „Punkt = verschwiegen. Was fehlt, ist das Werk." → „Punkt = nicht genannt." (EN entsprechend „Dot = not stated.").
- [ ] **Übrige Seiten:** „Untersuchung/Werk/Messinstrument/Akte" in *Rahmen*-Zeilen → „Experiment"; reine Datenbeschreibungen + Methodenblatt-Fachinhalte bleiben. Halbwertszeit-Headline („Die mittlere Halbwertszeit der Anteilnahme …") bleibt sachlich — nur falls Kunst-Wörter darin, entschärfen.
- [ ] **MethodenblattProtokoll** „mit den BigQuery-Untersuchungen der Reihe" → „mit den BigQuery-Experimenten".
- [ ] **Verify:** `npm run check` → 0; **`npm run test` → 47/50 grün (Register-Strings unberührt)**; `grep -rni 'messinstrument\|amtliches register' src/` → leer.
- [ ] **Commit:** `framing: Experiment-Seiten — pathetische Rahmenzeilen entschärft`

---

### Task 6: Dev-Docs (nicht öffentlich)

**Files:** Modify `CLAUDE.md`, `docs/superpowers/specs/2026-06-20-visualisierungs-standard-design.md`

- [ ] **CLAUDE.md** Kopf: „Werkgruppe ‚Die Akte der Gegenwart' — Datenkunstwerke als Messinstrumente …" → ehrliche Beschreibung (Experimentierfeld, Data & AI Engineer, Weg zur KF). Abschnitt „Werkgruppe — verbindliche Regeln" → „Experimente — Leitlinien"; „Kein LLM-Werktext"/Register-Schutz-Regeln bleiben fachlich erhalten.
- [ ] **Visualisierungs-Standard**: oben einen Status-Hinweis ergänzen — „Herabgestuft: keine ‚Messinstrument'-Rhetorik; gilt als schlichte Leitlinie für ehrliche Charts (belegt, Lücke sichtbar, kein Schmuck)."
- [ ] **Verify:** `npm run check` → 0 (Docs ändern nichts am Build).
- [ ] **Commit:** `docs: CLAUDE.md + Visualisierungs-Standard auf ehrliche Umrahmung nachgezogen`

---

## Self-Review
- **Spec-Abdeckung:** §3.1 → T1; §3.3 → T2; §3.2 → T3; §3.4 → T4; §4 Begriffe → über alle Tasks; §5 Reihenfolge = Task-Ordnung; §6 Nicht-Ziele → Global Constraints (Register-Schutz, `npm run test`).
- **Platzhalter:** Wortlaut steht in Spec §3; Tasks verweisen exakt darauf.
- **Schutz:** Register-Test-Strings explizit ausgenommen, `npm run test` als Gate in T5.
