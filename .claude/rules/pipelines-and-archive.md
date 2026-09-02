---
paths:
  - "pipelines/**"
  - "src/lib/protokoll/**"
  - "src/content/protokoll/**"
  - "src/data/**/*.json"
  - "scripts/**"
  - ".github/workflows/**"
---

# Pipelines, Archiv, Deployment

Umgezogen aus `CLAUDE.md` am 2026-08-09 (CLAUDE.md-Diät). Inhalt unverändert; lädt jetzt,
wenn eine Pipeline, ein Archiv-JSON, ein Skript oder ein Workflow angefasst wird.

## Das Archiv

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

## GCP — Bedingungen je Schritt (Frank, 2026-08-09)

Batch-Schritte der Pipelines dürfen GCP-Dienste nutzen, wo sie nachweisbaren Mehrwert
stiften. **Die Archivpflicht bindet Befunde: nachrechenbar aus committeten Daten, nie
abhängig davon, dass eine Quelle heute antwortet.** Für Laufzeit-Zustand von *Werken* gilt
`.claude/rules/runtime-and-works.md` (Frank, 2026-08-22) — die frühere Fassung dieser Zeile
verbot ihn, was nie beschlossen war. Karte & Begründung:
`docs/design/2026-08-09-portfolio-audit.md` §6, Aktivierung: `2026-08-09-gcp-activation.md`.
Bedingungen je GCP-Schritt: Trace committen (Query-Text, Job-ID, Bytes billed — zur
Laufzeit erfassen, Job-Historie verfällt nach 180 Tagen), Lizenz-Notice der Quelle beachten
(GDELT: Zitat + Link; Sentinel: „Contains modified Copernicus Sentinel data" — solche
Ableitungen nicht als nacktes CC0), Kostendisziplin (Richtwert 10 €/Monat, Compute-Fußabdruck
im Methodenblatt), Ausfälle vermerkt wie bei jeder Quelle. **Aktiviert:** BigQuery-GDELT
(G1, getestet 2026-08-09); Earth Engine S1 (G5) unter Null-Kosten-Vorbehalt für den
Dark-Ocean-V1-Pfad. Konflikt-TOP läuft weiter über GDELT-Rohdateien, Parallaxe über den
Gemini-AI-Studio-Key — bestehende Pfade werden nur ersetzt, wenn der Mehrwert im
Methodenblatt steht.

## Deployment

Runbook: `pipelines/protokoll/README.md`. Pipelines = **GitHub-Actions-Workflows**
(`.github/workflows/{protokoll,praemie,parallaxe}.yml`, nächtlich); GCP nur als gezielter
Batch-Baustein unter den Bedingungen oben. Secrets (GitHub → Actions): `FIRMS_MAP_KEY`,
`EIA_API_KEY`, `GEMINI_API_KEY` (Parallaxe, AI-Studio-Free-Tier), `CF` (Cloudflare),
`CF_ANALYTICS_TOKEN` (Zone · Analytics · Read — die Leserschaft von `/trending`, gelesen von
`trending.yml`; dazu die Repo-Variable `CF_ZONE_ID`), optional `UMAMI_API_URL`,
`UMAMI_USERNAME`, `UMAMI_PASSWORD` (Lesekonto der eigenen Umami-Instanz) und `INDEXNOW_KEY`
(Schlüsseldatei + Ping in `deploy-cf.yml`; fehlt er, passiert dort nichts).
Site: statisch (dist/) auf Cloudflare Pages via `deploy-cf.yml`; Rebuild-Trigger ist der
`workflow_run` nach jedem Nightly (Push mit eingebautem GITHUB_TOKEN löst `on: push` nicht
aus).

**Bekannt rot:** Der Check `Workers Builds: frankbueltge-de` fällt auf JEDEM PR — eine
zweite, dashboard-seitige Cloudflare-Anbindung, die dasselbe Projekt nochmal bauen will
und es nicht kann. Blockiert nichts (`main` hat keinen Branch-Schutz). **Nicht durch eine
wrangler-Config „grün machen"** — Diagnose und der Ein-Klick-Fix:
`docs/design/2026-08-03-two-deployers-one-project.md`.
