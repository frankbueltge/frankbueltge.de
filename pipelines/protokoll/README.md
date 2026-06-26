# Protokoll-Pipeline — Runbook

Läuft als **nächtliche GitHub-Actions-Workflows** (kein GCP). Jeder Lauf schreibt sein JSON
ins Repo und committet als Autorin „Protokollführung" → Cloudflare-Pages-Rebuild.

> Historie: Bis Juni 2026 lief das als Cloud-Run-Jobs (BigQuery für den Konflikt-TOP,
> Vertex AI für Parallaxe). Migriert auf GitHub Actions, BigQuery → GDELT-Rohdateien (HTTP),
> Vertex → Gemini AI-Studio-API. Cloud Run ist abgeschaltet.

## Workflows

| Workflow | Zeit (UTC) | Schreibt | Secrets |
|---|---|---|---|
| `.github/workflows/protokoll.yml` | 03:30 | `src/content/protokoll/<jahr>/<datum>.json` (inkl. TOP Verluste & Konflikt) | `FIRMS_MAP_KEY`, `EIA_API_KEY` |
| `.github/workflows/praemie.yml`   | 04:00 | `src/data/praemie/police.json` | — |
| `.github/workflows/parallaxe.yml` | 05:30 | `src/data/parallaxe/register.json` | `GEMINI_API_KEY` |

Alle installieren `./pipelines/protokoll`, laufen mit `--dry-run --repo-root .` (schreiben,
committen nicht) und committen anschließend per `git push` (Autorin „Protokollführung").
Der Deploy nach Cloudflare passiert über `deploy-cf.yml` (`workflow_run`-Trigger nach jedem
Nightly — ein Push mit dem eingebauten `GITHUB_TOKEN` löst `on: push` nicht aus).

**Kein GCP mehr:** Der Konflikt-TOP holt GDELT-2.0-Events aus den öffentlichen Rohdateien per
HTTP (96 Viertelstunden-Dateien/Tag, kein BigQuery); Parallaxe ruft Gemini über die
AI-Studio-API (`generativelanguage`, `GEMINI_API_KEY`, kostenloser Tier) statt Vertex.

## Lokal

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest -q
# Trockenlauf (schreibt ins Repo-Ziel, committet nichts):
export FIRMS_MAP_KEY=... EIA_API_KEY=...
python -m protokoll.run --dry-run --repo-root ../..
# Parallaxe lokal:
export GEMINI_API_KEY=...
python -m protokoll.parallaxe.run --dry-run --repo-root ../..
```

Ohne Keys laufen die betroffenen TOPs auf „Feststellung entfällt" — amtlich korrekt.

## Secrets (GitHub → Settings → Secrets and variables → Actions)

- `FIRMS_MAP_KEY` — NASA FIRMS (TOP „fires")
- `EIA_API_KEY` — EIA Energie (TOP „oil")
- `GEMINI_API_KEY` — Google AI Studio (Parallaxe-LLM), kostenloser Tier
- `CF` — Cloudflare-API-Token (Deploy); Account-ID steht in `deploy-cf.yml`

## Manueller Lauf / Test

```bash
gh workflow run praemie.yml     # sicher: police.json wird täglich überschrieben
gh workflow run parallaxe.yml   # sicher: register.json wird täglich überschrieben
# protokoll NICHT von Hand auslösen, wenn der heutige Tag schon committet ist
# (Archiv-Regel: committete Tagesprotokolle werden nie editiert). Erster Lauf = nächtlich.
```

## Redaktionelle Pflege

- `src/protokoll/data/refugees.json`: bei UNHCR-Global-Trends-Veröffentlichung aktualisieren.
- `src/protokoll/data/food.json`: monatlich nach FAO-FPI-Release aktualisieren.
- `src/protokoll/adapters/population.py`: Konstanten nach neuer UN-WPP-Revision prüfen.
