# Beifang — Runbook

„Der Beifang" misst, wie viel Drittanbieter-Tracking wissenschaftliche Artikelseiten
vor jeder Einwilligung laden — Big-5-Verlage gegen eine Diamond-OA-Kontrollgruppe,
US-Blickwinkel gegen (später) EU. Spec: `docs/superpowers/specs/2026-07-01-beifang-design.md`.

## Lokale Einrichtung

```bash
cd pipelines/beifang
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
.venv/bin/playwright install chromium
```

## Tests

```bash
.venv/bin/pytest -q
```

Browser-Tests (echtes Chromium) sind mit dem Marker `browser` gekennzeichnet
(siehe `pyproject.toml`) — sie brauchen das installierte Chromium aus dem Setup-Schritt
oben. Alle anderen Tests laufen offline (gemonkeypatchtes `capture_page`, kein Netz).

## Lokaler Lauf

```bash
npm run beifang:refresh -- --limit 5
```

Schreibt `src/content/beifang/<jahr>/<datum>.json` ins Checkout, committet aber nichts —
das übernimmt der Workflow-Step. `--limit N` kappt das Panel auf die ersten N Einträge
(lokaler Test ohne alle ~60 Seiten zu laden); `--limit 0` (Default) läuft das volle Panel.
`--date YYYY-MM-DD` überschreibt das Default-Datum (heute UTC).

## Panel- und Listen-Pflege

Panel (`data/panel.json`) und Tracker-Listen (`data/lists/`) sind committete Snapshots,
keine Laufzeit-Downloads:

```bash
.venv/bin/python -m beifang.panel        # baut data/panel.json (Crossref-Abfragen)
.venv/bin/python -m beifang.lists_fetch  # holt EasyPrivacy + DuckDuckGo-TDS
```

Nach jedem (Wieder-)Aufbau des Panels: `.venv/bin/python -m beifang.identity` laufen lassen,
um die Leseidentität (Titel/Schlagwörter via Crossref) je Panel-Eintrag (wieder) anzuhängen —
**ohne diesen Schritt fehlt jedem Eintrag `identity`, und der Leak-Audit ist entwaffnet**
(die Leak-Felder werden dann null — fehlende Identität heißt "Audit konnte nicht laufen",
nicht "sauber gemessen").

Änderungen an Panel oder Listen sind bewusste, sichtbare Commits — nie Teil des
Wochenlaufs. Panel-Änderungen (tote URLs, Ersatz) bekommen einen Log-Eintrag in
`panel["log"]`, damit die Zeitreihe interpretierbar bleibt.

## Workflow-Betrieb

Wöchentlich, montags 02:17 UTC, als GitHub-Actions-Workflow
(`.github/workflows/beifang.yml`, Muster wie protokoll/praemie/parallaxe). Jeder Lauf
ist ein Commit ins Archiv (`src/content/beifang/…`), Identität „Gegenmessung" (nicht
„Protokollführung" — eigene Commit-Identität der Gegenmessung-Linie).

Der EU-Blickwinkel ist in v1 **ausstehend**: gemessen wird nur vom GitHub-Runner (US).
Die EU-Spalte wird im Archiv ehrlich als „Feststellung ausstehend (EU-Messpunkt nicht
aufgebaut)" ausgewiesen, nicht weggelassen — und nachgerüstet, sobald der geplante
EU-VPS (Umami-Server) steht und einen SOCKS-Proxy für den zweiten Durchgang bereitstellt.
