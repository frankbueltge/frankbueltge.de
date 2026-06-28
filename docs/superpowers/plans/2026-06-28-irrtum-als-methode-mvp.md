# Irrtum als Methode — MVP (die Forschungsschleife) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Forschungsschleife als lauffähigen, ehrlichen Prototyp beweisen — Korpus → ML-Sichtung → LLM-These → symbolische Prüfung + Kritiker → Verdikt → Sitzungs-Record — bevor Schema/Frontend/Workflow gebaut werden.

**Architecture:** Neues Standalone-Python-Paket `pipelines/irrtum/` (Layout wie `ghost-fleet`). Der MVP-Korpus ist das committete **Protokoll-Archiv** (`src/content/protokoll/**`, gelesen wie in `pipelines/pattern/refresh.py`). Deterministisches Gerüst (Korpus, Sichtung/Permutationstest, symbolische Prüfung, Verdikt, Record) ist voll getestet; die zwei LLM-Schritte (These, Kritiker) nutzen das Parallaxe-Gemini-Muster und werden in Tests **gemockt**, per Echtlauf iteriert. Output ist ein Sitzungs-JSON unter `src/data/irrtum/` (Frontend + Content-Collection sind spätere Schnitte).

**Tech Stack:** Python 3.12, `httpx>=0.27` (LLM), `numpy` (Korrelation/Permutation, wie `pattern`), `pytest`.

## Global Constraints

- **Kein Orakel:** LLM-Aussagen sind **Konjektur** und werden nie als Fakt geführt. Nur symbolisch/statistisch geprüfte Teilbehauptungen tragen Status „belegt". Modell/Prompt/Methode/Eingabedaten stehen im Record.
- **Widerlegtes wird bewahrt, nicht versteckt** — `verdict="refuted"` ist ein gültiges, vollwertiges Ergebnis mit Begründung.
- **Secrets:** LLM-Key aus `GEMINI_API_KEY` bzw. `GOOGLE_API_KEY` (Env), nie in Record/Fehlertext. Header `x-goog-api-key`, kein Query-Param.
- **Determinismus, wo möglich:** Sichtung/Permutation mit aus dem Datum geseedeter `np.random.default_rng` (reproduzierbar). LLM-Nichtdeterminismus wird offengelegt (Modell im Record), nicht kaschiert.
- **Korpus read-only aus dem Repo** (Git ist das Archiv) — kein Live-Cloud-Read.
- **Paket-Konvention:** Lauf als `python -m irrtum.run --repo-root .`; Tests `cd pipelines/irrtum && pytest -q` (eigene venv).
- **Session-Schema (verbindlich, von allen Tasks geteilt):**
  ```python
  Verdict = Literal["survived", "refuted", "inconclusive"]
  @dataclass(frozen=True)
  class Finding:        # die ML-Sichtung
      pair: tuple[str, str]      # zwei top_ids
      r: float                   # Pearson-Korrelation
      fdr: float                 # Permutations-Anteil (Rauschwahrscheinlichkeit)
      n: int                     # gemeinsame Datenpunkte
  @dataclass(frozen=True)
  class Thesis:         # LLM-Konjektur
      method: str                # benannte AR-Methode
      text: str                  # die These (Konjektur)
      cited_r: float             # die Zahl, auf die sich die These quantitativ stützt
      reasoning: str
  @dataclass(frozen=True)
  class Session:
      date: str
      finding: Finding
      thesis: Thesis
      symbolic_ok: bool          # stützt die echte Zahl die These?
      critic_supported: bool     # adversarialer LLM-Kritiker
      critic_text: str
      verdict: Verdict
      model: str                 # offengelegt
  ```

---

### Task 1: Paket-Gerüst

**Files:**
- Create: `pipelines/irrtum/pyproject.toml`
- Create: `pipelines/irrtum/src/irrtum/__init__.py`
- Create: `pipelines/irrtum/tests/test_smoke.py`

**Interfaces:**
- Produces: importierbares Paket `irrtum`; `irrtum.__version__`.

- [ ] **Step 1: Failing smoke test**

Create `pipelines/irrtum/tests/test_smoke.py`:
```python
def test_import():
    import irrtum
    assert irrtum.__version__
```

- [ ] **Step 2: pyproject + package**

Create `pipelines/irrtum/pyproject.toml`:
```toml
[project]
name = "irrtum"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["httpx>=0.27", "numpy>=1.26"]

[project.optional-dependencies]
dev = ["pytest>=8"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools]
package-dir = { "" = "src" }

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
```
Create `pipelines/irrtum/src/irrtum/__init__.py`:
```python
__version__ = "0.1.0"
```

- [ ] **Step 3: venv + run test**

Run:
```bash
cd pipelines/irrtum && python3 -m venv .venv && source .venv/bin/activate && pip install -e '.[dev]'
pytest -q
```
Expected: 1 passed.

- [ ] **Step 4: Commit**
```bash
git add pipelines/irrtum/pyproject.toml pipelines/irrtum/src/irrtum/__init__.py pipelines/irrtum/tests/test_smoke.py
git commit -m "feat(irrtum): Paket-Gerüst (standalone, httpx+numpy)"
```

---

### Task 2: Korpus-Lader

Liest das committete Protokoll-Archiv zu Zeitreihen je `top_id` (Muster aus `pipelines/pattern/refresh.py`).

**Files:**
- Create: `pipelines/irrtum/src/irrtum/corpus.py`
- Create: `pipelines/irrtum/tests/fixtures/protokoll/2026/2026-06-01.json` (+ `-02`, `-03`)
- Create: `pipelines/irrtum/tests/test_corpus.py`

**Interfaces:**
- Produces: `load_series(archive_dir: Path) -> dict[str, dict[str, float]]` — `{top_id: {date: value}}`, nur endliche Zahlenwerte.

- [ ] **Step 1: Failing test + fixtures**

Create three fixture day-JSONs, e.g. `tests/fixtures/protokoll/2026/2026-06-01.json`:
```json
{ "date": "2026-06-01", "schema_version": "3", "entries": [
  { "top_id": "co2", "value": 420.0 },
  { "top_id": "sst", "value": 20.1 },
  { "top_id": "fires", "value": null } ] }
```
`2026-06-02.json` → co2 421.0, sst 20.3, fires 5. `2026-06-03.json` → co2 422.5, sst 20.6, fires 7.

Create `tests/test_corpus.py`:
```python
from pathlib import Path
from irrtum.corpus import load_series

FIX = Path(__file__).parent / "fixtures" / "protokoll"

def test_load_series_groups_by_top_id_and_skips_nonfinite():
    s = load_series(FIX)
    assert s["co2"] == {"2026-06-01": 420.0, "2026-06-02": 421.0, "2026-06-03": 422.5}
    assert s["sst"]["2026-06-03"] == 20.6
    # fires hat nur an 2 Tagen einen Zahlenwert (null wird übersprungen)
    assert "2026-06-01" not in s["fires"]
    assert len(s["fires"]) == 2
```

- [ ] **Step 2: Run — fails** (`ModuleNotFoundError: irrtum.corpus`).
Run: `pytest tests/test_corpus.py -q`

- [ ] **Step 3: Implement** `pipelines/irrtum/src/irrtum/corpus.py`:
```python
"""Lädt das committete Protokoll-Archiv zu Zeitreihen je top_id (MVP-Korpus)."""
from __future__ import annotations

import glob
import json
import math
from pathlib import Path


def load_series(archive_dir: Path) -> dict[str, dict[str, float]]:
    series: dict[str, dict[str, float]] = {}
    for f in sorted(glob.glob(str(Path(archive_dir) / "*" / "*.json"))):
        day = json.load(open(f, encoding="utf-8"))
        date = day["date"]
        for e in day.get("entries", []):
            tid, v = e.get("top_id"), e.get("value")
            if tid and isinstance(v, (int, float)) and math.isfinite(v):
                series.setdefault(tid, {})[date] = float(v)
    return series
```

- [ ] **Step 4: Run — passes.** `pytest tests/test_corpus.py -q`

- [ ] **Step 5: Commit**
```bash
git add pipelines/irrtum/src/irrtum/corpus.py pipelines/irrtum/tests/test_corpus.py pipelines/irrtum/tests/fixtures
git commit -m "feat(irrtum): Korpus-Lader (Protokoll-Archiv → Zeitreihen)"
```

---

### Task 3: ML-Sichtung (stärkste Korrelation + Permutationstest)

Findet das Paar `top_id`s mit der stärksten |Korrelation| über gemeinsame Tage und schätzt per Permutationstest, wie wahrscheinlich das Rauschen ist (Muster aus `pattern`).

**Files:**
- Create: `pipelines/irrtum/src/irrtum/sift.py`
- Create: `pipelines/irrtum/tests/test_sift.py`

**Interfaces:**
- Consumes: `load_series`-Ausgabe (Task 2)
- Produces:
  - `@dataclass(frozen=True) class Finding: pair: tuple[str,str]; r: float; fdr: float; n: int`
  - `sift(series: dict[str, dict[str, float]], *, min_overlap: int = 5, k: int = 2000, seed: int | None = None) -> Finding | None` — `None`, wenn kein Paar genug Überlappung hat.

- [ ] **Step 1: Failing test**

Create `tests/test_sift.py`:
```python
from irrtum.sift import sift, Finding

def _ramp(start, step, days):
    return {f"2026-06-{d:02d}": start + step * i for i, d in enumerate(range(1, days + 1))}

def test_sift_finds_strong_correlation():
    # a und b steigen exakt parallel → r≈1; c fällt → stark negativ zu a/b
    series = {
        "a": _ramp(400, 1.0, 10),
        "b": _ramp(20, 0.5, 10),
        "c": _ramp(100, -2.0, 10),
    }
    f = sift(series, min_overlap=5, k=500, seed=20260603)
    assert isinstance(f, Finding)
    assert f.n == 10
    assert abs(f.r) > 0.99          # perfekt (anti-)korreliert
    assert f.fdr <= 0.05            # bei perfekter Korrelation selten durch Zufall
    assert set(f.pair) <= {"a", "b", "c"}

def test_sift_returns_none_without_overlap():
    series = {"a": {"2026-06-01": 1.0}, "b": {"2026-06-02": 2.0}}
    assert sift(series, min_overlap=5) is None
```

- [ ] **Step 2: Run — fails.** `pytest tests/test_sift.py -q`

- [ ] **Step 3: Implement** `pipelines/irrtum/src/irrtum/sift.py`:
```python
"""ML-Sichtung: stärkste |Korrelation| über gemeinsame Tage + Permutations-FDR (numpy)."""
from __future__ import annotations

from dataclasses import dataclass
from itertools import combinations

import numpy as np


@dataclass(frozen=True)
class Finding:
    pair: tuple[str, str]
    r: float
    fdr: float
    n: int


def _aligned(a: dict[str, float], b: dict[str, float]) -> tuple[np.ndarray, np.ndarray]:
    days = sorted(set(a) & set(b))
    return np.array([a[d] for d in days]), np.array([b[d] for d in days])


def sift(series, *, min_overlap: int = 5, k: int = 2000, seed: int | None = None) -> Finding | None:
    best: Finding | None = None
    for x, y in combinations(sorted(series), 2):
        ax, ay = _aligned(series[x], series[y])
        n = len(ax)
        if n < min_overlap or ax.std() == 0 or ay.std() == 0:
            continue
        r = float(np.corrcoef(ax, ay)[0, 1])
        if best is None or abs(r) > abs(best.r):
            best = Finding(pair=(x, y), r=round(r, 4), fdr=0.0, n=n)
    if best is None:
        return None
    # Permutationstest nur für das gewählte Paar: wie oft erreicht eine Zufalls-Permutation |r0|?
    ax, ay = _aligned(series[best.pair[0]], series[best.pair[1]])
    rng = np.random.default_rng(seed)
    hits = sum(1 for _ in range(k)
               if abs(np.corrcoef(ax, rng.permutation(ay))[0, 1]) >= abs(best.r))
    return Finding(pair=best.pair, r=best.r, fdr=round(hits / k, 3), n=best.n)
```

- [ ] **Step 4: Run — passes.** `pytest tests/test_sift.py -q`

- [ ] **Step 5: Commit**
```bash
git add pipelines/irrtum/src/irrtum/sift.py pipelines/irrtum/tests/test_sift.py
git commit -m "feat(irrtum): ML-Sichtung — stärkste Korrelation + Permutations-FDR"
```

---

### Task 4: Methoden-Katalog

Ein kleiner, benannter Katalog von AR-Methoden + deterministische Tageswahl (MVP: rotiert per Datum).

**Files:**
- Create: `pipelines/irrtum/src/irrtum/methods.py`
- Create: `pipelines/irrtum/tests/test_methods.py`

**Interfaces:**
- Produces:
  - `METHODS: list[Method]` mit `Method(name: str, lens: str)` (`lens` = kurzer Deut-Auftrag für den Prompt)
  - `pick_method(date_iso: str) -> Method` — deterministisch (Tagesindex).

- [ ] **Step 1: Failing test**
```python
from irrtum.methods import METHODS, pick_method, Method

def test_catalog_nonempty_and_named():
    assert len(METHODS) >= 3
    assert all(isinstance(m, Method) and m.name and m.lens for m in METHODS)

def test_pick_is_deterministic_by_date():
    a = pick_method("2026-06-28")
    b = pick_method("2026-06-28")
    assert a == b
    assert a in METHODS
```

- [ ] **Step 2: Run — fails.**

- [ ] **Step 3: Implement** `pipelines/irrtum/src/irrtum/methods.py`:
```python
"""Offener Katalog benannter Methoden künstlerischer Forschung (MVP-Auswahl)."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Method:
    name: str
    lens: str  # knapper Deut-Auftrag, geht in den Prompt


METHODS: list[Method] = [
    Method("Kartografie", "Lies die beiden Größen als Orte einer Karte; was grenzt woran, was liegt im Zentrum, was am Rand?"),
    Method("Institutionskritik", "Frage, wessen Interesse es dient, dass diese beiden Größen so gemessen werden — und was die Messung verschweigt."),
    Method("Material thinking", "Behandle die Korrelation als Material mit Eigenwillen; was will sie werden, woran leistet sie Widerstand?"),
    Method("Design fiction", "Erfinde eine nahe Zukunft, in der dieser Zusammenhang als Tatsache gilt; was folgt daraus?"),
]


def pick_method(date_iso: str) -> Method:
    ordinal = int(date_iso.replace("-", ""))
    return METHODS[ordinal % len(METHODS)]
```

- [ ] **Step 4: Run — passes.**

- [ ] **Step 5: Commit**
```bash
git add pipelines/irrtum/src/irrtum/methods.py pipelines/irrtum/tests/test_methods.py
git commit -m "feat(irrtum): Methoden-Katalog + deterministische Tageswahl"
```

---

### Task 5: LLM-Forscherin (Thesenbildung)

Baut aus Methode + Finding einen Prompt, ruft Gemini (Parallaxe-Muster), parst eine These. LLM in Tests gemockt.

**Files:**
- Create: `pipelines/irrtum/src/irrtum/researcher.py`
- Create: `pipelines/irrtum/tests/test_researcher.py`

**Interfaces:**
- Consumes: `Finding` (Task 3), `Method` (Task 4)
- Produces:
  - `MODEL = "gemini-2.5-flash-lite"`, `@dataclass class Thesis: method; text; cited_r; reasoning`
  - `form_thesis(finding: Finding, method: Method, *, client: httpx.Client, api_key: str) -> Thesis`
  - `build_prompt(finding: Finding, method: Method) -> str` (rein, testbar)

- [ ] **Step 1: Failing test (LLM gemockt)**
```python
import json, httpx
from irrtum.sift import Finding
from irrtum.methods import Method
from irrtum.researcher import form_thesis, build_prompt, Thesis

F = Finding(pair=("co2", "sst"), r=0.97, fdr=0.01, n=12)
M = Method("Kartografie", "Lies als Karte.")

def test_build_prompt_mentions_pair_and_method():
    p = build_prompt(F, M)
    assert "co2" in p and "sst" in p and "Kartografie" in p and "0.97" in p

def _client_returning(payload: dict) -> httpx.Client:
    text = json.dumps(payload)
    def handler(_req):
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))

def test_form_thesis_parses_model_json():
    client = _client_returning({"thesis": "CO2 und Meerestemperatur sind ein Ort.",
                                "cited_r": 0.97, "reasoning": "..."})
    t = form_thesis(F, M, client=client, api_key="k")
    assert isinstance(t, Thesis)
    assert t.method == "Kartografie"
    assert t.cited_r == 0.97
    assert "Ort" in t.text
```

- [ ] **Step 2: Run — fails.**

- [ ] **Step 3: Implement** `pipelines/irrtum/src/irrtum/researcher.py`:
```python
"""LLM-Forscherin: formt aus Finding + Methode eine These (Konjektur). Gemini, Parallaxe-Muster."""
from __future__ import annotations

import json
from dataclasses import dataclass

import httpx

from irrtum.methods import Method
from irrtum.sift import Finding

MODEL = "gemini-2.5-flash-lite"
_API = "https://generativelanguage.googleapis.com/v1beta/models"


class ResearchError(Exception):
    pass


@dataclass(frozen=True)
class Thesis:
    method: str
    text: str
    cited_r: float
    reasoning: str


def build_prompt(finding: Finding, method: Method) -> str:
    x, y = finding.pair
    return (
        "Du bist eine künstlerische Forscherin. Wende die Methode "
        f"'{method.name}' an: {method.lens}\n"
        f"Befund (aus echten Daten): die Größen '{x}' und '{y}' korrelieren mit "
        f"r={finding.r} (n={finding.n} Tage; Rausch-Anteil fdr={finding.fdr}).\n"
        "Bilde EINE These (eine Deutung, KEINE Tatsachenbehauptung). Antworte als JSON mit "
        "den Feldern: thesis (string), cited_r (die Zahl, auf die sich die These stützt), "
        "reasoning (string)."
    )


def form_thesis(finding: Finding, method: Method, *, client: httpx.Client, api_key: str) -> Thesis:
    body = {
        "contents": [{"role": "user", "parts": [{"text": build_prompt(finding, method)}]}],
        "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"},
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}
    resp = client.post(f"{_API}/{MODEL}:generateContent", headers=headers, json=body, timeout=120.0)
    resp.raise_for_status()
    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    data = json.loads(raw)
    if "thesis" not in data or "cited_r" not in data:
        raise ResearchError("Antwort ohne 'thesis'/'cited_r'")
    return Thesis(method=method.name, text=str(data["thesis"]),
                  cited_r=float(data["cited_r"]), reasoning=str(data.get("reasoning", "")))
```

- [ ] **Step 4: Run — passes.**

- [ ] **Step 5: Commit**
```bash
git add pipelines/irrtum/src/irrtum/researcher.py pipelines/irrtum/tests/test_researcher.py
git commit -m "feat(irrtum): LLM-Forscherin — Thesenbildung (Gemini, gemockt getestet)"
```

---

### Task 6: Kritiker (symbolische Prüfung + adversarialer LLM + Verdikt)

Symbolische Prüfung: stützt die echte Zahl die zitierte? Plus ein adversarialer LLM-Kritiker. Daraus das Verdikt.

**Files:**
- Create: `pipelines/irrtum/src/irrtum/critic.py`
- Create: `pipelines/irrtum/tests/test_critic.py`

**Interfaces:**
- Consumes: `Finding` (Task 3), `Thesis` (Task 5)
- Produces:
  - `symbolic_check(finding: Finding, thesis: Thesis, *, r_tol: float = 0.05, fdr_max: float = 0.1) -> bool` — True nur wenn die zitierte Zahl zur echten passt **und** der Befund nicht Rauschen ist.
  - `adversary(finding, thesis, *, client, api_key) -> tuple[bool, str]` — (supported, critique). Gemini, gemockt.
  - `verdict(symbolic_ok: bool, critic_supported: bool) -> Verdict` — Regel: beide ok → "survived"; symbolisch falsch → "refuted"; symbolisch ok aber Kritiker dagegen → "inconclusive".

- [ ] **Step 1: Failing test**
```python
import json, httpx
from irrtum.sift import Finding
from irrtum.researcher import Thesis
from irrtum.critic import symbolic_check, adversary, verdict

F = Finding(pair=("co2", "sst"), r=0.97, fdr=0.01, n=12)
T_ok = Thesis("Kartografie", "…", cited_r=0.97, reasoning="")
T_fab = Thesis("Kartografie", "…", cited_r=0.30, reasoning="")          # erfundene Zahl
F_noise = Finding(pair=("a", "b"), r=0.5, fdr=0.6, n=8)                 # Rauschen
T_noise = Thesis("Kartografie", "…", cited_r=0.5, reasoning="")

def test_symbolic_true_when_number_matches_and_signal():
    assert symbolic_check(F, T_ok) is True

def test_symbolic_false_when_number_fabricated():
    assert symbolic_check(F, T_fab) is False

def test_symbolic_false_when_finding_is_noise():
    assert symbolic_check(F_noise, T_noise) is False

def _client(supported: bool) -> httpx.Client:
    text = json.dumps({"supported": supported, "critique": "weil…"})
    def handler(_req):
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))

def test_adversary_parses_supported():
    ok, crit = adversary(F, T_ok, client=_client(False), api_key="k")
    assert ok is False and "weil" in crit

def test_verdict_rules():
    assert verdict(True, True) == "survived"
    assert verdict(False, True) == "refuted"
    assert verdict(True, False) == "inconclusive"
```

- [ ] **Step 2: Run — fails.**

- [ ] **Step 3: Implement** `pipelines/irrtum/src/irrtum/critic.py`:
```python
"""Widerlegung: symbolische Prüfung (auditierbar) + adversarialer LLM-Kritiker + Verdikt."""
from __future__ import annotations

import json
from typing import Literal

import httpx

from irrtum.researcher import MODEL, Thesis
from irrtum.sift import Finding

Verdict = Literal["survived", "refuted", "inconclusive"]
_API = "https://generativelanguage.googleapis.com/v1beta/models"


def symbolic_check(finding: Finding, thesis: Thesis, *, r_tol: float = 0.05, fdr_max: float = 0.1) -> bool:
    """True nur, wenn die zitierte Zahl zur echten passt UND der Befund nicht Rauschen ist."""
    number_matches = abs(thesis.cited_r - finding.r) <= r_tol
    is_signal = finding.fdr <= fdr_max
    return number_matches and is_signal


def adversary(finding: Finding, thesis: Thesis, *, client: httpx.Client, api_key: str) -> tuple[bool, str]:
    prompt = (
        "Du bist eine strenge Kritikerin. Greife die folgende These an. Ist sie vom Befund "
        f"getragen oder Kunstsprech? Befund: r={finding.r}, fdr={finding.fdr}, n={finding.n}. "
        f"These ({thesis.method}): {thesis.text}\n"
        "Antworte als JSON: supported (bool), critique (string)."
    )
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}}
    headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}
    resp = client.post(f"{_API}/{MODEL}:generateContent", headers=headers, json=body, timeout=120.0)
    resp.raise_for_status()
    data = json.loads(resp.json()["candidates"][0]["content"]["parts"][0]["text"])
    return bool(data.get("supported", False)), str(data.get("critique", ""))


def verdict(symbolic_ok: bool, critic_supported: bool) -> Verdict:
    if not symbolic_ok:
        return "refuted"
    return "survived" if critic_supported else "inconclusive"
```

- [ ] **Step 4: Run — passes.**

- [ ] **Step 5: Commit**
```bash
git add pipelines/irrtum/src/irrtum/critic.py pipelines/irrtum/tests/test_critic.py
git commit -m "feat(irrtum): Kritiker — symbolische Prüfung + adversarialer LLM + Verdikt"
```

---

### Task 7: Sitzung orchestrieren + CLI

Verdrahtet die Schleife zu einer `Session` und schreibt das Record-JSON. LLM-Schritte injiziert (in Tests gemockt); CLI-Echtlauf nutzt echten Gemini-Client.

**Files:**
- Create: `pipelines/irrtum/src/irrtum/session.py`
- Create: `pipelines/irrtum/src/irrtum/run.py`
- Create: `pipelines/irrtum/tests/test_session.py`

**Interfaces:**
- Consumes: alle vorigen Module
- Produces:
  - `@dataclass class Session` (Felder wie im Global-Schema) + `session_to_json(s) -> str`
  - `run_session(series, date_iso, *, client, api_key, seed=None) -> Session | None` (None, wenn kein Finding)
  - `run.py main()` — `python -m irrtum.run --repo-root . [--dry-run]`

- [ ] **Step 1: Failing integration test (alle LLM-Calls gemockt)**
```python
import json, httpx
from irrtum.session import run_session, Session, session_to_json

def _ramp(start, step, days):
    return {f"2026-06-{d:02d}": start + step*i for i, d in enumerate(range(1, days+1))}

SERIES = {"a": _ramp(400, 1.0, 10), "b": _ramp(20, 0.5, 10)}

def _client(thesis_r, supported):
    def handler(req):
        body = json.loads(req.content)
        prompt = body["contents"][0]["parts"][0]["text"]
        if "Kritikerin" in prompt:
            text = json.dumps({"supported": supported, "critique": "c"})
        else:
            text = json.dumps({"thesis": "t", "cited_r": thesis_r, "reasoning": "r"})
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})
    return httpx.Client(transport=httpx.MockTransport(handler))

def test_session_survives_when_number_and_critic_agree():
    s = run_session(SERIES, "2026-06-10", client=_client(thesis_r=1.0, supported=True), api_key="k", seed=1)
    assert isinstance(s, Session)
    assert s.verdict == "survived"
    assert s.date == "2026-06-10"
    assert json.loads(session_to_json(s))["verdict"] == "survived"

def test_session_refuted_when_number_fabricated():
    s = run_session(SERIES, "2026-06-10", client=_client(thesis_r=0.1, supported=True), api_key="k", seed=1)
    assert s.verdict == "refuted"
```

- [ ] **Step 2: Run — fails.**

- [ ] **Step 3: Implement** `pipelines/irrtum/src/irrtum/session.py`:
```python
"""Orchestriert eine Forschungssitzung zur Session und serialisiert sie."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass

import httpx

from irrtum.critic import Verdict, adversary, symbolic_check, verdict
from irrtum.methods import pick_method
from irrtum.researcher import MODEL, form_thesis
from irrtum.sift import sift


@dataclass(frozen=True)
class Session:
    date: str
    finding: dict
    thesis: dict
    symbolic_ok: bool
    critic_supported: bool
    critic_text: str
    verdict: Verdict
    model: str


def run_session(series, date_iso: str, *, client: httpx.Client, api_key: str, seed=None) -> Session | None:
    finding = sift(series, seed=seed if seed is not None else int(date_iso.replace("-", "")))
    if finding is None:
        return None
    method = pick_method(date_iso)
    thesis = form_thesis(finding, method, client=client, api_key=api_key)
    sym = symbolic_check(finding, thesis)
    supported, critique = adversary(finding, thesis, client=client, api_key=api_key)
    return Session(
        date=date_iso,
        finding={"pair": list(finding.pair), "r": finding.r, "fdr": finding.fdr, "n": finding.n},
        thesis={"method": thesis.method, "text": thesis.text, "cited_r": thesis.cited_r,
                "reasoning": thesis.reasoning},
        symbolic_ok=sym, critic_supported=supported, critic_text=critique,
        verdict=verdict(sym, supported), model=MODEL,
    )


def session_to_json(s: Session) -> str:
    return json.dumps(asdict(s), ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False) + "\n"
```
Create `pipelines/irrtum/src/irrtum/run.py`:
```python
"""CLI: führt eine Forschungssitzung am Protokoll-Korpus aus und schreibt das Record."""
from __future__ import annotations

import argparse
import os
import sys
from datetime import date, timezone
from pathlib import Path

import httpx

from irrtum.corpus import load_series
from irrtum.session import run_session, session_to_json


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args(argv)

    root = Path(args.repo_root)
    today = args.date or date.today().isoformat()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY/GOOGLE_API_KEY nicht gesetzt", file=sys.stderr)
        return 2

    series = load_series(root / "src" / "content" / "protokoll")
    with httpx.Client() as client:
        session = run_session(series, today, client=client, api_key=api_key)
    if session is None:
        print("kein Finding (zu wenig Überlappung) — Sitzung entfällt", file=sys.stderr)
        return 1

    out = root / "src" / "data" / "irrtum"
    out.mkdir(parents=True, exist_ok=True)
    payload = session_to_json(session)
    (out / f"{today}.json").write_text(payload, encoding="utf-8")
    (out / "latest.json").write_text(payload, encoding="utf-8")
    print(f"geschrieben: src/data/irrtum/{today}.json — verdict={session.verdict}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run — passes.** `pytest -q` (full package, all green).

- [ ] **Step 5: Optionaler Echtlauf (manuell, kein Commit-Gate, braucht Key + Netz)**
```bash
cd /Users/frankbultge/Documents/GitHub/frankbueltge.de
GEMINI_API_KEY=*** pipelines/irrtum/.venv/bin/python -m irrtum.run --repo-root . --dry-run
```
Expected: schreibt `src/data/irrtum/<date>.json` mit echter These + Verdikt. Lies das Record — ist die These lesbar, der Angriff sinnvoll, das Verdikt nachvollziehbar? Hier werden die Prompts iteriert. (Bei Ausfall überspringen — die Unit-Tests sind das Gate.)

- [ ] **Step 6: Commit**
```bash
git add pipelines/irrtum/src/irrtum/session.py pipelines/irrtum/src/irrtum/run.py pipelines/irrtum/tests/test_session.py
git commit -m "feat(irrtum): Sitzung orchestrieren + CLI (Schleife lauffähig)"
```

---

## Nach dem MVP (eigene Schnitte, nicht Teil dieses Plans)

- **Prompt-Iteration** am Echtlauf, bis Thesen/Angriffe ehrlich und lesbar sind (kein Code-Gate, empirisch).
- **Gedächtnis/Methodenheft:** die Maschine liest Vortage, kritisiert alte Thesen, mutiert zu einer eigenen Methode (die Linie).
- **Voller Methoden-Katalog** mit Rotation; **volle Akte** als Korpus (consensus, ghost-fleet … heterogen einlesen).
- **Frontend:** Content-Collection `irrtum` (oder `src/data`-Import), Tagesblatt-Komponente, Meta-Ansicht (Irrtumsrate), `werke.ts`-Eintrag, Methodenblatt, Routen DE/EN.
- **GitHub-Actions-Workflow** `irrtum.yml` (nächtlich, Secret `GEMINI_API_KEY`, git-commit-Block wie ghost-fleet).

## Self-Review

- **Spec-Coverage (MVP):** Tageszyklus Schritt 1 Sichtung → Task 2+3; Schritt 2 Methodenwahl → Task 4; Schritt 3 Thesenbildung (Konjektur) → Task 5; Schritt 4 Widerlegung (symbolisch + adversarial) → Task 6; Schritt 5 Verdikt + Record → Task 7. „Kein Orakel" → `symbolic_check` trennt belegt/Konjektur, LLM nur gemockt-getestet, Modell im Record. Gedächtnis/voller Katalog/volle Akte/Frontend/Workflow sind bewusst Folge-Schnitte (oben gelistet).
- **Platzhalter:** keine — jeder Code-Schritt zeigt vollständigen Code und exakte Befehle. Die LLM-Schritte sind absichtlich gemockt getestet (Inhalt nicht assertierbar) + Echtlauf-Pfad zum Iterieren.
- **Typ-Konsistenz:** `Finding`/`Thesis`/`Verdict` identisch über sift→researcher→critic→session; `MODEL` einmal in `researcher.py` definiert, von `critic.py`/`session.py` importiert; `x-goog-api-key`-Header + `GEMINI_API_KEY`/`GOOGLE_API_KEY` wie Parallaxe.
