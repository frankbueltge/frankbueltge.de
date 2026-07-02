# Beifang-Leak-Audit — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den bestehenden Beifang-Zensus um einen **Identitäts-Leak-Nachweis** vertiefen: pro erreichbarer Artikelseite messen, was von deiner Leseidentität (DOI hart; Titel/Keywords weich) an welche Drittanbieter-Firma geht, in welcher Form (Klartext/URL-kodiert/md5·sha1·sha256), über welchen Kanal (Query/POST/Referer/Pfad) — vor jeder Einwilligung — und den echten Request als Beweis ins Archiv legen.

**Architecture:** Erweiterung des vorhandenen Instruments `pipelines/beifang/` (v1 bleibt vollständig). Neu: reiner, testbarer Matcher `leaks.py` und ein Einmal-Werkzeug `identity.py` (Crossref → Titel/Keywords ins Panel). `capture.py` protokolliert zusätzlich POST-Body + Referer; `model.py`/`assemble.py`/`run.py` reichen Leaks + einen `vantage`-Vermerk durch. Site-seitig: zod-Schema/Typen/Aggregation erweitert, neue Sektion „Was die Seite über dich verrät" auf `/beifang`, Methodenblatt ergänzt.

**Tech Stack:** Python 3.12 (stdlib `hashlib`/`urllib`, httpx, Playwright), pytest · Astro 5, zod v4, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-02-beifang-leak-audit-design.md`

## Global Constraints

- Python `>=3.12`, src-Layout; Tests ohne Netz (Fixtures), außer den ausgewiesenen Einmal-Werkzeugen (`identity.py`) und dem Smoke-Lauf.
- **v1 bleibt unangetastet:** Zensus, Blockade-Leitbefund, Kontrollgruppe, Befund-Logik, bestehende Tests — nichts davon aufweichen. Der Leak-Audit ist rein additiv.
- **Value-null-Disziplin:** blockiert/gescheitert ⇒ alle Kennzahlen null, nie 0. Neue Leak-Felder gehören ins `_NULLED`-Dict (Blockade/Fehler ⇒ `leaks=None`, `leak_firmen=None`, `doi_leak=None`).
- **Nur belegte Leaks:** ein Leak wird nur erzeugt, wenn der Token konkret im Request steht; jeder Leak trägt sein `beweis`-Feld. Nichts raten.
- **False-Positive-Disziplin:** hartes Signal = DOI (Klartext/kodiert/Hash); weiches Signal = Titel (ganzer Phrasenabgleich, ≥ 20 Zeichen) / Keyword (≥ 12 Zeichen). Nie einzelne Allerweltswörter; kein Hash auf Titel-Einzelwörter. `signal`-Feld hält hart/weich getrennt.
- **Pre-Consent** bleibt: keine Interaktion mit der Seite (kein Consent-Klick).
- **Vantage-agnostisch:** Messstandpunkt ist Config (`--vantage` LABEL + optional `--proxy` URL); v2-Default `github-actions`, kein Proxy. Kein Umgehen von Schranken.
- **Archiv unantastbar**, kein Backfill, Blockade bleibt Befund (alles wie v1). Commit-Botschaften **ohne** Co-Authored-By-Trailer.
- **Rückwärtskompatibel:** der bereits committete Snapshot `src/content/beifang/2026/2026-07-02.json` hat die neuen Felder NICHT — das zod-Schema muss sie als optional/nullable tolerieren, sonst bricht der Build.
- Pipeline-Tests laufen aus `pipelines/beifang/` mit `.venv/bin/pytest -q`; Site-Tests mit `npm run test`/`npm run check`/`npm run build` aus dem Repo-Root.

---

### Task 1: Capture erweitern — POST-Body + Referer

**Files:**
- Modify: `pipelines/beifang/src/beifang/capture.py`
- Test: `pipelines/beifang/tests/test_capture.py` (rein), `pipelines/beifang/tests/test_capture_browser.py` (Marker `browser`)

**Interfaces:**
- Produces: `RawRequest` erhält zwei Felder — `post_data: str | None`, `referer: str | None`. `RawCapture`/`detect_blocked`/`capture_page`-Signaturen unverändert; `capture_page` füllt die neuen Felder aus `resp.request.post_data` und `resp.request.headers`.

- [ ] **Step 1: Failing Test** (`tests/test_capture.py`) — anhängen; prüft nur die Dataclass-Form (kein Browser):

```python
def test_rawrequest_has_post_data_and_referer_fields():
    from beifang.capture import RawRequest
    r = RawRequest(url="https://x/y", host="x", resource_type="script", bytes=1,
                   post_data="a=b", referer="https://ref/")
    assert r.post_data == "a=b" and r.referer == "https://ref/"
```

- [ ] **Step 2: Fehlschlag verifizieren** — Run: `.venv/bin/pytest tests/test_capture.py -q` · Expected: FAIL (`TypeError: unexpected keyword argument 'post_data'`)

- [ ] **Step 3: `RawRequest` + Capture-Logik erweitern** — in `capture.py`:

`RawRequest` um zwei Felder ergänzen (nach `bytes`):
```python
@dataclass(frozen=True)
class RawRequest:
    url: str
    host: str
    resource_type: str
    bytes: int | None
    post_data: str | None
    referer: str | None
```

In `capture_page`, die Request-Schleife so ändern, dass POST-Body und Referer mitgelesen werden (beides best-effort, nie den Lauf kippen):
```python
        reqs: list[RawRequest] = []
        for resp in responses:
            try:
                size = len(resp.body())
            except Exception:
                size = None  # Redirects/abgebrochene Responses haben keinen Body
            req = resp.request
            req_url = req.url
            try:
                post = req.post_data  # None bei GET; Playwright kann werfen
            except Exception:
                post = None
            try:
                referer = req.headers.get("referer")
            except Exception:
                referer = None
            reqs.append(RawRequest(url=req_url, host=urlsplit(req_url).hostname or "",
                                   resource_type=req.resource_type, bytes=size,
                                   post_data=post, referer=referer))
```

- [ ] **Step 4: reine Tests grün** — Run: `.venv/bin/pytest tests/test_capture.py -q` · Expected: PASS. **Falls** bestehende Fixtures/Helper in `test_capture.py` `RawRequest(...)` ohne die neuen Felder bauen, dort `post_data=None, referer=None` ergänzen (die Felder haben keinen Default — bewusst, damit Capture sie immer setzt).

- [ ] **Step 5: Browser-Integrationstest erweitern** — in `tests/test_capture_browser.py` den bestehenden Test um eine Referer-Zusicherung ergänzen bzw. einen Test hinzufügen, der belegt, dass ein Sub-Request den Referer der Hauptseite trägt:

```python
@pytest.mark.browser
def test_capture_records_referer_on_subrequests(server):
    port = server.server_port
    cap = capture_page(f"http://127.0.0.1:{port}/", timeout_s=20.0, settle_s=1.0)
    sub = [r for r in cap.requests if r.url.endswith(("/t.js", "/pixel.gif"))]
    assert sub, "keine Sub-Requests erfasst"
    assert any(r.referer and "127.0.0.1" in r.referer for r in sub)
```

Run: `.venv/bin/pytest -q` · Expected: alle passed (inkl. Browser-Test; Chromium ist installiert). Ohne Chromium: `-m "not browser"`.

- [ ] **Step 6: Commit** — `git add -A pipelines/beifang && git commit -m "beifang: Capture erfasst POST-Body + Referer je Request (Leak-Audit-Grundlage)"`

---

### Task 2: Firmen-Auflösung je Host — `entity_for`

**Files:**
- Modify: `pipelines/beifang/src/beifang/classify.py`
- Test: `pipelines/beifang/tests/test_classify.py`

**Interfaces:**
- Consumes: `TdsData`, `_domain_chain`, `registrable_domain` (vorhanden).
- Produces: `entity_for(host: str, tds: TdsData) -> str | None` — die Firma, die einen Host betreibt (Domain-Kette gegen `tds.entity_map`), sonst `None`. Wird von `leaks.py` (Task 4) genutzt, um den Empfänger eines Leaks zu benennen.

- [ ] **Step 1: Failing Tests** (`tests/test_classify.py`) — anhängen:

```python
def test_entity_for_maps_host_via_chain():
    from beifang.classify import entity_for, parse_tds
    tds = parse_tds(TDS)  # Modul-Fixture aus dieser Datei
    assert entity_for("pixel.rlcdn.com", tds) == "LiveRamp"
    assert entity_for("adnxs.com", tds) == "Xandr"
    assert entity_for("cdn.unbekannt.example", tds) is None
```

- [ ] **Step 2: Fehlschlag verifizieren** — Run: `.venv/bin/pytest tests/test_classify.py -q` · Expected: FAIL (ImportError `entity_for`)

- [ ] **Step 3: `entity_for` implementieren** — in `classify.py` nach `classify(...)` anfügen:

```python
def entity_for(host: str, tds: TdsData) -> str | None:
    """Firma, die einen Host betreibt — über die Domain-Kette gegen die breite
    TDS-Entity-Map. None, wenn keine Firma zugeordnet ist (nicht raten)."""
    for c in _domain_chain(host.lower()):
        if c in tds.entity_map:
            return tds.entity_map[c]
    return None
```

- [ ] **Step 4: Tests grün** — Run: `.venv/bin/pytest tests/test_classify.py -q` · Expected: PASS
- [ ] **Step 5: Commit** — `git add -A pipelines/beifang && git commit -m "beifang: entity_for — Host → betreibende Firma (für Leak-Empfänger)"`

---

### Task 3: Datenmodell — Leak-Dataclass + neue Felder

**Files:**
- Modify: `pipelines/beifang/src/beifang/model.py`
- Test: `pipelines/beifang/tests/test_model.py`

**Interfaces:**
- Produces:
  - `Leak(token: str, signal: str, form: str, kanal: str, host: str, firma: str | None, beweis: str)` (frozen).
  - `SiteResult` erhält drei neue Felder am Ende: `leaks: tuple[Leak, ...] | None`, `leak_firmen: tuple[str, ...] | None`, `doi_leak: bool | None`.
  - `RunRecord` erhält `vantage: str` (nach `runner`).
  - `run_record_to_json` unverändert (serialisiert die neuen Felder automatisch via `asdict`).

- [ ] **Step 1: Failing Test** (`tests/test_model.py`) — anhängen. Vorhandene `make_result(**over)`/`make_record(...)`-Helper in dieser Datei um die neuen Pflichtfelder erweitern ist Teil der Umsetzung; der Test pinnt die Serialisierung:

```python
def test_leak_fields_roundtrip():
    from beifang.model import Leak
    leak = Leak(token="doi", signal="hard", form="klartext", kanal="query",
                host="pixel.liveramp.com", firma="LiveRamp",
                beweis="https://pixel.liveramp.com/?doi=10.1/x")
    r = make_result(leaks=(leak,), leak_firmen=("LiveRamp",), doi_leak=True)
    data = json.loads(run_record_to_json(make_record([r])))
    out = data["vantages"]["us"]["results"][0]
    assert out["doi_leak"] is True
    assert out["leaks"][0] == {"token": "doi", "signal": "hard", "form": "klartext",
                               "kanal": "query", "host": "pixel.liveramp.com",
                               "firma": "LiveRamp", "beweis": "https://pixel.liveramp.com/?doi=10.1/x"}
    assert data["vantage"] == "github-actions"
```

- [ ] **Step 2: Fehlschlag verifizieren** — Run: `.venv/bin/pytest tests/test_model.py -q` · Expected: FAIL

- [ ] **Step 3: Modell erweitern** — in `model.py`:

`Leak` vor `SiteResult` einfügen:
```python
@dataclass(frozen=True)
class Leak:
    token: str           # "doi" | "titel" | "keyword"
    signal: str          # "hard" | "soft"
    form: str            # "klartext" | "url-kodiert" | "md5" | "sha1" | "sha256"
    kanal: str           # "query" | "post" | "referer" | "pfad"
    host: str            # empfangender Drittanbieter-Host
    firma: str | None    # TDS-Entity oder None
    beweis: str          # redigierter, gekappter Request-Ausschnitt
```

`SiteResult` um drei Felder ergänzen (nach `retrieved_at`):
```python
    retrieved_at: str
    leaks: tuple[Leak, ...] | None
    leak_firmen: tuple[str, ...] | None
    doi_leak: bool | None
```

`RunRecord` um `vantage` ergänzen (nach `runner`):
```python
    runner: str
    vantage: str         # Messstandpunkt (Spec §5): "github-actions" | "vps" | ...
```

- [ ] **Step 4: `make_result`/`make_record` in test_model.py anpassen** — `make_result` erhält `leaks=None, leak_firmen=None, doi_leak=None` in seinen Defaults (damit bestehende Modell-Tests weiter bauen), `make_record` setzt `vantage="github-actions"`. Beide sind reine Test-Helper.

- [ ] **Step 5: Tests grün** — Run: `.venv/bin/pytest tests/test_model.py -q` · Expected: PASS (inkl. der bestehenden Modell-Tests)
- [ ] **Step 6: Commit** — `git add -A pipelines/beifang && git commit -m "beifang: Modell — Leak-Dataclass, SiteResult.leaks/leak_firmen/doi_leak, RunRecord.vantage"`

---

### Task 4: Der Matcher — `leaks.py` (Kernstück)

**Files:**
- Create: `pipelines/beifang/src/beifang/leaks.py`
- Test: `pipelines/beifang/tests/test_leaks.py`

**Interfaces:**
- Consumes: `RawRequest` (Task 1), `Leak` (Task 3), `TdsData`/`entity_for`/`registrable_domain` (Task 2 + vorhanden).
- Produces: `find_leaks(identity: dict | None, requests, first_party_domain: str, tds) -> tuple[Leak, ...]`.
  - `identity`-Form: `{"doi": str | None, "titel": str | None, "keywords": list[str]}` (oder `None` ⇒ keine Leaks).
  - Betrachtet nur Drittanbieter-Requests (`registrable_domain(host) != first_party_domain`).
  - Kanäle je Request: `query`, `pfad` (aus der URL), `post` (post_data), `referer`.
  - DOI = hartes Signal: Klartext, URL-kodiert, md5/sha1/sha256. Titel/Keyword = weiches Signal, nur Klartext, mit Längen-Guards. Ergebnis dedupliziert und deterministisch sortiert.

- [ ] **Step 1: Failing Tests** (`tests/test_leaks.py`):

```python
import hashlib

from beifang.capture import RawRequest
from beifang.classify import parse_tds
from beifang.leaks import find_leaks

TDS = {"trackers": {"adnxs.com": {"owner": {"displayName": "Xandr"}}},
       "entities": {"LiveRamp": {"displayName": "LiveRamp"}},
       "domains": {"liveramp.com": "LiveRamp", "rlcdn.com": "LiveRamp"}}
TDSD = parse_tds(TDS)

DOI = "10.1038/s41586-024-00001-2"
IDENT = {"doi": DOI, "titel": "Machine learning for protein folding at scale",
         "keywords": ["protein folding"]}


def req(url, *, host=None, post_data=None, referer=None):
    from urllib.parse import urlsplit
    return RawRequest(url=url, host=host or (urlsplit(url).hostname or ""),
                      resource_type="script", bytes=1, post_data=post_data, referer=referer)


def forms(leaks):
    return {(l.token, l.form, l.kanal, l.host, l.firma) for l in leaks}


def test_doi_cleartext_in_query_names_recipient():
    leaks = find_leaks(IDENT, [req(f"https://pixel.liveramp.com/i?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    assert ("doi", "klartext", "query", "pixel.liveramp.com", "LiveRamp") in forms(leaks)
    assert all(l.signal == "hard" for l in leaks if l.token == "doi")
    assert any(DOI in l.beweis for l in leaks)


def test_doi_url_encoded_detected_as_such():
    from urllib.parse import quote
    enc = quote(DOI, safe="")
    leaks = find_leaks(IDENT, [req(f"https://adnxs.com/x?u={enc}")], "sciencedirect.com", TDSD)
    assert ("doi", "url-kodiert", "query", "adnxs.com", "Xandr") in forms(leaks)


def test_doi_sha256_in_post_body():
    h = hashlib.sha256(DOI.encode()).hexdigest()
    leaks = find_leaks(IDENT, [req("https://adnxs.com/rtb", post_data=f"id={h}&x=1")],
                       "sciencedirect.com", TDSD)
    assert ("doi", "sha256", "post", "adnxs.com", "Xandr") in forms(leaks)


def test_doi_in_referer_channel():
    leaks = find_leaks(IDENT, [req("https://adnxs.com/x", referer=f"https://sciencedirect.com/a?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    # Referer trägt die DOI (der Leser-Kontext leakt über den Referer an den Dritten)
    assert ("doi", "klartext", "referer", "adnxs.com", "Xandr") in forms(leaks)


def test_first_party_request_is_not_a_leak():
    leaks = find_leaks(IDENT, [req(f"https://cdn.sciencedirect.com/a?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    assert leaks == ()


def test_title_soft_full_phrase_only():
    # ganzer Titel als Phrase (>=20 Zeichen) matcht; ein Allerweltswort allein nicht
    leaks = find_leaks(IDENT, [req("https://adnxs.com/x?t=Machine%20learning%20for%20protein%20folding%20at%20scale")],
                       "sciencedirect.com", TDSD)
    assert any(l.token == "titel" and l.signal == "soft" for l in leaks)
    only_common = find_leaks({"doi": None, "titel": None, "keywords": ["data"]},
                             [req("https://adnxs.com/x?q=data")], "sciencedirect.com", TDSD)
    assert only_common == ()  # "data" ist zu kurz (<12) → kein weiches Signal


def test_no_identity_no_leaks():
    assert find_leaks(None, [req("https://adnxs.com/x")], "sciencedirect.com", TDSD) == ()


def test_leaks_are_deduped_and_sorted():
    leaks = find_leaks(IDENT, [req(f"https://pixel.liveramp.com/i?doi={DOI}"),
                               req(f"https://pixel.liveramp.com/i?doi={DOI}")],
                       "sciencedirect.com", TDSD)
    keys = [(l.host, l.token, l.form, l.kanal) for l in leaks]
    assert keys == sorted(keys) and len(keys) == len(set(keys))
```

- [ ] **Step 2: Fehlschlag verifizieren** — Run: `.venv/bin/pytest tests/test_leaks.py -q` · Expected: FAIL (Modul fehlt)

- [ ] **Step 3: `leaks.py` implementieren**

```python
"""Reiner Leak-Matcher: welcher Identitäts-Token verlässt die Seite an welchen Dritten,
in welcher Form (Klartext/URL-kodiert/Hash), über welchen Kanal (Query/Pfad/POST/Referer).

Deterministisch, netzfrei, auditierbar. Hartes Signal = DOI; weiches Signal = Titel/Keyword
(mit Längen-Guards gegen False Positives). Nur belegte Treffer — jeder Leak trägt seinen Beweis.
"""
from __future__ import annotations

import hashlib
from typing import Iterable, Sequence
from urllib.parse import unquote, urlsplit

from beifang.capture import RawRequest
from beifang.classify import TdsData, entity_for, registrable_domain
from beifang.model import Leak

_BEWEIS_MAX = 300
_TITEL_MIN = 20   # ganzer Titel als Phrase
_KEYWORD_MIN = 12  # Schlagwort spezifisch genug, kein Allerweltswort


def _doi_hashes(doi: str) -> dict[str, str]:
    """hexdigests der DOI in den plausiblen Eingabeformen (bar/lowercased/doi.org-URL)."""
    forms = {doi, doi.lower(), f"https://doi.org/{doi}".lower()}
    out: dict[str, str] = {}
    for algo in ("md5", "sha1", "sha256"):
        for f in forms:
            out[getattr(hashlib, algo)(f.encode()).hexdigest()] = algo
    return out


def _channels(r: RawRequest) -> list[tuple[str, str]]:
    parts = urlsplit(r.url)
    ch: list[tuple[str, str]] = [("query", parts.query), ("pfad", parts.path)]
    if r.post_data:
        ch.append(("post", r.post_data))
    if r.referer:
        ch.append(("referer", r.referer))
    return [(k, v) for k, v in ch if v]


def _beweis(text: str) -> str:
    t = " ".join(text.split())
    return t[:_BEWEIS_MAX]


def find_leaks(identity: dict | None, requests: Iterable[RawRequest],
               first_party_domain: str, tds: TdsData) -> tuple[Leak, ...]:
    if not identity:
        return ()
    doi = identity.get("doi")
    titel = identity.get("titel")
    keywords = identity.get("keywords") or []
    doi_hashes = _doi_hashes(doi) if doi else {}

    found: dict[tuple, Leak] = {}
    for r in requests:
        if not r.host or registrable_domain(r.host) == first_party_domain:
            continue
        firma = entity_for(r.host, tds)
        for kanal, raw in _channels(r):
            low = raw.lower()
            dec = unquote(raw)
            dec_low = dec.lower()

            def add(token: str, signal: str, form: str) -> None:
                key = (r.host, token, form, kanal)
                found.setdefault(key, Leak(token=token, signal=signal, form=form, kanal=kanal,
                                           host=r.host, firma=firma, beweis=_beweis(raw)))

            if doi:
                dl = doi.lower()
                if dl in low:
                    add("doi", "hard", "klartext")
                elif dl in dec_low:
                    add("doi", "hard", "url-kodiert")
                for hexd, algo in doi_hashes.items():
                    if hexd in low:
                        add("doi", "hard", algo)
            if titel and len(titel) >= _TITEL_MIN and titel.lower() in dec_low:
                add("titel", "soft", "klartext")
            for kw in keywords:
                if len(kw) >= _KEYWORD_MIN and kw.lower() in dec_low:
                    add("keyword", "soft", "klartext")

    return tuple(found[k] for k in sorted(found))
```

- [ ] **Step 4: Tests grün** — Run: `.venv/bin/pytest tests/test_leaks.py -q` · Expected: alle passed
- [ ] **Step 5: Commit** — `git add -A pipelines/beifang && git commit -m "beifang: leaks.py — Identitäts-Leak-Matcher (DOI hart inkl. Hashes, Titel/Keyword weich, belegt)"`

---

### Task 5: Identität ins Panel — `identity.py` (Einmal-Werkzeug)

**Files:**
- Create: `pipelines/beifang/src/beifang/identity.py`
- Modify: `pipelines/beifang/src/beifang/data/panel.json` (durch Skriptlauf, committet)
- Test: `pipelines/beifang/tests/test_identity.py`

**Interfaces:**
- Consumes: `load_panel`/`PANEL_PATH` aus `beifang.panel`.
- Produces: `build_identity(doi: str | None, work: dict | None) -> dict` (reine Formung eines Crossref-`message`-Objekts in `{"doi", "titel", "keywords"}`); CLI `python -m beifang.identity` reichert jeden Panel-Eintrag um `"identity"` an und schreibt `panel.json` neu (Panel-`version`/`log` erhalten; `log`-Eintrag „identity via Crossref <Datum>").

- [ ] **Step 1: Failing Test** (`tests/test_identity.py`) — testet die reine Formung, kein Netz:

```python
from beifang.identity import build_identity


def test_build_identity_from_crossref_message():
    work = {"title": ["Machine learning for protein folding"],
            "subject": ["Computer Science", "Biophysics"]}
    ident = build_identity("10.1/x", work)
    assert ident == {"doi": "10.1/x", "titel": "Machine learning for protein folding",
                     "keywords": ["Computer Science", "Biophysics"]}


def test_build_identity_tolerates_missing_fields():
    assert build_identity(None, None) == {"doi": None, "titel": None, "keywords": []}
    assert build_identity("10.2/y", {"title": [], "subject": []}) == {
        "doi": "10.2/y", "titel": None, "keywords": []}
```

- [ ] **Step 2: Fehlschlag verifizieren** — Run: `.venv/bin/pytest tests/test_identity.py -q` · Expected: FAIL

- [ ] **Step 3: `identity.py` implementieren**

```python
"""Einmal-Werkzeug: reichert das Panel um die Leseidentität je Eintrag an (Crossref → Titel/
Schlagwörter). Änderungen am Panel sind bewusste, committete Edits (wie panel.py/lists_fetch.py).
Aufruf: pipelines/beifang/.venv/bin/python -m beifang.identity
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from beifang.panel import PANEL_PATH, load_panel

API = "https://api.crossref.org"
USER_AGENT = "frankbueltge.de beifang-pipeline (hello@frankbueltge.de)"


def build_identity(doi: str | None, work: dict | None) -> dict:
    work = work or {}
    titles = work.get("title") or []
    titel = titles[0] if titles else None
    keywords = [s for s in (work.get("subject") or []) if s]
    return {"doi": doi, "titel": titel, "keywords": keywords}


def _fetch_work(client: httpx.Client, doi: str) -> dict | None:
    r = client.get(f"{API}/works/{doi}")
    if r.status_code != 200:
        return None
    return r.json().get("message")


def main() -> int:
    panel = load_panel()
    today = datetime.now(timezone.utc).date().isoformat()
    with httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=45.0,
                      follow_redirects=True) as client:
        for e in panel["entries"]:
            doi = e.get("doi")
            work = _fetch_work(client, doi) if doi else None
            e["identity"] = build_identity(doi, work)
            print(f"{e['id']:28s} {'ok' if e['identity']['titel'] else '— (kein Titel)'}")
    panel.setdefault("log", []).append(f"identity via Crossref {today}")
    PANEL_PATH.write_text(json.dumps(panel, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                          encoding="utf-8")
    print(f"\ngeschrieben: {PANEL_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Tests grün** — Run: `.venv/bin/pytest tests/test_identity.py -q` · Expected: PASS
- [ ] **Step 5: Panel real anreichern** (braucht Netz) — Run: `.venv/bin/python -m beifang.identity`. Prüfen: die 50 Verlags-Einträge und die DOI-tragenden Kontroll-Einträge haben `identity.titel` gesetzt; Einträge ohne DOI (z. B. kommges) haben `identity: {"doi": null, "titel": null, "keywords": []}` — das ist ehrlich, kein Fehler. `panel.json` `version` unverändert, ein neuer `log`-Eintrag steht drin.
- [ ] **Step 6: Panel-Shape-Test bleibt grün** — Run: `.venv/bin/pytest -q` · Expected: alle passed (der bestehende `test_panel_shape_and_counts` prüft die Kernfelder; `identity` ist additiv).
- [ ] **Step 7: Commit** — `git add -A pipelines/beifang && git commit -m "beifang: identity.py — Leseidentität (Titel/Keywords via Crossref) ins Panel"`

---

### Task 6: Verdrahtung — `assemble.py` + `run.py` (Leaks + Vantage)

**Files:**
- Modify: `pipelines/beifang/src/beifang/assemble.py`, `pipelines/beifang/src/beifang/run.py`
- Test: `pipelines/beifang/tests/test_assemble.py`, `pipelines/beifang/tests/test_run.py`

**Interfaces:**
- Consumes: `find_leaks` (Task 4), `Leak` (Task 3), `TdsData` (vorhanden).
- Produces:
  - `site_result(...)` erhält zwei neue Keyword-Args: `identity: dict | None = None`, `tds: "TdsData | None" = None`; berechnet auf dem OK-Pfad `leaks`, `leak_firmen` (sortierte distinkte `firma`, `None` weggelassen), `doi_leak` (`any(l.token=="doi")`). Blockade/Fehler-Pfade nullen die drei Felder (via `_NULLED`).
  - `assemble_run(...)` erhält `vantage: str`; setzt `RunRecord.vantage`.
  - `run.py`: neue Flags `--vantage` (Default `github-actions`) und `--proxy` (Default None); lädt `entry.get("identity")`, reicht `identity`+`tds` an `site_result`, `proxy` an `capture_page`, `vantage` an `assemble_run`.

- [ ] **Step 1: Failing Tests** (`tests/test_assemble.py`) — anhängen. Der bestehende `sr(**over)`-Helper baut `site_result(...)`; er muss die neuen Kwargs durchreichen können (kein Bruch, da Keyword-only mit Default):

```python
def test_site_result_computes_leaks_on_ok_path():
    from beifang.capture import RawRequest
    from beifang.classify import parse_tds
    from beifang.assemble import site_result
    tds = parse_tds({"trackers": {}, "entities": {"LiveRamp": {"displayName": "LiveRamp"}},
                     "domains": {"liveramp.com": "LiveRamp"}})
    doi = "10.1/x"
    raw = RawCapture(final_url="https://www.sciencedirect.com/a", http_status=200,
                     page_title="A", goto_error=None,
                     requests=(RawRequest(url=f"https://pixel.liveramp.com/i?doi={doi}",
                                          host="pixel.liveramp.com", resource_type="image",
                                          bytes=1, post_data=None, referer=None),),
                     cookies=())
    r = site_result(ENTRY, retrieved_at="t", raw=raw,
                    cls=Classification(frozenset({"pixel.liveramp.com"}), frozenset(), frozenset({"LiveRamp"})),
                    identity={"doi": doi, "titel": None, "keywords": []}, tds=tds)
    assert r.doi_leak is True
    assert r.leak_firmen == ("LiveRamp",)
    assert r.leaks[0].token == "doi" and r.leaks[0].firma == "LiveRamp"


def test_blocked_result_nulls_leak_fields():
    r = sr(raw=raw([("www.sciencedirect.com", 10)]),
           blocked=Blocked(type="http", marker="403"))
    assert r.leaks is None and r.leak_firmen is None and r.doi_leak is None


def test_assemble_run_sets_vantage():
    rec = assemble_run(date_iso="2026-07-13", panel_version="v", runner="test",
                       vantage="vps", results=[sr(note="x")],
                       lists={"easyprivacy": ListMeta("u", "t", "h")}, previous=None)
    assert rec.vantage == "vps"
```

(In `test_run.py` die vorhandenen `fake_capture`-`RawCapture`-Konstruktionen bleiben gültig, aber falls sie `RawRequest` bauen: `post_data=None, referer=None` ergänzen. Neuer Test:)

```python
def test_run_threads_identity_and_vantage(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "capture_page", fake_capture)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {"version": "v", "entries": [
        {"id": "springer-nature-01", "group": "verlag", "publisher": "springer-nature",
         "url": "https://doi.org/10.1/x", "expected_domain": "nature.com",
         "identity": {"doi": "10.1/x", "titel": None, "keywords": []}}]})
    code = run_mod.main(["--date", "2026-07-13", "--repo-root", str(tmp_path), "--vantage", "vps"])
    assert code == 0
    import json as _j
    data = _j.loads((tmp_path / "src/content/beifang/2026/2026-07-13.json").read_text())
    assert data["vantage"] == "vps"
```

- [ ] **Step 2: Fehlschlag verifizieren** — Run: `.venv/bin/pytest tests/test_assemble.py tests/test_run.py -q` · Expected: FAIL

- [ ] **Step 3: `assemble.py` anpassen**

`_NULLED` um die drei Leak-Felder erweitern:
```python
_NULLED = dict(requests_total=None, third_party_hosts=None, third_party_requests=None,
               third_party_bytes=None, tracker_hosts=None, entities=None,
               cookies_first_party=None, cookies_third_party=None,
               leaks=None, leak_firmen=None, doi_leak=None)
```

Import ergänzen: `from beifang.leaks import find_leaks`.

`site_result`-Signatur + OK-Pfad:
```python
def site_result(entry: dict, *, retrieved_at: str, raw: RawCapture | None = None,
                cls: Classification | None = None, blocked: Blocked | None = None,
                note: str | None = None, identity: dict | None = None,
                tds=None) -> SiteResult:
```
Am Ende des OK-Pfads (der `return SiteResult(...)` mit den Kennzahlen) die drei Felder ergänzen — davor berechnen:
```python
    leaks = find_leaks(identity, raw.requests, final_domain, tds) if tds is not None else ()
    firmen = tuple(sorted({l.firma for l in leaks if l.firma}))
    doi_leak = any(l.token == "doi" for l in leaks)
```
und im `return SiteResult(... **common)` ergänzen: `leaks=leaks, leak_firmen=firmen, doi_leak=doi_leak`.

`assemble_run` um `vantage` erweitern:
```python
def assemble_run(*, date_iso: str, panel_version: str, runner: str, vantage: str,
                 results: Sequence[SiteResult], lists: dict[str, ListMeta],
                 previous: dict | None) -> RunRecord:
    ...
    return RunRecord(..., runner=runner, vantage=vantage, lists=dict(lists),
                     vantages=vantages, befund=compute_befund(results, previous))
```

- [ ] **Step 4: `run.py` anpassen** — Flags + Verdrahtung:

Argparse ergänzen:
```python
    p.add_argument("--vantage", default="github-actions",
                   help="Messstandpunkt-Label (Spec §5): github-actions | vps | …")
    p.add_argument("--proxy", default=None, help="optional: Proxy-URL für den Vantage")
```
Capture-Aufruf mit Proxy:
```python
            raw = capture_page(entry["url"], proxy=args.proxy)
```
`site_result`-Aufrufe auf dem OK-Pfad um `identity`+`tds` ergänzen:
```python
        cls = classify(first_party, (r.host for r in raw.requests), easyprivacy, tds)
        results.append(site_result(entry, retrieved_at=retrieved_at, raw=raw, cls=cls,
                                   note=goto_note, identity=entry.get("identity"), tds=tds))
```
`assemble_run`-Aufruf um `vantage=args.vantage` ergänzen.

- [ ] **Step 5: Tests grün** — Run: `.venv/bin/pytest -q` · Expected: alle passed (bestehende + neue)
- [ ] **Step 6: Smoke-Lauf (echtes Netz + Browser, 15 Seiten)** — Run: `npm run beifang:refresh -- --limit 15`. Erwartung: Springer-Nature-Seiten liefern jetzt ggf. `leaks` (DOI im Query-String/Referer an Google/Media Trust), Blockierte weiterhin blockiert. Ein, zwei Leak-Zeilen aus dem geschriebenen JSON prüfen (`doi_leak`, `leak_firmen`, ein `beweis`). Danach **löschen, nicht committen**: `rm -rf src/content/beifang` — das Archiv bleibt beim echten Wochenlauf. (Das committete `2026-07-02.json` NICHT anfassen — es liegt schon in `main`; der lokale Smoke schreibt `<heute>.json`, nur dieses entfernen.)
- [ ] **Step 7: Commit** — `git add -A pipelines/beifang && git commit -m "beifang: Leaks + Vantage verdrahtet (site_result/assemble_run/run.py, --vantage/--proxy)"`

---

### Task 7: Site — Schema, Typen, Aggregation

**Files:**
- Modify: `src/content.config.ts`, `src/lib/beifang/types.ts`, `src/lib/beifang/stats.ts`
- Test: `src/lib/beifang/stats.test.ts`

**Interfaces:**
- Produces:
  - zod: `beifang`-Collection akzeptiert je Result optionale `leaks`, `leak_firmen`, `doi_leak` und je Run optionales `vantage` (rückwärtskompatibel zum alten Snapshot ohne diese Felder).
  - `types.ts`: `BeifangLeak`-Interface; `BeifangSiteResult` um `leaks?`, `leak_firmen?`, `doi_leak?`; `BeifangRun` um `vantage?`.
  - `stats.ts`: `leakFindings(run): { publisher: string; hard: BeifangLeak[]; firmen: string[] }[]` (nur Verlage mit mind. einem harten DOI-Leak, Firmen distinct, sortiert) und `doiLeakEntities(run): string[]` (distinkte Firmen, die harte DOI empfangen, über alle Verlagsseiten).

- [ ] **Step 1: zod-Schema erweitern** — in `src/content.config.ts`, im `beifang`-`results`-Objekt (nach `retrieved_at`) ergänzen:
```ts
        retrieved_at: z.string(),
        leaks: z.array(z.object({
          token: z.string(), signal: z.string(), form: z.string(), kanal: z.string(),
          host: z.string(), firma: z.string().nullable(), beweis: z.string(),
        })).nullable().optional(),
        leak_firmen: z.array(z.string()).nullable().optional(),
        doi_leak: z.boolean().nullable().optional(),
```
und im Run-Objekt (nach `runner: z.string(),`): `vantage: z.string().optional(),`

- [ ] **Step 2: `types.ts` erweitern**
```ts
export interface BeifangLeak {
  token: string
  signal: string
  form: string
  kanal: string
  host: string
  firma: string | null
  beweis: string
}
```
`BeifangSiteResult` (nach `retrieved_at`): `leaks?: BeifangLeak[] | null; leak_firmen?: string[] | null; doi_leak?: boolean | null`.
`BeifangRun` (nach `runner`): `vantage?: string`.

- [ ] **Step 3: Failing Tests** (`src/lib/beifang/stats.test.ts`) — anhängen (nutzt die vorhandenen `result()`/`run()`-Helper; `result()` hat die neuen Felder per `?`/Default nicht — im Helper `leaks: null` etc. sind nicht nötig, da optional):

```ts
import { leakFindings, doiLeakEntities } from './stats'
import type { BeifangLeak } from './types'

function hardDoi(host: string, firma: string): BeifangLeak {
  return { token: 'doi', signal: 'hard', form: 'klartext', kanal: 'query', host, firma, beweis: `https://${host}/?doi=x` }
}

describe('leakFindings/doiLeakEntities', () => {
  it('führt nur Verlage mit hartem DOI-Leak, Firmen distinct', () => {
    const r = run([
      result({ publisher: 'springer-nature', doi_leak: true,
               leaks: [hardDoi('pixel.liveramp.com', 'LiveRamp'), hardDoi('adnxs.com', 'Xandr')],
               leak_firmen: ['LiveRamp', 'Xandr'] }),
      result({ panel_id: 'sn-02', publisher: 'springer-nature', doi_leak: false, leaks: [], leak_firmen: [] }),
      result({ panel_id: 'e-01', publisher: 'elsevier', blocked: { type: 'http', marker: '403' } }),
    ])
    const f = leakFindings(r)
    expect(f.map((x) => x.publisher)).toEqual(['springer-nature'])
    expect(f[0].firmen).toEqual(['LiveRamp', 'Xandr'])
    expect(f[0].hard.length).toBe(2)
    expect(doiLeakEntities(r)).toEqual(['LiveRamp', 'Xandr'])
  })
  it('leerer Befund, wenn nichts leakt', () => {
    const r = run([result({ doi_leak: false, leaks: [], leak_firmen: [] })])
    expect(leakFindings(r)).toEqual([])
    expect(doiLeakEntities(r)).toEqual([])
  })
})
```

- [ ] **Step 4: Fehlschlag verifizieren** — Run: `npm run test` · Expected: FAIL (Funktionen fehlen)

- [ ] **Step 5: `stats.ts` implementieren** — anfügen:

```ts
import type { BeifangLeak } from './types'

export function leakFindings(run: BeifangRun): { publisher: string; hard: BeifangLeak[]; firmen: string[] }[] {
  const byPub = new Map<string, { hard: BeifangLeak[]; firmen: Set<string> }>()
  for (const r of usResults(run)) {
    if (r.group !== 'verlag' || !r.leaks) continue
    const hard = r.leaks.filter((l) => l.signal === 'hard' && l.token === 'doi')
    if (hard.length === 0) continue
    const row = byPub.get(r.publisher) ?? { hard: [], firmen: new Set<string>() }
    row.hard.push(...hard)
    for (const l of hard) if (l.firma) row.firmen.add(l.firma)
    byPub.set(r.publisher, row)
  }
  return [...byPub.entries()]
    .map(([publisher, v]) => ({ publisher, hard: v.hard, firmen: [...v.firmen].sort() }))
    .sort((a, b) => b.hard.length - a.hard.length || a.publisher.localeCompare(b.publisher))
}

export function doiLeakEntities(run: BeifangRun): string[] {
  const firmen = new Set<string>()
  for (const f of leakFindings(run)) for (const name of f.firmen) firmen.add(name)
  return [...firmen].sort()
}
```

- [ ] **Step 6: Tests + Check grün** — Run: `npm run test && npm run check` · Expected: alle Tests passed, 0 check-errors (das alte `2026-07-02.json` ohne Leak-Felder muss weiter validieren — deshalb die `.optional()`).
- [ ] **Step 7: Commit** — `git add src/content.config.ts src/lib/beifang && git commit -m "beifang(site): Schema/Typen/Aggregation für Leaks + Vantage (rückwärtskompatibel)"`

---

### Task 8: Site — Leak-Sektion + Methodenblatt + Abschluss

**Files:**
- Modify: `src/components/pages/BeifangPage.astro`, `src/components/pages/MethodenblattBeifang.astro`
- Test: Build/Check/vitest (Rendering)

**Interfaces:**
- Consumes: `leakFindings`, `doiLeakEntities` (Task 7), `PUBLISHER_LABELS`, `renderBefund`.

- [ ] **Step 1: Leak-Sektion in `BeifangPage.astro`** — im Frontmatter neben den anderen Aggregaten ergänzen:
```ts
import { blockadeStats, entityTable, groupMedians, leakFindings, publisherMedians, sparkPath, timeline, usResults } from '@/lib/beifang/stats'
const leaks = latest ? leakFindings(latest) : []
```
Neue Sektion einfügen (nach dem Befund-der-Woche-Block, vor der Firmen-Tafel), mit dem Beweis als aufklappbarem `<details>`:
```astro
      {/* Was die Seite über dich verrät — der Identitäts-Leak (hartes Signal: DOI) */}
      <section class="mb-12">
        <h2 class="mb-3 font-semibold">{de ? 'Was die Seite über dich verrät' : 'What the page reveals about you'}</h2>
        {leaks.length === 0 ? (
          <p class="text-fg-muted">
            {de
              ? 'Auf den erreichbaren Seiten kein nachweisbarer DOI-Leak an Dritte — auch das ist ein Befund (und gilt nur für das Messbare; das Gros der Verlagsseiten verweigert die Messung).'
              : 'No demonstrable DOI leak to third parties on the reachable pages — itself a finding (and only for what is measurable; most publisher pages refuse measurement).'}
          </p>
        ) : (
          <div class="space-y-5">
            {leaks.map((f) => (
              <div>
                <p class="leading-relaxed">
                  <span class="font-semibold">{PUBLISHER_LABELS[f.publisher] ?? f.publisher}</span>{' '}
                  {de
                    ? `reicht deine DOI an ${f.firmen.join(', ')} weiter — vor jeder Einwilligung.`
                    : `hands your DOI to ${f.firmen.join(', ')} — before any consent.`}
                </p>
                <ul class="mt-2 space-y-2 text-sm">
                  {f.hard.map((l) => (
                    <li class="border-l-2 border-accent/60 pl-4">
                      <span class="font-mono text-xs text-fg-muted">
                        {l.firma ?? l.host} · {l.form} · {l.kanal}
                      </span>
                      <details class="mt-1">
                        <summary class="cursor-pointer text-fg-faint">{de ? 'Beweis' : 'Evidence'}</summary>
                        <code class="mt-1 block overflow-x-auto whitespace-pre-wrap break-all bg-line/30 p-2 text-[11px]">{l.beweis}</code>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <p class="mt-4 font-mono text-[11px] text-fg-faint">
          {de
            ? 'Hartes Signal: die DOI (eindeutig, auch als Hash fälschungssicher). Titel/Schlagwörter wären ein schwächeres Indiz und stehen im Archiv separat.'
            : 'Hard signal: the DOI (unambiguous, tamper-proof even when hashed). Title/keywords would be a weaker indicator, kept separately in the archive.'}
        </p>
      </section>
```

- [ ] **Step 2: `MethodenblattBeifang.astro` ergänzen** — im bilingualen `txt`-Objekt zwei Punkte in §4 (Verarbeitung) und §5 (Grenzen) aufnehmen (nur Text, Muster der vorhandenen Sektionen):
  - §4: „**Leak-Nachweis (pre-consent):** Für jede erreichbare Seite wird geprüft, ob die DOI (Kennung des Artikels) den ausgehenden Drittanbieter-Requests beiliegt — im Klartext, URL-kodiert oder als md5/sha1/sha256. Ein Hash-Treffer der DOI ist fälschungssicher. Titel/Schlagwörter gelten als schwächeres Signal (ganzer Phrasenabgleich, keine Einzelwörter). Da alles vor jeder Einwilligung gemessen wird, ist ein solcher Leak zugleich ein Pre-Consent-Verstoß."
  - §5: „**Vantage als Messgröße:** Gemessen wird aus einem Rechenzentrums-Standpunkt (v2: GitHub Actions); der Standpunkt steht im Snapshot (`vantage`). Die Blockade ist IP-basiert und kategorisch — ein residentiellerer Standpunkt (geplanter VPS) ist der nächste Hebel, kein Schranken-Umgehen."
  - §7 Änderungsprotokoll: Zeile „2026-07-02: Leak-Audit ergänzt (Identitäts-Exfiltration statt reinem Tracker-Zensus)."

- [ ] **Step 3: Alles prüfen** — Run: `npm run check && npm run test && npm run build` · Expected: 0 errors, alle Tests grün, Build enthält `/beifang` + `/de/beifang` + `/werke/beifang` (+ EN-Spiegel). Da das committete `2026-07-02.json` keine Leak-Felder hat, rendert die Sektion dort den ehrlichen Leerzustand — genau richtig (dieser Lauf hatte noch keinen Leak-Audit).
- [ ] **Step 4: Pipeline-Suite final** — Run: `cd pipelines/beifang && .venv/bin/pytest -q` · Expected: alle passed.
- [ ] **Step 5: Commit** — `git add src/components/pages/BeifangPage.astro src/components/pages/MethodenblattBeifang.astro && git commit -m "beifang(site): Leak-Sektion „Was die Seite über dich verrät" + Methodenblatt (Leak-Nachweis, Vantage)"`

- [ ] **Step 6: GO-LIVE-GATE — STOPP.** Nicht nach `main` pushen ohne Franks ausdrückliches Go. Der nächste echte Wochenlauf (Mo 02:17 UTC) schreibt den ersten Snapshot MIT Leak-Feldern; alternativ nach dem Merge ein `workflow_dispatch` für einen Sofort-Lauf. Frank in einfacher Sprache berichten, was live geht, und die Go-Entscheidung einholen.

---

## Offene Ausbaustufen (nicht Teil dieses Plans)

„Alle ablehnen"-Interaktion (Reject-Persistenz), VPS-Vantage-Aufbau selbst (hier nur vorbereitet), Cross-Verlag-ID-Persistenz (seitenübergreifendes Leseprofil), exotische Kodierungen, institutioneller Zugriff (SeamlessAccess). Siehe Spec §9.
