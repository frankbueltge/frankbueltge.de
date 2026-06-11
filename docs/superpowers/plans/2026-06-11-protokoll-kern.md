# „Das Protokoll" — Kern: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nächtliche Pipeline, die das Sitzungsprotokoll der Welt als kanonisches JSON ins Repo committet, plus Astro-Rendering (DE/EN), Archiv, RSS und Methodenblatt.

**Architecture:** Python-Pipeline (`pipelines/protokoll/`, Cloud Run Job) holt 13 Messwerte aus 12 TOPs, validiert (Korridor/Staleness), schreibt `src/content/protokoll/<jahr>/<datum>.json` per GitHub-API-Commit → Pages-Rebuild. Astro rendert die Prosa deterministisch zur Buildzeit aus JSON + versionierten Templates (kein LLM). Git ist das Archiv; die Site liest nie aus Cloud-Diensten.

**Tech Stack:** Python 3.12, httpx, pytest, google-cloud-bigquery (nur GDELT-Adapter); Astro 5, zod-Content-Collection, Vitest, @astrojs/rss; GCP: Cloud Run Jobs, Cloud Scheduler, Secret Manager, BigQuery Public Datasets.

**Spec:** `docs/superpowers/specs/2026-06-11-werkgruppe-design.md` §4. Präzisierungen gegenüber der Spec (innerhalb §12 „Offene Punkte"):
1. JSON trägt `schema_version` + `pipeline_version`; die `templateVersion` gehört dem TS-Renderer und wird auf jeder Seite ausgewiesen (Prosa = Darstellung).
2. TOP Ozean: absolute SST mit Vorjahrestag-Vergleich statt „Anomalie" (Quelle liefert Absolutwerte; Baseline-Wahl wäre eine versteckte Behauptung). Quelle: NOAA OISST v2.1 via Climate Reanalyzer (Univ. of Maine) — im Methodenblatt ausgewiesen.
3. TOP Vertreibung (UNHCR) + Ernährung (FAO): manuell nachgeführte, versionierte Datendateien statt fragiler APIs — Kadenz-ehrlich ausgewiesen („Stand: …"). Automatisierung später möglich.
4. TOP Aufmerksamkeit: englischsprachige Wikipedia als Proxy globaler Aufmerksamkeit — Grenze im Methodenblatt.

**Branch:** Ausführung auf `feat/protokoll` (am Ende Merge-Entscheidung via superpowers:finishing-a-development-branch).

**Secrets/Keys (einmalig, menschlicher Schritt):** FIRMS MAP_KEY (https://firms.modaps.eosdis.nasa.gov/api/, kostenlos), EIA API Key (https://www.eia.gov/opendata/, kostenlos), GitHub Fine-Grained PAT (nur dieses Repo, Contents: Read/Write).

---

## Teil A — Pipeline (Python)

### Dateistruktur Teil A

```
pipelines/protokoll/
  pyproject.toml
  Dockerfile                      # Task 13
  README.md                       # Task 13 (Deploy-Runbook)
  src/protokoll/
    __init__.py
    model.py                      # Datenmodell + JSON-Serialisierung
    validate.py                   # Korridor + Staleness
    fetch.py                      # HTTP mit Retry/Backoff
    assemble.py                   # Adapter-Isolation → DayRecord
    github_commit.py              # Commit via GitHub Contents API
    run.py                        # CLI (--date, --dry-run, --repo-root)
    data/
      refugees.json               # manuell nachgeführt (UNHCR)
      food.json                   # manuell nachgeführt (FAO FPI)
    adapters/
      __init__.py                 # ALL_SPECS Registry
      base.py                     # AdapterSpec, Context, Measurement
      co2.py seaice.py sst.py fires.py quakes.py population.py
      refugees.py food.py rates.py oil.py conflict.py attention.py
  tests/
    fixtures/                     # echte, gekürzte Beispiel-Antworten
    test_model.py test_validate.py test_fetch.py test_assemble.py
    test_adapters_climate.py test_adapters_events.py
    test_adapters_economy.py test_adapters_manual.py
    test_adapter_conflict.py test_github_commit.py test_run.py
```

Alle Befehle in Teil A laufen aus `pipelines/protokoll/` mit aktivierter venv.

---

### Task 1: Python-Scaffold

**Files:**
- Create: `pipelines/protokoll/pyproject.toml`
- Create: `pipelines/protokoll/src/protokoll/__init__.py`
- Create: `pipelines/protokoll/tests/test_smoke.py`

- [ ] **Step 1: pyproject.toml schreiben**

```toml
[project]
name = "protokoll"
version = "0.1.0"
description = "Nightly pipeline: the minutes of the world (frankbueltge.de)"
requires-python = ">=3.12"
dependencies = ["httpx>=0.27"]

[project.optional-dependencies]
dev = ["pytest>=8"]
bq = ["google-cloud-bigquery>=3.25"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools]
package-dir = { "" = "src" }

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
protokoll = ["data/*.json"]

[tool.pytest.ini_options]
testpaths = ["tests"]
```

- [ ] **Step 2: Paket + Smoke-Test anlegen**

`src/protokoll/__init__.py`:
```python
PIPELINE_VERSION = "0.1.0"
```

`tests/test_smoke.py`:
```python
from protokoll import PIPELINE_VERSION


def test_version():
    assert PIPELINE_VERSION == "0.1.0"
```

- [ ] **Step 3: venv + Install + Test**

Run:
```bash
cd pipelines/protokoll
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest -q
```
Expected: `1 passed`

- [ ] **Step 4: Commit**

```bash
git add pipelines/protokoll
git commit -m "feat(protokoll): python scaffold for pipeline"
```

---

### Task 2: Datenmodell (`model.py`)

**Files:**
- Create: `pipelines/protokoll/src/protokoll/model.py`
- Test: `pipelines/protokoll/tests/test_model.py`

- [ ] **Step 1: Failing Test schreiben**

```python
import json
from protokoll.model import (
    Comparison, DayRecord, Entry, Measurement, SourceMeta, day_record_to_json,
)

SRC = SourceMeta(name="NOAA GML", url="https://gml.noaa.gov", license="Public Domain (U.S. Government)")


def make_entry(**kw):
    base = dict(
        top_id="co2", status="ok", unit="ppm", cadence="daily", source=SRC,
        retrieved_at="2026-06-12T03:30:00Z", value=427.3, as_of="2026-06-10",
        comparison=Comparison(label="prev_year_day", value=424.5),
        label=None, record=True, note=None,
    )
    base.update(kw)
    return Entry(**base)


def test_day_record_serializes_to_stable_json():
    record = DayRecord(
        date="2026-06-12", generated_at="2026-06-12T03:30:00Z",
        schema_version="1", pipeline_version="0.1.0", entries=[make_entry()],
    )
    payload = day_record_to_json(record)
    data = json.loads(payload)
    assert data["date"] == "2026-06-12"
    assert data["entries"][0]["comparison"] == {"label": "prev_year_day", "value": 424.5}
    assert data["entries"][0]["record"] is True
    assert payload.endswith("\n")
    # deterministisch: sortierte Keys
    assert payload == day_record_to_json(record)


def test_entry_without_value_serializes_nulls():
    e = make_entry(status="unavailable", value=None, as_of=None, comparison=None,
                   record=False, note="HTTPError: 503")
    d = json.loads(day_record_to_json(DayRecord(
        date="2026-06-12", generated_at="x", schema_version="1",
        pipeline_version="0.1.0", entries=[e])))
    assert d["entries"][0]["value"] is None
    assert d["entries"][0]["comparison"] is None
    assert d["entries"][0]["note"] == "HTTPError: 503"


def test_measurement_defaults():
    m = Measurement(value=1.0, as_of="2026-06-11")
    assert m.comparison is None and m.label is None and m.record is False
```

- [ ] **Step 2: Test läuft rot**

Run: `pytest tests/test_model.py -q`
Expected: FAIL (`ModuleNotFoundError: protokoll.model`)

- [ ] **Step 3: Implementierung**

```python
"""Kanonisches Datenmodell. JSON ist das Archiv; Prosa entsteht erst im Frontend."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Literal

SCHEMA_VERSION = "1"

Status = Literal["ok", "unavailable", "implausible"]


@dataclass(frozen=True)
class SourceMeta:
    name: str
    url: str
    license: str


@dataclass(frozen=True)
class Comparison:
    label: Literal["prev_day", "prev_month", "prev_year_day"]
    value: float


@dataclass(frozen=True)
class Measurement:
    """Rohergebnis eines Adapters, vor Validierung."""
    value: float
    as_of: str  # ISO-Datum, auf das sich die Messung bezieht
    comparison: Comparison | None = None
    label: str | None = None  # z. B. Wikipedia-Artikeltitel
    record: bool = False  # Höchststand seit Aufzeichnungsbeginn


@dataclass(frozen=True)
class Entry:
    top_id: str
    status: Status
    unit: str
    cadence: str
    source: SourceMeta
    retrieved_at: str
    value: float | None = None
    as_of: str | None = None
    comparison: Comparison | None = None
    label: str | None = None
    record: bool = False
    note: str | None = None


@dataclass(frozen=True)
class DayRecord:
    date: str
    generated_at: str
    schema_version: str
    pipeline_version: str
    entries: list[Entry]


def day_record_to_json(record: DayRecord) -> str:
    return json.dumps(asdict(record), ensure_ascii=False, indent=2, sort_keys=True) + "\n"
```

- [ ] **Step 4: Test läuft grün**

Run: `pytest tests/test_model.py -q`
Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/model.py pipelines/protokoll/tests/test_model.py
git commit -m "feat(protokoll): canonical day-record data model"
```

---

### Task 3: Validierung (`validate.py`)

**Files:**
- Create: `pipelines/protokoll/src/protokoll/validate.py`
- Test: `pipelines/protokoll/tests/test_validate.py`

- [ ] **Step 1: Failing Test**

```python
from datetime import date

from protokoll.validate import corridor_status, is_stale


def test_corridor_ok_inside_and_on_bounds():
    assert corridor_status(427.3, (350, 500)) == "ok"
    assert corridor_status(350.0, (350, 500)) == "ok"
    assert corridor_status(500.0, (350, 500)) == "ok"


def test_corridor_implausible_outside():
    assert corridor_status(8000.0, (350, 500)) == "implausible"
    assert corridor_status(-3.0, (0, 200)) == "implausible"


def test_corridor_none_means_no_check():
    assert corridor_status(123.0, None) == "ok"


def test_staleness():
    today = date(2026, 6, 12)
    assert is_stale("2026-06-01", today, max_age_days=7) is True
    assert is_stale("2026-06-10", today, max_age_days=7) is False
    assert is_stale("2020-01-01", today, max_age_days=None) is False  # kein Limit
```

- [ ] **Step 2: Rot**

Run: `pytest tests/test_validate.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

```python
"""Plausibilitätskorridor + Staleness. Messausfall ist Form, nie stille Lücke."""
from __future__ import annotations

from datetime import date


def corridor_status(value: float, corridor: tuple[float, float] | None) -> str:
    if corridor is None:
        return "ok"
    lo, hi = corridor
    return "ok" if lo <= value <= hi else "implausible"


def is_stale(as_of: str, today: date, max_age_days: int | None) -> bool:
    if max_age_days is None:
        return False
    measured = date.fromisoformat(as_of)
    return (today - measured).days > max_age_days
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_validate.py -q` — Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/validate.py pipelines/protokoll/tests/test_validate.py
git commit -m "feat(protokoll): plausibility corridor and staleness gates"
```

---

### Task 4: HTTP-Fetch mit Retry (`fetch.py`)

**Files:**
- Create: `pipelines/protokoll/src/protokoll/fetch.py`
- Test: `pipelines/protokoll/tests/test_fetch.py`

- [ ] **Step 1: Failing Test**

```python
import httpx
import pytest

import protokoll.fetch as fetch_mod
from protokoll.fetch import SourceUnavailable, fetch


def make_client(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_fetch_returns_text_on_success():
    client = make_client(lambda req: httpx.Response(200, text="a,b,c"))
    assert fetch("https://example.org/x.csv", client=client) == "a,b,c"


def test_fetch_json():
    client = make_client(lambda req: httpx.Response(200, json={"k": 1}))
    assert fetch("https://example.org/x", client=client, expect="json") == {"k": 1}


def test_fetch_retries_then_succeeds(monkeypatch):
    monkeypatch.setattr(fetch_mod.time, "sleep", lambda s: None)
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(503) if calls["n"] < 3 else httpx.Response(200, text="ok")

    assert fetch("https://example.org", client=make_client(handler)) == "ok"
    assert calls["n"] == 3


def test_fetch_raises_after_all_retries(monkeypatch):
    monkeypatch.setattr(fetch_mod.time, "sleep", lambda s: None)
    calls = {"n": 0}

    def handler(req):
        calls["n"] += 1
        return httpx.Response(500)

    with pytest.raises(SourceUnavailable):
        fetch("https://example.org", client=make_client(handler))
    assert calls["n"] == 4  # 1 Versuch + 3 Retries
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_fetch.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

```python
"""HTTP-Zugriff: 3x Retry mit Backoff. Danach SourceUnavailable → 'Feststellung entfällt'."""
from __future__ import annotations

import time
from typing import Any, Literal

import httpx

RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 30.0


class SourceUnavailable(Exception):
    pass


def fetch(url: str, *, client: httpx.Client,
          expect: Literal["text", "json"] = "text") -> Any:
    last: Exception | None = None
    for delay in (0.0, *RETRY_DELAYS):
        if delay:
            time.sleep(delay)
        try:
            r = client.get(url, timeout=TIMEOUT, follow_redirects=True)
            r.raise_for_status()
            return r.json() if expect == "json" else r.text
        except httpx.HTTPError as exc:
            last = exc
    raise SourceUnavailable(f"{url}: {type(last).__name__}: {last}")
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_fetch.py -q` — Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/fetch.py pipelines/protokoll/tests/test_fetch.py
git commit -m "feat(protokoll): http fetch with retry/backoff"
```

---

### Task 5: Adapter-Basis + Assembler (`adapters/base.py`, `assemble.py`)

**Files:**
- Create: `pipelines/protokoll/src/protokoll/adapters/__init__.py` (leer, Registry kommt in Task 11)
- Create: `pipelines/protokoll/src/protokoll/adapters/base.py`
- Create: `pipelines/protokoll/src/protokoll/assemble.py`
- Test: `pipelines/protokoll/tests/test_assemble.py`

- [ ] **Step 1: Failing Test**

```python
from datetime import date

import httpx

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.assemble import assemble
from protokoll.model import Measurement, SourceMeta

SRC = SourceMeta(name="Test", url="https://example.org", license="PD")


def ctx():
    return Context(client=httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(500))), today=date(2026, 6, 12), env={})


def spec(top_id, measure, corridor=None, max_age_days=None):
    return AdapterSpec(top_id=top_id, unit="u", cadence="daily",
                       corridor=corridor, max_age_days=max_age_days,
                       source=SRC, measure=measure)


def test_assemble_ok_implausible_unavailable_and_stale():
    specs = [
        spec("a", lambda c: Measurement(value=5.0, as_of="2026-06-11"), corridor=(0, 10)),
        spec("b", lambda c: Measurement(value=99.0, as_of="2026-06-11"), corridor=(0, 10)),
        spec("c", lambda c: (_ for _ in ()).throw(RuntimeError("boom"))),
        spec("d", lambda c: Measurement(value=5.0, as_of="2026-01-01"),
             corridor=(0, 10), max_age_days=7),
    ]
    record = assemble(specs, ctx(), "2026-06-12")
    by_id = {e.top_id: e for e in record.entries}
    assert by_id["a"].status == "ok" and by_id["a"].value == 5.0
    assert by_id["b"].status == "implausible" and by_id["b"].value == 99.0
    assert by_id["c"].status == "unavailable" and "boom" in by_id["c"].note
    assert by_id["c"].value is None
    assert by_id["d"].status == "unavailable" and "stale" in by_id["d"].note
    assert record.date == "2026-06-12"
    assert record.schema_version == "1" and record.pipeline_version == "0.1.0"
    assert len(record.entries) == 4  # Reihenfolge = Spec-Reihenfolge


def test_assemble_keeps_measurement_extras():
    m = Measurement(value=1.0, as_of="2026-06-11", label="Titel", record=True)
    record = assemble([spec("a", lambda c: m)], ctx(), "2026-06-12")
    e = record.entries[0]
    assert e.label == "Titel" and e.record is True and e.as_of == "2026-06-11"
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_assemble.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

`adapters/base.py`:
```python
"""Adapter-Vertrag: ein Spec pro Messwert. measure() liefert Measurement oder wirft."""
from __future__ import annotations

from collections.abc import Callable, Mapping
from dataclasses import dataclass
from datetime import date
from typing import Any

import httpx

from protokoll.model import Measurement, SourceMeta


@dataclass(frozen=True)
class Context:
    client: httpx.Client
    today: date
    env: Mapping[str, str]
    bq_client_factory: Callable[[], Any] | None = None


@dataclass(frozen=True)
class AdapterSpec:
    top_id: str
    unit: str
    cadence: str  # daily | realtime | monthly | periodic | computed
    corridor: tuple[float, float] | None
    max_age_days: int | None
    source: SourceMeta
    measure: Callable[[Context], Measurement]
```

`assemble.py`:
```python
"""Führt alle Adapter isoliert aus. Ein Ausfall kippt nie den Lauf — er wird Form."""
from __future__ import annotations

from datetime import datetime, timezone

from protokoll import PIPELINE_VERSION
from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import SCHEMA_VERSION, DayRecord, Entry
from protokoll.validate import corridor_status, is_stale


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def build_entry(spec: AdapterSpec, ctx: Context) -> Entry:
    retrieved_at = _now_iso()
    common = dict(top_id=spec.top_id, unit=spec.unit, cadence=spec.cadence,
                  source=spec.source, retrieved_at=retrieved_at)
    try:
        m = spec.measure(ctx)
    except Exception as exc:  # Isolation: jeder Fehler wird amtlicher Vermerk
        return Entry(status="unavailable", note=f"{type(exc).__name__}: {exc}"[:200], **common)
    if is_stale(m.as_of, ctx.today, spec.max_age_days):
        return Entry(status="unavailable", note=f"stale: as_of={m.as_of}", **common)
    status = corridor_status(m.value, spec.corridor)
    return Entry(status=status, value=m.value, as_of=m.as_of, comparison=m.comparison,
                 label=m.label, record=m.record, **common)


def assemble(specs: list[AdapterSpec], ctx: Context, date_iso: str) -> DayRecord:
    return DayRecord(
        date=date_iso, generated_at=_now_iso(), schema_version=SCHEMA_VERSION,
        pipeline_version=PIPELINE_VERSION, entries=[build_entry(s, ctx) for s in specs],
    )
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_assemble.py -q` — Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters pipelines/protokoll/src/protokoll/assemble.py pipelines/protokoll/tests/test_assemble.py
git commit -m "feat(protokoll): adapter contract and fault-isolating assembler"
```

---

### Task 6: Klima-Adapter — CO₂, SST, Meereis

**Files:**
- Create: `pipelines/protokoll/src/protokoll/adapters/co2.py`, `sst.py`, `seaice.py`
- Create: `pipelines/protokoll/tests/fixtures/co2_trend_gl.csv`, `sst_world.json`, `n_seaice.csv`, `s_seaice.csv`
- Test: `pipelines/protokoll/tests/test_adapters_climate.py`

- [ ] **Step 1: Fixtures anlegen (gekürzte echte Formate)**

`tests/fixtures/co2_trend_gl.csv`:
```
# CO2 expressed as a mole fraction in dry air, micromol/mol, abbreviated as ppm
year,month,day,smoothed,trend
2025,6,10,424.91,424.52
2025,6,11,424.93,424.53
2026,6,9,427.55,427.18
2026,6,10,427.61,427.30
```

`tests/fixtures/sst_world.json`:
```json
[
  {"name": "2025", "data": [20.8, 20.9, 21.0]},
  {"name": "2026", "data": [20.9, 21.1, null]},
  {"name": "1982-2011 mean", "data": [20.1, 20.2, 20.2]}
]
```

`tests/fixtures/n_seaice.csv`:
```
Year, Month, Day,     Extent,    Missing, Source Data
2025,    06,  10,     11.013,      0.000, NSIDC
2026,    06,  09,     10.711,      0.000, NSIDC
2026,    06,  10,     10.689,      0.000, NSIDC
```

`tests/fixtures/s_seaice.csv`:
```
Year, Month, Day,     Extent,    Missing, Source Data
2025,    06,  10,     13.502,      0.000, NSIDC
2026,    06,  10,     13.118,      0.000, NSIDC
```

- [ ] **Step 2: Failing Tests**

```python
from datetime import date
from pathlib import Path

import httpx

from protokoll.adapters import co2, seaice, sst
from protokoll.adapters.base import Context

FIX = Path(__file__).parent / "fixtures"


def ctx_for(body: str, *, json_body: bool = False, today=date(2026, 6, 12)):
    def handler(req):
        if json_body:
            return httpx.Response(200, text=body, headers={"content-type": "application/json"})
        return httpx.Response(200, text=body)
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=today, env={})


def test_co2_latest_trend_with_prev_year_and_record():
    m = co2.measure(ctx_for((FIX / "co2_trend_gl.csv").read_text()))
    assert m.value == 427.30
    assert m.as_of == "2026-06-10"
    assert m.comparison.label == "prev_year_day" and m.comparison.value == 424.52
    assert m.record is True  # 427.30 > alle früheren Trendwerte


def test_sst_latest_non_null_with_prev_year_and_record():
    m = sst.measure(ctx_for((FIX / "sst_world.json").read_text(), json_body=True))
    assert m.value == 21.1          # Index 1 = letzter Nicht-null-Wert 2026
    assert m.as_of == "2026-01-02"  # Tag-des-Jahres 2
    assert m.comparison.label == "prev_year_day" and m.comparison.value == 20.9
    assert m.record is True         # 21.1 > 20.9 (2025, gleicher Tagesindex; "mean"-Serie zählt nicht)


def test_seaice_north_and_south():
    mn = seaice.measure_north(ctx_for((FIX / "n_seaice.csv").read_text()))
    assert mn.value == 10.689 and mn.as_of == "2026-06-10"
    assert mn.comparison.label == "prev_year_day" and mn.comparison.value == 11.013
    ms = seaice.measure_south(ctx_for((FIX / "s_seaice.csv").read_text()))
    assert ms.value == 13.118 and ms.comparison.value == 13.502


def test_specs_metadata():
    assert co2.SPEC.top_id == "co2" and co2.SPEC.corridor == (350, 500)
    assert sst.SPEC.unit == "°C"
    assert seaice.SPEC_NORTH.top_id == "seaice_north"
    assert seaice.SPEC_SOUTH.top_id == "seaice_south"
```

- [ ] **Step 3: Rot** — Run: `pytest tests/test_adapters_climate.py -q` — Expected: FAIL (import error)

- [ ] **Step 4: Implementierung**

`adapters/co2.py`:
```python
"""TOP Atmosphäre — NOAA GML, globaler CO2-Trend (deseasonalisiert), täglich."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_gl.csv"


def _rows(text: str) -> list[tuple[date, float]]:
    out: list[tuple[date, float]] = []
    for line in text.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 5 or not parts[0].isdigit():
            continue  # Kommentare/Header
        out.append((date(int(parts[0]), int(parts[1]), int(parts[2])), float(parts[4])))
    return out


def _prev_year_value(rows: list[tuple[date, float]], d: date) -> float | None:
    target = d.replace(year=d.year - 1) if not (d.month == 2 and d.day == 29) \
        else d.replace(year=d.year - 1, day=28)
    by_date = dict(rows)
    for delta in (0, 1, -1, 2, -2):  # Quelle hat gelegentlich Lücken
        v = by_date.get(target + timedelta(days=delta))
        if v is not None:
            return v
    return None


def measure(ctx: Context) -> Measurement:
    rows = _rows(fetch(URL, client=ctx.client))
    d, value = rows[-1]
    prev = _prev_year_value(rows, d)
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    record = all(value > v for dd, v in rows if dd < d)
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison, record=record)


SPEC = AdapterSpec(
    top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500), max_age_days=14,
    source=SourceMeta(name="NOAA Global Monitoring Laboratory (Mauna Loa)",
                      url=URL, license="Public Domain (U.S. Government)"),
    measure=measure,
)
```

`adapters/sst.py`:
```python
"""TOP Ozean — globale Meeresoberflächentemperatur (NOAA OISST v2.1 via Climate Reanalyzer)."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = "https://climatereanalyzer.org/clim/sst_daily/json/oisst2.1_world2_sst_day.json"


def measure(ctx: Context) -> Measurement:
    data = fetch(URL, client=ctx.client, expect="json")
    years = {s["name"]: s["data"] for s in data if str(s["name"]).isdigit()}
    cur = years[str(ctx.today.year)]
    idx = max(i for i, v in enumerate(cur) if v is not None)
    value = float(cur[idx])
    as_of = (date(ctx.today.year, 1, 1) + timedelta(days=idx)).isoformat()
    prev_series = years.get(str(ctx.today.year - 1))
    comparison = None
    if prev_series and idx < len(prev_series) and prev_series[idx] is not None:
        comparison = Comparison(label="prev_year_day", value=float(prev_series[idx]))
    others = [s[idx] for y, s in years.items()
              if y != str(ctx.today.year) and idx < len(s) and s[idx] is not None]
    record = bool(others) and value > max(others)
    return Measurement(value=value, as_of=as_of, comparison=comparison, record=record)


SPEC = AdapterSpec(
    top_id="sst", unit="°C", cadence="daily", corridor=(15, 25), max_age_days=14,
    source=SourceMeta(name="NOAA OISST v2.1 (via Climate Reanalyzer, University of Maine)",
                      url=URL, license="NOAA: Public Domain; Aufbereitung: Climate Reanalyzer"),
    measure=measure,
)
```

`adapters/seaice.py`:
```python
"""TOP Meereis — NSIDC Sea Ice Index v3, tägliche Ausdehnung Arktis/Antarktis."""
from __future__ import annotations

from datetime import date, timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL_N = "https://noaadata.apps.nsidc.org/NOAA/G02135/north/daily/data/N_seaice_extent_daily_v3.0.csv"
URL_S = "https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/data/S_seaice_extent_daily_v3.0.csv"


def _rows(text: str) -> list[tuple[date, float]]:
    out: list[tuple[date, float]] = []
    for line in text.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 4 or not parts[0].isdigit():
            continue
        out.append((date(int(parts[0]), int(parts[1]), int(parts[2])), float(parts[3])))
    return out


def _measure(url: str, ctx: Context) -> Measurement:
    rows = _rows(fetch(url, client=ctx.client))
    d, value = rows[-1]
    target = d.replace(year=d.year - 1) if not (d.month == 2 and d.day == 29) \
        else d.replace(year=d.year - 1, day=28)
    by_date = dict(rows)
    prev = None
    for delta in (0, 1, -1, 2, -2):
        prev = by_date.get(target + timedelta(days=delta))
        if prev is not None:
            break
    comparison = Comparison(label="prev_year_day", value=prev) if prev is not None else None
    return Measurement(value=value, as_of=d.isoformat(), comparison=comparison)


def measure_north(ctx: Context) -> Measurement:
    return _measure(URL_N, ctx)


def measure_south(ctx: Context) -> Measurement:
    return _measure(URL_S, ctx)


_NSIDC = "NSIDC Sea Ice Index v3 (NOAA@NSIDC)"
_LICENSE = "NOAA/NSIDC: frei nutzbar mit Quellenangabe"

SPEC_NORTH = AdapterSpec(top_id="seaice_north", unit="Mio. km²", cadence="daily",
                         corridor=(1, 18), max_age_days=14,
                         source=SourceMeta(name=_NSIDC, url=URL_N, license=_LICENSE),
                         measure=measure_north)
SPEC_SOUTH = AdapterSpec(top_id="seaice_south", unit="Mio. km²", cadence="daily",
                         corridor=(1, 22), max_age_days=14,
                         source=SourceMeta(name=_NSIDC, url=URL_S, license=_LICENSE),
                         measure=measure_south)
```

- [ ] **Step 5: Grün** — Run: `pytest tests/test_adapters_climate.py -q` — Expected: `4 passed`

- [ ] **Step 6: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters pipelines/protokoll/tests
git commit -m "feat(protokoll): climate adapters (co2, sst, sea ice)"
```

---

### Task 7: Ereignis-Adapter — Erdbeben, Feuer, Aufmerksamkeit

**Files:**
- Create: `pipelines/protokoll/src/protokoll/adapters/quakes.py`, `fires.py`, `attention.py`
- Test: `pipelines/protokoll/tests/test_adapters_events.py`

- [ ] **Step 1: Failing Tests**

```python
import json
from datetime import date

import httpx
import pytest

from protokoll.adapters import attention, fires, quakes
from protokoll.adapters.base import Context
from protokoll.fetch import SourceUnavailable


def ctx_for(handler, env=None, today=date(2026, 6, 12)):
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=today, env=env or {})


def test_quakes_counts_from_metadata():
    body = json.dumps({"metadata": {"count": 31}, "features": []})
    m = quakes.measure(ctx_for(lambda req: httpx.Response(200, text=body,
                                headers={"content-type": "application/json"})))
    assert m.value == 31 and m.as_of == "2026-06-12"


def test_fires_counts_csv_rows_and_uses_key():
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        return httpx.Response(200, text="latitude,longitude,confidence\n1,2,h\n3,4,n\n")

    m = fires.measure(ctx_for(handler, env={"FIRMS_MAP_KEY": "K123"}))
    assert m.value == 2
    assert "K123" in seen["url"] and "VIIRS_SNPP_NRT" in seen["url"]


def test_fires_without_key_is_unavailable():
    with pytest.raises(SourceUnavailable):
        fires.measure(ctx_for(lambda req: httpx.Response(200, text=""), env={}))


def test_attention_top_article_skips_meta_pages():
    body = json.dumps({"items": [{"articles": [
        {"article": "Main_Page", "views": 5_000_000},
        {"article": "Special:Search", "views": 1_200_000},
        {"article": "Deep_sea_mining", "views": 812_345},
    ]}]})

    def handler(req):
        assert "/2026/06/11" in str(req.url)  # gestern
        return httpx.Response(200, text=body, headers={"content-type": "application/json"})

    m = attention.measure(ctx_for(handler))
    assert m.label == "Deep sea mining" and m.value == 812_345
    assert m.as_of == "2026-06-11"
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_adapters_events.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

`adapters/quakes.py`:
```python
"""TOP Erdbewegung — USGS, Beben >= M4.5 der letzten 24 h."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Measurement, SourceMeta

URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"


def measure(ctx: Context) -> Measurement:
    data = fetch(URL, client=ctx.client, expect="json")
    return Measurement(value=float(data["metadata"]["count"]), as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="quakes", unit="Beben", cadence="realtime", corridor=(0, 200), max_age_days=None,
    source=SourceMeta(name="USGS Earthquake Hazards Program", url=URL,
                      license="Public Domain (U.S. Government)"),
    measure=measure,
)
```

`adapters/fires.py`:
```python
"""TOP Feuer — NASA FIRMS, aktive Branddetektionen (VIIRS S-NPP), letzte 24 h."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable, fetch
from protokoll.model import Measurement, SourceMeta

BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"


def measure(ctx: Context) -> Measurement:
    key = ctx.env.get("FIRMS_MAP_KEY")
    if not key:
        raise SourceUnavailable("FIRMS_MAP_KEY nicht gesetzt")
    text = fetch(f"{BASE}/{key}/VIIRS_SNPP_NRT/world/1", client=ctx.client)
    count = max(0, len([l for l in text.splitlines() if l.strip()]) - 1)  # minus Header
    return Measurement(value=float(count), as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="fires", unit="Detektionen", cadence="daily", corridor=(0, 500_000), max_age_days=None,
    source=SourceMeta(name="NASA FIRMS (VIIRS S-NPP, Near-Real-Time)",
                      url="https://firms.modaps.eosdis.nasa.gov/",
                      license="NASA: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
```

`adapters/attention.py`:
```python
"""TOP Aufmerksamkeit — meistgelesener Artikel der engl. Wikipedia (Proxy, s. Methodenblatt)."""
from __future__ import annotations

from datetime import timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Measurement, SourceMeta

BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access"
_SKIP_PREFIXES = ("Special:", "Wikipedia:", "Portal:", "File:", "Help:")


def measure(ctx: Context) -> Measurement:
    day = ctx.today - timedelta(days=1)  # Pageviews liegen erst am Folgetag vor
    url = f"{BASE}/{day.year}/{day.month:02d}/{day.day:02d}"
    data = fetch(url, client=ctx.client, expect="json")
    for art in data["items"][0]["articles"]:
        name = art["article"]
        if name == "Main_Page" or name.startswith(_SKIP_PREFIXES):
            continue
        return Measurement(value=float(art["views"]), as_of=day.isoformat(),
                           label=name.replace("_", " "))
    raise ValueError("keine reguläre Seite in Top-Liste")


SPEC = AdapterSpec(
    top_id="attention", unit="Aufrufe", cadence="daily",
    corridor=(100_000, 100_000_000), max_age_days=3,
    source=SourceMeta(name="Wikimedia Pageviews API (en.wikipedia.org)",
                      url="https://wikimedia.org/api/rest_v1/",
                      license="CC0 (Messdaten)"),
    measure=measure,
)
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_adapters_events.py -q` — Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters pipelines/protokoll/tests/test_adapters_events.py
git commit -m "feat(protokoll): event adapters (quakes, fires, attention)"
```

---

### Task 8: Ökonomie-Adapter — €STR, Brent

**Files:**
- Create: `pipelines/protokoll/src/protokoll/adapters/rates.py`, `oil.py`
- Test: `pipelines/protokoll/tests/test_adapters_economy.py`

- [ ] **Step 1: Failing Tests**

```python
import json
from datetime import date

import httpx

from protokoll.adapters import oil, rates
from protokoll.adapters.base import Context


def ctx_for(handler, env=None):
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=date(2026, 6, 12), env=env or {})


ECB_CSV = (
    "KEY,FREQ,TIME_PERIOD,OBS_VALUE\n"
    "EST.B.EU000A2X2A25.WT,B,2026-06-10,1.92\n"
    "EST.B.EU000A2X2A25.WT,B,2026-06-11,1.93\n"
)


def test_estr_latest_with_prev_day():
    m = rates.measure(ctx_for(lambda req: httpx.Response(200, text=ECB_CSV)))
    assert m.value == 1.93 and m.as_of == "2026-06-11"
    assert m.comparison.label == "prev_day" and m.comparison.value == 1.92


EIA_JSON = json.dumps({"response": {"data": [
    {"period": "2026-06-11", "value": 71.4},
    {"period": "2026-06-10", "value": 70.9},
]}})


def test_brent_latest_with_prev_day_and_key():
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        return httpx.Response(200, text=EIA_JSON,
                              headers={"content-type": "application/json"})

    m = oil.measure(ctx_for(handler, env={"EIA_API_KEY": "K9"}))
    assert m.value == 71.4 and m.as_of == "2026-06-11"
    assert m.comparison.value == 70.9
    assert "api_key=K9" in seen["url"] and "RBRTE" in seen["url"]
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_adapters_economy.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

`adapters/rates.py`:
```python
"""TOP Geldpreis — Euro Short-Term Rate (€STR), EZB-Datenportal (SDMX-CSV)."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = ("https://data-api.ecb.europa.eu/service/data/EST/B.EU000A2X2A25.WT"
       "?lastNObservations=2&format=csvdata")


def measure(ctx: Context) -> Measurement:
    lines = [l for l in fetch(URL, client=ctx.client).splitlines() if l.strip()]
    header = [h.strip() for h in lines[0].split(",")]
    i_time, i_val = header.index("TIME_PERIOD"), header.index("OBS_VALUE")
    rows = [(p[i_time], float(p[i_val]))
            for p in ([c.strip() for c in l.split(",")] for l in lines[1:])]
    rows.sort()
    as_of, value = rows[-1]
    comparison = Comparison(label="prev_day", value=rows[-2][1]) if len(rows) > 1 else None
    return Measurement(value=value, as_of=as_of, comparison=comparison)


SPEC = AdapterSpec(
    top_id="rates", unit="%", cadence="daily", corridor=(-1, 8), max_age_days=7,
    source=SourceMeta(name="Europäische Zentralbank, €STR", url=URL,
                      license="EZB: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
```

`adapters/oil.py`:
```python
"""TOP Energie — Brent-Spotpreis, U.S. EIA Open Data v2."""
from __future__ import annotations

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable, fetch
from protokoll.model import Comparison, Measurement, SourceMeta

BASE = ("https://api.eia.gov/v2/petroleum/pri/spt/data/"
        "?frequency=daily&data[0]=value&facets[series][]=RBRTE"
        "&sort[0][column]=period&sort[0][direction]=desc&length=2")


def measure(ctx: Context) -> Measurement:
    key = ctx.env.get("EIA_API_KEY")
    if not key:
        raise SourceUnavailable("EIA_API_KEY nicht gesetzt")
    data = fetch(f"{BASE}&api_key={key}", client=ctx.client, expect="json")
    rows = data["response"]["data"]
    latest = rows[0]
    comparison = (Comparison(label="prev_day", value=float(rows[1]["value"]))
                  if len(rows) > 1 else None)
    return Measurement(value=float(latest["value"]), as_of=latest["period"],
                       comparison=comparison)


SPEC = AdapterSpec(
    top_id="oil", unit="USD/Barrel", cadence="daily", corridor=(20, 200), max_age_days=7,
    source=SourceMeta(name="U.S. Energy Information Administration (Brent Spot)",
                      url="https://www.eia.gov/opendata/",
                      license="Public Domain (U.S. Government)"),
    measure=measure,
)
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_adapters_economy.py -q` — Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters pipelines/protokoll/tests/test_adapters_economy.py
git commit -m "feat(protokoll): economy adapters (ECB ESTR, EIA Brent)"
```

---

### Task 9: Berechnete & manuell nachgeführte Adapter — Anwesenheit, Vertreibung, Ernährung

**Files:**
- Create: `pipelines/protokoll/src/protokoll/adapters/population.py`, `refugees.py`, `food.py`
- Create: `pipelines/protokoll/src/protokoll/data/refugees.json`, `food.json`
- Test: `pipelines/protokoll/tests/test_adapters_manual.py`

- [ ] **Step 1: Datendateien anlegen**

`src/protokoll/data/refugees.json` — **Wert vor dem ersten echten Lauf gegen unhcr.org/global-trends prüfen und ggf. aktualisieren** (redaktionelle Pflege gehört zum Werk):
```json
{
  "value": 122600000,
  "as_of": "2024-12-31",
  "note": "UNHCR Global Trends; manuell nachgeführt bei Neuveröffentlichung"
}
```

`src/protokoll/data/food.json` — **Wert vor dem ersten echten Lauf gegen fao.org/worldfoodsituation prüfen**:
```json
{
  "value": 128.0,
  "as_of": "2026-05-31",
  "note": "FAO Food Price Index (2014-2016=100); monatlich manuell nachgeführt"
}
```

- [ ] **Step 2: Failing Tests**

```python
from datetime import date

import httpx

from protokoll.adapters import food, population, refugees
from protokoll.adapters.base import Context


def ctx(today=date(2026, 6, 12)):
    return Context(client=httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(500))), today=today, env={})


def test_population_extrapolates_from_reference():
    m = population.measure(ctx(today=population.REF_DATE))
    assert m.value == population.REF_POP
    m2 = population.measure(ctx(today=date(2025, 7, 11)))  # 10 Tage später
    assert m2.value == population.REF_POP + 10 * population.NET_PER_DAY
    assert m2.as_of == "2025-07-11"


def test_refugees_reads_bundled_data():
    m = refugees.measure(ctx())
    assert m.value == 122_600_000 and m.as_of == "2024-12-31"


def test_food_reads_bundled_data():
    m = food.measure(ctx())
    assert m.value == 128.0 and m.as_of == "2026-05-31"


def test_cadences_are_honest():
    assert population.SPEC.cadence == "computed"
    assert refugees.SPEC.cadence == "periodic"
    assert food.SPEC.cadence == "monthly"
```

- [ ] **Step 3: Rot** — Run: `pytest tests/test_adapters_manual.py -q` — Expected: FAIL (import error)

- [ ] **Step 4: Implementierung**

`adapters/population.py`:
```python
"""TOP Anwesenheit — Weltbevölkerung, lineare Extrapolation UN WPP 2024.
Referenz: UN DESA, World Population Prospects 2024 (Mitte 2025: 8,231 Mrd.;
Nettowachstum ~70 Mio./Jahr ≈ 191.000/Tag). Als Schätzung ausgewiesen."""
from __future__ import annotations

from datetime import date

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import Measurement, SourceMeta

REF_DATE = date(2025, 7, 1)
REF_POP = 8_231_000_000.0
NET_PER_DAY = 191_000.0


def measure(ctx: Context) -> Measurement:
    days = (ctx.today - REF_DATE).days
    return Measurement(value=REF_POP + days * NET_PER_DAY, as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="population", unit="Menschen", cadence="computed",
    corridor=(7.5e9, 9.5e9), max_age_days=None,
    source=SourceMeta(name="UN DESA, World Population Prospects 2024 (Extrapolation)",
                      url="https://population.un.org/wpp/",
                      license="CC BY 3.0 IGO"),
    measure=measure,
)
```

`adapters/refugees.py`:
```python
"""TOP Vertreibung — UNHCR Global Trends, manuell nachgeführte Datendatei (Kadenz-ehrlich)."""
from __future__ import annotations

import json
from importlib.resources import files

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import Measurement, SourceMeta


def measure(ctx: Context) -> Measurement:
    data = json.loads(files("protokoll.data").joinpath("refugees.json").read_text())
    return Measurement(value=float(data["value"]), as_of=data["as_of"])


SPEC = AdapterSpec(
    top_id="refugees", unit="Menschen", cadence="periodic",
    corridor=(5e7, 2e8), max_age_days=None,
    source=SourceMeta(name="UNHCR Global Trends",
                      url="https://www.unhcr.org/global-trends",
                      license="UNHCR: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
```

`adapters/food.py`:
```python
"""TOP Ernährung — FAO-Nahrungsmittelpreisindex, manuell nachgeführte Datendatei."""
from __future__ import annotations

import json
from importlib.resources import files

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import Measurement, SourceMeta


def measure(ctx: Context) -> Measurement:
    data = json.loads(files("protokoll.data").joinpath("food.json").read_text())
    return Measurement(value=float(data["value"]), as_of=data["as_of"])


SPEC = AdapterSpec(
    top_id="food", unit="Punkte", cadence="monthly",
    corridor=(80, 250), max_age_days=None,
    source=SourceMeta(name="FAO Food Price Index (2014–2016 = 100)",
                      url="https://www.fao.org/worldfoodsituation/foodpricesindex/en/",
                      license="FAO: frei nutzbar mit Quellenangabe (CC BY-NC-SA 3.0 IGO)"),
    measure=measure,
)
```

(`src/protokoll/data/` braucht keine `__init__.py` — `importlib.resources.files("protokoll.data")` funktioniert über das Package-Data-Mapping in `pyproject.toml`. Falls der Import scheitert: leere `src/protokoll/data/__init__.py` anlegen.)

- [ ] **Step 5: Grün** — Run: `pytest tests/test_adapters_manual.py -q` — Expected: `4 passed`

- [ ] **Step 6: Commit**

```bash
git add pipelines/protokoll/src/protokoll
git add pipelines/protokoll/tests/test_adapters_manual.py
git commit -m "feat(protokoll): population extrapolation + curated UNHCR/FAO data adapters"
```

---

### Task 10: Konflikt-Adapter (BigQuery/GDELT)

**Files:**
- Create: `pipelines/protokoll/src/protokoll/adapters/conflict.py`
- Test: `pipelines/protokoll/tests/test_adapter_conflict.py`

- [ ] **Step 1: Failing Test (Fake-Client, kein echtes GCP)**

```python
from datetime import date

import httpx
import pytest

from protokoll.adapters import conflict
from protokoll.adapters.base import Context
from protokoll.fetch import SourceUnavailable


class FakeJob:
    def result(self):
        return [{"events": 48_213}]


class FakeClient:
    def __init__(self):
        self.queries = []

    def query(self, sql, job_config=None):
        self.queries.append((sql, job_config))
        return FakeJob()


def ctx(factory):
    return Context(client=httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(500))), today=date(2026, 6, 12), env={},
        bq_client_factory=factory)


def test_conflict_counts_yesterday_partition():
    fake = FakeClient()
    m = conflict.measure(ctx(lambda: fake))
    assert m.value == 48_213
    assert m.as_of == "2026-06-11"  # Vortag = vollständiger Tag
    sql, job_config = fake.queries[0]
    assert "_PARTITIONTIME" in sql and "QuadClass IN (3, 4)" in sql
    assert job_config.query_parameters[0].value == "2026-06-11"


def test_conflict_without_factory_raises():
    with pytest.raises(SourceUnavailable):
        conflict.measure(ctx(None))
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_adapter_conflict.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

```python
"""TOP Konflikt — GDELT v2 Events (BigQuery Public Dataset), QuadClass 3+4
(verbaler/materieller Konflikt), Vortag. Partition-Filter ist Pflicht (Kosten)."""
from __future__ import annotations

from datetime import timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable
from protokoll.model import Measurement, SourceMeta

QUERY = """
SELECT COUNT(*) AS events
FROM `gdelt-bq.gdeltv2.events_partitioned`
WHERE _PARTITIONTIME >= TIMESTAMP(@day)
  AND _PARTITIONTIME < TIMESTAMP_ADD(TIMESTAMP(@day), INTERVAL 1 DAY)
  AND QuadClass IN (3, 4)
"""


def measure(ctx: Context) -> Measurement:
    if ctx.bq_client_factory is None:
        raise SourceUnavailable("BigQuery-Client nicht konfiguriert")
    from google.cloud import bigquery  # lazy: nur dieser Adapter braucht GCP

    client = ctx.bq_client_factory()
    day = (ctx.today - timedelta(days=1)).isoformat()
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("day", "DATE", day)])
    rows = list(client.query(QUERY, job_config=job_config).result())
    return Measurement(value=float(rows[0]["events"]), as_of=day)


SPEC = AdapterSpec(
    top_id="conflict", unit="Ereignisse", cadence="daily",
    corridor=(0, 500_000), max_age_days=None,
    source=SourceMeta(name="GDELT v2 Events (BigQuery Public Dataset); erfasst Medienberichte",
                      url="https://www.gdeltproject.org/",
                      license="GDELT: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
```

Hinweis für die Tests: `bigquery.QueryJobConfig` wird im Test echt importiert — dafür das `bq`-Extra installieren:
Run: `pip install -e ".[dev,bq]"`

- [ ] **Step 4: Grün** — Run: `pytest tests/test_adapter_conflict.py -q` — Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll/adapters/conflict.py pipelines/protokoll/tests/test_adapter_conflict.py
git commit -m "feat(protokoll): GDELT conflict adapter via BigQuery (partition-filtered)"
```

---

### Task 11: Registry + CLI (`adapters/__init__.py`, `run.py`)

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/adapters/__init__.py`
- Create: `pipelines/protokoll/src/protokoll/run.py`
- Test: `pipelines/protokoll/tests/test_run.py`

- [ ] **Step 1: Failing Test**

```python
import json
from pathlib import Path

import protokoll.run as run_mod
from protokoll.adapters import ALL_SPECS
from protokoll.model import DayRecord, Entry, SourceMeta


def test_registry_has_13_entries_in_agenda_order():
    ids = [s.top_id for s in ALL_SPECS]
    assert ids == ["co2", "seaice_north", "seaice_south", "sst", "fires", "quakes",
                   "population", "refugees", "food", "rates", "oil", "conflict",
                   "attention"]


def test_dry_run_writes_day_json(tmp_path, monkeypatch):
    fake = DayRecord(date="2026-06-12", generated_at="x", schema_version="1",
                     pipeline_version="0.1.0", entries=[Entry(
                         top_id="co2", status="ok", unit="ppm", cadence="daily",
                         source=SourceMeta(name="n", url="u", license="l"),
                         retrieved_at="t", value=427.3, as_of="2026-06-10")])
    monkeypatch.setattr(run_mod, "assemble", lambda specs, ctx, d: fake)
    code = run_mod.main(["--date", "2026-06-12", "--dry-run",
                         "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/content/protokoll/2026/2026-06-12.json"
    assert out.exists()
    assert json.loads(out.read_text())["date"] == "2026-06-12"
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_run.py -q` — Expected: FAIL (import error)

- [ ] **Step 3: Implementierung**

`adapters/__init__.py`:
```python
"""Registry in Tagesordnungs-Reihenfolge (TOP 1-12; Meereis hat zwei Messwerte)."""
from protokoll.adapters import (attention, co2, conflict, fires, food, oil,
                                population, quakes, rates, refugees, seaice, sst)

ALL_SPECS = [
    co2.SPEC,
    seaice.SPEC_NORTH, seaice.SPEC_SOUTH,
    sst.SPEC,
    fires.SPEC,
    quakes.SPEC,
    population.SPEC,
    refugees.SPEC,
    food.SPEC,
    rates.SPEC,
    oil.SPEC,
    conflict.SPEC,
    attention.SPEC,
]
```

`run.py`:
```python
"""CLI: python -m protokoll.run [--date YYYY-MM-DD] (--dry-run --repo-root PATH | Commit via GitHub)."""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from protokoll.adapters import ALL_SPECS
from protokoll.adapters.base import Context
from protokoll.assemble import assemble
from protokoll.github_commit import commit_file
from protokoll.model import day_record_to_json

USER_AGENT = "frankbueltge.de protokoll-pipeline (hello@frankbueltge.de)"


def _default_bq_factory():
    from google.cloud import bigquery
    return bigquery.Client()


def _bq_factory_or_none():
    try:
        import google.cloud.bigquery  # noqa: F401
        return _default_bq_factory
    except ImportError:
        return None


def content_path(date_iso: str) -> str:
    return f"src/content/protokoll/{date_iso[:4]}/{date_iso}.json"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--repo-root", default=None, help="für --dry-run: Repo-Wurzel")
    args = p.parse_args(argv)

    date_iso = args.date or datetime.now(timezone.utc).date().isoformat()
    ctx = Context(
        client=httpx.Client(headers={"User-Agent": USER_AGENT}),
        today=datetime.strptime(date_iso, "%Y-%m-%d").date(),
        env=os.environ,
        bq_client_factory=_bq_factory_or_none(),
    )
    record = assemble(ALL_SPECS, ctx, date_iso)
    payload = day_record_to_json(record)
    path = content_path(date_iso)

    if args.dry_run:
        if not args.repo_root:
            p.error("--dry-run braucht --repo-root")
        target = Path(args.repo_root) / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(payload, encoding="utf-8")
        print(f"geschrieben: {target}")
    else:
        sha = commit_file(
            repo=os.environ.get("GITHUB_REPO", "frankbueltge/frankbueltge.de"),
            path=path, content=payload,
            message=f"protokoll: Sitzung vom {date_iso}",
            token=os.environ["GITHUB_TOKEN"], client=ctx.client,
        )
        print(f"committet: {path} @ {sha}")

    unavailable = [e.top_id for e in record.entries if e.status != "ok"]
    if unavailable:
        print(f"Hinweis — nicht ok: {', '.join(unavailable)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

(`github_commit` existiert noch nicht — für diesen Task einen Stub anlegen, Task 12 implementiert ihn:)

`src/protokoll/github_commit.py` (Stub):
```python
def commit_file(*, repo, path, content, message, token, client):
    raise NotImplementedError  # Task 12
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_run.py -q` — Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add pipelines/protokoll/src/protokoll pipelines/protokoll/tests/test_run.py
git commit -m "feat(protokoll): adapter registry and CLI with dry-run"
```

---

### Task 12: GitHub-Commit (`github_commit.py`)

**Files:**
- Modify: `pipelines/protokoll/src/protokoll/github_commit.py` (Stub ersetzen)
- Test: `pipelines/protokoll/tests/test_github_commit.py`

- [ ] **Step 1: Failing Test**

```python
import base64
import json

import httpx

from protokoll.github_commit import commit_file


def test_creates_new_file_when_absent():
    calls = []

    def handler(req):
        calls.append(req)
        if req.method == "GET":
            return httpx.Response(404)
        body = json.loads(req.content)
        assert body["message"] == "protokoll: Sitzung vom 2026-06-12"
        assert body["committer"] == {"name": "Protokollführung",
                                     "email": "protokoll@frankbueltge.de"}
        assert base64.b64decode(body["content"]).decode() == '{"a": 1}\n'
        assert "sha" not in body
        return httpx.Response(201, json={"commit": {"sha": "abc123"}})

    sha = commit_file(repo="frankbueltge/frankbueltge.de",
                      path="src/content/protokoll/2026/2026-06-12.json",
                      content='{"a": 1}\n',
                      message="protokoll: Sitzung vom 2026-06-12",
                      token="tok", client=httpx.Client(transport=httpx.MockTransport(handler)))
    assert sha == "abc123"
    assert calls[0].headers["authorization"] == "Bearer tok"


def test_updates_existing_file_with_sha():
    def handler(req):
        if req.method == "GET":
            return httpx.Response(200, json={"sha": "oldsha"})
        assert json.loads(req.content)["sha"] == "oldsha"
        return httpx.Response(200, json={"commit": {"sha": "def456"}})

    sha = commit_file(repo="r/r", path="p.json", content="x", message="m",
                      token="tok", client=httpx.Client(transport=httpx.MockTransport(handler)))
    assert sha == "def456"
```

- [ ] **Step 2: Rot** — Run: `pytest tests/test_github_commit.py -q` — Expected: FAIL (NotImplementedError)

- [ ] **Step 3: Implementierung**

```python
"""Einziger Schreibweg zur Site: ein Commit pro Sitzung, Autorin 'Protokollführung'."""
from __future__ import annotations

import base64

import httpx

API = "https://api.github.com"
COMMITTER = {"name": "Protokollführung", "email": "protokoll@frankbueltge.de"}


def commit_file(*, repo: str, path: str, content: str, message: str,
                token: str, client: httpx.Client) -> str:
    url = f"{API}/repos/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {token}",
               "Accept": "application/vnd.github+json"}
    existing = client.get(url, headers=headers, timeout=30.0)
    body: dict = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        "committer": COMMITTER,
    }
    if existing.status_code == 200:
        body["sha"] = existing.json()["sha"]
    elif existing.status_code != 404:
        existing.raise_for_status()
    r = client.put(url, headers=headers, json=body, timeout=30.0)
    r.raise_for_status()
    return r.json()["commit"]["sha"]
```

- [ ] **Step 4: Grün** — Run: `pytest tests/test_github_commit.py -q` — Expected: `2 passed`

- [ ] **Step 5: Gesamte Pipeline-Suite grün**

Run: `pytest -q`
Expected: alle Tests passed (≈ 28)

- [ ] **Step 6: Commit**

```bash
git add pipelines/protokoll/src/protokoll/github_commit.py pipelines/protokoll/tests/test_github_commit.py
git commit -m "feat(protokoll): github contents-api committer"
```

---

### Task 13: Dockerfile + Deploy-Runbook

**Files:**
- Create: `pipelines/protokoll/Dockerfile`
- Create: `pipelines/protokoll/README.md`

- [ ] **Step 1: Dockerfile**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml ./
COPY src ./src
RUN pip install --no-cache-dir ".[bq]"
ENTRYPOINT ["python", "-m", "protokoll.run"]
```

- [ ] **Step 2: README.md (Runbook mit exakten Befehlen)**

````markdown
# Protokoll-Pipeline — Runbook

Nächtlicher Cloud Run Job. Schreibt `src/content/protokoll/<jahr>/<datum>.json`
per GitHub-Commit (Autorin „Protokollführung") → Pages-Rebuild.

## Lokal

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev,bq]"
pytest -q
# Trockenlauf (schreibt ins Repo, committet nichts):
export FIRMS_MAP_KEY=... EIA_API_KEY=...
python -m protokoll.run --dry-run --repo-root ../..
```

Ohne Keys/GCP-Login laufen die betroffenen TOPs auf „Feststellung entfällt" —
amtlich korrekt, aber für echte Sitzungen Keys setzen und
`gcloud auth application-default login` ausführen (GDELT).

## GCP-Deploy (einmalig)

```bash
PROJECT=<PROJECT_ID>; REGION=europe-west1
gcloud config set project $PROJECT
gcloud services enable run.googleapis.com cloudscheduler.googleapis.com \
  artifactregistry.googleapis.com cloudbuild.googleapis.com \
  bigquery.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create werke --repository-format=docker --location=$REGION

# Service Account + Rechte
gcloud iam service-accounts create protokoll-runner
SA=protokoll-runner@$PROJECT.iam.gserviceaccount.com
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA \
  --role=roles/bigquery.jobUser
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA \
  --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA \
  --role=roles/run.invoker

# Secrets (GitHub Fine-Grained PAT: nur dieses Repo, Contents Read/Write)
echo -n "<github-pat>"  | gcloud secrets create protokoll-github-token --data-file=-
echo -n "<firms-key>"   | gcloud secrets create protokoll-firms-key  --data-file=-
echo -n "<eia-key>"     | gcloud secrets create protokoll-eia-key    --data-file=-

# Build + Job
gcloud builds submit . --tag $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest
gcloud run jobs create protokoll \
  --image $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest \
  --region $REGION --service-account $SA --max-retries 1 --task-timeout 10m \
  --set-secrets "GITHUB_TOKEN=protokoll-github-token:latest,FIRMS_MAP_KEY=protokoll-firms-key:latest,EIA_API_KEY=protokoll-eia-key:latest" \
  --set-env-vars "GITHUB_REPO=frankbueltge/frankbueltge.de"

# Nächtlich 03:30 UTC
gcloud scheduler jobs create http protokoll-nightly --location $REGION \
  --schedule "30 3 * * *" --time-zone "Etc/UTC" --http-method POST \
  --uri "https://run.googleapis.com/v2/projects/$PROJECT/locations/$REGION/jobs/protokoll:run" \
  --oauth-service-account-email $SA

# Budget-Alert (Console): Billing → Budgets → 10 EUR/Monat, Alarm bei 50/90/100 %.
```

## Update deployen

```bash
gcloud builds submit . --tag $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest
gcloud run jobs update protokoll --image $REGION-docker.pkg.dev/$PROJECT/werke/protokoll:latest --region $REGION
```

## Manueller Lauf / Backfill

```bash
gcloud run jobs execute protokoll --region $REGION            # heute
gcloud run jobs execute protokoll --region $REGION --args="--date,2026-06-10"
```

## Redaktionelle Pflege

- `src/protokoll/data/refugees.json`: bei UNHCR-Global-Trends-Veröffentlichung aktualisieren.
- `src/protokoll/data/food.json`: monatlich nach FAO-FPI-Release aktualisieren.
- Danach: neues Image deployen (s. o.).
````

- [ ] **Step 3: Lokaler Image-Build als Smoke-Test (optional, wenn Docker läuft)**

Run: `docker build -t protokoll-test pipelines/protokoll && docker run --rm protokoll-test --help`
Expected: argparse-Hilfe mit `--date`, `--dry-run`, `--repo-root`

- [ ] **Step 4: Commit**

```bash
git add pipelines/protokoll/Dockerfile pipelines/protokoll/README.md
git commit -m "feat(protokoll): dockerfile and GCP deploy runbook"
```

---

## Teil B — Site (Astro)

### Dateistruktur Teil B

```
src/content.config.ts               # +protokoll Collection (Task 14)
src/lib/protokoll/
  types.ts                          # ProtokollDay/Entry (frontend-eigene Typen)
  data.ts                           # Collection-Zugriff, sortiert
  agenda.ts                         # TOP-Reihenfolge, Titel, Satz-Templates DE/EN, TEMPLATE_VERSION
  render.ts                         # deterministische Prosa (kein LLM)
  render.test.ts                    # Vitest, exakte String-Asserts
src/components/pages/ProtokollDoc.astro
src/components/pages/MethodenblattProtokoll.astro
src/pages/protokoll/{index,[datum],archiv}.astro + feed.xml.ts
src/pages/en/protokoll/{index,[datum],archiv}.astro + feed.xml.ts
src/pages/werke/{index,protokoll}.astro
src/pages/en/werke/{index,protokoll}.astro
src/data/werke.ts
src/i18n/ui.ts                      # +Keys (nav.werke, prot.*, werke.*)
src/components/TopBar.astro         # +Werke in Nav
package.json                        # +@astrojs/rss, +protokoll:dry
```

Hinweis (Abweichung von Spec §3.1, dort `/en/works`): Das URL-Segment bleibt in beiden Sprachen `werke` — konsistent mit dem bestehenden Muster (`/lab` = `/en/lab`) und mit `getRelativeLocaleUrl`.

---

### Task 14: Content Collection + Datenzugriff

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/lib/protokoll/types.ts`, `src/lib/protokoll/data.ts`

- [ ] **Step 1: Collection ergänzen**

In `src/content.config.ts` nach der `lab`-Collection einfügen und Export erweitern:

```ts
// Protokoll = kanonische Tages-JSONs der Pipeline (src/content/protokoll/<jahr>/<datum>.json).
// Die Prosa entsteht erst im Renderer — JSON ist das Archiv.
const protokoll = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/protokoll' }),
  schema: z.object({
    date: z.string(),
    generated_at: z.string(),
    schema_version: z.string(),
    pipeline_version: z.string(),
    entries: z.array(
      z.object({
        top_id: z.string(),
        status: z.enum(['ok', 'unavailable', 'implausible']),
        unit: z.string(),
        cadence: z.string(),
        source: z.object({ name: z.string(), url: z.string(), license: z.string() }),
        retrieved_at: z.string(),
        value: z.number().nullable().default(null),
        as_of: z.string().nullable().default(null),
        comparison: z
          .object({ label: z.enum(['prev_day', 'prev_month', 'prev_year_day']), value: z.number() })
          .nullable()
          .default(null),
        label: z.string().nullable().default(null),
        record: z.boolean().default(false),
        note: z.string().nullable().default(null),
      }),
    ),
  }),
})

export const collections = { lab, protokoll }
```

- [ ] **Step 2: Frontend-Typen (`src/lib/protokoll/types.ts`)**

```ts
/** Frontend-Typen, spiegeln das kanonische Pipeline-Schema (schema_version 1). */
export type ProtokollStatus = 'ok' | 'unavailable' | 'implausible'
export type ComparisonLabel = 'prev_day' | 'prev_month' | 'prev_year_day'

export interface ProtokollComparison {
  label: ComparisonLabel
  value: number
}

export interface ProtokollEntry {
  top_id: string
  status: ProtokollStatus
  unit: string
  cadence: string
  source: { name: string; url: string; license: string }
  retrieved_at: string
  value: number | null
  as_of: string | null
  comparison: ProtokollComparison | null
  label: string | null
  record: boolean
  note: string | null
}

export interface ProtokollDay {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  entries: ProtokollEntry[]
}
```

- [ ] **Step 3: Datenzugriff (`src/lib/protokoll/data.ts`)**

```ts
import { getCollection } from 'astro:content'
import type { ProtokollDay } from './types'

export async function getProtokollDays(): Promise<ProtokollDay[]> {
  const all = await getCollection('protokoll')
  return all.map((e) => e.data as ProtokollDay).sort((a, b) => b.date.localeCompare(a.date))
}

export async function getLatestProtokoll(): Promise<ProtokollDay | undefined> {
  return (await getProtokollDays())[0]
}

export async function getProtokollByDate(date: string): Promise<ProtokollDay | undefined> {
  return (await getProtokollDays()).find((d) => d.date === date)
}
```

- [ ] **Step 4: Verifizieren** — Run: `npm run check` — Expected: 0 errors (Collection darf leer sein)

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/protokoll
git commit -m "feat(protokoll): content collection and typed data access"
```

---

### Task 15: Tagesordnung + Renderer (TDD, künstlerischer Kern)

**Files:**
- Create: `src/lib/protokoll/agenda.ts`, `src/lib/protokoll/render.ts`
- Test: `src/lib/protokoll/render.test.ts`

- [ ] **Step 1: Failing Test schreiben (exakte Strings = Register-Abnahme)**

```ts
import { describe, expect, it } from 'vitest'
import { renderDay } from './render'
import type { ProtokollDay, ProtokollEntry } from './types'

const SRC = { name: 'NOAA Global Monitoring Laboratory (Mauna Loa)', url: 'https://gml.noaa.gov', license: 'PD' }

function entry(partial: Partial<ProtokollEntry>): ProtokollEntry {
  return {
    top_id: 'co2', status: 'ok', unit: 'ppm', cadence: 'daily', source: SRC,
    retrieved_at: '2026-06-12T03:30:00Z', value: null, as_of: null,
    comparison: null, label: null, record: false, note: null, ...partial,
  }
}

const DAY: ProtokollDay = {
  date: '2026-06-12', generated_at: '2026-06-12T03:30:00Z',
  schema_version: '1', pipeline_version: '0.1.0',
  entries: [
    entry({ top_id: 'co2', value: 427.3, as_of: '2026-06-10',
            comparison: { label: 'prev_year_day', value: 424.52 }, record: true }),
    entry({ top_id: 'seaice_north', unit: 'Mio. km²', value: 10.689, as_of: '2026-06-10',
            comparison: { label: 'prev_year_day', value: 11.013 } }),
    entry({ top_id: 'fires', status: 'unavailable', unit: 'Detektionen', note: 'HTTP 503' }),
    entry({ top_id: 'population', unit: 'Menschen', cadence: 'computed',
            value: 8_230_000_000, as_of: '2026-06-12' }),
    entry({ top_id: 'food', unit: 'Punkte', cadence: 'monthly', value: 128.0, as_of: '2026-05-31' }),
    entry({ top_id: 'oil', status: 'implausible', unit: 'USD/Barrel', value: 8000, as_of: '2026-06-11' }),
    entry({ top_id: 'attention', unit: 'Aufrufe', value: 812_345, as_of: '2026-06-11',
            label: 'Deep sea mining' }),
  ],
}

describe('renderDay de', () => {
  const r = renderDay(DAY, 'de')
  const top = (n: number) => r.tops[n - 1]

  it('Kopf', () => {
    expect(r.kopf).toEqual([
      'Protokoll der Sitzung vom 12. Juni 2026.',
      'Anwesend: ca. 8,23 Mrd. (Schätzung).',
      'Vorsitz: unbesetzt.',
      'Beschlussfähigkeit: nicht festgestellt.',
    ])
  })

  it('TOP 1 Atmosphäre: Feststellung, Vergleich, Rekord, Quelle', () => {
    expect(top(1).heading).toBe('TOP 1 — Atmosphäre.')
    expect(top(1).lines).toEqual([
      'Die CO₂-Konzentration der Atmosphäre beträgt 427,3 ppm.',
      'Vorjahrestag: 424,52 ppm.',
      'Höchster Stand seit Beginn der Aufzeichnung.',
    ])
    expect(top(1).sources[0]).toBe(
      'Quelle: NOAA Global Monitoring Laboratory (Mauna Loa), abgerufen 2026-06-12 03:30:00 UTC. Stand: 10. Juni 2026.',
    )
    expect(top(1).closing).toBe('Aussprache: keine. Beschluss: vertagt.')
  })

  it('TOP 2 Meereis: Nord vorhanden, Süd fehlt im Record → entfällt', () => {
    expect(top(2).lines).toContain('Ausdehnung Arktis: 10,689 Mio. km².')
    expect(top(2).lines).toContain('Vorjahrestag: 11,013 Mio. km².')
    expect(top(2).lines).toContain('Quelle nicht erreichbar — Feststellung entfällt.')
  })

  it('TOP 4 Feuer entfällt amtlich', () => {
    expect(top(4).lines).toEqual(['Quelle nicht erreichbar — Feststellung entfällt.'])
  })

  it('TOP 8 Ernährung weist Monatskadenz aus', () => {
    expect(top(8).sources[0]).toContain('Stand: 31. Mai 2026 (monatliche Erhebung).')
  })

  it('TOP 10 Energie unter Vorbehalt', () => {
    expect(top(10).lines).toEqual([
      'Wert außerhalb des Plausibilitätskorridors — Feststellung unter Vorbehalt: 8.000 USD/Barrel.',
    ])
  })

  it('TOP 12 Aufmerksamkeit mit Titel', () => {
    expect(top(12).lines[0]).toBe(
      'Gegenstand der größten Aufmerksamkeit (englischsprachige Wikipedia): „Deep sea mining“ — 812.345 Aufrufe.',
    )
  })

  it('Schluss + Meta', () => {
    expect(r.schluss).toEqual(['Die Sitzung wurde nicht geschlossen.', 'Nächste Sitzung: morgen.'])
    expect(r.meta).toBe('Registerfassung 1.0.0 · Pipeline 0.1.0 · Schema 1')
  })
})

describe('renderDay en', () => {
  const r = renderDay(DAY, 'en')

  it('minutes English register', () => {
    expect(r.kopf[0]).toBe('Minutes of the session of 12 June 2026.')
    expect(r.kopf[1]).toBe('Present: approx. 8.23 bn (estimate).')
    expect(r.tops[0].heading).toBe('Item 1 — Atmosphere.')
    expect(r.tops[0].lines[0]).toBe('Atmospheric CO₂ concentration stands at 427.3 ppm.')
    expect(r.tops[0].lines[1]).toBe('Same day last year: 424.52 ppm.')
    expect(r.tops[0].closing).toBe('Discussion: none. Resolution: adjourned.')
    expect(r.tops[3].lines).toEqual(['Source unreachable — finding omitted.'])
    expect(r.schluss).toEqual(['The session was not closed.', 'Next session: tomorrow.'])
  })
})
```

- [ ] **Step 2: Rot** — Run: `npm run test` — Expected: FAIL (`Cannot find module './render'`)

- [ ] **Step 3: `src/lib/protokoll/agenda.ts` implementieren**

```ts
import type { Locale } from '@/lib/site'

/** Registerfassung: bei jeder Template-Änderung erhöhen (steht auf jeder Seite). */
export const TEMPLATE_VERSION = '1.0.0'

type L10n = Record<Locale, string>

export interface AgendaEntry {
  id: string
  /** Satz-Template; {value} und {label} werden ersetzt. Einheit steht im Satz. */
  phrase: L10n
}

export interface AgendaTop {
  n: number
  title: L10n
  entries: AgendaEntry[]
}

export const AGENDA: AgendaTop[] = [
  { n: 1, title: { de: 'Atmosphäre', en: 'Atmosphere' }, entries: [
    { id: 'co2', phrase: {
      de: 'Die CO₂-Konzentration der Atmosphäre beträgt {value} ppm.',
      en: 'Atmospheric CO₂ concentration stands at {value} ppm.' } },
  ] },
  { n: 2, title: { de: 'Meereis', en: 'Sea ice' }, entries: [
    { id: 'seaice_north', phrase: {
      de: 'Ausdehnung Arktis: {value} Mio. km².',
      en: 'Arctic extent: {value} million km².' } },
    { id: 'seaice_south', phrase: {
      de: 'Ausdehnung Antarktis: {value} Mio. km².',
      en: 'Antarctic extent: {value} million km².' } },
  ] },
  { n: 3, title: { de: 'Ozean', en: 'Ocean' }, entries: [
    { id: 'sst', phrase: {
      de: 'Mittlere Meeresoberflächentemperatur: {value} °C.',
      en: 'Global mean sea surface temperature: {value} °C.' } },
  ] },
  { n: 4, title: { de: 'Feuer', en: 'Fire' }, entries: [
    { id: 'fires', phrase: {
      de: 'Aktive Branddetektionen weltweit (Satellit, 24 h): {value}.',
      en: 'Active fire detections worldwide (satellite, 24 h): {value}.' } },
  ] },
  { n: 5, title: { de: 'Erdbewegung', en: 'Seismicity' }, entries: [
    { id: 'quakes', phrase: {
      de: 'Beben der Stärke ≥ 4,5 in den letzten 24 Stunden: {value}.',
      en: 'Earthquakes of magnitude ≥ 4.5 in the past 24 hours: {value}.' } },
  ] },
  { n: 6, title: { de: 'Anwesenheit', en: 'Attendance' }, entries: [
    { id: 'population', phrase: {
      de: 'Geschätzte Weltbevölkerung: {value} Mrd. Menschen.',
      en: 'Estimated world population: {value} bn people.' } },
  ] },
  { n: 7, title: { de: 'Vertreibung', en: 'Displacement' }, entries: [
    { id: 'refugees', phrase: {
      de: 'Menschen auf der Flucht: {value}.',
      en: 'People forcibly displaced: {value}.' } },
  ] },
  { n: 8, title: { de: 'Ernährung', en: 'Food' }, entries: [
    { id: 'food', phrase: {
      de: 'FAO-Nahrungsmittelpreisindex: {value} Punkte (2014–2016 = 100).',
      en: 'FAO Food Price Index: {value} points (2014–2016 = 100).' } },
  ] },
  { n: 9, title: { de: 'Geldpreis', en: 'Price of money' }, entries: [
    { id: 'rates', phrase: {
      de: 'Kurzfristiger Euro-Zinssatz (€STR): {value} %.',
      en: 'Euro short-term rate (€STR): {value} %.' } },
  ] },
  { n: 10, title: { de: 'Energie', en: 'Energy' }, entries: [
    { id: 'oil', phrase: {
      de: 'Rohöl Brent: {value} US-Dollar je Barrel.',
      en: 'Brent crude: {value} US dollars per barrel.' } },
  ] },
  { n: 11, title: { de: 'Konflikt', en: 'Conflict' }, entries: [
    { id: 'conflict', phrase: {
      de: 'Erfasste Konfliktereignisse weltweit, Vortag: {value}.',
      en: 'Recorded conflict events worldwide, previous day: {value}.' } },
  ] },
  { n: 12, title: { de: 'Aufmerksamkeit', en: 'Attention' }, entries: [
    { id: 'attention', phrase: {
      de: 'Gegenstand der größten Aufmerksamkeit (englischsprachige Wikipedia): „{label}“ — {value} Aufrufe.',
      en: 'Object of greatest attention (English-language Wikipedia): “{label}” — {value} views.' } },
  ] },
]
```

- [ ] **Step 4: `src/lib/protokoll/render.ts` implementieren**

```ts
/** Deterministische Prosa aus kanonischem JSON. Kein LLM — jeder Satz folgt mechanisch aus Daten. */
import type { Locale } from '@/lib/site'
import { AGENDA, TEMPLATE_VERSION, type AgendaTop } from './agenda'
import type { ProtokollDay, ProtokollEntry } from './types'

const NUM_LOCALE: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' }

interface ValueFormat { maxFrac: number; scale?: number }
const VALUE_FORMATS: Record<string, ValueFormat> = {
  co2: { maxFrac: 2 }, seaice_north: { maxFrac: 3 }, seaice_south: { maxFrac: 3 },
  sst: { maxFrac: 2 }, fires: { maxFrac: 0 }, quakes: { maxFrac: 0 },
  population: { maxFrac: 2, scale: 1e-9 }, refugees: { maxFrac: 0 },
  food: { maxFrac: 1 }, rates: { maxFrac: 2 }, oil: { maxFrac: 2 },
  conflict: { maxFrac: 0 }, attention: { maxFrac: 0 },
}

const STR = {
  de: {
    minutesOf: 'Protokoll der Sitzung vom {date}.',
    present: 'Anwesend: ca. {value} Mrd. (Schätzung).',
    presentUnknown: 'Anwesend: nicht festgestellt.',
    chair: 'Vorsitz: unbesetzt.',
    quorum: 'Beschlussfähigkeit: nicht festgestellt.',
    top: 'TOP',
    unavailable: 'Quelle nicht erreichbar — Feststellung entfällt.',
    implausible: 'Wert außerhalb des Plausibilitätskorridors — Feststellung unter Vorbehalt: {value} {unit}.',
    record: 'Höchster Stand seit Beginn der Aufzeichnung.',
    discussion: 'Aussprache: keine.',
    resolution: 'Beschluss: vertagt.',
    source: 'Quelle',
    retrieved: 'abgerufen',
    asOf: 'Stand',
    notClosed: 'Die Sitzung wurde nicht geschlossen.',
    next: 'Nächste Sitzung: morgen.',
    cmp: { prev_day: 'Vortag', prev_month: 'Vormonat', prev_year_day: 'Vorjahrestag' },
    cadence: {
      monthly: 'monatliche Erhebung', periodic: 'periodische Erhebung',
      computed: 'Schätzung/Extrapolation',
    } as Record<string, string>,
  },
  en: {
    minutesOf: 'Minutes of the session of {date}.',
    present: 'Present: approx. {value} bn (estimate).',
    presentUnknown: 'Present: not established.',
    chair: 'Chair: vacant.',
    quorum: 'Quorum: not established.',
    top: 'Item',
    unavailable: 'Source unreachable — finding omitted.',
    implausible: 'Value outside the plausibility corridor — finding under reserve: {value} {unit}.',
    record: 'Highest value since records began.',
    discussion: 'Discussion: none.',
    resolution: 'Resolution: adjourned.',
    source: 'Source',
    retrieved: 'retrieved',
    asOf: 'As of',
    notClosed: 'The session was not closed.',
    next: 'Next session: tomorrow.',
    cmp: { prev_day: 'Previous day', prev_month: 'Previous month', prev_year_day: 'Same day last year' },
    cadence: {
      monthly: 'monthly survey', periodic: 'periodic survey',
      computed: 'estimate/extrapolation',
    } as Record<string, string>,
  },
} as const

export interface RenderedTop { heading: string; lines: string[]; sources: string[]; closing: string }
export interface RenderedDay { kopf: string[]; tops: RenderedTop[]; schluss: string[]; meta: string }

export function fmtValue(id: string, value: number, locale: Locale): string {
  const f = VALUE_FORMATS[id] ?? { maxFrac: 2 }
  const v = f.scale ? value * f.scale : value
  return new Intl.NumberFormat(NUM_LOCALE[locale], { maximumFractionDigits: f.maxFrac }).format(v)
}

export function fmtDateLong(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(NUM_LOCALE[locale], {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

function sourceLine(e: ProtokollEntry, locale: Locale): string {
  const s = STR[locale]
  const ts = e.retrieved_at.replace('T', ' ').replace('Z', ' UTC')
  const parts = [`${s.source}: ${e.source.name}, ${s.retrieved} ${ts}.`]
  const cad = s.cadence[e.cadence]
  if (e.as_of) parts.push(`${s.asOf}: ${fmtDateLong(e.as_of, locale)}${cad ? ` (${cad})` : ''}.`)
  else if (cad) parts.push(`(${cad}).`)
  return parts.join(' ')
}

function renderTop(top: AgendaTop, byId: Map<string, ProtokollEntry>, locale: Locale): RenderedTop {
  const s = STR[locale]
  const lines: string[] = []
  const sources: string[] = []
  for (const def of top.entries) {
    const e = byId.get(def.id)
    if (!e || e.status === 'unavailable') {
      lines.push(s.unavailable)
      if (e) sources.push(sourceLine(e, locale))
      continue
    }
    if (e.status === 'implausible') {
      lines.push(
        s.implausible
          .replace('{value}', e.value != null ? fmtValue(def.id, e.value, locale) : '—')
          .replace('{unit}', e.unit),
      )
      sources.push(sourceLine(e, locale))
      continue
    }
    let line = def.phrase[locale].replace(
      '{value}', e.value != null ? fmtValue(def.id, e.value, locale) : '—')
    if (e.label) line = line.replace('{label}', e.label)
    lines.push(line)
    if (e.comparison) {
      lines.push(`${s.cmp[e.comparison.label]}: ${fmtValue(def.id, e.comparison.value, locale)} ${e.unit}.`)
    }
    if (e.record) lines.push(s.record)
    sources.push(sourceLine(e, locale))
  }
  return {
    heading: `${s.top} ${top.n} — ${top.title[locale]}.`,
    lines, sources,
    closing: `${s.discussion} ${s.resolution}`,
  }
}

export function renderDay(day: ProtokollDay, locale: Locale): RenderedDay {
  const s = STR[locale]
  const byId = new Map(day.entries.map((e) => [e.top_id, e]))
  const pop = byId.get('population')
  const kopf = [
    s.minutesOf.replace('{date}', fmtDateLong(day.date, locale)),
    pop && pop.status === 'ok' && pop.value != null
      ? s.present.replace('{value}', fmtValue('population', pop.value, locale))
      : s.presentUnknown,
    s.chair,
    s.quorum,
  ]
  return {
    kopf,
    tops: AGENDA.map((top) => renderTop(top, byId, locale)),
    schluss: [s.notClosed, s.next],
    meta: `Registerfassung ${TEMPLATE_VERSION} · Pipeline ${day.pipeline_version} · Schema ${day.schema_version}`,
  }
}
```

- [ ] **Step 5: Grün** — Run: `npm run test` — Expected: alle Tests passed (bestehende `climate.test.ts` + neue `render.test.ts`)

- [ ] **Step 6: Commit**

```bash
git add src/lib/protokoll
git commit -m "feat(protokoll): deterministic minutes renderer DE/EN with agenda templates"
```

---

### Task 16: Dokument-Komponente + Routen + Navigation

**Files:**
- Create: `src/components/pages/ProtokollDoc.astro`
- Create: `src/pages/protokoll/index.astro`, `src/pages/protokoll/[datum].astro`, `src/pages/protokoll/archiv.astro`
- Create: `src/pages/en/protokoll/index.astro`, `src/pages/en/protokoll/[datum].astro`, `src/pages/en/protokoll/archiv.astro`
- Modify: `src/i18n/ui.ts` (Keys in beiden Sprachblöcken), `src/components/TopBar.astro:8-13` (Nav)

- [ ] **Step 1: i18n-Keys ergänzen**

In `src/i18n/ui.ts` im `de`-Block (nach den `lab.*`-Keys) einfügen:

```ts
    'nav.werke': 'Werke',
    'prot.title': 'Das Protokoll',
    'prot.sub': 'Die Sitzung der Welt ist eröffnet — täglich, maschinell, amtlich.',
    'prot.archive': 'Archiv',
    'prot.method': 'Methodenblatt',
    'prot.empty': 'Das erste Protokoll folgt mit dem nächsten nächtlichen Lauf.',
    'prot.backToCurrent': 'Zum aktuellen Protokoll',
    'werke.title': 'Werke',
    'werke.sub': 'Messinstrumente, keine Visualisierungen — Werke an der Schnittstelle von Kunst, Wissenschaft und Philosophie.',
```

Im `en`-Block:

```ts
    'nav.werke': 'Works',
    'prot.title': 'Das Protokoll',
    'prot.sub': 'The session of the world is open — daily, mechanical, official.',
    'prot.archive': 'Archive',
    'prot.method': 'Method sheet',
    'prot.empty': 'The first minutes will follow with the next nightly run.',
    'prot.backToCurrent': 'To the current minutes',
    'werke.title': 'Works',
    'werke.sub': 'Measuring instruments, not visualisations — works at the intersection of art, science and philosophy.',
```

- [ ] **Step 2: Nav erweitern** — in `src/components/TopBar.astro` das `nav`-Array ändern:

```ts
const nav = [
  { href: getRelativeLocaleUrl(locale, '/werke'), label: t(locale, 'nav.werke') },
  { href: getRelativeLocaleUrl(locale, '/work'), label: t(locale, 'nav.work') },
  { href: getRelativeLocaleUrl(locale, '/lab'), label: t(locale, 'nav.lab') },
  { href: getRelativeLocaleUrl(locale, '/about'), label: t(locale, 'nav.about') },
  { href: getRelativeLocaleUrl(locale, '/contact'), label: t(locale, 'nav.contact') },
]
```

- [ ] **Step 3: `src/components/pages/ProtokollDoc.astro`**

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
import { t } from '@/i18n/ui'
import type { Locale } from '@/lib/site'
import { renderDay } from '@/lib/protokoll/render'
import type { ProtokollDay } from '@/lib/protokoll/types'

interface Props { day: ProtokollDay; locale: Locale }
const { day, locale } = Astro.props
const r = renderDay(day, locale)
const archivUrl = getRelativeLocaleUrl(locale, '/protokoll/archiv')
const methodUrl = getRelativeLocaleUrl(locale, '/werke/protokoll')
const feedUrl = locale === 'de' ? '/protokoll/feed.xml' : '/en/protokoll/feed.xml'
---

<article class="protokoll mx-auto max-w-2xl px-4 py-14">
  <header class="mb-10 space-y-1">
    {r.kopf.map((line) => <p class="text-[15px] leading-relaxed">{line}</p>)}
  </header>

  {r.tops.map((top) => (
    <section class="mb-8">
      <h2 class="mb-1 font-semibold">{top.heading}</h2>
      {top.lines.map((line) => <p class="leading-relaxed">{line}</p>)}
      {top.sources.map((s) => <p class="mt-1 font-mono text-xs text-fg-faint">{s}</p>)}
      <p class="mt-1 text-fg-muted">{top.closing}</p>
    </section>
  ))}

  <footer class="mt-12 space-y-1 border-t border-line pt-6">
    {r.schluss.map((line) => <p>{line}</p>)}
    <p class="pt-4 font-mono text-xs text-fg-faint">{r.meta}</p>
    <nav class="flex gap-4 pt-2 text-sm text-fg-muted print:hidden">
      <a href={archivUrl} class="transition-colors hover:text-fg">{t(locale, 'prot.archive')}</a>
      <a href={methodUrl} class="transition-colors hover:text-fg">{t(locale, 'prot.method')}</a>
      <a href={feedUrl} class="transition-colors hover:text-fg">RSS</a>
    </nav>
  </footer>
</article>

<style>
  /* Druckfassung: Dokument schwarz auf weiß, Chrome ausgeblendet (Jahresband, Spec §4.5). */
  @media print {
    .protokoll { max-width: none; padding: 0; color: #000; }
    :global(header), :global(footer:not(.protokoll footer)) { display: none !important; }
  }
</style>
```

- [ ] **Step 4: Routen (DE)**

`src/pages/protokoll/index.astro`:
```astro
---
import Page from '@/layouts/Page.astro'
import ProtokollDoc from '@/components/pages/ProtokollDoc.astro'
import { getLatestProtokoll } from '@/lib/protokoll/data'
import { t } from '@/i18n/ui'
const locale = 'de' as const
const day = await getLatestProtokoll()
---
<Page title={`${t(locale, 'prot.title')} | Frank Bültge`} description={t(locale, 'prot.sub')}>
  {day ? <ProtokollDoc day={day} locale={locale} /> : (
    <p class="mx-auto max-w-2xl px-4 py-14 text-fg-muted">{t(locale, 'prot.empty')}</p>
  )}
</Page>
```

`src/pages/protokoll/[datum].astro`:
```astro
---
import Page from '@/layouts/Page.astro'
import ProtokollDoc from '@/components/pages/ProtokollDoc.astro'
import { getProtokollDays } from '@/lib/protokoll/data'
import { t } from '@/i18n/ui'
import type { ProtokollDay } from '@/lib/protokoll/types'

export async function getStaticPaths() {
  const days = await getProtokollDays()
  return days.map((day) => ({ params: { datum: day.date }, props: { day } }))
}
const locale = 'de' as const
const { day } = Astro.props as { day: ProtokollDay }
---
<Page title={`${t(locale, 'prot.title')} ${day.date} | Frank Bültge`} description={t(locale, 'prot.sub')}>
  <ProtokollDoc day={day} locale={locale} />
</Page>
```

`src/pages/protokoll/archiv.astro`:
```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
import Page from '@/layouts/Page.astro'
import { getProtokollDays } from '@/lib/protokoll/data'
import { fmtDateLong } from '@/lib/protokoll/render'
import { t } from '@/i18n/ui'
const locale = 'de' as const
const days = await getProtokollDays()
const years = [...new Set(days.map((d) => d.date.slice(0, 4)))]
---
<Page title={`${t(locale, 'prot.archive')} — ${t(locale, 'prot.title')} | Frank Bültge`} description={t(locale, 'prot.sub')}>
  <div class="mx-auto max-w-2xl px-4 py-14">
    <h1 class="mb-8 text-xl font-semibold">{t(locale, 'prot.title')} — {t(locale, 'prot.archive')}</h1>
    {days.length === 0 && <p class="text-fg-muted">{t(locale, 'prot.empty')}</p>}
    {years.map((year) => (
      <section class="mb-8">
        <h2 class="mb-2 font-mono text-sm text-fg-faint">{year}</h2>
        <ul class="space-y-1">
          {days.filter((d) => d.date.startsWith(year)).map((d) => (
            <li>
              <a href={getRelativeLocaleUrl(locale, `/protokoll/${d.date}`)} class="text-fg-muted transition-colors hover:text-fg">
                {fmtDateLong(d.date, locale)}
              </a>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
</Page>
```

- [ ] **Step 5: Routen (EN)** — identische Dateien unter `src/pages/en/protokoll/` mit einziger Änderung `const locale = 'en' as const` (alle drei Dateien; `getStaticPaths` in `[datum].astro` bleibt identisch).

- [ ] **Step 6: Verifizieren**

Run: `npm run check && npm run build`
Expected: 0 Errors; Build erfolgreich (ohne Tages-JSONs zeigen die Seiten den Leer-Zustand)

- [ ] **Step 7: Commit**

```bash
git add src/components/pages/ProtokollDoc.astro src/pages/protokoll src/pages/en/protokoll src/i18n/ui.ts src/components/TopBar.astro
git commit -m "feat(protokoll): document component, DE/EN routes, archive, nav"
```

---

### Task 17: RSS-Feeds + Dry-Run-Skript

**Files:**
- Create: `src/pages/protokoll/feed.xml.ts`, `src/pages/en/protokoll/feed.xml.ts`
- Modify: `package.json` (dependency + script)

- [ ] **Step 1: Dependency** — Run: `npm install @astrojs/rss` — Expected: in `package.json` unter dependencies

- [ ] **Step 2: `src/pages/protokoll/feed.xml.ts`**

```ts
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getProtokollDays } from '@/lib/protokoll/data'
import { renderDay } from '@/lib/protokoll/render'

export async function GET(context: APIContext) {
  const days = await getProtokollDays()
  return rss({
    title: 'Das Protokoll — frankbueltge.de',
    description: 'Tägliches Sitzungsprotokoll der Welt. Beschluss: vertagt.',
    site: context.site!,
    items: days.slice(0, 30).map((day) => {
      const r = renderDay(day, 'de')
      return {
        title: r.kopf[0],
        link: `/protokoll/${day.date}/`,
        pubDate: new Date(day.generated_at),
        description: [...r.kopf, ...r.tops.flatMap((t) => [t.heading, ...t.lines, t.closing])].join(' '),
      }
    }),
  })
}
```

- [ ] **Step 3: `src/pages/en/protokoll/feed.xml.ts`** — identisch mit drei Änderungen: `renderDay(day, 'en')`, `title: 'Das Protokoll (minutes) — frankbueltge.de'`, `description: 'Daily minutes of the world. Resolution: adjourned.'`, `link: \`/en/protokoll/${day.date}/\``.

- [ ] **Step 4: npm-Skript** — in `package.json` unter `scripts` ergänzen:

```json
"protokoll:dry": "pipelines/protokoll/.venv/bin/python -m protokoll.run --dry-run --repo-root ."
```

- [ ] **Step 5: Verifizieren**

Run: `npm run build && ls dist/protokoll/feed.xml dist/en/protokoll/feed.xml`
Expected: beide Dateien existieren (ggf. mit 0 Items)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/pages/protokoll/feed.xml.ts src/pages/en/protokoll/feed.xml.ts
git commit -m "feat(protokoll): daily RSS feeds DE/EN and dry-run script"
```

---

### Task 18: Werkverzeichnis + Methodenblatt

**Files:**
- Create: `src/data/werke.ts`
- Create: `src/components/pages/MethodenblattProtokoll.astro`
- Create: `src/pages/werke/index.astro`, `src/pages/werke/protokoll.astro`
- Create: `src/pages/en/werke/index.astro`, `src/pages/en/werke/protokoll.astro`

- [ ] **Step 1: `src/data/werke.ts`**

```ts
import type { Locale } from '@/lib/site'

export interface Werk {
  id: string
  title: string
  subtitle: Record<Locale, string>
  status: 'live' | 'in-arbeit' | 'geplant'
  href: string
  description: Record<Locale, string>
}

/** Werkverzeichnis. Satelliten (Überflug, Halbwertszeit, Parallaxe, Prämie) folgen je eigenem Zyklus. */
export const WERKE: Werk[] = [
  {
    id: 'protokoll',
    title: 'Das Protokoll',
    subtitle: {
      de: 'Die Sitzung der Welt ist eröffnet',
      en: 'The session of the world is open',
    },
    status: 'live',
    href: '/protokoll',
    description: {
      de: 'Jede Nacht verfasst eine Pipeline das Sitzungsprotokoll des Planeten — aus zwölf offenen, zitierfähigen Quellen, deterministisch, ohne LLM. Jeder Tagesordnungspunkt endet gleich: Beschluss: vertagt.',
      en: "Every night a pipeline writes the minutes of the planet's session — from twelve open, citable sources, deterministic, no LLM. Every agenda item ends the same way: Resolution: adjourned.",
    },
  },
]
```

- [ ] **Step 2: `src/components/pages/MethodenblattProtokoll.astro`** (Pflichtschema aus Spec §3.5; Quellen aus dem jüngsten Tages-JSON = single source of truth)

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
import type { Locale } from '@/lib/site'
import { getLatestProtokoll } from '@/lib/protokoll/data'
import { TEMPLATE_VERSION } from '@/lib/protokoll/agenda'

interface Props { locale: Locale }
const { locale } = Astro.props
const day = await getLatestProtokoll()
const de = locale === 'de'
const protokollUrl = getRelativeLocaleUrl(locale, '/protokoll')

const txt = {
  h1: de ? 'Methodenblatt — Das Protokoll' : 'Method sheet — Das Protokoll',
  s1: de ? '1. Quellen & Lizenzen' : '1. Sources & licences',
  s1empty: de ? 'Quellenliste erscheint mit dem ersten Protokoll.' : 'The source list appears with the first minutes.',
  s2: de ? '2. Kadenz' : '2. Cadence',
  s2body: de
    ? 'Tägliche Quellen werden nächtlich (03:30 UTC) abgerufen. Quellen mit Monats- oder Jahreskadenz behaupten keine Tagesfrische: Jede Feststellung nennt ihren Messstand („Stand: …"). UNHCR- und FAO-Werte werden als versionierte Datendateien redaktionell nachgeführt.'
    : 'Daily sources are retrieved nightly (03:30 UTC). Sources with monthly or annual cadence never claim daily freshness: every finding states its measurement date ("As of: …"). UNHCR and FAO values are maintained editorially as versioned data files.',
  s3: de ? '3. Verarbeitung' : '3. Processing',
  s3body: de
    ? `Jeder Satz ist deterministisch aus Daten erzeugt — Templates statt LLM, Registerfassung ${TEMPLATE_VERSION}, auf jeder Seite ausgewiesen. Das kanonische Artefakt ist die Tages-JSON-Datei im Repository (ein Commit pro Sitzung, Autorin „Protokollführung"); die Prosa ist Darstellung. Code öffentlich: pipelines/protokoll im Site-Repository. dbt-Lineage folgt mit den BigQuery-Werken der Werkgruppe.`
    : `Every sentence is derived deterministically from data — templates, no LLM, register version ${TEMPLATE_VERSION}, stated on every page. The canonical artefact is the daily JSON file in the repository (one commit per session, author "Protokollführung"); the prose is presentation. Code is public: pipelines/protokoll in the site repository. dbt lineage follows with the BigQuery works of the group.`,
  s4: de ? '4. Grenzen der Methode' : '4. Limits of the method',
  s4items: de
    ? [
        'Aufmerksamkeit nutzt die englischsprachige Wikipedia als Proxy globaler Aufmerksamkeit — eine sprachliche und kulturelle Verengung.',
        'Anwesenheit ist eine lineare Extrapolation der UN World Population Prospects, keine Messung.',
        'Ozean meldet die absolute Oberflächentemperatur (NOAA OISST v2.1, bereitgestellt via Climate Reanalyzer) mit Vorjahresvergleich, keine Anomalie gegen eine Baseline.',
        'Feuer zählt Satelliten-Detektionen (VIIRS), nicht einzelne Brände.',
        'Konflikt zählt von GDELT erfasste Medienberichte über Konfliktereignisse, nicht die Ereignisse selbst.',
        'Vertreibung und Ernährung werden manuell nachgeführt; ihr Messstand ist stets ausgewiesen.',
        'Nicht erreichbare Quellen erscheinen als „Feststellung entfällt", unplausible Werte „unter Vorbehalt" — Ausfall wird nie still überbrückt.',
      ]
    : [
        'Attention uses the English-language Wikipedia as a proxy for global attention — a linguistic and cultural narrowing.',
        'Attendance is a linear extrapolation of the UN World Population Prospects, not a measurement.',
        'Ocean reports absolute sea surface temperature (NOAA OISST v2.1, served via Climate Reanalyzer) with a year-on-year comparison, not an anomaly against a baseline.',
        'Fire counts satellite detections (VIIRS), not individual fires.',
        'Conflict counts media reports of conflict events captured by GDELT, not the events themselves.',
        'Displacement and Food are maintained manually; their measurement date is always stated.',
        'Unreachable sources appear as "finding omitted", implausible values "under reserve" — failure is never silently bridged.',
      ],
  s5: de ? '5. Compute-Fußabdruck' : '5. Compute footprint',
  s5body: de
    ? 'Ein Cloud-Run-Lauf pro Tag (< 60 s, 1 vCPU). Eine partitionierte BigQuery-Abfrage pro Tag (≈ 0,5–1 GB verarbeitet, ≈ 25 GB/Monat — innerhalb des Gratiskontingents von 1 TB/Monat). Die Site selbst ist statisch; zur Laufzeit wird kein Cloud-Dienst gelesen.'
    : 'One Cloud Run execution per day (< 60 s, 1 vCPU). One partitioned BigQuery query per day (≈ 0.5–1 GB processed, ≈ 25 GB/month — within the 1 TB/month free tier). The site itself is static; no cloud service is read at runtime.',
  s6: de ? '6. Änderungsprotokoll' : '6. Change log',
  s6items: de
    ? [`Registerfassung ${TEMPLATE_VERSION} — Erstfassung, 12 Tagesordnungspunkte (13 Messwerte).`]
    : [`Register version ${TEMPLATE_VERSION} — first edition, 12 agenda items (13 measurements).`],
  toWork: de ? 'Zum Werk' : 'To the work',
}
---

<div class="mx-auto max-w-2xl px-4 py-14">
  <h1 class="mb-8 text-xl font-semibold">{txt.h1}</h1>

  <section class="mb-8">
    <h2 class="mb-2 font-semibold">{txt.s1}</h2>
    {day ? (
      <table class="w-full text-sm">
        <tbody>
          {day.entries.map((e) => (
            <tr class="border-t border-line align-top">
              <td class="py-2 pr-3 font-mono text-xs text-fg-faint">{e.top_id}</td>
              <td class="py-2 pr-3"><a href={e.source.url} class="transition-colors hover:text-fg" rel="noopener">{e.source.name}</a></td>
              <td class="py-2 text-fg-muted">{e.source.license}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p class="text-fg-muted">{txt.s1empty}</p>
    )}
  </section>

  <section class="mb-8"><h2 class="mb-2 font-semibold">{txt.s2}</h2><p class="leading-relaxed text-fg-muted">{txt.s2body}</p></section>
  <section class="mb-8"><h2 class="mb-2 font-semibold">{txt.s3}</h2><p class="leading-relaxed text-fg-muted">{txt.s3body}</p></section>
  <section class="mb-8">
    <h2 class="mb-2 font-semibold">{txt.s4}</h2>
    <ul class="list-disc space-y-1 pl-5 text-fg-muted">{txt.s4items.map((i) => <li>{i}</li>)}</ul>
  </section>
  <section class="mb-8"><h2 class="mb-2 font-semibold">{txt.s5}</h2><p class="leading-relaxed text-fg-muted">{txt.s5body}</p></section>
  <section class="mb-8">
    <h2 class="mb-2 font-semibold">{txt.s6}</h2>
    <ul class="list-disc space-y-1 pl-5 text-fg-muted">{txt.s6items.map((i) => <li>{i}</li>)}</ul>
  </section>

  <a href={protokollUrl} class="text-sm text-fg-muted transition-colors hover:text-fg">→ {txt.toWork}</a>
</div>
```

- [ ] **Step 3: Werkverzeichnis-Seiten**

`src/pages/werke/index.astro`:
```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
import Page from '@/layouts/Page.astro'
import { WERKE } from '@/data/werke'
import { t } from '@/i18n/ui'
const locale = 'de' as const
---
<Page title={`${t(locale, 'werke.title')} | Frank Bültge`} description={t(locale, 'werke.sub')}>
  <div class="mx-auto max-w-2xl px-4 py-14">
    <h1 class="mb-2 text-xl font-semibold">{t(locale, 'werke.title')}</h1>
    <p class="mb-10 text-fg-muted">{t(locale, 'werke.sub')}</p>
    <ul class="space-y-8">
      {WERKE.map((werk) => (
        <li class="border-t border-line pt-6">
          <a href={getRelativeLocaleUrl(locale, werk.href)} class="group block">
            <h2 class="font-semibold transition-opacity group-hover:opacity-70">{werk.title}</h2>
            <p class="text-sm text-fg-faint">{werk.subtitle[locale]}</p>
            <p class="mt-2 leading-relaxed text-fg-muted">{werk.description[locale]}</p>
          </a>
          <a href={getRelativeLocaleUrl(locale, `/werke/${werk.id}`)} class="mt-2 inline-block font-mono text-xs text-fg-faint transition-colors hover:text-fg">
            {t(locale, 'prot.method')}
          </a>
        </li>
      ))}
    </ul>
  </div>
</Page>
```

`src/pages/werke/protokoll.astro`:
```astro
---
import Page from '@/layouts/Page.astro'
import MethodenblattProtokoll from '@/components/pages/MethodenblattProtokoll.astro'
import { t } from '@/i18n/ui'
const locale = 'de' as const
---
<Page title={`${t(locale, 'prot.method')} — ${t(locale, 'prot.title')} | Frank Bültge`} description={t(locale, 'prot.sub')}>
  <MethodenblattProtokoll locale={locale} />
</Page>
```

- [ ] **Step 4: EN-Pendants** — `src/pages/en/werke/index.astro` und `src/pages/en/werke/protokoll.astro`: identisch, nur `const locale = 'en' as const`.

- [ ] **Step 5: Verifizieren** — Run: `npm run check && npm run build` — Expected: 0 Errors, Build ok

- [ ] **Step 6: Commit**

```bash
git add src/data/werke.ts src/components/pages/MethodenblattProtokoll.astro src/pages/werke src/pages/en/werke
git commit -m "feat(protokoll): works register and method sheet DE/EN"
```

---

### Task 19: Erste Sitzung + Endabnahme

**Files:**
- Create (generiert): `src/content/protokoll/<jahr>/<datum>.json`

- [ ] **Step 1 (Mensch): Keys besorgen & redaktionelle Werte prüfen**
  - FIRMS MAP_KEY: https://firms.modaps.eosdis.nasa.gov/api/ → `export FIRMS_MAP_KEY=...`
  - EIA API Key: https://www.eia.gov/opendata/ → `export EIA_API_KEY=...`
  - GDELT lokal (optional): `gcloud auth application-default login`
  - `pipelines/protokoll/src/protokoll/data/refugees.json` gegen unhcr.org/global-trends prüfen, `food.json` gegen fao.org/worldfoodsituation — Werte/`as_of` ggf. korrigieren und committen.

- [ ] **Step 2: Erste Sitzung erzeugen**

Run (Repo-Wurzel): `npm run protokoll:dry`
Expected: `geschrieben: .../src/content/protokoll/<jahr>/<datum>.json`; auf stderr ggf. „Hinweis — nicht ok: …" für TOPs ohne Key/GCP

- [ ] **Step 3: JSON inspizieren** — alle 13 Einträge vorhanden, Statuscodes plausibel, Quellen-URLs & `as_of` korrekt. Bei `unavailable` durch fehlenden Key: Key setzen, erneut laufen lassen.

- [ ] **Step 4: Alle Suiten + Build**

Run:
```bash
cd pipelines/protokoll && source .venv/bin/activate && pytest -q && cd ../..
npm run test && npm run check && npm run build
```
Expected: alle grün, Build ok

- [ ] **Step 5: Sichtprüfung** — `npm run dev`, dann `/protokoll` (Dokument vollständig, Register korrekt), `/en/protokoll`, `/protokoll/archiv`, `/werke`, `/werke/protokoll`, `/protokoll/feed.xml`. Druckvorschau (⌘P) auf `/protokoll`: schwarz auf weiß, ohne Chrome.

- [ ] **Step 6: Erste Sitzung committen**

```bash
git add src/content/protokoll
git commit -m "protokoll: Sitzung vom <datum> (Erstprotokoll, lokaler Lauf)"
```

- [ ] **Step 7: Abnahme-Checkliste gegen Spec §4**
  - [ ] 12 TOPs / 13 Messwerte, Reihenfolge wie Tagesordnung
  - [ ] Kein LLM; Registerfassung auf jeder Seite ausgewiesen
  - [ ] JSON kanonisch im Repo; Prosa nur Darstellung
  - [ ] Fehler als Form (entfällt / unter Vorbehalt) sichtbar funktionsfähig
  - [ ] DE/EN vollständig; RSS DE/EN; Archiv; Methodenblatt mit 6 Abschnitten
  - [ ] Print-Stylesheet vorhanden
  - [ ] Deploy-Runbook vollständig (`pipelines/protokoll/README.md`)

- [ ] **Step 8: Branch abschließen** — superpowers:finishing-a-development-branch (Merge-Entscheidung beim Nutzer). GCP-Deploy nach Merge gemäß Runbook.
