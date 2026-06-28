# The Protocol — Vertagungs-Index, Schnitt 1 (CO₂) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den Vertagungs-Index end-to-end auf *einer* Größe (CO₂) beweisen — aus Dashboard wird ein Messinstrument mit einer prüfbaren Behauptung — und den Aufklapp-Bug beheben.

**Architecture:** Die Trend-Klassifikation (verschlechtert/verbessert/unverändert gegen den 12-Monats-Trend) wird **im Adapter** berechnet — denselben Ort, an dem schon heute `record`/`comparison` entstehen. **Wichtige Vereinfachung gegenüber der Spec:** Der CO₂-Adapter holt bereits die volle, deseasonalisierte NOAA-Reihe ab 1979; der Trend ist also aus den ohnehin geholten Zeilen berechenbar — **keine** separate Seed-Pipeline für CO₂ nötig. Der `src/data/protokoll/reference/`-Seed-Layer (für Größen ohne volle Geschichte im Normal-Fetch und für tiefe Frontend-Sparklines) wird in einem **späteren** Schnitt nachgezogen. Das Tages-JSON bekommt ein neues `index`-Aggregat; Frontend rendert daraus die Schlagzeile.

**Tech Stack:** Python 3.12 (Pipeline, `httpx`, **keine** Numerik-Libs — Least-Squares von Hand), Astro 5 + TypeScript + Zod v4 (Frontend), Vitest + pytest.

## Global Constraints

- **Keine neuen Runtime-Dependencies in der Pipeline.** Nur `httpx`. Regression/Trend in reinem Python.
- **Archiv-JSONs sind unveränderlich.** Alte `src/content/protokoll/**`-Tage werden nie editiert; neue Felder sind in Zod **`.nullable().default(null)`**, damit die 18 bestehenden Tage ohne `index`/`trend` weiter validieren.
- **Schema-Sync ist Pflicht:** Jede Änderung am Python-Modell (`model.py`) erfordert gleichlautende Updates in `src/content.config.ts` (Zod) **und** `src/lib/protokoll/types.ts` (TS). Bei neuen Feldern `SCHEMA_VERSION` anheben.
- **`record`/`comparison`/`trend` entstehen im Adapter**, nicht im Assembler, nicht im Frontend.
- **Protokoll-Prosa bleibt deterministisch** und unter Testschutz (`render.test.ts`) — Test-Strings nie aufweichen.
- **Kein Backfill** der Tageseinträge; Geschichte ist Evidenz (Quelle), nie rückdatiertes Protokoll.
- **EN-first i18n:** jede sichtbare Zeichenkette DE **und** EN.
- Pipeline-Tests: `cd pipelines/protokoll && source .venv/bin/activate && pytest -q`. Frontend: `npm run test`, `npm run check`.

---

### Task 1: Aufklapp-Bug beheben (Frontend-Hygiene)

Klappt man eine Kachel auf, streckt das 3-Spalten-Grid die Nachbarkacheln (gleiche Reihenhöhe) — sie zeigen Leerraum. `items-start` lässt jede Kachel ihrer Inhaltshöhe folgen; die offene Kachel streckt die Geschwister dann nicht mehr.

**Files:**
- Modify: `src/components/pages/ProtokollDataView.astro:115`

**Interfaces:**
- Consumes: nichts
- Produces: nichts (reine CSS-Klassen-Änderung)

- [ ] **Step 1: Klasse ändern**

In `src/components/pages/ProtokollDataView.astro` Zeile 115, von:

```astro
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

zu:

```astro
  <div class="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

- [ ] **Step 2: Typecheck/Build grün**

Run: `npm run check`
Expected: `0 errors` (Hints/Warnings wie bisher erlaubt).

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/ProtokollDataView.astro
git commit -m "fix(protokoll): Aufklappen streckt Nachbarkacheln nicht mehr (items-start)"
```

---

### Task 2: Trend-Klassifikation (reine Funktion, Pipeline)

Die mathematische Kernlogik: jüngster Wert gegen den 12-Monats-Trend (lineare Regression über das 365-Tage-Fenster). Pure Funktion, kein I/O, voll getestet. Plus die Richtungs-Konfiguration (welche Größe ist indexfähig und wohin ist „schlechter").

**Files:**
- Create: `pipelines/protokoll/src/protokoll/trend.py`
- Test: `pipelines/protokoll/tests/test_trend.py`

**Interfaces:**
- Consumes: nichts
- Produces:
  - `TrendClass = Literal["worsened", "improved", "unchanged"]`
  - `classify_trend(series: list[tuple[date, float]], *, worse: Literal["up","down"], window_days: int = 365, eps_frac: float = 0.001, min_points: int = 8) -> TrendClass | None` — `None` = Trend nicht etabliert (zu wenige Punkte im Fenster).
  - `WORSE_DIRECTION: dict[str, Literal["up","down"]]` — die indexfähigen TOPs + ihre Verschlechterungsrichtung.

- [ ] **Step 1: Failing test schreiben**

Create `pipelines/protokoll/tests/test_trend.py`:

```python
from datetime import date

from protokoll.trend import classify_trend


def _rising(worse_to_417: float) -> list[tuple[date, float]]:
    s = [(date(2025, m, 1), 410.0 + m * 0.5) for m in range(1, 13)]
    s.append((date(2026, 1, 1), worse_to_417))
    return s


def test_rising_series_up_is_worsened():
    assert classify_trend(_rising(417.0), worse="up") == "worsened"


def test_falling_series_up_is_improved():
    s = [(date(2025, m, 1), 420.0 - m * 0.5) for m in range(1, 13)]
    s.append((date(2026, 1, 1), 413.0))
    assert classify_trend(s, worse="up") == "improved"


def test_flat_series_is_unchanged():
    s = [(date(2025, m, 1), 410.0) for m in range(1, 13)]
    s.append((date(2026, 1, 1), 410.0))
    assert classify_trend(s, worse="up") == "unchanged"


def test_falling_series_down_is_worsened():
    s = [(date(2025, m, 1), 14.0 - m * 0.1) for m in range(1, 13)]
    s.append((date(2026, 1, 1), 12.5))
    assert classify_trend(s, worse="down") == "worsened"


def test_too_few_points_returns_none():
    s = [(date(2026, 1, 1), 410.0), (date(2026, 2, 1), 411.0)]
    assert classify_trend(s, worse="up") is None
```

- [ ] **Step 2: Test ausführen (muss scheitern)**

Run: `cd pipelines/protokoll && source .venv/bin/activate && pytest tests/test_trend.py -q`
Expected: FAIL — `ModuleNotFoundError: No module named 'protokoll.trend'`.

- [ ] **Step 3: Minimale Implementierung**

Create `pipelines/protokoll/src/protokoll/trend.py`:

```python
"""Trend-Klassifikation gegen den 12-Monats-Trend (reines Python, keine Numerik-Libs).

Eine Größe gilt als „verschlechtert", wenn die Steigung ihrer 365-Tage-Regression in die
offengelegte Verschlechterungsrichtung zeigt und die vorhergesagte Änderung über dem
Trendrauschen (eps_frac) liegt; sonst „verbessert" bzw. „unverändert". Zu wenige Punkte im
Fenster → None (Trend noch nicht etabliert).
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Literal

TrendClass = Literal["worsened", "improved", "unchanged"]

# Indexfähige TOPs + Richtung, in die „schlechter" zeigt. Alles andere ist Kontext (kein Index).
WORSE_DIRECTION: dict[str, Literal["up", "down"]] = {
    "co2": "up",
    "seaice_north": "down",
    "seaice_south": "down",
    "sst": "up",
    "refugees": "up",
    "food": "up",
    "conflict": "up",
    "fires": "up",
}


def _slope(xs: list[float], ys: list[float]) -> float:
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    den = sum((x - mx) ** 2 for x in xs)
    return num / den if den else 0.0


def classify_trend(
    series: list[tuple[date, float]],
    *,
    worse: Literal["up", "down"],
    window_days: int = 365,
    eps_frac: float = 0.001,
    min_points: int = 8,
) -> TrendClass | None:
    if not series:
        return None
    latest_date = series[-1][0]
    cutoff = latest_date - timedelta(days=window_days)
    window = [(d, v) for d, v in series if d >= cutoff]
    if len(window) < min_points:
        return None
    xs = [float(d.toordinal()) for d, _ in window]
    ys = [v for _, v in window]
    slope = _slope(xs, ys)
    span = (xs[-1] - xs[0]) or 1.0
    predicted = slope * span
    mean_y = sum(ys) / len(ys)
    if abs(predicted) < eps_frac * abs(mean_y):
        return "unchanged"
    rising = slope > 0
    worsening = (rising and worse == "up") or (not rising and worse == "down")
    return "worsened" if worsening else "improved"
```

- [ ] **Step 4: Test ausführen (muss bestehen)**

Run: `pytest tests/test_trend.py -q`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/trend.py pipelines/protokoll/tests/test_trend.py
git commit -m "feat(protokoll): Trend-Klassifikation gegen 12-Monats-Trend + Richtungs-Config"
```

---

### Task 3: Schema erweitern + Index-Aggregat (Pipeline)

`trend` ins Datenmodell (Measurement→Entry), ein `DayIndex`-Aggregat in den Tagesatz, `SCHEMA_VERSION` auf `"3"`. Das Aggregat zählt nur indexfähige Einträge mit etabliertem Trend.

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/model.py`
- Modify: `pipelines/protokoll/src/protokoll/assemble.py`
- Test: `pipelines/protokoll/tests/test_index.py`

**Interfaces:**
- Consumes: `WORSE_DIRECTION`, `TrendClass` (Task 2)
- Produces:
  - `Measurement.trend: TrendClass | None` und `Entry.trend: TrendClass | None`
  - `DayIndex(eligible: int, established: int, improved: int, worsened: int, unchanged: int)`
  - `DayRecord.index: DayIndex | None`
  - `compute_index(entries: tuple[Entry, ...]) -> DayIndex` (in `assemble.py`)
  - `build_entry` reicht `trend` durch; `assemble` setzt `index`.

- [ ] **Step 1: Failing test schreiben**

Create `pipelines/protokoll/tests/test_index.py`:

```python
from datetime import date

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.assemble import assemble, build_entry, compute_index
from protokoll.model import Entry, Measurement, SourceMeta

SRC = SourceMeta(name="n", url="u", license="l")


def _entry(top_id: str, trend):
    return Entry(top_id=top_id, status="ok", unit="x", cadence="daily", source=SRC,
                 retrieved_at="t", value=1.0, as_of="2026-01-01", trend=trend)


def test_compute_index_counts_only_eligible_with_trend():
    entries = (
        _entry("co2", "worsened"),
        _entry("seaice_north", "improved"),
        _entry("sst", None),        # indexfähig, aber Trend nicht etabliert
        _entry("oil", "worsened"),  # nicht indexfähig → ignoriert
        _entry("quakes", None),     # nicht indexfähig
    )
    idx = compute_index(entries)
    assert idx.eligible == 3
    assert idx.established == 2
    assert idx.worsened == 1
    assert idx.improved == 1
    assert idx.unchanged == 0


def test_build_entry_forwards_trend():
    spec = AdapterSpec(top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500),
                       max_age_days=14, source=SRC,
                       measure=lambda ctx: Measurement(value=420.0, as_of="2026-01-01",
                                                       trend="worsened"))
    e = build_entry(spec, Context(client=None, today=date(2026, 1, 2), env={}))
    assert e.status == "ok"
    assert e.trend == "worsened"


def test_assemble_sets_index_and_schema_v3():
    spec = AdapterSpec(top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500),
                       max_age_days=14, source=SRC,
                       measure=lambda ctx: Measurement(value=420.0, as_of="2026-01-02",
                                                       trend="worsened"))
    rec = assemble([spec], Context(client=None, today=date(2026, 1, 2), env={}), "2026-01-02")
    assert rec.schema_version == "3"
    assert rec.index.eligible == 1
    assert rec.index.worsened == 1
```

- [ ] **Step 2: Test ausführen (muss scheitern)**

Run: `pytest tests/test_index.py -q`
Expected: FAIL — `ImportError: cannot import name 'compute_index'` (bzw. `Entry.__init__` kennt `trend` nicht).

- [ ] **Step 3: `model.py` erweitern**

In `pipelines/protokoll/src/protokoll/model.py`:

Zeile 8 ändern:

```python
SCHEMA_VERSION = "3"  # v3: Vertagungs-Index — Entry.trend + DayRecord.index
```

In `Measurement` (nach `record`-Feld) ergänzen:

```python
    record: bool = False  # Höchststand seit Aufzeichnungsbeginn
    trend: Literal["worsened", "improved", "unchanged"] | None = None  # vs. 12-Monats-Trend
```

In `Entry` (nach `events`-Feld) ergänzen:

```python
    events: tuple[LossEvent, ...] | None = None  # nur TOP „Verluste"
    trend: Literal["worsened", "improved", "unchanged"] | None = None  # nur indexfähige TOPs
```

Vor `DayRecord` eine neue Dataklasse einfügen:

```python
@dataclass(frozen=True)
class DayIndex:
    """Der Vertagungs-Index: Zählung über indexfähige TOPs mit etabliertem Trend."""
    eligible: int      # indexfähige TOPs im Tagesatz
    established: int    # davon mit etabliertem 12-Monats-Trend
    improved: int
    worsened: int
    unchanged: int
```

In `DayRecord` (nach `entries`) ergänzen:

```python
    entries: tuple[Entry, ...]
    index: DayIndex | None = None
```

- [ ] **Step 4: `assemble.py` erweitern**

In `pipelines/protokoll/src/protokoll/assemble.py`:

Import-Zeile 9 erweitern und `WORSE_DIRECTION` importieren:

```python
from protokoll.model import SCHEMA_VERSION, DayIndex, DayRecord, Entry
from protokoll.trend import WORSE_DIRECTION
```

In `build_entry`, den `return` im try-Block (Zeile 32-33) um `trend` ergänzen:

```python
        status = corridor_status(m.value, spec.corridor)
        return Entry(status=status, value=m.value, as_of=m.as_of, comparison=m.comparison,
                     label=m.label, record=m.record, trend=m.trend, **common)
```

Neue Funktion `compute_index` (vor `assemble`):

```python
def compute_index(entries: tuple[Entry, ...]) -> DayIndex:
    eligible = [e for e in entries if e.top_id in WORSE_DIRECTION]
    established = [e for e in eligible if e.trend is not None]
    return DayIndex(
        eligible=len(eligible),
        established=len(established),
        improved=sum(1 for e in established if e.trend == "improved"),
        worsened=sum(1 for e in established if e.trend == "worsened"),
        unchanged=sum(1 for e in established if e.trend == "unchanged"),
    )
```

`assemble` so ändern, dass es `entries` einmal baut und den Index setzt:

```python
def assemble(specs: list[AdapterSpec], ctx: Context, date_iso: str) -> DayRecord:
    entries = tuple(build_entry(s, ctx) for s in specs)
    return DayRecord(
        date=date_iso, generated_at=_now_iso(), schema_version=SCHEMA_VERSION,
        pipeline_version=PIPELINE_VERSION,
        entries=entries, index=compute_index(entries),
    )
```

- [ ] **Step 5: Tests ausführen (müssen bestehen) — auch die bestehende Suite**

Run: `pytest -q`
Expected: PASS — die drei neuen Tests grün, **und** keine Regression in der bestehenden Suite (Hinweis: `compute_index` läuft vor dem Anhängen des `verluste`-Eintrags in `run.py`; `verluste` ist nicht indexfähig, daher unverändert).

- [ ] **Step 6: Commit**

```bash
git add pipelines/protokoll/src/protokoll/model.py pipelines/protokoll/src/protokoll/assemble.py pipelines/protokoll/tests/test_index.py
git commit -m "feat(protokoll): Schema v3 — Entry.trend + DayRecord.index (Vertagungs-Index)"
```

---

### Task 4: CO₂-Adapter berechnet den Trend

Der Adapter hat die volle NOAA-Reihe (`rows`) bereits in der Hand — der Trend wird daraus berechnet und in die `Measurement` geschrieben.

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/adapters/co2.py`
- Test: `pipelines/protokoll/tests/test_co2_trend.py`

**Interfaces:**
- Consumes: `classify_trend`, `WORSE_DIRECTION` (Task 2); `Measurement.trend` (Task 3)
- Produces: `co2.measure(ctx).trend` gesetzt.

- [ ] **Step 1: Failing test schreiben**

Create `pipelines/protokoll/tests/test_co2_trend.py`:

```python
from datetime import date

import httpx

from protokoll.adapters import co2
from protokoll.adapters.base import Context


def _client(csv_text: str) -> httpx.Client:
    def handler(_req: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=csv_text)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_co2_measure_sets_trend_worsened():
    # Spalten: year,month,day,_,value  (co2._rows liest Spalte 4 als Wert)
    lines = [f"2025,{m},1,0,{410.0 + m * 0.5}" for m in range(1, 13)]
    lines.append("2026,1,1,0,417.0")
    csv = "\n".join(lines) + "\n"
    m = co2.measure(Context(client=_client(csv), today=date(2026, 1, 2), env={}))
    assert m.value == 417.0
    assert m.trend == "worsened"
```

- [ ] **Step 2: Test ausführen (muss scheitern)**

Run: `pytest tests/test_co2_trend.py -q`
Expected: FAIL — `assert None == "worsened"` (Adapter setzt `trend` noch nicht).

- [ ] **Step 3: `co2.py` anpassen**

In `pipelines/protokoll/src/protokoll/adapters/co2.py` den Import ergänzen:

```python
from protokoll.trend import WORSE_DIRECTION, classify_trend
```

In `measure`, vor dem `return`, den Trend berechnen und mitgeben:

```python
    record = all(value > v for dd, v in rows if dd < d)
    trend = classify_trend(rows, worse=WORSE_DIRECTION["co2"])
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison,
                       record=record, trend=trend)
```

- [ ] **Step 4: Test ausführen (muss bestehen)**

Run: `pytest tests/test_co2_trend.py -q`
Expected: PASS.

- [ ] **Step 5: Optionaler End-to-End-Trockenlauf (manuell, kein Commit-Gate)**

Run: `cd /Users/frankbultge/Documents/GitHub/frankbueltge.de && npm run protokoll:dry`
Expected: schreibt ein Tages-JSON (committet nichts); im `co2`-Entry steht `"trend": ...`, und der Datensatz hat ein `"index"`-Objekt mit `"eligible" >= 1`. (Netzzugriff nötig; bei Ausfall überspringen — die Unit-Tests sind das Gate.)

- [ ] **Step 6: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters/co2.py pipelines/protokoll/tests/test_co2_trend.py
git commit -m "feat(protokoll): CO₂-Adapter klassifiziert Trend (worsened/improved/unchanged)"
```

---

### Task 5: Frontend-Vertrag + Schlagzeile

Zod-Schema und TS-Typen um `trend`/`index` erweitern (rückwärtskompatibel) und im Kopf der Datenansicht den Index-Satz rendern.

**Files:**
- Modify: `src/content.config.ts:30-62`
- Modify: `src/lib/protokoll/types.ts`
- Modify: `src/components/pages/ProtokollDataView.astro` (Kopf-Bereich, ~Zeile 112)

**Interfaces:**
- Consumes: `ProtokollDay.index`, `ProtokollEntry.trend`
- Produces: sichtbare Schlagzeile (DE/EN), keine weiteren Konsumenten.

- [ ] **Step 1: Zod-Schema erweitern**

In `src/content.config.ts`, im `entries`-Objekt nach `events` (Zeile 59) ergänzen:

```typescript
        events: z
          .array(z.object({
            date: z.string(),
            label_de: z.string(),
            label_en: z.string(),
            deaths: z.number(),
          }))
          .nullable()
          .default(null),
        // Schema 3: Trend gegen 12-Monats-Trend (nur indexfähige TOPs, sonst null).
        trend: z.enum(['worsened', 'improved', 'unchanged']).nullable().default(null),
```

Im Tages-Objekt nach `entries` (Zeile 61) das Index-Aggregat ergänzen:

```typescript
    ),
    // Schema 3: Vertagungs-Index (fehlt in v2-Tagen → null).
    index: z
      .object({
        eligible: z.number(),
        established: z.number(),
        improved: z.number(),
        worsened: z.number(),
        unchanged: z.number(),
      })
      .nullable()
      .default(null),
```

- [ ] **Step 2: TS-Typen erweitern**

In `src/lib/protokoll/types.ts`, in `ProtokollEntry` nach `events` ergänzen:

```typescript
  events?: LossEvent[] | null
  trend: 'worsened' | 'improved' | 'unchanged' | null
```

Vor `ProtokollDay` eine Schnittstelle einfügen und das Feld anhängen:

```typescript
export interface ProtokollIndex {
  eligible: number
  established: number
  improved: number
  worsened: number
  unchanged: number
}

export interface ProtokollDay {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  entries: ProtokollEntry[]
  index: ProtokollIndex | null
}
```

- [ ] **Step 3: Schlagzeile rendern**

In `src/components/pages/ProtokollDataView.astro`, direkt nach dem `{oldest && …}`-Absatz (Zeile 112, innerhalb `<header>`), einfügen:

```astro
    {latest?.index && latest.index.established > 0 && (
      <p class="mt-4 max-w-2xl font-mono text-sm text-fg">
        {de
          ? `Indexfähige Punkte: ${latest.index.eligible} · mit etabliertem Trend: ${latest.index.established} · gegen den Jahrestrend verbessert: ${latest.index.improved} · verschlechtert: ${latest.index.worsened}. Beschluss: vertagt.`
          : `Index-eligible items: ${latest.index.eligible} · with established trend: ${latest.index.established} · improved against the yearly trend: ${latest.index.improved} · worsened: ${latest.index.worsened}. Resolution: adjourned.`}
      </p>
    )}
```

- [ ] **Step 4: Typecheck + bestehende Tests grün**

Run: `npm run check && npm run test`
Expected: `npm run check` → 0 errors. `npm run test` → alle bestehenden Vitest-Suites grün (die 18 v2-Tage validieren weiter, weil `trend`/`index` `.nullable().default(null)` sind).

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/protokoll/types.ts src/components/pages/ProtokollDataView.astro
git commit -m "feat(protokoll): Frontend liest Index/Trend (Schema v3) und rendert die Schlagzeile"
```

---

## Nach Schnitt 1 (nicht Teil dieses Plans)

- **Fan-out** der übrigen 7 indexfähigen Größen: je Adapter `classify_trend(series, worse=WORSE_DIRECTION[id])`. Saisonale (`seaice_*`, `sst`, `fires`) brauchen die Saison-Formel — am echten Datenstand festzulegen (eigener Plan).
- **Seed-/Referenz-Layer** `src/data/protokoll/reference/<id>.json` für tiefe Frontend-Sparklines und für Größen ohne volle Geschichte im Normal-Fetch (Import-Muster wie `parallaxe/register.json`).
- **Frontend-Vitalwerte-Umbau**: Kontext-Markierung, Verläufe gegen volle Geschichte, „Befund"/Aufklappen final ablösen.
- **Methodenblatt** `/werke/protokoll` aktualisieren.
- **Deterministischer Beschluss-Satz** in `render.ts` an den Index koppeln (Register-/Testschutz).

## Self-Review

- **Spec-Coverage (Schnitt 1):** Behauptung/Index (Spec §1) → Task 2–5; Vergleich gegen 12-Monats-Trend (§3) → Task 2; indexfähig/Kontext-Split (§2) → `WORSE_DIRECTION` Task 2 + `compute_index` Task 3; Geschichte als Evidenz ohne Backfill (§4) → Trend aus adapter-internen `rows`, kein Archiv-Edit; Frontend-Schlagzeile (§5) → Task 5; Aufklapp-Bug (§Motivation/§8.1) → Task 1. Restliche Größen/Seed/Vitalwerte/Methodenblatt sind bewusst Folge-Schnitte (oben gelistet).
- **Platzhalter:** keine — jeder Code-Schritt zeigt vollständigen Code und exakte Befehle.
- **Typ-Konsistenz:** `trend`-Literale identisch in `model.py`, Zod (`z.enum`), TS (`ProtokollEntry.trend`); `DayIndex`-Felder identisch in `model.py`, `compute_index`, Zod, `ProtokollIndex`; `WORSE_DIRECTION`-Keys = die 8 indexfähigen `top_id`s aus `agenda.ts`.
