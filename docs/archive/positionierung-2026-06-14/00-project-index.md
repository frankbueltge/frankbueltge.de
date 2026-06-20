# 00 — Projekt-Index

> Interne Dokumentation des Projektstands von **frankbueltge.de**.
> Erstellt am 2026-06-14. Stand: Website noch nicht öffentlich.
> Sprache: Deutsch. Tonalität: nüchtern, prüfend, ohne Marketing.

## Zweck dieses Dokumentensatzes

Diese Dokumente (`docs/00` bis `docs/16` plus ein CLAUDE.md-Vorschlag) sind eine
**belastbare Bestandsaufnahme** und **Positionierungsgrundlage** für den geplanten
Auftritt von Frank Bültge als **datenbasierter Artistic Researcher**.

Sie beschreiben, was tatsächlich im Repository steht — nicht, was es sein soll.
Wo etwas unklar ist, steht **UNGEKLÄRT** oder **ZU KLÄREN**. Es wurden **keine**
biografischen Fakten, Ausstellungen, Publikationen, Awards, Kooperationen oder
Werke erfunden.

## Arbeitsregeln, unter denen dieser Satz entstand

1. **Keine Änderung** an öffentlichen Seiten, Komponenten, Routen, Texten, Styles.
   Alles Geschriebene liegt in `docs/`. Vorschläge bleiben Vorschläge.
2. Quellen sind das Repository selbst, die bestehenden Specs unter
   `docs/superpowers/`, und der biografische Rahmen aus der Auftragsbeschreibung.
3. Deleuze ist **eine** optionale historische Referenz, **nicht** die Hauptachse.
4. Keine fertige öffentliche Selbstbeschreibung — stattdessen Richtungen, Kriterien,
   Fragen.

## Projekt auf einen Blick (verifiziert)

| Aspekt | Stand |
|---|---|
| Person | Frank Bültge |
| Domain | frankbueltge.de (geplant), aktuell Vercel-Preview |
| Status | **nicht öffentlich** / im Aufbau |
| Framework | Astro 5 (statisch), TypeScript strict, Tailwind v4 |
| Sprachen | zweisprachig — DE unter `/`, EN unter `/en` |
| Deployment | Vercel (statisch, `dist/`); Daten-Pipelines auf GCP Cloud Run |
| Aktuelle Rolle (Header) | „Data Engineering & Artistic Research" |
| Aktuelle Rolle (About/Footer/Schema) | „Data & AI Engineer" (**nicht angeglichen** — siehe 03) |
| Kernarbeit | Reihe „Die Akte der Gegenwart" — vier live „Untersuchungen" |
| Untersuchungen (live) | Das Protokoll, Halbwertszeit, Parallaxe, Die Police (Prämie) |
| Lab-Studie (kein Werk) | Überflug (ehrlich ausgemustert) |
| Berufsprojekte | data-snack.com (2023), datavism.org (2024, in Entwicklung) |

## Zentrale Befunde in einem Absatz

Das Projekt hat eine **ungewöhnlich substanzhaltige Werkbasis**: vier laufende,
quellentransparente, deterministisch erzeugte Daten-Untersuchungen mit Methodenblättern,
einem expliziten Substanz-Gate und dokumentierten Fehlentscheidungen (Überflug ausgemustert,
Parallaxe nach Prototyp-Scheitern neu entworfen). Das ist genau die Art von Disziplin,
die einen Artistic-Research-Anspruch trägt. **Demgegenüber steht eine halb umgestellte
Selbstbeschreibung:** Werke und Startseite sprechen Forschung, About-Seite, Footer und
strukturierte Metadaten sprechen noch Analytics-Engineering/Consulting. Diese Naht ist
das größte Positionierungsrisiko und zugleich am leichtesten zu beheben.

## Karte des Dokumentensatzes

| Datei | Inhalt | Phase |
|---|---|---|
| `00-project-index.md` | Dieses Dokument | — |
| `01-technical-architecture.md` | Tech-Stack, Routing, Daten, Pipelines, CI/CD, SEO | 1 |
| `02-content-inventory.md` | Vollständiges Inventar aller Inhalte und Texte | 1 |
| `03-positioning-audit.md` | Was die Site aktuell behauptet — Stärken, Brüche | 2 |
| `04-language-and-tone-audit.md` | Sprache, Begriffe, Register, riskante Formulierungen | 2 |
| `05-risk-register.md` | Risiken nach Schwere, mit Gegenmaßnahmen | 2 |
| `06-positioning-directions.md` | Vier Positionierungsrichtungen A–D, bewertet | 3 |
| `07-discourse-map.md` | Diskurslandkarte (Anschlussfelder, zu prüfende Quellen) | 4 |
| `08-work-and-experiment-framework.md` | Wie Praxis gezeigt statt behauptet wird | 5 |
| `09-taxonomy-works-experiments-notes.md` | Begriffe: Work, Experiment, Note, Instrument … | 5 |
| `10-information-architecture.md` | Vier IA-Varianten, bewertet | 6 |
| `11-publication-criteria.md` | Wann ist etwas veröffentlichungswürdig | 7 |
| `12-no-gos.md` | Was vermieden werden muss | 7 |
| `13-roadmap.md` | Praxis-Roadmap 30 Tage bis 10 Jahre | 8 |
| `14-experiment-seeds.md` | 15 Experiment-Ansätze | 9 |
| `15-questions-for-frank.md` | Priorisierte Fragen vor öffentlichen Texten | 10 |
| `16-summary-and-next-steps.md` | Abschlussbericht | 12 |
| `../CLAUDE.md` (Vorschlag in 16/separat) | Arbeitsregeln | 11 |

## Verhältnis zu bestehenden Dokumenten

Es gibt bereits einen reichen Bestand unter `docs/superpowers/`:

- `specs/2026-06-10-frankbueltge-de-vision.md` — Vision
- `specs/2026-06-11-werkgruppe-design.md` — **Substanz-Gate** (verbindlich)
- `specs/2026-06-12-…` bis `2026-06-14-…` — Designspecs der einzelnen Werke
- `plans/…` — Umsetzungspläne
- `docs/2026-06-08-rebuild-spec.md` — Rebuild-Spec der Site

Dieser neue Satz (`00–16`) **ersetzt diese nicht**, sondern legt eine
**Positionierungs- und Außenkommunikations-Ebene** darüber. Die Werk-Specs bleiben
die technische Wahrheit; die `00–16`-Reihe ordnet sie in eine öffentliche Haltung ein.
