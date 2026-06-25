# The Round Number — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build „The Round Number" / *Die runde Zahl* — a Gegenmessung instrument that puts digit-forensics (Benford) on trial: it runs the test on a real official series, shows the "anomaly", then quantifies how often the same test flags provably-clean data of the same size (its false-positive rate).

**Architecture:** A standalone Python pipeline (`pipelines/round-number/`, installable, pytest) computes Benford first-digit + last-digit statistics on a curated set of committed numeric datasets, plus a seeded bootstrap false-positive rate (the self-skeptical core), and writes `src/data/round-number/latest.json` + dated snapshots. The Astro frontend renders a DE/EN page with a digit histogram + the verdict-vs-false-positive pairing, mirroring the existing **Redaction**/**Consensus** instruments. A nightly GitHub Actions workflow (no network needed — datasets are committed) runs the rotation and commits the result; CI runs pytest + vitest.

**Tech Stack:** Python 3.12 (stdlib only — `math`, `random`, `json`; pytest), Astro 5 + Tailwind v4 (TS, vitest), GitHub Actions, Git-as-archive.

## Global Constraints

- **Bilingual DE/EN from day one.** EN at `/` (default), DE under `/de/`. Mirror-file pattern (one component, two route files differing only in `locale`).
- **Git is the archive.** Datasets and day-JSONs are committed; the site reads committed data at build time. No live reads at site runtime.
- **No LLM.** Pure symbolic statistics, deterministic, version-stamped (`method_version`).
- **The method is the subject — no fraud accusation against any institution, ever.** Copy says: anomaly ≠ fraud; Benford is not universally applicable; thresholds are a set choice; controls are synthetic and labelled.
- **Determinism + test protection** for every statistic and the seeded false-positive bootstrap. Same inputs + seed → identical output.
- **Provenance:** each real series links its public source; the histogram (observed vs expected) is shown so anyone can re-check. Synthetic controls carry `synthetic: true`.
- **Naming:** title „The Round Number" (EN convention), route `/round-number`, Methodenblatt `/werke/round-number`, i18n prefix `rn.`, OG slug `round-number`, data dir `src/data/round-number/`, pipeline `pipelines/round-number/`, git bot identity `Gegenmessung <gegenmessung@frankbueltge.de>`.
- **Data path:** flat `src/data/round-number/<YYYY-MM-DD>.json` + `latest.json` (matches Redaction/Consensus).

## Nigrini MAD thresholds (first-digit), copied verbatim for use in code

`mad ≤ 0.006` → `close` · `≤ 0.012` → `acceptable` · `≤ 0.015` → `marginal` · `> 0.015` → `nonconformity`.
The **flag threshold** for the false-positive bootstrap is `nonconformity` (mad > 0.015).

---

## File Structure

**Pipeline (new):**
- `pipelines/round-number/pyproject.toml` — package config (stdlib only; dev: pytest)
- `pipelines/round-number/src/round_number/__init__.py` — `PIPELINE_VERSION`, `SCHEMA_VERSION`, `METHOD_VERSION`
- `pipelines/round-number/src/round_number/benford.py` — first-digit expectation, MAD, chi², verdict (pure)
- `pipelines/round-number/src/round_number/lastdigit.py` — last-digit uniformity chi² + verdict (pure)
- `pipelines/round-number/src/round_number/controls.py` — seeded clean-Benford sampler + false-positive rate (pure)
- `pipelines/round-number/src/round_number/datasets.py` — `Dataset` type, JSON loader, curated registry, synthetic controls
- `pipelines/round-number/src/round_number/build.py` — per-series analysis + date rotation + day record (pure)
- `pipelines/round-number/src/round_number/run.py` — IO entrypoint (`--repo-root`, writes latest + dated)
- `pipelines/round-number/data/*.json` — committed datasets (real series + provenance)
- `pipelines/round-number/tests/` — pytest + `fixtures/`

**Frontend (new), mirroring Redaction:**
- `src/lib/round-number/types.ts`, `format.ts`, `histogram.ts` (SVG), `format.test.ts`, `histogram.test.ts`
- `src/components/pages/RoundNumberPage.astro`, `MethodenblattRoundNumber.astro`
- `src/pages/round-number/index.astro` (en) + `src/pages/de/round-number/index.astro` (de)
- `src/pages/werke/round-number.astro` (en) + `src/pages/de/werke/round-number.astro` (de)
- `src/data/round-number/latest.json` (pipeline output, committed)

**Wire-up (modify):**
- `src/i18n/ui.ts` (`rn.title`, `rn.sub`, `rn.empty`), `src/lib/og.ts`, `src/data/werke.ts`, `package.json`,
  `.github/workflows/round-number.yml` (new), `.github/workflows/ci.yml` (add pytest job).

---

## Task 1: Pipeline scaffold

**Files:**
- Create: `pipelines/round-number/pyproject.toml`, `pipelines/round-number/.gitignore`
- Create: `pipelines/round-number/src/round_number/__init__.py`
- Test: `pipelines/round-number/tests/test_smoke.py`

- [ ] **Step 1: pyproject.toml**

```toml
[project]
name = "round-number"
version = "0.1.0"
description = "Nightly pipeline: digit-forensics on trial (frankbueltge.de)"
requires-python = ">=3.12"
dependencies = []

[project.optional-dependencies]
dev = ["pytest>=8"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools]
package-dir = { "" = "src" }

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
round_number = ["data/*.json"]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
```

- [ ] **Step 2: `.gitignore`** → `.venv/\n__pycache__/\n*.egg-info/`

- [ ] **Step 3: `__init__.py`**

```python
"""The Round Number — nightly Gegenmessung pipeline: digit-forensics on trial."""
PIPELINE_VERSION = "0.1.0"
SCHEMA_VERSION = "1"
METHOD_VERSION = "1"
```

- [ ] **Step 4: smoke test + run**

```python
# tests/test_smoke.py
import round_number
def test_versions():
    assert round_number.METHOD_VERSION == "1"
```
Run: `cd pipelines/round-number && python -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]" && python -m pytest -q` → PASS

- [ ] **Step 5: Commit** `git add pipelines/round-number/pyproject.toml pipelines/round-number/.gitignore pipelines/round-number/src pipelines/round-number/tests && git commit -m "feat(round-number): pipeline scaffold"`

---

## Task 2: Benford first-digit statistics

**Files:** Create `pipelines/round-number/src/round_number/benford.py`; Test `tests/test_benford.py`

**Interfaces — Produces:**
- `expected() -> list[float]` (9 Benford probabilities, d=1..9)
- `leading_digit(x: float) -> int | None` (None for 0)
- `counts(numbers: list[float]) -> list[int]` (length 9)
- `mad(obs_props: list[float], exp_props: list[float]) -> float`
- `chi2(obs_counts: list[int], exp_counts: list[float]) -> float`
- `verdict(mad_value: float) -> str` ∈ {close, acceptable, marginal, nonconformity}
- `analyze(numbers: list[float]) -> dict` → `{n, observed:[9 props], expected:[9 props], chi2, mad, verdict}`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_benford.py
import math
from round_number.benford import expected, leading_digit, counts, mad, verdict, analyze


def test_expected_is_benford_and_sums_to_one():
    e = expected()
    assert len(e) == 9
    assert abs(sum(e) - 1.0) < 1e-9
    assert abs(e[0] - math.log10(2)) < 1e-9  # P(1) = log10(2) ≈ 0.301


def test_leading_digit():
    assert leading_digit(1234) == 1
    assert leading_digit(0.0042) == 4
    assert leading_digit(-95.6) == 9
    assert leading_digit(0) is None


def test_counts_length_and_tally():
    assert counts([1, 1, 2, 9, 95, 0]) == [2, 1, 0, 0, 0, 0, 0, 0, 1]  # 1,1,2,9,9; 0 ignored


def test_mad_zero_when_equal():
    e = expected()
    assert mad(e, e) == 0.0


def test_verdict_thresholds():
    assert verdict(0.005) == "close"
    assert verdict(0.010) == "acceptable"
    assert verdict(0.013) == "marginal"
    assert verdict(0.020) == "nonconformity"


def test_analyze_perfect_benford_has_low_mad():
    # counts proportional to Benford → mad ~ 0
    nums = []
    for d, p in zip(range(1, 10), expected()):
        nums += [d * 1.0] * round(p * 100000)
    a = analyze(nums)
    assert a["verdict"] == "close" and a["mad"] < 0.006
    assert a["n"] == len(nums)
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `benford.py`**

```python
"""Benford first-digit test (symbolic, deterministic). The thresholds are
Nigrini's fixed MAD bands — and their sample-size blindness is the subject."""
from __future__ import annotations

import math

_EXPECTED = [math.log10(1 + 1 / d) for d in range(1, 10)]
_BANDS = ((0.006, "close"), (0.012, "acceptable"), (0.015, "marginal"))


def expected() -> list[float]:
    return list(_EXPECTED)


def leading_digit(x: float) -> int | None:
    x = abs(float(x))
    if x == 0:
        return None
    return int(f"{x:.15e}"[0])  # %e → one nonzero digit before the point


def counts(numbers: list[float]) -> list[int]:
    out = [0] * 9
    for x in numbers:
        d = leading_digit(x)
        if d is not None:
            out[d - 1] += 1
    return out


def mad(obs_props: list[float], exp_props: list[float]) -> float:
    return sum(abs(o - e) for o, e in zip(obs_props, exp_props)) / len(exp_props)


def chi2(obs_counts: list[int], exp_counts: list[float]) -> float:
    return sum((o - e) ** 2 / e for o, e in zip(obs_counts, exp_counts) if e > 0)


def verdict(mad_value: float) -> str:
    for limit, label in _BANDS:
        if mad_value <= limit:
            return label
    return "nonconformity"


def analyze(numbers: list[float]) -> dict:
    c = counts(numbers)
    n = sum(c)
    obs = [ci / n for ci in c] if n else [0.0] * 9
    exp = expected()
    return {
        "n": n,
        "observed": obs,
        "expected": exp,
        "chi2": round(chi2(c, [n * p for p in exp]), 4),
        "mad": round(mad(obs, exp), 6),
        "verdict": verdict(mad(obs, exp)),
    }
```

- [ ] **Step 4: Run, verify pass.** → PASS

- [ ] **Step 5: Commit** `git add ...benford.py tests/test_benford.py && git commit -m "feat(round-number): Benford first-digit test (tested)"`

---

## Task 3: Last-digit uniformity

**Files:** Create `src/round_number/lastdigit.py`; Test `tests/test_lastdigit.py`

**Interfaces — Produces:** `analyze(numbers: list[float]) -> dict` → `{n, observed:[10 props], chi2, verdict}`; verdict ∈ {uniform, heaped} (heaped if chi² > 16.92, the 0.05 critical value for 9 dof).

- [ ] **Step 1: Write failing tests**

```python
# tests/test_lastdigit.py
from round_number.lastdigit import analyze


def test_uniform_digits_pass():
    nums = list(range(1000))  # last digits perfectly uniform
    a = analyze(nums)
    assert a["verdict"] == "uniform" and a["n"] == 1000


def test_heaped_on_multiples_of_ten():
    nums = [10 * k for k in range(1, 201)]  # last digit always 0
    a = analyze(nums)
    assert a["verdict"] == "heaped"
    assert a["observed"][0] == 1.0
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `lastdigit.py`**

```python
"""Last-digit uniformity test. Heaping (e.g. rounding to 0/5) is a fabrication tell."""
from __future__ import annotations

CRITICAL_9DOF_05 = 16.92  # chi-square critical value, 9 dof, p=0.05


def last_digit(x: float) -> int:
    return int(abs(round(float(x)))) % 10


def analyze(numbers: list[float]) -> dict:
    obs = [0] * 10
    for x in numbers:
        obs[last_digit(x)] += 1
    n = sum(obs)
    exp = n / 10 if n else 0
    chi2 = sum((o - exp) ** 2 / exp for o in obs) if exp else 0.0
    return {
        "n": n,
        "observed": [o / n for o in obs] if n else [0.0] * 10,
        "chi2": round(chi2, 4),
        "verdict": "heaped" if chi2 > CRITICAL_9DOF_05 else "uniform",
    }
```

- [ ] **Step 4: Run, verify pass.** → PASS

- [ ] **Step 5: Commit**

---

## Task 4: Controls — seeded false-positive rate (the self-skeptical core)

**Files:** Create `src/round_number/controls.py`; Test `tests/test_controls.py`

**Interfaces:**
- Consumes: `benford.expected`, `benford.counts`/`mad`.
- Produces:
  - `sample_leading_digits(n: int, rng: random.Random) -> list[int]` — n leading digits drawn from the Benford pmf.
  - `false_positive_rate(n: int, *, threshold: float = 0.015, samples: int = 500, seed: int) -> float` — fraction of clean Benford samples of size `n` whose first-digit MAD exceeds `threshold` (i.e. the test would wrongly flag them). Deterministic for a given seed.

- [ ] **Step 1: Write failing tests**

```python
# tests/test_controls.py
from round_number.controls import sample_leading_digits, false_positive_rate
import random


def test_sample_returns_digits_1_to_9():
    rng = random.Random(1)
    s = sample_leading_digits(1000, rng)
    assert len(s) == 1000 and set(s) <= set(range(1, 10))


def test_small_sample_has_high_false_positive_rate():
    # tiny n: clean Benford data frequently breaches the 0.015 MAD threshold
    fp = false_positive_rate(40, samples=300, seed=7)
    assert fp > 0.3


def test_large_sample_has_low_false_positive_rate():
    # large n: the test rarely flags clean data
    fp = false_positive_rate(5000, samples=200, seed=7)
    assert fp < 0.05


def test_deterministic_for_seed():
    assert false_positive_rate(100, samples=100, seed=3) == false_positive_rate(100, samples=100, seed=3)
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `controls.py`**

```python
"""The self-skeptical core: how often does the same test flag provably-clean data?
Clean = leading digits drawn from the true Benford pmf. Seeded → reproducible."""
from __future__ import annotations

import random

from round_number.benford import counts, expected, mad

_DIGITS = list(range(1, 10))


def sample_leading_digits(n: int, rng: random.Random) -> list[int]:
    e = expected()
    return rng.choices(_DIGITS, weights=e, k=n)


def _mad_of_sample(digits: list[int]) -> float:
    # digits are already leading digits 1..9 → reuse counts() via digit value as the number
    c = counts([float(d) for d in digits])
    n = sum(c)
    obs = [ci / n for ci in c] if n else [0.0] * 9
    return mad(obs, expected())


def false_positive_rate(n: int, *, threshold: float = 0.015, samples: int = 500, seed: int) -> float:
    rng = random.Random(seed)
    flagged = 0
    for _ in range(samples):
        digits = sample_leading_digits(n, rng)
        if _mad_of_sample(digits) > threshold:
            flagged += 1
    return round(flagged / samples, 4)
```

- [ ] **Step 4: Run, verify pass.** (If the >0.3 / <0.05 bounds are borderline, widen the n values, not the assertions — keep the qualitative claim.) → PASS

- [ ] **Step 5: Commit**

---

## Task 5: Datasets registry + loader

**Files:** Create `src/round_number/datasets.py`; Create `pipelines/round-number/data/_control_clean.json`, `data/_control_tampered.json`; Test `tests/test_datasets.py` + `tests/fixtures/sample.json`

**Interfaces — Produces:**
- `Dataset` dataclass: `id: str, name: str, institution: str, synthetic: bool, source: dict, values: list[float]`.
- `load_file(path: Path) -> Dataset` — reads a JSON `{id,name,institution,synthetic,source,values}`.
- `load_all(data_dir: Path) -> list[Dataset]` — loads every `*.json` in the dir, sorted by id.

- [ ] **Step 1: Write fixture** `tests/fixtures/sample.json`

```json
{ "id": "sample", "name": "Sample series", "institution": "Test", "synthetic": true,
  "source": { "name": "fixture", "url": "https://example.test", "license": "n/a", "retrieved": "2026-06-25" },
  "values": [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144] }
```

- [ ] **Step 2: Write failing test**

```python
# tests/test_datasets.py
from pathlib import Path
from round_number.datasets import load_file, Dataset

FIX = Path(__file__).parent / "fixtures" / "sample.json"


def test_load_file():
    d = load_file(FIX)
    assert isinstance(d, Dataset)
    assert d.id == "sample" and d.synthetic is True
    assert d.values[:3] == [1.0, 1.0, 2.0]
    assert d.source["url"].startswith("https://")
```

- [ ] **Step 3: Run, verify fail.** → FAIL

- [ ] **Step 4: Implement `datasets.py`**

```python
"""Curated dataset registry. Real public series + labelled synthetic controls,
all committed (Git = archive)."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Dataset:
    id: str
    name: str
    institution: str
    synthetic: bool
    source: dict
    values: list[float]


def load_file(path: Path) -> Dataset:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return Dataset(
        id=raw["id"], name=raw["name"], institution=raw["institution"],
        synthetic=bool(raw.get("synthetic", False)), source=raw["source"],
        values=[float(v) for v in raw["values"]],
    )


def load_all(data_dir: Path) -> list[Dataset]:
    return [load_file(p) for p in sorted(data_dir.glob("*.json"))]
```

- [ ] **Step 5: Create the two synthetic control data files** (committed): `data/_control_clean.json` (a few thousand values whose leading digits follow Benford — generate once with a script and paste, OR commit a generator note) and `data/_control_tampered.json` (values rounded to multiples of 10/100 so last-digit heaps). Mark both `"synthetic": true`. (Generation command shown in Task 10; for now a small placeholder set is acceptable since Task 10 regenerates.)

- [ ] **Step 6: Run, verify pass.** → PASS

- [ ] **Step 7: Commit**

---

## Task 6: Build — per-series analysis + date rotation + day record

**Files:** Create `src/round_number/build.py`; Test `tests/test_build.py`

**Interfaces:**
- Consumes: `benford.analyze`, `lastdigit.analyze`, `controls.false_positive_rate`, `datasets.Dataset`.
- Produces:
  - `CONTROL_SAMPLES = 500`, `FLAG_THRESHOLD = 0.015`.
  - `analyze_series(ds: Dataset) -> dict` → `{id,name,institution,synthetic,source,n,benford,last_digit,control}` where `control = {method, seed, samples, threshold, false_positive_rate, verdict_on_clean}`. `seed = n` (deterministic, disclosed). `verdict_on_clean = "frequently flagged"` if `false_positive_rate >= 0.2` else `"rarely flagged"`.
  - `rotation_pick(ids: list[str], date_iso: str) -> str | None` — `ids[ordinal(date) % len(ids)]`; `None` if empty.
  - `day_record(date_iso, generated_at, results: list[dict], pick) -> dict`.
  - `to_json(record) -> str` (sorted keys, indent 2, trailing newline).

- [ ] **Step 1: Write failing tests**

```python
# tests/test_build.py
from datetime import date
from round_number.build import analyze_series, rotation_pick, day_record
from round_number.datasets import Dataset

DS = Dataset(id="d1", name="N", institution="I", synthetic=False,
             source={"name": "s", "url": "https://x.test", "license": "l", "retrieved": "2026-06-25"},
             values=[float(x) for x in range(1, 401)])


def test_analyze_series_shape():
    r = analyze_series(DS)
    assert r["id"] == "d1" and r["n"] == 400
    assert set(r["benford"]) >= {"observed", "expected", "mad", "verdict"}
    assert "false_positive_rate" in r["control"]
    assert r["control"]["seed"] == 400


def test_rotation_is_deterministic_by_date():
    ids = ["a", "b", "c"]
    p1 = rotation_pick(ids, "2026-06-25")
    assert p1 in ids
    assert rotation_pick(ids, "2026-06-25") == p1
    assert rotation_pick(ids, "2026-06-26") == ids[(date(2026, 6, 26).toordinal()) % 3]


def test_day_record_has_pick_and_versions():
    rec = day_record("2026-06-25", "2026-06-25T05:00:00Z", [analyze_series(DS)], "d1")
    assert rec["pick"] == "d1" and rec["method_version"]
    assert len(rec["series"]) == 1
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `build.py`**

```python
"""Pure assembly: per-series statistics, date rotation, day record. No IO."""
from __future__ import annotations

import json
from datetime import date

from round_number import METHOD_VERSION, PIPELINE_VERSION, SCHEMA_VERSION
from round_number import benford, controls, lastdigit
from round_number.datasets import Dataset

CONTROL_SAMPLES = 500
FLAG_THRESHOLD = 0.015


def analyze_series(ds: Dataset) -> dict:
    b = benford.analyze(ds.values)
    ld = lastdigit.analyze(ds.values)
    seed = b["n"]
    fpr = controls.false_positive_rate(
        b["n"], threshold=FLAG_THRESHOLD, samples=CONTROL_SAMPLES, seed=seed
    )
    return {
        "id": ds.id, "name": ds.name, "institution": ds.institution,
        "synthetic": ds.synthetic, "source": ds.source, "n": b["n"],
        "benford": b, "last_digit": ld,
        "control": {
            "method": "bootstrap of clean Benford samples, same n",
            "seed": seed, "samples": CONTROL_SAMPLES, "threshold": FLAG_THRESHOLD,
            "false_positive_rate": fpr,
            "verdict_on_clean": "frequently flagged" if fpr >= 0.2 else "rarely flagged",
        },
    }


def rotation_pick(ids: list[str], date_iso: str) -> str | None:
    if not ids:
        return None
    ordinal = date.fromisoformat(date_iso).toordinal()
    return ids[ordinal % len(ids)]


def day_record(date_iso: str, generated_at: str, results: list[dict], pick: str | None) -> dict:
    return {
        "date": date_iso, "generated_at": generated_at,
        "schema_version": SCHEMA_VERSION, "pipeline_version": PIPELINE_VERSION,
        "method_version": METHOD_VERSION, "pick": pick,
        "series": sorted(results, key=lambda r: r["id"]),
    }


def to_json(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
```

- [ ] **Step 4: Run, verify pass.** → PASS

- [ ] **Step 5: Commit**

---

## Task 7: Run entrypoint

**Files:** Create `src/round_number/run.py`; Test `tests/test_run.py`

**Interfaces:**
- `run(repo_root, *, today: date, data_dir: Path | None = None) -> dict` — loads datasets (default: package `data/`), analyses each, picks by date, returns the record (writes nothing — testable).
- `main(argv=None) -> int` — CLI `--repo-root`, `--date`; writes `src/data/round-number/<date>.json` + `latest.json`.

- [ ] **Step 1: Write failing test** (uses the fixtures dir as the data dir)

```python
# tests/test_run.py
from datetime import date
from pathlib import Path
from round_number.run import run

DATA = Path(__file__).parent / "fixtures"


def test_run_over_fixture_dir():
    rec = run(".", today=date(2026, 6, 25), data_dir=DATA)
    assert rec["series"] and rec["pick"] is not None
    assert rec["series"][0]["benford"]["verdict"] in {"close", "acceptable", "marginal", "nonconformity"}
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `run.py`**

```python
"""Orchestration + IO. Datasets are committed → no network needed."""
from __future__ import annotations

import argparse
import sys
from datetime import date, datetime, timezone
from importlib.resources import files
from pathlib import Path

from round_number.build import analyze_series, day_record, rotation_pick, to_json
from round_number.datasets import load_all


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _default_data_dir() -> Path:
    return Path(str(files("round_number") / "data"))


def run(repo_root: str, *, today: date, data_dir: Path | None = None) -> dict:
    datasets = load_all(data_dir or _default_data_dir())
    results = [analyze_series(ds) for ds in datasets]
    pick = rotation_pick([r["id"] for r in results], today.isoformat())
    return day_record(today.isoformat(), _now_iso(), results, pick)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None)
    args = p.parse_args(argv)
    today = (datetime.strptime(args.date, "%Y-%m-%d").date()
             if args.date else datetime.now(timezone.utc).date())
    rec = run(args.repo_root, today=today)
    out_dir = Path(args.repo_root) / "src" / "data" / "round-number"
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = to_json(rec)
    (out_dir / f"{today.isoformat()}.json").write_text(payload, encoding="utf-8")
    (out_dir / "latest.json").write_text(payload, encoding="utf-8")
    print(f"round-number: {len(rec['series'])} series → pick={rec['pick']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run full suite** `python -m pytest -q` → all PASS

- [ ] **Step 5: Commit**

---

## Task 8: TS types + format + histogram SVG

**Files:** Create `src/lib/round-number/types.ts`, `format.ts`, `histogram.ts`, `format.test.ts`, `histogram.test.ts`

**Interfaces — Produces:**
- `types.ts`: `RoundNumberData`, `Series`, `Benford`, `LastDigit`, `Control` (mirror `build.day_record`).
- `format.ts`: `percent(x, locale)`, `verdictLabel(v, locale)`, `dateLabel(iso, locale)`.
- `histogram.ts`: `bars(observed: number[], expected: number[], opts) -> {x,y,w,h,kind}[]` — pure layout for an SVG bar chart (observed vs expected overlay). Pattern: `src/lib/halbwertszeit/svg.ts`.

- [ ] **Step 1: types.ts** — match the JSON shape exactly (`series[].benford.observed/expected/mad/verdict`, `series[].control.false_positive_rate`, etc.). 
- [ ] **Step 2: failing tests** for `percent` (de/en) and `bars` (returns one bar per observed value, heights proportional, within viewport).
- [ ] **Step 3: implement** `format.ts` + `histogram.ts` (pure math; `bars` maps 9 observed props to rects, with expected as a reference line/overlay).
- [ ] **Step 4: run vitest** `npm run test -- src/lib/round-number` → PASS
- [ ] **Step 5: Commit**

Reference for `percent`/`dateLabel`: copy the shape of `src/lib/redaction/format.ts`. Reference for SVG layout + its test: `src/lib/halbwertszeit/svg.ts` + `svg.test.ts`.

---

## Task 9: Frontend pages + Methodenblatt

**Files:** Create `src/components/pages/RoundNumberPage.astro`, `MethodenblattRoundNumber.astro`, the four route files, and seed `src/data/round-number/latest.json` (`pick:null` placeholder).

**Pattern:** copy `RedactionPage.astro` / `MethodenblattRedaction.astro` structure. The page shows the **defendant of the day** (`pick`): its name + source link, the **digit histogram** (observed vs Benford, via `histogram.ts`), the Benford verdict + MAD — and prominently, paired beside it, the **false-positive rate** sentence: *„Derselbe Test nennt nachweislich saubere Daten in {fpr} der Fälle genauso verdächtig."* / *"The same test calls provably-clean data of this size 'suspicious' {fpr} of the time."* Empty state (`pick:null`, no run yet) → `rn.empty`.

- [ ] **Step 1: seed latest.json** `{date, generated_at, schema_version:"1", pipeline_version:"0.1.0", method_version:"1", pick:null, series:[]}`
- [ ] **Step 2: RoundNumberPage.astro** (defendant + histogram + verdict-vs-false-positive pairing; `pick:null`→empty; `de` boolean copy)
- [ ] **Step 3: MethodenblattRoundNumber.astro** — mirror `MethodenblattRedaction`: was es ist (die Methode vor Gericht); 1. Quellen; 2. Kadenz (tägliche Rotation, fair); 3. Verarbeitung (Benford-MAD/χ² + Last-Digit + seedgesteuerter Falsch-Positiv-Bootstrap); 4. Grenzen (Benford nicht universell; Anomalie≠Betrug; Schwellen gesetzt; Kontrollen synthetisch; kleine n unzuverlässig); 5. Compute (reine Statistik, kein Netz, kein LLM); 6. Änderungsprotokoll (v1). Include the symbolic-AI block.
- [ ] **Step 4: four route files** (copy from `src/pages/round-number` ↔ redaction analogues; swap component + `rn.*` keys).
- [ ] **Step 5: `npm run check`** → no new errors
- [ ] **Step 6: Commit**

---

## Task 10: Wire-up + CI + real datasets + verify

**Files:** Modify `src/i18n/ui.ts`, `src/lib/og.ts`, `src/data/werke.ts`, `package.json`; Create `.github/workflows/round-number.yml`; Modify `.github/workflows/ci.yml`; Create real dataset files under `pipelines/round-number/data/`.

- [ ] **Step 1: i18n** — add to `de` and `en`:
  - `rn.title`: 'The Round Number'
  - `rn.sub`: de „Ein Test, der angeblich gefälschte Zahlen erkennt — und wie oft er sich irrt." / en "A test that claims to spot faked numbers — and how often it is wrong."
  - `rn.empty`: de „Die erste Verhandlung folgt mit dem nächsten nächtlichen Lauf." / en "The first hearing follows with the next nightly run."
- [ ] **Step 2: og.ts** — add `round-number` to `OG_PAGES` + `if (p.startsWith('/round-number') || p.startsWith('/werke/round-number')) return 'round-number'`.
- [ ] **Step 3: werke.ts** — add the `round-number` Werk entry (status 'live', href '/round-number', line Gegenmessung, DE/EN subtitle + description naming „die Methode vor Gericht").
- [ ] **Step 4: package.json** — add `"round-number:refresh": "pipelines/round-number/.venv/bin/python -m round_number.run --repo-root ."`.
- [ ] **Step 5: round-number.yml** — mirror `redaction.yml` (cron `0 5 * * *`, `pip install ./pipelines/round-number`, `python -m round_number.run --repo-root .`, commit `src/data/round-number`, bot `Gegenmessung`, push-retry loop).
- [ ] **Step 6: ci.yml** — add a `round-number` pytest job (working-directory `pipelines/round-number`, `pip install -e ".[dev]"`, `pytest -q`).
- [ ] **Step 7: Obtain 3–6 real datasets** (network step; sandbox disabled). Use the keyless **World Bank API** (`https://api.worldbank.org/v2/country/all/indicator/<IND>?format=json&per_page=400&date=<year>`) for series that span orders of magnitude across countries — e.g. population (`SP.POP.TOTL`), GDP (`NY.GDP.MKTP.CD`), CO₂ (`EN.GHG.CO2.MT.CE.AR5`). For each: fetch, drop nulls, write `pipelines/round-number/data/<id>.json` with `synthetic:false` + source. Also (re)generate `_control_clean.json` (seeded Benford draws) and `_control_tampered.json` (rounded values). Document the exact fetch in the data files' `source`.
- [ ] **Step 8: Generate first real data** `source pipelines/round-number/.venv/bin/activate && python -m round_number.run --repo-root .` → inspect `latest.json`: real MADs/verdicts present, false-positive rates plausible (small-n series → higher fpr).
- [ ] **Step 9: Full verify** `npm run check && npm run test && npm run build` → clean (the `/round-number`, `/de/round-number`, `/werke/round-number` routes render).
- [ ] **Step 10: Commit** workflow + ci + wire-up + datasets + first snapshot.

---

## Self-Review (against the spec)

**Spec coverage:** §3 datasets → Task 5 + Task 10.7 ✓ · §4 tests → Tasks 2,3 ✓ · §5 self-skeptical control → Task 4 ✓ · §6 cadence/rotation → Task 6 (`rotation_pick`) ✓ · §7 data model → Task 6 + Task 8 types ✓ · §8 provenance/error-as-form → Task 5 (source) + Task 7 ✓ · §9 limits → Task 9 (Methodenblatt) ✓ · §10 Avantgarde-Latte → inherent ✓ · §11 gate → across ✓ · §12 pipeline/determinism → Tasks 1-7 + Task 10.6 ✓ · §13 frontend → Tasks 8,9,10 ✓ · §14 tests → pytest + vitest ✓ · §15 non-goals → honored (no LLM, no accusation, no realtime) ✓.

**Placeholder scan:** the only deferred items are the concrete real datasets (Task 10.7) and the synthetic control contents (Task 5.5 → regenerated in 10.7) — both are data, fetched in a dedicated network task, flagged explicitly. No logic gaps.

**Type consistency:** `Dataset{id,name,institution,synthetic,source,values}`, `analyze_series` output keys, and the TS `RoundNumberData/Series` shape match `build.day_record` exactly. `false_positive_rate` signature identical in Task 4 and its use in Task 6.

## Notes for the executor
- **No merge to `main`, no deploy** — Frank approves that separately. All work on `feat/round-number`.
- Keep all test strings/assertions intact; if a statistical bound is borderline, adjust the sample size `n`, not the assertion.
- The false-positive bootstrap is the artistic heart — keep it seeded and disclosed.
- Real datasets must span orders of magnitude (Benford-applicable); never include bounded/clustered series (percentages, ages).
