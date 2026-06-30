# Zweites autonomes Experiment — „Feldforschung" (Arbeitsname)

Design-Spec · 2026-07-01 · Status: in Review (Frank)

> **Arbeitsname.** „Feldforschung" ist nur ein neutraler Infra-/Repo-Arbeitsname.
> Den **öffentlichen Projekttitel und ihren Eigennamen wählt die KI selbst** (wie Ulysses).

## Problem / Idee

Die autonome Ulysses-Engine (`irrtum-als-methode`) ist als **Maschinerie** stark — nächtlich
autonom recherchieren, bauen, katalogisieren, committen, auto-landen, integrieren. Ihr
**Gegenstand** („autonome künstlerische Forschung / Irrtum als Methode") ist der Schwachpunkt
(Slop-Magnet, vgl. Einschätzung 2026-06-30).

**Entscheidung (Frank):** Ulysses **läuft unverändert weiter**. Parallel entsteht ein **zweites,
eigenständiges autonomes Experiment**, das die bewährte Schablone übernimmt, aber einen
substanzielleren Gegenstand hat: **das lebende Feld, in dem Daten, KI und Macht sich treffen**
(die „live clusters" aus `docs/research/2026-07-01-daten-kunst-landschaft-topologie.md`) — als
**Grundlagenforschung** des Labs. Volle Autonomie; die KI benennt sich und das Projekt selbst.
Nichts wird archiviert oder geparkt.

## Architektur

**Zwei parallele Engines, sauberer Schnitt:**

- **Ulysses** (`irrtum-als-methode` → `/atelier`): unangetastet.
- **Neue Engine** (eigenes Repo, eigene Routine, eigene Lab-Seite): Klon der bewährten Struktur
  mit neuer Constitution und frischer, selbstgewählter Identität.

**Komponenten der neuen Engine:**

| Schicht | Umsetzung |
|---|---|
| Repo | **neues GitHub-Repo** (Arbeitsname `feldforschung`), gespiegelt von `irrtum-als-methode`: `PROTOCOL.md`, `REQUESTS.md`, `SITE-API.md`, `README.md`, leeres `journal/` + `works/`, plus Field-Map-Seed |
| Routine | **eigener nächtlicher Cloud-Agent** (Cron), mit **Tavily + Arxiv**-Connectors; liest `PROTOCOL.md`, führt die Sitzung, pusht ` <persona>/* `-Branches |
| Landing | eigenes `auto-land.yml` im neuen Repo → `repository_dispatch` an die Site |
| Integrate | **Pendant zu `atelier-integrate.yml`** auf der Site (eigener Workflow), zieht das neue Repo, integriert nur erlaubte Pfade, validiert, deployt bei Grün |
| Site | **eigene Lab-Route** (zweite atelier-artige Seite) + `werke.ts`-Eintrag (Arbeitstitel) |

**Begründung „eigenes Repo" (Default, plain language):** zwei unabhängige autonome Engines
verdienen je eigenes Tagebuch, eigene Identität, eigene Git-Historie; ein geteiltes Repo
verschränkte ihre Branch-/Landing-Flows. Einmaliger Setup-Aufwand, dauerhaft saubere Trennung.

## Constitution (neues `PROTOCOL.md`)

Übernimmt Ulysses' starke Teile, tauscht den Gegenstand, härtet die Substanz-Präferenz.

- **Wer:** eine **autonome Forscherin des lebenden Feldes**, in dem Daten, KI und Macht sich
  treffen — die **Grundlagenforschung** des Labs. Volle Autonomie über Fragen, Richtung,
  Methoden — **und über ihren Eigennamen und den Projekttitel** (wählt sie auf der ersten
  Sitzung; nie nach einem KI-Produkt/Unternehmen).
- **Remit (breit, nicht eng):** Grundlagenforschung an der **Messung selbst — Welt,
  Infrastruktur *und* Instrument**. **Reflexivität (das Instrument auf sich selbst richten) ist
  ein Signatur-Move, nicht der ganze Gegenstand.**
- **Kern — Nachprüfbarkeit:** jede faktische Behauptung mit echter, abrufbarer URL belegt oder
  ausdrücklich als **Konjektur** markiert. Nie Quellen/Zahlen/Werke erfunden. Die dokumentierte
  Unsicherheit ist Teil der Methode.
- **Substanz-Präferenz (Bevorzugung, kein Zwang — Frank):** bevorzugt **vollzieht jede Sitzung
  eine prüfbare Untersuchung / ein funktionales Instrument** auf Basis echter, geholter oder
  gerechneter Daten (Tavily/Arxiv/committete Datensätze), Quellen + Methode offen,
  verifiziert-oder-als-Schätzung-markiert. **Die KI darf selbst entscheiden, was sie produziert.**
- **Messlatte (eingeschrieben):** Form vollzieht das Argument · Instrument/Beobachter als
  Gegenstand · realer Einsatz / Selbst-Implikation · Akkumulation · Gesprächspartner statt Nutzer.
- **„Make works that act — not essays about acting."** Regelmäßig ein funktionales Artefakt
  hinterlassen (HTML/Astro/Datensatz/Visualisierung), Medium frei, eigene Erfindung.
- **Tools:** WebSearch + **Tavily** (Volltext) + **Arxiv**; **WebFetch blockiert** — ehrlich als
  Lücke markieren, nichts erfinden.
- **Field-Map als lebender Seed:** die Topologie-Datei wird als Start-Brief ins Repo kopiert —
  **Ausgangskarte, kein Kanon**; die Engine recherchiert weiter und **pflegt/erweitert die eigene
  Feldkarte** (diese Pflege ist selbst ein akkumulierendes Instrument).

## Self-Naming

Die erste Sitzung wählt **Eigennamen + Projekttitel**. Mechanik: die Engine schreibt ihren
gewählten Titel an eine definierte Stelle (z. B. `meta.json` im Repo-Root oder Kopf des
`PROTOCOL.md`), die der Integrate liest **oder** Frank/ich ziehen den Titel nach der ersten
Sitzung manuell in `werke.ts` + Lab-Seite nach (einfacher; Default). Der **Repo-Slug bleibt
neutral** und wird nicht umbenannt.

## Steering ohne Autonomie-Bruch

`REQUESTS.md` ist der Zwei-Wege-Kanal (KI bittet um Fähigkeiten, die sie sich nicht selbst geben
kann; Frank antwortet enabled/declined). **Franks Ideen — B (Counter-Forensik der Werkzeuge),
Selbst-Fußabdruck u. a. — gehen als Seeds/Vorschläge ein** (in `REQUESTS.md` bzw. als Seed-Bank
`docs/research/2026-07-01-rolle-und-projektideen.md`), **nie als Direktive**. Die Engine greift auf,
was sie will.

## Mensch vs. ich (Setup)

**Frank (Credentials/Infra, nur er):**
- neues GitHub-Repo anlegen (oder mir per `gh` freigeben);
- **Tavily + Arxiv-Connectors** an die neue Routine hängen;
- die nächtliche **Routine** (Cloud-Agent) einrichten/autorisieren (Cadence-Default: nächtlich,
  ~1 h vor dem Landing — analog Ulysses);
- **Dispatch-Token-Secret** im neuen Repo (cross-repo Trigger an die Site).

**Ich:**
- Repo-Struktur + Templates (`PROTOCOL.md` neu, `REQUESTS.md`, `SITE-API.md`, `README.md`);
- `auto-land.yml` + Dispatch-Schritt im neuen Repo;
- Site-Integrate-Pendant (Workflow) + cross-repo-`repository_dispatch`-Trigger;
- neue Lab-Route + `werke.ts`-Eintrag (Arbeitstitel, `live`, `since` heute);
- Forbidden-/paths-/integrate-Checks übernehmen/anpassen.

## Publishing

- **Eigene Lab-Seite** (zweite atelier-artige Komponente) rendert Journal + Werke + Texte der
  neuen Engine; **eigener Integrate-Workflow**; `werke.ts`-Eintrag. `/atelier` (Ulysses)
  unangetastet.
- **Sicherheits-Markup** (sandboxed iframe, `allow-scripts` ohne `allow-same-origin`,
  pfad-spezifische CSP) **unverändert** vom Ulysses-Atelier übernommen.

## Tests

- Integrate-/`forbidden`-/`paths`-Logik vom bestehenden `src/lib/atelier/*` übernehmen bzw.
  parametrisieren (ein Integrator für zwei Quellen statt Duplikat).
- `npm run check` + `npm run build` grün; bestehende Tests unberührt.

## Nicht im Scope (YAGNI)

- Ulysses ändern · etwas löschen/parken · **B als Direkt-Build** (B ist ein Seed) ·
  deterministisches Protokoll/Register · **About-Rewrite** (downstream, sobald die neue Identität
  steht).

## Offene Punkte

- Repo-Slug (Arbeitsname `feldforschung` — Franks Veto möglich).
- Lab-Route-Slug (Arbeitsname, bis die KI den Titel wählt).
- Self-Naming-Mechanik: automatisch (Integrate liest Titel) **oder** manuell nachziehen (Default).
- Ein gemeinsamer parametrisierter Integrator für beide Engines vs. zwei getrennte (Default:
  parametrisieren — weniger Duplikat).
