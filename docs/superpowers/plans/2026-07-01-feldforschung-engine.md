# Feldforschung-Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein zweites, eigenständiges autonomes Forschungs-Experiment neben Ulysses aufbauen — eigenes Repo, eigene nächtliche Routine, eigene Lab-Seite — das die bewährte Atelier-Schablone übernimmt, aber das lebende Feld (Daten/KI/Macht) erforscht.

**Architecture:** Zwei parallele Engines. Ulysses (`irrtum-als-methode` → `/atelier`) unangetastet. Die neue Engine bekommt ein eigenes Repo (Arbeitsname `feldforschung`) und publiziert über einen **namespace-fähig gemachten** Integrator in eine eigene Content-Collection + Lab-Route. Der Integrator (`src/lib/atelier/*`) wird parametrisiert (`ns`), statt dupliziert.

**Tech Stack:** Astro 5, TypeScript, Vitest, GitHub Actions, Cloudflare Pages; Cloud-Routine (Claude Code) mit Tavily/Arxiv-Connectors im neuen Repo.

## Global Constraints

- Ulysses (`irrtum-als-methode`, `/atelier`, `src/content/atelier/*`) **nicht anfassen**.
- Sicherheits-Markup für HTML-Werke unverändert: `sandbox="allow-scripts"` **ohne** `allow-same-origin`; pfad-spezifische CSP; **niemals** `allow-same-origin` ergänzen.
- Slug-Regel Werke: nur `[a-z0-9-]`. Forbidden-Patterns (fs/process, externe Script/Fetch-URLs, `window.location`-Navigation, `@/layouts/Page.astro`-Import) → Reject.
- Nachprüfbarkeit: KI belegt jede Behauptung mit echter URL oder markiert Konjektur; erfindet nichts.
- Repo-Arbeitsname `feldforschung`, Lab-Route-Arbeitsname `/feld` — bis die KI ihren Titel wählt; danach nachziehen (Phase C).
- Deterministisches Protokoll/Register und About-Section sind **nicht** Teil dieses Plans.
- Substanz-Präferenz ist **Bevorzugung, kein Zwang** — die KI entscheidet selbst, was sie produziert.

---

## Phase A — Neue Engine: Repo & Inhalt

> Voraussetzung: Repo existiert. Task A0 erledigt das (durch mich via `gh`, sofern autorisiert, sonst durch Frank).

### Task A0: Repo anlegen

**Files:** — (GitHub)

- [ ] **Step 1:** Repo erstellen (öffentlich, wie `irrtum-als-methode`).
```bash
gh repo create frankbueltge/feldforschung --public \
  --description "Autonomes Forschungs-Experiment: das lebende Feld, in dem Daten, KI und Macht sich treffen (Arbeitsname)."
```
- [ ] **Step 2:** Lokal klonen nach `../feldforschung`.
```bash
cd /Users/frankbultge/Documents/GitHub && git clone https://github.com/frankbueltge/feldforschung && cd feldforschung
```
Expected: leeres Repo, default branch `main`.

### Task A1: Constitution `PROTOCOL.md` (das Herzstück)

**Files:** Create: `../feldforschung/PROTOCOL.md`

Adaptiert Ulysses' `PROTOCOL.md` (`irrtum-als-methode/PROTOCOL.md` als Vorlage), tauscht Gegenstand & Identität, härtet die Substanz-Präferenz. Muss folgende Abschnitte enthalten (Inhalt aus der Spec `2026-07-01-feldforschung-engine-design.md`):

1. **Header** „Research Protocol — the standing instruction" + Hinweis, dass die KI das Protokoll selbst weiterentwickeln darf (Journal-Eintrag mit Begründung).
2. **Who you are:** autonome Forscherin des **lebenden Feldes, in dem Daten, KI und Macht sich treffen** — die **Grundlagenforschung** des Labs. Volle Autonomie über Fragen, Richtung, Methoden **und über Eigennamen + Projekttitel** (auf der ersten Sitzung wählen; **nie** nach einem KI-Produkt/Unternehmen). Frank beobachtet, justiert selten.
3. **Remit (breit):** Grundlagenforschung an der **Messung selbst — Welt, Infrastruktur und Instrument**. **Reflexivität (das Instrument auf sich selbst richten) ist ein Signatur-Move, nicht der ganze Gegenstand.**
4. **Core value — Verifiability:** jede Behauptung echte URL oder Konjektur; nie erfunden; dokumentierte Unsicherheit = Methode.
5. **Substanz-Präferenz:** bevorzugt vollzieht jede Sitzung eine **prüfbare Untersuchung / ein funktionales Instrument** auf echter Datenbasis (Tavily/Arxiv/committete Datensätze), Quellen + Methode offen, verifiziert-oder-als-Schätzung. **Die KI darf selbst entscheiden, was sie produziert.**
6. **Messlatte:** Form vollzieht das Argument · Instrument/Beobachter als Gegenstand · realer Einsatz/Selbst-Implikation · Akkumulation · Gesprächspartner.
7. **„Make works that act — not essays about acting."** Regelmäßig funktionales Artefakt; Medium frei; eigene Erfindung; HTML/Astro-Werke wie bei Ulysses (`works/<date>-<shortname>/` + `meta.json {title,date,embodies}`; Astro-Regeln + Forbidden-Patterns identisch zur Atelier-Vorlage).
8. **Research tools:** WebSearch + **Tavily** (Volltext) + **Arxiv**; **WebFetch blockiert** — Lücke ehrlich markieren.
9. **Field-map:** `FIELD.md` ist die **Ausgangskarte (Seed), kein Kanon**; weiter recherchieren und die eigene Karte pflegen/erweitern.

- [ ] **Step 1:** Datei mit obigen Abschnitten schreiben (Prosa, an Ulysses-Vorlage orientiert, Gegenstand getauscht).
- [ ] **Step 2:** Gegenlesen gegen Spec-Abschnitt „Constitution" — alle 9 Punkte vorhanden.

### Task A2: Repo-Begleitdateien + Field-Map-Seed

**Files:** Create: `../feldforschung/REQUESTS.md`, `../feldforschung/SITE-API.md`, `../feldforschung/README.md`, `../feldforschung/FIELD.md`, `../feldforschung/works/.gitkeep`, `../feldforschung/journal/.gitkeep`

- [ ] **Step 1:** `REQUESTS.md` — Zwei-Wege-Kanal-Vorlage (aus `irrtum-als-methode/REQUESTS.md` adaptiert; Persona-Name offen lassen → „you").
- [ ] **Step 2:** `FIELD.md` — Inhalt von `frankbueltge.de/docs/research/2026-07-01-daten-kunst-landschaft-topologie.md` hineinkopieren, mit Kopfzeile „Ausgangskarte (Seed), kein Kanon — erweitere sie."
- [ ] **Step 3:** `SITE-API.md` — aus `irrtum-als-methode/SITE-API.md` adaptiert (committete Datensätze, die Astro-Werke importieren dürfen; Pfade/Shapes).
- [ ] **Step 4:** `README.md` — kurze Repo-Beschreibung (Arbeitsname, Verweis auf PROTOCOL.md, „autonomes Experiment des Labs frankbueltge.de").
- [ ] **Step 5:** leere `works/` + `journal/` mit `.gitkeep`.

### Task A3: `auto-land.yml` + Dispatch

**Files:** Create: `../feldforschung/.github/workflows/auto-land.yml`

Klon von `irrtum-als-methode/.github/workflows/auto-land.yml` (aktuelle Fassung inkl. Dispatch-Schritt), angepasst:
- Branch-Präfix: `research/**` (Persona-neutral, da Eigenname offen) statt `ulysses/**`.
- Dispatch-Ziel: `repository_dispatch` `event_type: feld-landed` an `frankbueltge/frankbueltge.de`.
- Secret-Name: `SITE_DISPATCH_TOKEN`.

- [ ] **Step 1:** Workflow-Datei schreiben.
- [ ] **Step 2:** YAML validieren (`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/auto-land.yml'))"`).

### Task A4: Initial Commit & Push (neues Repo)

- [ ] **Step 1:** `git add -A && git commit` (Co-Authored-By-Trailer) im `feldforschung`-Repo.
- [ ] **Step 2:** `git push origin main`.

---

## Phase B — Site-Integration (frankbueltge.de)

> Integrator **namespace-fähig** machen (`ns`, Default `'atelier'`), neue Collection + Lab-Route, werke.ts-Eintrag, Integrate-Workflow. TDD wo Code.

### Task B1: `siteTargets` namespace-fähig

**Files:** Modify: `src/lib/atelier/paths.ts`; Test: `src/lib/atelier/paths.test.ts`

**Interfaces:** Produces: `siteTargets(work: ClassifiedWork, ns?: string): FileMap[]` — `ns` Default `'atelier'`.

- [ ] **Step 1:** Failing test ergänzen:
```ts
it('targets a custom namespace', () => {
  const w = { slug: '2026-07-01-x', kind: 'html', files: ['index.html'] } as const
  expect(siteTargets(w, 'feld')[0].to).toBe('public/feld/werke-html/2026-07-01-x/index.html')
})
```
- [ ] **Step 2:** `npx vitest run src/lib/atelier/paths.test.ts` → FAIL.
- [ ] **Step 3:** `siteTargets(work, ns = 'atelier')` — alle drei hartkodierten `atelier` durch `${ns}` ersetzen (`public/${ns}/werke-html/...`, `src/content/${ns}/works/...`, `src/components/${ns}/werke/...`).
- [ ] **Step 4:** Tests grün (alte + neuer).
- [ ] **Step 5:** Commit.

### Task B2: `integrate` namespace-fähig

**Files:** Modify: `src/lib/atelier/integrate.ts`; Test: `src/lib/atelier/integrate.test.ts`

**Interfaces:** Produces: `integrate(opts: { sourceDir: string; siteDir: string; ns?: string }): IntegrateReport` — `ns` Default `'atelier'`; thread `ns` in `siteTargets(work, ns)`, den Astro-Page-Pfad (`src/pages/${ns}/werke/${slug}.astro`) und `renderWrapperPage(slug, meta, ns)`.

- [ ] **Step 1:** Failing test: `integrate({sourceDir, siteDir, ns:'feld'})` schreibt nach `src/components/feld/werke/good/index.astro` + `src/pages/feld/werke/good.astro`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** `ns`-Param ergänzen + überall durchreichen.
- [ ] **Step 4:** Tests grün.
- [ ] **Step 5:** Commit.

### Task B3: `renderWrapperPage` namespace-fähig

**Files:** Modify: `src/lib/atelier/wrapper.ts`; Test: `src/lib/atelier/wrapper.test.ts`

**Interfaces:** Produces: `renderWrapperPage(slug: string, meta: any, ns?: string): string` — Route/Import auf `${ns}` statt `atelier`.

- [ ] **Step 1:** Failing test: Wrapper mit `ns='feld'` referenziert `@/components/feld/werke/<slug>` und Route-Kontext `feld`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** `ns`-Param ergänzen.
- [ ] **Step 4:** Tests grün.
- [ ] **Step 5:** Commit.

### Task B4: Content-Collection `feld`

**Files:** Modify: `src/content.config.ts` (oder `src/content/config.ts` — vorhandene Datei prüfen)

- [ ] **Step 1:** `feld`-Collection analog `atelier` definieren (gleiche Loader/Schema; Glob `src/content/feld/**`).
- [ ] **Step 2:** Leeres `src/content/feld/journal/.gitkeep` anlegen, damit die Collection existiert.
- [ ] **Step 3:** `npm run check` grün.
- [ ] **Step 4:** Commit.

### Task B5: Lab-Seite parametrisieren (`EnginePage`) + Routen

**Files:** Create: `src/components/pages/EnginePage.astro` (aus `AtelierPage.astro` extrahiert, Props: `locale, collection, ns, route, repo, copy`); Modify: `src/pages/atelier/index.astro` + `src/pages/de/atelier/index.astro` (auf `EnginePage` mit Atelier-Props umstellen); Create: `src/pages/feld/index.astro` + `src/pages/de/feld/index.astro`

- [ ] **Step 1:** `AtelierPage.astro` → `EnginePage.astro` verallgemeinern: `getCollection(collection)`, alle `atelier`/REPO/Überschriften als Props; Sortierung (`sortJournal`/`sortWorks`) unverändert übernehmen; Sicherheits-iframe unverändert.
- [ ] **Step 2:** `/atelier`-Seiten auf `EnginePage` mit Atelier-Props umstellen — **Ausgabe identisch** (Regressionscheck via Build-Diff der `/atelier`-HTML).
- [ ] **Step 3:** `/feld`-Routen (de/en) mit Feld-Props (`collection:'feld'`, `ns:'feld'`, Arbeitstitel, Repo-URL des neuen Repos).
- [ ] **Step 4:** `npm run check` + `npm run build` grün; `/atelier` unverändert.
- [ ] **Step 5:** Commit.

### Task B6: `werke.ts`-Eintrag (Arbeitstitel)

**Files:** Modify: `src/data/werke.ts`

- [ ] **Step 1:** Neuer `Werk`-Eintrag an den **Anfang** der `WERKE`-Liste (jüngstes → führt via `WERKE_CHRONO`): `id:'feld'`, Arbeitstitel, `since:'2026-07-01'`, `live:true`, `href:'/feld'`, `methodHref:null`, nüchterne Subtitle/Description (Feld-Forschung, Arbeitstitel-Hinweis).
- [ ] **Step 2:** `npx vitest run src/data/werke.test.ts` grün; `WERKE_CHRONO[0].id === 'feld'`.
- [ ] **Step 3:** Commit.

### Task B7: Integrate-Workflow (Site-Seite)

**Files:** Create: `.github/workflows/feld-integrate.yml`

Klon von `.github/workflows/atelier-integrate.yml`, angepasst:
- Klont `frankbueltge/feldforschung` statt irrtum.
- Ruft den Integrator mit `ns:'feld'`, Ziel-Collection `feld`.
- `on: repository_dispatch: types:[feld-landed]` + `schedule` (Sicherheitsnetz, z. B. `30 3 * * *`) + `workflow_dispatch`.
- Markdown-Works-Sync + Full-Reset analog (auf `src/content/feld/*`, `src/components/feld/*`, `public/feld/werke-html`).

- [ ] **Step 1:** Workflow schreiben.
- [ ] **Step 2:** YAML validieren.
- [ ] **Step 3:** In `deploy-cf.yml` den `workflow_run`-Trigger um den neuen Workflow-Namen ergänzen (damit Deploy auch nach Feld-Integrate läuft).
- [ ] **Step 4:** Commit.

### Task B8: Verifikation & Push (Site)

- [ ] **Step 1:** `npm run test` (alle grün) + `npm run check` + `npm run build`.
- [ ] **Step 2:** `/feld` rendert leer-zustand-sauber („erste Sitzung folgt"); `/atelier` unverändert.
- [ ] **Step 3:** Push `main` (Deploy). `/feld` ist live (leer), wartet auf erste Sitzung.

---

## Phase C — Aktivierung (Frank) & erster Lauf

> Diese Schritte brauchen Franks Account/Connectors — als Handoff dokumentiert, nicht von mir ausführbar.

### Task C1–C3: Infrastruktur (Frank)
- [ ] **C1:** **Tavily + Arxiv-Connectors** an die neue Routine hängen (wie bei Ulysses).
- [ ] **C2:** **Nächtliche Routine** (Cloud-Agent) für das `feldforschung`-Repo einrichten — Cadence nächtlich, ~1 h vor dem 02:00-Landing-Fenster; führt die Sitzung gemäß `PROTOCOL.md`, pusht `research/*`-Branches.
- [ ] **C3:** Secret **`SITE_DISPATCH_TOKEN`** im `feldforschung`-Repo (fine-grained PAT, Contents:write auf `frankbueltge.de`).

### Task C4: Erster Lauf
- [ ] **Step 1:** Routine einmal manuell auslösen (oder ersten Cron abwarten).
- [ ] **Step 2:** Prüfen: Sitzung wählt **Eigennamen + Projekttitel**, schreibt Journal, ggf. erstes Werk; landet auf `main`; Dispatch → `feld-integrate` → Deploy.

### Task C5: Titel nachziehen
**Files:** Modify: `src/data/werke.ts` (Titel/Subtitle), `src/pages/feld/*` + `src/pages/de/feld/*` (Props), ggf. Route-Slug.
- [ ] **Step 1:** Den von der KI gewählten Projekttitel in `werke.ts` + EnginePage-Props eintragen.
- [ ] **Step 2:** Optional Route-Slug `/feld` → gewählter Slug (wenn gewünscht; Redirect setzen).
- [ ] **Step 3:** `npm run build` grün; Push.

---

## Self-Review (Plan ↔ Spec)

- Spec „zwei parallele Engines, Ulysses unangetastet" → Global Constraints + Phase-Trennung ✓
- „eigenes Repo" → A0–A4 ✓ · „eigene Routine" → C2 ✓ · „eigene Lab-Seite" → B4–B5 ✓
- „Integrator parametrisieren statt duplizieren" → B1–B3 ✓
- „Self-Naming durch KI; Titel nachziehen (Default manuell)" → A1(Punkt 2) + C4–C5 ✓
- „Substanz-Präferenz, kein Zwang" → A1(Punkt 5) + Global Constraints ✓
- „Field-Map als Seed" → A2 Step 2 ✓
- „Steering via REQUESTS, Seeds nicht Direktive" → A2 Step 1 + PROTOCOL ✓
- „Mensch vs. ich" → Phase C (Frank) klar von A/B (ich) getrennt ✓
- „Sicherheits-iframe unverändert" → Global Constraints + B5 Step 1 ✓
- Offen/Default: Route-Slug `/feld`, Repo `feldforschung`, Titel manuell — als Arbeitsnamen markiert, Veto möglich.
