# CLAUDE.md — frankbueltge.de

Persönliche Website von Frank Bültge (Data & AI Engineer) — ein öffentliches
**Experimentierfeld** mit **Daten und KI** (inkl. ML und symbolischer KI). Die Experimente
(Protokoll, Halbwertszeit, Parallaxe, Police) sind erste Annäherungen, praxisbasiert, auf dem
Weg zu einer künstlerischen Forschung. Das gestaltete Arbeiten lebt in den Projekten
(datavism.org, data-snack.com). Positionierung: `docs/superpowers/specs/2026-06-20-ehrliche-umrahmung-design.md`.

**Neue Lab-Linie: Gegenmessung / Counter-Measurement** — messen, was Macht im Dunkeln lässt,
und nachprüfbar machen. Erstes Instrument „The Consensus" misst orchestrierten Konsens
(`docs/superpowers/specs/2026-06-22-gegenmessung-echo-design.md`).

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
Die Protokoll-Pipelines (`pipelines/protokoll/`, Python 3.12) laufen als nächtliche
**GitHub-Actions-Workflows** und schreiben täglich `src/content/protokoll/<jahr>/<datum>.json`,
`src/data/praemie/police.json` und `src/data/parallaxe/register.json`, committet als Autorin
„Protokollführung" → Pages-Rebuild. **Kein GCP:** Konflikt-TOP via GDELT-Rohdateien (HTTP),
Parallaxe via Gemini-AI-Studio-Key (statt BigQuery/Vertex).

## Experimente — verbindliche Regeln

- **Spec:** `docs/superpowers/specs/2026-06-11-werkgruppe-design.md` (Substanz-Kriterien
  in §2 sind das Gate für jedes neue Experiment; Methodenblatt-Pflicht in §3.5).
  Rahmung/Wortlaut: `2026-06-20-ehrliche-umrahmung-design.md` (kein Kunst-Anspruch).
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

## Wichtige Pfade

| Pfad | Inhalt |
|---|---|
| `pipelines/protokoll/` | Python-Pipeline (Adapter, Assembler, GitHub-Committer, Runbook in README.md) |
| `src/content/protokoll/` | kanonisches Archiv (Tages-JSONs) |
| `src/lib/protokoll/` | Typen, Datenzugriff, Tagesordnung, Renderer + Tests |
| `src/pages/protokoll/`, `src/pages/werke/` | Routen (DE; EN-Spiegel unter `src/pages/en/`) |
| `docs/superpowers/specs/`, `docs/superpowers/plans/` | Design-Specs und Implementierungspläne |
| `src/lib/zentrale/`, `functions/api/zentrale/`, `src/pages/steuerzentrale/` | private Steuerzentrale (Status + Antworten), Design-Notiz `docs/design/2026-07-17-steuerzentrale.md` |
| `src/lib/saat/`, `functions/api/saat.js`, `src/pages/saat/` | Öffentliche Saat (Besucher-Seeds mit Gate, Spec 2026-07-20) |

## Deployment

Runbook: `pipelines/protokoll/README.md`. Pipelines = **GitHub-Actions-Workflows**
(`.github/workflows/{protokoll,praemie,parallaxe}.yml`, nächtlich), kein GCP. Secrets
(GitHub → Actions): `FIRMS_MAP_KEY`, `EIA_API_KEY`, `GEMINI_API_KEY` (Parallaxe,
AI-Studio-Free-Tier), `CF` (Cloudflare). Site: statisch (dist/) auf Cloudflare Pages via
`deploy-cf.yml`; Rebuild-Trigger ist der `workflow_run` nach jedem Nightly (Push mit
eingebautem GITHUB_TOKEN löst `on: push` nicht aus).
