# Werk-Audit — Übersicht

> **Read-only Fakten-Audit** der bestehenden Untersuchungen und Studien (Stand 2026-06-14).
> Zweck: belastbare Fakten-Dossiers als Grundlage für eine spätere kritische
> künstlerisch-forschende Bewertung — **nicht** die Bewertung selbst.
> **Keine** öffentliche Datei verändert; alle Ausgaben unter `_drafts/work-audit/`.
> Regeln: keine erfundenen Fakten; Unklares als **ZU KLÄREN**; keine neuen Claims;
> keine Theoriebezüge, die nicht im Repo stehen; nüchtern, dateibelegt.

## Methode dieses Audits
- Quellen: die realen Dateien des Repos (Frontend-Komponenten, Methodenblätter,
  `src/lib/*`, committete Datendateien, `pipelines/protokoll/*`, `.github/workflows/*`)
  sowie die Design-Specs/Pläne/Artefakte unter `docs/superpowers/`.
- Erhebung: fünf read-only Recherchen (eine je Arbeit), Ergebnisse hier synthetisiert.
- Belege: Dateipfade (repo-relativ). Einzelne Zeilennummern/Commit-IDs aus der Erhebung
  sind als Orientierung zu lesen und vor Zitation zu **verifizieren** (als ZU KLÄREN markiert).

## Die fünf Gegenstände
| # | Arbeit | Status (Ist) | Dossier |
|---|---|---|---|
| 1 | Das Protokoll | live | `01-das-protokoll.md` |
| 2 | Halbwertszeit | live | `02-halbwertszeit.md` |
| 3 | Parallaxe | live | `03-parallaxe.md` |
| 4 | Die Police (Pipeline-Name „Prämie") | live | `04-die-police.md` |
| 5 | Überflug | **ausgemustert** (Lab-Studie, Nicht-Werk) | `05-ueberflug.md` |

Vergleichsmatrix: `06-comparative-matrix.md` · Offene Fragen gesammelt: `07-open-questions.md`.

## Gemeinsamer Rahmen (verifiziert)
- **Reihe:** „Die Akte der Gegenwart" / EN „The File of the Present"
  (`src/i18n/ui.ts`, `werke.title`); Kicker „Untersuchungen" / „Investigations".
- **Leitsatz der Reihe (verbatim, `ui.ts` `werke.sub`):** „Praxisbasierte Untersuchungen an
  der Schnittstelle von Daten, Wissenschaft und Gesellschaft — Messinstrumente, keine
  Visualisierungen."
- **Substanz-Gate** (Maßstab jeder Arbeit): `docs/superpowers/specs/2026-06-11-werkgruppe-design.md`
  §2 (echte Daten + Provenienz · eine überprüfbare Frage statt Effekt · Infrastruktur als
  Teil der Aussage · offenes Leave-behind · Verhältnismäßigkeit) + §3.5 Methodenblatt-Pflicht.
- **Werk-Registry:** `src/data/werke.ts` (vier live; `GEPLANT` leer; Überflug-Ausmusterung als Kommentar).
- **Archiv-Prinzip:** „Git ist das Archiv" — committete JSONs; Site liest zur Laufzeit keine Cloud.
- **Determinismus:** Werk-Prosa deterministisch aus Templates; LLM nur in Parallaxe (Extraktion).

## Cross-cutting Beobachtungen (nur Beobachtung, keine Bewertung)
1. **Vier von fünf Arbeiten teilen denselben Werktyp:** das laufende *Register/Messinstrument*
   (Protokoll, Halbwertszeit, Parallaxe, Police). Überflug fiel heraus, weil ihm These +
   Akkumulation fehlen. → Homogenität ist Stärke (Kohärenz) und Risiko (Formmonotonie) zugleich.
2. **Dokumentierte Selbstkorrektur ist real und teils öffentlich:** Überflug ausgemustert
   (`werke.ts`-Kommentar + Studien-MDX), Parallaxe nach Prototyp-Scheitern neu entworfen
   (Methodenblatt nennt „Faktor 0,97"). Rohbeleg des Scheiterns liegt nur intern
   (`docs/superpowers/artifacts/2026-06-14-parallaxe-prototyp.json`).
3. **Methodenblätter folgen einem einheitlichen 6-Punkte-Schema** (Quellen/Lizenzen · Kadenz ·
   Verarbeitung · Grenzen · Compute-Fußabdruck · Änderungsprotokoll). Konsistent.
4. **Ethik-Hinweise sind unterschiedlich tief.** Halbwertszeit (kein Opfer-Ranking,
   chronologisch) und Police (Deutungs-Disclaimer) benennen Grenzen explizit; bei Parallaxe
   (geopolitische Sensibilität) und Protokoll (Anglophonie von GDELT/Wikipedia) bleiben
   ethische Hinweise teils unter der Oberfläche. → ZU KLÄREN je Arbeit.
5. **Mehrere Schedules/Deployment-Angaben** (03:30 / 04:00 / 04:30 / 05:30 UTC) stammen aus
   Specs/Plänen — die tatsächliche Cloud-Scheduler-Konfiguration ist nicht im Repo verifizierbar.
   → durchgängig ZU KLÄREN (Deployment).
6. **Eine konkrete Inkonsistenz im Außentext:** Parallaxe-Beschreibung sagt „acht
   Sprachversionen", die Pipeline arbeitet mit 12 (`parallaxe/__init__.py`). → ZU KLÄREN.

## Was dieser Audit NICHT tut
- Keine Empfehlung „behalten/verwerfen" — höchstens „zu prüfen".
- Keine Qualitäts-/Kunsturteile; nur Fakten, Beobachtungen, offene Fragen.

---

## Anhang A — Gelesene relevante Dateien (Auswahl)
**Gemeinsam:** `src/data/werke.ts`, `src/i18n/ui.ts`, `src/content.config.ts`,
`src/lib/site.ts`, `docs/superpowers/specs/2026-06-11-werkgruppe-design.md`,
`pipelines/protokoll/README.md`, `.github/workflows/ci.yml`.

**Protokoll:** `src/components/pages/ProtokollDoc.astro`, `…/MethodenblattProtokoll.astro`,
`src/components/ProtokollTeaser.astro`, `src/pages/protokoll/{index,[datum],archiv}.astro`,
`src/pages/protokoll/feed.xml.ts`, `src/lib/protokoll/{types,data,agenda,render}.ts`,
`src/lib/protokoll/render.test.ts`, `src/content/protokoll/2026/2026-06-14.json`,
`pipelines/protokoll/src/protokoll/{run,assemble,model,validate,fetch,github_commit}.py` + `adapters/*`,
`docs/superpowers/plans/2026-06-11-protokoll-kern.md`.

**Halbwertszeit:** `src/components/pages/HalbwertszeitPage.astro`, `…/MethodenblattHalbwertszeit.astro`,
`src/pages/halbwertszeit/index.astro` (+`/en`), `src/pages/werke/halbwertszeit.astro` (+`/en`),
`src/lib/halbwertszeit/{types,svg}.ts` + `svg.test.ts`, `src/data/halbwertszeit/register.json`,
`pipelines/protokoll/src/protokoll/halbwertszeit/*`, `tests/test_hw_*`,
`docs/superpowers/specs/2026-06-13-halbwertszeit-design.md`, `…/plans/2026-06-13-halbwertszeit.md`.

**Parallaxe:** `src/components/pages/ParallaxePage.astro`, `…/MethodenblattParallaxe.astro`,
`src/pages/parallaxe/index.astro` (+`/en`), `src/pages/werke/parallaxe.astro` (+`/en`),
`src/lib/parallaxe/{types,data,labels}.ts` + `labels.test.ts`, `src/data/parallaxe/register.json`,
`pipelines/protokoll/src/protokoll/parallaxe/*` (`prompt.py`, `extract_llm.py`, `register.py`,
`extracts.py`, `analyze.py`, `run.py`), `tests/test_px_*`,
`docs/superpowers/specs/2026-06-13-parallaxe-design.md`, `…/plans/2026-06-14-parallaxe.md`,
`docs/superpowers/artifacts/2026-06-14-parallaxe-prototyp.json`.

**Die Police:** `src/components/pages/PraemiePage.astro`, `…/MethodenblattPraemie.astro`,
`src/pages/praemie/index.astro` (+`/en`), `src/pages/werke/praemie.astro` (+`/en`),
`src/lib/praemie/{types,render}.ts` + `render.test.ts`, `src/data/praemie/police.json`,
`pipelines/protokoll/src/protokoll/praemie/*` (`bls,disasters,claims,retreat,run`), `tests/test_pr_*`,
`docs/superpowers/specs/2026-06-14-praemie-design.md`.

**Überflug:** `src/content/lab/ueberflug-studie/{de,en}.mdx`,
`src/components/ueberflug/{UeberflugIsland.astro,tally-worker.ts}`,
`src/lib/ueberflug/{types,snapshot,visibility}.ts` + `{snapshot,visibility}.test.ts`,
`src/data/ueberflug/satellites.json`, `scripts/fetch-ueberflug.ts`,
`.github/workflows/ueberflug-refresh.yml`,
`docs/superpowers/specs/2026-06-12-ueberflug-design.md`, `…/plans/2026-06-12-ueberflug.md`.

## Anhang B — Neu erstellte Dateien (dieser Audit)
- `_drafts/work-audit/00-overview.md` (diese Datei)
- `_drafts/work-audit/01-das-protokoll.md`
- `_drafts/work-audit/02-halbwertszeit.md`
- `_drafts/work-audit/03-parallaxe.md`
- `_drafts/work-audit/04-die-police.md`
- `_drafts/work-audit/05-ueberflug.md`
- `_drafts/work-audit/06-comparative-matrix.md`
- `_drafts/work-audit/07-open-questions.md`

## Anhang C — git status
**Vorher (2026-06-14T16:01:43Z):** working tree „clean" bzgl. getrackter Dateien; untracked
waren nur `_drafts/`, `docs/00–16` + `CLAUDE.md.proposed.md`, `frankbueltge-docs-2026-06-14.zip(/)`.
**Nachher (2026-06-14T16:14:31Z):** `git status --porcelain --untracked-files=no` ist **leer**
— keine getrackte/öffentliche Datei verändert. Neu hinzugekommen sind ausschließlich die acht
Dateien unter `_drafts/work-audit/` (innerhalb des bereits untracked `_drafts/`-Baums). Keine
Commits, kein Push, kein Deployment.
