# CLAUDE.md — frankbueltge.de

Persönliche Website von Frank Bültge (Data & AI Engineer) — ein öffentliches
**Experimentierfeld** mit Daten und Code. Die Experimente (Protokoll, Halbwertszeit,
Parallaxe, Police) sind erste Annäherungen, praxisbasiert, auf dem Weg zu einer
künstlerischen Forschung — nicht deren fertige Praxis. Das gestaltete Arbeiten lebt in
den Projekten (datavism.org, data-snack.com). Positionierung: `docs/superpowers/specs/2026-06-20-ehrliche-umrahmung-design.md`.

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

Astro 5, statisch, zweisprachig (de unter `/`, en unter `/en`), Tailwind v4,
Mono-Skin fest. **Git ist das Archiv:** Pipelines committen versionierte
JSON-Snapshots ins Repo (kein dynamisches Lesen aus Cloud-Diensten zur Laufzeit).
Die Protokoll-Pipeline (`pipelines/protokoll/`, Python 3.12, Cloud Run Job, 03:30 UTC)
schreibt täglich `src/content/protokoll/<jahr>/<datum>.json` per GitHub-API-Commit
(Autorin „Protokollführung") → Pages-Rebuild.

## Experimente — verbindliche Regeln

- **Spec:** `docs/superpowers/specs/2026-06-11-werkgruppe-design.md` (Substanz-Kriterien
  in §2 sind das Gate für jedes neue Experiment; Methodenblatt-Pflicht in §3.5).
  Rahmung/Wortlaut: `2026-06-20-ehrliche-umrahmung-design.md` (kein Kunst-Anspruch).
- **Kein LLM-Text.** Die Prosa des Protokolls ist deterministisch aus Templates
  (`src/lib/protokoll/agenda.ts`, `render.ts`); die exakten Strings stehen unter
  Testschutz (`render.test.ts`). **Test-Strings nie aufweichen** — sie sind das
  abgenommene amtliche Register.
- **Archiv-JSONs sind unantastbar.** Committete Tagesprotokolle werden nie editiert;
  Korrekturen geschehen nur an der Darstellung (Registerfassung versioniert).
- **Ausfälle ehrlich vermerken:** Quellenausfälle werden vermerkt („Feststellung entfällt"),
  nie still überbrückt. Adapter erfinden nichts.
- **Secrets:** API-Keys nie in URLs-in-Fehlermeldungen (fetch redigiert Query-Strings
  und FIRMS maskiert den Pfad-Key) — Vermerke landen im öffentlichen Archiv.
- **Kein Backfill** vergangener Sitzungen: Die Adapter holen stets den jüngsten Stand;
  ein rückdatiertes Protokoll mit heutigen Messwerten wäre eine Lüge im Archiv.

## Wichtige Pfade

| Pfad | Inhalt |
|---|---|
| `pipelines/protokoll/` | Python-Pipeline (Adapter, Assembler, GitHub-Committer, Runbook in README.md) |
| `src/content/protokoll/` | kanonisches Archiv (Tages-JSONs) |
| `src/lib/protokoll/` | Typen, Datenzugriff, Tagesordnung, Renderer + Tests |
| `src/pages/protokoll/`, `src/pages/werke/` | Routen (DE; EN-Spiegel unter `src/pages/en/`) |
| `docs/superpowers/specs/`, `docs/superpowers/plans/` | Design-Specs und Implementierungspläne |

## Deployment

GCP-Runbook: `pipelines/protokoll/README.md` (Cloud Run Job + Scheduler + Secret Manager).
Secrets: GitHub-Fine-Grained-PAT (nur dieses Repo, Contents R/W), FIRMS_MAP_KEY, EIA_API_KEY.
Site-Hosting: statisch (dist/), Rebuild-Trigger ist der nächtliche Commit.
