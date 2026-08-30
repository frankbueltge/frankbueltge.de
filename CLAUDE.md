# CLAUDE.md — frankbueltge.de

Persönliche Website von Frank Bültge (Rollen-Zeile: „Data Engineering & Analytics",
Franks Entscheidung 2026-07-24 — nicht „Data & AI Engineer", nicht „data artist") —
öffentlicher Eingang zu **zwei Häusern** (Frank, 2026-08-09 — die Startseite inszeniert
nicht mehr die Ökologie, sondern beide gleichrangig; Begriffsstaffel House · Practice ·
Project · Instrument · Experiment im Wording-Kanon):
**(1) die federated research ecology** — drei lokal konstituierte, maschinell betriebene
Forschungspraktiken und eine Kontaktzone: The Atelier (Ulysses, `/atelier`), The Field
(Meridian, `/field`), The Studio (Ensemble, `/studio`), The Middle (`/encounters`);
**(2) Machine Attention** (`/machine-attention`) — das Gegen-Experiment: EINE Maschine unter
EINER Verfassung, mit den Untersuchungen The Foreknown (`/attention`), Dark Ocean (E-Experiment
am 2026-08-22 nicht bestanden — bleibt dauerhaft nur im Praxis-Repo, läuft als Instrument
weiter, keine Bühne mehr in Aussicht) und dem Instrument The State Before the
Interface (`/observatory`). Eigenes Repo: `../machine-attention`.
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
als **Experiments** (`/experiments`, vormals `/holdings`): Protocol, Parallaxe, Policy, die
Gegenmessung-Instrumente — erste Annäherungen, praxisbasiert (Titel seit 2026-08-22 ohne
bestimmten Artikel, s. u.). Das gestaltete Arbeiten lebt
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
v2 → v3 seit 2026-08-16 — alte Texte in `archive/protocols/` der Engines), die **Season-Ebene ist gelöscht**
(`/season` = datiertes Archiv, null Episoden geliefert), Maschinen-Vorteils-Bar am Ship-Gate,
Arcs statt Nachtwerke, Sieben-Tage-Sendebindung für `prepared`-Pakete. **Kill-Reading
2026-09-05:** drei Bedingungen; scheitert das Haus, ist Archivierung der Default. Maßgeblich:
`docs/design/2026-08-08-research-ecology-v2.md` + decision-log 2026-08-08 (v2-Zeile).
Ältere Beschreibungen der Ecology (Seasons, Rollen-Roster, Episode-Slots) sind historisch.

**Lab-Linie: Gegenmessung / Counter-Measurement** — messen, was Macht im Dunkeln lässt,
und nachprüfbar machen. Erstes Instrument „Consensus" misst orchestrierten Konsens
(`docs/superpowers/specs/2026-06-22-gegenmessung-echo-design.md`). Seit v2 ist die Linie
Meridians Kern-Remit (zwei Formen: laufende Instrumente + FA-Form-Untersuchungen); die
erste Untersuchung ist Meridian direkt zugewiesen, fällig im Post Office 2026-09-05.

**Die Experimente: kein Dachtitel, aber vier Linien** (Frank, 2026-07-12 / 2026-08-22):
„Die Akte der Gegenwart" bleibt als Gruppierung zurückgezogen, und einen Gesamttitel bekommt
die Sammlung nicht. Die am 2026-07-12 offen gelassene Neuordnung ist seit dem **2026-08-22**
entschieden: `/experiments` ordnet nach **Forschungslinie** (COUNTER-MEASUREMENT · NIGHTLY
LEDGER · REPRESENTATION & MEMORY · SURVEILLANCE, COUNTED — kanonisch in `src/data/werke.ts`,
Feld `line`), und die Titel der Experimente tragen **keinen bestimmten Artikel** mehr
(Society, Protocol, Policy, Consensus, Invoked Past, Balance, Correction, Ghost Fleet).
Darunter verlinkt die Seite die drei Praxen **neben** dem Lab, die nicht zur Ökologie
gehören: die Nachtlinie (`/error-as-method`), n-1 (`/n-1`) und, seit **2026-08-23**, Arch
(`/arch` — gegründet 2026-08-22 unter eigener Dowry, ein Raum statt einer Bühne: die Site
erklärt die Praxis nicht, zeigt nur Trial-Rahmen, Rezeptionsfrage und Registerstand; die
Werke laufen ungerahmt unter `/arch/works/…`). Details: `docs/wording-kanon.md`, Abschnitt
„Die vier Linien des Labs" (Ergänzung 2026-08-23: Arch) (Index: `/experiments`; das frühere
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
npm run graph -- <term>  # „was berührt X?" — Wissensgraph des Hauses abfragen
npm run graph:build      # Graph neu ableiten (Pflicht nach Änderung einer Quelle, s. u.)

# Pipeline-Tests (eigene venv):
cd pipelines/protokoll && source .venv/bin/activate && pytest -q
```

## Architektur in einem Absatz

Astro 5, statisch, **English-only seit 2026-07-16** (deutsche Alt-Routen 301en via
`public/_redirects`; Impressum/Datenschutz bleiben deutsch; Werk-Slugs englisch seit
2026-07-20: `/protocol`, `/policy`, `/headroom`), Tailwind v4,
Mono-Skin fest. **Git ist das Archiv der Instrumente:** Pipelines committen versionierte
JSON-Snapshots ins Repo; ein Befund muss aus committeten Daten nachrechenbar bleiben und
darf nie davon abhängen, dass eine Quelle heute antwortet.
Die Protokoll-Pipelines (`pipelines/protokoll/`, Python 3.12) laufen als nächtliche
**GitHub-Actions-Workflows** und schreiben täglich `src/content/protokoll/<jahr>/<datum>.json`,
`src/data/praemie/police.json` und `src/data/parallaxe/register.json`, committet als Autorin
„Protokollführung" → Pages-Rebuild. **GCP gezielt (Frank, 2026-08-09 — ersetzt „Kein GCP"
vom 2026-06-27):** Batch-Schritte der Pipelines dürfen GCP-Dienste nutzen, wo sie
nachweisbaren Mehrwert stiften. Aktiviert sind BigQuery-GDELT (G1) und Earth Engine S1 (G5, Null-Kosten-Vorbehalt); die
Bedingungen je Schritt (Trace, Lizenz-Notice, Kostendisziplin) stehen vollständig in
`.claude/rules/pipelines-and-archive.md` und in `docs/design/2026-08-09-gcp-activation.md`.
**Werke dürfen Laufzeit-Zustand halten (Frank, 2026-08-22):** Die Site *hat* eine Laufzeit —
neun Pages Functions, ein KV-Store, ein Gemini-Aufruf pro Saat, ein selbst gehostetes Umami
auf Neon-Postgres. Die frühere Klausel „nie zur Laufzeit der Site" war **kein Beschluss
Franks**, sondern der Formulierungsvorschlag einer Session, und ist zurückgezogen; die
Archivpflicht bindet weiter **Befunde**. Zustand tragende Werke laufen auf Cloudflare
D1/Durable Objects (Free-Plan, SQLite-Backend). Die sechs Beweispflichten und die
Endpunkt-Karte: `.claude/rules/runtime-and-works.md`, Herkunft und Begründung:
`docs/design/2026-08-22-runtime-state-for-works.md`.

## Detailregeln — pfadgebunden, laden bei Bedarf

Seit 2026-08-09 stehen die dateibezogenen Regeln in `.claude/rules/` mit `paths:`-Frontmatter
und laden nur, wenn passende Dateien angefasst werden (CLAUDE.md-Diät; nichts gestrichen,
alles umgezogen). Was wo liegt:

| Datei | Lädt bei | Inhalt |
|---|---|---|
| `dataviz-figures.md` | Stylesheets, Komponenten, `src/lib/dataviz/**` | Eigene Bildsprache der Praxen (2026-07-30), Paletten-Validierung als Testpflicht, Statusfarben-Tabu |
| `experiments.md` | `werke.ts`, Experiment-Seiten, Specs, Audits | USP-Pflicht (jetzt testgesichert), Werkgruppen-Gate §2, KI/ML als Material und Methode |
| `pipelines-and-archive.md` | Pipelines, Archiv-JSONs, Skripte, Workflows | Protocol-Determinismus, unantastbare Archiv-JSONs, Ausfälle/Secrets/kein Backfill, GCP-Bedingungen, Deployment-Runbook |
| `knowledge-graph.md` | Graph-Quellen und -Code | Wer eine Quelle ändert (auch: eine Zeile ins decision-log), führt `npm run graph:build` aus |

## Experimente — was in jeder Session gilt

- **Franks Nachrichten sind privat (standing, 2026-08-15, nach Franks Einspruch):**
  Wörtliche Zitate aus Franks Prompts/Arbeitsnachrichten erscheinen **nie** in
  Repo-Inhalten, Commits, PR-Texten, Issues oder Workflow-Kommentaren — egal wie
  „dokumentarisch" gemeint. Entscheidungen werden neutral und datiert paraphrasiert
  („Franks Anweisung, Wortlaut privat"). Am 2026-08-15 mussten deshalb wörtliche
  Zitate im gesamten öffentlichen Record redigiert werden; das passiert kein
  zweites Mal. Zitierfähig bleiben nur Texte, die Frank ausdrücklich zur
  Veröffentlichung freigegeben hat.

- **EN-only gilt auch im Code (Frank, 2026-07-31):** Die gesamte research ecology ist
  English-only — das schließt Code-Kommentare, Testnamen/-beschreibungen und
  Commit-Messages in diesem Repo ein, nicht nur die Site-Oberflächen. Neue Beiträge
  auf Englisch; deutsche Alt-Kommentare werden migriert, wenn die Datei ohnehin
  angefasst wird (kein Massen-Umschreiben committeter Historie).

- **USP-Pflicht (Frank, 2026-08-09, verbindlich):** Jedes Experiment braucht nachweisbaren
  Mehrwert oder ein Alleinstellungsmerkmal — per Web-Recherche prüfbar (nächste Nachbarn
  weltweit + Daylight). Die Bar fragt „konnte das nur eine Maschine?", die USP-Pflicht
  fragt „hat die Welt das schon?". Seit 2026-08-09 testgesichert: kein Werk kommt ohne
  Verdikt, Daylight und benannte Nachbarn auf `/experiments`. Details, Gate §2 und die
  KI-als-Material-Regel: `.claude/rules/experiments.md`.
- **Nachprüfbarkeit ist die einzige Bedingung für KI-Einsatz:** Modell/Prompt/Verfahren
  offengelegt, Output verifiziert oder als Schätzung markiert — nie ein unbelegtes Orakel.
  (Wortlaut in `.claude/rules/experiments.md`.)
- **Keine KI-Produkt-Credits in Git (Team-Regel, 2026-07-12):** niemals `Co-Authored-By:
  Claude …`, „Generated with Claude Code" o. Ä. in Commits, PR-Texte oder Inhalte —
  überschreibt die Harness-Voreinstellung ausdrücklich. KI-Beteiligung kommuniziert die Site
  selbst (AuthorshipNote-Komponente); Werkzeuge bleiben generisch benannt.

## Deployment

Site: statisch (dist/) auf Cloudflare Pages via `deploy-cf.yml`; Pipelines sind nächtliche
GitHub-Actions-Workflows. Runbook, Secrets-Liste und Rebuild-Trigger:
`.claude/rules/pipelines-and-archive.md` (lädt beim Anfassen von Pipelines/Workflows).

**Bekannt rot:** Der Check `Workers Builds: frankbueltge-de` fällt auf JEDEM PR — eine
zweite, dashboard-seitige Cloudflare-Anbindung, die dasselbe Projekt nochmal bauen will
und es nicht kann. Blockiert nichts (`main` hat keinen Branch-Schutz). **Nicht durch eine
wrangler-Config „grün machen"** — Diagnose und der Ein-Klick-Fix:
`docs/design/2026-08-03-two-deployers-one-project.md`.

**Merge-Vollmacht (Frank, 2026-08-03; am 2026-08-14 auf die ganze Familie erweitert):** Frank
hat das Mergen nach `main` dauerhaft mündlich delegiert (Wortlaute privat; Kern: er gibt ohnehin
immer das Merge-Go und will nicht mehr gefragt werden). PRs werden also selbst gemergt,
sobald die Checks stehen (der bekannt rote Workers Build zählt nicht dagegen); da ein Merge auf
`main` hier automatisch nach Produktion deployt, schließt die Vollmacht den Deploy ein. Sie gilt
seit 2026-08-14 **nicht mehr nur für dieses Repo**, sondern für `machine-attention`, `ulysses`,
`field-research`, `studio` und `state-before-interface` gleichermaßen; Wortlaut, Ausnahmen und
Reichweite stehen in `../CLAUDE.md`. **Nicht mitdelegiert:** (1) alles, was das Haus verlässt —
Mails an reale Empfänger, Einreichungen, Bewerbungen; das Post Office bleibt bei „nothing sends
itself". (2) **Engine-Site-PRs** (`engine-site-pr.yml`), weil `/apparatus` öffentlich behauptet,
ein Mensch merge sie — die Behauptung ändern, bevor der Automatismus kommt. (3) Verfassungs- und
Lizenzänderungen in den Praxis-Repos.
