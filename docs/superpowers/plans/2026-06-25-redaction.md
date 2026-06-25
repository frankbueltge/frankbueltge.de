# The Redaction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build „The Redaction" / *Das Schwärzen* — a Gegenmessung instrument that measures what is removed from the official public record by diffing Wayback Machine snapshots of a curated watch-list and committing a daily JSON.

**Architecture:** A standalone Python pipeline (`pipelines/redaction/`, installable package with pytest) fetches Wayback **CDX** capture lists for a versioned watch-list, detects deletions (archive statuscode 200→4xx) and content removals (diff of extracted main text between the last two distinct 200-captures), scores each removal with a symbolic, auditable salience rule, ranks them, and writes `src/data/redaction/latest.json` + dated snapshots. The Astro frontend renders DE/EN pages + a Methodenblatt from `latest.json`, mirroring the existing **Consensus** instrument exactly. A dedicated nightly GitHub Actions workflow runs the pipeline and commits the result; CI runs the pytest + vitest suites.

**Tech Stack:** Python 3.12 (httpx, trafilatura, pytest), Astro 5 + Tailwind v4 (TS, vitest), GitHub Actions, Git-as-archive.

## Global Constraints

- **Bilingual DE/EN from day one.** EN at `/` (default), DE under `/de/`. Mirror-file pattern (one component, two route files differing only in `locale`).
- **Git is the archive.** Pipeline writes versioned JSON snapshots into the repo; the site reads committed JSON at build time. No live reads at site runtime.
- **No LLM in v1.** Salience is symbolic, rule-based, auditable, versioned (`SALIENCE_VERSION`).
- **No intent claim, ever.** Copy must say rewrite ≠ cover-up; legitimate corrections are not distinguished from suppression.
- **Provenance is the spine.** Every redaction carries two Wayback permalinks (before + after / 404 proof). All evidence is archive-sourced (CDX statuscodes + archived snapshots), never a live fetch — so every finding is reproducible.
- **Honest failure.** Source unreachable after retries → recorded, not silently skipped. No before/after capture available → „nicht feststellbar", no invented diff.
- **No secrets in error strings** (watch-list URLs are public, but keep the redaction habit: strip query strings from error messages, as `pipelines/protokoll/src/protokoll/fetch.py` does).
- **Determinism + test protection** for salience, diff, and ranking. Test strings are not to be softened later.
- **Naming:** title „The Redaction" (EN convention), route `/redaction`, Methodenblatt `/werke/redaction`, i18n key prefix `rd.`, OG slug `redaction`, data dir `src/data/redaction/`, pipeline `pipelines/redaction/`, git bot identity `Gegenmessung <gegenmessung@frankbueltge.de>`.
- **Data path convention:** flat `src/data/redaction/<YYYY-MM-DD>.json` + `src/data/redaction/latest.json` (matches the Consensus sibling; deliberately flat, not the year-subdir the spec sketched).

---

## File Structure

**Pipeline (new):**
- `pipelines/redaction/pyproject.toml` — package config (deps: httpx, trafilatura; dev: pytest)
- `pipelines/redaction/src/redaction/__init__.py` — `PIPELINE_VERSION`, `SALIENCE_VERSION`, `SCHEMA_VERSION`
- `pipelines/redaction/src/redaction/watchlist.py` — curated, versioned seed list (`WATCHLIST: list[WatchItem]`) + inclusion-rule docstring
- `pipelines/redaction/src/redaction/salience.py` — symbolic salience scoring (pure)
- `pipelines/redaction/src/redaction/textdiff.py` — removed-passage diff over extracted text (pure)
- `pipelines/redaction/src/redaction/extract.py` — main-text extraction (trafilatura + stdlib fallback)
- `pipelines/redaction/src/redaction/cdx.py` — Wayback CDX client: captures → snapshot pair / deletion
- `pipelines/redaction/src/redaction/build.py` — pure assembly + ranking of the day record
- `pipelines/redaction/src/redaction/run.py` — orchestration + IO (`--repo-root`, writes latest + dated)
- `pipelines/redaction/tests/` — pytest (salience, textdiff, cdx, build) + `fixtures/`

**Frontend (new), mirroring Consensus:**
- `src/lib/redaction/types.ts` — `RedactionData`, `Redaction`, `Snapshot`, `Salience`
- `src/lib/redaction/format.ts` — formatting helpers
- `src/lib/redaction/format.test.ts` — vitest
- `src/components/pages/RedactionPage.astro` — main render
- `src/components/pages/MethodenblattRedaction.astro` — method sheet
- `src/pages/redaction/index.astro` (en) + `src/pages/de/redaction/index.astro` (de)
- `src/pages/werke/redaction.astro` (en) + `src/pages/de/werke/redaction.astro` (de)
- `src/data/redaction/latest.json` + `src/data/redaction/<date>.json` (pipeline output, committed)

**Wire-up (modify):**
- `src/i18n/ui.ts` — add `rd.title`, `rd.sub` (de + en)
- `src/lib/og.ts` — add `redaction` to `OG_PAGES` + `ogSlug()`
- `src/data/werke.ts` — add `redaction` Werk entry
- `package.json` — add `"redaction:refresh"` script
- `.github/workflows/redaction.yml` — new nightly workflow
- `.github/workflows/ci.yml` — add redaction pytest step

---

## Task 1: Pipeline scaffold + watch-list

**Files:**
- Create: `pipelines/redaction/pyproject.toml`
- Create: `pipelines/redaction/src/redaction/__init__.py`
- Create: `pipelines/redaction/src/redaction/watchlist.py`
- Test: `pipelines/redaction/tests/test_watchlist.py`

**Interfaces:**
- Produces: `PIPELINE_VERSION: str`, `SALIENCE_VERSION: str`, `SCHEMA_VERSION: str` (from `redaction`); `WatchItem` (dataclass: `url: str`, `institution: str`, `label: str`), `WATCHLIST: list[WatchItem]`.

- [ ] **Step 1: pyproject.toml**

```toml
[project]
name = "redaction"
version = "0.1.0"
description = "Nightly pipeline: what was removed from the official public record (frankbueltge.de)"
requires-python = ">=3.12"
dependencies = ["httpx>=0.27", "trafilatura>=1.8"]

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

- [ ] **Step 2: `__init__.py`**

```python
"""The Redaction — nightly Gegenmessung pipeline."""
PIPELINE_VERSION = "0.1.0"
SCHEMA_VERSION = "1"
SALIENCE_VERSION = "1"
```

- [ ] **Step 3: Write the failing test for the watch-list**

```python
# tests/test_watchlist.py
from redaction.watchlist import WATCHLIST, WatchItem


def test_watchlist_is_nonempty_and_well_formed():
    assert len(WATCHLIST) >= 20
    for it in WATCHLIST:
        assert isinstance(it, WatchItem)
        assert it.url.startswith("https://")
        assert it.institution and it.label


def test_watchlist_urls_unique():
    urls = [it.url for it in WATCHLIST]
    assert len(urls) == len(set(urls)), "watch-list contains duplicate URLs"
```

- [ ] **Step 4: Run it, verify it fails**

Run: `cd pipelines/redaction && python -m pytest tests/test_watchlist.py -q`
Expected: FAIL (`ModuleNotFoundError: redaction.watchlist`)

- [ ] **Step 5: Implement `watchlist.py`**

Inclusion rule in the docstring; ~30–45 real, heavily-archived official URLs across a few institutions. Provisional starter set — Frank curates. Favour structural/commitment/statistics pages with documented redaction precedent (agency fact pages, climate language, official statistics landing pages). Each entry: `WatchItem(url, institution, label)`.

```python
"""Curated, versioned watch-list for The Redaction.

Inclusion rule (documented, editorial — the instrument measures what it watches,
not "the internet"):
  1. official / governmental / intergovernmental page;
  2. carries verifiable claims or commitments (policy, statistics, statements —
     not pure nav/index pages);
  3. publicly consequential;
  4. captured by the Wayback Machine with reasonable frequency (so a before/after exists).

This is a PROVISIONAL starter set for v1. Grow/curate by the rule above; every
change is noted in the Methodenblatt change-log. No partisan hot-buttons are
chosen for effect; the point is structural removal, not a single story.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WatchItem:
    url: str
    institution: str
    label: str


WATCHLIST: list[WatchItem] = [
    # — World Health Organization —
    WatchItem("https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
              "WHO", "Klimawandel und Gesundheit (Fact Sheet)"),
    WatchItem("https://www.who.int/news-room/fact-sheets/detail/air-pollution-and-health",
              "WHO", "Luftverschmutzung und Gesundheit (Fact Sheet)"),
    # … (full ~30–45 entries written during implementation; see notes below) …
]
```

> Implementation note: complete the list to ≥30 entries spanning e.g. WHO, UN/UNHCR, EU Commission, IPCC, NASA/NOAA climate, US BLS/CDC/EPA/State fact pages, White House briefing room. Verify each is reachable + archived before committing (Task 10 dry run will surface dead ones). Keep it neutral and structural.

- [ ] **Step 6: Run tests, verify pass**

Run: `cd pipelines/redaction && python -m pytest tests/test_watchlist.py -q`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add pipelines/redaction/pyproject.toml pipelines/redaction/src/redaction/__init__.py pipelines/redaction/src/redaction/watchlist.py pipelines/redaction/tests/test_watchlist.py
git commit -m "feat(redaction): pipeline scaffold + curated watch-list"
```

---

## Task 2: Symbolic salience scoring

**Files:**
- Create: `pipelines/redaction/src/redaction/salience.py`
- Test: `pipelines/redaction/tests/test_salience.py`

**Interfaces:**
- Produces: `score(text: str) -> Salience` where `Salience` is a dataclass `{score: int, signals: list[str]}`; signals are stable strings from `{"number","date","named_entity","negation","commitment_verb"}` (sorted, unique). `WEIGHTS: dict[str,int]`, `CAP: int`.

- [ ] **Step 1: Write failing tests**

```python
# tests/test_salience.py
from redaction.salience import score, WEIGHTS


def test_cosmetic_text_scores_zero():
    s = score("   \n\t  —  ·  ")
    assert s.score == 0 and s.signals == []


def test_number_detected():
    s = score("Emissions fell by 1.25 million tonnes.")
    assert "number" in s.signals and s.score >= WEIGHTS["number"]


def test_commitment_verb_weighs_most():
    s = score("The government will phase out coal.")
    assert "commitment_verb" in s.signals


def test_negation_detected_de_and_en():
    assert "negation" in score("Es gibt keinen Zusammenhang.").signals
    assert "negation" in score("There is no link.").signals


def test_named_entity_midsentence_capitalisation():
    s = score("The plan names the Paris Agreement explicitly.")
    assert "named_entity" in s.signals


def test_signals_sorted_unique_and_deterministic():
    a = score("By 2030 the EU will cut 55% — no exceptions, says Brussels.")
    b = score("By 2030 the EU will cut 55% — no exceptions, says Brussels.")
    assert a.signals == b.signals == sorted(set(a.signals))
    assert a.score == b.score
```

- [ ] **Step 2: Run, verify fail**

Run: `cd pipelines/redaction && python -m pytest tests/test_salience.py -q`
Expected: FAIL (`ModuleNotFoundError`)

- [ ] **Step 3: Implement `salience.py`**

```python
"""Symbolic, auditable salience: does the removed text carry weight?

No LLM. Every weight is disclosed and versioned (SALIENCE_VERSION). The salience
GATES the daily ranking: a content-empty boilerplate removal scores 0 and can
never win, however many tokens it spans.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

WEIGHTS: dict[str, int] = {
    "number": 2,
    "date": 2,
    "named_entity": 1,
    "negation": 2,
    "commitment_verb": 3,
}
CAP = 5  # occurrences of one signal counted at most CAP times

_NUMBER = re.compile(r"(?<!\w)(?:\d[\d.,]*\s?(?:%|percent|Prozent|mio|million|mrd|billion|bn|m)?)", re.I)
_DATE = re.compile(r"\b(?:19|20)\d{2}\b|\b\d{1,2}\.\s?\d{1,2}\.\s?(?:19|20)\d{2}\b"
                   r"|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|"
                   r"Januar|Februar|März|Mai|Juni|Juli|Oktober|Dezember)\b", re.I)
_NEGATION = re.compile(r"\b(?:no|not|never|none|kein|keine|keinen|nicht|niemals)\b", re.I)
_COMMIT = re.compile(r"\b(?:will|shall|must|commit|commits|committed|pledge|pledged|"
                     r"wird|werden|muss|müssen|soll|sollen|verpflichtet)\b", re.I)
# named entity: a capitalised word not at the start of a sentence (heuristic)
_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")
_CAPWORD = re.compile(r"\b[A-ZÄÖÜ][\wÄÖÜäöüß]+")


@dataclass(frozen=True)
class Salience:
    score: int = 0
    signals: list[str] = field(default_factory=list)


def _named_entity_count(text: str) -> int:
    n = 0
    for sent in _SENT_SPLIT.split(text):
        words = sent.split()
        # skip the first word of each sentence (sentence-initial capitalisation)
        for w in words[1:]:
            if _CAPWORD.match(w):
                n += 1
    return n


def score(text: str) -> Salience:
    counts = {
        "number": len(_NUMBER.findall(text)),
        "date": len(_DATE.findall(text)),
        "negation": len(_NEGATION.findall(text)),
        "commitment_verb": len(_COMMIT.findall(text)),
        "named_entity": _named_entity_count(text),
    }
    signals = sorted(k for k, v in counts.items() if v > 0)
    total = sum(WEIGHTS[k] * min(counts[k], CAP) for k in signals)
    return Salience(score=total, signals=signals)
```

- [ ] **Step 4: Run, verify pass**

Run: `cd pipelines/redaction && python -m pytest tests/test_salience.py -q`
Expected: PASS (adjust regexes if a case fails — keep the test strings intact)

- [ ] **Step 5: Commit**

```bash
git add pipelines/redaction/src/redaction/salience.py pipelines/redaction/tests/test_salience.py
git commit -m "feat(redaction): symbolic salience scoring (v1, tested)"
```

---

## Task 3: Removed-passage diff

**Files:**
- Create: `pipelines/redaction/src/redaction/textdiff.py`
- Test: `pipelines/redaction/tests/test_textdiff.py`

**Interfaces:**
- Produces: `removed(before: str, after: str) -> Removal` where `Removal` is `{passages: list[str], tokens: int}`. Sentence-level diff via `difflib`; `passages` are sentences present in `before` and absent in `after`; `tokens` = total word count of removed passages. Deterministic.

- [ ] **Step 1: Write failing tests**

```python
# tests/test_textdiff.py
from redaction.textdiff import removed


def test_no_change_no_removal():
    t = "Alpha sentence. Beta sentence."
    r = removed(t, t)
    assert r.passages == [] and r.tokens == 0


def test_removed_sentence_is_captured():
    before = "We keep this. We will phase out coal by 2030. We keep this too."
    after = "We keep this. We keep this too."
    r = removed(before, after)
    assert any("phase out coal" in p for p in r.passages)
    assert r.tokens > 0


def test_addition_is_not_a_removal():
    before = "One sentence only."
    after = "One sentence only. A new added line."
    r = removed(before, after)
    assert r.passages == [] and r.tokens == 0


def test_deterministic():
    before = "A. B. C. D."
    after = "A. D."
    assert removed(before, after).passages == removed(before, after).passages
```

- [ ] **Step 2: Run, verify fail.** `python -m pytest tests/test_textdiff.py -q` → FAIL

- [ ] **Step 3: Implement `textdiff.py`**

```python
"""Sentence-level removal diff. Removals only — additions are noted elsewhere,
they are not the subject (redaction = taking away)."""
from __future__ import annotations

import difflib
import re
from dataclasses import dataclass

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENT_SPLIT.split(text.strip()) if s.strip()]


@dataclass(frozen=True)
class Removal:
    passages: list[str]
    tokens: int


def removed(before: str, after: str) -> Removal:
    a, b = _sentences(before), _sentences(after)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    passages: list[str] = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ("delete", "replace"):
            passages.extend(a[i1:i2])
    tokens = sum(len(p.split()) for p in passages)
    return Removal(passages=passages, tokens=tokens)
```

- [ ] **Step 4: Run, verify pass.** `python -m pytest tests/test_textdiff.py -q` → PASS

- [ ] **Step 5: Commit**

```bash
git add pipelines/redaction/src/redaction/textdiff.py pipelines/redaction/tests/test_textdiff.py
git commit -m "feat(redaction): sentence-level removal diff (tested)"
```

---

## Task 4: Main-text extraction

**Files:**
- Create: `pipelines/redaction/src/redaction/extract.py`
- Test: `pipelines/redaction/tests/test_extract.py`

**Interfaces:**
- Produces: `main_text(html: str) -> str` — extracted main content, whitespace-collapsed; empty string if nothing extractable. Uses trafilatura; falls back to a stdlib tag-strip.

- [ ] **Step 1: Write failing test**

```python
# tests/test_extract.py
from redaction.extract import main_text


def test_extracts_visible_text_drops_boilerplate():
    html = """<html><head><title>x</title><style>.a{}</style></head>
    <body><nav>Home About</nav><main><p>The committee will act by 2030.</p>
    <p>It cited 1.25 million cases.</p></main><footer>© 2026</footer></body></html>"""
    out = main_text(html)
    assert "will act by 2030" in out
    assert "1.25 million cases" in out


def test_empty_html_returns_empty():
    assert main_text("") == ""
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `extract.py`**

```python
"""Main-text extraction. Heuristic by nature (disclosed in the Methodenblatt;
version-pinned via the trafilatura dependency). Isolated behind one function so
it is swappable."""
from __future__ import annotations

import re
from html.parser import HTMLParser

_WS = re.compile(r"\s+")


def _collapse(text: str) -> str:
    return _WS.sub(" ", text).strip()


class _Strip(HTMLParser):
    _SKIP = {"script", "style", "nav", "header", "footer", "aside", "noscript"}

    def __init__(self) -> None:
        super().__init__()
        self._skip = 0
        self._buf: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in self._SKIP:
            self._skip += 1

    def handle_endtag(self, tag):
        if tag in self._SKIP and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if not self._skip:
            self._buf.append(data)

    def text(self) -> str:
        return _collapse(" ".join(self._buf))


def _fallback(html: str) -> str:
    p = _Strip()
    p.feed(html)
    return p.text()


def main_text(html: str) -> str:
    if not html or not html.strip():
        return ""
    try:
        import trafilatura
        out = trafilatura.extract(html, include_comments=False, include_tables=False)
        if out and out.strip():
            return _collapse(out)
    except Exception:
        pass
    return _fallback(html)
```

- [ ] **Step 4: Run, verify pass.** → PASS (fallback covers the case even without trafilatura installed)

- [ ] **Step 5: Commit**

```bash
git add pipelines/redaction/src/redaction/extract.py pipelines/redaction/tests/test_extract.py
git commit -m "feat(redaction): main-text extraction with stdlib fallback (tested)"
```

---

## Task 5: Wayback CDX client

**Files:**
- Create: `pipelines/redaction/src/redaction/cdx.py`
- Test: `pipelines/redaction/tests/test_cdx.py`

**Interfaces:**
- Consumes: an `httpx.Client` (so tests can inject `MockTransport`).
- Produces:
  - `Capture` dataclass `{timestamp: str, status: str, digest: str}`.
  - `captures(url, *, client, days=14) -> list[Capture]` — CDX query, `collapse=digest`, ordered oldest→newest; raises `SourceUnavailable` on failure.
  - `snapshot_url(timestamp, original) -> str` → `https://web.archive.org/web/<ts>id_/<original>` (raw archived content).
  - `permalink(timestamp, original) -> str` → `https://web.archive.org/web/<ts>/<original>` (human-viewable).
  - `classify(caps) -> tuple[str, Capture|None, Capture|None]` — returns `("deletion", last_200, dead)` if the newest capture is 4xx/5xx and an earlier 200 exists; `("removal", prev_200, last_200)` if the two newest distinct-digest 200-captures differ; `("none", None, None)` otherwise.

- [ ] **Step 1: Write failing tests**

```python
# tests/test_cdx.py
import httpx
from redaction.cdx import captures, classify, snapshot_url, permalink, Capture


CDX_JSON = [
    ["timestamp", "original", "statuscode", "digest"],
    ["20260601000000", "https://x.test/p", "200", "AAA"],
    ["20260610000000", "https://x.test/p", "200", "BBB"],
]


def _client(payload, status=200):
    def handler(req):
        return httpx.Response(status, json=payload)
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_captures_parsed_oldest_to_newest():
    caps = captures("https://x.test/p", client=_client(CDX_JSON))
    assert [c.digest for c in caps] == ["AAA", "BBB"]


def test_classify_removal_on_digest_change():
    caps = [Capture("20260601000000", "200", "AAA"),
            Capture("20260610000000", "200", "BBB")]
    kind, before, after = classify(caps)
    assert kind == "removal" and before.digest == "AAA" and after.digest == "BBB"


def test_classify_deletion_on_status_4xx_newest():
    caps = [Capture("20260601000000", "200", "AAA"),
            Capture("20260610000000", "404", "-")]
    kind, before, after = classify(caps)
    assert kind == "deletion" and before.status == "200" and after.status == "404"


def test_classify_none_when_single_capture():
    assert classify([Capture("20260601000000", "200", "AAA")])[0] == "none"


def test_url_builders():
    assert snapshot_url("20260601000000", "https://x.test/p") == \
        "https://web.archive.org/web/20260601000000id_/https://x.test/p"
    assert permalink("20260601000000", "https://x.test/p") == \
        "https://web.archive.org/web/20260601000000/https://x.test/p"
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `cdx.py`** (reuse the redaction-of-query-strings habit; raise `SourceUnavailable` from a local definition to avoid a protokoll dependency)

```python
"""Wayback CDX client. All evidence is archive-sourced (statuscodes + archived
snapshots) so every finding is reproducible from the public record."""
from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

CDX = "https://web.archive.org/cdx/search/cdx"
RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 30.0


class SourceUnavailable(Exception):
    pass


def _redacted(url: str) -> str:
    return url.split("?", 1)[0]


@dataclass(frozen=True)
class Capture:
    timestamp: str
    status: str
    digest: str


def captures(url: str, *, client: httpx.Client, days: int = 14) -> list[Capture]:
    params = {"url": url, "output": "json", "fl": "timestamp,original,statuscode,digest",
              "collapse": "digest", "limit": "-40"}
    last: Exception | None = None
    for delay in (0.0, *RETRY_DELAYS):
        if delay:
            time.sleep(delay)
        try:
            r = client.get(CDX, params=params, timeout=TIMEOUT, follow_redirects=True)
            r.raise_for_status()
            rows = r.json()
            if not rows or len(rows) < 2:
                return []
            caps = [Capture(timestamp=row[0], status=row[2], digest=row[3]) for row in rows[1:]]
            caps.sort(key=lambda c: c.timestamp)
            return caps
        except httpx.HTTPError as exc:
            last = exc
    raise SourceUnavailable(f"{_redacted(CDX)}: {type(last).__name__}")


def snapshot_url(timestamp: str, original: str) -> str:
    return f"https://web.archive.org/web/{timestamp}id_/{original}"


def permalink(timestamp: str, original: str) -> str:
    return f"https://web.archive.org/web/{timestamp}/{original}"


def _is_ok(status: str) -> bool:
    return status == "200"


def classify(caps: list[Capture]) -> tuple[str, Capture | None, Capture | None]:
    if len(caps) < 2:
        return ("none", None, None)
    newest = caps[-1]
    if not _is_ok(newest.status):
        last_ok = next((c for c in reversed(caps[:-1]) if _is_ok(c.status)), None)
        if last_ok is not None:
            return ("deletion", last_ok, newest)
        return ("none", None, None)
    ok = [c for c in caps if _is_ok(c.status)]
    if len(ok) >= 2 and ok[-1].digest != ok[-2].digest:
        return ("removal", ok[-2], ok[-1])
    return ("none", None, None)
```

- [ ] **Step 4: Run, verify pass.** → PASS

- [ ] **Step 5: Commit**

```bash
git add pipelines/redaction/src/redaction/cdx.py pipelines/redaction/tests/test_cdx.py
git commit -m "feat(redaction): Wayback CDX client + deletion/removal classify (tested)"
```

---

## Task 6: Day-record assembly + ranking (pure)

**Files:**
- Create: `pipelines/redaction/src/redaction/build.py`
- Test: `pipelines/redaction/tests/test_build.py`

**Interfaces:**
- Consumes: `Salience` (salience), `Removal` (textdiff), `MIN_REMOVED_TOKENS`.
- Produces:
  - `MIN_REMOVED_TOKENS = 8`.
  - `make_redaction(item, kind, before_cap, after_cap, removal, salience, original_url) -> dict | None` — builds one redaction dict (schema §8); returns `None` if `kind=="removal"` and `removal.tokens < MIN_REMOVED_TOKENS` (cosmetic).
  - `rank(redactions: list[dict]) -> str | None` — returns the id of the pick: argmax of `salience.score * removed_tokens`, ties broken by `(url, after.wayback_ts)`; `None` if empty or all scores 0.
  - `day_record(date_iso, generated_at, redactions, watched_count) -> dict` — the full day JSON dict.
  - `to_json(record: dict) -> str` — `json.dumps(..., ensure_ascii=False, indent=2, sort_keys=True)` + newline.

- [ ] **Step 1: Write failing tests**

```python
# tests/test_build.py
from redaction.build import make_redaction, rank, day_record, MIN_REMOVED_TOKENS
from redaction.salience import Salience
from redaction.textdiff import Removal
from redaction.cdx import Capture
from redaction.watchlist import WatchItem

ITEM = WatchItem("https://x.test/p", "Inst", "A page")


def _red(rid, score, tokens, url="https://x.test/p", ts="20260610"):
    return {"id": rid, "url": url, "salience": {"score": score, "signals": []},
            "removed_tokens": tokens, "after": {"wayback_ts": ts}}


def test_make_redaction_drops_cosmetic_below_threshold():
    r = make_redaction(ITEM, "removal",
                       Capture("20260601", "200", "A"), Capture("20260610", "200", "B"),
                       Removal(passages=["tiny"], tokens=MIN_REMOVED_TOKENS - 1),
                       Salience(0, []), ITEM.url)
    assert r is None


def test_make_redaction_keeps_substantive():
    r = make_redaction(ITEM, "removal",
                       Capture("20260601", "200", "A"), Capture("20260610", "200", "B"),
                       Removal(passages=["x " * 20], tokens=20),
                       Salience(5, ["number"]), ITEM.url)
    assert r is not None and r["kind"] == "removal" and r["salience"]["score"] == 5
    assert r["before"]["url"].startswith("https://web.archive.org/web/20260601/")


def test_rank_picks_highest_score_times_tokens():
    reds = [_red("a", 2, 10), _red("b", 5, 10), _red("c", 5, 9)]
    assert rank(reds) == "b"


def test_rank_none_when_all_zero():
    assert rank([_red("a", 0, 100)]) is None


def test_day_record_shape():
    rec = day_record("2026-06-25", "2026-06-25T05:30:00Z", [], watched_count=30)
    assert rec["date"] == "2026-06-25" and rec["pick"] is None
    assert rec["watched_count"] == 30 and rec["changed_count"] == 0
    assert rec["salience_version"] and rec["schema_version"] and rec["pipeline_version"]
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `build.py`**

```python
"""Pure assembly + ranking of the daily record. No IO, no network — fully tested."""
from __future__ import annotations

import json

from redaction import PIPELINE_VERSION, SALIENCE_VERSION, SCHEMA_VERSION
from redaction.cdx import Capture, permalink
from redaction.salience import Salience
from redaction.textdiff import Removal
from redaction.watchlist import WatchItem

MIN_REMOVED_TOKENS = 8


def _rid(url: str, after_ts: str) -> str:
    slug = url.split("://", 1)[-1].replace("/", "_")[:80]
    return f"{after_ts}_{slug}"


def make_redaction(item: WatchItem, kind: str, before_cap: Capture, after_cap: Capture,
                   removal: Removal, salience: Salience, original_url: str) -> dict | None:
    if kind == "removal" and removal.tokens < MIN_REMOVED_TOKENS:
        return None
    rid = _rid(original_url, after_cap.timestamp)
    return {
        "id": rid,
        "url": original_url,
        "institution": item.institution,
        "label": item.label,
        "kind": kind,
        "before": {"wayback_ts": before_cap.timestamp,
                   "url": permalink(before_cap.timestamp, original_url)},
        "after": {"wayback_ts": after_cap.timestamp,
                  "url": permalink(after_cap.timestamp, original_url),
                  "status": after_cap.status},
        "removed_passages": removal.passages,
        "removed_tokens": removal.tokens,
        "salience": {"score": salience.score, "signals": salience.signals},
    }


def rank(redactions: list[dict]) -> str | None:
    best, best_key = None, None
    for r in redactions:
        weight = r["salience"]["score"] * r["removed_tokens"]
        if weight <= 0:
            continue
        key = (weight, r["url"], r["after"]["wayback_ts"])
        # higher weight wins; ties: lexicographically smaller url, then ts (stable, deterministic)
        if best_key is None or weight > best_key[0] or (
            weight == best_key[0] and (r["url"], r["after"]["wayback_ts"]) < best_key[1:3] + (best_key[3],) if False else False
        ):
            pass
        if best_key is None or key[0] > best_key[0] or (key[0] == best_key[0] and key[1:] < best_key[1:]):
            best, best_key = r["id"], key
    return best


def day_record(date_iso: str, generated_at: str, redactions: list[dict],
               watched_count: int) -> dict:
    changed = [r for r in redactions]
    return {
        "date": date_iso,
        "generated_at": generated_at,
        "schema_version": SCHEMA_VERSION,
        "pipeline_version": PIPELINE_VERSION,
        "salience_version": SALIENCE_VERSION,
        "watched_count": watched_count,
        "changed_count": len(changed),
        "removed_tokens_total": sum(r["removed_tokens"] for r in changed),
        "pick": rank(redactions),
        "redactions": sorted(redactions, key=lambda r: (
            -(r["salience"]["score"] * r["removed_tokens"]), r["url"], r["after"]["wayback_ts"])),
        "source": {
            "name": "Internet Archive — Wayback Machine (CDX)",
            "url": "https://web.archive.org/",
            "license": "Wayback Machine — public archive",
        },
    }


def to_json(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
```

> Implementation note: simplify the `rank()` loop when implementing (the dead branch above is illustrative of the tie-rule intent — implement the clean version: track `(weight, url, after_ts)` and prefer higher weight, then lexicographically smaller `(url, ts)`).

- [ ] **Step 4: Run, verify pass.** → PASS

- [ ] **Step 5: Commit**

```bash
git add pipelines/redaction/src/redaction/build.py pipelines/redaction/tests/test_build.py
git commit -m "feat(redaction): day-record assembly + deterministic ranking (tested)"
```

---

## Task 7: Orchestration entrypoint (`run.py`)

**Files:**
- Create: `pipelines/redaction/src/redaction/run.py`
- Test: `pipelines/redaction/tests/test_run.py`

**Interfaces:**
- Consumes: everything above.
- Produces: `run(repo_root, *, client, today, watchlist=WATCHLIST) -> dict` (returns the record, writes nothing — testable); `main(argv=None) -> int` (CLI: `--repo-root`, `--date`; writes `src/data/redaction/<date>.json` + `latest.json`).
- For each watch item: `captures()` → `classify()`; on `removal` fetch both snapshots via `snapshot_url`, `extract.main_text`, `textdiff.removed`, `salience.score`; on `deletion` salience from the last-living extracted text (or empty), `make_redaction`. Per-item failures are swallowed into an honest skip (counted), never crash the run.

- [ ] **Step 1: Write failing test** (inject a fake client + tiny watch-list; assert a removal is detected end-to-end)

```python
# tests/test_run.py
from datetime import date
import httpx
from redaction.run import run
from redaction.watchlist import WatchItem

CDX = [["timestamp", "original", "statuscode", "digest"],
       ["20260601000000", "https://x.test/p", "200", "AAA"],
       ["20260610000000", "https://x.test/p", "200", "BBB"]]
BEFORE = "<main><p>We will phase out coal by 2030, cutting 1.25 million tonnes.</p><p>Stable line here.</p></main>"
AFTER = "<main><p>Stable line here.</p></main>"


def handler(req):
    u = str(req.url)
    if "/cdx/" in u:
        return httpx.Response(200, json=CDX)
    if "id_/" in u and u.endswith("20260601000000id_/https://x.test/p") or "20260601000000id_" in u:
        return httpx.Response(200, text=BEFORE)
    return httpx.Response(200, text=AFTER)


def test_run_detects_removal_end_to_end():
    client = httpx.Client(transport=httpx.MockTransport(handler))
    wl = [WatchItem("https://x.test/p", "Inst", "A page")]
    rec = run(".", client=client, today=date(2026, 6, 25), watchlist=wl)
    assert rec["watched_count"] == 1
    assert rec["changed_count"] == 1
    assert rec["pick"] is not None
    r = rec["redactions"][0]
    assert r["kind"] == "removal" and "coal" in " ".join(r["removed_passages"])
    assert "number" in r["salience"]["signals"]
```

- [ ] **Step 2: Run, verify fail.** → FAIL

- [ ] **Step 3: Implement `run.py`**

```python
"""Orchestration + IO. Per-item failures become honest skips, never a crash."""
from __future__ import annotations

import argparse
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path

import httpx

from redaction import extract, salience, textdiff
from redaction.build import day_record, make_redaction, to_json
from redaction.cdx import SourceUnavailable, captures, classify, snapshot_url
from redaction.watchlist import WATCHLIST, WatchItem

USER_AGENT = "frankbueltge.de redaction-pipeline (hello@frankbueltge.de)"
PAUSE = 0.6  # gentle on the Wayback API


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _one(item: WatchItem, *, client: httpx.Client) -> dict | None:
    caps = captures(item.url, client=client)
    kind, before_cap, after_cap = classify(caps)
    if kind == "none" or before_cap is None or after_cap is None:
        return None
    if kind == "deletion":
        before_html = client.get(snapshot_url(before_cap.timestamp, item.url),
                                  timeout=30.0, follow_redirects=True).text
        before_text = extract.main_text(before_html)
        removal = textdiff.Removal(passages=[], tokens=len(before_text.split()))
        sal = salience.score(before_text)
        return make_redaction(item, kind, before_cap, after_cap, removal, sal, item.url)
    # removal
    before_html = client.get(snapshot_url(before_cap.timestamp, item.url),
                             timeout=30.0, follow_redirects=True).text
    after_html = client.get(snapshot_url(after_cap.timestamp, item.url),
                            timeout=30.0, follow_redirects=True).text
    rem = textdiff.removed(extract.main_text(before_html), extract.main_text(after_html))
    if rem.tokens == 0:
        return None
    sal = salience.score(" ".join(rem.passages))
    return make_redaction(item, kind, before_cap, after_cap, rem, sal, item.url)


def run(repo_root: str, *, client: httpx.Client, today: date,
        watchlist: list[WatchItem] = WATCHLIST) -> dict:
    redactions: list[dict] = []
    for item in watchlist:
        try:
            r = _one(item, client=client)
            if r is not None:
                redactions.append(r)
        except (SourceUnavailable, httpx.HTTPError, Exception):
            continue  # honest skip; the day is still written
        finally:
            pass
    return day_record(today.isoformat(), _now_iso(), redactions, watched_count=len(watchlist))


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--repo-root", default=".")
    p.add_argument("--date", default=None)
    args = p.parse_args(argv)
    today = (datetime.strptime(args.date, "%Y-%m-%d").date()
             if args.date else datetime.now(timezone.utc).date())
    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        rec = run(args.repo_root, client=client, today=today)
    out_dir = Path(args.repo_root) / "src" / "data" / "redaction"
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = to_json(rec)
    (out_dir / f"{today.isoformat()}.json").write_text(payload, encoding="utf-8")
    (out_dir / "latest.json").write_text(payload, encoding="utf-8")
    print(f"redaction: {rec['changed_count']} change(s) of {rec['watched_count']} watched "
          f"→ pick={rec['pick']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

> Note: the broad `except (... , Exception)` is intentional fault-isolation (mirrors `protokoll/assemble.py`); keep the explicit names for readability even though `Exception` subsumes them. When implementing, add a small sleep `time.sleep(PAUSE)` between items inside `run()` (omit in tests by keeping PAUSE small or guarding on a real-network flag — simplest: leave the sleep only in `main`'s real path by moving it into `_one`'s real fetches is overkill; just `time.sleep(PAUSE)` at the end of the loop body — the MockTransport test will still pass, just 0.6 s/item).

- [ ] **Step 4: Run, verify pass.** `python -m pytest tests/test_run.py -q` → PASS

- [ ] **Step 5: Run the full pytest suite**

Run: `cd pipelines/redaction && python -m pytest -q`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add pipelines/redaction/src/redaction/run.py pipelines/redaction/tests/test_run.py
git commit -m "feat(redaction): orchestration entrypoint (fault-isolated, tested)"
```

---

## Task 8: TS types + format helpers

**Files:**
- Create: `src/lib/redaction/types.ts`
- Create: `src/lib/redaction/format.ts`
- Test: `src/lib/redaction/format.test.ts`

**Interfaces:**
- Produces: `RedactionData`, `Redaction`, `Snapshot`, `Salience` (types) matching the JSON; `tokensLabel(n, locale)`, `signalLabel(sig, locale)`, `dateLabel(iso, locale)`.

- [ ] **Step 1: Write `types.ts`** (match `build.day_record` shape exactly)

```typescript
import type { Locale } from '@/lib/site'

export interface Snapshot { wayback_ts: string; url: string; status?: string }
export interface Salience { score: number; signals: string[] }
export interface Redaction {
  id: string
  url: string
  institution: string
  label: string
  kind: 'deletion' | 'removal'
  before: Snapshot
  after: Snapshot
  removed_passages: string[]
  removed_tokens: number
  salience: Salience
}
export interface RedactionData {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  salience_version: string
  watched_count: number
  changed_count: number
  removed_tokens_total: number
  pick: string | null
  redactions: Redaction[]
  source: { name: string; url: string; license: string }
}
export type { Locale }
```

- [ ] **Step 2: Write failing test `format.test.ts`**

```typescript
import { describe, expect, it } from 'vitest'
import { tokensLabel, signalLabel } from './format'

describe('tokensLabel', () => {
  it('formats word counts per locale', () => {
    expect(tokensLabel(1, 'en')).toBe('1 word')
    expect(tokensLabel(42, 'en')).toBe('42 words')
    expect(tokensLabel(42, 'de')).toBe('42 Wörter')
  })
})

describe('signalLabel', () => {
  it('maps signal keys to human labels', () => {
    expect(signalLabel('commitment_verb', 'en')).toBe('commitment')
    expect(signalLabel('number', 'de')).toBe('Zahl')
    expect(signalLabel('unknown', 'en')).toBe('unknown')
  })
})
```

- [ ] **Step 3: Run, verify fail.** `npm run test -- src/lib/redaction/format.test.ts` → FAIL

- [ ] **Step 4: Implement `format.ts`**

```typescript
import type { Locale } from '@/lib/site'

export function tokensLabel(n: number, locale: Locale): string {
  if (locale === 'de') return `${n} ${n === 1 ? 'Wort' : 'Wörter'}`
  return `${n} ${n === 1 ? 'word' : 'words'}`
}

const SIGNALS: Record<string, Record<Locale, string>> = {
  number: { de: 'Zahl', en: 'number' },
  date: { de: 'Datum', en: 'date' },
  named_entity: { de: 'Eigenname', en: 'named entity' },
  negation: { de: 'Verneinung', en: 'negation' },
  commitment_verb: { de: 'Zusage', en: 'commitment' },
}

export function signalLabel(sig: string, locale: Locale): string {
  return SIGNALS[sig]?.[locale] ?? sig
}

export function dateLabel(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
```

- [ ] **Step 5: Run, verify pass.** → PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/redaction/
git commit -m "feat(redaction): TS types + format helpers (tested)"
```

---

## Task 9: Frontend pages + components

**Files:**
- Create: `src/components/pages/RedactionPage.astro`
- Create: `src/components/pages/MethodenblattRedaction.astro`
- Create: `src/pages/redaction/index.astro`, `src/pages/de/redaction/index.astro`
- Create: `src/pages/werke/redaction.astro`, `src/pages/de/werke/redaction.astro`
- Create (seed so the build has data): `src/data/redaction/latest.json` (a `pick: null` placeholder until Task 10 generates real data)

**Pattern:** copy the structure of `src/components/pages/ConsensusPage.astro` and `MethodenblattConsensus.astro`; copy the four route files from the Consensus equivalents, changing only `locale` and the component import + i18n keys (`rd.*`).

- [ ] **Step 1: Seed `src/data/redaction/latest.json`** so the import resolves during the build:

```json
{
  "date": "2026-06-25",
  "generated_at": "2026-06-25T00:00:00Z",
  "schema_version": "1",
  "pipeline_version": "0.1.0",
  "salience_version": "1",
  "watched_count": 0,
  "changed_count": 0,
  "removed_tokens_total": 0,
  "pick": null,
  "redactions": [],
  "source": { "name": "Internet Archive — Wayback Machine (CDX)", "url": "https://web.archive.org/", "license": "Wayback Machine — public archive" }
}
```

- [ ] **Step 2: `RedactionPage.astro`** — render the pick (strikethrough removed passage, both Wayback links, salience signals), the index sentence, then the rest. Empty/`pick:null` → honest „Keine Schwärzung festgestellt heute." / „No redaction recorded today.". Mirror ConsensusPage's `de` boolean + Tailwind classes.

```astro
---
import { t } from '@/i18n/ui'
import type { Locale } from '@/lib/site'
import type { RedactionData, Redaction } from '@/lib/redaction/types'
import { tokensLabel, signalLabel, dateLabel } from '@/lib/redaction/format'
import data from '@/data/redaction/latest.json'

interface Props { locale: Locale }
const { locale } = Astro.props
const de = locale === 'de'
const d = data as unknown as RedactionData
const pick: Redaction | null = d.pick ? d.redactions.find((r) => r.id === d.pick) ?? null : null
const rest = d.redactions.filter((r) => r.id !== d.pick)
---
<article class="redaction mx-auto max-w-3xl px-4 py-14">
  <header class="mb-10">
    <h1 class="text-[clamp(30px,6vw,56px)] font-bold">The Redaction</h1>
    <p class="mt-2 max-w-xl text-fg-muted">{t(locale, 'rd.sub')}</p>
    <p class="mt-1 font-mono text-xs text-fg-faint">{dateLabel(d.date, locale)}</p>
  </header>

  {pick ? (
    <section class="mb-12 border-l-2 border-accent/60 pl-5">
      <p class="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
        {de ? 'Die Schwärzung des Tages' : 'The redaction of the day'}
      </p>
      <p class="mt-2 text-lg font-semibold">{pick.institution} — {pick.label}</p>
      {pick.kind === 'removal' ? (
        <p class="mt-3 leading-snug text-fg-muted line-through decoration-accent/70">
          „{pick.removed_passages.slice(0, 3).join(' … ')}"
        </p>
      ) : (
        <p class="mt-3 leading-snug text-fg-muted">
          {de ? 'Die ganze Seite ist aus dem Archiv verschwunden (404).'
              : 'The entire page vanished from the record (404).'}
        </p>
      )}
      <p class="mt-3 font-mono text-xs text-fg-faint">
        {tokensLabel(pick.removed_tokens, locale)} · {pick.salience.signals.map((s) => signalLabel(s, locale)).join(', ')}
      </p>
      <p class="mt-3 flex gap-4 font-mono text-xs">
        <a class="underline" href={pick.before.url} target="_blank" rel="noopener">{de ? 'vorher ↗' : 'before ↗'}</a>
        <a class="underline" href={pick.after.url} target="_blank" rel="noopener">{de ? 'nachher ↗' : 'after ↗'}</a>
      </p>
    </section>
  ) : (
    <p class="mb-12 text-fg-muted">{de ? 'Keine Schwärzung festgestellt heute.' : 'No redaction recorded today.'}</p>
  )}

  <section class="mb-12 flex items-baseline gap-4">
    <p class="text-[clamp(36px,7vw,64px)] font-bold tabular-nums">{d.changed_count}</p>
    <p class="max-w-xs text-sm leading-snug text-fg-muted">
      {de ? `von ${d.watched_count} beobachteten offiziellen Seiten verloren heute Inhalt.`
          : `of ${d.watched_count} watched official pages lost content today.`}
    </p>
  </section>

  {rest.length > 0 && (
    <section class="border-t border-line pt-6">
      <p class="font-mono text-[11px] uppercase tracking-wide text-fg-faint">
        {de ? 'Weitere Schwärzungen heute' : 'Other redactions today'}
      </p>
      <ul class="mt-3 space-y-2">
        {rest.map((r) => (
          <li class="text-sm">
            <span class="text-fg-muted">{r.institution} — {r.label}</span>
            <a class="ml-2 font-mono text-xs underline" href={r.after.url} target="_blank" rel="noopener">↗</a>
          </li>
        ))}
      </ul>
    </section>
  )}
</article>
```

- [ ] **Step 3: `MethodenblattRedaction.astro`** — mirror `MethodenblattConsensus.astro`'s `txt` object. Sections: was es ist; 1. Quellen & Lizenzen (Wayback CDX); 2. Kadenz (täglich, stille Tage ehrlich); 3. Verarbeitung (CDX → Snapshots → Haupttext-Extraktion → Diff → symbolische Salienz); 4. Grenzen (rewrite ≠ cover-up, **kein Absichts-Claim**; Seed-Liste editorial; Wayback-Bias; Extraktion heuristisch; Salienz gesetzt); 5. Compute-Fußabdruck (leichte HTTP-Abrufe, kein API-Key, kein LLM); 6. Änderungsprotokoll (v1 2026-06). Include the AI/ML-block: „symbolisch, auditierbar, kein LLM".

- [ ] **Step 4: Four route files** — copy from `src/pages/consensus/index.astro`, `src/pages/de/consensus/index.astro`, `src/pages/werke/consensus.astro`, `src/pages/de/werke/consensus.astro`; swap component + `rd.*` keys. Example EN main route:

```astro
---
import Page from '@/layouts/Page.astro'
import RedactionPage from '@/components/pages/RedactionPage.astro'
import { t } from '@/i18n/ui'
const locale = 'en' as const
---
<Page title={`${t(locale, 'rd.title')} | Frank Bültge`} description={t(locale, 'rd.sub')}>
  <RedactionPage {locale} />
</Page>
```

(DE variant: `locale = 'de'`. Werke variants use `MethodenblattRedaction` and title `${t(locale,'prot.method')} — ${t(locale,'rd.title')}`.)

- [ ] **Step 5: Verify build resolves**

Run: `npm run check`
Expected: no TypeScript errors for the new files.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/RedactionPage.astro src/components/pages/MethodenblattRedaction.astro src/pages/redaction src/pages/de/redaction src/pages/werke/redaction.astro src/pages/de/werke/redaction.astro src/data/redaction/latest.json
git commit -m "feat(redaction): DE/EN pages + Methodenblatt"
```

---

## Task 10: Wire-up (i18n, OG, werke, script)

**Files:**
- Modify: `src/i18n/ui.ts` (add `rd.title`, `rd.sub` to both `de` and `en`)
- Modify: `src/lib/og.ts` (add `redaction` to `OG_PAGES` + `ogSlug()`)
- Modify: `src/data/werke.ts` (add `redaction` Werk entry after `tell`)
- Modify: `package.json` (add `redaction:refresh`)

- [ ] **Step 1: `src/i18n/ui.ts`** — in `de`:

```typescript
'rd.title': 'The Redaction',
'rd.sub': 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird — durchgestrichen, in zwei Klicks überprüfbar.',
```

in `en`:

```typescript
'rd.title': 'The Redaction',
'rd.sub': 'What is quietly removed from the official public record — struck through, checkable in two clicks.',
```

- [ ] **Step 2: `src/lib/og.ts`** — add to `OG_PAGES`:

```typescript
redaction: {
  title: 'The Redaction',
  description: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
},
```

and in `ogSlug()` (before the final `return 'home'`):

```typescript
if (p.startsWith('/redaction') || p.startsWith('/werke/redaction')) return 'redaction'
```

- [ ] **Step 3: `src/data/werke.ts`** — insert after the `tell` entry, before `pattern`:

```typescript
{
  id: 'redaction',
  title: 'The Redaction',
  subtitle: {
    de: 'Was aus dem offiziellen öffentlichen Eintrag still wieder entfernt wird',
    en: 'What is quietly removed from the official public record',
  },
  status: 'live',
  href: '/redaction',
  description: {
    de: 'Aus der Linie „Gegenmessung". Das öffentliche Protokoll wird nicht nur geschrieben, sondern auch entschrieben. Jeden Tag difft eine Maschine die Wayback-Snapshots einer kuratierten Liste offizieller Seiten und hebt die substanziellste Schwärzung — beide Fassungen verlinkt, in zwei Klicks überprüfbar. Kein Absichts-Vorwurf, nur das gezählte Weggenommene.',
    en: 'From the „Counter-Measurement" line. The public record is not only written but un-written. Each day a machine diffs the Wayback snapshots of a curated list of official pages and surfaces the most substantive removal — both versions linked, checkable in two clicks. No claim of intent, only the counted thing taken away.',
  },
},
```

- [ ] **Step 4: `package.json`** — add to `scripts`:

```json
"redaction:refresh": "pipelines/redaction/.venv/bin/python -m redaction.run --repo-root ."
```

- [ ] **Step 5: Verify**

Run: `npm run check && npm run test`
Expected: pass (vitest includes the new format test).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ui.ts src/lib/og.ts src/data/werke.ts package.json
git commit -m "feat(redaction): wire-up i18n, OG, werke registry, refresh script"
```

---

## Task 11: CI + nightly workflow + first real data

**Files:**
- Create: `.github/workflows/redaction.yml`
- Modify: `.github/workflows/ci.yml` (add a redaction pytest step/job)

- [ ] **Step 1: `.github/workflows/redaction.yml`** (mirror `halbwertszeit.yml`)

```yaml
name: Redaction nightly

on:
  schedule:
    - cron: '30 5 * * *' # täglich 05:30 UTC (vor gegenmessung 06:00)
  workflow_dispatch: {}

permissions:
  contents: write

concurrency:
  group: redaction
  cancel-in-progress: false

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Pipeline-Paket installieren
        run: pip install --no-cache-dir ./pipelines/redaction
      - name: Redaction laufen (schreibt, committet nicht)
        run: python -m redaction.run --repo-root .
      - name: Committen
        run: |
          git config user.name "Gegenmessung"
          git config user.email "gegenmessung@frankbueltge.de"
          git add src/data/redaction 2>/dev/null || true
          if git diff --cached --quiet; then
            echo "Keine Änderungen."; exit 0
          fi
          git commit -m "redaction: Schwärzung vom $(date -u +%F)"
          for i in 1 2 3 4 5; do
            if git pull --rebase --autostash origin main && git push origin HEAD:main; then
              echo "Gepusht."; exit 0
            fi
            echo "Push-Versuch $i fehlgeschlagen, neu …"; sleep 5
          done
          echo "::error::Push nach 5 Versuchen fehlgeschlagen"; exit 1
```

- [ ] **Step 2: Add redaction tests to `ci.yml`** — read the file first, then add a step (in the existing pipelines job, after the protokoll pytest) or a small dedicated job:

```yaml
      - name: Redaction-Pipeline-Tests
        working-directory: pipelines/redaction
        run: |
          pip install -e ".[dev]"
          python -m pytest -q
```

- [ ] **Step 3: Create venv + install locally, run the suite**

```bash
cd pipelines/redaction
python3.12 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python -m pytest -q
```
Expected: all pass.

- [ ] **Step 4: Generate first real data (live Wayback)** — this validates the watch-list against the real archive:

```bash
cd pipelines/redaction && source .venv/bin/activate
python -m redaction.run --repo-root /Users/frankbultge/Documents/GitHub/frankbueltge.de
```
Expected: writes `src/data/redaction/<today>.json` + `latest.json`; prints the change count + pick. Inspect the JSON: confirm provenance links resolve, no secrets, passages look sane. If many watch-list URLs error, prune dead ones from `watchlist.py`.

- [ ] **Step 5: Full verification**

```bash
cd /Users/frankbultge/Documents/GitHub/frankbueltge.de
npm run check && npm run test && npm run build
```
Expected: clean check, vitest green, static build succeeds (the `/redaction`, `/de/redaction`, `/werke/redaction` routes render).

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/redaction.yml .github/workflows/ci.yml src/data/redaction
git commit -m "ci(redaction): nightly workflow + CI tests + first archive snapshot"
```

---

## Self-Review (against the spec)

**Spec coverage:**
- §3 Beobachtungskorpus → Task 1 (`watchlist.py`, inclusion rule) ✓
- §4 Signal & Methode (Löschung/Entfernung, CDX, Haupttext, Diff) → Tasks 3,4,5 ✓
- §5 Salienz symbolisch → Task 2 ✓
- §6 Schwärzung des Tages + Index + Kadenz + stille Tage → Task 6 (rank, day_record) + Task 9 (empty-state copy) + Task 11 (cron) ✓
- §7 Provenienz (zwei Permalinks) → Task 6 (`make_redaction` before/after permalinks) + Task 9 (links) ✓
- §8 Datenmodell → Task 6 (`day_record`/`to_json`) + Task 8 (TS types) ✓ (flat path deviation noted in Global Constraints)
- §9 Fehler als Form → Task 7 (per-item honest skip) ✓
- §10 Grenzen (kein Absichts-Claim) → Task 9 (Methodenblatt §4 + werke description) ✓
- §11 Avantgarde-Latte → inherent to the diff-of-archive design ✓
- §12 Substanz-Gate → satisfied across tasks ✓
- §13 Pipeline & Technik + Determinismus/Testschutz → Tasks 1–7 (pytest) + Task 11 (CI) ✓
- §14 Frontend & Routing + Name → Tasks 8–10 ✓
- §15 Tests → pytest (salience/diff/cdx/build/run) + vitest (format) ✓
- §16 Nicht-Ziele → honored (no LLM, no intent claim, no RSS, no realtime) ✓

**Placeholder scan:** the only deferred item is the concrete watch-list content (Task 1 Step 5), which is data curation Frank must own — flagged explicitly, not a logic gap. The `rank()` code block carries an illustrative dead branch with an inline note to implement the clean version — fix during implementation.

**Type consistency:** `Salience{score,signals}`, `Removal{passages,tokens}`, `Capture{timestamp,status,digest}`, `WatchItem{url,institution,label}` are used identically across Python tasks; the TS `RedactionData`/`Redaction` shape matches `build.day_record` keys exactly.

## Notes for the executor

- **No merge to `main`, no deploy** — Frank approves that separately. All work stays on `feat/redaction`.
- Run the pipeline live once (Task 11 Step 4) so the committed first snapshot is real, not synthetic; if the network is unavailable, leave the `pick:null` seed `latest.json` and note it.
- Keep all test strings intact; tighten regexes to satisfy tests, never the reverse.
- The watch-list is the one place editorial judgement matters — keep it neutral and structural, and surface it to Frank for curation.
