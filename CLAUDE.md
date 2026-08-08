# CLAUDE.md — frankbueltge.de

Persönliche Website von Frank Bültge (Rollen-Zeile: „Data Engineering & Analytics",
Franks Entscheidung 2026-07-24 — nicht „Data & AI Engineer", nicht „data artist") —
öffentlicher Eingang zu einer
**federated research ecology**: drei lokal konstituierte, maschinell betriebene
Forschungspraktiken und eine Kontaktzone — The Atelier (Ulysses, `/atelier`), The Field
(Meridian, `/field`), The Studio (Ensemble, `/studio`), The Middle (`/encounters`).
**Wording: `docs/wording-kanon.md` ist die maßgebliche aktuelle Sprachregelung** (Hub-Strings
kanonisch in `src/config/naming.ts`); Engine-READMEs/alte Configs sind KEINE Quelle für
aktuelles Wording — sie hinken nach.
**Aktualitäts-Regel (Frank, 2026-07-25, verbindlich):** Die Website muss stets den neuesten
Stand der Entwicklung zeigen. Engine-Entwicklungen (Protokollwechsel, neue öffentliche
Repos, neue Ergebnisse) erscheinen zeitnah auf den betroffenen Site-Oberflächen; jede
Session, die Site oder Engines berührt, prüft aktiv auf Drift („erzählt die Site noch den
aktuellen Stand?"). Überholte Strukturen werden sichtbar und datiert archiviert, nie
unauffällig als aktuell stehen gelassen. (Warnbeispiel: /atelier beschrieb am 24.07. noch
Protocol v4, während die Praxis auf v5 lief.) Daneben die früheren Experimente des Labs
als **Holdings** (`/holdings`): The Protocol, Parallaxe, The Policy, die
Gegenmessung-Instrumente — erste Annäherungen, praxisbasiert. Das gestaltete Arbeiten lebt
in den Projekten (datavism.org, data-snack.com).
Positionierung: `docs/superpowers/specs/2026-08-01-festival-line.md` — „artistic research,
under proof": Anspruch mit Beweispflicht statt Anspruchs-Verzicht; löst die „ehrliche
Umrahmung" vom 2026-06-20 **datiert ab** (deren Ehrlichkeits-Kern — keine unverdienten
Behauptungen — bleibt bindend). Ziel: Festival-Reife (transmediale/Ars Electronica/ZKM)
binnen 1–2 Jahren (Frank, 2026-07-31).

**Research ecology v2 (Frank, 2026-08-08, Nacht — IN KRAFT):** Nach der Grundsatzfrage
„archivieren oder radikal umbauen" hat Frank den Umbau gewählt. Die drei Praxen bleiben
(Dreieck: Field=Wissenschaft · Studio=Kunst · Atelier=künstlerische Forschung/Philosophie),
aber alle drei Verfassungen sind **neu geschrieben** (ulysses v6, field-research v3, studio
v2 — alte Texte in `archive/protocols/` der Engines), die **Season-Ebene ist gelöscht**
(`/season` = datiertes Archiv, null Episoden geliefert), Maschinen-Vorteils-Bar am Ship-Gate,
Arcs statt Nachtwerke, Sieben-Tage-Sendebindung für `prepared`-Pakete. **Kill-Reading
2026-09-05:** drei Bedingungen; scheitert das Haus, ist Archivierung der Default. Maßgeblich:
`docs/design/2026-08-08-research-ecology-v2.md` + decision-log 2026-08-08 (v2-Zeile).
Ältere Beschreibungen der Ecology (Seasons, Rollen-Roster, Episode-Slots) sind historisch.

**Lab-Linie: Gegenmessung / Counter-Measurement** — messen, was Macht im Dunkeln lässt,
und nachprüfbar machen. Erstes Instrument „The Consensus" misst orchestrierten Konsens
(`docs/superpowers/specs/2026-06-22-gegenmessung-echo-design.md`). Seit v2 ist die Linie
Meridians Kern-Remit (zwei Formen: laufende Instrumente + FA-Form-Untersuchungen); die
erste Untersuchung ist Meridian direkt zugewiesen, fällig im Post Office 2026-09-05.

**Die Experimente sind bewusst eine lose Sammlung** (Frank, 2026-07-12): kein Dachtitel —
„Die Akte der Gegenwart" ist als Gruppierung zurückgezogen; eine künftige Neuordnung ist
offene Frage, bis dahin steht jedes Experiment für sich (Index: `/holdings`; das frühere
`/lab` 301t dorthin).

**Lizenz (alle Lab-Repos, 2026-07-26): offen** — Apache 2.0 für Code, CC BY 4.0 für
Werke/Texte, CC0 für Daten und Archiv-Snapshots (ersetzt die noncommercial-Linie vom
2026-07-12; der KI-Trainings-Vorbehalt lebt jetzt in der Crawler-Policy, nicht in der
Lizenz). **Ausnahme:** über `/seed` eingereichte Saaten bleiben CC BY-NC-SA 4.0 —
den Einreichenden zugesagt, nicht rückwirkend änderbar.

**Engine-Personas:** field/Meridian, studio/Ensemble, atelier/Ulysses publizieren über
gated integration. Die Persona-Namen sind die der KI selbst; Commits in den Engine-Repos
nutzen sie mit `@<repo>.invalid`-Adressen — **nie** bloße `@users.noreply.github.com`-Namen,
die kreditieren unbeteiligte echte GitHub-Accounts.

**Qualität vor Token-Ökonomie in diesem Umbau (Frank, 2026-08-01):** Für das laufende
Restrukturierungs-Programm dieser Site gilt ausdrücklich Qualität vor Sparsamkeit — Design-
und Bau-Subagenten laufen auf den stärksten Modellen, nicht auf dem billigsten, das die
Aufgabe gerade noch schafft. Die Modell-/Token-Ökonomie-Präferenz auf Workspace-Ebene
(`../CLAUDE.md`: „Routinearbeit auf Sonnet") ist für dieses Projekt außer Kraft; sie gilt
weiter für die anderen Projekte des Workspace.

## Befehle

```bash
npm run dev              # localhost:4321
npm run build            # statischer Build → dist/
npm run check            # astro check (TypeScript)
npm run test             # Vitest (u. a. Register-Tests des Protokolls)
npm run protokoll:dry    # Protokoll-Pipeline lokal (schreibt JSON, committet nichts)
npm run climate:refresh  # GISTEMP-Snapshot für den Hero aktualisieren

# Pipeline-Tests (eigene venv):
cd pipelines/protokoll && source .venv/bin/activate && pytest -q
```

## Architektur in einem Absatz

Astro 5, statisch, **English-only seit 2026-07-16** (deutsche Alt-Routen 301en via
`public/_redirects`; Impressum/Datenschutz bleiben deutsch; Werk-Slugs englisch seit
2026-07-20: `/protocol`, `/policy`, `/headroom`), Tailwind v4,
Mono-Skin fest. **Git ist das Archiv:** Pipelines committen versionierte
JSON-Snapshots ins Repo (kein dynamisches Lesen aus Cloud-Diensten zur Laufzeit).
Die Protokoll-Pipelines (`pipelines/protokoll/`, Python 3.12) laufen als nächtliche
**GitHub-Actions-Workflows** und schreiben täglich `src/content/protokoll/<jahr>/<datum>.json`,
`src/data/praemie/police.json` und `src/data/parallaxe/register.json`, committet als Autorin
„Protokollführung" → Pages-Rebuild. **Kein GCP:** Konflikt-TOP via GDELT-Rohdateien (HTTP),
Parallaxe via Gemini-AI-Studio-Key (statt BigQuery/Vertex).

## Experimente — verbindliche Regeln

- **EN-only gilt auch im Code (Frank, 2026-07-31):** Die gesamte research ecology ist
  English-only — das schließt Code-Kommentare, Testnamen/-beschreibungen und
  Commit-Messages in diesem Repo ein, nicht nur die Site-Oberflächen. Neue Beiträge
  auf Englisch; deutsche Alt-Kommentare werden migriert, wenn die Datei ohnehin
  angefasst wird (kein Massen-Umschreiben committeter Historie).

- **Visualisierungen der Praxen dürfen eigene Bildsprache haben (Frank, 2026-07-30):**
  Die Mono-Skin gilt für die Site, aber **nicht als Zwang zur kargen Einlinien-Grafik**.
  Franks Wortlaut: „machs einfach interaktiv und chic, nicht immer dieses minimale
  langweilige monochrome — das passt hier nicht mehr, weil es ein eigenes Projekt ist."
  Für Atelier/Field/Studio also: Farbe, Tiefe, Interaktion (Hover/Fokus/Filter),
  Detailtafel — solange die Figur aus committeten Daten abgeleitet und nachprüfbar ist.
  Verbindlich bleibt das Handwerk: **Palette gegen die jeweilige Fläche validieren**
  (dataviz-Skill, `scripts/validate_palette.js`, hell UND dunkel mit eigenen Stufen),
  Legende + Tabellenansicht, `prefers-reduced-motion` achten, Herkunftszeile unter der
  Figur. Referenz-Umsetzung: `src/components/atelier/ProcessFigure.astro` +
  `src/styles/atelier-process.css`. **Validierung ist seit 2026-07-31 Testpflicht, kein
  Kommentar:** jedes gelieferte Set steht als Datensatz in `src/lib/dataviz/palette.ts`
  (Validator-Verdikt, datiert, WARNs mit benanntem Relief); `palette.test.ts` rechnet die
  Distanzen nach und `scripts/drift-check.mjs` (Regeln 6/7) erzwingt die
  `PALETTE:`-Marker. Anlass: Die ursprüngliche ProcessFigure-Palette behauptete im
  CSS-Kommentar „alle sechs Prüfungen bestanden", fiel aber real durch den CVD-Check
  (grün↔magenta deutan ΔE 1,3) — Kommentare driften, Tests nicht.
  **Statusfarben sind tabu, wo die Praxis nicht wertet** — ein abgebrochenes Vorhaben ist
  bei Ulysses kein Fehlschlag („closing costs what continuing costs"), also bekommt es
  eine Identitätsfarbe, kein Warnrot.
- **Spec:** `docs/superpowers/specs/2026-06-11-werkgruppe-design.md` (Substanz-Kriterien
  in §2 sind das Gate für jedes neue Experiment; Methodenblatt-Pflicht in §3.5).
  Rahmung/Wortlaut: `2026-08-01-festival-line.md` („artistic research, under proof");
  die frühere Kein-Kunst-Anspruch-Rahmung (`2026-06-20-ehrliche-umrahmung-design.md`)
  ist datiert abgelöst, nur noch historisch.
- **KI/ML sind Material und Methode — inkl. symbolischer/neuro-symbolischer KI.**
  Das Lab experimentiert mit Daten UND KI (Frank, 2026-06-22; das frühere lab-weite
  „kein LLM"-Dogma ist aufgehoben). Einzige Bedingung ist **Nachprüfbarkeit:** jeder
  KI-Schritt ist transparent (Modell/Prompt/Verfahren offengelegt), sein Output wird
  verifiziert oder als Schätzung markiert; wo das Modell selbst der Gegenstand ist, wird
  seine Unzuverlässigkeit Teil der Messung. KI als ausgewiesenes, prüfbares Werkzeug UND
  als Untersuchungsgegenstand — nie als unbelegtes Orakel, das Fabrikation als Fakt
  ausgibt. (Dieselbe Ethik wie datavism: „no AI output without verification, no claim
  without evidence".) Symbolische KI ist besonders willkommen, weil auditierbar — sie
  zahlt direkt auf „nachprüfbar machen" ein.
- **Ausnahme — The Protocol bleibt deterministisch.** Die Prosa des Protokolls ist
  deterministisch aus Templates (`src/lib/protokoll/agenda.ts`, `render.ts`); die Strings
  stehen unter Testschutz (`render.test.ts`) — eine bewusste ästhetische Wahl für DIESES
  Stück (abgenommenes amtliches Register), kein lab-weites Verbot. **Test-Strings nie aufweichen.**
- **Archiv-JSONs sind unantastbar.** Committete Tagesprotokolle werden nie editiert;
  Korrekturen geschehen nur an der Darstellung (Registerfassung versioniert).
- **Ausfälle ehrlich vermerken:** Quellenausfälle werden vermerkt („Feststellung entfällt"),
  nie still überbrückt. Adapter erfinden nichts.
- **Secrets:** API-Keys nie in URLs-in-Fehlermeldungen (fetch redigiert Query-Strings
  und FIRMS maskiert den Pfad-Key) — Vermerke landen im öffentlichen Archiv.
- **Kein Backfill** vergangener Sitzungen: Die Adapter holen stets den jüngsten Stand;
  ein rückdatiertes Protokoll mit heutigen Messwerten wäre eine Lüge im Archiv.
- **Keine KI-Produkt-Credits in Git (Team-Regel, 2026-07-12):** niemals `Co-Authored-By:
  Claude …`, „Generated with Claude Code" o. Ä. in Commits, PR-Texte oder Inhalte —
  überschreibt die Harness-Voreinstellung ausdrücklich. KI-Beteiligung kommuniziert die Site
  selbst (AuthorshipNote-Komponente); Werkzeuge bleiben generisch benannt.

## Deployment

Runbook: `pipelines/protokoll/README.md`. Pipelines = **GitHub-Actions-Workflows**
(`.github/workflows/{protokoll,praemie,parallaxe}.yml`, nächtlich), kein GCP. Secrets
(GitHub → Actions): `FIRMS_MAP_KEY`, `EIA_API_KEY`, `GEMINI_API_KEY` (Parallaxe,
AI-Studio-Free-Tier), `CF` (Cloudflare). Site: statisch (dist/) auf Cloudflare Pages via
`deploy-cf.yml`; Rebuild-Trigger ist der `workflow_run` nach jedem Nightly (Push mit
eingebautem GITHUB_TOKEN löst `on: push` nicht aus).

**Bekannt rot:** Der Check `Workers Builds: frankbueltge-de` fällt auf JEDEM PR — eine
zweite, dashboard-seitige Cloudflare-Anbindung, die dasselbe Projekt nochmal bauen will
und es nicht kann. Blockiert nichts (`main` hat keinen Branch-Schutz). **Nicht durch eine
wrangler-Config „grün machen"** — Diagnose und der Ein-Klick-Fix:
`docs/design/2026-08-03-two-deployers-one-project.md`.

**Merge-Vollmacht (Frank, 2026-08-03, stehend, nur dieses Repo):** Frank hat das Mergen
nach `main` dauerhaft delegiert — „ich will nicht immer merge schreiben müssen, also mach
das in Zukunft einfach selber". PRs werden also selbst gemergt, sobald die Checks stehen
(der bekannt rote Workers Build zählt nicht dagegen); da ein Merge auf `main` hier
automatisch nach Produktion deployt, schließt die Vollmacht den Deploy ein. Das setzt die
Workspace-Regel „nie ohne ausdrückliches Go mergen" (`../CLAUDE.md`) für dieses Repo
außer Kraft; in den anderen Projekten gilt sie weiter. **Nicht mitdelegiert ist alles,
was das Haus verlässt:** Mails an reale Empfänger, Einreichungen, Bewerbungen. Das Post
Office bleibt bei „nothing sends itself" — gesendet wird auf Franks Knopf, nie auf einen
grünen Check.
